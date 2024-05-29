<template></template>
<script setup lang="ts">
import { onMounted } from 'vue';
import _ from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadGltf, dealShellMesh, dealGlassMesh } from './model.js'; //模型对象
import TWEEN from '@tweenjs/tween.js';
import gui from '../gui.js';

type rotate = 'x' | 'y' | 'z'
interface ITweenConfig {
    name: string,
    rotateAxis: rotate,
    from: { value: number | null },
    to: { value: number | null },
    status: string
}
interface ITweenCollection {
    LFDoor: ITweenConfig,
    LBDoor: ITweenConfig,
    RBDoor: ITweenConfig,
    RFDoor: ITweenConfig,
    Trunk: ITweenConfig,
}
let tweenCollection: ITweenCollection = {
    LFDoor: {
        name: "左前门",
        rotateAxis: 'y',
        from: { value: 0 },
        to: { value: -50 },
        status: 'close'
    },
    LBDoor: {
        name: "左后门",
        rotateAxis: 'y',
        from: { value: 0 },
        to: { value: -50 },
        status: 'close'
    },
    RBDoor: {
        name: "右前门",
        rotateAxis: 'y',
        from: { value: 0 },
        to: { value: 50 },
        status: 'close'
    },
    RFDoor: {
        name: "右后门",
        rotateAxis: 'y',
        from: { value: 0 },
        to: { value: 50 },
        status: 'close'
    },
    Trunk: {
        name: "后备箱",
        rotateAxis: 'z',
        from: { value: 0 },
        to: { value: 80 },
        status: 'close'
    }
}
type TweenCollectionKeys = keyof ITweenCollection;
let model: THREE.Group;
let models: Array<THREE.Object3D> = []


const scene = new THREE.Scene();

loadGltf().then(model => {
    //model = model;
    scene.add(model);
    for (let key in tweenCollection) {
        models.push(model.getObjectByName(tweenCollection[key as TweenCollectionKeys].name) as THREE.Object3D);
    }

    render();
    // 渲染循环
    function render() {
        TWEEN.update();
        renderer.render(scene, camera);
        //材质处理
        dealShellMesh(model);
        dealGlassMesh(model);
        requestAnimationFrame(render);
    }
})

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

//光源设置
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3.8);
directionalLight.position.set(400, 200, 300);
scene.add(directionalLight);

// 环境光子菜单
const ambientFolder = gui.addFolder('环境光');
ambientFolder.close();//关闭菜单
// 环境光强度
ambientFolder.add(ambient, 'intensity', 0, 2);
// 平行光子菜单
const dirFolder = gui.addFolder('平行光');
dirFolder.close();//关闭菜单
// 平行光强度
dirFolder.add(directionalLight, 'intensity', 0, 10);
const dirFolder2 = dirFolder.addFolder('位置');//子菜单的子菜单
dirFolder2.close();//关闭菜单
// 平行光位置
dirFolder2.add(directionalLight.position, 'x', -500, 500);
dirFolder2.add(directionalLight.position, 'y', -500, 500);
dirFolder2.add(directionalLight.position, 'z', -500, 500);

//渲染器和相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
camera.position.set(-300, 500, 500);
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({
    antialias: true,//抗锯齿
});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// 设置相机控件轨道控制器OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};


const onPointerMove = (event: MouseEvent) => {

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    pointer.x = (event.offsetX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.offsetY / window.innerHeight) * 2 + 1;

    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(pointer, camera);

    for (let i = 0; i < models.length; i++) {
        // 计算物体和射线的焦点
        const intersects = raycaster.intersectObjects(models[i].children);
        console.log('intersects:', intersects);
        if (intersects.length > 0) {
            let tweenConfig = getTweenConfig(models[i].name) as ITweenConfig;
            let { from, to, status, rotateAxis } = tweenConfig;
            new TWEEN.Tween(_.clone(status == 'close' ? from : to)).
                to(_.clone(status == 'close' ? to : from), 2000)
                .onUpdate((params: any) => {
                    models[i].rotation[rotateAxis] =
                        THREE.MathUtils.degToRad(params.value)
                }).start();
            tweenConfig.status = status == "close" ? 'open' : 'close';
            break;
        }
    }
}

const getTweenConfig = (name: string) => {
    let key: string | undefined = Object.keys(tweenCollection).find(key => {
        return tweenCollection[key as TweenCollectionKeys].name == name
    })
    return key && tweenCollection[key as TweenCollectionKeys]
}

window.addEventListener('click', onPointerMove);

</script>