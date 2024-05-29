<template>
  <div id="container"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { onMounted } from 'vue'

onMounted(() => {


  //创建场景
  const scene = new THREE.Scene();

  //添加背景颜色
  scene.background = new THREE.Color(0x666666);
  scene.background =  new THREE.CubeTextureLoader().setPath('/scene/').load(['01.jpg','01.jpg','01.jpg','01.jpg','01.jpg','01.jpg']);

  //添加雾
  scene.fog = new THREE.Fog(0xcccccc,10,15);

  //创建相机
  const camera = new THREE.PerspectiveCamera();
  camera.position.z = 10;
  camera.position.y = 2;

  //创建立方体
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  //创建网格
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(2, 3, 0);
  scene.add(cube);

  //创建渲染器
  const renderer = new THREE.WebGLRenderer();
  //调整窗口的大小
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container')?.appendChild(renderer.domElement);

  //添加网格地面
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  //添加轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);

  //设置阻尼效果
  controls.enableDamping = true;
  controls.dampingFactor = 0.01;

  //自动旋转 
  controls.autoRotate = true;


  //让立方体动起来
  function animate() {
    requestAnimationFrame(animate);

    //cube.rotation.x +=0.01;
    //轨道控制器更新
    controls.update();

    //进行渲染
    renderer.render(scene, camera);
  }

  animate();


})

</script>