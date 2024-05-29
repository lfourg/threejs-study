// 引入Three.js
import * as THREE from 'three';
// 引入gltf模型加载库GLTFLoader.js
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import gui from '../gui.js';

//创建控制对象
const controlData = {
    shell: {
        color: new THREE.Color(0x6aa1b9),
        metalness: .8,
        roughness: .5,
        clearcoat: 1,
        clearcoatRoughness: .1,
        envMapIntensity: 2.5
    },
    glass: {
        metalness: 0,
        roughness: 0,
        envMapIntensity: 1,
        transmission: 1,
        ior: 1.5
    }
}


const loader = new GLTFLoader();
const model = new THREE.Group(); //声明一个组对象，用来添加加载成功的三维场景

//环境贴图
const textureCube = new THREE.CubeTextureLoader()
    .setPath('./纹理贴图/环境贴图1/')
    .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
textureCube.encoding = THREE.sRGBEncoding; //设置纹理贴图编码方式和WebGL渲染器一致   
// Load a glTF resource


export const loadGltf = (): Promise<any> => {
    return new Promise((res, rej) => {
        loader.load(
            './gltf/car.glb',
            function (gltf) {
                model.add(gltf.scene);
                //处理外壳材质
                dealShellMesh(model);
                //处理玻璃材质
                dealGlassMesh(model);
                res(gltf.scene);
            }
        )
    });
}

const shellNames = ['外壳01', '外壳02', '外壳03', '外壳04', '外壳05', '外壳06']
export const dealShellMesh = (group: THREE.Group) => {
    shellNames.forEach(name => {
        //外壳材质设置
        const mesh: THREE.Mesh = group.getObjectByName(name) as THREE.Mesh;
        if (mesh) {
            mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(controlData.shell.color),
                metalness: controlData.shell.metalness,  //金属度
                roughness: controlData.shell.roughness, //粗超度
                envMap: textureCube, //环境贴图
                envMapIntensity: controlData.shell.envMapIntensity, //环境贴图对Mesh表面影响程度
                clearcoat: controlData.shell.clearcoat, //物体表面的清漆层或透明层的厚度
                clearcoatRoughness: controlData.shell.clearcoatRoughness //透明图层表面的粗超度
            });
        }
    })

}

const glassNames = ['玻璃01', '玻璃00', '玻璃02', '玻璃03', '玻璃04', '玻璃05', '玻璃06', '玻璃07']
export const dealGlassMesh = (group: THREE.Group) => {

    //玻璃材质设置
    glassNames.forEach(name => {
        const mesh: THREE.Mesh = group.getObjectByName(name) as THREE.Mesh;
        if (mesh) {
            //玻璃材质设置
            mesh.material = new THREE.MeshPhysicalMaterial({
                metalness: controlData.glass.metalness,
                roughness: controlData.glass.roughness,
                envMap: textureCube,
                envMapIntensity: controlData.glass.envMapIntensity,
                transmission: controlData.glass.transmission,  //透光率
                ior: controlData.glass.ior //折射率
            })
        }
    })
}

export const addGUIFolder = () => {
    //创建材质子菜单
    const matFolder = gui.addFolder('车外壳材质');
    matFolder.addColor(controlData.shell, 'color');
    matFolder.add(controlData.shell, 'metalness', 0, 1);
    matFolder.add(controlData.shell, 'roughness', 0, 1);
    matFolder.add(controlData.shell, 'clearcoat', 0, 1);
    matFolder.add(controlData.shell, 'clearcoatRoughness', 0, 1);
    matFolder.add(controlData.shell, 'envMapIntensity', 0, 10);
    matFolder.close(); //关闭菜单
    const glassFolter = gui.addFolder('玻璃材质');
    glassFolter.add(controlData.glass, 'metalness', 0, 1);
    glassFolter.add(controlData.glass, 'roughness', 0, 1);
    glassFolter.add(controlData.glass, 'envMapIntensity', 0, 10);
    glassFolter.add(controlData.glass, 'transmission', 0, 1);
    glassFolter.add(controlData.glass, 'ior', 1, 2.3);
    glassFolter.close();
}

addGUIFolder();

export default model;
