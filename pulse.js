/* Pulse — hypermotion + graphiques + 3D (three.js pur, aucun asset externe) */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'https://unpkg.com/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js';

/* ---------- données ---------- */
const DATA = window.PULSE_DATA;
const CAT_META = {
  screen:       { label:'Écran / affichage',            color:'#2997ff', icon:'📱', part:'screen' },
  battery:      { label:'Batterie',                     color:'#30d158', icon:'🔋', part:'battery' },
  warranty:     { label:'Garantie / AppleCare',         color:'#ffd60a', icon:'🛡️', part:'mid' },
  pricing:      { label:'Prix / tarifs',                color:'#64d2ff', icon:'💶', part:'mid' },
  sensory:      { label:'Sensoriel (son, Face ID, caméra)', color:'#bf5af2', icon:'🎙️', part:'sensory' },
  system_bug:   { label:'Bug système / iOS',            color:'#ff453a', icon:'⚠️', part:'mid' },
  emerging:     { label:'Problème émergent',            color:'#ff9f0a', icon:'🌊', part:'screen' },
  service:      { label:'Expérience SAV',               color:'#30b0c7', icon:'🧑‍🔧', part:'mid' },
  process:      { label:'Procédure / DIY',              color:'#8e8e93', icon:'🔧', part:'back' },
  news:         { label:'Actualité',                    color:'#7d7aff', icon:'📰', part:'mid' },
  other:        { label:'Autre',                        color:'#48484a', icon:'•', part:'mid' },
};

