/* ===== PULSE v2 — mécaniques : preloader rituel, anneau-astre, occlusion typo,
   sections numérotées, reveals stagger, compteurs eased ===== */
'use strict';
const DATA = window.PULSE_DATA || {};
const MC = window.PULSE_MODEL_COUNTS || {};
const CY = '#4ae3ff', MG = '#ff2ea6';
const PAL = ['#6ff0ff','#4ae3ff','#2fd8e8','#28a8d8','#3d7bd9','#ffd60a','#e8b23a','#c98f2e','#a86f28','#8f8f9f','#757585','#5c5c6a','#ff6bd8','#c95fb0'];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- preloader ---------- */
(function(){
  const arc = $('.pl-arc'), cnt = $('.pl-count');
  if (!arc) return;
  let p = 0;
  const iv = setInterval(()=>{
    p = Math.min(1, p + .018 + Math.random()*.02);
    arc.style.strokeDashoffset = 276 * (1 - p);
    cnt.textContent = String(Math.round(p * (DATA.total || 1))).padStart(3,'0');
    if (p >= 1){
      clearInterval(iv);
      setTimeout(()=> $('#preloader').classList.add('off'), 280);
    }
  }, 26);
  setTimeout(()=> $('#preloader').classList.add('off'), 3600); // filet de sécurité
})();

/* ---------- fond : particules + grille tron ---------- */
(function(){
  const c = $('#fx'); if(!c) return;
  const x = c.getContext('2d');
  let W, H, pts = [];
  function size(){
    W = c.width = innerWidth; H = c.height = innerHeight;
    pts = Array.from({length: Math.min(90, W/14)}, ()=>({
      x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.3+.3,
      p:Math.random()*6.28, s:.4+Math.random()*.9,
      m: Math.random() < .12 ? MG : CY   // 12% magenta
    }));
  }
  size(); addEventListener('resize', size);
  (function draw(t){
    x.clearRect(0,0,W,H);
    // grille perspective bas d'écran :
    const gh = H*.34;
    x.strokeStyle = 'rgba(74,227,255,.10)'; x.lineWidth = 1;
    for (let i=0;i<=16;i++){
      const xx = (i/16)*W;
      x.beginPath(); x.moveTo(xx, H-gh); x.lineTo(W*.5 + (xx-W*.5)*3.2, H); x.stroke();
    }
    for (let j=0;j<5;j++){
      const y = H - gh + (j/4)*gh;
      x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke();
    }
    x.globalAlpha = .8;
    for (const q of pts){
      const a = .2 + .5*Math.abs(Math.sin(t/1500*q.s + q.p));
      x.beginPath(); x.arc(q.x, q.y, q.r, 0, 6.29);
      x.fillStyle = q.m; x.globalAlpha = a; x.shadowColor=q.m; x.shadowBlur=7;
      x.fill();
    }
    x.globalAlpha = 1; x.shadowBlur = 0;
    requestAnimationFrame(draw);
  })(0);
})();

