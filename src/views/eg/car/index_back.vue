<template>

</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import model,{dealShellMesh,dealGlassMesh} from './model.js'; //模型对象

import gui from '../gui.js'; 

const scene = new THREE.Scene();
scene.add(model);

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);


//光源设置
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3.8);
directionalLight.position.set(400, 200, 300);
scene.add(directionalLight);

// 环境光子菜单
const ambientFolder = gui.addFolder('环境光');
ambientFolder.close();//关闭菜单
// 环境光强度
ambientFolder.add(ambient, 'intensity',0,2);
// 平行光子菜单
const dirFolder = gui.addFolder('平行光');
dirFolder.close();//关闭菜单
// 平行光强度
dirFolder.add(directionalLight, 'intensity',0,10);
const dirFolder2 = dirFolder.addFolder('位置');//子菜单的子菜单
dirFolder2.close();//关闭菜单
// 平行光位置
dirFolder2.add(directionalLight.position, 'x',-500,500);
dirFolder2.add(directionalLight.position, 'y',-500,500);
dirFolder2.add(directionalLight.position, 'z',-500,500);

//渲染器和相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
camera.position.set(-300, 500,500);
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({
    antialias:true,//抗锯齿
});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);


// 设置相机控件轨道控制器OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// 渲染循环
function render() {
    renderer.render(scene, camera);
    //材质处理
    dealShellMesh(model);
    dealGlassMesh(model);
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