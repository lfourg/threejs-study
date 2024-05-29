<template>
    <div id="container"></div>
</template>

<script setup lang='ts'>
import dat from 'dat.gui';
import * as THREE from 'three';
import { onMounted } from 'vue'
import { ref, reactive } from 'vue'
//创建控制对象
const controlData = {
    rotationSpeed: 0.02,
    color: '#66ccff',
    wireframe: false
}
//创建实例
const gui = new dat.GUI();
const f = gui.addFolder('配置');
//f.add(controlData,'rotationSpeed',0.01,0.1,0.01);
f.add(controlData, 'rotationSpeed').min(0.01).max(0.1).step(0.01);
f.addColor(controlData, 'color');
f.add(controlData, 'wireframe');

f.domElement.id = "gui"
f.open();


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
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

//创建网格
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 3, 0);
scene.add(cube);

//添加网格地面
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);


onMounted(() => {

    //创建渲染器
    const renderer = new THREE.WebGLRenderer();
    //调整窗口的大小
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('container')?.appendChild(f.domElement);
    document.getElementById('container')?.appendChild(renderer.domElement);

    //让立方体动起来
    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += controlData.rotationSpeed;
        cube.rotation.y += controlData.rotationSpeed;

        cube.material.color = new THREE.Color(controlData.color);
        material.wireframe = controlData.wireframe;

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