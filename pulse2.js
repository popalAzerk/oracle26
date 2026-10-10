/* ===== PULSE 2.0 — cartes + noyau réseau ===== */
'use strict';
window.__PULSE2_LOADS=(window.__PULSE2_LOADS||0)+1;
const D = window.PULSE_DATA || {}, MC = window.PULSE_MODEL_COUNTS || {}, SRC = (window.PULSE_SOURCES||{}).sources || {};
const COL = {battery:'#30d158',screen:'#2997ff',charging:'#ffd60a',cosmetic:'#ff356e',audio:'#bf5af2',buttons:'#8e8e93',network:'#30b0c7',camera:'#ff9f0a'};
const FR  = {battery:'Batterie',screen:'Écran',charging:'Charge',cosmetic:'Esthétique',audio:'Audio',buttons:'Boutons',network:'Réseau',camera:'Caméra'};
const $ = s => document.querySelector(s);
const rows = Object.entries(D.counts||{}).sort((a,b)=>b[1]-a[1]);
const TOT = rows.reduce((s,r)=>s+r[1],0)||1;
// MC[model]={cat:n} → inversé : MC_BY_CAT[cat]={model:n}
const MC_BY_CAT = (()=>{ const r={}; for(const [m,cats] of Object.entries(MC)) for(const [k2,v] of Object.entries(cats)) (r[k2]=r[k2]||{})[m]=v; return r; })();
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

/* ---------- AMBIANCE DATACENTER : couche vidéo-générative de fond ----------
   racks : colonnes de "serveurs" (LED qui clignotent en séquence),
   paquets : impulsions qui descendent le long des rails verticaux,
   scanlines : balayages horizontaux lents (camera de surveillance). */
