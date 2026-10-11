/* ═══ CARTE DU MONDE — sources géolocalisées par pays ═══
   Chaque source = marqueur drapeau pays + arc animé vers le hub (FR).
   Animation = réelle : un arc = un article ingesté de cette source. */
'use strict';
const WSR={
  'GoldInvestors':  {c:'US', lat:40.7, lon:-74.0, name:'États-Unis'},
  'Techaeris':      {c:'US', lat:33.4, lon:-112.1, name:'États-Unis'},
  'Yahoo Tech':     {c:'US', lat:40.7, lon:-74.0, name:'États-Unis'},
  'Apple Community':{c:'US', lat:37.3, lon:-122.0, name:'États-Unis'},
  'Macworld':       {c:'US', lat:37.8, lon:-122.4, name:'États-Unis'},
  'MacObserver':    {c:'US', lat:35.2, lon:-80.8, name:'États-Unis'},
  'iFixit':         {c:'US', lat:35.4, lon:-120.6, name:'États-Unis'},
  'AppleInsider':   {c:'US', lat:40.7, lon:-74.0, name:'États-Unis'},
  'Forbes':         {c:'US', lat:40.6, lon:-73.8, name:'États-Unis'},
  '9to5Mac':        {c:'US', lat:37.5, lon:-122.0, name:'États-Unis'},
  'AstuceDeGeek':   {c:'FR', lat:48.85,lon:2.35,  name:'France'},
  'Mac4Ever':       {c:'FR', lat:45.75,lon:4.85,  name:'France'},
  'Frandroid':      {c:'FR', lat:47.2, lon:2.5,   name:'France'},
  'The Register':   {c:'UK', lat:51.5, lon:-0.1,  name:'Royaume-Uni'},
  'Husham':         {c:'TR', lat:41.0, lon:28.9,  name:'Turquie'}
};
const WCOLOR={'US':'#00e0ff','FR':'#30d158','UK':'#7ea6ff','TR':'#ff9f0a'};
const NCD={US:'ÉTATS-UNIS',FR:'FRANCE',UK:'ROYAUME-UNI',TR:'TURQUIE'};

/* Continent outlines simplifiés (lon,lat) equirect */
const LANDS={
  NA:[[-166,68],[-160,70],[-140,70],[-120,69],[-95,73],[-80,73],[-62,60],[-52,47],[-67,44],[-70,41],[-75,35],[-81,25],[-90,29],[-97,26],[-104,20],[-110,23],[-117,33],[-125,40],[-130,55],[-150,58],[-166,60]],
  SA:[[-81,8],[-75,10],[-61,10],[-52,5],[-45,-2],[-35,-6],[-38,-13],[-48,-25],[-58,-33],[-62,-40],[-65,-52],[-72,-54],[-75,-45],[-72,-30],[-70,-18],[-79,-5],[-81,4]],
  EU:[[-9,43],[-9,52],[-5,58],[5,58],[8,57],[4,52],[3,45],[7,44],[13,45],[19,40],[24,36],[27,41],[33,45],[38,44],[41,42],[46,42],[50,50],[42,60],[30,60],[25,65],[18,70],[10,65],[5,60]],
  AF:[[-17,15],[-16,22],[-10,30],[0,36],[10,37],[20,33],[32,31],[35,23],[43,12],[51,10],[43,-2],[40,-15],[35,-25],[30,-30],[22,-35],[17,-33],[12,-18],[8,-1],[0,4],[-8,5],[-14,12]],
  AS:[[46,42],[50,30],[56,25],[61,25],[66,25],[70,20],[72,20],[75,15],[80,10],[86,20],[92,22],[97,17],[100,13],[104,10],[107,21],[112,22],[118,24],[121,30],[122,40],[126,52],[135,60],[142,54],[157,56],[160,60],[140,73],[110,75],[80,73],[65,72],[55,68],[40,66]],
  OC:[[113,-22],[122,-17],[130,-11],[136,-12],[142,-11],[146,-19],[151,-26],[153,-31],[146,-39],[138,-36],[129,-32],[123,-33],[115,-32]],
  GR:[[-45,60],[-25,66],[-18,66],[-22,70],[-35,66]]
};
function proj(lon,lat,W,H){
  return [ (lon+180)/360*W, (90-lat)/180*H ];
}

