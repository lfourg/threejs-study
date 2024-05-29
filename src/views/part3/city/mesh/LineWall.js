import * as THREE from "three";
import gsap from "gsap";
import vertex from "../shader/wall/vertex.glsl?raw";
import fragment from "../shader/wall/fragment.glsl?raw";

export default class LineWall {
  constructor(position = new THREE.Vector3(0, 0, 0), radiu = 1,color=new THREE.Color(0x00ffff)) {
    //圆柱缓冲几何体
    this.geometry = new THREE.CylinderGeometry(
      radiu * 2,
      radiu * 2,
      1.2,
      32,
      1,
      true
    );
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(position);

    this.mesh.geometry.computeBoundingBox();
    let { min, max } = this.mesh.geometry.boundingBox;
    //获取物体的高低差
    const uHeight = max.y - min.y;
    this.material.uniforms.uHeight = {
      value: uHeight,
    };
    this.material.uniforms.uColor = {
        value:color
    }
    gsap.to(this.mesh.scale, {
      x: 1.2,
      z: 1.2,
      duration: 1,
      repeat: -1,
      ease: "none",
      yoyo: true,
    });
  }
}
