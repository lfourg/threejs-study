<template>
  <div></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

//创建场景
const scene = new THREE.Scene();

//创建相机
const camera = new THREE.PerspectiveCamera();
camera.position.x = 0
camera.position.z = 10;
camera.position.y = 10;
//camera.lookAt(0, 0,0)


//创建渲染器
const renderer = new THREE.WebGLRenderer();
//调整窗口的大小
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

//添加网格地面
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

//添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 对轨道控制器改变的时间进行监听 
controls.addEventListener('change', () => {
  //console.log('change');
})


function m1() {

  // 创建点的几何体
  const geometry = new THREE.BufferGeometry();

  // 添加顶点数据
  const numPoints = 10; // 点的数量
  const positions = new Float32Array(numPoints * 3); // 每个点有三个坐标值
  for (let i = 0; i < numPoints; i++) {
    const x = Math.random() * 10 - 5; // [-5, 5]
    const y = Math.random() * 10 - 5; // [-5, 5]
    const z = Math.random() * 10 - 5; // [-5, 5]
    positions[i * 3] = x; // x 坐标
    positions[i * 3 + 1] = y; // y 坐标
    positions[i * 3 + 2] = z; // z 坐标
  }

  // 将顶点数据添加到几何体中
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.rotateX(Math.PI / 2);
  // 定义点的颜色
  var colors = [];
  var color = new THREE.Color();
  for (var i = 0; i < numPoints; i++) {
    color.setHSL(i / numPoints, 1.0, 0.5);
    colors.push(color.r, color.g, color.b);
  }

  const texture = new THREE.TextureLoader().load('./2.png');
  const material = new THREE.PointsMaterial({
    map: texture,
    alphaMap: texture,  //灰度纹理，用于控制表面的不透明度
    transparent: true, //材质是否透明
    size: 3,
    color: new THREE.Color(0xf06b1b),
    vertexColors: false,   //是否使用顶点着色
    blending: THREE.AdditiveBlending  //叠加方式
  });

  // 创建点对象
  var points = new THREE.Points(geometry, material);
// 设置旋转（将对象绕 X 轴旋转 90 度）
points.rotation.x = -Math.PI/3
  // 将点对象添加到场景中
  scene.add(points);
}
//m1()

function m2() {
  // 创建几何体
  var geometry = new THREE.BufferGeometry();
  var positions = []; // 存储点的位置
  var numPoints = 100; // 点的数量

  for (var i = 0; i < numPoints; i++) {
    var x = Math.random() * 10 - 5; // 随机生成 x 坐标
    var y = Math.random() * 10 - 5; // 随机生成 y 坐标
    var z = Math.random() * 10 - 5; // 随机生成 z 坐标

    positions.push(x, y, z); // 将点的位置添加到数组中
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); // 设置几何体的顶点位置属性

  // 创建自定义着色器材质
  var material = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 25.0; // 设置点的大小
        }
    `,
    fragmentShader: `
        void main() {
            vec2 center = vec2(0.5, 0.5); // 圆心坐标
            vec2 toCenter = gl_PointCoord - center; // 计算点到圆心的向量
            float distance = length(toCenter); // 计算点到圆心的距离
            if (distance > 0.5) discard; // 超出半径范围的点直接丢弃
            vec3 innerColor = vec3(1.0, .8, 0.0); // 内圈颜色为黄色
            vec3 outerColor = vec3(0.8, 0.4, 0.0); // 外圈颜色为深橘色

            vec3 finalColor = mix(innerColor, outerColor, smoothstep(0.1, 0.23, distance)); // 根据距离混合颜色
            if(distance>0.3) finalColor = mix(finalColor, vec3(0.75, 0.4, 0.0), smoothstep(0.25, 0.3, distance)); // 根据距离混合颜色
            gl_FragColor = vec4(finalColor, 1.0); // 设置片段颜色
        }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });

  // 创建点的网格对象
  var points = new THREE.Points(geometry, material);

  // 将组添加到场景中
  scene.add(points);

}
m2()

function m3(){
// 创建点的几何体
var geometry = new THREE.BufferGeometry();
var positions = new Float32Array([
    0, 0, 0,
    1, 1, 1,
    -1, -1, -1
]);
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// 创建点的材质
var textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load('./test.jpg'); // 加载贴图
var material = new THREE.PointsMaterial({
    map: texture, // 设置贴图
    size: 5 // 设置点的大小
});

// 设置贴图的 UV 坐标来实现旋转效果
geometry.setAttribute('uv', new THREE.Float32BufferAttribute([
    0, 1, // 左下
    1, 1, // 右下
    0, 0  // 左上
], 2));

// 创建点对象
var points = new THREE.Points(geometry, material);

// 将点对象添加到场景中
scene.add(points);
}

//m3()

//设置阻尼效果
//controls.enableDamping = true;
//controls.dampingFactor = 0.01;

//自动旋转 
//controls.autoRotate = true;

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
//axesHelper.position.y = 3;
scene.add(axesHelper);

//让立方体动起来
function animate() {
  requestAnimationFrame(animate);

  //cube.rotation.x +=0.01;
  //轨道控制器更新
  //controls.update();
  //进行渲染
  renderer.render(scene, camera);
}

animate();

</script>