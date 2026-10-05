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
  barsEl.appendChild(row);
});

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
const histTotal = HIST.map(h=>h.total);
if (histTotal.length > 1) { setTimeout(()=>{ spark($('spark-total'), histTotal, '#4ae3ff'); }, 500); }
else { $('spark-total').closest('.rx').style.display='none'; }

/* ---------- heatmap 7 jours x 8 composants (animée en cascade) ---------- */
const heatEl = $('heat');
const lastH = HIST.slice(-8);
const cats = ALL_CATS.filter(c=>lastH.some(h=>h.counts[c]));
const hmax = Math.max(...lastH.flatMap(h=>cats.map(c=>h.counts[c]||0)))
lastH.forEach((h,i)=>{
  const rowD = document.createElement('div');
  rowD.className='hrow';
  const dLbl = document.createElement('div'); dLbl.className='hdate'; dLbl.textContent=h.date.slice(5);
  rowD.appendChild(dLbl);
  cats.forEach((c,j)=>{
    const v = h.counts[c]||0;
    const cell = document.createElement('div');
    cell.className='hcell';
    const alpha = v? (.18+.82*v/hmax) : .06;
    cell.style.setProperty('--a', alpha);
    cell.style.setProperty('--c', CAT_META[c].color);
    cell.style.animationDelay = (.04*(i*cats.length+j))+'s';
    cell.title = `${h.date} · ${CAT_META[c].label}: ${v}`;
    cell.textContent = v||'';
    rowD.appendChild(cell);
  });
  const ttl = document.createElement('div'); ttl.className='httl'; ttl.textContent=h.total;
  rowD.appendChild(ttl);
  heatEl.appendChild(rowD);
});
const cols = document.createElement('div'); cols.className='hrow hhead';
cols.innerHTML = `<div class="hdate"></div>` + cats.map(c=>`<div class="hcell hh" title="${CAT_META[c].label}" style="color:${CAT_META[c].color}">${ICONS[c]||'·'}</div>`).join('') + `<div class="httl">Σ</div>`;
heatEl.prepend(cols);

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
      ${exs.length? exs.map(x=>`<blockquote class="eq">« ${(x||'').replace(/</g,'&lt;')} »</blockquote>`).join('')
        : '<p class="emute">Aucun exemple pour l\'instant.</p>'}
      ${exs.length? `<a class="emore" href="https://github.com/popalAzerk/oracle26/archive/refs/heads/main.tar.gz" download>Télécharger les données brutes</a>`:''}
    </div>`;
  exEl.appendChild(card);
});

/* ---------- sentiment (radial animé) ---------- */
(function radial(){
  const c = $('gauge'), ctx = c.getContext('2d');
  const W=c.width=c.clientWidth*2, H=c.height=c.clientHeight*2;
  const s = (DATA.sentiment||{neutral:1});
  const sum = s.neutral+s.negative+s.positive||1;
  const parts = [['neu','#64d2ff',s.neutral],['neg','#ff453a',s.negative],['pos','#30d158',s.positive]];
  let a0 = -Math.PI/2;
  let p = 0;
  (function draw(t){
    ctx.clearRect(0,0,W,H);
    const e = 1-Math.pow(1-Math.min(1,p),3); p += .02;
    let an = a0;
    parts.forEach(([k,col,v])=>{
      const ang = v/sum*Math.PI*2*e;
      ctx.beginPath();
      ctx.arc(W/2,H/2, W/2-24, an+.02, an+ang-.02);
      ctx.strokeStyle=col; ctx.lineWidth=26; ctx.lineCap='butt'; ctx.stroke();
      an += ang;
    });
    if (p<1.001) requestAnimationFrame(draw);
  })(0);
  // labels:
  const lab=$('gauge-labels');
  lab.innerHTML = parts.map(([k,col,v])=>`<span style="color:${col}">●</span> ${
    {neu:'neutre',neg:'négatif',pos:'positif'}[k]
  } ${Math.round(v/sum*100)}%`).join('<br>');
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

/* ---------- France / ARA (PULSE_FR) ---------- */
const MOIS = {jan:'janv',feb:'févr',mar:'mars',apr:'avr',may:'mai',jun:'juin',jul:'juil',aug:'août',sep:'sept',oct:'oct',nov:'nov',dec:'déc'};
function frdate(d){
  if (!d) return '';
  const m = d.match(/(\w{3}),(\s*)(\d{1,2})\s+(\w{3})/);
  if (m) return `${m[3]} ${MOIS[m[4].toLowerCase().slice(0,3)]||m[4]}`;
  return d.slice(5,10);
}
function cleanTitle(t){ return (t||'').replace(/\s[-–]\s[^-––]{2,40}$/,'').trim(); }
(function(){
  const FR = window.PULSE_FR;
  if (!FR || !window.PULSE_DATA) return;
  const wrap = $('fr-cards');
  if (!wrap) return;
  const mk = (d, label) => {
    if (!d || !d.total) return null;
    const card = document.createElement('div');
    card.className = 'frcard';
    const bars = Object.entries(d.counts).slice(0,6).sort((a,b)=>b[1]-a[1]);
    const mx = bars[0]?.[1] || 1;
    card.innerHTML = `
      <div class="frhead"><span class="frname">${label}</span>
        <span class="frn">${d.total} signalements</span></div>
      <div class="frbars">${bars.map(([k,v]) => {
        const m = CAT_META[k]||{label:k,color:'#888',icon:'❓'};
        return `<div class="frbar"><span class="frlab">${ICONS[k]||''}${m.label}</span>
          <span class="frtrack"><span class="frfill" style="--c:${m.color};--w:${Math.round(v/mx*100)}%"></span></span>
          <span class="frv">${v}</span></div>`;}).join('')}</div>
      <details class="frdetails"><summary>Voir les signalements (${d.items.length})</summary>
        <ul class="frlist">${d.items.slice(0,20).map(i => {
          const m = CAT_META[i.cat]||{label:i.cat,color:'#888'};
          return `<li><a href="${i.url||'#'}" ${i.url?'target="_blank"':''}>${cleanTitle(i.text).replace(/</g,'&lt;')}</a>
            <span class="frmeta" style="--c:${m.color}">${m.label} · ${i.src||''} · ${frdate(i.date)}</span></li>`;
        }).join('')}</ul>
      </details>`;
    return card;
  };
  const c1 = mk(FR.aura, 'Auvergne-Rhône-Alpes');
  const c2 = mk(FR.fr, 'France entière');
  if (c1) wrap.appendChild(c1);
  if (c2) wrap.appendChild(c2);
  if (!(c1||c2)) {
    const wait = document.createElement('div');
    wait.className = 'frcard frwait';
    wait.innerHTML = `<div class="frhead"><span class="frname">veille en cours</span></div>
      <p style="color:var(--mut);font-size:12px;line-height:1.6">Collecte du signal utilisateurs lancée (Mastodon FR, puis Reddit dès que le flux sera autorisé). Premier signalement attendu à la collecte de 2 h du matin.</p>`;
    wrap.appendChild(wait);
  }
  if (c1||c2||true) { document.getElementById('fr').classList.add('in'); }
})();