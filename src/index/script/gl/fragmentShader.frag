precision mediump float;

uniform float uTrans;
uniform float uOpacity;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImageResolution;

varying vec2 vUv;

void main(){
  // 正規化
  vec2 ratio=vec2(
    min((uResolution.x/uResolution.y)/(uImageResolution.x/uImageResolution.y),1.),
    min((uResolution.y/uResolution.x)/(uImageResolution.y/uImageResolution.x),1.)
  );
  
  // coverの処理
  vec2 uv=vec2(
    (vUv.x)*ratio.x+(1.-ratio.x)*.5,
    (vUv.y)*ratio.y+(1.-ratio.y)*.5
  );
  
  
  vec3 _texture2=texture2D(uTexture,vec2(.5,.5)+(uv-vec2(.5))*uTrans).rgb;
  
  gl_FragColor=vec4(_texture2, uOpacity);
}