<template></template>
<script setup lang="ts">
import { onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//加载图片
const IMAGE_SKY = new URL("../../assets/images/xuhua.png", import.meta.url).href;

const scene = new THREE.Scene();

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(400);
scene.add(axesHelper);

//光源设置
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3.8);
directionalLight.position.set(400, 200, 300);
scene.add(directionalLight);

//渲染器和相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 40);  //通过相机裁剪实现后面的小雪花看不见的效果
camera.position.set(0, 40, 40);

const renderer = new THREE.WebGLRenderer({
    antialias: true,//抗锯齿
});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// 设置相机控件轨道控制器OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);


const geometry = new THREE.BufferGeometry();
const count = 10000;
const vertices = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) {
    vertices[i] = (Math.random() - 0.5) * 100;
    colors[i] = Math.random();
}
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
//geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));

const texture = new THREE.TextureLoader().load(IMAGE_SKY);
const material = new THREE.PointsMaterial({
    map: texture,
    alphaMap: texture,  //灰度纹理，用于控制表面的不透明度
    transparent: true, //材质是否透明
    size: 1,
    color:new THREE.Color(0xffffff),
    //vertexColors: true,   //是否使用顶点着色
    blending:THREE.AdditiveBlending  //叠加方式
});

const points = new THREE.Points(geometry, material);

scene.add(points);

const clock = new THREE.Clock();

// 渲染循环
function render() {
    const time = clock.getElapsedTime();
    points.rotation.x = time * 0.15;
    points.rotation.y = time * 0.04;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render();

// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};
</script>