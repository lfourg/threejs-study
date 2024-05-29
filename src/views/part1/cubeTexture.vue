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

//创建相机
const camera = new THREE.PerspectiveCamera();
camera.position.z = 10;
camera.position.y = 2;

//创建立方纹理  左右 上下 前后 
//创建一个纹理贴图，将其应用到一个表面，或者作为反射/折射贴图。
const cubeTexture = new THREE.CubeTextureLoader().setPath('/textures/').load(
    ['04.jpg', '01.jpg',
        '05.jpg', '02.jpg',
        '06.jpg', '03.jpg']);

//添加背景纹理
scene.background = cubeTexture;

//创建球体
const sphere = new THREE.SphereGeometry(1);
const material = new THREE.MeshBasicMaterial({
    envMap: cubeTexture
})

//创建网格
const cube = new THREE.Mesh(sphere, material);
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

    //添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);

    //设置阻尼效果
    controls.enableDamping = true;
    controls.dampingFactor = 0.01;

    document.getElementById('container')?.appendChild(renderer.domElement);

    //让立方体动起来
    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        //轨道控制器更新
        controls.update();

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