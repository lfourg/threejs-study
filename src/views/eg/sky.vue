<template>
    <div id="login-three-container"></div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import _ from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//容器
let container;
//场景
let scene;
//加载图片
const IMAGE_SKY = new URL("../../assets/images/sky.png", import.meta.url).href;
//宽度
let width;
//高度
let height;
//深度
let depth = 1400

//相机在Z轴上的位置
let zAxisNumber;
//相机
let camera;
//渲染器
let renderer;

//球体网格
let sphere;

//点的初始参数
let parameters;
//材质
let materials = [];
//初始位置
let particles_init_postion;
//声明点一在Z轴上的移动位置
let zprogerss;
//声明点二在Z轴上的移动位置
let zprogerss_second;
//声明点一数据
let particles_first = []
//声明点二数据
let particles_second = []
//声明星云对象1
let cloud_first;
//声明星云对象2
let cloud_second;
//声明星云运动的渲染函数1
let renderCloud_first;
//声明星云运动的渲染函数2
let renderCloud_second;

const IMAGE_EARCH = new URL("../../assets/images/earth_bg.png", import.meta.url).href;
const IMAGE_STAR1 = new URL("../../assets/images/starflake1.png", import.meta.url).href;
const IMAGE_STAR2 = new URL("../../assets/images/starflake2.png", import.meta.url).href;
const IMAGE_CLOUD = new URL("../../assets/images/cloud.png", import.meta.url).href;

onMounted(() => {
    container = document.querySelector('#login-three-container');
    width = container?.clientWidth;
    height = container?.clientHeight;

    initScene(); //初始化场景
    initSceneBg(); //初始化背景
    initCamera();  //添加相机
    initSphereModal();  //初始化球体
    initLight();  //添加灯光
    
    //定义初始位置
    particles_init_postion = -zAxisNumber - depth / 2; //星星初始位置
    zprogerss = particles_init_postion;
    zprogerss_second = particles_init_postion * 2;

    //初始化星星效果
    particles_first = initSceneStar(particles_init_postion);
    particles_second = initSceneStar(zprogerss_second);

    //添加星云效果
    cloud_first = initCloud(200, 100);
    cloud_second = initCloud(100, 50);

    //让星云运动起来
    renderCloud_first = initCloudMove(cloud_first, [
        new THREE.Vector3(-width / 10, 0, -depth / 2),
        new THREE.Vector3(-width / 4, height / 8, 0),
        new THREE.Vector3(-width / 4, 0, zAxisNumber)
    ], 0.0002);
    renderCloud_second = initCloudMove(cloud_second, [
        new THREE.Vector3(width / 8, height / 8, -depth / 2),
        new THREE.Vector3(width / 8, height / 8, zAxisNumber)
    ], 0.0008);

    initRenderer();
    initOrbitControls();
    animate();
})

//初始化场景
const initScene = () => {
    scene = new THREE.Scene();
    //添加雾的效果
    //scene.fog = new THREE.Fog(0x000000, 0, 10000);
}

//添加背景
const initSceneBg = () => {
    new THREE.TextureLoader().load(IMAGE_SKY, (texture) => {
        //创建立方体
        const geometry = new THREE.BoxGeometry(width, height, depth);
        //材质
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        //创建网格
        const mesh = new THREE.Mesh(geometry, material);
        //添加到场景
        scene.add(mesh);
    })
}

//初始化相机
const initCamera = () => {
    //视野夹角
    const fov = 15;
    //相机距离物体的距离
    const distance = width / 2 / Math.tan(Math.PI / 12);
    zAxisNumber = Math.floor(distance - depth / 2);

    camera = new THREE.PerspectiveCamera(fov, width / height, 1, 30000);
    //设置相机所在的位置
    camera.position.z = zAxisNumber;
    //相机看向原点
    camera.lookAt(0, 0, 0);
}

//初始化球体
const initSphereModal = () => {

    const geometry = new THREE.SphereGeometry(50, 64, 32);
    const material = new THREE.MeshPhongMaterial();
    material.map = new THREE.TextureLoader().load(IMAGE_EARCH)
    //创建网格
    sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(-200, 100, -540);
    scene.add(sphere);
}

