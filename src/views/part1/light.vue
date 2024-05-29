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
const geometry = new THREE.BoxGeometry(1, 1, 1);
//创建材质
const material = new THREE.MeshPhongMaterial({
    color: 0x0099ff,
    shininess: 1000   //高亮的程度
});
//创建网格
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0.5, 0);
//物体能接收光源
cube.receiveShadow = true;
//物体能投射光源
cube.castShadow = true;
//添加到场景
scene.add(cube);

//添加灯光效果
//添加环境光
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

//添加点光源
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 3, 5);
pointLight.castShadow = true;
scene.add(pointLight);

//创建地面
const meshfloor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x1b5e20,
        side: THREE.DoubleSide
    })
)
meshfloor.rotation.x = Math.PI /2;
//地面设置接收光源
meshfloor.receiveShadow = true;
scene.add(meshfloor);


//添加网格地面
//const gridHelper = new THREE.GridHelper(10, 10);
//scene.add(gridHelper);

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
//axesHelper.position.y = 3;
scene.add(axesHelper);

onMounted(() => {

    //创建渲染器
    const renderer = new THREE.WebGLRenderer();

    //如果设置开启，允许在场景中使用阴影贴图
    renderer.shadowMap.enabled = true;
    
    //调整窗口的大小
    renderer.setSize(window.innerWidth, window.innerHeight);

    //添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);

    //设置阻尼效果
    //controls.enableDamping = true;
    //controls.dampingFactor = 0.01;

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