(function(){
  const c2=$('#fx2'), x2=c2.getContext('2d');
  if(!c2) return;
  let W2,H2,racks=[],packets=[],scans=[];
  function sz2(){
    W2=c2.width=innerWidth;H2=c2.height=innerHeight;
    const colW=Math.max(46,W2/14);
    racks=[];for(let cx2=colW/2;cx2<W2;cx2+=colW)
      racks.push({x:cx2,leds:Array.from({length:Math.round(H2/26)},(_,i)=>({on:Math.random()<.4,t:Math.random()*4}))});
    packets=Array.from({length:Math.round(W2/34)},()=>({rx:Math.floor(Math.random()*racks.length),y:Math.random()*H2,v:.25+Math.random()*.85,c:Math.random()}));
    scans=Array.from({length:4},()=>({y:Math.random()*H2,v:.12+Math.random()*.22}));
  }
  sz2();addEventListener('resize',sz2);
  (function d2(t){
    x2.clearRect(0,0,W2,H2);
    // rails verticaux discrets
    x2.strokeStyle='rgba(60,180,220,.12)';x2.lineWidth=1;
    for(const rk of racks){ x2.beginPath();x2.moveTo(rk.x,0);x2.lineTo(rk.x,H2);x2.stroke(); }
    // serveurs : LED qui clignotent (séquence type machine active)
    const TW= performance.now()/1000;
    for(const rk of racks){
      rk.leds.forEach((L,i)=>{
        const bl=Math.sin(TW*2.4+L.t+i*.6)> .55;
        const bl2=Math.sin(TW*7+L.t*3)> .93;   // rares glitches rapides
        if(bl||bl2){
          x2.fillStyle=bl2?'rgba(255,159,10,.75)':'rgba(48,209,88,.42)';
          x2.fillRect(rk.x-3.4,i*26+8,6.8,2.2);
        }else{
          x2.fillStyle='rgba(48,209,88,.14)';
          x2.fillRect(rk.x-2.6,i*26+8,5.2,1.6);
        }
      });
    }
    // paquets : descentes lumineuses le long des rails
    for(const p of packets){
      p.y+=p.v; if(p.y>H2){p.y=-10;p.rx=Math.floor(Math.random()*racks.length);}
      const rk=racks[p.rx]; if(!rk) continue;
      const g=x2.createLinearGradient(0,p.y-34,0,p.y);
      const col=p.c<.5?'48,209,88':(p.c<.8?'110,225,255':'255,214,10');
      g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(1,'rgba('+col+',.85)');
      x2.fillStyle=g;x2.fillRect(rk.x-1,p.y-34,2,34);
      x2.fillStyle='rgba('+col+',.95)';x2.fillRect(rk.x-2,p.y-3,4,4);
    }
    // scans : rideaux horizontaux lents (style CCTV)
    for(const sc of scans){
      sc.y+=sc.v; if(sc.y>H2+80){sc.y=-80;}
      x2.fillStyle='rgba(110,225,255,.06)';
      x2.fillRect(0,sc.y-70,W2,70);
      x2.fillStyle='rgba(110,225,255,.14)';
      x2.fillRect(0,sc.y-1.2,W2,1.2);
    }
    requestAnimationFrame(d2);
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
    const an=-Math.PI/2 + i*(Math.PI*2/rows.length), hh=Math.max(5,(n/nMax)*30),
          w1=3, bx=100+Math.cos(an)*56, by=100+Math.sin(an)*56,
          dx=Math.cos(an), dy=Math.sin(an),
          px=bx-dy*(w1/2), py=by+dx*(w1/2);
    const cc=(COL[k]||'#8f8f9f').match(/^#(..)(..)(..)$/);
    const cr=parseInt(cc[1],16),cg=parseInt(cc[2],16),cb=parseInt(cc[3],16);
    arcs+=`<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="4.5" height="${hh.toFixed(1)}" fill="rgba(${cr},${cg},${cb},.85)" transform="rotate(${(an*57.3).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)})"/>`;
  });
  svg.innerHTML=arcs;
})();

/* ---------- noyau toggle : déplie / referme les cartes ---------- */
let SPREAD=false;
function toggleSpread(){
  SPREAD=!SPREAD;
  const wrap=$('#cards'), cw=document.getElementById('corewrap');
  const hint=$('#corehint');
  if(SPREAD){
    if(!document.querySelectorAll('.card').length) buildCards();
    wrap.classList.add('spread');
    cw.classList.add('pulse');
    if(hint) hint.textContent='▸ REFERMER';
    // déploiement en cascade : chaque carte quitte le noyau avec son délai
    document.querySelectorAll('.card').forEach((el,i)=>{
      el.style.transitionDelay=(i*70)+'ms';
      el.classList.remove('folded');
      // le mini-graphe se dessine APRÈS l'arrivée de la carte
      setTimeout(()=>{ el.querySelectorAll('.zline').forEach(z=>{ z.classList.add('drawn');
        const tr=z.querySelector('.ztrail'); if(tr){ tr.style.strokeDashoffset='0'; }
        const hd=z.querySelector('.zhead'); if(hd){ setTimeout(()=>hd.classList.add('on'), 900); }
      }); }, 600+i*70);
    });
    try{ drawLinks(); }catch(e){}
  }else{
    wrap.classList.remove('spread');
    cw.classList.remove('pulse');
    if(hint) hint.textContent='▸ DÉPLOYER LE SIGNAL';
    // referme : les cartes rentrent DANS le noyau (cascade inversée)
    const els=[...document.querySelectorAll('.card')];
    els.forEach((el,i)=>{
      el.style.transitionDelay=((els.length-1-i)*45)+'ms';
      el.classList.add('folded');
      el.querySelectorAll('.zline').forEach(z=>{ z.classList.remove('drawn');
        const tr=z.querySelector('.ztrail'); if(tr){ tr.style.strokeDashoffset='1.02'; }
        const hd=z.querySelector('.zhead'); if(hd) hd.classList.remove('on');
      });
    });
    setTimeout(()=>{ try{ drawLinks(); }catch(e){} }, 700); // retrace APRÈS repli (→ vide)
  }
}
// FILET : si spread est posé, AUCUNE carte ne doit rester folded
setInterval(()=>{
  if(!SPREAD) return;
  const w=$('#cards'); if(!w.classList.contains('spread')) return;
  document.querySelectorAll('.card.folded').forEach(el=>{
    el.classList.remove('folded');
    el.querySelectorAll('.zline').forEach(z=>z.classList.add('drawn'));
  });
}, 900);

/* ---------- cartes autour du noyau ---------- */
const CARDS=[];
function buildCards(){
  const wrap=$('#cards');
  const W=innerWidth, H=innerHeight;
  wrap.innerHTML='';CARDS.length=0;
  rows.forEach(([k,n],i)=>{
    const el=document.createElement('div');
    el.className='card folded';el.dataset.k=k;
    // colonnes gauche/droite, 4 lignes : le noyau reste libre au centre
    // large : gouttière 380px · étroit (mobile) : 2 colonnes collées au bord
    const col=i%2, row=Math.floor(i/2);
    const narrow = W<760;
    const offset = narrow? Math.min(W*.5-78, 128) : 380;
    const colX = col===0? W*.5-offset : W*.5+offset;
    let y0, stepTotal;
    if(narrow){ y0=H*.19; stepTotal=H*.54/3; }  // marge basse accrue (~20% de l'écran au lieu de ~12%)
    else{ y0=H*.19; stepTotal=H*.555/3; }
    const colY = y0 + row*stepTotal;
    el.style.left=colX+'px';el.style.top=colY+'px';
    el.style.setProperty('--c',COL[k]||'#8f8f9f');
    el.style.setProperty('--pd',(i*.09+0.15)+'s');
    // point de renfermement : le noyau (l'émetteur)
    const narrow0=W<760;
    const coreY=H*.5; // top CSS = 50%
    // le CSS place #corewrap top:50% (centre de l écran) :
    el.style.setProperty('--fx',(W*.5-colX)+'px');
    el.style.setProperty('--fy',(H*.5-colY)+'px');
    el.style.setProperty('--rd', (i*70)+'ms');
    const pct=Math.round(n/TOT*100);
    el.innerHTML=`
      <div class="chead"><span class="chk"></span><span class="ct">${FR[k]||k}</span><span class="ck">${String(i+1).padStart(2,'0')}</span></div>
      <div class="cbody"><span class="cbig">${String(n).padStart(2,'0')}</span><span class="cpc">${pct}%</span></div>
      <div class="cspark">${sparkBars(k, Object.keys(MC_BY_CAT[k]||{}).length)}</div>
      <div class="cprog"><i></i></div>
      <div class="cfoot"><span><span class="clive"></span>ACTIF</span><b>&#9656; ${Object.keys(MC_BY_CAT[k]||{}).length} MODÈLES</b></div>`;
    wrap.appendChild(el);
    const bar=el.querySelector('.cprog i');
    setTimeout(()=>{bar.style.width=pct+'%';}, 400+i*120);
    // mini-graphe : aire fond d'abord, puis la ligne se dessine, point final s'allume
    setTimeout(()=>{ el.querySelectorAll('.zline').forEach(z=>{ z.classList.add('drawn');
      const tr=z.querySelector('.ztrail'); if(tr){ tr.style.strokeDashoffset='0'; }
      const hd=z.querySelector('.zhead'); if(hd){ setTimeout(()=>hd.classList.add('on'), 950); }
    }); }, 600+i*120);
    el.addEventListener('click',()=>openZoom(k));
    CARDS.push({el,k});
  });
  // défensif : les liens exigent un layout complètement posé
  try{ drawLinks(); }
  catch(e){ console.warn('drawLinks reporté:', e.message); }
  setTimeout(drawLinks, 350); // filet : retrace une fois le layout stabilisé
}
// clic sur le noyau : déplie/referme (une seule branchement)
(function(){
  const cw=document.getElementById('corewrap');
  if(cw && !cw.__wired){ cw.__wired=1; cw.style.cursor='pointer';
    // libellé d'action sous la sphère (affordance explicite)
    const hint=document.createElement('div');
    hint.className='corehint'; hint.id='corehint';
    hint.textContent='▸ DÉPLOYER LE SIGNAL';
    cw.appendChild(hint);
    cw.addEventListener('click', toggleSpread); }
})();
/* ═══ mini-graphe LIGNE+ZONE animé par carte (zigzag blanc + aire dégradée) ═══ */
function sparkBars(k, n){
  // série = répartition des mentions par modèle, ordonnée du plus ancien
  // modèle (plus bas) au plus signalé (plus haut) — trend montante lisible
  const list=Object.entries(MC_BY_CAT[k]||{}).sort((a,b)=>a[1]-b[1]).slice(-14);
  if(!list.length) return '';
  const mx=Math.max(...list.map(x=>x[1]), Math.round(TOT*.30)); // normalisation globale : les 2-3% restent PLATS (honnête)
  const Wv=100, Hv=40, lo=Hv-5, hi=10;
  const pts=list.map(([m,c],i)=>{
    const x=3+i*((Wv-8)/Math.max(1,list.length-1));
    const y=lo-((c/mx)*(lo-hi));
    return [x,y,m,c];
  });
  // ligne : zigzag (L) — plus fidèle aux réfs (courbe + dips) :
  let dl='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
  // aire : même tracé fermé vers la base
  let da=dl+` L${pts[pts.length-1][0].toFixed(1)} ${lo} L${pts[0][0].toFixed(1)} ${lo} Z`;
  const last=pts[pts.length-1];
  const grad=`lgz-${k}`;
  const svg=`<svg class="zline" viewBox="0 0 ${Wv} ${Hv}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="${grad}" gradientUnits="userSpaceOnUse" x1="0" y1="${Hv}" x2="0" y2="0">
        <stop offset="0" stop-color="var(--c)" stop-opacity="0"/>
        <stop offset=".65" stop-color="var(--c)" stop-opacity=".38"/>
        <stop offset="1" stop-color="var(--c)" stop-opacity=".1"/>
      </linearGradient>
    </defs>
    <path class="zarea" d="${da}" fill="url(#${grad})"/>
    <path class="ztrail" d="${dl}" pathLength="1" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
    <g class="zhead"><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4.6" fill="var(--c)" opacity=".28"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="1.7" fill="#fff"/></g>
  </svg>`;
  return `<div class="zcwrap"><span class="zlinfo">${list[0][0].replace('iPhone ','')} · ${last[2].replace('iPhone ','')} — ${n} MODÈLES</span>${svg}</div>`;
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
  // géométrie déterministe : identique au CSS (left 50% / top 50%)
  const narrow=W<760;
  const cR=narrow? Math.min(120,W*.3) : Math.min(180,W*.18);
  const cT=.5; // sphère au CENTRE de l'écran
  const C={x:W*.5, y:H*cT};
  if(!isFinite(C.x)||!isFinite(C.y)){ requestAnimationFrame(drawLinks); return; }
  window.__DL_C={x:C.x, y:C.y, r:cR};
  let out='';
  window.__DL_DBG={cards:CARDS.length, finis:isFinite(C.x), core:Math.round(C.x)+','+Math.round(C.y)};
  const deployed=$('#cards').classList.contains('spread');
  if(!deployed){ svg.innerHTML=''; window.__LINK_DBG={cards:CARDS.length,children:0,deployed:0}; return; }
  CARDS.forEach(({el,k},i)=>{
    const p=cardPt(el);
    // ancrage : le lien accroche la TRANCHE de la carte face au noyau
    // (mobile : au-dessus de la 1re rangée, en-dessous des suivantes)
    const left = p.x < C.x;
    let dst;
    // raccord RÉEL à la carte : coin intérieur-haut (le bord visible
    // face au noyau) — le lien touche visuellement la carte.
    const r=el.getBoundingClientRect(), st=$('#stage').getBoundingClientRect();
    const rw=r.width/st.width, rh=r.height/st.height;
    const ix=p.x+(left? -rw/2 : rw/2), iy=p.y-rh/2;
    dst = narrow ? {x:ix, y:iy+10} : {x:p.x, y:p.y-rh/2-8};
    const mx=(C.x+dst.x)/2+(dst.y-C.y)*.18, my=(C.y+dst.y)/2-(dst.x-C.x)*.18;
    // départ = SUR le cercle du noyau (angle du point d'arrivée)
    const ang=Math.atan2(dst.y-C.y, dst.x-C.x);
    const sx=C.x+Math.cos(ang)*(cR+6), sy=C.y+Math.sin(ang)*(cR+6);
    out+=`<path d="M ${sx.toFixed(0)} ${sy.toFixed(0)} Q ${mx.toFixed(0)} ${my.toFixed(0)} ${dst.x.toFixed(0)} ${dst.y.toFixed(0)}" stroke="${COL[k]||'#8f8f9f'}" stroke-opacity=".75" stroke-width="2.2" fill="none" class="lk"/>`;
    // noeud de connexion (côté carte) + point de départ sur le bord sphère
    out+=`<circle cx="${dst.x.toFixed(0)}" cy="${dst.y.toFixed(0)}" r="3.4" fill="${COL[k]||'#8f8f9f'}" fill-opacity=".9"/>`;
    out+=`<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="2.6" fill="${COL[k]||'#8f8f9f'}" fill-opacity=".55"/>`;
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
// resize : reconstruit au BON ÉTAT (déployé → positions neuves dépliées)
addEventListener('resize',()=>{
  buildCards();
  if(typeof SPREAD!=='undefined' && SPREAD){
    const wrap=$('#cards'); wrap.classList.add('spread');
    document.querySelectorAll('.card').forEach(el=>{
      el.classList.remove('folded');
      el.querySelectorAll('.zline').forEach(z=>z.classList.add('drawn'));
    });
    try{ drawLinks(); }catch(e){}
  }
});
// taille du noyau selon l'écran (évite d'engloutir les colonnes mobiles)
addEventListener('resize',()=>{
  const cw=document.getElementById('corewrap');
  cw.style.width=cw.style.height=(innerWidth<760?Math.min(120,innerWidth*.3):Math.min(180,innerWidth*.18))+'px';
  document.getElementById('corewrap').style.top='50%';
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
  // cohérence thématique : ne montrer que les verbatims qui parlent
  // vraiment du composant (la classification nocturne peut se tromper)
  const LEX={battery:['batterie','battery','autonomie','décharge','drain','santé','gonfl','vide'],
    charging:['charge','surchauff','câble','magsafe','chargeur','adaptateur','alim'],
    screen:['écran','ecran','screen','lignes','ghost','tactile','oled','retina','affichage'],
    cosmetic:['rayur','couleur',"s'estompe",'esthétique','anodis','peint','titane','aluminium','décolor','marqu','coque'],
    audio:['haut-parleur','speaker','audio','son','micro','crackle','inaudible','bluetooth','sirène'],
    buttons:['bouton','sticky','collé','enfoncé','volume','caméra control','action'],
    network:['réseau','wifi','cellulaire','signal','modem','5g','connexion','data','couvre'],
    camera:['caméra','camera','photo','lentille','lens','capteur','diaphragme','objectif']};
  const lex=(LEX[k]||[]).map(x=>x.toLowerCase());
  let exsOK=exs.filter(v=>{
    const t=String((v&&v.text_tr)||v&&v.text||'').toLowerCase();
    return lex.some(m2=>t.includes(m2));
  });
  // si le filtre élimine tout : fallback sur les FAITS de la veille
  if(exs.length && !exsOK.length){
    const FAITS={battery:'Surchauffe et décharge rapide au cœur des signalements 17 Pro Max — plus gros volume de la veille.',
      charging:'Surchauffes en charge rapportées ; un correctif est arrivé côté iOS, les cas perdurent sur chargeurs tiers.',
      screen:'Lignes vertes/roses au lancement du 18 Pro + écrans noirs et ghost touch signalés.',
      cosmetic:'Décoloration du titane 15 Pro reconnue par Apple ; rayures précoces sur l’aluminium des modèles standard.',
      audio:'Grésillements de haut-parleurs (crackle) signalés sur 17 Pro Max.',
      buttons:'Boutons « sticky » (collants) sur 17 Pro Max après quelques semaines.',
      network:'Modem signalé chauffant sur 17 Pro Max ; déconnexions sporadiques.',
      camera:'Glitches caméra au lancement 18 Pro ; lames de diaphragme sensibles (teardown iFixit).'};
    exsOK=[{text_tr:FAITS[k]||'Aucun verbatim cohérent collecté pour ce composant.'}];
  }
  const verbs=exsOK.slice(0,4).map(v=>{
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
  const srcCount=Object.values(SRC).reduce((a,v)=>a+v.length,0)||8;
$('#hudr').innerHTML=`<div class="clock">--:--:--</div><div class="maj">MAJ ${D.updated||'--'}</div>`;
  setInterval(()=>{const e=$('#hudr .clock');if(e)e.textContent=new Date().toTimeString().slice(0,8);},1000);
})();

/* ---------- intro ---------- */
(function(){
  // filet : si l'intro n'a pas fini dans 4 s (crash silencieux), sortie forcée
  setTimeout(()=>{ const it=document.getElementById('intro');
    if(it && !it.classList.contains('off')){ it.classList.add('off');
      if(!document.querySelectorAll('.card').length){ try{ buildCards(); }catch(e){} } }
  }, 4000);
  // état initial noyau selon écran (le listener resize ne couvre le 1er load)
  try{
  const cw=document.getElementById('corewrap');
  const fit=()=>{ if(!cw) return;
    cw.style.width=cw.style.height=(innerWidth<760?Math.min(120,innerWidth*.3):Math.min(180,innerWidth*.18))+'px';
    cw.style.top='50%';
  };
  fit();addEventListener('resize',fit);
  }catch(e){ console.warn('fit:', e.message); }
  const bar=$('#intro .ibar i');let p=0;
  const iv=setInterval(()=>{p=Math.min(1,p+.08+Math.random()*.08);bar.style.width=p*100+'%';
    if(p>=1){clearInterval(iv);setTimeout(()=>{$('#intro').classList.add('off');
      // état initial : cartes RENFERMÉES (folded) — se déploient au clic noyau
      buildCards();
      $('#links').innerHTML='';
      // compte animé du noyau
      const n=$('#coren');let v=0;const iv2=setInterval(()=>{v=Math.min(TOT,v+Math.ceil(TOT/26));n.textContent=v;if(v>=TOT)clearInterval(iv2);},42);
    },320);}},64);
})();
