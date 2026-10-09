/* ===== PULSE 2.0 — cartes + noyau réseau ===== */
'use strict';
window.__PULSE2_LOADS=(window.__PULSE2_LOADS||0)+1;
const D = window.PULSE_DATA || {}, MC = window.PULSE_MODEL_COUNTS || {}, SRC = (window.PULSE_SOURCES||{}).sources || {};
const COL = {battery:'#30d158',screen:'#2997ff',charging:'#ffd60a',cosmetic:'#ff356e',audio:'#bf5af2',buttons:'#8e8e93',network:'#30b0c7',camera:'#ff9f0a'};
const FR  = {battery:'Batterie',screen:'Écran',charging:'Charge',cosmetic:'Esthétique',audio:'Audio',buttons:'Boutons',network:'Réseau',camera:'Caméra'};
const $ = s => document.querySelector(s);
const rows = Object.entries(D.counts||{}).sort((a,b)=>b[1]-a[1]);
const TOT = rows.reduce((s,r)=>s+r[1],0)||1;
const NAV = typeof navigator!=='undefined'?navigator:{userAgent:''};
const TOUCH = 'ontouchstart' in window;

/* ---------- fond : maillage discret (canvas, sobre) ---------- */
(function(){
  const c=$('#fx'), x=c.getContext('2d');
  let W,H,dots=[];
  function sz(){
    W=c.width=innerWidth;H=c.height=innerHeight;
    dots=Array.from({length:Math.round(W*H/38000)},()=>({
      x:Math.random()*W, y:Math.random()*H,
      ph:Math.random()*6.28, sp:.0004+Math.random()*.0006}));
  }
  sz();addEventListener('resize',sz);
  (function d(t){
    x.clearRect(0,0,W,H);
    // maillage : points proches reliés (finesse maximale)
    x.lineWidth=1;
    for(let i=0;i<dots.length;i++)for(let j=i+1;j<dots.length;j++){
      const A=dots[i],B=dots[j],dx=A.x-B.x,dy=A.y-B.y,dd=dx*dx+dy*dy;
      if(dd<22500){
        const pA=.5+.5*Math.sin(t*A.sp+A.ph), pB=.5+.5*Math.sin(t*B.sp+B.ph);
        x.strokeStyle='rgba(80,210,240,'+(0.028+.05*Math.min(pA,pB)).toFixed(3)+')';
        x.beginPath();x.moveTo(A.x,A.y);x.lineTo(B.x,B.y);x.stroke();
      }
    }
    for(const p of dots){
      const pu=.5+.5*Math.sin(t*p.sp+p.ph);
      x.beginPath();x.arc(p.x,p.y,1.1,0,6.29);
      x.fillStyle='rgba(110,225,255,'+(.1+.28*pu).toFixed(3)+')';x.fill();
    }
    requestAnimationFrame(d);
  })(0);
})();

