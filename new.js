/* ===== PULSE 3 — le signal comme matière ===== */
'use strict';
const D = window.PULSE_DATA || {}, MC = window.PULSE_MODEL_COUNTS || {}, SRC = (window.PULSE_SOURCES||{}).sources || {};
const COL = {battery:'#30d158',screen:'#2997ff',charging:'#ffd60a',cosmetic:'#ff356e',audio:'#bf5af2',buttons:'#8e8e93',network:'#30b0c7',camera:'#ff453a'};
const FR  = {battery:'Batterie',screen:'Écran',charging:'Charge',cosmetic:'Esthétique',audio:'Audio',buttons:'Boutons',network:'Réseau',camera:'Caméra'};
const $ = s => document.querySelector(s);
const rows = Object.entries(D.counts||{}).sort((a,b)=>b[1]-a[1]);
const TOT = rows.reduce((s,r)=>s+r[1],0)||1;

/* ---------- scène 3D (canvas) : étoiles + courbure ---------- */
(function(){
  const c=$('#fx'), x=c.getContext('2d');
  let W,H,stars=[];
  function sz(){W=c.width=innerWidth;H=c.height=innerHeight;
    stars=Array.from({length:Math.min(W*H/9000,160)},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random(),m:Math.random()<.1}));
  }
  sz();addEventListener('resize',sz);
  (function d(t){
    x.clearRect(0,0,W,H);
    for(const s of stars){
      const a=.25+.55*Math.abs(Math.sin(t/1800*s.z*4+s.x));
      x.beginPath();x.arc(s.x,s.y,s.z*1.2+.3,0,6.29);
      x.fillStyle=s.m?'#ff356e':'#35f0ff';x.globalAlpha=a*.7;x.fill();
    }
    // maille constellation : les étoiles proches se relient
    x.lineWidth=1;
    for(let i=0;i<stars.length;i++)for(let j=i+1;j<stars.length;j++){
      const A=stars[i],B=stars[j],dx2=A.x-B.x,dy2=A.y-B.y;
      if(Math.abs(dx2)>130) break;
      const d=Math.hypot(dx2,dy2);
      if(d<130){x.beginPath();x.moveTo(A.x,A.y);x.lineTo(B.x,B.y);x.globalAlpha=(1-d/130)*.13;x.stroke();}
    }
    x.globalAlpha=1;requestAnimationFrame(d);
  })(0);
})();

/* ---------- mur : placement sémantique, PAS une grille ---------- */
/* Chaque composant occupe une zone angulaire autour du centre ; les gros
   au centre, les petits en périphérie (loi : plus signalé = plus proche). */
let NODES=[];
function placeMur(){
  const mur=$('#mur'); if(!mur) return;
  mur.innerHTML='';
  const W=innerWidth,H=innerHeight,cx=W/2,cy=H*.44;
  const RMAX=Math.min(W,H)*.38;
  // — MAILLAGE RÉSEAU : hub central + composants sur 2 couronnes —
  NODES=[];
  const hub=document.createElement('div');
  hub.className='hub';
  hub.style.setProperty('--hx',cx+'px');hub.style.setProperty('--hy',cy+'px');
  hub.innerHTML=`<div class="hubcore"><b>${TOT}</b><span>SIGNAL</span></div>`;
  mur.appendChild(hub);
  NODES.push({el:hub,k:'__hub',base:{x:cx,y:cy},drift:{px:Math.random()*6.28,amp:5,sp:.0009}});
  const A1=[-90,40,150,255].map(a=>a*Math.PI/180),
        A2=[-35,80,190,300].map(a=>a*Math.PI/180);
  rows.forEach((r,i)=>{
    const big=i<4, slot=i%4;
    const rad=big?RMAX*.62:RMAX*.95;
    const ang=(big?A1:A2)[slot]+(Math.random()-.5)*.12;
    const [k,n]=r, nMax=rows[0][1];
    const el=document.createElement('div');
    el.className='bsq';el.dataset.k=k;
    el.style.setProperty('--dx',(cx+Math.cos(ang)*rad)+'px');
    el.style.setProperty('--dy',(cy+Math.sin(ang)*rad)+'px');
    const d=Math.min(84, 32+n/nMax*52);
    el.innerHTML=`<div class="blk" style="--c:${COL[k]||'#8f8f9f'}">
      <div class="dot" style="--d:${d}px;--pt:${(3+n/12).toFixed(1)}s;--pd:${(slot*.35).toFixed(2)}s"></div>
      <div class="bignum">${String(n).padStart(2,'0')}</div>
      <div class="lbl">${FR[k]||k}</div>
      <div class="pc">${Math.round(n/TOT*100)}%</div>
    </div>`;
    mur.appendChild(el);
    NODES.push({el,k,base:{x:cx+Math.cos(ang)*rad,y:cy+Math.sin(ang)*rad},
      drift:{px:Math.random()*6.28,amp:10+Math.random()*8,sp:.0006+Math.random()*.0004}});
  });
  [...mur.children].forEach((el,i)=>setTimeout(()=>el.classList.add('in'),260+i*90));
}

