/* ===== PULSE 3 — le signal comme matière ===== */
'use strict';
const D = window.PULSE_DATA || {}, MC = window.PULSE_MODEL_COUNTS || {}, SRC = (window.PULSE_SOURCES||{}).sources || {};
const COL = {battery:'#30d158',screen:'#2997ff',charging:'#ffd60a',cosmetic:'#ff356e',audio:'#bf5af2',buttons:'#8e8e93',network:'#30b0c7',camera:'#ff9f0a'};
const FR  = {battery:'Batterie',screen:'Écran',charging:'Charge',cosmetic:'Esthétique',audio:'Audio',buttons:'Boutons',network:'Réseau',camera:'Caméra'};
const $ = s => document.querySelector(s);
const rows = Object.entries(D.counts||{}).sort((a,b)=>b[1]-a[1]);
const TOT = rows.reduce((s,r)=>s+r[1],0)||1;

/* parallax : offsets partagés (déclarés en tête pour éviter TDZ) */
var PLX=0, PLY=0;
addEventListener('mousemove',e=>{
  PLX=(e.clientX/innerWidth-.5)*-18;
  PLY=(e.clientY/innerHeight-.5)*-14;
},{passive:true});

/* ---------- fond : routes de fibre (topologie réseau, pas espace) ---------- */
(function(){
  const c=$('#fx'), x=c.getContext('2d');
  let W,H,lines=[],junctions=[];
  function sz(){
    W=c.width=innerWidth;H=c.height=innerHeight;
    // routes orthogonales-diagonales : un tracé type carte circuit / fibre
    lines=[];junctions=[];
    const n=Math.round(Math.min(W*H/150000, 26));
    for(let i=0;i<n;i++){
      let horiz=Math.random()<.6;
      let px=Math.random()*W, py=Math.random()*H;
      const pts=[[px,py]];
      const seg=2+(Math.random()*3|0);
      for(let s2=0;s2<seg;s2++){
        const d=(Math.random()*140+60)*(Math.random()<.5?-1:1);
        if(horiz){px+=d; py+=(Math.random()-.5)*30; }
        else {py+=d; px+=(Math.random()-.5)*30; }
        pts.push([px,py]);
        horiz=!horiz;
      }
      lines.push({pts,ph:Math.random()*6.28,sp:.0004+Math.random()*.0005});
      // nœuds aux jonctions (croisements = topologie)
      if(Math.random()<.7) junctions.push({x:pts[1][0],y:pts[1][1],ph:Math.random()*6.28});
    }
  }
  sz();addEventListener('resize',sz);
  (function d(t){
    x.clearRect(0,0,W,H);
    // routes :
    x.lineWidth=1;
    for(const L of lines){
      x.beginPath();
      x.moveTo(L.pts[0][0],L.pts[0][1]);
      for(let i=1;i<L.pts.length;i++)x.lineTo(L.pts[i][0],L.pts[i][1]);
      const pulse=.5+.5*Math.sin(t*L.sp+L.ph);
      x.strokeStyle='rgba(80,225,255,'+(0.05+0.07*pulse).toFixed(3)+')';
      x.stroke();
    }
    // jonctions lumineuses clignotantes (activité réseau) :
    for(const j of junctions){
      const p=.5+.5*Math.sin(t*.001+j.ph);
      const r2=1.5+p*1.6;
      x.beginPath();x.rect(j.x-r2,j.y-r2,r2*2,r2*2);
      x.fillStyle='rgba(92,242,255,'+(.2+.45*p).toFixed(3)+')';
      x.fill();
      x.strokeStyle='rgba(92,242,255,'+(.28+p*.3).toFixed(3)+')';
      x.lineWidth=1;x.strokeRect(j.x-r2-2,j.y-r2-2,(r2+2)*2,(r2+2)*2);
    }
    requestAnimationFrame(d);
  })(0);
})();

