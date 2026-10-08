/* ============ PULSE DASH — Genius Bar Ops ============ */
/* Graphique futuriste, animé, sans 3D. Fond noir, néon, mono. */
const DATA = window.PULSE_DATA;
const HIST = window.PULSE_HISTORY || [];
const ICONS = {"process": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>", "battery": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"1\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\" ry=\"2\"/><line x1=\"23\" y1=\"13\" x2=\"23\" y2=\"11\"/><line x1=\"5\" y1=\"10\" x2=\"5\" y2=\"14\"/><line x1=\"9\" y1=\"10\" x2=\"9\" y2=\"14\"/></svg>", "screen": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"/><line x1=\"10\" y1=\"18\" x2=\"14\" y2=\"18\"/></svg>", "service": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 18v-6a9 9 0 0 1 18 0v6\"/><path d=\"M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z\"/></svg>", "system_bug": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"/><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/></svg>", "pricing": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"23\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>", "warranty": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg>", "sensory": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M18 11V6a2 2 0 0 0-4 0v5\"/><path d=\"M14 10V4a2 2 0 0 0-4 0v6\"/><path d=\"M10 10.5V6a2 2 0 0 0-4 0v8\"/><path d=\"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15\"/></svg>", "emerging": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"23 6 13.5 15.5 8.5 10.5 1 18\"/><polyline points=\"17 6 23 6 23 12\"/></svg>"};
const CAT_META = {
  process:     { label:'Procédure / DIY',        color:'#8e8e93', icon:'🛠️', desc:'Comment réparer soi-même — tutoriels, étapes, outillage.' },
  battery:     { label:'Batterie',               color:'#30d158', icon:'🔋', desc:'Autonomie, dégradation, remplacement de batterie.' },
  screen:      { label:'Écran / affichage',      color:'#2997ff', icon:'📱', desc:'Écran cassé, tactile, remplacement, prix d\'un écran.' },
  service:     { label:'Expérience SAV',         color:'#30b0c7', icon:'🧑‍🔧', desc:'SAV, délais, diagnostic, attitude des techniciens.' },
  system_bug:  { label:'Bug système / iOS',      color:'#ff453a', icon:'⚠️', desc:'Plantage, app, Wi-Fi, Bluetooth, lenteurs iOS.' },
  pricing:     { label:'Prix / tarifs',          color:'#64d2ff', icon:'💶', desc:'Tarifs réparation, devis, coût hors garantie.' },
  warranty:    { label:'Garantie / AppleCare',   color:'#ffd60a', icon:'🛡️', desc:'AppleCare, refus de garantie, éligibilité.' },
  sensory:     { label:'Sensoriel',              color:'#bf5af2', icon:'🎙️', desc:'Son, Face ID, capteurs, haptique, photo.' },
  emerging:    { label:'Émergent',               color:'#ff9f0a', icon:'🌊', desc:'Nouvelle anomalie inattendue, comportement bizarre.' }
};
const ALL_CATS = Object.keys(CAT_META);

/* ---------- top issues : faits confirmés, sourcés ---------- */
/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
function fmt(n){ return n.toLocaleString('fr-FR'); }
function counter(el, target, dur=1100){
  const t0 = performance.now();
  (function f(t){
    const k = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-k,3);
    el.textContent = fmt(Math.round(target*e));
    if (k<1) requestAnimationFrame(f);
  })(t0);
}

/* ---------- header: compteurs ---------- */
counter($('kpi-total'), DATA.total);
counter($('kpi-cats'), Object.keys(DATA.counts).length);
counter($('kpi-neg'), DATA.sentiment?.negative||0);
$('conf-val').textContent = Math.round((DATA.avgConf||0)*100) + '%';

/* ---------- graphique principal: barres horizontales animées (top pannes) ---------- */
const barsEl = $('bars');

