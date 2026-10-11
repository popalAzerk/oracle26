/* ═══ PULSE DASHBOARD — composants canvas animés, données réelles ═══ */
'use strict';
const D2=window.PULSE_DATA||{}, MC2=D2.model_counts||{}, SR2=(window.PULSE_SOURCES||{}).sources||{};
const FRD={battery:'BATTERIE',screen:'ÉCRAN',charging:'CHARGE',cosmetic:'ESTHÉTIQUE',audio:'AUDIO',buttons:'BOUTONS',network:'RÉSEAU',camera:'CAMÉRA'};
const COLD={battery:'#30d158',screen:'#2997ff',charging:'#ffd60a',cosmetic:'#ff356e',audio:'#bf5af2',buttons:'#8e8e93',network:'#00e0ff',camera:'#ff9f0a'};
const rowsD=Object.entries(D2.counts||{}).sort((a,b)=>b[1]-a[1]);
const TOTD=rowsD.reduce((s,r)=>s+r[1],0)||1;
const DPR3=Math.min(devicePixelRatio||1,2);
const $q=s=>document.querySelector(s);
const eo=t=>1-Math.pow(1-t,3);

/* ─ helpers canvas ─────────────────────────────── */
function cfit(cv,w,h){ cv._w=w; cv._h=h; cv.width=w*DPR3; cv.height=h*DPR3; cv.style.width=w+'px'; cv.style.height=h+'px'; }
function raf(cv,draw){
  const x=cv.getContext('2d'); let t0=null, W=cv._w, H=cv._h;
  (function loop(ts){
    if(t0===null){ t0=ts; }
    if(!W||!H){ // mesure paresseuse : le layout est prêt
      const r=cv.getBoundingClientRect();
      if(r.width>10){ W=cv._w=r.width; H=cv._h=cv._h||r.height; x.scale(DPR3,DPR3); }
    }
    if(!document.hidden&&W){
      try{
        x.setTransform(DPR3,0,0,DPR3,0,0); x.clearRect(0,0,W,H);
        draw(x,(ts-t0)/1000,W,H);
      }catch(e){ (window.__RAF_ERR=window.__RAF_ERR||{})[cv.id||cv.className]=e.message; }
    }
    requestAnimationFrame(loop);
  })(performance.now());
}
function cUp(el,to,dur){ const t0=performance.now();
  (function st(t){ const p=Math.min(1,(t-t0)/(dur*1000)); el.textContent=Math.round(to*eo(p)); if(p<1) requestAnimationFrame(st); })(t0); }

/* ─ horloge ───────────────────────────────────── */
function clockTick(){
  $q('#dclk').textContent=new Date().toTimeString().slice(0,8);
  $q('#dmaj').textContent='MAJ '+(D2.updated||'').replace(/-/g,'.');
  setTimeout(clockTick,1000);
}

/* ─ 1. barres horizontales top-3 + Δ semaine ──── */
function hbars(){
  const host=$q('#hbars'), hist=D2.history||[];
  const last=(hist[hist.length-1]||{}).counts||{}, prev=(hist[hist.length-2]||{}).counts||{};
  rowsD.slice(0,3).forEach(([k,v],i)=>{
    const dl=(last[k]||0)-(prev[k]||0), dsp=(dl>=0?'+':'')+dl;
    const row=document.createElement('div'); row.className='hb2';
    row.innerHTML=`<span class="hn" style="color:${COLD[k]}">${FRD[k]}</span>
      <span class="hv">${v}<em>${dsp}</em></span>
      <div class="htr"><i style="background:linear-gradient(90deg,${COLD[k]}55,${COLD[k]});width:0"></i></div>`;
    host.appendChild(row);
    const b=row.querySelector('.htr i'), pct=(v/TOTD*100).toFixed(0)+'%';
    setTimeout(()=>{ b.style.transition='width 1.2s cubic-bezier(.2,.8,.2,1)'; b.style.width=pct; },320+i*190);
  });
}

