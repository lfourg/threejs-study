import * as THREE from 'three';
import gsap from 'gsap';
import vertex from '../shader/flyLine/vertex.glsl?raw';
import fragment from '../shader/flyLine/fragment.glsl?raw';

export default class FlyLineShader{
    constructor(){
        //根据点生成曲线
        const linePoints =[
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(-6,4,0),
            new THREE.Vector3(-12,0,0),
        ]
        //创建曲线
        this.lineCurve = new THREE.CatmullRomCurve3(linePoints);
        const points = this.lineCurve.getPoints(1000);
        
        //创建几何顶点
        this.geometry = new THREE.BufferGeometry().setFromPoints(points)

        //给每个点设置属性
        const aSizeArray = new Float32Array(points.length);
        for(let i=0;i<aSizeArray.length;i++){
            aSizeArray[i] = i;
        }
        this.geometry.setAttribute('aSize',new THREE.BufferAttribute(aSizeArray,1))

        //设置着色器材质
        this.material = new THREE.ShaderMaterial({
            uniforms:{
                uTime:{
                    value:0
                },
                uColor:{
                    value:new THREE.Color(0xffff00)
                },
                uLength:{
                    value:aSizeArray.length
                }
            },
            vertexShader:vertex,
            fragmentShader:fragment,
            transparent:true,
            depthWrite:false,  //深度检测去掉
            blending:THREE.AdditiveBlending  //混合模式
        })

        this.mesh = new THREE.Points(this.geometry,this.material)

        //uTime控制动画
        gsap.to(this.material.uniforms.uTime,{
            value:1000,
            duration:1,
            ease:'none',
            repeat:-1
        })
    }
}