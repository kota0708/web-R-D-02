precision mediump float;

#define PI 3.14159265359

uniform float uTrans;
uniform float uTime;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uDisp;
uniform vec2 uResolution;
uniform vec2 uImageResolution;

varying vec2 vUv;

float quarticInOut(float t){
  return t<.5
  ?+8.*pow(t,4.)
  :-8.*pow(t-1.,4.)+1.;
}

mat2 scale(vec2 _scale){
  return mat2(_scale.x,0.,
  0.,_scale.y);
}

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
  
  // 切り替え時に使うテクスチャー
  vec4 disp=texture2D(uDisp,vec2(.5,.5)+(uv-vec2(.5,.5)));
  
  // hover時に変化させる値
  float trans=clamp(2.*uTrans-disp.r,0.,1.);
  trans=trans=quarticInOut(trans);
  
  // 初期時のテクスチャー
  vec4 _texture1=vec4(0,0,0,0);
  
  // 切り替え時のテクスチャー
  vec4 _texture2=texture2D(uTexture1,vec2(.5,.5)+(uv-vec2(.5))*scale(vec2(1.-sin((1.-trans)*.8))));
  
  gl_FragColor=mix(_texture1,_texture2,quarticInOut(uTrans));
}