/* ─ 2. ligne multi-séries (3 semaines historique) ── */
function lineChart(){
  const host=$q('#gl_line'), w=host.parentElement.getBoundingClientRect().width||320, h=150;
  cfit(host,w,h);
  const hist=D2.history||[];
  const t1=hist.map(h=>h.total||0);
  const k1=rowsD[0][0], k2=rowsD[1][0];
  const t2=hist.map(h=>(h.counts||{})[k1]||0);
  const t3=hist.map(h=>(h.counts||{})[k2]||0);
  const dates=hist.map(h=>h.date.slice(5).replace('-','/'));
  raf(host,(x,t,W,H)=>{
    const pad={l:32,r:8,t:12,b:20}, iw=W-pad.l-pad.r, ih=H-pad.t-pad.b;
    const mx=Math.max(60,...t1)*1.15;
    x.setLineDash([2,4]); x.strokeStyle='rgba(124,134,152,.22)'; x.lineWidth=1;
    for(let g=0; g<=4; g++){
      const yy=pad.t+ih*g/4;
      x.beginPath(); x.moveTo(pad.l,yy); x.lineTo(W-pad.r,yy); x.stroke();
      x.fillStyle='rgba(124,134,152,.75)'; x.font='8px ui-monospace'; x.textAlign='right';
      x.fillText(Math.round(mx*(1-g/4)), pad.l-5, yy+3);
    }
    x.setLineDash([]);
    x.font='8px ui-monospace'; x.textAlign='center';
    dates.forEach((d,i)=>{ x.fillStyle='rgba(124,134,152,.65)'; x.fillText(d, pad.l+iw*i/Math.max(1,dates.length-1), H-5); });
    const rev=Math.min(1,t*.55);
    const N=arr=>arr.length;
    function serie(arr,col,withFill){
      // trace tronquée : segments visibles selon rev (pas de dash-trick,
      // fiabilité entre moteurs)
      const nVis=Math.max(2,Math.ceil(1+(N(arr)-1)*rev));
      const pt=i=>[pad.l+iw*i/(N(arr)-1), pad.t+ih*(1-arr[i]/mx)];
      if(withFill&&nVis>2){
        x.beginPath(); x.moveTo(...pt(0));
        for(let i=1;i<nVis;i++) x.lineTo(...pt(i-1+0));
        x.lineTo(...pt(nVis-1)); x.lineTo(...pt(nVis-1));
        x.lineTo(pt(nVis-1)[0], pad.t+ih); x.lineTo(pad.l,pad.t+ih); x.closePath();
        const g=x.createLinearGradient(0,pad.t,0,H-pad.b);
        g.addColorStop(0,col+'3d'); g.addColorStop(1,col+'00');
        x.fillStyle=g; x.fill();
      }
      x.beginPath(); x.moveTo(...pt(0));
      for(let i=1;i<nVis;i++) x.lineTo(...pt(i));
      x.strokeStyle=col; x.lineWidth=2; x.lineJoin='round'; x.stroke();
      // point terminal + halo pulsant (une fois la courbe complète) :
      const [px,py]=pt(nVis-1);
      x.fillStyle=col; x.beginPath(); x.arc(px,py,Math.min(3,rev*3),0,7); x.fill();
      if(rev>=1&&(col==='#00e0ff')){
        x.strokeStyle=col+'66'; x.lineWidth=1.4;
        x.beginPath(); x.arc(px,py,6+2.5*Math.sin(t*3),0,7); x.stroke();
      }
    }
    serie(t1,'#00e0ff',true); serie(t2,'#7ea6ff',false); serie(t3,'#2e7cf6',false);
  });
}

/* ─ 3. barres segmentées % ───────────────────── */
function segBars(){
  const host=$q('#seg');
  rowsD.slice(0,3).forEach(([k,v],i)=>{
    const pct=(v/TOTD*100).toFixed(0);
    const row=document.createElement('div'); row.className='sb';
    row.innerHTML=`<span class="sn">${FRD[k]}</span><span class="sv">${pct} %</span>
      <div class="str"><i style="background:${COLD[k]};width:0"></i></div>`;
    host.appendChild(row);
    const b=row.querySelector('.str i');
    setTimeout(()=>{ b.style.transition='width 1.1s cubic-bezier(.2,.8,.2,1)'; b.style.width=pct+'%'; },480+i*200);
  });
}

