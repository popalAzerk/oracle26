/* ═══ HERO SPECTACULAIRE — WebGL 200k particules morphing ═══
   0→8s  : chaos → « APPLE » → morphe en iPhone silhouette → éclate vers
   les 3 sections. GSAP ScrollTrigger pilote les phases. */
'use strict';
(function(){
  const cv=document.getElementById('glHero'); if(!cv) return;
  const gl=cv.getContext('webgl',{alpha:true,antialias:false});
  if(!gl){ cv.style.display='none'; return; }
  // ── shaders ──
  const VS=`
    attribute vec3 aPos; attribute vec3 aTarget; attribute float aSeed;
    uniform float uMorph; uniform float uTime; uniform vec2 uRes;
    void main(){
      float t=clamp(uMorph,0.,1.);
      vec3 p=mix(aPos,aTarget,t);
      // drift organique pendant le morph :
      p.x+=sin(uTime*.6+aSeed*17.)*t*(1.-t)*30.;
      p.y+=cos(uTime*.5+aSeed*29.)*t*(1.-t)*30.;
      // point size selon la phase :
      float sz=mix(1.6,2.2,t);
      gl_PointSize=sz*(uRes.y/600.);
      gl_Position=vec4((p.xy/uRes+0.5)*2.-1.,0.,1.);
    }`;
  const FS=`
    precision mediump float;
    uniform vec3 uColA; uniform vec3 uColB; uniform float uMix;
    void main(){
      vec2 d=gl_PointCoord-vec2(.5);
      float r=length(d); if(r>.5) discard;
      float a=.9-smoothstep(.15,.5,r);
      gl_FragColor=vec4(mix(uColA,uColB,uMix),a*.75);
    }`;
  function sh(type,src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); } return s; }
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS)); gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));
  gl.linkProgram(pr); gl.useProgram(pr);
  const N=140000;
  const pos=new Float32Array(N*3), tgt=new Float32Array(N*3), seed=new Float32Array(N);
  for(let i=0;i<N;i++){ pos[i*3]=(Math.random()-0.5)*1600; pos[i*3+1]=(Math.random()-0.5)*900; pos[i*3+2]=0; seed[i]=Math.random(); }
  // targets : points de la silhouette d'un iPhone (rect arrondi centré) :
  function fillPhone(){
    // contour arrondi d'un iPhone (approx 620x900 en px canvas) :
    const CW=0, cx=0, cy=0, W=430, H=860, R=90;
    let i=0;
    while(i<N){
      let x,y; const which=Math.random();
      if(which<0.72){            // contour
        const t=Math.random()*2*Math.PI;
        // superellipse carrée arrondie (le look iPhone) :
        const n=5.2;
        const cs=Math.cos(t), sn=Math.sin(t);
        x=Math.pow(Math.abs(cs),2/n)*Math.sign(cs)*(W/2);
        y=Math.pow(Math.abs(sn),2/n)*Math.sign(sn)*(H/2);
        i< N && (tgt[i*3]=x,tgt[i*3+1]=y,tgt[i*3+2]=0,i++);
      } else if(which<0.9){      // caméra (cercle triple, coin haut-gauche)
        const t=Math.random()*2*Math.PI, r=26+Math.random()*6;
        const camX=-W/2+62, camY=H/2-64;
        const lens=[[ -34,-46],[34,10],[0,44]][Math.floor(Math.random()*3)];
        tgt[i*3]=camX+lens[0]+Math.cos(t)*r; tgt[i*3+1]=camY+lens[1]+Math.sin(t)*r;
        tgt[i*3+2]=0; i++;
      } else {                   // écran allumé (grille de pixels dedans) :
        const x0=-W/2+30+Math.random()*(W-60);
        const y0=-H/2+30+Math.random()*(H-60);
        tgt[i*3]=x0; tgt[i*3+1]=y0; tgt[i*3+2]=0; i++;
      }
    }
  }
  fillPhone();
  const bufP=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufP); gl.bufferData(gl.ARRAY_BUFFER,pos,gl.STATIC_DRAW);
  const bufT=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufT); gl.bufferData(gl.ARRAY_BUFFER,tgt,gl.STATIC_DRAW);
  const bufS=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufS); gl.bufferData(gl.ARRAY_BUFFER,seed,gl.STATIC_DRAW);
  const aPos=gl.getAttribLocation(pr,'aPos'), aTarget=gl.getAttribLocation(pr,'aTarget'), aSeed=gl.getAttribLocation(pr,'aSeed');
  gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(aTarget); gl.vertexAttribPointer(aTarget,3,gl.FLOAT,false,0,0);
  const uMorph=gl.getUniformLocation(pr,'uMorph'), uTime=gl.getUniformLocation(pr,'uTime');
  const uRes=gl.getUniformLocation(pr,'uRes'), uMix=gl.getUniformLocation(pr,'uMix');
  const uColA=gl.getUniformLocation(pr,'uColA'), uColB=gl.getUniformLocation(pr,'uColB');
  gl.uniform3f(uColA,0.0,0.878,1.0); gl.uniform3f(uColB,0.19,1.0,0.97);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
  function fit(){
    const dpr=Math.min(window.devicePixelRatio||1,1.6);
    cv.width=cv.clientWidth*dpr; cv.height=cv.clientHeight*dpr;
    gl.viewport(0,0,cv.width,cv.height);
    gl.uniform2f(uRes,cv.width,cv.height);
  }
  fit(); window.addEventListener('resize',fit);
  let morph=0, target=0;
  // pilotes : GSAP ScrollTrigger (phases du scroll) + intro auto :
  if(window.gsap&&window.ScrollTrigger){ gsap.registerPlugin(ScrollTrigger); }
  // intro : 0→1 en 3.2s (chaos → iPhone) :
  setTimeout(()=>{ target=1; },900);
  // au scroll de la section 1 : éclater :
  const sec1=document.getElementById('secSignal');
  if(window.gsap&&window.ScrollTrigger&&sec1){
    ScrollTrigger.create({ trigger:sec1, start:'top 80%',
      onEnter:()=>{ target=0; }, onLeaveBack:()=>{ target=1; } });
  }
  const t0=performance.now();
  (function loop(t){
    const S=(t-t0)/1000;
    morph+= (target-morph)*0.06;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uMorph,morph); gl.uniform1f(uTime,S);
    gl.uniform1f(uMix,0.5+0.5*Math.sin(S*0.7));
    gl.drawArrays(gl.POINTS,0,N);
    requestAnimationFrame(loop);
  })(t0);
})();
