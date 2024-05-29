<template>
    <div id="container"></div>
</template>

<script setup lang='ts'>
import * as THREE from 'three';
import gsap from 'gsap';
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


const geometry = new THREE.PlaneGeometry(2, 2);

const texture = new THREE.TextureLoader().load('/uv/texture.jpg');
texture.wrapS = THREE.RepeatWrapping;  //这个值定义了纹理贴图在水平方向上将如何包裹，在UV映射中对应于U
texture.wrapT = THREE.MirroredRepeatWrapping;  //这个值定义了纹理贴图在垂直方向上将如何包裹，在UV映射中对应于V。

//定义UV像素的取值范围  左上 右上 左下 右下
const uv = new Float32Array([
    0, 0.5,
    0.5, 0.5,
    0, 0,
    0.5, 0
])
geometry.attributes.uv = new THREE.BufferAttribute(uv,2);

const material = new THREE.MeshBasicMaterial({
    map: texture
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// //创建动画
gsap.to(texture.offset, {
    x: 1,
    duration: 2,
    repeat: -1,
    ease: 'none'
})

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

    //设置阻尼效果
    controls.enableDamping = true;
    controls.dampingFactor = 0.01;

    document.getElementById('container')?.appendChild(renderer.domElement);
    //让立方体动起来
    function animate() {
        requestAnimationFrame(animate);


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