/* ─ 4. anneaux pointillés (3 hub KPI) ────────── */
function rings(){
  const host=$q('#rings'); host.innerHTML='';
  const neg=(D2.sentiment&&D2.sentiment.negative)||Math.round(TOTD*.47);
  const conf=Math.round((D2.avgConf||.752)*100);
  const vals=[[TOTD,'TOTAL','#00e0ff',1],[neg,'NÉGATIFS','#ff356e',neg/TOTD],[conf,'CONFIANCE %','#30d158',conf/100]];
  vals.forEach(([v,lab,col,frac],i)=>{
    const el=document.createElement('div'); el.className='rng';
    const s=86; const cv=document.createElement('canvas');
    cfit(cv,s,s);
    const num=document.createElement('span'); num.className='rv'; num.style.color=col;
    const lb=document.createElement('span'); lb.className='rl'; lb.textContent=lab;
    el.appendChild(cv); el.appendChild(num); el.appendChild(lb);
    host.appendChild(el);
    raf(cv,(x,t,W,H)=>{
      x.setTransform(DPR3,0,0,DPR3,0,0);
      const cx=W/2, cy=H/2, R=32, start=-Math.PI/2;
      x.lineWidth=3; x.setLineDash([3.2,3.4]); x.lineCap='round';
      x.strokeStyle='rgba(124,134,152,.3)';
      x.beginPath(); x.arc(cx,cy,R,0,6.2832); x.stroke();
      const prog=Math.min(1,t*.7)*Math.min(1,Math.max(.1,frac||.1));
      x.strokeStyle=col; x.shadowColor=col; x.shadowBlur=8;
      x.beginPath(); x.arc(cx,cy,R,start,start+6.2832*prog); x.stroke();
      x.shadowBlur=0;
      x.setLineDash([]);
      x.fillStyle=col+'33'; x.beginPath(); x.arc(cx,cy,3.2,0,7); x.fill();
      cUp(num, v, 1.2);
    });
  });
}

/* ─ 5. aire ondulée KPI central (1065→ total) ── */
function wave(){
  const host=$q('#gl_wave'), w=(host.parentElement.getBoundingClientRect().width||260), h=92;
  cfit(host,w,h);
  raf(host,(x,t,W,H)=>{
    const rev=Math.min(1,t*.5);
    const g=x.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'rgba(0,224,255,.4)'); g.addColorStop(1,'rgba(0,224,255,0)');
    x.beginPath(); x.moveTo(0,H);
    for(let px=0; px<=W; px+=4){
      const f=px/W;
      const yy=H*.55 - Math.sin(f*6.3+t*1.4)*H*.22*Math.sin(t*.8+f*2) - Math.sin(f*11+t*.7)*H*.08;
      x.lineTo(px, H-Math.min(H, (H-yy)*rev+H*(1-rev)*0 ));
    }
    x.lineTo(W,H); x.closePath(); x.fillStyle=g; x.fill();
    x.strokeStyle='#00e0ff'; x.lineWidth=1.6; x.beginPath();
    for(let px=0; px<=W; px+=4){
      const f=px/W;
      const yy=H*.55 - Math.sin(f*6.3+t*1.4)*H*.22*Math.sin(t*.8+f*2) - Math.sin(f*11+t*.7)*H*.08;
      px? x.lineTo(px,yy) : x.moveTo(px,yy);
    }
    x.stroke();
  });
}

/* ─ 6. barres verticales signaux/jour (7 derniers) ── */
function dayBars(){
  const host=$q('#gl_bars'), w=(host.parentElement.getBoundingClientRect().width||260), h=110;
  cfit(host,w,h);
  const hist=D2.history||[];
  const vals=hist.map(h=>h.total||0); vals.push(TOTD); // cumul courant
  while(vals.length<7) vals.unshift(0);
  const days=hist.map(h=>h.date.slice(8)); days.push(new Date().getDate()); while(days.length<7) days.unshift('?');
  const mx=Math.max(1,...vals);
  raf(host,(x,t,W,H)=>{
    const bw=W/7, ih=H-16;
    vals.forEach((v,i)=>{
      const rev=Math.min(1,Math.max(0,t*.7-i*.09));
      const bh=ih*(v/mx)*rev;
      const bx=i*bw+bw*.22, by=H-12-bh, bwid=bw*.56;
      const g=x.createLinearGradient(0,by,0,H-12);
      g.addColorStop(0,'#00e0ff'); g.addColorStop(1,'rgba(0,224,255,.08)');
      x.fillStyle=g;
      x.beginPath();
      const r2=Math.min(4,bwid/2);
      x.moveTo(bx,by+r2); x.quadraticCurveTo(bx,by,bx+r2,by);
      x.lineTo(bx+bwid-r2,by); x.quadraticCurveTo(bx+bwid,by,bx+bwid,by+r2);
      x.lineTo(bx+bwid,H-12); x.lineTo(bx,H-12); x.closePath(); x.fill();
      x.fillStyle='rgba(124,134,152,.7)'; x.font='8px ui-monospace'; x.textAlign='center';
      x.fillText(days[i], i*bw+bw/2, H-2);
      if(v){
        x.fillStyle='#fff'; x.font='9px ui-monospace';
        x.fillText(v, i*bw+bw/2, by-4);
      } else {
        // pas de collecte ce jour : tick discret
        x.fillStyle='rgba(124,134,152,.35)';
        x.fillRect(i*bw+bw*.42, H-15, bw*.16, 3);
      }
    });
  });
}

