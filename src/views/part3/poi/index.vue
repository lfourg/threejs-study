<template>
    <div id="container"></div>
</template>

<script setup lang='ts'>
import * as THREE from 'three';
import { onMounted, render } from 'vue'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { CSS3DRenderer,CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { ref, reactive } from 'vue'
import { tr } from 'element-plus/es/locale/index.mjs';
//加载图片
const IMAGE_EARTH = new URL("../../../assets/images/earth_bg.png", import.meta.url).href;
const IMAGE_MOON = new URL("../../../assets/images/moon_bg.png", import.meta.url).href;

const params = {
    radius: 4
}

//创建场景
const scene = new THREE.Scene();
let renderer: THREE.WebGLRenderer;
let labelRender: CSS3DRenderer;

//添加背景颜色
scene.background = new THREE.Color(0x000000);

//创建相机
const camera = new THREE.PerspectiveCamera();
camera.fov = 50;
camera.aspect = window.innerWidth / window.innerHeight;
camera.position.z = -10;
camera.position.y = 4;
camera.updateProjectionMatrix();

//环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 1000, 0);
light.position.set(0, 10, 10);
//0 100 -200
scene.add(light);

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
//axesHelper.position.y = 3;
scene.add(axesHelper);

onMounted(() => {



    const textureLoader = new THREE.TextureLoader();
    const earchTexture = textureLoader.load(IMAGE_EARTH);

    const earchGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earchMaterial = new THREE.MeshPhysicalMaterial({
        map: earchTexture
    })
    const earch = new THREE.Mesh(earchGeometry, earchMaterial);
    earch.position.set(0,0,0);
    //earch.rotation.y = Math.PI;
    scene.add(earch);

    const moonGeometry = new THREE.SphereGeometry(.3, 32, 32);
    const moonMaterial = new THREE.MeshPhysicalMaterial({
        map: textureLoader.load(IMAGE_MOON)
    })
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.x = params.radius;
    scene.add(moon);

    //地球提示标牌
    const earthDiv = document.createElement("div");
    earthDiv.className = "label";
    earthDiv.innerHTML = "地球";
    const earthLabel = new CSS3DObject(earthDiv);
    earthLabel.scale.set(0.023,0.023,0.023);
    earthLabel.position.set(0, .8, 0);
    earch.add(earthLabel);

    //月球提示标牌
    const moonDiv = document.createElement("div");
    moonDiv.className = "label";
    moonDiv.innerHTML = "月球";
    const moonLabel = new CSS3DObject(moonDiv);
    moonLabel.scale.set(0.023,0.023,0.023);
    moonLabel.position.set(0, .35, 0);
    moon.add(moonLabel);

    //中国提示标牌
    const chinaDiv = document.createElement("div");
    chinaDiv.className = "label-china";
    chinaDiv.innerHTML = "中国";
    const chinaLabel = new CSS3DObject(chinaDiv);
    chinaLabel.position.set(-.2, .5, -1.0);
    chinaLabel.scale.set(0.023,0.023,0.023);
    chinaLabel.scale.set(.1,.1,.1);
    earch.add(chinaLabel);

    //实例化css2d渲染器
    labelRender = new CSS3DRenderer();
    labelRender.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('container')?.appendChild(labelRender.domElement);
    labelRender.domElement.style.position = 'fixed';
    labelRender.domElement.style.top = '0';
    labelRender.domElement.style.zIndex = '10';

    //创建渲染器
    renderer = new THREE.WebGLRenderer();
    //调整窗口的大小
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('container')?.appendChild(renderer.domElement);

    //添加轨道控制器
    const controls = new OrbitControls(camera, labelRender.domElement);

    console.log('scene:',scene);

    const clock = new THREE.Clock();
    function animate() {

        const elapsedTime = clock.getElapsedTime();
        moon.position.set(Math.sin(elapsedTime) * params.radius, 0, Math.cos(elapsedTime) * params.radius);
        requestAnimationFrame(animate);
        controls.update();

        const chinaLabelPosition = chinaLabel.position.clone();
        //将此向量(坐标)从世界空间投影到相机的标准化设备坐标 (NDC) 空间。
        const chinaLabelNDC = chinaLabelPosition.project(camera);
        //实例化射线
        const raycaster = new THREE.Raycaster();

        //检测射线碰撞
        raycaster.setFromCamera(new THREE.Vector2(chinaLabelNDC.x, chinaLabelNDC.y), camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        //标签与摄像机的距离
        const labelDistance = chinaLabel.position.distanceTo(camera.position);

        //没有碰撞到任何物体
        if (intersects.length == 0) {
            chinaLabel.element.classList.remove('visible');
        } else {
            const minDistance = intersects[0].distance;
            if (minDistance < labelDistance) {
                chinaLabel.element.classList.remove('visible');
            } else {
                chinaLabel.element.classList.add('visible');
            }
        }

        //标签渲染器
        labelRender.render(scene, camera);
        //进行渲染
        renderer.render(scene, camera);
    }

    animate();
})

// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRender.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};
</script>
<style >
#gui {
    position: absolute;
    right: 0;
    width: 300px;
}

.label {
    color: #fff;
    font-size: 16px;
    font-weight: bold;

}

.label-china {
    color: red;
    font-size: 16px;
    font-weight: bold;
    display: none;
}

.label-china.visible {
    display: block;
}
</style>