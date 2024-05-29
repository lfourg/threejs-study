<template>
    <div id="info"></div>
    <div id="map"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as THREE from 'three';
import map from "../../geoJson/china.json";
import * as d3geo from 'd3-geo';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// init
onMounted(() => {

    //场景
    const scene = new THREE.Scene();

    //相机
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.z = 1000;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true,preserveDrawingBuffer:true, });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    renderer.setAnimationLoop(animation);
    document.getElementById('map')?.appendChild(renderer.domElement);

    // animation
    function animation() {
        renderer.render(scene, camera);
    }

    //控制器
    new OrbitControls(camera, renderer.domElement);

    //转化成墨卡托坐标，设置中心点位置
    const position = d3geo.geoMercator().center([116.41995, 40.18994]).scale(800).translate([0, 0]);
    //循环画区域
    map.features.forEach(data => {
        if (data.geometry.type === "MultiPolygon") {
            data.geometry.coordinates.forEach(v => {
                v.forEach(c => {
                    renderMap(c, new THREE.Color(0xd13a34), data.properties);
                })
            })
        } else if (data.geometry.type === "Polygon") {
            data.geometry.coordinates.forEach(v => {
                renderMap(v, new THREE.Color(0Xd13a34), data.properties);
            })
        }

    })

    //画地图区域
    function renderMap(data, color, properties) {
        const point = [];
        const linePoints = [];
        data.forEach(value => {
            const [x, y] = position(value) ?? [0, 0]
            point.push(new THREE.Vector2(x, -y));
            linePoints.push(new THREE.Vector3(x, -y, 20));
        })

        const shape = new THREE.Shape(point);
        const extrudeSettings = {
            steps: 2,
            depth: 15,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 1
        };
        //从一个形状路径中，挤压出一个BufferGeometry
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        //geometry.center();
        //geometry.scale(50, 50, 50);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            opacity: 0.6,
            transparent: true
        })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.properties = properties;
        scene.add(mesh);


        //添加区块边框
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    //激活的网格对象
    let activeIntersects = []
    function onPointerMove(event) {


        const info = document.querySelector('#info');

        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // 通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(pointer, camera);

        if (activeIntersects.length) {
            for (let i = 0; i < activeIntersects.length; i++) {
                activeIntersects[i].object.material.color.set('#d13a34');
            }
            activeIntersects = []
        }

        // 计算物体和射线的焦点
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length && intersects[0].object.properties) {
            info.innerHTML = intersects[0].object.properties.name;
            info.style.left = event.clientX + "px";
            info.style.top = event.clientY + "px";
            info.style.display = "block";

        } else {
            info.style.display = "none";
        }

        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.type == 'Mesh') {
                activeIntersects.push(intersects[i]);
                intersects[i].object.material.color.set(0xff0000);
            }
        }

    }
    window.addEventListener('pointermove', onPointerMove);
})

</script>
<style scoped>
#map {
    background: #fff;
}

#info {
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 5px 10px;
    left: 0;
    top: 0;

}
</style>