(function topIssues(){
  const list = $('issues-list');
  if(!list || !window.PULSE_ISSUES || !PULSE_ISSUES.issues.length) return;
  const TAGC = {'Rappel produit':'#ff9f0a','Écran':'#4ae3ff','Réparabilité':'#30d158','Prix':'#ffd60a','iOS':'#bf5af2','Sécurité':'#ff453a'};
  PULSE_ISSUES.issues.forEach((it,i)=>{
    const el = document.createElement('article');
    el.className = 'iss';
    el.innerHTML = `
      <div class="isshead" role="button" tabindex="0">
        <span class="itag" style="color:${TAGC[it.tag]||'#888'}">${it.tag}</span>
        <span class="issdate">${it.date}</span>
      </div>
      <h3 class="isstitle">${it.title}</h3>
      <p class="issshort">${it.short}</p>
      <div class="issmore" hidden>
        <p>${it.more}</p>
        <p class="isssrc">Source : <a href="${it.url}" target="_blank" rel="noopener">${it.src}</a></p>
      </div>
      <button class="issbtn" type="button">En savoir plus</button>`;
    const more = el.querySelector('.issmore');
    const btn = el.querySelector('.issbtn');
    const toggle = ()=>{ more.hidden = !more.hidden; btn.textContent = more.hidden ? 'En savoir plus' : 'Réduire'; };
    btn.onclick = toggle;
    el.querySelector('.isshead').onclick = toggle;
    list.appendChild(el);
    el.style.setProperty('--d', (.15+i*.08)+'s');
  });
})();

const sorted = Object.entries(DATA.counts).sort((a,b)=>b[1]-a[1]);
const max = sorted[0][1] || 1;
sorted.forEach(([k,v], i)=>{
  const m = CAT_META[k]||{label:k,color:'#888',icon:'❓',desc:''};
  const row = document.createElement('div');
  row.className='brow'; row.style.setProperty('--c', m.color);
  row.innerHTML = `
    <div class="bicon" style="color:var(--c)">${ICONS[k]||''}</div>
    <div class="blabel">${m.label}</div>
    <div class="btrack"><div class="bfill" style="--w:${Math.round(v/max*100)}%;--d:${.5+i*.08}s"></div></div>
    <div class="bval">${fmt(v)}</div>
    <div class="bpct">${Math.round(v/DATA.total*100)}%</div>`;
  row.style.cursor='pointer';
  row.dataset.cat = k;
  barsEl.appendChild(row);
});
/* clic composant dans le tableau principal → panneau détail (courbe + comments) */
(function catDetail(){
  const panel = document.createElement('div');
  panel.id='cat-detail'; panel.hidden=true;
  barsEl.parentNode.appendChild(panel);
  barsEl.addEventListener('click', e=>{
    const row = e.target.closest('.brow');
    if(!row){ return; }
    const k = row.dataset.cat;
    const m = CAT_META[k]||{label:k,color:'#888',icon:'❓'};
    const serie = HIST.map(h=>(h.counts||{})[k]||0);
    const comments = (DATA.examples && DATA.examples[k]) || [];
    const delta = serie.length>1 ? serie[serie.length-1]-serie[serie.length-2] : 0;
    const arrow = delta>0?'▲':delta<0?'▼':'—';
    const dcol = delta>0?'var(--neg)':delta<0?'#30d158':'var(--mut)';
    panel.hidden=false;
    panel.innerHTML = `
      <div class="cdhead">
        <span class="cicon" style="color:${m.color}">${ICONS[k]||''}</span>
        <span class="clabel">${m.label}</span>
        <span class="cdelta" style="color:${dcol}">${arrow} ${delta>0?'+':''}${delta}</span>
        <button class="cdclose" type="button" aria-label="Fermer">✕</button>
      </div>
      <canvas id="cat-spark" style="width:100%;height:90px"></canvas>
      <div class="cdmodels">
        <div class="cdmtitle">RÉPARTITION PAR MODÈLE — depuis le début du logiciel</div>
        ${(function(){
          const MC = window.PULSE_MODEL_COUNTS || {};
          const rows = Object.entries(MC).map(([mo, probs]) => [mo, probs[k] || 0])
            .filter(r => r[1] > 0).sort((a, b) => b[1] - a[1]);
          const tot = rows.reduce((s, r) => s + r[1], 0);
          if (!tot) return '<p class="emute">Aucun modèle identifié encore pour ce composant — la répartition se remplit à chaque collecte.</p>';
          return rows.map(([mo, n]) => { const pct = Math.round(n / tot * 100); return `
          <div class="cdmrow">
            <span class="cdmname">${mo}</span>
            <span class="cdmbar"><span class="cdmfill" style="width:${pct}%"></span></span>
            <span class="cdmpct">${pct}%</span>
          </div>`; }).join('') + '<div class="cdmnote">' + tot + ' mentions avec modèle identifié — cumulé du backfill (09/21) au ' + ((window.PULSE_DATA&&PULSE_DATA.updated)||'') + ', mise à jour à chaque collecte.</div>';
        })()}
      </div>
      ${(window.PULSE_SOURCES&&PULSE_SOURCES.sources[k]&&PULSE_SOURCES.sources[k].length)?`<div class="cdpress">
        <div class="cdptitle">DANS LA PRESSE</div>
        ${PULSE_SOURCES.sources[k].map(ar=>`<a class="cdpart" href="${ar.url}" target="_blank" rel="noopener"><span class="cdpdate">${ar.date}</span><span class="cdpttl">${ar.title}</span><span class="cdpsrc">${ar.src} →</span></a>`).join('')}
      </div>`:''}`;
    const drawSpark = ()=>{ const c=$('cat-spark'); if(!c) return;
      if(c.clientWidth<10){ requestAnimationFrame(drawSpark); return; }
      spark(c, serie, m.color); };
    requestAnimationFrame(()=>requestAnimationFrame(drawSpark));
    window.addEventListener('resize', ()=>{ if(!panel.hidden){ const c=$('cat-spark'); if(c) spark(c, serie, m.color); } }, {passive:true}); /* cat-spark-resize */
    panel.scrollIntoView({behavior:'smooth', block:'nearest'});
    panel.querySelector('.cdclose').onclick = ()=>{ panel.hidden=true; };
  });
})();

