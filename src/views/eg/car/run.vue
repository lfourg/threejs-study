<template>
    <div></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { loadGltf } from './model.js'; //模型对象
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

//创建场景
const scene = new THREE.Scene();

//创建相机
const camera = new THREE.PerspectiveCamera();
camera.position.y = 12
camera.position.z = 12;


//创建渲染器
const renderer = new THREE.WebGLRenderer();
//调整窗口的大小
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 扫描轮廓：Shape表示一个平面多边形轮廓
const shape = new THREE.Shape([
    // 按照特定顺序，依次书写多边形顶点坐标
    new THREE.Vector2(0,-.5), //多边形起点
    new THREE.Vector2(0,.5)
]);

const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.5, 0, -5),
    new THREE.Vector3(5, 0, -5),
    new THREE.Vector3(5, 0, 5),
    new THREE.Vector3(-5, 0, 5),
    new THREE.Vector3(-5, 0, -5),
],false, 'catmullrom', .1);

const geometry = new THREE.ExtrudeGeometry(
    shape, //扫描轮廓
    {
        extrudePath: curve,//扫描轨迹
        steps: 1000//沿着路径细分精度，越大越光滑
    }
);
const texLoader = new THREE.TextureLoader();
//纹理贴图
const texture = texLoader.load('./textures/ConcretePoured001_COL_4K_METALNESS.png');
//UV坐标U方向阵列模式
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide, //双面显示看到管道内壁
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let car: any;
loadGltf().then(model => {
    car = model;
    car.scale.set(0.002, 0.002, 0.002)
    car.rotation.set(0, Math.PI, 0)
    scene.add(car);
})


//让立方体动起来
function animate() {
    requestAnimationFrame(animate);

    if (car) {
        // 在CatmullRomCurve3上移动车辆
        const time = Date.now() * 0.00005; // 控制运动速度
        const pointOnCurve = curve.getPointAt(time % 1); // 循环获取曲线上的点
        car.position.copy(pointOnCurve); // 设置车辆位置
        // 计算车头方向
        const tangent = curve.getTangentAt(time % 1); // 获取曲线在当前点处的切线向量

        const angle = Math.atan2(tangent.x, tangent.z); // 计算切线与x轴之间的夹角
        car.rotation.set(0, angle + Math.PI / 2, 0); // 设置车辆的旋转角度，使车头朝向运动方向

    }
    //轨道控制器更新
    controls.update();

    //进行渲染
    renderer.render(scene, camera);
}

animate();



</script>