<template>
    <div class="con">
        <el-button type="primary" size="large" @click="handelBegin">开始游戏</el-button>
        <span class="txt">游戏规则：按下空格键攻击障碍物</span>
    </div>
</template>
<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { ModelsLoad } from './ModelLoad'
import { ElMessage } from 'element-plus'

const scene = new THREE.Scene();

//光源设置
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3.8);
directionalLight.position.set(-5, 25, -1);
scene.add(directionalLight);

//渲染器和相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
camera.position.set(4.7, 16.9, 61.6);

const renderer = new THREE.WebGLRenderer({
    antialias: true,//抗锯齿
});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);


// 设置相机控件轨道控制器OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(4.02, 11.8, 0);
controls.update();

// 渲染循环
function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();

// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

const useSkyEnvironment = (env?: boolean) => {
    const sky = new Sky();
    scene.add(sky);
    sky.scale.setScalar(10000);
    scene.environment && (scene.environment.needsUpdate = true);
    const skyUniforms = sky.material.uniforms;
    skyUniforms["turbidity"].value = 1;
    skyUniforms["rayleigh"].value = 1;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const sun = new THREE.Vector3();

    sun.x = 0.1;
    sun.y = 0;
    sun.z = -1;
    sky.material.uniforms["sunPosition"].value.copy(sun);
}
useSkyEnvironment();

const dinosaurBox3 = new THREE.Box3();
//记录盒子的初始位置，方便重新开始还原初始位置
let dinosaurBox3InitialPMax: THREE.Vector3;
let dinosaurBox3InitialPMin: THREE.Vector3;

let isCollision = false; //是否碰撞中
let allowForward = true; //是否允许前进

let begin = false;  //点击开始按钮
let isGo = false;   //开始闯关
let isEnd = false;  //闯关结束
let dinasour: THREE.SkinnedMesh;  //小龙的蒙皮网格

const handelBegin = (event: PointerEvent) => {

    (event.target as HTMLButtonElement)?.blur();
    removeHurdles();  //删除障碍物
    initHurdles();   //重新初始化一组障碍物
    resetObject3DPosition();  //重制3D对象的位置

    begin = true;
    isGo = false;
    isEnd = false;
    allowForward = true;
}

//重制小龙、小龙盒子、相机、控制器的位置
const resetObject3DPosition = () => {
    dinosaurBox3.max.x = dinosaurBox3InitialPMax.x;
    dinosaurBox3.min.x = dinosaurBox3InitialPMin.x;
    if (dinasour) dinasour.position.x = 0;
    camera.position.x = 0;
    controls.target.set(4.02, 11.8, 0);
}

const loader = new ModelsLoad();
//加载小龙模型
loader.loadGltf("./gltf/dinosaur/dinosaur.glb").then((gltf) => {
    console.log('gltf:',gltf)
    scene.add(gltf.scene);
    dinasour = gltf.scene;
    //box3.setFromObject(gltf.scene);
    //添加碰撞盒子
    gltf.scene.traverse((node: THREE.SkinnedMesh) => {
        if (node.isSkinnedMesh) {
            //const mesh = node;
            node.frustumCulled = false;
            node.geometry.computeBoundingBox();
            dinosaurBox3.union(node.geometry.boundingBox!)
        }
    })
    dinosaurBox3InitialPMax = dinosaurBox3.max.clone();
    dinosaurBox3InitialPMin = dinosaurBox3.min.clone();
    scene.add(new THREE.Box3Helper(dinosaurBox3));

    //动画混合器
    const mixer = new THREE.AnimationMixer(gltf.scene);
    //获取待机动画
    const idle = gltf.animations.find((clip: THREE.AnimationClip) => {
        return clip.name == 'idle'
    });
    //获取碰撞动画
    const collision = gltf.animations.find((clip: THREE.AnimationClip) => {
        return clip.name == "collision"
    });
    //获取奔跑动画
    const run = gltf.animations.find((clip: THREE.AnimationClip) => {
        return clip.name == 'run'
    });

    const idleAction = mixer.clipAction(idle).play();  //执行动画片段
    const runAction = mixer.clipAction(run);
    const collisionAction = mixer.clipAction(collision);

    const clock = new THREE.Clock();
    //获取蒙皮网格
    const skinnedMesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
    const step = 0.2;
    skinnedMesh.onBeforeRender = () => {
        const delta = clock.getDelta();
        mixer.update(delta);
        if (!begin) return;

        if (!isGo) {
            //执行跑步动画
            isGo = true;
            runAction.play();
            runAction.enabled = true;
            runAction.time = 0;
            idleAction.crossFadeTo(runAction, 0.3, false);
        }

        if (gltf.scene.position.x < 180) {
            if (!allowForward) return;
            dinosaurBox3.min.x += step;
            dinosaurBox3.max.x += step;
            gltf.scene.position.x += step;
            camera.position.x += step;
            controls.target.x += step;
            controls.update();
        } else if (!isEnd) {
            //执行待机动画
            isEnd = true;
            idleAction.play();
            idleAction.enabled = true;
            idleAction.time = 0;
            runAction.crossFadeTo(idleAction, 0.3, false);
            ElMessage({
                message: '闯关成功，游戏结束。',
                type: 'success',
            })
        }

        const handleLoop = (e: any) => {
            collisionAction.play();  //执行碰撞动画
            isCollision = true;
            //碰撞动画执行一次后停止
            if (e.action == collisionAction) {
                collisionAction.stop();
                isCollision = false;
                mixer.removeEventListener('loop', handleLoop)
            }
        }

        //空格事件触发碰撞动画
        document.addEventListener('keypress', ({ code }) => {
            if (code == 'Space') {
                //循环监听动画
                mixer.addEventListener('loop', handleLoop);
            }
        })
    }
});

