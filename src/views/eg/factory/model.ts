import * as THREE from 'three';
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

//声明一个组对象，用来添加加载成功的三维场景
const model = new THREE.Group();

loader.load(
    // resource URL
    './gltf/factory.glb',
    function (gltf) {
        model.add(gltf.scene);
    }
);

export default model;