<template>
    <div>
        <button @click="moveCamera">移动相机</button>
        <button @click="moveCube">移动物体</button>
        <div id="container"></div>
    </div>
</template>
  
<script setup lang="ts">
import * as THREE from 'three';
import { onMounted } from 'vue'


//创建场景
const scene = new THREE.Scene();

//添加背景颜色
scene.background = new THREE.Color(0x666666);

//创建相机
const camera = new THREE.PerspectiveCamera();
camera.position.z = 10;
camera.position.y = 5;

//创建立方体
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

//创建网格
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 3, 0);
scene.add(cube);

//创建渲染器
const renderer = new THREE.WebGLRenderer();
//调整窗口的大小
renderer.setSize(window.innerWidth, window.innerHeight);

//添加网格地面
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const moveCamera = () => {
    camera.position.y = 15;
    //camera.position.z = 10;
    camera.lookAt(cube.position);
}

const moveCube = ()=>{
    cube.position.set(3,5,0);
    camera.lookAt(cube.position);
}

onMounted(() => {

    document.getElementById('container')?.appendChild(renderer.domElement);

    //让立方体动起来
    function animate() {
        requestAnimationFrame(animate);

        //cube.rotation.x +=0.01;
        //进行渲染
        renderer.render(scene, camera);
    }

    animate();


})

</script>