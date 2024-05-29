<template>
    <div></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

//创建场景
const scene = new THREE.Scene();

//创建相机
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 3000);
//camera.position.z = 15;


//创建渲染器
const renderer = new THREE.WebGLRenderer();
//调整窗口的大小
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 三维样条曲线
const path1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-50, 20, 90),
    new THREE.Vector3(-10, 40, 40),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(60, -60, 0),
    new THREE.Vector3(90, -40, 60),
    new THREE.Vector3(120, 30, 30),
]);
const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-50, 0, 0),
    new THREE.Vector3(-40, 0, 0),
    new THREE.Vector3(0, 20, 0),
    new THREE.Vector3(30, 20, 0),
    new THREE.Vector3(40, 20, 0),
    new THREE.Vector3(50, 20, 0),
]);
// 样条曲线path作为TubeGeometry参数生成管道
const geometry = new THREE.TubeGeometry(path, 200, 5, 30);
const texLoader = new THREE.TextureLoader();
//纹理贴图
const texture = texLoader.load('./textures/RammedEarth006_COL_4K_METALNESS.png');
//UV坐标U方向阵列模式
texture.wrapS = THREE.RepeatWrapping;
//纹理沿着管道方向阵列(UV坐标U方向)
texture.repeat.x = 10;
const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide, //双面显示看到管道内壁
});
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh)

// 从曲线上等间距获取一定数量点坐标
const pointsArr = path.getSpacedPoints(500);
let i = 0;
// 相机位置：曲线上当前点pointsArr[i]
camera.position.copy(pointsArr[i]);
// 相机观察目标：当前点的下一个点pointsArr[i + 1]
camera.lookAt(pointsArr[i+1]);


//添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(pointsArr[i+1]);
// 对轨道控制器改变的时间进行监听 
controls.addEventListener('change', () => {
    //console.log('change');
})

//设置阻尼效果
//controls.enableDamping = true;
//controls.dampingFactor = 0.01;


//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

function animate() {
    requestAnimationFrame(animate);

    if (i < pointsArr.length - 1) {
        // 相机位置设置在当前点位置
        camera.position.copy(pointsArr[i]);
        // 曲线上当前点pointsArr[i]和下一个点pointsArr[i+1]近似模拟当前点曲线切线
        // 设置相机观察点为当前点的下一个点，相机视线和当前点曲线切线重合
        camera.lookAt(pointsArr[i+1]);
        i += 1; //调节速度
    } else {
        i = 0
    }

    //轨道控制器更新
    controls.update();

    //进行渲染
    renderer.render(scene, camera);
}

animate();

</script>