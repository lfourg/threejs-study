uniform float uHeight;
varying vec3 vPosition;
uniform vec3 uColor;

void main(){
    //设置混合百分比
    float gradMix = (vPosition.y + uHeight/2.0)/uHeight;
    gl_FragColor = vec4(uColor,1.0-gradMix);
}