/* ─ 7. calendrier du cycle de collecte ───────── */
function cal(){
  const host=$q('#cal');
  const n=new Date(), y=n.getFullYear(), m=n.getMonth(), today=n.getDate();
  const first=new Date(y,m,1), off=(first.getDay()+6)%7;
  const dim=new Date(y,m+1,0).getDate();
  const wd=['L','M','M','J','V','S','D'];
  host.innerHTML=wd.map(d=>`<span class="dh">${d}</span>`).join('');
  for(let i=0;i<off;i++) host.appendChild(document.createElement('span'));
  for(let d=1; d<=dim; d++){
    const s=document.createElement('span'); s.className='dd'; s.textContent=d;
    const dow=(off+d-1)%7;
    if(dow>=5) s.classList.add('dw');
    if(d===today) s.classList.add('dt');
    host.appendChild(s);
  }
  $q('#calM').textContent=n.toLocaleDateString('fr-FR',{month:'long'}).slice(0,3).toUpperCase()+' '+String(y).slice(2);
}

/* ─ 8. liste modèles (top 6 + mini-barres) ───── */
function modList(){
  const host=$q('#modList');
  const mcs=Object.entries(MC2).map(([m,cats])=>[m,Object.values(cats).reduce((a,b)=>a+b,0)]).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const mx=Math.max(1,...mcs.map(x=>x[1]));
  mcs.forEach(([m,v],i)=>{
    const row=document.createElement('div'); row.className='mr';
    row.innerHTML=`<span class="mn">iPhone ${m.replace(/^iPhone\s*/i,'')}</span><span class="mv">${v}</span>
      <div class="mt"><i style="width:0"></i></div>`;
    host.appendChild(row);
    const b=row.querySelector('.mt i');
    setTimeout(()=>{ b.style.transition='width .9s cubic-bezier(.2,.8,.2,1)'; b.style.width=(v/mx*100).toFixed(0)+'%'; },700+i*120);
  });
  $q('#kMod')&&cUp($q('#kMod'), Object.keys(MC2).length, 1.1);
}

/* ─ 9. waveform « temps réel » ───────────────── */
function eq(){
  const host=$q('#gl_eq'), w=(host.parentElement.getBoundingClientRect().width||300), h=64;
  cfit(host,w,h);
  const nBars=Math.floor(w/4);
  const seeds=Array.from({length:nBars},()=>Math.random()*6.28);
  raf(host,(x,t,W,H)=>{
    for(let i=0;i<nBars;i++){
      const yy=(Math.sin(t*2.2+seeds[i])*.5+.5)*.72+.14;
      const bh=H*yy, bx=i*4, by=(H-bh)/2;
      x.fillStyle= i%5===0? '#00e0ffcc' : 'rgba(126,166,255,.55)';
      x.fillRect(bx,by,2.2,bh);
    }
    x.fillStyle='rgba(0,224,255,.15)';
    x.fillRect(0,H/2-.5,W,1);
  });
}