var NODES=[];
function placeMur(){
  const mur=$('#mur'); if(!mur) return;
  mur.innerHTML='';
  const W=innerWidth,H=innerHeight,cx=W/2,cy=H*.44;
  const RMAX=Math.min(W,H)*.38;
  // — MAILLAGE RÉSEAU : hub central + composants sur 2 couronnes —
  NODES.length=0;
  const hub=document.createElement('div');
  hub.className='hub';
  hub.style.setProperty('--hx',cx+'px');hub.style.setProperty('--hy',cy+'px');
  hub.innerHTML=`<div class="hubmesh"></div><div class="hubcore"><b>${TOT}</b><span>SIGNAL</span></div>`
  + (function(){
    // arcs brisés : 2 anneaux de 3-5 arcs d'amplitudes inégales, certains
    // doublés, avec ticks perpendiculaires et micro-carrés — jamais fermés
    const R=64, R2=92, rnd=Math.random;
    function arcs(r0, n){
      let a=(rnd()*6.28), out='';
      for(let i=0;i<n;i++){
        const span=.6+rnd()*1.6, w=(i%2? 2.6: 1)+ (rnd()<.25?2.2:0);
        const a0=a, a1=a+span; a=a1+.25+rnd()*.8; // vide entre arcs
        const x0=100+Math.cos(a0)*r0, y0=100+Math.sin(a0)*r0;
        const x1=100+Math.cos(a1)*r0, y1=100+Math.sin(a1)*r0;
        const large=a1-a0>Math.PI?1:0;
        out+=`<path d="M ${x0} ${y0} A ${r0} ${r0} 0 ${large} 1 ${x1} ${y1}" stroke="rgba(120,235,255,${.35+rnd()*.4})" stroke-width="${w}" fill="none"/>`;
        // tick perpendiculaire à la fin :
        if(rnd()<.5){
          const tx=100+Math.cos(a1)*(r0+5), ty=100+Math.sin(a1)*(r0+5);
          const tx2=100+Math.cos(a1)*(r0-5), ty2=100+Math.sin(a1)*(r0-5);
          out+=`<line x1="${tx}" y1="${ty}" x2="${tx2}" y2="${ty2}" stroke="rgba(160,245,255,.7)" stroke-width="1.2"/>`;
        }
        // micro-carré semé :
        if(rnd()<.45){
          const xm=100+Math.cos(a0)*r0, ym=100+Math.sin(a0)*r0;
          out+=`<rect x="${xm-1.6}" y="${ym-1.6}" width="3.2" height="3.2" fill="rgba(180,250,255,.6)"/>`;
        }
      }
      return out;
    }
    let baseAn=-1.9;
    const arcs1=arcs(R,4); let arcs2=arcs(R2,3);
    // arc ACCENT blanc = tranche de la cat n°1 (angle miroir du peigne)
    {
      const a0b=baseAn-.07, a1b=baseAn+.14*1;
      const x0=100+Math.cos(a0b)*R2, y0=100+Math.sin(a0b)*R2,
            x1=100+Math.cos(a1b)*R2, y1=100+Math.sin(a1b)*R2;
      arcs2+=`<path d="M ${x0} ${y0} A ${R2} ${R2} 0 0 1 ${x1} ${y1}" stroke="rgba(255,255,255,.92)" stroke-width="3.4" fill="none"/>`;
    }
    // peigne radial sur un secteur (top-droit) : 9 blocs pleins/contours
    // peigne = HISTOGRAMME radial : hauteur/épaisseur ∝ mentions, couleur
    // de la catégorie, centré autour de la tranche n°1
    const ns=rows.map(r=>r[1]); const nMax=Math.max(...ns);
    let pei='';
    for(let i=0;i<ns.length;i++){
      const an=baseAn + (i-(ns.length-1)/2)*.2, rad=R2-6,
            hh=Math.max(4,(ns[i]/nMax)*34),
            cx2=100+Math.cos(an)*rad, cy2=100+Math.sin(an)*rad,
            w=3+(ns[i]/nMax)*2.6;
      const cc=COL[rows[i][0]]||'#8f8f9f';
      const cm=cc.match(/^#(..)(..)(..)$/),
            cr=parseInt(cm[1],16), cg=parseInt(cm[2],16), cb=parseInt(cm[3],16);
      pei+=`<rect x="${cx2-w/2}" y="${cy2-hh}" width="${w}" height="${hh}" fill="rgba(${cr},${cg},${cb},.85)" transform="rotate(${(an*57.3+90).toFixed(1)} ${cx2.toFixed(1)} ${cy2.toFixed(1)})"/>`;
    }
    const svg1=`<svg class="hubarc" viewBox="0 0 200 200">${arcs1}</svg>`;
    const svg2=`<svg class="hubarc rev" viewBox="0 0 200 200">${arcs2}${pei}</svg>`;
    return svg1+svg2;
  })()
  + `<div class="fris top">${Array.from({length:9},(_,i)=>`<i style="--op:${(0.9-i*.09).toFixed(2)}"></i>`).join('')}</div><div class="fris bot">${Array.from({length:9},(_,i)=>`<i style="--op:${(0.2+i*.09).toFixed(2)}"></i>`).join('')}</div>`;
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
    NODES.push({el,k,bx:cx+Math.cos(ang)*rad,by:cy+Math.sin(ang)*rad,slot,ang,big});
  });
  // décollisions : 2 passes de répulsion douce sur les bases
  for (let pass=0; pass<2; pass++){
    for (let a1=1;a1<NODES.length;a1++){
      for (let b1=a1+1;b1<NODES.length;b1++){
        const A=NODES[a1], B=NODES[b1],
              d=Math.hypot(A.bx-B.bx, A.by-B.by), MARGIN=118;
        if (d<MARGIN && d>0.01){
          const push=(MARGIN-d)/2, ux=(B.bx-A.bx)/d, uy=(B.by-A.by)/d;
          A.bx-=ux*push;A.by-=uy*push;B.bx+=ux*push;B.by+=uy*push;
        }
      }
    }
  }
  NODES.slice(1).forEach(n=>{
    n.base={x:n.bx,y:n.by};
    n.drift={px:Math.random()*6.28,amp:10+Math.random()*8,sp:.0006+Math.random()*.0004};
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
  window.__pulsesN=()=>pulses.length;
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
      // courbe quadratique : le contrôle décalé donne une souplesse réseau
      const mx=(A.cur.x+B.cur.x)/2 + (B.cur.y-A.cur.y)*.09,
            my=(A.cur.y+B.cur.y)/2 - (B.cur.x-A.cur.x)*.09;
      x.beginPath();x.moveTo(A.cur.x,A.cur.y);x.quadraticCurveTo(mx,my,B.cur.x,B.cur.y);
      x.strokeStyle='rgba(96,232,255,.30)';x.lineWidth=1.25;x.stroke();
      // cache l'arête pour échantillonner les paquets :
      B.edge={A,mx,my};
    });
    if(pulses.length<10 && Math.random()<.18){
      const e=Math.floor(Math.random()*es.length);
      pulses.push({e,t:0,sp:.006+Math.random()*.008,col:Math.random()<.3?'#ff2ea6':'#5cf2ff'});
    }
    for(let j=pulses.length-1;j>=0;j--){
      const p=pulses[j], L=es[p.e];
      if(!L||!L[0].cur){pulses.splice(j,1);continue;}
      p.t+=p.sp;
      if(p.t>=1){pulses.splice(j,1);continue;}
      const [A,B]=L, u=1-p.t,
            px=u*u*A.cur.x+2*u*p.t*L[1].edge.mx+p.t*p.t*B.cur.x,
            py=u*u*A.cur.y+2*u*p.t*L[1].edge.my+p.t*p.t*B.cur.y;
      x.beginPath();x.arc(px,py,3.4,0,6.29);
      x.fillStyle=p.col;x.shadowColor=p.col;x.shadowBlur=14;x.globalAlpha=1;x.fill();
      x.globalAlpha=1;x.shadowBlur=0;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* parallax : offsets partagés (souris → tout le maillage suit) */
addEventListener('mousemove',e=>{
  PLX=(e.clientX/innerWidth-.5)*-18;
  PLY=(e.clientY/innerHeight-.5)*-14;
},{passive:true});

/* ---------- HUD ---------- */
(function(){
  const up=D.updated||'--';
  $('#hudr').innerHTML=`<div class="clock">${'--:--:--'}</div><div class="maj">MAJ ${up}</div>`;
  $('#hudb').innerHTML=`<div class="tot-lbl">SIGNAL TOTAL</div><div class="tot">${TOT}<small> MENTIONS</small></div>`;
  // compteur de paquets en transit, mis à jour live :
  setInterval(()=>{
    let el=document.getElementById('linkstat');
    if(!el){el=document.createElement('div');el.id='linkstat';$('#hudb').appendChild(el);}
    if(el) el.innerHTML=`<b>${(window.__pulsesN?window.__pulsesN():0)}</b> PAQUETS EN TRANSIT`;
  }, 500);
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
    let t=String((v&&v.text_tr)||v&&v.text||v||'');
    // nettoyage artefacts scrape : fil d'Ariane / puces / doublons séparateurs
    // fil d'Ariane en DÉBUT de chaîne (sans \n) : couper jusqu'au dernier '>'
    // si la citation commence par un fragment de navigation :
    // artefacts de scrape : préfixe navigation « Accueil > X > Y » (les
    // segments font <30 chars, coupés au DERNIER '>' des 120 premiers chars)
    // ordre : (1) bloc 'Faits clés' + puces, (2) puis navigation résiduelle
    t=t.replace(/Faits clés[\s\S]{0,6}?\n\n?[-▪•·\s]*/g,'')
       .replace(/(^|\n)\s*[-▪•·]+\s*/g,'')
       .replace(/\n{2,}/g,'\n').trim();
    const nav=t.slice(0,120);
    if(/^(?:Accueil|Home)\b/.test(nav)){
      const cut=nav.lastIndexOf('>');
      if(cut>6){ t=t.slice(cut+1).replace(/^\s*/,''); }
      // résidu : segment terminal isolé du fil (un mot court collé au texte)
      t=t.replace(/^(?:Mobile|Tech|Technologie|News|Actualit(?:é|e)s?|Forum|Communaut(?:é|e)\s*[A-Za-z]*)\s+(?=[A-ZÀ-Ö])/,'');
    }
    let vis=t.length>290?t.slice(0,290).replace(/\s+\S*$/,'')+'…':t;
    return `<p class="flx" style="--c:${col}">${vis}<span class="fsrc">signal client</span></p>`;}).join(''):'')
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
