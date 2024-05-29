import * as THREE from 'three';
import gsap from 'gsap';

export function modifyCityMaterial(mesh: THREE.Mesh, lineMode = 'spread') {

    mesh.material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>',
            `#include <dithering_fragment>
            //*end*
        `)
        addGradColor(shader, mesh);
        switch (lineMode) {
            case 'spread':
                addSpread(shader);
                break;
            case 'line':
                addLightLine(shader);
                break;
            case 'topLine':
                addToTopLine(shader);
        }
    }
}

function addGradColor(shader, mesh: THREE.Mesh) {

    mesh.geometry.computeBoundingBox();
    let { min, max } = mesh.geometry.boundingBox;
    //获取物体的高低差
    const uHeight = max.y - min.y;

    shader.uniforms.uTopColor = {
        value: new THREE.Color(0xffffff)
    }
    shader.uniforms.uHeight = {
        value: uHeight
    }
    shader.vertexShader = shader.vertexShader.replace('#include <common>',
        `#include <common>
    varying vec3 vPosition;
    `)
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
    vPosition = position;
    `)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>',
        `#include <common>
    uniform vec3 uTopColor;
    uniform float uHeight;
    varying vec3 vPosition;
    `)
    shader.fragmentShader = shader.fragmentShader.replace('//*end*',
        `vec4 distGradColor = gl_FragColor;

    //设置混合百分比
    float gradMix = (vPosition.y + uHeight/2.0)/uHeight;
    //计算混合颜色
    vec3 gradMixColor = mix(distGradColor.xyz,uTopColor,gradMix);
    gl_FragColor = vec4(gradMixColor,1);
    //*end*
    `)
}

//扩散光圈效果
function addSpread(shader) {
    //扩散的中心点
    shader.uniforms.uSpreadCenter = { value: new THREE.Vector2(0, 0) }
    //扩散的时间
    shader.uniforms.uSpreadTime = { vlaue: 0 }
    //扩展条带的宽度
    shader.uniforms.uSpreadWidth = { value: 20 }

    shader.fragmentShader = shader.fragmentShader.replace('#include <common>',
        `#include <common>
    uniform vec2 uSpreadCenter;
    uniform float uSpreadTime;
    uniform float uSpreadWidth;
    `)

    shader.fragmentShader = shader.fragmentShader.replace('//*end*',
        `
        float spreadRadius = distance(vPosition.xz,uSpreadCenter);
        //扩散范围的函数
        float spreadIndex = -(spreadRadius-uSpreadTime)*(spreadRadius-uSpreadTime)+uSpreadWidth;
        if(spreadIndex>0.0){
            gl_FragColor = mix(gl_FragColor,vec4(1,1,1,1),spreadIndex/uSpreadWidth);
        }
    //*end*
    `)

    gsap.to(shader.uniforms.uSpreadTime, {
        value: 800,
        duration: 2,
        ease: 'none',
        repeat: -1
    })
}

//左右扫光效果
function addLightLine(shader) {

    //扩散的时间
    shader.uniforms.uLightLineTime = { value: -800 }
    //扩展条带的宽度
    shader.uniforms.uLightLineWidth = { value: 50 }

    shader.fragmentShader = shader.fragmentShader.replace('#include <common>',
        `#include <common>
    uniform float uLightLineTime;
    uniform float uLightLineWidth;
    `)

    shader.fragmentShader = shader.fragmentShader.replace('//*end*',
        `
        //水平直线扫光
        //float lightLineMix = -(vPosition.x-uLightLineTime)*(vPosition.x-uLightLineTime)+uLightLineWidth;
        // 斜线扫光
        float lightLineMix = -(vPosition.x+vPosition.z-uLightLineTime)*(vPosition.x+vPosition.z-uLightLineTime)+uLightLineWidth;
        if(lightLineMix>0.0){
            gl_FragColor = mix(gl_FragColor,vec4(1,1,1,1),lightLineMix/uLightLineWidth);
        }
    //*end*
    `)

    gsap.to(shader.uniforms.uLightLineTime, {
        value: 800,
        duration: 2,
        ease: 'none',
        repeat: -1
    })
}

//向上扫光效果
function addToTopLine(shader) {

    //扩散的时间
    shader.uniforms.uToTopTime = { value: -100 }
    //扩展条带的宽度
    shader.uniforms.uToTopWidth = { value: 5 }

    shader.fragmentShader = shader.fragmentShader.replace('#include <common>',
        `#include <common>
    uniform float uToTopTime;
    uniform float uToTopWidth;
    `)

    shader.fragmentShader = shader.fragmentShader.replace('//*end*',
        `
        //向上扫光
        float toTopMix = -(vPosition.y-uToTopTime)*(vPosition.y-uToTopTime)+uToTopWidth;
       
        if(toTopMix>0.0){
            gl_FragColor = mix(gl_FragColor,vec4(1,1,1,1),toTopMix/uToTopWidth);
        }
    //*end*
    `)

    gsap.to(shader.uniforms.uToTopTime, {
        value: 100,
        duration: 3,
        ease: 'none',
        repeat: -1
    })
}