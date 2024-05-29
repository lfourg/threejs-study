<template>
    <div id="container"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import model from './model.js'; //模型对象

let scene: THREE.Scene,
    camera: THREE.Camera,
    controls: OrbitControls,
    renderer: THREE.WebGLRenderer;
const width = window.innerWidth;
const height = window.innerHeight;
 

onMounted(() => {

    //添加场景
    scene = new THREE.Scene();
    scene.add(model);  //添加工厂模型

    addAxesHelper();//辅助观察的坐标系
    addLight();  //初始化灯光
    initCamera();  //添加照相机

    // WebGL渲染器设置
    renderer = new THREE.WebGLRenderer({
        antialias: true, //开启优化锯齿
    });
    renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
    renderer.setSize(width, height);
    document.getElementById('container')?.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    render();
})

// 渲染循环
function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

const addAxesHelper = () => {
    //辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
}

const addLight = () => {
    //环境光源
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);
    // 从上方照射的白色平行光，强度为 1。
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);
}

//初始化相机
const initCamera = () => {
    camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
    camera.position.set(202, 123, 40);
    camera.lookAt(0, 0, 0);
}


// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

</script>

<style lang="less">
#container {
    width: 100vw;
    height: 100vh;
}
</style>