const ICONS = {"screen": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#2997ff\" stroke-width=\"2\"><rect x=\"6\" y=\"2\" width=\"12\" height=\"20\" rx=\"2.5\"/><path d=\"M9 20h6\" stroke-linecap=\"round\"/></svg>", "battery": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#30d158\" stroke-width=\"2\"><rect x=\"2\" y=\"8\" width=\"17\" height=\"9\" rx=\"2\"/><path d=\"M21.5 11.5v3\" stroke-linecap=\"round\"/></svg>", "warranty": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#ffd60a\" stroke-width=\"2\"><path d=\"M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z\"/></svg>", "pricing": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#64d2ff\" stroke-width=\"2\"><circle cx=\"9\" cy=\"9\" r=\"6\"/><circle cx=\"15\" cy=\"15\" r=\"6\"/></svg>", "sensory": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#bf5af2\" stroke-width=\"2\"><rect x=\"4\" y=\"10\" width=\"3\" height=\"8\" rx=\"1.5\"/><rect x=\"10\" y=\"6\" width=\"3\" height=\"12\" rx=\"1.5\"/><rect x=\"16\" y=\"12\" width=\"3\" height=\"6\" rx=\"1.5\"/></svg>", "system_bug": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#ff453a\" stroke-width=\"2\"><path d=\"M12 3l10 18H2z\" stroke-linejoin=\"round\"/><path d=\"M12 10v4\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"17\" r=\"0.6\" fill=\"#ff453a\" stroke=\"none\"/></svg>", "emerging": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#ff9f0a\" stroke-width=\"2\"><path d=\"M3 16c3-6 6 4 9-2s6 2 9-4\" stroke-linecap=\"round\"/></svg>", "service": "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='#30b0c7' stroke-width='2'><path d='M4 13a8 8 0 0116 0'/><rect x='2.5' y='13' width='4' height='6' rx='1.8'/><rect x='17.5' y='13' width='4' height='6' rx='1.8'/><path d='M19 19a3 3 0 01-3 2h-2'/></svg>", "process": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#8e8e93\" stroke-width=\"2\"><path d=\"M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.9 2.9-2.1-2.1z\" stroke-linejoin=\"round\"/></svg>", "news": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"#7d7aff\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"14\" height=\"16\" rx=\"2\"/><path d=\"M7 8h6M7 12h6M17 8v10\"/></svg>", "other": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"#48484a\"><circle cx=\"12\" cy=\"12\" r=\"4\"/></svg>"};

/* ---------- hero canvas : constellation bleue ---------- */
(function hero(){
  const cv = document.getElementById('heroCanvas');
  const ctx = cv.getContext('2d');
  let W, H, parts = [];
  function resize(){ W = cv.width = cv.offsetWidth * devicePixelRatio; H = cv.height = cv.offsetHeight * devicePixelRatio; }
  addEventListener('resize', resize); resize();
  const N = Math.min(90, Math.floor(innerWidth/14));
  for (let i=0;i<N;i++) parts.push({
    x:Math.random()*W, y:Math.random()*H,
    vx:(Math.random()-.5)*.24, vy:(Math.random()-.5)*.24,
    r:(Math.random()*1.6+.5)*devicePixelRatio, a:Math.random()*.5+.15
  });
  (function frame(){
    ctx.clearRect(0,0,W,H);
    for (const p of parts){
      p.x+=p.vx; p.y+=p.vy;
      if (p.x<0||p.x>W) p.vx*=-1; if (p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7);
      ctx.fillStyle = `rgba(41,151,255,${p.a})`; ctx.fill();
    }
    const lim = 130*devicePixelRatio;
    for (let i=0;i<parts.length;i++) for (let j=i+1;j<parts.length;j++){
      const a=parts[i], b=parts[j], d=Math.hypot(a.x-b.x,a.y-b.y);
      if (d < lim){
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle = `rgba(0,113,227,${(1-d/lim)*.15})`;
        ctx.lineWidth = devicePixelRatio*.7; ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  })();
})();

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es=>es.forEach(e=>{
  if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* ---------- compteurs animés ---------- */
function countUp(el, target, suffix=''){
  const t0 = performance.now(), dur = 1400;
  (function step(t){
    const k = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-k,3);
    el.textContent = Math.round(target*e) + suffix;
    if (k<1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- donut ---------- */
function drawDonut(counts, total){
  const cv = document.getElementById('donut');
  const dpr = devicePixelRatio;
  const w = Math.min(330, cv.parentElement.clientWidth-52);
  cv.width = w*dpr; cv.height = w*dpr; cv.style.height = w+'px';
  cv.style.width = w+'px';
  const ctx = cv.getContext('2d'); ctx.scale(dpr,dpr);
  const cx = w/2, cy = w/2, R = w/2-14, rI = w/2-46;
  let a0 = -Math.PI/2;
  for (const [k,v] of Object.entries(counts).filter(([,v])=>v>0)){
    const a1 = a0 + v/total*Math.PI*2;
    ctx.beginPath(); ctx.arc(cx,cy,R,a0+.016,a1-.016); ctx.arc(cx,cy,rI,a1-.016,a0+.016,true);
    ctx.closePath(); ctx.fillStyle = CAT_META[k]?.color || '#666'; ctx.fill();
    a0 = a1;
  }
  ctx.fillStyle = '#f5f5f7'; ctx.textAlign='center';
  ctx.font = `600 ${Math.round(w*.19)}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText(total, cx, cy+w*.025);
  ctx.font = `500 ${Math.round(w*.056)}px -apple-system`;
  ctx.fillStyle='rgba(245,245,247,.55)';
  ctx.fillText('MENTIONS', cx, cy+w*.12);
}

/* ---------- bars émergents ---------- */
function drawBars(rows){
  const host = document.getElementById('barsEmergent');
  host.innerHTML = rows.map(r=>`
    <div class="bar-row">
      <div class="nm">${r.label}</div>
      <div class="tr"><i data-w="${r.pct}"></i></div>
      <div class="pc">${r.pct.toFixed(1)}%${r.up?'<em>▲</em>':''}</div>
    </div>`).join('');
  const io2 = new IntersectionObserver(es=>es.forEach(e=>{
    if (e.isIntersecting){
      e.target.querySelectorAll('.tr i').forEach(i=>i.style.width = i.dataset.w+'%');
      io2.unobserve(e.target);
    }
  }), {threshold:.3});
  io2.observe(host);
}

/* ---------- ticker citations ---------- */
function fillTicker(items){
  const t = document.getElementById('ticker');
  const all = items.concat(items);
  t.innerHTML = all.map(q=>{
    const cls = q.sent==='negative'?'neg':q.sent==='positive'?'pos':'';
    return `<div class="tq"><span class="tag">${q.tag}</span><span class="${cls}">« ${q.text} »</span></div>`;
  }).join('');
}

/* ---------- 3D viewer ---------- */
const PART_ANCHORS = {
  screen:  [0, .5, .17],
  battery: [0, -1.5, -.2],
  sensory: [0, 1.05, -.2],
  mid:     [.12, .15, -.2],
  back:    [.7, .8, -.19],
  camera:  [-.5, 1.62, -.3],
};
const PART_LABELS = {
  screen:'Écran (face avant)', battery:'Batterie (arrière, bas)',
  sensory:'Haut-parleurs / vis / micro (arrière, haut)', mid:'Carte logique (arrière, centre)',
  back:'Boîtier / dos en verre', camera:'Module caméra (arrière, coin)',
};
function initViewer(){
  const cv = document.getElementById('viewer');
  const renderer = new THREE.WebGLRenderer({canvas:cv, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, .1, 50);
  scene.add(new THREE.AmbientLight(0xffffff, .78));
  const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(3,5,4); scene.add(key);
  const rim = new THREE.PointLight(0x2997ff, 16, 22); rim.position.set(-4,2,-3); scene.add(rim);
  const rim2 = new THREE.PointLight(0x2997ff, 12, 20); rim2.position.set(4.5,-1,3.5); scene.add(rim2);
    const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32),
      new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:.5}));
    shadowDisc.rotation.x = -Math.PI/2; shadowDisc.position.y = -2.9;
    scene.add(shadowDisc);
  const root = new THREE.Group(); scene.add(root);

  function buildPhone(model){
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new RoundedBoxGeometry(2.15, 4.4, .32, 6, .34),
      new THREE.MeshPhysicalMaterial({
        color:new THREE.Color(model.bodyColor), metalness:.62, roughness:.32,
        clearcoat:.9, clearcoatRoughness:.18}));
    g.add(body);
    const scr = new THREE.Mesh(
      new RoundedBoxGeometry(2.0, 4.26, .05, 4, .26),
      new THREE.MeshPhysicalMaterial({color:0x05070d, metalness:.1, roughness:.16,
        clearcoat:1, clearcoatRoughness:.06, emissive:0x0e2444, emissiveIntensity:.85}));
    scr.position.z = .155; g.add(scr);
    const isl = new THREE.Mesh(new RoundedBoxGeometry(.56,.17,.03,3,.08),
      new THREE.MeshPhysicalMaterial({color:0x000, roughness:.28}));
    isl.position.set(0,1.86,.185); g.add(isl);
    const back = new THREE.Mesh(new RoundedBoxGeometry(2.02,4.24,.04,4,.26),
      new THREE.MeshPhysicalMaterial({color:new THREE.Color(model.backColor),
        metalness:.35, roughness:.42, clearcoat:.7}));
    back.position.z = -.16; g.add(back);
    const camB = new THREE.Mesh(new RoundedBoxGeometry(.86,.86,.12,4,.2),
      new THREE.MeshPhysicalMaterial({color:new THREE.Color(model.backColor),
        metalness:.7, roughness:.3}));
    camB.position.set(-.5,1.62,-.22); g.add(camB);
    for (const [dx,dy] of [[-.19,.18],[.19,.18],[-.19,-.18],[.19,-.18]]){
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.09,24),
        new THREE.MeshPhysicalMaterial({color:0x0a0d14, metalness:.9, roughness:.12}));
      lens.rotation.x = Math.PI/2;
      lens.position.set(-.5+dx, 1.62+dy, -.285); g.add(lens);
    }
    const bat = new THREE.Mesh(new RoundedBoxGeometry(1.7,1.5,.06,3,.1),
      new THREE.MeshPhysicalMaterial({color:0x0d3320, metalness:.2, roughness:.5,
        emissive:0x118f48, emissiveIntensity:.42}));
    bat.position.set(0,-1.5,-.175); bat.visible=false; g.add(bat);
    const board = new THREE.Mesh(new RoundedBoxGeometry(1.15,1.35,.05,3,.06),
      new THREE.MeshPhysicalMaterial({color:0x08130a, metalness:.3, roughness:.4,
        emissive:0x1e7f3c, emissiveIntensity:.42}));
    board.position.set(.12,.15,-.175); board.visible=false; g.add(board);
    const spk = new THREE.Mesh(new RoundedBoxGeometry(.9,.24,.05,2,.05),
      new THREE.MeshPhysicalMaterial({color:0x140022, emissive:0x7a3cff, emissiveIntensity:.5,
        metalness:.3, roughness:.4}));
    spk.position.set(0,1.05,-.175); spk.visible=false; g.add(spk);
    g.userData = {bat, board, spk, scr};
    return g;
  }

  let phone = buildPhone(window.PULSE_MODELS[0]);
  root.add(phone);

  const dots = {};
  for (const [k,p] of Object.entries(PART_ANCHORS)){
    const m = new THREE.Mesh(new THREE.SphereGeometry(.09,18,18),
      new THREE.MeshBasicMaterial({color:0x2997ff, transparent:true, opacity:.94}));
    m.position.set(...p); m.visible=false; phone.add(m); dots[k]=m;
  }

  function showDot(key){
    for (const [k,d] of Object.entries(dots)) d.visible = (k===key);
    const u = phone.userData;
    u.bat.visible    = (key==='battery');
    u.board.visible  = (key==='mid');
    u.spk.visible    = (key==='sensory');
    u.scr.material.emissiveIntensity = (key==='screen') ? 1.3 : .62;
    const backish = ['battery','mid','sensory','camera','back'].includes(key);
    const from = root.rotation.y;
    const to = backish ? Math.PI : 0;
    const t0 = performance.now();
    (function st(t){
      const k2 = Math.min(1,(t-t0)/650), e = 1-Math.pow(1-k2,3);
      // rotation la plus courte
      let delta = to - (from % (Math.PI*2));
      if (delta > Math.PI) delta -= Math.PI*2;
      if (delta < -Math.PI) delta += Math.PI*2;
      root.rotation.y = from + delta*e;
      if (k2<1) requestAnimationFrame(st);
    })(t0);
  }

  let drag=false, px=0, py=0, ry=.62, rx=-.34, dist=6.4;
  cv.addEventListener('pointerdown', e=>{drag=true; px=e.clientX; py=e.clientY;});
  addEventListener('pointerup', ()=>drag=false);
  addEventListener('pointermove', e=>{
    if (!drag) return;
    ry += (e.clientX-px)*.008; rx += (e.clientY-py)*.005;
    rx = Math.max(-.75, Math.min(.75, rx)); px=e.clientX; py=e.clientY;
  });
  cv.addEventListener('wheel', e=>{
    e.preventDefault();
    dist = Math.max(3.8, Math.min(9, dist + e.deltaY*.004));
  }, {passive:false});
  let pinch0=null;
  cv.addEventListener('touchstart', e=>{
    if (e.touches.length===2) pinch0 = Math.hypot(
      e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
  }, {passive:true});
  cv.addEventListener('touchmove', e=>{
    if (e.touches.length===2 && pinch0){
      const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX,
                           e.touches[0].clientY-e.touches[1].clientY);
      dist = Math.max(3.8, Math.min(9, dist*(pinch0/d))); pinch0 = d; e.preventDefault();
    }
  }, {passive:false});

  function resize(){
    const w = cv.clientWidth || 350, h = cv.clientHeight || Math.round(w/.86);
    if (w < 20 || h < 20) return;
    renderer.setSize(w, h, false);
    cam.aspect = w/h; cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  setTimeout(resize, 60); setTimeout(resize, 400);
  requestAnimationFrame(resize);

  let tLast = 0;
  (function loop(t){
    const dt = Math.min(50, t-(tLast||t)); tLast = t;
    if (!drag) ry += .00014*dt;
    root.rotation.y += (((ry*.55) - root.rotation.y) * .1);
    root.rotation.x += (((rx*.4) - root.rotation.x) * .1);
    cam.position.z += ((dist - cam.position.z) * .12);
    const s = 1 + Math.sin(t*.004)*.25;
    for (const d of Object.values(dots)) if (d.visible) d.scale.setScalar(s);
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  })(0);

  return { buildPhone, showDot, phone, root };
}

/* ---------- orchestration ---------- */
const counts = DATA.counts, total = DATA.total;
countUp(document.getElementById('kpi-mentions'), total);
countUp(document.getElementById('kpi-problems'), Object.keys(counts).length);
countUp(document.getElementById('kpi-neg'), Math.round((DATA.sentiment.negative||0)/total*100), '%');
document.getElementById('kpi-period').textContent = DATA.period;
countUp(document.getElementById('kpi-conf'), Math.round(DATA.avgConf*100), '%');
document.querySelector('.kpi:nth-child(3) .sub').textContent = `${DATA.sentiment.negative} mentions négatives`;

drawDonut(counts, total);
document.getElementById('legend').innerHTML = Object.entries(counts)
  .sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
    <span class="li"><span class="sw" style="background:${CAT_META[k]?.color}"></span>
    ${CAT_META[k]?.label} <b>${(v/total*100).toFixed(1)}%</b></span>`).join('');

const avg = 100/Math.max(1,Object.keys(counts).length);
const rows = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>({
  label: CAT_META[k]?.label || k, pct: v/total*100, up: v/total*100 > avg*1.6
}));
drawBars(rows);

document.getElementById('s-pos').textContent = `${Math.round((DATA.sentiment.positive||0)/total*100)}%`;
document.getElementById('s-neu').textContent = `${Math.round((DATA.sentiment.neutral||0)/total*100)}%`;
document.getElementById('s-neg').textContent = `${Math.round((DATA.sentiment.negative||0)/total*100)}%`;

fillTicker((DATA.quotes||[]).map(q=>({tag:CAT_META[q.cat]?.label||q.cat, text:q.text, sent:q.sent})));

const vw = initViewer();
const tabsEl = document.getElementById('modelTabs');
window.PULSE_MODELS.forEach((m, i)=>{
  const b = document.createElement('button');
  b.className = 'mtab' + (i===0?' on':''); b.textContent = m.name;
  b.onclick = ()=>{
    tabsEl.querySelectorAll('.mtab').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    const np = vw.buildPhone(m);
    vw.root.add(np); vw.root.remove(vw.phone);
    vw.phone = np;
    // remettre les dots sur le nouveau téléphone
    for (const [k,p] of Object.entries(PART_ANCHORS)){
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.09,18,18),
        new THREE.MeshBasicMaterial({color:0x2997ff, transparent:true, opacity:.94}));
      dot.position.set(...p); dot.visible=false; np.add(dot);
      vw.dots[k] = dot;
    }
    const cur = document.querySelector('.issu.on');
    if (cur) vw.showDot(cur.dataset.k);
  };
  tabsEl.appendChild(b);
});

const list = document.getElementById('issueList');
const seen = new Set();
Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>{
  const m = CAT_META[k]; if (!m || seen.has(m.part)) return;
  seen.add(m.part);
  const d = document.createElement('div');
  d.className = 'issu'; d.dataset.k = m.part;
  d.innerHTML = `<div class="ic">${ICONS[k]}</div>
    <div class="tx"><b>${m.label}</b><span>${v} mention${v>1?'s':''}  ·  classée au sein du signal</span></div>
    <div class="pct" style="color:${m.color}">${(v/total*100).toFixed(0)}%</div>`;
  d.onclick = ()=>{
    list.querySelectorAll('.issu').forEach(x=>x.classList.remove('on'));
    d.classList.add('on');
    vw.showDot(m.part);
  };
  list.appendChild(d);
});
if (list.children[0]) list.children[0].click();
