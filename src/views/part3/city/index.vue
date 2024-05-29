<template>
    <div id="container"></div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TWEEN from '@tweenjs/tween.js';
import gsap from 'gsap';
import { modifyCityMaterial } from './modify/cityMaterial'
import FlyLine from './mesh/FlyLine.js';
import FlyLineShader from './mesh/FlyLineShader.js'
import MeshLine from './mesh/MeshLine.js';
import LineWall from './mesh/LineWall.js';


let scene: THREE.Scene,
    camera: THREE.Camera,
    controls: OrbitControls,
    renderer: THREE.WebGLRenderer;
const width = window.innerWidth;
const height = window.innerHeight;


const clock = new THREE.Clock()

const uTime = { value: 0 }

onMounted(() => {

    //添加场景
    scene = new THREE.Scene();

    //创建立方纹理  左右 上下 前后 
    //创建一个纹理贴图，将其应用到一个表面，或者作为反射/折射贴图。
    const cubeTexture = new THREE.CubeTextureLoader().setPath('./纹理贴图/skybox/skyBox2/').load(
        ['posx.jpg', 'negx.jpg',
            'posy.jpg', 'negy.jpg',
            'posz.jpg', 'negz.jpg']);
    //添加背景纹理
    scene.background = cubeTexture;

    loadCity();  //添加城市模型

    addAxesHelper();//辅助观察的坐标系
    addLight();  //初始化灯光
    initCamera();  //添加照相机

    // WebGL渲染器设置
    renderer = new THREE.WebGLRenderer({
        antialias: true, //开启优化锯齿
    });
    renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
    renderer.setSize(width, height);
    document.getElementById('container')?.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    render();
    window.addEventListener('click', onPointerMove);
})

function loadCity() {
    const loader = new GLTFLoader();
    loader.load(
        // resource URL
        './gltf/beijing-gugong.glb',
        function (gltf) {
            let mesh = gltf.scene;
            mesh.position.copy(new THREE.Vector3(0, 0, 0))
            scene.add(mesh);
            mesh.traverse((item: THREE.Object3D) => {
                if (item.type == "Mesh") {

                    (item as THREE.Mesh).material = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(0x0c0e6f)
                    });

                    modifyCityMaterial(item as THREE.Mesh, 'spread');
                    if (item.name == "Layerbuildings") {
                        const meshLine = new MeshLine((item as THREE.Mesh).geometry);
                        meshLine.mesh.scale.copy(item.scale);
                        meshLine.mesh.position.copy(item.position);
                        scene.add(meshLine.mesh);
                    }
                }
            })

             //添加光墙
             const lineWall = new LineWall(new THREE.Vector3(0, 2.2, 1.6), 1.5, new THREE.Color(0Xffff00));
            scene.add(lineWall.mesh);
            //添加光墙
            const lineWall2 = new LineWall(new THREE.Vector3(-0.2, 2.2, -9.8), .5);
            scene.add(lineWall2.mesh);

            //添加飞线
            const flyLine = new FlyLine();
            scene.add(flyLine.mesh);

            //添加着色器飞线
            const flyLineShader = new FlyLineShader();
            scene.add(flyLineShader.mesh);
        }
    );
}

// 渲染循环
function render() {

    uTime.value += clock.getDelta()
    console.log('controler:',controls)
    console.log('camera:',camera)
    TWEEN.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

const addAxesHelper = () => {
    //辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
}

const addLight = () => {
    //环境光源
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);
    // 从上方照射的白色平行光，强度为 1。
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    scene.add(directionalLight);
}

//初始化相机
const initCamera = () => {
    camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
}

const onPointerMove = (event: MouseEvent) => {

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    pointer.x = (event.offsetX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.offsetY / window.innerHeight) * 2 + 1;

    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(pointer, camera);

    const cunchu = null;// model.getObjectByName('存储罐');
    if (!cunchu) return;

    // 射线拾取模型对象(包含多个Mesh)
    // 可以给待选对象的所有子孙后代Mesh，设置一个祖先属性ancestors,值指向祖先(待选对象)    
    for (let i = 0; i < cunchu.children.length; i++) {
        const group = cunchu.children[i];
        //递归遍历chooseObj，并给chooseObj的所有子孙后代设置一个ancestors属性指向自己
        //traverse:对象场景下的物体进行遍历
        group.traverse(function (obj: any) {
            if (obj.isMesh) {
                obj.ancestors = group;
            }
        })
    }

    // 计算物体和射线的焦点
    const intersects = raycaster.intersectObjects(cunchu.children);
    if (intersects.length > 0) {
        let chooseObj = intersects[0].object.ancestors;
        const pos = new THREE.Vector3();
        chooseObj.getWorldPosition(pos);

        const pos2 = pos.clone().addScalar(30);
    }
}

// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

</script>

<style lang="less">
#container {
    width: 100vw;
    height: 100vh;
}

.bu {
    background: rgba(0, 0, 0, 0.3);
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #fff;
    display: inline-block;
    border-radius: 30px;
}

.bu:hover {
    cursor: pointer;
}

.pos {
    position: absolute;
    left: 50%;
    margin-left: -135px;
    bottom: 100px;
}
</style>