/* ---------- courbe (sparkline historique) ---------- */
function spark(canvas, points, color, opts={}){
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth*2, H = canvas.height = (canvas.clientHeight||70)*2;
  ctx.scale(1,1);
  const pad = 14;
  const min = Math.min(...points), max = Math.max(...points);
  const rng = (max-min)||1;
  const pts = points.map((v,i)=>[ pad + i*(W-2*pad)/(points.length-1||1), H-pad - (v-min)/rng*(H-2*pad) ]);
  // grille
  ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=2;
  for(let g=1; g<4; g++){ ctx.beginPath(); ctx.moveTo(0, pad+g*(H-2*pad)/4); ctx.lineTo(W, pad+g*(H-2*pad)/4); ctx.stroke(); }
  // ligne
  ctx.beginPath();
  pts.forEach((p,i)=> i? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.strokeStyle=color; ctx.lineWidth=4; ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.stroke();
  // halo
  const g2 = ctx.createLinearGradient(0,0,0,H);
  g2.addColorStop(0, color+'33'); g2.addColorStop(1, color+'00');
  ctx.lineTo(pts[pts.length-1][0], H-pad); ctx.lineTo(pts[0][0], H-pad); ctx.closePath();
  ctx.fillStyle=g2; ctx.fill();
  // points
  if (opts.dots!==false) pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p[0],p[1],5,0,7); ctx.fillStyle=color; ctx.fill(); });
}
/* ---------- progression par composant : une courbe par item trouvé ---------- */


