### Texture

#### magFilter、minFilter
当一个纹素覆盖大于或小于一个像素时，贴图将如何采样，用来设置纹理的放大或缩小模式。

## Material

### MeshBasicMaterial

#### aoMap
用于环境遮挡贴图，物体需要设置第二组uv
eg: boxGeometry.setAttribute('uv2', new THREE.BufferAttribute(boxGeometry.attributes.uv.array,2));

#### PBR
1.PBR是基于物理渲染的着色模型，PBR着色模型分为材质和灯光两个属性。  
2.材质部分由:基础色、法线、高光、粗糙度、金属度来定义材质表面属性的。  
3.灯光部分是由:直接照明、间接照明、直接高光。间接高光、阴影、环境光闭塞来定义照明属性的。
4.通常我们写材质的时候只需要关注材质部分的属性即可，灯光属性都是引擎定义好的直接使用即可。
5.PBR渲染模型不但指的是PBR材质，还有灯光，两者缺一不可。

#### displacementMap
置换特贴，会影响网格顶点的位置，与仅影响材质的光照和阴影的其他贴图不同，移位的顶点可以投射阴影，阻挡其他对象， 以及充当真实的几何体。

#### roughness 
粗糙度

#### normalMap
法线贴图，法线贴图就是这个点所在面的切线朝向，这个朝向决定了怎么反射这个光。

#### *.hdr
表示的也是图片格式，就是带明暗度的一张图片。