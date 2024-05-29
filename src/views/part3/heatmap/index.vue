<template>
    <div id="container"></div>
</template>

<script setup lang='ts'>
import * as THREE from 'three';
import heatMap from 'anov-heat-map';
import { onMounted } from 'vue'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

//创建场景
const scene = new THREE.Scene();
let renderer: THREE.WebGLRenderer;

//添加背景颜色
scene.background = new THREE.Color(0x000000);

//创建相机
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 20;
camera.position.y = 0;
camera.updateProjectionMatrix();

//环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 1000, 0);
light.position.set(0, 10, 10);
scene.add(light);

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);

onMounted(() => {

    //创建渲染器
    renderer = new THREE.WebGLRenderer();
    //调整窗口的大小
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container')?.appendChild(renderer.domElement);
    //添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);

    function animate() {
        controls.update();
        //进行渲染
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
    addHeatMap();
})

const TemperatureColorStops = {
    1.0: '#f00',
    0.9: '#e2fa00',
    0.6: '#33f900',
    0.3: '#0349df',
    0.0: '#0f00ff'
};

// 热力图
function addHeatMap() {

    var heatmap = heatMap.create({
        container: createDom(),
        gradient: TemperatureColorStops,
    });
    var len = 30;
    const width = 300;
    const height = 300;
    var points = [];
    var max = 0;
    while (len--) {
        var val = Math.floor(Math.random() * 30);
        max = Math.max(max, val);
        var point = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            value: val
        };
        points.push(point);
    }

    heatmap.setData({
        max: max,
        data: points
    });

    // 灰度图
    var greymap = heatMap.create({
        container: createDom(),
        gradient: {
            '0': 'black',
            '1.0': 'white'
        }
    });

    greymap.setData({
        max: max,
        data: points
    });
    let heatMapMaterial = new THREE.ShaderMaterial({
        transparent: true,
        vertexShader: `varying vec2 vUv;
        uniform float Zscale;
        uniform sampler2D greyMap;
        void main() {
         vUv = uv;
        vec4 frgColor = texture2D(greyMap, uv);//获取灰度图点位信息
        float height = Zscale * frgColor.a;//通过灰度图的rgb*需要设置的高度计算出热力图每个点位最终在z轴高度
        vec3 transformed = vec3( position.x, position.y, height);//重新组装点坐标
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);//渲染点位
       
        }
      `,
        fragmentShader: `varying vec2 vUv;
        uniform sampler2D heatMap;//热力图
        uniform vec3 u_color;//基础颜色
        uniform float u_opacity; // 透明度
        void main() {
          //vec4 alphaColor = texture2D(heatMap, vUv);
          // gl_FragColor = alphaColor;
           gl_FragColor = vec4(u_color, u_opacity) * texture2D(heatMap, vUv);//把热力图颜色和透明度进行渲染
        }`,
        uniforms: {
            'heatMap': {
                value: { value: undefined }
            },
            'greyMap': {
                value: { value: undefined }
            },
            Zscale: { value: 2.0 }, // 高度参数
            u_color: {
                value: new THREE.Color('rgb(255, 255, 255)')
            },
            u_opacity: {
                value: 1.0
            }
        }
    });
    heatMapMaterial.side = THREE.DoubleSide; // 双面渲染

    let texture = new THREE.Texture(heatmap._renderer.canvas);
    texture.needsUpdate = true;
    let greyTexture = new THREE.Texture(greymap._renderer.canvas);
    greyTexture.needsUpdate = true;

    heatMapMaterial.uniforms.heatMap.value = texture;
    heatMapMaterial.uniforms.greyMap.value = greyTexture;

    const heatMapGeometry = new THREE.PlaneGeometry(10, 10, 100, 100); // 3d热力图大小，及分块数量
    let heatMapPlane = new THREE.Mesh(heatMapGeometry, heatMapMaterial);
    heatMapPlane.rotation.set(-Math.PI / 2, 0, 0);
    heatMapPlane.position.set(0, 0, 0);  //  3d热力图中心点位置

    scene.add(heatMapPlane);
}

function createDom(){
    // 创建一个新的 canvas 元素
    var canvas = document.createElement('canvas');
    // 设置 canvas 元素的宽度和高度
    canvas.width = 300;
    canvas.height = 300;
    document.body.appendChild(canvas);
    
    return canvas;
}


let heatmapInstance;

// 创建热力图
function addPluginHeatmap() {

    // 创建一个heatmap实例对象
    // “h337” 是heatmap.js全局对象的名称.可以使用它来创建热点图实例
    // 这里直接指定热点图渲染的div了.heatmap支持自定义的样式方案,网页外包接活具体可看官网api
    heatmapInstance = heatMap.create({

        container: document.getElementById('heatmap'),

        backgroundColor: 'red',    // '#121212'    'rgba(0,102,256,0.2)'
        gradient: TemperatureColorStops,
        radius: 50,	 // [0,+∞)
        opacity: .5,
        blur: '.8',

    });

    setHeatMapData();

    // 获取 heatmap
    let texture = new THREE.Texture(heatmapInstance._renderer.canvas);
    const material = new THREE.MeshLambertMaterial({

        map: texture,
        transparent: true,
        opacity: 1

    });
    material.side = THREE.DoubleSide; // 双面渲染

    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material);
    scene.add(mesh);

    // 更新图片
    if (texture) {
        texture.needsUpdate = true;
    }
}

// 设置热力图位置温度数据
function setHeatMapData() {

    //构建一些随机数据点,网页切图价格这里替换成你的业务数据
    let points = [];
    let max = 0;
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    let len = 500;
    // 随机位置点设置温度值
    while (len--) {
        var val = Math.floor(Math.random() * 25 + 10);
        max = Math.max(max, val);
        var point = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            value: val
        };
        points.push(point);
    }
    // 准备 heatmap 的数据
    const data = {
        max: max,
        data: points
    };
    //因为data是一组数据,web切图报价所以直接setData
    heatmapInstance.setData(data); //数据绑定还可以使用
}


// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};
</script>
<style ></style>