/* ---------- jauge du noyau (arcs brisés, style instrument) ---------- */
(function(){
  const svg=$('.cjarcs'), r=Math.random;
  function ring(cx,cy,rad,n,rev){
    let out='', a=r()*6.28;
    for(let i=0;i<n;i++){
      const span=.5+r()*1.5, w=i%2?2.4:1;
      const a0=a, a1=a+span; a=a1+.3+r()*.7;
      const x0=cx+Math.cos(a0)*rad, y0=cy+Math.sin(a0)*rad,
            x1=cx+Math.cos(a1)*rad, y1=cy+Math.sin(a1)*rad,
            large=a1-a0>Math.PI?1:0;
      out+=`<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rad} ${rad} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="rgba(110,230,255,${(.3+r()*.4).toFixed(2)})" stroke-width="${w}" fill="none"/>`;
      if(r()<.5){
        const t1x=cx+Math.cos(a1)*(rad-5), t1y=cy+Math.sin(a1)*(rad-5),
              t2x=cx+Math.cos(a1)*(rad+5), t2y=cy+Math.sin(a1)*(rad+5);
        out+=`<line x1="${t1x.toFixed(1)}" y1="${t1y.toFixed(1)}" x2="${t2x.toFixed(1)}" y2="${t2y.toFixed(1)}" stroke="rgba(160,240,255,.65)" stroke-width="1.2"/>`;
      }
      if(r()<.4) out+=`<rect x="${(cx+Math.cos(a0)*rad-1.7).toFixed(1)}" y="${(cy+Math.sin(a0)*rad-1.7).toFixed(1)}" width="3.4" height="3.4" fill="rgba(180,248,255,.55)"/>`;
    }
    return out;
  }
  let arcs=ring(100,100,66,4)+`<g class="rev">${ring(100,100,88,3)}</g>`;
  // peigne = histogramme radial : 1 barre par cat, hauteur ∝ mentions
  const nMax=Math.max(...rows.map(r2=>r2[1]));
  rows.forEach(([k,n],i)=>{
    const an=-2.2+i*.19, hh=Math.max(5,(n/nMax)*30),
          w1=3, bx=100+Math.cos(an)*56, by=100+Math.sin(an)*56,
          dx=Math.cos(an), dy=Math.sin(an),
          px=bx-dy*(w1/2), py=by+dx*(w1/2);
    const cc=(COL[k]||'#8f8f9f').match(/^#(..)(..)(..)$/);
    const cr=parseInt(cc[1],16),cg=parseInt(cc[2],16),cb=parseInt(cc[3],16);
    arcs+=`<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="4.5" height="${hh.toFixed(1)}" fill="rgba(${cr},${cg},${cb},.85)" transform="rotate(${(an*57.3).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)})"/>`;
  });
  svg.innerHTML=arcs;
})();

/* ---------- cartes autour du noyau ---------- */
const CARDS=[];
function buildCards(){
  const wrap=$('#cards');
  const W=innerWidth, H=innerHeight;
  wrap.innerHTML='';CARDS.length=0;
  rows.forEach(([k,n],i)=>{
    const el=document.createElement('div');
    el.className='card';el.dataset.k=k;
    // colonnes gauche/droite, 4 lignes : le noyau reste libre au centre
    // large : gouttière 380px · étroit (mobile) : 2 colonnes collées au bord
    const col=i%2, row=Math.floor(i/2);
    const narrow = W<760;
    const offset = narrow? Math.min(W*.5-90, 120) : 380;
    const colX = col===0? W*.5-offset : W*.5+offset;
    const colY = (narrow? H*.30 : H*.10) + row*((narrow? H*.62 : H*.62)/3);
    el.style.left=colX+'px';el.style.top=colY+'px';
    el.style.setProperty('--c',COL[k]||'#8f8f9f');
    el.style.setProperty('--pd',(i*.09+0.15)+'s');
    const pct=Math.round(n/TOT*100);
    el.innerHTML=`
      <div class="chead"><span class="chk"></span><span class="ct">${FR[k]||k}</span><span class="ck">${String(i+1).padStart(2,'0')}</span></div>
      <div class="cbody"><span class="cbig">${String(n).padStart(2,'0')}</span><span class="cpc">${pct}%</span></div>
      <div class="cspark">${sparkBars(k)}</div>
      <div class="cprog"><i></i></div>
      <div class="cfoot"><span><span class="clive"></span>ACTIF</span><b>&#9656; ${Object.keys(MC[k]||{}).length||0} MODÈLES</b></div>`;
    wrap.appendChild(el);
    const bar=el.querySelector('.cprog i');
    setTimeout(()=>{bar.style.width=pct+'%';}, 400+i*120);
    // mini-graph : barres modèles montent en cascade après la carte
    el.querySelectorAll('.sp i').forEach((si,j)=>{
      setTimeout(()=>{ si.style.width=si.style.getPropertyValue('--w'); }, 700+i*120+j*90);
    });
    el.addEventListener('click',()=>openZoom(k));
    CARDS.push({el,k});
  });
  // défensif : les liens exigent un layout complètement posé
  try{ drawLinks(); }
  catch(e){ console.warn('drawLinks reporté:', e.message); }
  setTimeout(drawLinks, 350); // filet : retrace une fois le layout stabilisé
}
/* ═══ mini-graphique animé par carte (répartition par modèle) ═══ */
function sparkBars(k){
  const list=Object.entries(MC[k]||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(!list.length) return '';
  const mx=list[0][1];
  return list.map(([m,c],i)=>`
    <div class="sp" title="${m}"><span class="spl">${m.replace('iPhone ','')}</span><span class="srail"><i style="--w:${Math.round(c/mx*100)}%"></i></span><b>${c}</b></div>`).join('');
}
function cardPt(el){
  const s=$('#stage').getBoundingClientRect(), r=el.getBoundingClientRect();
  return {x:r.left-s.left+r.width/2, y:r.top-s.top+r.height/2};
}
function drawLinks(){
  window.__DL_CALLS=(window.__DL_CALLS||0)+1;
  const svg=$('#links'), s=$('#stage'), W=innerWidth,H=innerHeight;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.style.width=W+'px';svg.style.height=H+'px';
  // géométrie déterministe : identique au CSS (left 50% / top 44% ou 14%)
  const narrow=W<760;
  const cR=narrow? Math.min(120,W*.3) : Math.min(180,W*.18);
  const cT=narrow? .14 : .44;
  const C={x:W*.5, y:H*cT};
  if(!isFinite(C.x)||!isFinite(C.y)){ requestAnimationFrame(drawLinks); return; }
  window.__DL_C={x:C.x, y:C.y, r:cR};
  let out='';
  window.__DL_DBG={cards:CARDS.length, finis:isFinite(C.x), core:Math.round(C.x)+','+Math.round(C.y)};
  CARDS.forEach(({el,k},i)=>{
    const p=cardPt(el);
    // courbe douce : du noyau vers le bord supérieur de la carte
    const dst={x:p.x, y:p.y-46};
    const mx=(C.x+dst.x)/2+(dst.y-C.y)*.14, my=(C.y+dst.y)/2-(dst.x-C.x)*.14;
    out+=`<path d="M ${C.x.toFixed(0)} ${C.y.toFixed(0)} Q ${mx.toFixed(0)} ${my.toFixed(0)} ${dst.x.toFixed(0)} ${dst.y.toFixed(0)}" stroke="${COL[k]||'#8f8f9f'}" stroke-opacity=".6" stroke-width="2" fill="none" class="lk"/>`;
    // noeud d'ancrage côté carte
    out+=`<circle cx="${dst.x.toFixed(0)}" cy="${dst.y.toFixed(0)}" r="3.4" fill="${COL[k]||'#8f8f9f'}" fill-opacity=".9"/>`;
  });
  svg.innerHTML=out;
  window.__LINK_DBG={out_len:out.length, cards:CARDS.length, children:svg.childElementCount};
  // paquets lumineux en circulation sur les liens (animateMotion natif)
  svg.querySelectorAll('path.lk').forEach((path,i)=>{
    const pk=CARDS[i]&&CARDS[i].k; if(!pk) return;
    const col=COL[pk]||'#8f8f9f';
    for(let j2=0;j2<2;j2++){
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot.setAttribute('r','2.4');dot.setAttribute('fill',col);
      dot.style.filter='drop-shadow(0 0 4px '+col+')';
      const am=document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
      am.setAttribute('dur',(5+Math.random()*4+j2*2.2).toFixed(2)+'s');
      am.setAttribute('repeatCount','indefinite');
      am.setAttribute('begin',(-Math.random()*5).toFixed(2)+'s');
      am.setAttribute('path',path.getAttribute('d'));
      dot.appendChild(am);
      svg.appendChild(dot);
    }
  });
}
addEventListener('resize',()=>{buildCards()});
// taille du noyau selon l'écran (évite d'engloutir les colonnes mobiles)
addEventListener('resize',()=>{
  const cw=document.getElementById('corewrap');
  cw.style.width=cw.style.height=(innerWidth<760?Math.min(120,innerWidth*.3):Math.min(180,innerWidth*.18))+'px';
  document.getElementById('corewrap').style.top=(innerWidth<760?'14%':'44%');
});

/* ---------- tri des dates FR "jj/mm" ou "jj/aa" ---------- */
function stamp(d){
  // formats mixtes des sources : « 30/09 » = JJ/MM · « 08/26 » = MM/AA
  if(!d) return 0;
  const m=String(d).match(/(\d{1,2})\/(\d{1,2})/);
  if(!m) return 0;
  let [a,b]=[+m[1],+m[2]];
  if(b>12) return (2000+b)*10000+ a*100+ 15;   // MM/AA → milieu du mois
  if(a>12) return new Date().getFullYear()*10000+ b*100+ a; // JJ>31 impossible → JJ/MM
  // les deux ≤12 : JJ/MM assumé (30/09, 08/03…)
  return new Date().getFullYear()*10000+ b*100+ a;
}

/* ---------- zoom carte ---------- */
let curCat=null;
function openZoom(k){
  curCat=k;
  const col=COL[k]||'#8f8f9f', z=$('#zoom');
  const n=D.counts[k]||0, pct=Math.round(n/TOT*100);
  // modèles de la catégorie :
  const mr=Object.entries(MC).map(([m,pr])=>[m,pr[k]||0]).filter(r2=>r2[1]>0).sort((a,b)=>b[1]-a[1]);
  const models=mr.slice(0,5).map(([m,c])=>
    `<div class="zk"><div class="zl">${m.replace('iPhone ','')}</div><div class="zv">${c}<small> / ${Math.round(c/mr.reduce((s,r3)=>s+r3[1],0)*100) || 0}%</small></div><div class="zbar"><i data-w="${Math.round(c/mr[0][1]*100)}"></i></div></div>`);
  // sources presse triées RÉCENT → ANCIEN :
  const srcs=(SRC[k]||[]).slice().sort((a,b)=>stamp(b.date)-stamp(a.date));
  const srcHtml=srcs.map((a,i)=>
    `<a class="src" style="--sd:${(i*.1+.2).toFixed(2)}s;--c:${col}" href="${a.url}" target="_blank" rel="noopener">
      <span class="st">${a.title}</span>
      <span class="sm"><b>${a.date||'—'}</b> · ${a.src} →</span></a>`).join('');
  // verbatims :
  const exs=(D.examples||{})[k]||[];
  const verbs=exs.slice(0,4).map(v=>{
    let t=String((v&&v.text_tr)||v&&v.text||'');
    t=t.replace(/Faits clés[\s\S]{0,6}?\n\n?[-▪•·\s]*/g,'').trim();
    const nav=t.slice(0,120);
    if(/^(?:Accueil|Home)\b/.test(nav)){
      const cut=nav.lastIndexOf('>'); if(cut>6) t=t.slice(cut+1).replace(/^\s*/,'');
      t=t.replace(/^(?:Mobile|Tech|Technologie|News|Actualités?|Forum|Communautés?\s*[A-Za-z]*)\s+(?=[A-ZÀ-Ö])/,'');
    }
    t=t.length>230?t.slice(0,230).replace(/\s+\S*$/,'')+'…':t;
    return `<div class="zverb"><b>“</b>${t}…<i></i></div>`;
  }).join('');
  $('#zin').innerHTML=`
    <div class="zc">CARTE ${String(rows.findIndex(r2=>r2[0]===k)+1).padStart(2,'0')} / ${String(rows.length).padStart(2,'0')} · ${pct}% DU SIGNAL</div>
    <h2>${FR[k]||k}</h2>
    <div class="zsub">${n} mentions collectées · MAJ ${D.updated||'—'}</div>
    <div class="zbars">${models.length?models.join(''):'<span style="color:var(--t3);font-size:9px">Pas de détail modèle.</span>'}</div>
    ${exs.length?`<div class="zsec">CE QUE DISENT LES CLIENTS</div>${verbs}`:''}
    <div class="zsec">SOURCES WEB · DU PLUS RÉCENT AU PLUS ANCIEN</div>
    ${srcHtml||'<p style="color:var(--t3);font-size:9px">Aucune source enregistrée pour ce composant.</p>'}
    <button id="zclose">FERMER</button>`;
  $('#zclose').onclick=closeZoom;
  z.classList.add('on');
  // lancement des barres z :
  setTimeout(()=>{z.querySelectorAll('.zbar i').forEach(i2=>i2.style.width=i2.dataset.w+'%');},120);
  // esc
  document.onkeydown=e=>{if(e.key==='Escape')closeZoom()};
}
function closeZoom(){
  $('#zoom').classList.remove('on');curCat=null;document.onkeydown=null;
}
$('#zoom').addEventListener('click',e=>{if(e.target===e.currentTarget)closeZoom()});

/* ---------- HUD ---------- */
(function(){
$('#hudr').innerHTML=`<div class="clock">--:--:--</div><div class="maj">MAJ ${D.updated||'--'}</div>`;
  $('#hudb').innerHTML=`<div class="tot-lbl">SIGNAL TOTAL</div><div class="tot">${TOT}<small> MENTIONS</small></div><div id="linkstat"><b id="srclink">${srcCount}</b> SOURCES EN LIGNE</div>`;
  setInterval(()=>{const e=$('#hudr .clock');if(e)e.textContent=new Date().toTimeString().slice(0,8);},1000);
})();

/* ---------- intro ---------- */
(function(){
  // état initial noyau selon écran (le listener resize ne couvre le 1er load)
  const fit=()=>{
    const cw=document.getElementById('corewrap');
    if(!cw) return;
    cw.style.width=cw.style.height=(innerWidth<760?Math.min(120,innerWidth*.3):Math.min(180,innerWidth*.18))+'px';
    cw.style.top=(innerWidth<760?'14%':'44%');
  };
  fit();addEventListener('resize',fit);
  const bar=$('#intro .ibar i');let p=0;
  const iv=setInterval(()=>{p=Math.min(1,p+.08+Math.random()*.08);bar.style.width=p*100+'%';
    if(p>=1){clearInterval(iv);setTimeout(()=>{$('#intro').classList.add('off');
      buildCards();
      // compte animé du noyau
      const n=$('#coren');let v=0;const iv2=setInterval(()=>{v=Math.min(TOT,v+Math.ceil(TOT/26));n.textContent=v;if(v>=TOT)clearInterval(iv2);},42);
    },320);}},64);
})();
