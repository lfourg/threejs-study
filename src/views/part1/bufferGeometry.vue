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

const geometry = new THREE.BufferGeometry();
// 创建一个简单的矩形. 在这里我们左上和右下顶点被复制了两次。
// 因为在两个三角面片里，这两个顶点都需要被用到。
const vertices = new Float32Array( [
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,
	 //1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0
	//-1.0, -1.0,  1.0
] );

// itemSize = 3 因为每个顶点都是一个三元组。
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

const indexs = new Uint16Array([
    0,1,2,2,3,0
])
geometry.index = new THREE.BufferAttribute(indexs,1);

const material = new THREE.MeshBasicMaterial( { 
    color: 0xff0000,
    side:THREE.DoubleSide,
    wireframe:true
} );
const mesh = new THREE.Mesh( geometry, material );

scene.add(mesh);

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