/* ---------- maillage vivant : arêtes + paquets de données ---------- */
(function(){
  const cn=$('#net'); if(!cn) return;
  const x=cn.getContext('2d');
  let W,H;
  function sz(){W=cn.width=innerWidth;H=cn.height=innerHeight;}
  sz();addEventListener('resize',sz);
  function edges(){
    const out=[];
    if(NODES.length<2) return out;
    const hub=NODES[0];
    for(let i=1;i<NODES.length;i++) out.push([hub,NODES[i]]);
    for(const [a,b] of [['battery','charging'],['battery','cosmetic'],['screen','cosmetic'],['audio','buttons']]){
      const A=NODES.find(n=>n.k===a), B=NODES.find(n=>n.k===b);
      if(A&&B) out.push([A,B]);
    }
    return out;
  }
  const pulses=[];
  function tick(t){
    x.clearRect(0,0,W,H);
    for(const n of NODES){
      n.cur={x:n.base.x+Math.sin(t*n.drift.sp+n.drift.px)*n.drift.amp+PLX,
             y:n.base.y+Math.cos(t*n.drift.sp*1.13+n.drift.px*1.7)*n.drift.amp+PLY};
      if(n.k!=='__hub'){
        n.el.style.setProperty('--dx',n.cur.x.toFixed(1)+'px');
        n.el.style.setProperty('--dy',n.cur.y.toFixed(1)+'px');
      } else {
        n.el.style.setProperty('--hx',n.cur.x.toFixed(1)+'px');
        n.el.style.setProperty('--hy',n.cur.y.toFixed(1)+'px');
      }
    }
    const es=edges();
    es.forEach(([A,B])=>{
      x.beginPath();x.moveTo(A.cur.x,A.cur.y);x.lineTo(B.cur.x,B.cur.y);
      x.strokeStyle='rgba(74,227,255,.16)';x.lineWidth=1;x.stroke();
    });
    if(pulses.length<6 && Math.random()<.06){
      const e=Math.floor(Math.random()*es.length);
      pulses.push({e,t:0,sp:.004+Math.random()*.006,col:e>=es.length-4?'#ff2ea6':'#35f0ff'});
    }
    for(let j=pulses.length-1;j>=0;j--){
      const p=pulses[j], L=es[p.e];
      if(!L||!L[0].cur){pulses.splice(j,1);continue;}
      p.t+=p.sp;
      if(p.t>=1){pulses.splice(j,1);continue;}
      const [A,B]=L, px=A.cur.x+(B.cur.x-A.cur.x)*p.t, py=A.cur.y+(B.cur.y-A.cur.y)*p.t;
      x.beginPath();x.arc(px,py,2.4,0,6.29);
      x.fillStyle=p.col;x.shadowColor=p.col;x.shadowBlur=9;x.globalAlpha=.9;x.fill();
      x.globalAlpha=1;x.shadowBlur=0;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* parallax : offsets partagés (souris → tout le maillage suit) */
let PLX=0, PLY=0;
addEventListener('mousemove',e=>{
  PLX=(e.clientX/innerWidth-.5)*-18;
  PLY=(e.clientY/innerHeight-.5)*-14;
},{passive:true});

/* ---------- HUD ---------- */
(function(){
  const up=D.updated||'--';
  $('#hudr').innerHTML=`<div class="clock">${'--:--:--'}</div><div class="maj">MAJ ${up}</div>`;
  $('#hudb').innerHTML=`<div class="tot-lbl">SIGNAL TOTAL</div><div class="tot">${TOT}<small> MENTIONS</small></div>`;
  $('#legende').innerHTML=rows.map(r=>`<span class="lg" style="--c:${COL[r[0]]}" data-jump="${r[0]}"><i></i>${FR[r[0]]}</span>`).join('');
  setInterval(()=>{const e=$('#hudr .clock');if(e)e.textContent=new Date().toTimeString().slice(0,8);},1000);
  $('#legende').addEventListener('click',e=>{
    const lg=e.target.closest('.lg'); if(!lg)return; openZoom(lg.dataset.jump);
  });
})();

/* ---------- zoom (clic sur un bloc/légende) ---------- */
let curCat=null;
function openZoom(k){
  curCat=k;
  const col=COL[k]||'#8f8f9f', z=$('#zoom');
  // modèles de cette cat :
  const mr=Object.entries(MC).map(([m,pr])=>[m,pr[k]||0]).filter(r=>r[1]>0).sort((a,b)=>b[1]-a[1]);
  const mt=mr.reduce((s,r)=>s+r[1],0)||1;
  // répartition orbitale des modèles : cercles concentriques (les cités
  // souvent = orbite interne). Rayon ∝ rang, taille ∝ part.
  const orbs=(()=>{
    const MAXR=200;
    let rings='', mods='', seen={};
    mr.slice(0,10).forEach((r,i)=>{
      const ring=i<3?1:(i<6?2:3);
      const rad=Math.round(MAXR*ring/3.4)+18;
      const size=Math.max(16,Math.round(16+r[1]/mt*40));
      if(!seen[ring]){ seen[ring]={n:0}; rings+=`<div class="zring" style="width:${rad*2}px;height:${rad*2}px"></div>`; }
      // répartition RÉGULIÈRE par ring (pas d'angle d'or intra-ring = pas de
      // clusters) : angle = base du ring + pas régulier
      const perRing = ring===1?3:(ring===2?3:4);
      const base = ring===1?-90:(ring===2?0:-90);
      const slot = seen[ring].n++;
      const a = (base + slot*(360/perRing))*Math.PI/180;
      mods+=`<div class="zmod" style="left:calc(50% + ${Math.round(Math.cos(a)*rad)}px);top:calc(50% + ${Math.round(Math.sin(a)*rad)}px);--d:${size}px;--col:${col}"><b></b><span>${r[0].replace('iPhone ','')}</span><i class="zp">${Math.round(r[1]/mt*100)} %</i></div>`;
    });
    return `<div class="zringwrap">${rings}${mods}</div>`;
  })();
  // verbatims + presse :
  const exs=(D.examples||{})[k]||[], pres=SRC[k]||[];
  const flux = (exs.length?`<div class="flxt">Comment les clients le vivent</div>`+exs.map(v=>{
    const t=(v&&v.text_tr)||v&&v.text||v||'';return `<p class="flx" style="--c:${col}">${String(t).slice(0,290)}<span class="fsrc">signal client</span></p>`;}).join(''):'')
    +(pres.length?`<div class="flxt">Dans la presse</div>`+pres.slice(0,3).map(a=>
      `<a class="press" style="--c:${col}" href="${a.url}" target="_blank" rel="noopener"><span class="pt">${a.title}</span><span class="pm">${a.date||''} · ${a.src} →</span></a>`).join(''):'');
  $('#zin').innerHTML=`<div class="zhead"><div class="zc">COMPOSANT ${String(rows.findIndex(r=>r[0]===k)+1).padStart(2,'0')} / ${String(rows.length).padStart(2,'0')} · ${Math.round((D.counts[k]||0)/TOT*100)}% DU SIGNAL</div><h2 style="text-shadow:0 0 26px ${col}44">${FR[k]}</h2></div>
  <div class="zbody"><div class="zmodels" style="--c:${col}">${orbs}</div><div class="zflux" style="--c:${col}">${flux||'<p style="color:var(--t3)">Aucun signal texte pour ce composant.</p>'}</div></div>
  <button id="zclose">✕ FERMER</button>`;
  // wiring close :
  $('#zclose').onclick=closeZoom;
  requestAnimationFrame(()=>z.classList.add('on'));
}
function closeZoom(){
  $('#zoom').classList.remove('on');
  curCat=null;
}

/* parallax souris : le mur flotte en contrecoup (profondeur) */
(function(){
  const mur=$('#mur');
  addEventListener('mousemove',e=>{
    const nx=(e.clientX/innerWidth-.5), ny=(e.clientY/innerHeight-.5);
    mur.style.transform=`translate(${(-nx*18).toFixed(1)}px, ${(-ny*14).toFixed(1)}px)`;
  }, {passive:true});
})();

/* clic sur un bloc du mur : */
document.addEventListener('click',e=>{
  const b=e.target.closest('.bsq'); if(!b||$('#zoom').classList.contains('on'))return;
  openZoom(b.dataset.k);
});
/* ÉCHAP : fermer */
addEventListener('keydown',e=>'Escape'===e.key&&closeZoom());

/* ---------- intro ---------- */
(function(){
  const bar=$('#intro .ibar i');let p=0;
  const iv=setInterval(()=>{p=Math.min(1,p+.05+Math.random()*.06);bar.style.width=p*100+'%';
    if(p>=1){clearInterval(iv);setTimeout(()=>{$('#intro').classList.add('off');placeMur();},320);}},70);
})();