//记录障碍物的蒙皮网格、动画片段
let hurdleMesh: THREE.SkinnedMesh, hurdleAnimations: Array<THREE.AnimationClip>, existHurdleMeshs: Array<THREE.SkinnedMesh> = []
//障碍物处理
loader.loadGltf('./gltf/dinosaur/hurdle.glb').then((gltf => {
    gltf.scene.rotateY(-Math.PI / 2);
    gltf.scene.scale.set(0.15, 0.15, 0.15);
    gltf.scene.position.x += 15;
    gltf.scene.position.y -= 0.5;
    hurdleMesh = gltf.scene;
    hurdleAnimations = gltf.animations;
    //初始化一组障碍物
    initHurdles();
}))

const initHurdles = () => {
    const positionXTemplate = new Array(10).fill(0).map((_, index) => {
        return Math.random() * 10 + index * 15;
    });
    positionXTemplate.forEach(positionx => {
        const hurdle = new Hurdle(hurdleMesh.clone(true), hurdleAnimations, positionx, dinosaurBox3);
        scene.add(hurdle.root);
        existHurdleMeshs.push(hurdle.root);
    })
}
//移除障碍物
const removeHurdles = () => {
    existHurdleMeshs.forEach(mesh => {
        mesh.removeFromParent();
    })
    existHurdleMeshs.length = 0;
}

//加载环境贴图
loader.loadGltf("./gltf/dinosaur/dinosaur_env.glb").then((gltf) => {
    scene.add(gltf.scene);
});


//障碍物处理类
class Hurdle {
    constructor(public root: THREE.SkinnedMesh, animations: THREE.AnimationClip[], postionX: number, dinosaurBox3: THREE.Box3) {

        root.position.x += postionX;

        const upMixer = new THREE.AnimationMixer(root);
        const downMixer = new THREE.AnimationMixer(root);
        for (const animation of animations) {
            const mixer = animation.name.includes('_up') ? upMixer.clipAction(animation) : downMixer.clipAction(animation);
            //设置循环的次数，并保留最后的状态
            mixer.play().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true;
        }

        let mixer: THREE.AnimationMixer = upMixer;

        const clock = new THREE.Clock();
        const mesh = root.getObjectByName("立方体022") as THREE.Mesh

        //给障碍物设置碰撞盒子
        const box3 = new THREE.Box3().setFromObject(root);
        scene.add(new THREE.Box3Helper(box3));

        let alreadyDown = false;
        mesh.onBeforeRender = () => {
            if (!mixer) return;
            const delta = clock.getDelta();
            //检测二个盒子是否碰撞
            const intersect = dinosaurBox3.intersectsBox(box3);
            if (intersect) {
                if (isCollision) {  //是否触发碰撞
                    alreadyDown = true;
                    allowForward = true;
                } else if (!alreadyDown) {
                    allowForward = false;   //检测到碰撞，不允许前进，许要执行碰撞操作
                }
            }
            if (alreadyDown) {
                //碰撞了，并执行了碰撞操作，才执行碰撞动画
                downMixer.update(delta);
            }
            if (dinosaurBox3.distanceToPoint(root.position) < 3)
                upMixer.update(delta);
        };
    }
}


</script>

<style scoped lang="less">
.con {
    position: fixed;
    top: 20px;
    left: 50%;
    display: flex;
    flex-direction: column;

    .txt {
        color: #ccc;
        font-size: 12px;
        font-weight: bold;
        margin-top: 10px;
    }
}
</style>