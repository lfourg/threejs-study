import * as THREE from 'three';
import gsap from 'gsap';

export default class FlyLine{
    constructor(){
        const linePoints =[
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(6,4,0),
            new THREE.Vector3(12,0,0),
        ]
        //创建曲线
        this.lineCurve = new THREE.CatmullRomCurve3(linePoints);
        //根据曲线生成管道几何体
        this.geometry = new THREE.TubeGeometry(this.lineCurve,100,0.2,2,false);

        //添加纹理
        const textLoader = new THREE.TextureLoader();
        this.texture = textLoader.load('./textures/fly.png');
        this.texture.repeat.set(1,2);
        this.texture.wrapS = THREE.RepeatWrapping;  //这个值定义了纹理贴图在水平方向上将如何包裹，在UV映射中对应于U
        this.texture.wrapT = THREE.MirroredRepeatWrapping;  //这个值定义了纹理贴图在垂直方向上将如何包裹，在UV映射中对应于V。


        this.material = new THREE.MeshBasicMaterial({
            //color:new THREE.Color(0xfff000),
            map:this.texture,
            transparent:true,  //透明
        })
        //创建飞线
        this.mesh = new THREE.Mesh(this.geometry,this.material)

        //创建飞线动画
        gsap.to(this.texture.offset,{
            x:-1,
            duration:2,
            repeat:-1,
            ease:'none'
        })
    }
}