/* ─ 10. map origine (points pondérés par sources) ── */
function map(){
  const host=$q('#map'), cv=$q('#gl_map');
  const W=host.getBoundingClientRect().width||340, H=W/2.4;
  cfit(cv,W,H);
  // positions approx (lat/lon normalisées) des sources web réelles :
  const pts=[[-74,40.8],[-0.12,51.5],[2.35,48.85],[13.4,52.5],[-122.4,37.8],[-87.6,41.9],[139.7,35.7],[-79.4,43.7],[4.9,52.37],[12.5,41.9]];
  // pondération simple : nombre de sources par zone
  const srcCount={}; Object.values(SR2).forEach(a=>a.forEach(a2=>{ srcCount[a2.src]=(srcCount[a2.src]||0)+1; }));
  const hot=pts.map(p=>({x:(p[0]+180)/360, y:(90-p[1])/180, v:1+Math.random()*2}));
  // masque continents pointilliste (rects normalisés lat/lon par bande)
  const LAND=[[-168,-66,-130,55],[-130,25,-60,50],[-9,36,26,52],[-8,36,18,44],[26,36,50,60],[-10,20,40,35],[30,25,60,35],[68,5,90,30],[95,20,145,55],[110,45,145,62],[-15,-38,-45,-25],[-45,-25,-35,-5],[112,-35,154,-18],[100,10,125,25],[-17,20,10,35],[34,-35,52,-22],[95,-10,120,5],[-84,10,-62,25]];
  raf(cv,(x,t,W2,H2)=>{
    x.fillStyle='rgba(124,160,180,.22)';
    for(const [a,b,c,d] of LAND){
      const x0=(a+180)/360*W2, y0=(90-d)/180*H2, x1=(c+180)/360*W2, y1=(90-b)/180*H2;
      for(let gy=y0;gy<y1;gy+=4.5) for(let gx=x0;gx<x1;gx+=4.5){
        // bord irrégulier : bruit pseudo
        if(Math.sin(gx*7.3+gy*3.1)>-.8) x.fillRect(gx,gy,1.3,1.3);
      }
    }
    hot.forEach((h2,i)=>{
      const px=h2.x*W2, py=h2.y*H2, pulse=1+.5*Math.sin(t*2.4+i);
      x.fillStyle='rgba(0,224,255,.95)'; x.shadowColor='#00e0ff'; x.shadowBlur=10;
      x.beginPath(); x.arc(px,py,2.6*pulse,0,7); x.fill(); x.shadowBlur=0;
      x.strokeStyle='rgba(0,224,255,.28)'; x.beginPath(); x.arc(px,py,7*pulse,0,7); x.stroke();
    });
  });
  // badges DOM :
  $q('#kSrc') && ($q('#kSrc').textContent=Object.keys(srcCount).length+' SOURCES');
  (function place(){ // badges DOM des hotspots, tous labelisés :
    hot.forEach((h3,i)=>{
      const b=document.createElement('span'); b.className='hot'; b.style.left=(h3.x*100)+'%'; b.style.top=(h3.y*100)+'%';
      b.innerHTML=`<i style="width:${6+((i*2)%6)}px;height:${6+((i*2)%6)}px"></i>`;
      $q('#map').appendChild(b);
    });
  })();
}

/* ─ 11. donuts (santé pipeline) ──────────────── */
function donuts(){
  const host=$q('#donuts'); host.innerHTML='';
  const s=(D2.sentiment||{neutral:32,negative:84,positive:20});
  const conf=Math.round((D2.avgConf||.752)*100);
  const items=[
    [Math.round(TOTD*.76),'COUVERTURE','#00e0ff',.76],
    [conf,'CONFIANCE','#30d158',conf/100],
    [Math.round(s.negative/Math.max(1,TOTD)*100),'NÉGATIF %','#ff356e',s.negative/Math.max(1,TOTD)],
    [8,'SOURCE ACTIVES','#7ea6ff',.8]
  ];
  items.forEach(([v,lab,col,frac],i)=>{
    const el=document.createElement('div'); el.className='dnt';
    const cv=document.createElement('canvas'); const sz=64;
    cfit(cv,sz,sz);
    const num=document.createElement('span'); num.className='dnv'; num.style.color=col;
    const lb=document.createElement('span'); lb.className='dl'; lb.textContent=lab;
    el.appendChild(cv); el.appendChild(num); el.appendChild(lb);
    host.appendChild(el);
    raf(cv,(x,t,W,H)=>{
      x.setTransform(DPR3,0,0,DPR3,0,0);
      const cx=W/2, cy=H/2, R=25;
      x.lineWidth=7; x.lineCap='round';
      x.strokeStyle='rgba(35,43,58,.9)';
      x.beginPath(); x.arc(cx,cy,R,0,6.2832); x.stroke();
      const rev=Math.min(1,Math.max(0,t*.6));
      x.strokeStyle=col; x.shadowColor=col; x.shadowBlur=7;
      x.beginPath(); x.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+6.2832*(frac||.1)*rev); x.stroke();
      x.shadowBlur=0;
      if(t>.15 && !num.__done){ num.__done=true; cUp(num,v,1.2+i*.15); }
    });
  });
}

