<template>
    <div id="container"></div>
    <div class="pos">
        <div id="A" class="bu" @click="cli('设备A标注')">设备A</div>
        <div id="B" class="bu" style="margin-left: 10px;" @click="cli('设备B标注')">设备B</div>
        <div id="car" class="bu" style="margin-left: 10px;" @click="cli('停车场标注')">停车场</div>
        <div id="all" class="bu" style="margin-left: 10px;" @click="cli('all')">整体</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import model from './model.js'; //模型对象
//实现后期处理效果
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
//引入渲染通道
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
//引入OutlinePass通道
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
// 伽马校正后处理Shader
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
// ShaderPass功能：使用后处理Shader创建后处理通道
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// SMAA抗锯齿通道
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

let camera: THREE.Camera,
    controls: OrbitControls;

interface ITweenEventParam {
    x: number,
    y: number,
    z: number,
    tx: number,
    ty: number,
    tz: number
}

onMounted(() => {

    //添加场景
    const scene = new THREE.Scene();
    scene.add(model);

    //辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    //环境光源
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);
    // 从上方照射的白色平行光，强度为 1。
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);


    //相机
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
    camera.position.set(202, 123, 40);
    camera.lookAt(0, 0, 0);

    // WebGL渲染器设置
    const renderer = new THREE.WebGLRenderer({
        antialias: true, //开启优化锯齿
    });
    renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
    renderer.setSize(width, height);
    document.getElementById('container')?.appendChild(renderer.domElement);

    //创建后处理对象，WebGL渲染器作为参数
    const composer = new EffectComposer(renderer);
    //创建一个渲染通道
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    //创建OutlinePass通道
    //outlinePass第一个参数v2的尺寸与画布大小保持一致
    const v2 = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const outlinePass = new OutlinePass(v2, scene, camera);
    outlinePass.visibleEdgeColor.set(0x00ffff);
    outlinePass.edgeThickness = 4;
    outlinePass.edgeStrength = 6;
    composer.addPass(outlinePass);

    // 创建伽马校正通道
    const gammaPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaPass);
    // console.log('GammaCorrectionShader',GammaCorrectionShader);
    //获取.setPixelRatio()设置的设备像素比
    const pixelRatio = renderer.getPixelRatio();
    // 创建SMAAPass抗锯齿通道
    // width、height是canva画布的宽高度
    const smaaPass = new SMAAPass(width * pixelRatio, height * pixelRatio);
    composer.addPass(smaaPass);

    // 渲染循环
    function render() {
        TWEEN.update();
        //调用后处理器的render方法，会调用渲染器的render方法
        composer.render();
        //renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    // 画布跟随窗口变化
    window.onresize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };


    controls = new OrbitControls(camera, renderer.domElement);


    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    renderer.domElement.addEventListener('pointermove', (event) => {

        pointer.x = (event.offsetX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.offsetY / window.innerHeight) * 2 + 1;

        // 通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(pointer, camera);

        const cunchu = model.getObjectByName('存储罐');
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

            outlinePass.selectedObjects = [chooseObj];

            const pos = new THREE.Vector3();
            chooseObj.getWorldPosition(pos);

            const pos2 = pos.clone().addScalar(30);
            //createCameraTween(pos2, pos);
        }else{
            outlinePass.selectedObjects = [];
        }

    });
})

const cli = (type: string) => {
    let childObjPosition, targetCameraPostion
    if (type == 'all') {
        childObjPosition = new THREE.Vector3(0, 0, 0);
        targetCameraPostion = new THREE.Vector3(202, 123, 40);
    } else {
        const childObj = model.getObjectByName(type);
        childObjPosition = new THREE.Vector3();
        childObj?.getWorldPosition(childObjPosition);  //返回一个表示该物体在世界空间中位置的矢量
        // 相机飞行到的位置和观察目标拉开一定的距离
        targetCameraPostion = childObjPosition.clone().addScalar(30);
    }
    createCameraTween(targetCameraPostion, childObjPosition);
}

// 相机从当前位置camera.position飞行三维场景中某个世界坐标附近
const createCameraTween = (endPos: THREE.Vector3, endTarget: THREE.Vector3) => {
    const cameraPosition = camera.position;

    new TWEEN.Tween({
        x: cameraPosition.x,
        y: cameraPosition.y,
        z: cameraPosition.z,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z
    }).to({
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        tx: endTarget.x,
        ty: endTarget.y,
        tz: endTarget.z
    }, 2000)
        .onUpdate((params: ITweenEventParam) => {
            camera.position.set(params.x, params.y, params.z);
            camera.lookAt(params.tx, params.ty, params.tz);
        }).onComplete((params: ITweenEventParam) => {
            controls.target.set(params.tx, params.ty, params.tz);
            controls.update();
        })
        .start();
}

</script>

<style lang="less">
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
