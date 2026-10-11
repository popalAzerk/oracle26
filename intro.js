/* ═══ INTRO SPECTACULAIRE 16:9 — style Apple Watch ═══
   Anneaux d'activité qui se remplissent avec les données réelles de la
   veille (SIGNALS 178 · NÉGATIFS 84 · CONFIANCE 75 %) + particules
   colorées orbitales. Boucle vidéo 10 s. Pointer-events transparent :
   rien ne bloque la vue. */
'use strict';
(function(){
  const cv=document.getElementById('introCv'); if(!cv) return;
  const x=cv.getContext('2d');
  const D=window.PULSE_DATA||{};
  const TOT=D.total||0, NEG=(D.sentiment||{}).negative||0,
        CONF=Math.round((D.avgConf||0.75)*100);
  const dpr=Math.min(window.devicePixelRatio||1,1.8);
  let W=0,H=0;
  function fit(){
    const w=cv.clientWidth||960, h=w*9/16;
    cv.style.height=h+'px';
    cv.width=w*dpr; cv.height=h*dpr;
    W=w; H=h;
  }
  fit(); window.addEventListener('resize',fit);

  /* particules orbitales colorées */
  const NP=420, PARTS=[];
  const PAL=['#00e0ff','#30d158','#bf5af2','#ff356e','#ff9f0a','#ffd60a'];
  for(let i=0;i<NP;i++){
    PARTS.push({a:Math.random()*Math.PI*2, r:0, tgtR:0,
      sp:.0016+Math.random()*.0026, sz:.8+Math.random()*1.6,
      col:PAL[i%PAL.length], w:Math.random()*Math.PI*2});
  }
  const CYC=10; // seconde de cycle
  const ease=(v)=>v<0?0:v>1?1:1-Math.pow(1-v,3);
  let t0=performance.now();
  (function loop(t){
    const S=(t-t0)/1000;
    const c=S%CYC;
    x.setTransform(dpr,0,0,dpr,0,0);
    x.clearRect(0,0,W,H);
    const cx=W/2, cy=H/2;
    /* — fond : halo dégradé coloré doux — */
    const bg=x.createRadialGradient(cx,cy,10,cx,cy,W*.62);
    bg.addColorStop(0,'rgba(0,224,255,.075)');
    bg.addColorStop(.45,'rgba(191,90,242,.05)');
    bg.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=bg; x.fillRect(0,0,W,H);
    /* — particules orbitales : s'écartent en spirale au fil du cycle — */
    const open=ease(Math.min(1,c/2.2));
    PARTS.forEach(p=>{
      p.a+=p.sp*16.7;
      const rg=R1*1.9+60+p.w*40;
      p.r=p.tgtR=open*rg;
      const px=cx+Math.cos(p.a)*p.r*1.25, py=cy+Math.sin(p.a)*p.r*.8;
      x.globalAlpha=open*.5;
      x.fillStyle=p.col;
      x.beginPath(); x.arc(px,py,p.sz,0,7); x.fill();
    });
    x.globalAlpha=1;
    /* — RINGS : remplissage séquentiel (batterie→négatifs→confiance) — */
    const R1=Math.min(W,H)*.19, R2=R1*.78, R3=R1*.56;
    const lw=Math.max(7,R1*.085);
    const f1=ease((c-1.0)/1.6), f2=ease((c-2.2)/1.6), f3=ease((c-3.4)/1.6);
    const fade=ease((c-(CYC-1.1))/1.1); // sortie douce
    function ring(r,f,col,lab,val,unit){
      x.lineCap='round';
      // piste :
      x.strokeStyle='rgba(255,255,255,.07)'; x.lineWidth=lw;
      x.beginPath(); x.arc(cx,cy,r,0,Math.PI*2); x.stroke();
      // remplissage :
      if(f>0){
        x.shadowColor=col; x.shadowBlur=16*f;
        x.strokeStyle=col; x.lineWidth=lw;
        x.beginPath(); x.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+f*Math.PI*2); x.stroke();
        x.shadowBlur=0;
        // tête lumineuse :
        const ha=-Math.PI/2+f*Math.PI*2;
        x.fillStyle='#fff';
        x.shadowColor=col; x.shadowBlur=12;
        x.beginPath(); x.arc(cx+Math.cos(ha)*r,cy+Math.sin(ha)*r,lw*.28,0,7); x.fill();
        x.shadowBlur=0;
      }
      // étiquette + valeur :
      x.textAlign='center';
      x.fillStyle=col; x.font='600 '+Math.max(9,W*.011)+'px ui-monospace';
      x.fillText(lab, cx, cy-r-lw*1.55+2);
      if(f>0.12){
        x.fillStyle='#eaf1f9'; x.font='800 '+Math.max(13,W*.021)+'px ui-monospace';
        x.fillText(Math.round(val*(f<1?f:1))+unit, cx, cy-r+lhOff(r)+2);
      }
    }
    const lhOff=(r)=>r*0+5; // petit offset sous l'archive
    x.globalAlpha=1-fade;
    ring(R1,f1,'#30d158','SIGNALS TOTAUX',TOT,' · '+Math.round(100*Math.min(1,f1))+' %');
    ring(R2,f2,'#ff356e','NÉGATIVITÉ',NEG,' · '+Math.round(100*Math.min(1,f2)*(NEG/TOT))+' %');
    ring(R3,f3,'#00e0ff','CONFIANCE',CONF,' %');
    /* — nombre central : le grand total — */
    if(f1>0.9){
      const pop=ease((c-2.9)/.9);
      x.globalAlpha=(1-fade)*pop;
      x.fillStyle='#fff'; x.font='800 '+Math.max(26,W*.055)+'px ui-monospace';
      x.fillText(TOT, cx, cy+lhOff(R3)+4);
      x.fillStyle='rgba(138,151,168,.9)'; x.font='600 '+Math.max(8,W*.0095)+'px ui-monospace';
      x.fillText('SIGNAUX CETTE SEMAINE', cx, cy+lhOff(R3)+W*.033);
    }
    x.globalAlpha=1;
    requestAnimationFrame(loop);
  })(t0);
})();
