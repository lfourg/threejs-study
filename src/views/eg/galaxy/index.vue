<template></template>
<script setup lang="ts">
import { onMounted, watch, reactive } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import gui from '../gui.js';

//加载图片
const IMAGE_STAR = new URL("../../../assets/images/star_01.png", import.meta.url).href;

const scene = new THREE.Scene();

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(400);
//scene.add(axesHelper);

//光源设置
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3.8);
directionalLight.position.set(400, 200, 300);
scene.add(directionalLight);

//渲染器和相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 150);  //通过相机裁剪实现后面的小雪花看不见的效果
camera.position.set(0, 30, 40);

const renderer = new THREE.WebGLRenderer({
    antialias: true,//抗锯齿
});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// 设置相机控件轨道控制器OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);


let params = reactive({
    count: 10000,
    size: 1,
    radius: 20,
    branch: 5,
    color: '#ff6030',
    rotateScale: 0.1,
    endColor: '#1b3984'
});

const folder = gui.addFolder('参数配置');
folder.open();//打开菜单
folder.add(params, 'count', 1000, 300000, 100);
folder.add(params, 'size', 0, 1, 0.1);
folder.add(params, 'radius', 5, 50, 1);
folder.add(params, 'branch', 1, 10, 1);
folder.add(params, 'rotateScale', 0, 1, 0.1);
folder.addColor(params, 'color');
folder.addColor(params, 'endColor');

let geometry = null;
let material = null;
let points = null;
let texture = new THREE.TextureLoader().load(IMAGE_STAR);
const generateGalaxy = () => {
    // 生成顶点
    geometry = new THREE.BufferGeometry();
    //随机位置
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);
    const centerColor = new THREE.Color(params.color);
    const endColor = new THREE.Color(params.endColor);
    //循环生成点
    for (let i = 0; i < params.count; i++) {

        //当前点在哪个一个那一条分支的角度上面
        const branchAngle = (i % params.branch) * (2 * Math.PI / params.branch);

        //当前点距离圆心的距离
        const distance = Math.random() * params.radius * Math.pow(Math.random(), 3);
        const current = i * 3;

        const randomX = Math.pow(Math.random() * 2 - 1, 3);
        const randomY = Math.pow(Math.random() * 2 - 1, 3);
        const randomZ = Math.pow(Math.random() * 2 - 1, 3);

        //向圆心聚拢
        // const randomX = Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance) * .15;
        // const randomY = Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance) * .15;
        // const randomZ = Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance) * .15;

        positions[current] = Math.cos(branchAngle + distance * params.rotateScale) * distance + randomX;
        positions[current + 1] = randomY;
        positions[current + 2] = Math.sin(branchAngle + distance * params.rotateScale) * distance + randomZ;

        //形成混合颜色
        const mixColor = centerColor.clone();
        mixColor.lerp(endColor, distance / params.radius);
        colors[current] = mixColor.r;
        colors[current + 1] = mixColor.g;
        colors[current + 2] = mixColor.b;

    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    //设置点材质
    material = new THREE.PointsMaterial({
        //color: new THREE.Color(params.color),
        size: params.size,
        sizeAttenuation: true,  //是否近大远小
        depthWrite: false,
        blending: THREE.AdditiveBlending,  //叠加模式，深度叠加
        map: texture,
        alphaMap: texture,
        transparent: true,
        vertexColors: true
    })
    points = new THREE.Points(geometry, material);
    scene.add(points);
}

const clock = new THREE.Clock();
generateGalaxy();
// 渲染循环
function render() {
    const time = clock.getElapsedTime();
    TWEEN.update();

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render();

watch(params, () => {
    scene.remove(points);
    generateGalaxy();
})

// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};
</script>