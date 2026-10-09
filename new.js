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
    x.globalAlpha=1;requestAnimationFrame(d);
  })(0);
})();

/* ---------- mur : placement sémantique, PAS une grille ---------- */
/* Chaque composant occupe une zone angulaire autour du centre ; les gros
   au centre, les petits en périphérie (loi : plus signalé = plus proche). */
function placeMur(){
  const mur=$('#mur'); if(!mur) return;
  mur.innerHTML='';
  const W=innerWidth,H=innerHeight,cx=W/2,cy=H*.44;
  rows.forEach((r,i)=>{
    const [k,n]=r, nMax=rows[0][1];
    // rayon : le plus signalé au centre, les autres s'éloignent
    const rad = (i===0?0: 90+ i*95 + Math.min(innerWidth,H)*.055);
    // angle : répartition dorée autour du centre
    const ang = -Math.PI/2 + i*2.399;   // phyllotaxe : angle d'or
    const jx=(Math.random()-.5)*40, jy=(Math.random()-.5)*40;
    const el=document.createElement('div');
    el.className='bsq';el.dataset.k=k;
    el.style.setProperty('--dx',(cx+Math.cos(ang)*rad+jx-W/2)+'px');
    el.style.setProperty('--dy',(cy+Math.sin(ang)*rad+jy-H/2)+'px');
    const d=Math.min(86, 30+n/nMax*58);
    el.innerHTML=`<div class="blk" style="--c:${COL[k]||'#8f8f9f'}">
      <div class="dot" style="--d:${d}px;--pt:${3+n/12}s;--pd:${i*.4}s"></div>
      <div class="bignum">${String(n).padStart(2,'0')}</div>
      <div class="lbl">${FR[k]||k}</div>
      <div class="pc">${Math.round(n/TOT*100)}%</div>
    </div>`;
    mur.appendChild(el);
  });
  // apparition en cascade, du centre vers la périphérie :
  [...mur.children].forEach((el,i)=>setTimeout(()=>el.classList.add('in'), 260+i*110));
}

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
  let orbs='';
  mr.slice(0,10).forEach((r,i)=>{
    const ring=(i===0?0:1+Math.floor(i/2.2));
    rad=ring;
  });
  orbs=`<div class="zringwrap" style="--col:${col}">${mr.slice(0,10).map((r,i)=>{
    const ring=i===0?0:1+Math.floor(i/2.2);
    const rad=ring===0?0:60+ring*52;
    const size=20+Math.round(r[1]/mt*52);
    const a=i*2.399; // angle d'or
    return `<div class="zmod ${i===0?'sun':'orbmod'}" style="left:calc(50% + ${Math.cos(a)*rad}px);top:calc(50% + ${Math.sin(a)*rad}px);--d:${size}px;--col:${col}"><span>${r[0].replace('iPhone ','')}</span><b>${Math.round(r[1]/mt*100)}%</b></div>`;
  }).join('')}</div>`;
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