/* ---------- anneau-astre (donut rayon variable = % modèle) ---------- */
function astro(el, rows, opt){
  if (!el || !rows.length) return;
  opt = opt || {};
  const W = el.width, H = el.height, cx = W/2, cy = H/2;
  const tot = rows.reduce((s,r)=>s+r[1],0);
  let p = 0;
  function frame(t){
    const e = 1 - Math.pow(1 - Math.min(1,p), 3); p += .016;
    const x = el.getContext('2d');
    x.clearRect(0,0,W,H);
    let an = -Math.PI/2;
    rows.forEach((r, i)=>{
      const ang = (r[1]/tot) * 6.2832 * e;
      // largeur du segment ∝ part (mecanique "astre à facettes") :
      const w1 = (W/2 - 30) * (.42 + .45 * r[1]/tot);
      x.beginPath();
      x.arc(cx, cy, w1, an + .035, an + ang - .035);
      x.strokeStyle = PAL[i % PAL.length];
      x.lineWidth = Math.max(10, W*.05 * (0.5 + r[1]/tot*1.6));
      x.lineCap = 'butt';
      x.shadowColor = PAL[i % PAL.length]; x.shadowBlur = 18;
      x.stroke();
      // télémétrie : petites lignes radiales entre segments
      x.shadowBlur = 0;
      x.strokeStyle = 'rgba(232,242,255,.25)'; x.lineWidth = 1;
      x.beginPath();
      x.moveTo(cx + Math.cos(an)*24, cy + Math.sin(an)*24);
      x.lineTo(cx + Math.cos(an)*(w1 + 16), cy + Math.sin(an)*(w1 + 16));
      x.stroke();
      an += ang;
    });
    // noyau :
    const g = x.createRadialGradient(cx,cy,0,cx,cy,W*.12);
    g.addColorStop(0,'rgba(74,227,255,.9)'); g.addColorStop(.5,'rgba(74,227,255,.25)'); g.addColorStop(1,'transparent');
    x.fillStyle = g;
    x.beginPath(); x.arc(cx,cy,W*.12*e,0,6.29); x.fill();
    if (p < 1.02 && !opt.once) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* compteurs eased */
function cnt(el, target, dur){
  if (!el) return;
  let t0 = null;
  function step(t){
    if (!t0) t0 = t;
    const k = Math.min(1, (t - t0)/dur);
    const e = 1 - Math.pow(1-k, 3);
    el.textContent = String(Math.round(e*target)).padStart(3,'0');
    if (k<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- HERO : anneau = répartition composants ---------- */
(function(){
  const rows = Object.entries(DATA.counts || {}).sort((a,b)=>b[1]-a[1]);
  const el = $('#astro');
  astro(el, rows);
  const tot = rows.reduce((s,r)=>s+r[1],0);
  cnt($('#astro-total'), tot, 1900);
  const cats = $('#astro-cats'); if (cats) cats.textContent = rows.length;
  // hud-maj + footer :
  const up = $('#hud-maj'); if (up) up.textContent = 'MAJ ' + (DATA.updated || '--');
  const fu = $('#foot-upd'); if (fu) fu.textContent = 'DONNÉES DU ' + (DATA.updated || '--');
  if ($('#hud-clock')) setInterval(()=>{ $('#hud-clock').textContent = new Date().toTimeString().slice(0,8); }, 1000);
})();

/* ---------- 01 SIGNATURE ---------- */
(function(){
  const rows = Object.entries(MC).map(([m, pr])=>[m, Object.values(pr).reduce((s,n)=>s+n,0)]).filter(r=>r[1]>0).sort((a,b)=>b[1]-a[1]);
  const el = $('#astro2');
  astro(el, rows, {once:false});
  const leg = $('#sig-leg');
  const tot = rows.reduce((s,r)=>s+r[1],0);
  if (leg) leg.innerHTML = rows.map((r,i)=>
    `<div class="sig-row" style="--c:${PAL[i%PAL.length]}"><i></i><span class="n">${r[0]}</span><b>${r[1]}<em>· ${Math.round(r[1]/tot*100)}%</em></b></div>`).join('');
})();

/* ---------- 02 COMPOSANTS ---------- */
(function(){
  const META = {
    battery:{l:'Batterie',i:'🔋',c:'#30d158',d:'Autonomie, drain, gonflement'},
    screen:{l:'Écran / affichage',i:'📱',c:'#2997ff',d:'Lignes, tactile, écran noir'},
    charging:{l:'Charge',i:'⚡',c:'#ffd60a',d:'Port, charge lente, ne charge plus'},
    cosmetic:{l:'Esthétique',i:'✨',c:'#ff2ea6',d:'Décoloration, peinture, rayures'},
    audio:{l:'Audio',i:'🔊',c:'#bf5af2',d:'HP, micro, grésillement'},
    buttons:{l:'Boutons',i:'🔘',c:'#8e8e93',d:'Side button, volume, action'},
    network:{l:'Réseau',i:'📶',c:'#30b0c7',d:'Cellulaire, Wi-Fi, Bluetooth'},
    camera:{l:'Caméra',i:'📷',c:'#ff453a',d:'Objectif, flou, stabilisation'}
  };
  const rows = Object.entries(DATA.counts || {}).sort((a,b)=>b[1]-a[1]);
  const tot = rows.reduce((s,r)=>s+r[1],0) || 1;
  const box = $('#comps');
  box.innerHTML = rows.map(([k,n])=>{
    const m = META[k] || {l:k,i:'◈',c:'#8f8f9f',d:''};
    return `<div class="comp rv" data-cat="${k}" style="--c:${m.c}">
      <div class="ic">${m.i}</div>
      <div class="lb">${m.l}<small>${m.d || ''}</small></div>
      <div class="track"><div class="fill" style="--w:${Math.round(n/tot*100)}%"></div></div>
      <div class="val"><b>${String(n).padStart(2,'0')}</b><small>${Math.round(n/tot*100)} %</small></div>
    </div>`;
  }).join('');
})();

/* ---------- détail au clic ---------- */
(function(){
  const box = $('#comps'), det = $('#detail');
  box.addEventListener('click', e=>{
    const row = e.target.closest('.comp'); if (!row) return;
    const k = row.dataset.cat;
    const open = det.dataset.cat === k && !det.hidden;
    det.hidden = open; det.dataset.cat = open ? '' : k;
    if (open) return;
    const META = {
      battery:{l:'Batterie',c:'#30d158'},screen:{l:'Écran / affichage',c:'#2997ff'},
      charging:{l:'Charge',c:'#ffd60a'},cosmetic:{l:'Esthétique',c:'#ff2ea6'},
      audio:{l:'Audio',c:'#bf5af2'},buttons:{l:'Boutons',c:'#8e8e93'},
      network:{l:'Réseau',c:'#30b0c7'},camera:{l:'Caméra',c:'#ff453a'}};
    const m = META[k] || {l:k, c:'#8f8f9f'};
    // répartition modèles :
    const rows = Object.entries(MC).map(([mo, pr])=>[mo, pr[k]||0]).filter(r=>r[1]>0).sort((a,b)=>b[1]-a[1]);
    const tot = rows.reduce((s,r)=>s+r[1],0) || 1;
    // verbatims :
    const exs = (DATA.examples || {})[k] || [];
    // presse :
    const P = (window.PULSE_SOURCES && window.PULSE_SOURCES.sources[k]) || [];
    det.innerHTML = `
      <button class="close" aria-label="Fermer">✕</button>
      <h3><span style="display:inline-block;width:9px;height:9px;background:${m.c};box-shadow:0 0 8px ${m.c}"></span>${m.l.toUpperCase()} — RÉPARTITION PAR MODÈLE <i style="font-style:normal;color:var(--t3);font-size:9px;letter-spacing:.18em">DEPUIS LE DÉBUT</i></h3>
      ${rows.map(r=>`<div class="mrow"><span class="mn">${r[0]}</span><span class="mt"><span class="mf" style="--w:${Math.round(r[1]/tot*100)}%"></span></span><span class="mp">${Math.round(r[1]/tot*100)} %</span></div>`).join('') || '<p style="color:var(--t3);font-size:11px">Aucun modèle identifié pour ce composant.</p>'}
      ${exs.length ? `<div class="profs-t">COMMENT LES CLIENTS LE VIVENT</div>` + exs.map(x=>{
        const t = (x && x.text_tr) || (x && x.text) || x || '';
        return `<p class="prof" style="--c:${m.c}">${String(t).slice(0,220)}</p>`;}).join('') : ''}
      ${P.length ? `<div class="prese"><div class="prese-t">DANS LA PRESSE</div>` + P.slice(0,3).map(a=>
        `<a class="pres" href="${a.u}" target="_blank" rel="noopener"><span class="pt">${a.t}</span><span class="pm">${a.d || ''} · ${a.s} →</span></a>`).join('') + '</div>' : ''}`;
    det.hidden = false;
    det.querySelector('.close').onclick = ()=>{ det.hidden = true; det.dataset.cat=''; };
    det.classList.add('rv'); requestAnimationFrame(()=>det.classList.add('in'));
  });
})();

/* ---------- 03 PREUVES : citations massives ---------- */
(function(){
  const exs = DATA.examples || {};
  const META = {battery:'#30d158',screen:'#2997ff',charging:'#ffd60a',cosmetic:'#ff2ea6',audio:'#bf5af2',buttons:'#8e8e93',network:'#30b0c7',camera:'#ff453a'};
  let cards = [];
  for (const [k, lst] of Object.entries(exs)){
    for (const x of (lst||[]).slice(0,1)){
      const t = (x && x.text_tr) || (x && x.text) || x || '';
      if (t && t.length > 30) cards.push({t, c: META[k] || '#8f8f9f', k});
    }
  }
  const box = $('#profs');
  if (box) box.innerHTML = cards.slice(0, 8).map(c=>
    `<div class="profcard rv"><blockquote style="color:#e8f2ff">${c.t.slice(0,240)}</blockquote><div class="who">COMPOSANT <b>${c.k.toUpperCase()}</b> · SIGNAL CLIENT</div></div>`).join('');
})();

/* ---------- reveals stagger ---------- */
(function(){
  const io = new IntersectionObserver(es=>{
    es.forEach((e)=>{ if (e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }});
  }, {threshold:.12});
  $$('.rv').forEach((el, i)=>{ el.style.transitionDelay = (i%6)*70 + 'ms'; io.observe(el); });
})();