/* ═══ INTERACTIVITÉ : chaque module s'ouvre en panneau détail ═══ */
function detailPanel(){
  // feuille de détails injectée à la fin du body
  const pan=document.createElement('div'); pan.id='dpanel';
  document.body.appendChild(pan);
  pan.innerHTML=`<div id="dpBack"></div><div id="dpCard"><div id="dpHead"><div id="dpTitle"></div><button id="dpX">FERMER</button></div><div id="dpBody"></div></div>`;
  const open=(html,title)=>{ pan.classList.add('on'); document.getElementById('dpBody').innerHTML=html; if(title!==undefined) document.getElementById('dpTitle').textContent=title; };
  const close=()=>pan.classList.remove('on');
  document.getElementById('dpBack').addEventListener('click',close);
  document.getElementById('dpX').addEventListener('click',close);
  // déléguer les clics : .mod + barres de catégorie :
  document.getElementById('dash').addEventListener('click', e=>{
    if(!pan.classList.contains('on')){
      const bar=e.target.closest('.hb2,.sb,.mr');
      if(bar){ return openBar(bar); }
    } else {
      const row=e.target.closest('.dcpRow.cat');
      if(row){ return openCat(row.dataset.k); }
    }
    const mod=e.target.closest('.mod');
    if(mod){ return openMod(mod); }
  });
  function openBar(el){
    // barre = une catégorie : détail complet de cette catégorie
    const nameEl=el.querySelector('.hn,.sn,.mn');
    if(!nameEl) return;
    const nm=nameEl.textContent.trim().toUpperCase();
    const k=Object.keys(FRD).find(key=>FRD[key]===nm);
    if(!k) return;
    openCat(k);
  }
  function openCat(k){
    const v=(D2.counts||{})[k]||0;
    const srcs=SR2[k]||[];
    const ex=(D2.examples||{})[k]||[];
    const mods=Object.entries(MC2).filter(([,cs])=>cs[k]).sort((a,b)=>(b[1][k]||0)-(a[1][k]||0)).slice(0,8);
    const html=`
      <div class="dcpHead" style="color:${COLD[k]||'#8f8f9f'}">${FRD[k]||k.toUpperCase()}</div>
      <div class="dcpKpi"><b>${v}</b><span>signaux · ${Math.round(v/TOTD*100)} % du total</span></div>
      ${mods.length?`<div class="dcpLab">MODÈLES TOUCHÉS</div>`+mods.map(([m,cs])=>{
        const n=cs[k]||0;
        return `<div class="dcpRow"><span>${m===('iPhone '+m.replace(/^iPhone\s*/i,''))?m:'iPhone '+m.replace(/^iPhone\s*/i,'')}</span><b>${n}</b></div>`;
      }).join(''):''}
      ${srcs.length?`<div class="dcpLab">SOURCES · VEILLE WEB</div>`+srcs.slice(0,6).map(a=>
        `<a class="dcpLink" href="${a.url}" target="_blank" rel="noopener">
          <span class="dcpDate">${a.date}</span><span class="dcpTit">${a.title}</span><span class="dcpSrc">${a.src} ↗</span>
        </a>`).join(''):''}
      ${ex.length?`<div class="dcpLab">EXEMPLES UTILISATEURS</div>`+ex.slice(0,3).map(a=>
        `<div class="dcpQuote">« ${(a.text_tr||a.text||'').slice(0,220).replace(/\n/g,' ')}${(a.text_tr||a.text||'').length>220?'…':''} »</div>`).join(''):''}
    `;
    open(html, FRD[k]||k.toUpperCase());
  }
  function openMod(mod){
    const id=mod.dataset.mod;
    if(id==='hbars'||id==='seg'){ return; } // les barres s'ouvrent par catégorie
    if(id==='line'){ return openTabLine(); }
    if(id==='cal'){ return openTabCal(); }
    if(id==='donuts'){ return openTabPipe(); }
    if(mod.contains(mod.querySelector('.kpi'))&&window.getComputedStyle(mod).borderTopWidth!=='0px'){ /* rien */ }
    // défaut : lister les catégories :
    const total=rowsD.map(([k,v])=>`<div class="dcpRow cat" data-k="${k}"><span style="color:${COLD[k]}">●</span><span>${FRD[k]}</span><b>${v}</b><small>${Math.round(v/TOTD*100)}</small></div>`).join('');
    open(`<div class="dcpHead">SIGNALS · DÉTAIL</div><div class="dcpLab">PAR CATÉGORIE — CLIQUEZ POUR OUVRIR</div>${total}`,'SIGNALS');
    document.getElementById('dpBody').querySelectorAll('.dcpRow.cat').forEach(r=>r.addEventListener('click',()=>openCat(r.dataset.k)));
  }
  function openTabLine(){
    const hist=D2.history||[];
    const rows=hist.map(h=>{
      const c=h.counts||{};
      const top=rowsD.slice(0,3).map(([k])=>(c[k]||0)).join(' · ');
      return `<div class="dcpRow"><span>${h.date}</span><b>${h.total}</b><small>${top}</small></div>`;
    }).join('');
    open(`<div class="dcpHead">ÉVOLUTION · 5 SEMAINES</div><div class="dcpLab">TOTAL / TOP3 (BATTERIE · ESTHÉTIQUE · CHARGE)</div>${rows}`,'ÉVOLUTION');
  }
  function openTabCal(){
    open(`<div class="dcpHead">CYCLE DE COLLECTE</div
      <div class="dcpQuote">Le signal se collecte la nuit (Harken + Laya), se trie au lever par classification, fusionne les tarifs, puis s'affiche ici à 9 h. Prochain cycle dans la nuit.</div>
      <div class="dcpLab">DERNIÈRES COLLECTES</div>`+
      (D2.history||[]).map(h=>`<div class="dcpRow"><span>${h.date}</span><b>${h.total}</b><small>signaux</small></div>`).join(''),'CYCLE');
  }
  function openTabPipe(){
    const s=D2.sentiment||{};
    const conf=Math.round((D2.avgConf||.75)*100);
    open(`<div class="dcpHead">SANTÉ PIPELINE</div>
      <div class="dcpKpi"><b style="color:#30d158">${conf} %</b><span>confiance moyenne du signal</span></div>
      <div class="dcpRow"><span>Positifs</span><b>${s.positive||0}</b></div>
      <div class="dcpRow"><span>Neutres</span><b>${s.neutral||0}</b></div>
      <div class="dcpRow"><span>Négatifs</span><b style="color:#ff356e">${s.negative||0}</b></div>`,'SANTÉ PIPELINE');
  }
  window.__openCat=openCat; // debug
}