/* ---------- exemples concrets par composant (les phrases réelles) ---------- */
const exEl = $('examples');
const exCats = Object.entries(DATA.counts).sort((a,b)=>b[1]-a[1]);
exCats.forEach(([k,v], i)=>{
  const m = CAT_META[k]||{label:k,color:'#888',icon:'❓',desc:''};
  const exs = (DATA.examples && DATA.examples[k]) || [];
  const card = document.createElement('details');
  card.className='excard'; card.style.setProperty('--c', m.color);
  card.innerHTML = `
    <summary>
      <span class="eicon" style="color:var(--c)">${ICONS[k]||''}</span>
      <span class="elabel">${m.label}</span>
      <span class="eval">${fmt(v)} ${v>1?'mentions':'mention'}</span>
      <span class="earrow">▾</span>
    </summary>
    <div class="ebody">
      <p class="edesc">${m.desc}</p>
      ${exs.length? exs.map(x=>{const t=(x&&x.text_tr)||x||'';const u=(x&&x.text)||'';const full=t.length<u.length&&u?t+' <span class="etr-mute">'+u+'</span>':t;return `<blockquote class="eq">« ${(full||'').replace(/</g,'&lt;')} »</blockquote>`}).join('')
        : '<p class="emute">Aucun exemple pour l\'instant.</p>'}
      ${exs.length? `<a class="emore" href="https://github.com/popalAzerk/oracle26/archive/refs/heads/main.tar.gz" download>Télécharger les données brutes</a>`:''}
    </div>`;
  exEl.appendChild(card);
});

/* ---------- modèles déclarés (radial animé, cumul depuis le début) ---------- */
(function radialModels(){
  const c = $('gauge'); if (!c) return;
  const MC = window.PULSE_MODEL_COUNTS || {};
  const rows = Object.entries(MC).map(([mo, probs]) => [mo, Object.values(probs).reduce((s,n)=>s+n,0)])
    .filter(r => r[1] > 0).sort((a, b) => b[1] - a[1]);
  const tot = rows.reduce((s, r) => s + r[1], 0);
  if (!tot) {
    const lab = $('gauge-labels');
    if (lab) lab.innerHTML = '<p class="emute">Aucun modèle identifié pour l\'instant — se remplit à chaque collecte.</p>';
    return;
  }
  // palette 9 couleurs :
  const PAL = ['#4ae3ff','#3672ff','#30d158','#ffd60a','#ff9f0a','#ff453a','#bf5af2','#64d2ff','#a3a3ad'];
  const W = c.width = c.clientWidth*2, H = c.height = c.clientHeight*2;
  let a0 = -Math.PI/2, p = 0;
  (function draw(t){
    const ctx = c.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const e = 1-Math.pow(1-Math.min(1,p),3); p += .02;
    let an = a0;
    rows.forEach(([mo, n], i)=>{
      const ang = n/tot*Math.PI*2*e;
      ctx.beginPath();
      ctx.arc(W/2,H/2, W/2-24, an+.02, an+ang-.02);
      ctx.strokeStyle = PAL[i%PAL.length]; ctx.lineWidth = 26; ctx.lineCap='butt'; ctx.stroke();
      an += ang;
    });
    if (p<1.001) requestAnimationFrame(draw);
  })(0);
  const lab = $('gauge-labels');
  if (lab) lab.innerHTML = rows.map(([mo, n], i)=>
    `<span style="color:${PAL[i%PAL.length]}">●</span> ${mo} ${Math.round(n/tot*100)}%`
  ).join('<br>');
})();

/* ---------- footer (crédit + période) ---------- */
$('updated').textContent = 'données : ' + (DATA.updated||'') + ' · ' + (DATA.period||'');

/* ---------- grain CRT léger ---------- */
(function grain(){
  const g = $('grain'); const ctx = g.getContext('2d');
  const W = g.width = innerWidth, H = g.height = innerHeight;
  ctx.globalAlpha=.05;
  for(let i=0;i<900;i++){
    ctx.fillStyle = '#fff';
    ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1);
  }
})();

/* ---------- reveal on scroll (IntersectionObserver) ---------- */
const io = new IntersectionObserver(es=>es.forEach(e=>{
  if (e.isIntersecting) e.target.classList.add('in');
}), {threshold:.12});
document.querySelectorAll('.rx').forEach(el=>io.observe(el));
