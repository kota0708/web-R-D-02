precision mediump float;

varying vec2 vUv;

void main(){
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
  vUv=vec2((position.x+1.)/2.,(-position.y+1.)/2.);
}