//添加光照
const initLight = () => {
    //环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const light = new THREE.PointLight(0x0655fd, 5000, 0);
    light.position.set(0, 50, -540);
    //0 100 -200
    scene.add(light);
}

//星球的自转
const renderSphereRotate = () => {
    sphere.rotateY(0.001);
}

//初始化星星的效果
const initSceneStar = (initZPoisition) => {
    const geometry = new THREE.BufferGeometry();
    //星星位置的坐标
    const vertices = [];
    //创建纹理
    const textureLoader = new THREE.TextureLoader();
    const sprite1 = textureLoader.load(IMAGE_STAR1);
    const sprite2 = textureLoader.load(IMAGE_STAR2);
    //星星的数据
    const pointsGeometry = [];
    //声明点参数
    parameters = [
        [[0.6, 100, 0.75], sprite1, 50],
        [[0, 0, 1], sprite2, 20]
    ];
    //创建1500个星星
    for (let i = 0; i < 1500; i++) {
        const x = THREE.MathUtils.randFloatSpread(width);
        const y = _.random(0, height / 2);
        const z = _.random(-depth / 2, zAxisNumber);
        vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    //创建二种不同的材质
    for (let i = 0; i < parameters.length; i++) {
        //颜色
        const color = parameters[i][0];
        //纹理
        const sprite = parameters[i][1];
        //点大小
        const size = parameters[i][2];
        materials[i] = new THREE.PointsMaterial({
            size: size,
            map: sprite,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthTest: true
        });
        //设置颜色HSL
        materials[i].color.setHSL(color[0], color[1], color[2]);
        //创建物体
        const particles = new THREE.Points(geometry, materials[i]);
        particles.rotation.x = Math.random() * 0.2 - 0.15;
        particles.rotation.y = Math.random() * 0.2 - 0.15;
        particles.rotation.z = Math.random() * 0.2 - 0.15;
        particles.position.setZ(initZPoisition);
        pointsGeometry.push(particles);
        scene.add(particles);
    }
    return pointsGeometry;
}

//渲染星星的运动
const renderStarMove = () => {
    //星星颜色交替变化
    const time = Date.now() * 0.00005;
    for (let i = 0; i < parameters.length; i++) {
        const color = parameters[i][0];
        const h = (360 * (color[0] + time) % 360) / 360;
        materials[i].color.setHSL(color[0], color[1], parseFloat(h.toFixed(2)));
    }

    //星星的运动
    zprogerss += 1;
    zprogerss_second += 1;
    if (zprogerss > zAxisNumber) {
        zprogerss = particles_init_postion;
    } else {
        particles_first.forEach(item => {
            item.position.setZ(zprogerss);
        })
    }
    if (zprogerss_second > zAxisNumber) {
        zprogerss_second = particles_init_postion;
    } else {
        particles_second.forEach(item => {
            item.position.setZ(zprogerss_second);
        })
    }
}

//渲染星云的效果
const initCloud = (width, height) => {
    const geometry = new THREE.PlaneGeometry(width, height);
    const textureLoader = new THREE.TextureLoader();
    const cloudTexture = textureLoader.load(IMAGE_CLOUD);
    const material = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false
    });
    const cloud = new THREE.Mesh(geometry, material);
    scene.add(cloud);
    return cloud;
}

//创建星云的运动函数
const initCloudMove = (cloud, route, speed) => {
    let cloudProgress = 0;
    //创建三维曲线
    const curve = new THREE.CatmullRomCurve3(route)
    return () => {
        if (cloudProgress <= 1) {
            cloudProgress += speed;
            //获取当前位置
            const point = curve.getPoint(cloudProgress);
            if (point && point.x) {
                cloud.position.set(point.x, point.y, point.z);
            }
        } else {
            cloudProgress = 0;
        }
    }
}

//渲染器
const initRenderer = () => {
    renderer = new THREE.WebGLRenderer();
    //定义渲染器尺寸
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);
}

//添加轨道控制器
const initOrbitControls = () => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.update();
}

//动画刷新
const animate = () => {
    requestAnimationFrame(animate);
    renderSphereRotate();
    renderStarMove();
    renderCloud_first();
    renderCloud_second();
    renderer.render(scene, camera);
}

</script>
<style scoped lang="less">
#login-three-container {
    width: 100vw;
    height: 100vh;
}
</style>