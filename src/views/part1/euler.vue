<template>
    <div id="container"></div>
</template>

<script setup lang='ts'>
import * as THREE from 'three';
import { onMounted } from 'vue'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { ref, reactive } from 'vue'

//创建场景
const scene = new THREE.Scene();

//添加背景颜色
scene.background = new THREE.Color(0x666666);

//创建相机
const camera = new THREE.PerspectiveCamera();
camera.position.z = 10;
camera.position.y = 2;

//创建立方体
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00
});

//创建网格
const cube = new THREE.Mesh(geometry, material);
cube.rotation.set(Math.PI/4,0,0);
scene.add(cube);


//添加网格地面
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
//axesHelper.position.y = 3;
scene.add(axesHelper);

onMounted(() => {

    //创建渲染器
    const renderer = new THREE.WebGLRenderer();
    //调整窗口的大小
    renderer.setSize(window.innerWidth, window.innerHeight);
    //添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);

    document.getElementById('container')?.appendChild(renderer.domElement);

    //让立方体动起来
    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        //cube.rotation.y += 0.01;

        //进行渲染
        renderer.render(scene, camera);
    }

    animate();
})
</script>
<style >
#gui {
    position: absolute;
    right: 0;
    width: 300px;
}
</style>