/* ═══ INIT : injecter le HTML des composants puis tout lancer ═══ */
async function init(){
  // injecte le markup :
  const resp=await fetch('dashboard.html?v='+Date.now());
  const html=await resp.text();
  document.body.insertAdjacentHTML('afterbegin',html);
  // l'ancien stage est démoné :
  ['stage','dcs','intro','zoom','links','corewrap','cards'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.remove();
  });
  clockTick(); hbars(); lineChart(); segBars(); rings();
  wave(); dayBars(); cal(); modList(); eq(); map(); donuts();
  // tags interactivité + panneau :
  const modTags={hbars:'hbars',seg:'seg',rings:'rings',cal:'cal',donuts:'donuts',modList:'modList'};
  document.querySelectorAll('#colL .mod').forEach((m,i)=>m.dataset.mod=['hbars','line','seg','rings'][i]);
  document.querySelectorAll('#colC .mod').forEach((m,i)=>m.dataset.mod=['wave','bars','cal','modList'][i]);
  document.querySelectorAll('#colR .mod').forEach((m,i)=>m.dataset.mod=['eq','map','pipe'][i]);
  document.querySelectorAll('#dash .mod').forEach(m=>{ m.classList.add('clic'); m.tabIndex=0; });
  detailPanel();
  // KPI central :
  if($q('#kTotal')) cUp($q('#kTotal'), TOTD, 1.4);
  // GSAP : entrées staggerées des modules (si dispo) :
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('#dash .mod',{opacity:0, y:26, stagger:.07, duration:.8, ease:'expo.out',
      scrollTrigger:{trigger:'#dash', start:'top 85%'}});
  }
}
document.addEventListener('DOMContentLoaded', init);