function renderWorldMap(){
  const host=document.querySelector('#map'); if(!host) return;
  const cv=document.querySelector('#gl_map');
  const W=host.getBoundingClientRect().width||340, H=W/2.05;
  cv._w=W; cv._h=H; cv.width=W*Math.min(devicePixelRatio||1,2);
  cv.height=H*(devicePixelRatio||1);
  cv.getContext('2d').scale(Math.min(devicePixelRatio||1,2), Math.min(devicePixelRatio||1,2));
  cv.style.width=W+'px'; cv.style.height=H+'px';
  // hub = France (le site FR) :
  const HUB={lat:48.1, lon:1.8};
  // agrégeer les articles réels du jour :
  const arts=[];
  Object.entries((window.PULSE_SOURCES||{}).sources||{}).forEach(([cat,list])=>{
    list.forEach(a=>{
      const s=WSR[a.src]; if(!s) return;
      arts.push({cat, src:a.src, date:a.date, title:a.title, s});
    });
  });
  // un marqueur par PAYS (lisibilité à l'échelle carte) ; le détail
  // par source reste dans le panneau au clic (15 sources listées) :
  const byC2={};
  arts.forEach(a=>{ (byC2[a.s.c]=byC2[a.s.c]||{n:0,srcs:new Set()}); byC2[a.s.c].n++; byC2[a.s.c].srcs.add(a.src); });
  const CXY={US:{lat:39.5,lon:-98.5},FR:{lat:47.2,lon:2.6},UK:{lat:53.5,lon:-1.5},TR:{lat:39.8,lon:30.5}};
  const markers=Object.entries(byC2).map(([c,o])=>{
    const xy=CXY[c]||{lat:0,lon:0};
    return {c, lat:xy.lat, lon:xy.lon, n:o.n, srcs:[...o.srcs]};
  });
  // vols animés : chaque article déclenche un vol à sa date-heure
  // simulée (échelonné) : le vol EST un article réel.
  const flights=[];
  function seedFlights(base){
    arts.forEach((a,i)=>{
      flights.push({a, t0:base+i*0.9+Math.random()*0.4, dur:1.6+Math.random()*0.6, arrived:false});
    });
  }
  seedFlights(0.4);
  // DOM labels :
  host.querySelectorAll('.hot').forEach(x=>x.remove());
  const seenLat={};
  markers.forEach((mk,i)=>{
    // dés-agglomérer les labels des marqueurs superposés
    const peers2=markers.filter(o2=>Math.abs(o2.lon-mk.lon)<1.5&&Math.abs(o2.lat-mk.lat)<4&&o2!==mk);
    const idx2=peers2.indexOf(mk)+1;
    const jy=idx2?idx2*13:0;
    const el=document.createElement('span'); el.className='hot mk';
    el.style.left=(mk.lon+180)/360*100+'%';
    el.style.top=((90-mk.lat)/180*100)+jy/((host.getBoundingClientRect().height||180))+'%';
    el.dataset.c=mk.c;
    el.innerHTML=`<i style="background:${WCOLOR[mk.c]};box-shadow:0 0 9px ${WCOLOR[mk.c]}"></i>
      <b class="mkFlag" style="color:${WCOLOR[mk.c]}">${mk.c} · ${mk.n}</b>`;
    el.title=mk.srcs.join(', ');
    host.appendChild(el);
  });
  // compteur pays :
  const byC={}; markers.forEach(m=>{ byC[m.c]=(byC[m.c]||0)+m.n; });
  const legend=Object.entries(byC).map(([c,n])=>
    `<span class="lg"><i style="background:${WCOLOR[c]}"></i>${NCD[c]} <b>${n}</b></span>`).join('');
  if(host.parentElement) host.parentElement.querySelector('b').textContent=Object.keys(byC).length+' PAYS · '+arts.length+' SOURCES';
  let lgHost=document.querySelector('#mapLegend');
  if(!lgHost){ lgHost=document.createElement('div'); lgHost.id='mapLegend'; host.parentElement.appendChild(lgHost); }
  lgHost.innerHTML=legend;

  const x=cv.getContext('2d');
  const t0=performance.now();
  let lastBatch=0;
  (function loop(t){
    if(document.hidden){ requestAnimationFrame(loop); return; }
    const S=(t-t0)/1000;
    if(S-lastBatch>24){ lastBatch=S; seedFlights(S+0.4); }
    x.clearRect(0,0,W,H);
    // continents pointillistes :
    x.fillStyle='rgba(124,170,200,.55)';
    for(const key in LANDS){
      const poly=LANDS[key];
      for(let i=0;i<poly.length-1;i++){
        const [x1,y1]=proj(poly[i][0],poly[i][1],W,H);
        const [x2,y2]=proj(poly[i+1][0],poly[i+1][1],W,H);
        const steps=Math.max(2,Math.round(Math.hypot(x2-x1,y2-y1)/2.6));
        for(let k=0;k<=steps;k++){
          const px=x1+(x2-x1)*k/steps, py=y1+(y2-y1)*k/steps;
          x.fillRect(px-0.8,py-0.8,1.6,1.6);
        }
      }
    }
    // hub (FR) :
    const [hx,hy]=proj(HUB.lon,HUB.lat,W,H);
    // vols réels (1 arc = 1 article) :
    flights.forEach(f=>{
      const [sx,sy]=proj(f.a.s.lon,f.a.s.lat,W,H);
      const p=(S-f.t0)/f.dur;
      if(p<0||p>1) return;
      const ease=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      // courbe quad bezier (sommet vers le haut) :
      const cxp=(sx+hx)/2, cyp=Math.min(sy,hy)-Math.abs(hx-sx)*.22-24;
      const px=(1-ease)*(1-ease)*sx+2*(1-ease)*ease*cxp+ease*ease*hx;
      const py=(1-ease)*(1-ease)*sy+2*(1-ease)*ease*cyp+ease*ease*hy;
      // trace du sillage :
      x.strokeStyle=WCOLOR[f.a.s.c]+'66'; x.lineWidth=1.2;
      x.beginPath(); x.moveTo(sx,sy);
      for(let q=0;q<=ease;q+=0.06){
        const qx=(1-q)*(1-q)*sx+2*(1-q)*q*cxp+q*q*hx;
        const qy=(1-q)*(1-q)*sy+2*(1-q)*q*cyp+q*q*hy;
        x.lineTo(qx,qy);
      }
      x.stroke();
      // tête lumineuse :
      x.fillStyle=WCOLOR[f.a.s.c];
      x.shadowColor=WCOLOR[f.a.s.c]; x.shadowBlur=7;
      x.beginPath(); x.arc(px,py,2.4,0,7); x.fill(); x.shadowBlur=0;
      // flash du hub à l'arrivée :
      if(ease>0.97&&!f.arrived){ f.arrived=true; document.querySelector('#map').classList.remove('pulse'); void document.querySelector('#map').offsetWidth; document.querySelector('#map').classList.add('pulse'); }
    });
    // halo hub + anneau :
    x.strokeStyle='rgba(0,224,255,.5)'; x.lineWidth=1.3;
    x.beginPath(); x.arc(hx,hy,4+2.5*Math.sin(S*2.4),0,7); x.stroke();
    x.shadowColor='#00e0ff'; x.shadowBlur=8;
    x.fillStyle='#00e0ff'; x.beginPath(); x.arc(hx,hy,2.8,0,7); x.fill(); x.shadowBlur=0;
    // marqueurs : SPIDERFY aux positions identiques (les 9 US East
    // partagent ~(-74,40) : les écarter en éventail lisible)
    markers.forEach((mk,i)=>{
      let [px,py]=proj(mk.lon,mk.lat,W,H);
      const sameL=markers.filter(o2=>o2.mk===undefined&&Math.abs(o2.lon-mk.lon)<1.5&&Math.abs(o2.lat-mk.lat)<4);
      const peers=markers.filter(o2=>Math.abs(o2.lon-mk.lon)<1.5&&Math.abs(o2.lat-mk.lat)<4&&o2!==mk);
      if(peers.length){
        const idx=peers.indexOf(mk)+1;
        const a2=-Math.PI/2+idx*(Math.PI*1.3/(peers.length+1));
        const R2=10+Math.min(16,peers.length*2.4);
        px+=Math.cos(a2)*R2; py+=Math.abs(Math.sin(a2))*R2*.9;
      }
      const col=WCOLOR[mk.c];
      x.shadowColor=col; x.shadowBlur=6;
      x.fillStyle=col; x.beginPath(); x.arc(px,py,3.2,0,7); x.fill();
      x.shadowBlur=0;
      x.strokeStyle=col+'44'; x.beginPath(); x.arc(px,py,6+2*Math.sin(S*2+i),0,7); x.stroke();
    });
    // label hub :
    x.fillStyle='rgba(0,224,255,.9)'; x.font='7px ui-monospace'; x.textAlign='center';
    x.fillText('HUB · FR', hx, hy-11);
    requestAnimationFrame(loop);
  })(t0);
}
window.renderWorldMap=renderWorldMap;
window.WSR=WSR; window.WCOLOR=WCOLOR; window.NCD=NCD;
