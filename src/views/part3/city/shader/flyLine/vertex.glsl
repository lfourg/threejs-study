attribute float aSize;
varying float vSize;
uniform float uTime;
uniform vec3 uColor;
uniform float uLength;

void main(){
    // 投影矩阵 * 视图矩阵 * 模型矩阵 * 顶点坐标
    vec4 viewPosition = viewMatrix * modelMatrix * vec4(position,1);
    gl_Position = projectionMatrix * viewPosition;

    vSize = (aSize-uTime);
    if(vSize<0.0){
        vSize = vSize+uLength;
    }
    vSize = (vSize-uLength/2.0)*0.7;
    //设置点的大小
    //gl_PointSize= vSize;
    //远离摄像头，点变小
    gl_PointSize = -vSize/viewPosition.z;
}