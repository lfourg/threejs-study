<template>
  <div></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { ThreeMFLoader } from 'three-stdlib';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

//创建场景
const scene = new THREE.Scene();

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

//设置阻尼效果
controls.enableDamping = true;
controls.dampingFactor = 0.01;

//自动旋转 
//controls.autoRotate = true;

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
axesHelper.position.y = 3;
scene.add(axesHelper);

//环境光源
const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);
// 从上方照射的白色平行光，强度为 1。
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
scene.add(directionalLight);


const texture = new THREE.TextureLoader().load("./warn.png");
texture.encoding = THREE.sRGBEncoding; // 将纹理的编码设置为sRGB
const material1 = new THREE.SpriteMaterial({
  map: texture, 
  depthTest: false,
  transparent: true,
});
const sprite = new THREE.Sprite(material1);
//scene.add(sprite);

// 创建渐变材质
const gradientMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true, // 启用顶点颜色插值
});

// 创建渐变立方体的顶点颜色数组
const geometry2 = new THREE.BoxGeometry(10, 50, 10);
const position = geometry2.attributes.position;
const colors = [];
for (let i = 0; i < position.count; i++) {
  const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(position, i);
    // 计算顶点的浅橘色到白色渐变值
    const gradientX = (vertex.x + 5)/10; // 从0到1的梯度
    const gradientY = (vertex.y + 25) / 50; // 从0到1的梯度
    // 计算渐变色
    const color = new THREE.Color().setHex(0xe0a150); // 初始颜色为浅橘色
    color.lerp(new THREE.Color(1, 1, 1), gradientX * gradientY); // 从浅橘色渐变到白色
    // 添加顶点颜色
    colors.push(color.r, color.g, color.b); // 添加渐变色
}
geometry2.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

// 创建渐变立方体
const gradientCube = new THREE.Mesh(geometry2, gradientMaterial);
gradientCube.position.set(10,10,10)
scene.add(gradientCube);


const clock = new THREE.Clock()

let i =1;
//让立方体动起来
function animate() {
  requestAnimationFrame(animate);

  if(i<=120){
   console.log('getDelta:',clock.getDelta())
   console.log('getElapsedTime:',clock.getElapsedTime())
  }
  i++;
  //cube.rotation.x +=0.01;
  //轨道控制器更新
  //controls.update();

  //进行渲染
  renderer.render(scene, camera);
}

animate();

</script>