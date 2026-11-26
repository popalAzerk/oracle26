/* Atelier « Comprendre une IA et savoir l'utiliser » — 4 étapes.
   1. un vrai classifieur (k plus proches voisins) entraîné par l'enfant ;
   2. le biais : données déséquilibrées, puis rééquilibrées, précision mesurée avant / après ;
   3. savoir demander : analyse locale et honnête d'une demande (aucune IA appelée) ;
   4. esprit critique : réponses pré-écrites à vérifier + règles d'usage.
   Aucun réseau : tout est calculé dans la page. */
(function () {
  'use strict';
  const A = window.Atelier;
  if (!A) return;
  const ID = 'ia';
  const TOTAL = 4;
  const $ = (id) => document.getElementById(id);
  const esc = A.esc;

  /* ---------- niveau selon la classe ---------- */
  const classe = String(A.profil().classe || '5e');
  const NIV = /^(2|1|t|seconde)/i.test(classe) ? 3 : /^(3|4)/.test(classe) ? 2 : 1;
  const EN_CLASSE = NIV === 3 ? 'en seconde' : NIV === 2 ? 'en 3e' : 'en 5e';
  const CONF = {
    1: { min1: 3, ks: [3], tests1: 6, k2: 3, scen: 1, seuil3: 4, items4: ['mercure', 'hugo', 'os'], regles4: 4 },
    2: { min1: 4, ks: [1, 3], tests1: 8, k2: 3, scen: 2, seuil3: 5, items4: ['mercure', 'eau', 'hugo', 'saisons'], regles4: 5 },
    3: { min1: 5, ks: [1, 3, 5], tests1: 8, k2: 5, scen: 2, seuil3: 6, items4: ['eau', 'hugo', 'muraille', 'coeur', 'saisons'], regles4: 6 },
  }[NIV];

  /* ---------- statistiques propres à l'atelier (atelier.ia.v1), par profil ---------- */
  const CLE = 'atelier.ia.v1';
  const neuf = () => ({ faits: [], s1: { pts: [], k: CONF.ks[Math.floor(CONF.ks.length / 2)], prec: null },
    s2: { ajouts: [], avant: null, apres: null, q: [] }, s3: { best: {} }, s4: { rep: {}, regles: {} } });
  const num = (v, a, b) => Number.isFinite(+v) && +v >= a && +v <= b;
  function validerRes(r) {
    if (!r || typeof r !== 'object' || !num(r.justes, 0, 100) || !num(r.total, 1, 100)) return null;
    const g = {};
    if (r.g && typeof r.g === 'object') for (const k of ['rouge', 'verte', 'poire']) {
      const v = r.g[k]; if (Array.isArray(v) && num(v[0], 0, 50) && num(v[1], 1, 50)) g[k] = [+v[0], +v[1]];
    }
    return { justes: +r.justes, total: +r.total, g };
  }
  function valider(s) {
    const o = neuf();
    if (!s || typeof s !== 'object') return o;
    if (Array.isArray(s.faits)) o.faits = [...new Set(s.faits.filter((n) => [1, 2, 3, 4].includes(n)))];
    if (s.s1 && typeof s.s1 === 'object') {
      if (Array.isArray(s.s1.pts)) o.s1.pts = s.s1.pts.filter((p) => p && num(p.x, 0, 70) && num(p.y, 0, 70) && (p.c === 'criquet' || p.c === 'sauterelle'))
        .slice(0, 60).map((p) => ({ x: +p.x, y: +p.y, c: p.c }));
      if (CONF.ks.includes(+s.s1.k)) o.s1.k = +s.s1.k;
      o.s1.prec = validerRes(s.s1.prec);
    }
    if (s.s2 && typeof s.s2 === 'object') {
      if (Array.isArray(s.s2.ajouts)) o.s2.ajouts = [...new Set(s.s2.ajouts.filter((id) => typeof id === 'string' && /^[a-z]\d$/.test(id)))];
      o.s2.avant = validerRes(s.s2.avant); o.s2.apres = validerRes(s.s2.apres);
      if (Array.isArray(s.s2.q)) o.s2.q = s.s2.q.filter((n) => n === 0 || n === 1);
    }
    if (s.s3 && s.s3.best && typeof s.s3.best === 'object') for (const [k, v] of Object.entries(s.s3.best)) if (/^[a-z]{2,12}$/.test(k) && num(v, 0, 6)) o.s3.best[k] = +v;
    if (s.s4 && typeof s.s4 === 'object') {
      if (s.s4.rep && typeof s.s4.rep === 'object') for (const [k, v] of Object.entries(s.s4.rep)) if (/^[a-z]{2,12}$/.test(k) && num(v, -1, 5)) o.s4.rep[k] = +v;
      if (s.s4.regles && typeof s.s4.regles === 'object') for (const [k, v] of Object.entries(s.s4.regles)) if (/^\d$/.test(k) && typeof v === 'boolean') o.s4.regles[k] = v;
    }
    return o;
  }
  function lireTout() {
    try { const d = JSON.parse(localStorage.getItem(CLE) || 'null'); if (d && typeof d === 'object' && d.v === 1 && d.profils && typeof d.profils === 'object') return d; } catch (_) {}
    return { v: 1, profils: {} };
  }
  const pid = A.profilId();
  const st = valider(lireTout().profils[pid]);
  function sauver() {
    const d = lireTout(); d.profils[pid] = st;
    try { localStorage.setItem(CLE, JSON.stringify(d)); } catch (_) {}
  }

  /* ---------- progression ---------- */
  function majXP() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    const el = $('xp');
    if (!el) return;
    el.innerHTML = `<span class="lvl">Nv. ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div>
      <small>${p.xp} XP · ${esc(p.nom)} (${esc(p.classe)})</small>`;
  }
  function reussir(n) {
    if (!st.faits.includes(n)) { st.faits.push(n); sauver(); }
    A.gagner(40, `${ID}:etape:${n}`);
    if (A.etape(ID) < st.faits.length) A.terminer(ID, st.faits.length);
    majXP(); majSommaire();
    if (st.faits.length === TOTAL) bilan();
  }
  const ETAPES = ['Entraîner une IA', 'Le biais', 'Savoir demander', 'Esprit critique'];
  function majSommaire() {
    const suiv = [1, 2, 3, 4].find((n) => !st.faits.includes(n));
    $('ia-sommaire').innerHTML = ETAPES.map((t, i) => {
      const ok = st.faits.includes(i + 1), cours = !ok && suiv === i + 1;
      return `<a class="at-ia-som${ok ? ' ok' : ''}${cours ? ' cours' : ''}" href="#etape${i + 1}"${cours ? ' aria-current="step"' : ''}><span class="at-ia-som-n" aria-hidden="true">${ok ? '✓' : i + 1}</span>
        <span class="at-ia-som-t">${t}</span><span class="pill${ok ? ' ok' : cours ? ' at-ia-pill-cours' : ''}">${ok ? 'réussie' : cours ? 'en cours' : 'à faire'}</span></a>`;
    }).join('');
    const det = { 1: `${CONF.min1} exemples de chaque sorte, ${CONF.tests1} insectes à tester, ${CONF.seuil3} critères sur 6 pour une demande`,
      2: `${CONF.min1} exemples de chaque sorte, choix de k (1 ou 3), ${CONF.tests1} tests, ${CONF.seuil3} critères sur 6 pour 2 missions`,
      3: `${CONF.min1} exemples de chaque sorte, choix de k (1, 3 ou 5), IA à 5 voisins pour le biais, ${CONF.seuil3} critères sur 6 pour 2 missions` }[NIV];
    $('ia-niveau').innerHTML = `<b>Niveau adapté à ta classe (${esc(classe)}) :</b> ${det}.
      ${suiv ? (st.faits.length ? ` Tu as réussi ${st.faits.length} étape${st.faits.length > 1 ? 's' : ''} sur ${TOTAL} : <a href="#etape${suiv}">reprends à l'étape ${suiv}</a>.` : '') : ' Les 4 étapes sont réussies : bravo !'}`;
  }
  function dire(id, html, type) { const el = $(id); el.className = 'commentaire' + (type ? ' ' + type : ''); el.innerHTML = html; }
  const pct = (j, t) => Math.round((j / t) * 100);

  /* ---------- le classifieur : k plus proches voisins (distance euclidienne) ---------- */
  function knn(train, x, y, k) {
    if (!train.length) return null;
    const d = train.map((p) => ({ p, d: (p.x - x) ** 2 + (p.y - y) ** 2 })).sort((a, b) => a.d - b.d);
    const kk = Math.min(k, d.length), votes = {};
    for (let i = 0; i < kk; i++) votes[d[i].p.c] = (votes[d[i].p.c] || 0) + 1;
    const max = Math.max(...Object.values(votes));
    const ex = Object.keys(votes).filter((c) => votes[c] === max);
    // égalité de votes : on suit le voisin le plus proche parmi les classes à égalité
    const c = ex.length > 1 ? d.slice(0, kk).find((v) => ex.includes(v.p.c)).p.c : ex[0];
    return { c, voisins: d.slice(0, kk).map((v) => v.p), votes };
  }

  /* ---------- le plan (SVG commun aux étapes 1 et 2) ---------- */
  const X0 = 62, Y0 = 8, T = 380;
  function creerPlan(hote, o) {
    const X = (v) => X0 + ((v - o.xmin) / (o.xmax - o.xmin)) * T;
    const Y = (v) => Y0 + T - ((v - o.ymin) / (o.ymax - o.ymin)) * T;
    let grille = '', ticks = '';
    for (let v = o.xmin; v <= o.xmax + 1e-9; v += o.pas) {
      grille += `<line x1="${X(v)}" y1="${Y0}" x2="${X(v)}" y2="${Y0 + T}"/>`;
      ticks += `<text x="${X(v)}" y="${Y0 + T + 21}" text-anchor="middle">${v}</text>`;
    }
    for (let v = o.ymin; v <= o.ymax + 1e-9; v += o.pas) {
      grille += `<line x1="${X0}" y1="${Y(v)}" x2="${X0 + T}" y2="${Y(v)}"/>`;
      ticks += `<text x="${X0 - 8}" y="${Y(v) + 5}" text-anchor="end">${v}</text>`;
    }
    hote.innerHTML = `<svg viewBox="0 0 450 450" class="at-ia-svg" focusable="false" aria-hidden="true">
      <rect class="at-ia-fond" x="${X0}" y="${Y0}" width="${T}" height="${T}"/>
      <image class="at-ia-zones" x="${X0}" y="${Y0}" width="${T}" height="${T}" preserveAspectRatio="none"/>
      <g class="at-ia-grille">${grille}</g>
      <rect class="at-ia-cadre" x="${X0}" y="${Y0}" width="${T}" height="${T}"/>
      <g class="at-ia-ticks">${ticks}</g>
      <text class="at-ia-titre" x="${X0 + T / 2}" y="446" text-anchor="middle">${o.lx}</text>
      <text class="at-ia-titre" transform="translate(17 ${Y0 + T / 2}) rotate(-90)" text-anchor="middle">${o.ly}</text>
      <g class="at-ia-pts"></g><g class="at-ia-tests"></g>
      <g class="at-ia-viseur" visibility="hidden"><circle r="13"/><line x1="-20" y1="0" x2="-7" y2="0"/><line x1="7" y1="0" x2="20" y2="0"/><line x1="0" y1="-20" x2="0" y2="-7"/><line x1="0" y1="7" x2="0" y2="20"/></g>
    </svg>`;
    const svg = hote.querySelector('svg');
    return { svg, X, Y, o, img: svg.querySelector('.at-ia-zones'), pts: svg.querySelector('.at-ia-pts'), tests: svg.querySelector('.at-ia-tests'), viseur: svg.querySelector('.at-ia-viseur') };
  }
  /** Colorie le fond : chaque petit carré prend la couleur de la réponse que donnerait l'IA à cet endroit. */
  function peindre(plan, train, k, couleurs) {
    const classes = new Set(train.map((p) => p.c));
    if (classes.size < 2) { plan.img.removeAttribute('href'); return; }
    const N = 127, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const ctx = cv.getContext('2d'), im = ctx.createImageData(N, N), o = plan.o;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = o.xmin + ((i + 0.5) / N) * (o.xmax - o.xmin), y = o.ymax - ((j + 0.5) / N) * (o.ymax - o.ymin);
      const c = couleurs[knn(train, x, y, k).c], q = (j * N + i) * 4;
      im.data[q] = c[0]; im.data[q + 1] = c[1]; im.data[q + 2] = c[2]; im.data[q + 3] = 255;
    }
    ctx.putImageData(im, 0, 0);
    plan.img.setAttribute('href', cv.toDataURL());
  }
  const COUL_FRUIT = (v) => { // vert (0) → jaune (5) → rouge (10)
    const a = [79, 160, 40], b = [230, 190, 30], c = [205, 38, 38];
    const t = Math.max(0, Math.min(1, v / 10)), [p, q, u] = t < 0.5 ? [a, b, t * 2] : [b, c, (t - 0.5) * 2];
    return `rgb(${p.map((x, i) => Math.round(x + (q[i] - x) * u)).join(',')})`;
  };
  function marque(c, x, y, cls, fv) {
    const k = cls ? ` ${cls}` : '';
    if (c === 'criquet') return `<circle class="at-ia-m-criquet${k}" cx="${x}" cy="${y}" r="8"/>`;
    if (c === 'sauterelle') return `<path class="at-ia-m-sauterelle${k}" d="M${x} ${y - 10}L${x + 9.5} ${y + 7}L${x - 9.5} ${y + 7}Z"/>`;
    const fill = cls && cls.includes('test') ? '#fff' : COUL_FRUIT(fv);
    if (c === 'pomme') return `<circle class="at-ia-m-fruit${k}" cx="${x}" cy="${y}" r="8.5" style="fill:${fill}"/>`;
    return `<path class="at-ia-m-fruit${k}" style="fill:${fill}" d="M${x} ${y - 12}C${x + 4} ${y - 12} ${x + 4} ${y - 5} ${x + 7} ${y}C${x + 10} ${y + 7} ${x + 6} ${y + 10} ${x} ${y + 10}C${x - 6} ${y + 10} ${x - 10} ${y + 7} ${x - 7} ${y}C${x - 4} ${y - 5} ${x - 4} ${y - 12} ${x} ${y - 12}Z"/>`;
  }
  const PLURIEL = { criquet: 'criquets', sauterelle: 'sauterelles', pomme: 'pommes', poire: 'poires' };
  const nb = (n, c) => `${n} ${n > 1 ? PLURIEL[c] : c}`;

  /* =====================================================================
     ÉTAPE 1 — entraîner une IA (criquet ou sauterelle ?)
     ===================================================================== */
  const TESTS1 = [
    { x: 30, y: 10, c: 'criquet' }, { x: 36, y: 56, c: 'sauterelle' }, { x: 46, y: 16, c: 'criquet' },
    { x: 24, y: 38, c: 'sauterelle' }, { x: 18, y: 8, c: 'criquet' }, { x: 50, y: 62, c: 'sauterelle' },
    { x: 40, y: 24, c: 'criquet' }, { x: 28, y: 32, c: 'sauterelle' },
  ].slice(0, CONF.tests1);
  const COUL1 = { criquet: [252, 226, 200], sauterelle: [212, 238, 218] };
  const e1 = { etiq: 'criquet', vis: { x: 35, y: 35 }, plan: null, res: null };

  function construireE1() {
    $('ia-e1').innerHTML = `
    <div class="at-ia-duo">
      <div class="at-ia-carte">
        <div class="at-ia-plan" id="e1-plan" tabindex="0" role="application" aria-roledescription="plan d'entraînement"
          aria-label="Plan : longueur du corps de gauche à droite, longueur des antennes de bas en haut. Clique pour poser un exemple. Au clavier : flèches pour déplacer le viseur, Entrée pour poser, C pour criquet, S pour sauterelle."></div>
        <ul class="at-ia-leg">
          <li><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle class="at-ia-m-criquet" cx="10" cy="10" r="7"/></svg>criquet</li>
          <li><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path class="at-ia-m-sauterelle" d="M10 2L18 17H2Z"/></svg>sauterelle</li>
          <li><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle class="at-ia-m-criquet test" cx="10" cy="10" r="6.5"/></svg>insecte du test</li>
          <li><i class="at-ia-sw" style="background:rgb(${COUL1.criquet})"></i><i class="at-ia-sw" style="background:rgb(${COUL1.sauterelle})"></i>fond : ce que l'IA répondrait</li>
        </ul>
      </div>
      <div class="at-ia-panneau">
        <p class="at-ia-guide"><b>Ce que disent les biologistes.</b> Le criquet a des antennes courtes, bien plus courtes que son corps. La sauterelle a des antennes fines, souvent aussi longues que son corps, ou plus.</p>
        <div class="at-ia-choix" role="group" aria-label="Étiquette du prochain exemple">
          <button class="at-ia-etiq" data-etiq="criquet" aria-pressed="true"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle class="at-ia-m-criquet" cx="10" cy="10" r="7"/></svg>Criquet</button>
          <button class="at-ia-etiq" data-etiq="sauterelle" aria-pressed="false"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path class="at-ia-m-sauterelle" d="M10 2L18 17H2Z"/></svg>Sauterelle</button>
        </div>
        <p class="at-ia-petit" id="e1-mode"></p>
        <div class="at-ia-compte" id="e1-compte"></div>
        ${CONF.ks.length > 1 ? `<div class="at-ia-k" role="group" aria-label="Nombre de voisins consultés">
          <span>Voisins consultés :</span>${CONF.ks.map((k) => `<button class="at-ia-kb" data-k="${k}" aria-pressed="${k === st.s1.k}">k = ${k}</button>`).join('')}</div>`
          : `<p class="at-ia-petit">Ton IA regarde les <b>3 exemples les plus proches</b> et prend la réponse majoritaire.</p>`}
        <div class="at-ia-outils">
          <button class="btn s small" id="e1-annuler">Annuler le dernier</button>
          <button class="btn s small" id="e1-vider">Tout effacer</button>
        </div>
        <button class="btn p at-ia-large" id="e1-tester">Tester l'IA sur ${CONF.tests1} nouveaux insectes</button>
        <div class="commentaire" id="e1-comm" aria-live="polite"></div>
      </div>
    </div>
    <div class="at-ia-resultats" id="e1-res" aria-live="polite"></div>
    <details class="at-ia-plus"><summary>En savoir plus</summary><div>
      <p>Ton IA utilise la méthode des <b>k plus proches voisins</b> : pour un nouvel insecte, elle cherche sur le plan les k exemples les plus proches et répond comme la majorité d'entre eux. Elle n'a reçu aucune règle : elle n'a que tes exemples.</p>
      ${NIV >= 2 ? '<p>Avec k = 1, l\'IA copie son voisin le plus proche : un seul exemple mal placé crée un îlot d\'erreurs. Avec un k plus grand, la frontière est plus lisse, car une erreur isolée est mise en minorité.</p>' : ''}
      ${NIV === 3 ? '<p>La distance utilisée est la distance euclidienne : d = √((x₁ − x₂)² + (y₁ − y₂)²), en millimètres. Les deux mesures ont la même unité, donc aucune ne compte plus que l\'autre.</p>' : ''}
      <p>Les grandes IA (reconnaissance d'images, assistants conversationnels) utilisent d'autres méthodes, bien plus complexes, comme les réseaux de neurones. Mais beaucoup partagent la même idée : apprendre à partir d'exemples. Les mesures des insectes sont ici arrondies et simplifiées pour le jeu.</p>
    </div></details>`;

    e1.plan = creerPlan($('e1-plan'), { xmin: 0, xmax: 70, ymin: 0, ymax: 70, pas: 10, lx: 'Longueur du corps (mm) →', ly: 'Longueur des antennes (mm) →' });
    const plan = $('e1-plan');
    plan.addEventListener('click', (e) => {
      const p = e1.plan.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const m = e1.plan.svg.getScreenCTM(); if (!m) return;
      const q = p.matrixTransform(m.inverse());
      if (q.x < X0 || q.x > X0 + T || q.y < Y0 || q.y > Y0 + T) return;
      const x = Math.round(((q.x - X0) / T) * 70), y = Math.round(((Y0 + T - q.y) / T) * 70);
      ajouterPoint(Math.min(69, Math.max(1, x)), Math.min(69, Math.max(1, y)));
    });
    plan.addEventListener('focus', () => { if (plan.matches(':focus-visible')) majViseur(true); });
    plan.addEventListener('blur', () => majViseur(false));
    plan.addEventListener('keydown', (e) => {
      const pas = e.shiftKey ? 5 : 1, v = e1.vis;
      const moves = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, pas], ArrowDown: [0, -pas] };
      if (moves[e.key]) { e.preventDefault(); v.x = Math.min(69, Math.max(1, v.x + moves[e.key][0])); v.y = Math.min(69, Math.max(1, v.y + moves[e.key][1])); majViseur(true); return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ajouterPoint(v.x, v.y); return; }
      if (e.key === 'c' || e.key === 'C') choisirEtiq('criquet');
      if (e.key === 's' || e.key === 'S') choisirEtiq('sauterelle');
    });
    $('ia-e1').querySelectorAll('.at-ia-etiq').forEach((b) => b.addEventListener('click', () => choisirEtiq(b.dataset.etiq)));
    $('ia-e1').querySelectorAll('.at-ia-kb').forEach((b) => b.addEventListener('click', () => {
      st.s1.k = +b.dataset.k; sauver();
      $('ia-e1').querySelectorAll('.at-ia-kb').forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.k === st.s1.k)));
      redessinerE1();
      dire('e1-comm', `Ton IA consulte maintenant <b>${st.s1.k} voisin${st.s1.k > 1 ? 's' : ''}</b>. Regarde la frontière changer, puis reteste pour mesurer.`);
    }));
    $('e1-annuler').addEventListener('click', () => {
      const p = st.s1.pts.pop(); sauver(); redessinerE1();
      dire('e1-comm', p ? `Dernier exemple retiré (${p.c}, corps ${p.x} mm, antennes ${p.y} mm).` : 'Il n\'y a aucun exemple à retirer.');
    });
    $('e1-vider').addEventListener('click', () => {
      st.s1.pts = []; sauver(); e1.res = null; e1.plan.tests.innerHTML = ''; $('e1-res').innerHTML = ''; redessinerE1();
      dire('e1-comm', 'Plan vidé. Ton IA ne sait plus rien : elle n\'a plus aucun exemple.');
    });
    $('e1-tester').addEventListener('click', testerE1);
    choisirEtiq('criquet', true);
    redessinerE1();
    if (st.s1.prec) dire('e1-comm', `Reprise : tes ${st.s1.pts.length} exemples sont revenus. Dernière mesure : <b>${st.s1.prec.justes} / ${st.s1.prec.total}</b> justes. Tu peux continuer à entraîner ton IA.`);
    else dire('e1-comm', `Choisis une étiquette, puis clique sur le plan pour poser un exemple. Pose au moins <b>${CONF.min1} criquets</b> et <b>${CONF.min1} sauterelles</b>.`);
  }
  function choisirEtiq(c, silencieux) {
    e1.etiq = c;
    $('ia-e1').querySelectorAll('.at-ia-etiq').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.etiq === c)));
    $('e1-mode').innerHTML = `Clique ou touche le plan pour poser un <b>${c}</b>.`;
    if (!silencieux) dire('e1-comm', `Étiquette choisie : <b>${c}</b>.`);
  }
  function majViseur(on) {
    const v = e1.plan.viseur;
    v.setAttribute('visibility', on ? 'visible' : 'hidden');
    v.setAttribute('transform', `translate(${e1.plan.X(e1.vis.x)} ${e1.plan.Y(e1.vis.y)})`);
    if (on) $('e1-mode').innerHTML = `Viseur : corps ${e1.vis.x} mm, antennes ${e1.vis.y} mm. Entrée pour poser un <b>${e1.etiq}</b>.`;
  }
  function compte1() {
    const n = { criquet: 0, sauterelle: 0 };
    st.s1.pts.forEach((p) => n[p.c]++);
    return n;
  }
  function ajouterPoint(x, y) {
    if (st.s1.pts.length >= 60) { dire('e1-comm', 'Tu as déjà 60 exemples : c\'est assez pour cette petite IA. Retire-en ou teste-la.', 'faux'); return; }
    const c = e1.etiq;
    st.s1.pts.push({ x, y, c }); sauver(); redessinerE1();
    const n = compte1();
    let msg = `<b>${c[0].toUpperCase() + c.slice(1)} ajouté</b> : corps ${x} mm, antennes ${y} mm. (${nb(n.criquet, 'criquet')}, ${nb(n.sauterelle, 'sauterelle')})`;
    let type = '';
    if (c === 'criquet' && y > x) { msg += `<br>Attention : des antennes plus longues que le corps, c'est plutôt une sauterelle. Tu as le droit, mais ton IA va apprendre cette erreur. Tu peux l'annuler.`; type = 'faux'; }
    if (c === 'sauterelle' && y < 0.6 * x) { msg += `<br>Attention : des antennes aussi courtes, c'est plutôt un criquet. Tu as le droit, mais ton IA va apprendre cette erreur. Tu peux l'annuler.`; type = 'faux'; }
    dire('e1-comm', msg, type);
  }
  function redessinerE1() {
    const pl = e1.plan;
    pl.pts.innerHTML = st.s1.pts.map((p) => marque(p.c, pl.X(p.x), pl.Y(p.y))).join('');
    peindre(pl, st.s1.pts, st.s1.k, COUL1);
    const n = compte1(), ok = n.criquet >= CONF.min1 && n.sauterelle >= CONF.min1;
    $('e1-compte').innerHTML = `<span class="pill${n.criquet >= CONF.min1 ? ' ok' : ''}">${nb(n.criquet, 'criquet')}</span>
      <span class="pill${n.sauterelle >= CONF.min1 ? ' ok' : ''}">${nb(n.sauterelle, 'sauterelle')}</span>
      <span class="at-ia-petit">${ok ? 'Assez d\'exemples pour tester.' : `Minimum : ${CONF.min1} de chaque.`}</span>`;
    $('e1-plan').dataset.points = String(st.s1.pts.length);
  }
  function testerE1() {
    const n = compte1();
    if (n.criquet < CONF.min1 || n.sauterelle < CONF.min1) {
      dire('e1-comm', `Pas encore : il faut au moins <b>${CONF.min1} criquets et ${CONF.min1} sauterelles</b> (tu as ${nb(n.criquet, 'criquet')} et ${nb(n.sauterelle, 'sauterelle')}). Sans exemples des deux sortes, l'IA ne peut pas apprendre la différence.`, 'faux');
      return;
    }
    const k = st.s1.k, pl = e1.plan;
    const res = TESTS1.map((t, i) => { const r = knn(st.s1.pts, t.x, t.y, k); return { i, t, dit: r.c, ok: r.c === t.c, voisins: r.voisins }; });
    const justes = res.filter((r) => r.ok).length, total = res.length;
    st.s1.prec = { justes, total, g: {} }; sauver();
    pl.tests.innerHTML = res.map((r) => {
      const x = pl.X(r.t.x), y = pl.Y(r.t.y);
      return marque(r.t.c, x, y, 'test') + (r.ok ? '' : `<circle class="at-ia-rate" cx="${x}" cy="${y}" r="16"/>`) +
        `<text class="at-ia-num" x="${x + 13}" y="${y - 11}">${r.i + 1}</text>`;
    }).join('');
    const lignes = res.map((r) => {
      const cv = { criquet: 0, sauterelle: 0 }; r.voisins.forEach((v) => cv[v.c]++);
      const vois = `ses ${r.voisins.length} plus proche${r.voisins.length > 1 ? 's' : ''} voisin${r.voisins.length > 1 ? 's' : ''} : ${[cv.criquet ? nb(cv.criquet, 'criquet') : '', cv.sauterelle ? nb(cv.sauterelle, 'sauterelle') : ''].filter(Boolean).join(' et ')}`;
      return `<li class="${r.ok ? 'ok' : 'ko'}" data-ok="${r.ok}"><span class="at-ia-res-n">${r.i + 1}</span>
        <span>Corps ${r.t.x} mm, antennes ${r.t.y} mm → l'IA dit <b>${r.dit}</b> ${r.ok ? '<span class="at-ia-v">✓ juste</span>' : `<span class="at-ia-x">✗ faux</span> : c'était ${r.t.c === 'criquet' ? 'un criquet' : 'une sauterelle'}. Elle a suivi ${vois}.`}</span></li>`;
    }).join('');
    $('e1-res').innerHTML = `<div class="at-ia-score" id="e1-score" data-justes="${justes}" data-total="${total}">
        <b>${justes} / ${total}</b><span>réponses justes · précision ${pct(justes, total)} %</span></div>
      <ol class="at-ia-liste">${lignes}</ol>`;
    let msg;
    if (justes === total) msg = `<b>${justes} / ${total} : toutes justes !</b> Mais ${total} tests, c'est peu. Essaie de piéger ton IA : pose une sauterelle au milieu des criquets, reteste, et regarde la machine se tromper.`;
    else msg = `<b>${justes} / ${total} justes (${pct(justes, total)} %).</b> Les insectes entourés en rouge sont des erreurs : l'IA a suivi ses voisins, qui n'étaient pas les bons. Ajoute des exemples près de ces insectes, puis reteste.`;
    dire('e1-comm', msg, justes === total ? 'bon' : '');
    if (!st.faits.includes(1)) A.gagner(10, `${ID}:test1`);
    reussir(1);
  }

  /* =====================================================================
     ÉTAPE 2 — le biais (pommes et poires)
     ===================================================================== */
  const F = (x, y, c, g) => ({ x, y, c, g });
  const BASE2 = [
    ...[[7, 1.5], [8, 2], [9, 1], [7.5, 3], [8.5, 2.8], [6.8, 2.2], [9.2, 2.5], [8, 1], [7.2, 1], [8.8, 3.4], [9.5, 1.8], [7.8, 2.5]].map((a) => F(a[0], a[1], 'pomme', 'rouge')),
    F(0.5, 0.6, 'pomme', 'verte'),
    ...[[1.5, 5], [2.5, 6], [3.5, 5.5], [2, 7], [4, 6.5], [3, 7.5], [1, 6], [4.5, 5], [2.6, 4.2], [3.6, 4.4], [1.4, 4.3], [0.6, 5.2]].map((a) => F(a[0], a[1], 'poire', 'poire')),
  ];
  const TESTS2 = [
    ...[[7.4, 1.8], [8.2, 2.6], [9, 2], [6.6, 1.4], [8.6, 1.2], [7.8, 3.2], [9.4, 2.8], [7, 2.8], [8.4, 2], [9.6, 1.2]].map((a) => F(a[0], a[1], 'pomme', 'rouge')),
    ...[[2.2, 5.4], [3.2, 6.2], [1.4, 7], [3.8, 5.2], [2.6, 7.6], [4.2, 6], [1.8, 5.8], [3, 4.8], [4.4, 7], [2.4, 6.6]].map((a) => F(a[0], a[1], 'poire', 'poire')),
    ...[[0.8, 2.2], [2.2, 1.4], [1.2, 3], [2.8, 2.4], [2, 3.2]].map((a) => F(a[0], a[1], 'pomme', 'verte')),
  ];
  const RESERVE2 = { // fruits que l'enfant peut ajouter aux données (ordre d'affichage mélangé)
    g1: F(1.6, 2.4, 'pomme', 'verte'), r1: F(8.2, 1.6, 'pomme', 'rouge'), p1: F(2, 4.6, 'poire', 'poire'),
    g2: F(2.6, 1.6, 'pomme', 'verte'), g3: F(1, 3.4, 'pomme', 'verte'), r2: F(7, 2.6, 'pomme', 'rouge'),
    g4: F(2.4, 3, 'pomme', 'verte'), p2: F(3.2, 5.2, 'poire', 'poire'), g5: F(0.6, 1.8, 'pomme', 'verte'),
  };
  const NOM_G = { rouge: 'Pommes rouges', verte: 'Pommes vertes', poire: 'Poires' };
  const NOM_G1 = { rouge: 'pomme rouge', verte: 'pomme verte', poire: 'poire' };
  const COUL2 = { pomme: [253, 224, 224], poire: [234, 242, 206] };
  const e2 = { plan: null };
  const train2 = () => BASE2.concat(st.s2.ajouts.filter((id) => RESERVE2[id]).map((id) => RESERVE2[id]));
  const Q2 = [
    { q: 'Pourquoi l\'IA rangeait-elle les pommes vertes avec les poires ?',
      r: ['Parce que l\'algorithme préfère les poires.',
        'Parce qu\'il n\'y avait presque aucune pomme verte dans ses exemples : leurs voisins les plus proches étaient des poires vertes.',
        'Parce qu\'une pomme verte n\'est pas vraiment une pomme.'],
      b: 1,
      e: ['Non : l\'algorithme est le même pour tous les fruits. Il compte les voisins, il n\'a aucune préférence. Le problème vient des exemples.',
        'Oui. Le biais vient des <b>données</b>, pas de l\'algorithme : un groupe presque absent des exemples est mal reconnu.',
        'Si, c\'est une pomme ! C\'est l\'IA qui ne l\'a pas appris, faute d\'exemples.'] },
    { q: (p) => `Au départ, la précision globale était de ${p} %. Pourquoi ce chiffre était-il trompeur ?`,
      r: ['Parce qu\'il cachait un groupe sur lequel l\'IA se trompait presque à chaque fois.',
        'Parce qu\'une précision n\'est jamais un chiffre fiable.',
        'Il n\'était pas trompeur : ce score suffit pour tous les usages.'],
      b: 0,
      e: ['Oui. Une moyenne peut être bonne alors qu\'un petit groupe est presque toujours mal traité. Il faut mesurer la précision <b>groupe par groupe</b>.',
        'Si, le chiffre est juste : il est bien calculé. Mais une moyenne seule ne dit pas qui subit les erreurs.',
        'Pour trier des fruits, peut-être. Mais si le groupe oublié est un groupe de personnes (des visages, des voix, des accents), c\'est injuste pour elles.'] },
  ].slice(0, NIV === 3 ? 2 : 1);

  function construireE2() {
    $('ia-e2').innerHTML = `
    <p class="at-ia-intro">Une coopérative veut trier ses fruits avec une IA qui regarde deux choses : la <b>couleur</b> et la <b>forme</b>. Mais ses exemples ont été pris presque uniquement sur des pommes rouges et des poires.</p>
    <div class="at-ia-duo">
      <div class="at-ia-carte">
        <div class="at-ia-plan at-ia-plan-fixe" id="e2-plan" role="img" aria-label="Plan des fruits : couleur de gauche (vert) à droite (rouge), forme de bas (ronde) en haut (allongée)."></div>
        <ul class="at-ia-leg">
          <li><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle class="at-ia-m-fruit" cx="10" cy="10" r="7" style="fill:${COUL_FRUIT(8)}"/></svg>pomme</li>
          <li><svg viewBox="0 0 20 24" width="16" height="19" aria-hidden="true"><path class="at-ia-m-fruit" style="fill:${COUL_FRUIT(2)}" d="M10 1C14 1 14 8 17 12C20 19 16 22 10 22C4 22 0 19 3 12C6 8 6 1 10 1Z"/></svg>poire</li>
          <li><i class="at-ia-sw" style="background:rgb(${COUL2.pomme})"></i>zone « pomme »</li>
          <li><i class="at-ia-sw" style="background:rgb(${COUL2.poire})"></i>zone « poire »</li>
          <li><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle class="at-ia-m-fruit test" cx="10" cy="10" r="7" style="fill:#fff"/></svg>fruit du test</li>
        </ul>
        <p class="at-ia-petit">Couleur : 0 = vert, 5 = jaune, 10 = rouge. Forme : 0 = bien ronde, 10 = très allongée.</p>
      </div>
      <div class="at-ia-panneau">
        <div class="at-ia-compo" id="e2-compo"></div>
        <p class="at-ia-petit">Ton IA consulte les <b>${CONF.k2} voisins</b> les plus proches.</p>
        <button class="btn p at-ia-large" id="e2-tester">Tester sur 25 nouveaux fruits</button>
        <div class="commentaire" id="e2-comm" aria-live="polite">Lance un premier test et regarde les résultats <b>groupe par groupe</b>.</div>
      </div>
    </div>
    <div id="e2-tableau" aria-live="polite"></div>
    <div id="e2-reserve"></div>
    <div id="e2-q" class="quiz at-ia-quiz"></div>
    <details class="at-ia-plus"><summary>En savoir plus</summary><div>
      <p>Un <b>biais</b> est une erreur qui se répète toujours dans le même sens, pour le même groupe. Ici, il vient des données : l'algorithme n'a pas changé, seuls ses exemples ont été corrigés.</p>
      <p>Cela arrive aussi avec de vraies IA. En 2018, l'étude « Gender Shades » (Joy Buolamwini et Timnit Gebru, MIT) a testé des logiciels commerciaux qui devinaient le genre d'une personne sur une photo : ils se trompaient dans moins de 1 % des cas pour les hommes à la peau claire, et jusqu'à environ 35 % pour les femmes à la peau foncée, moins présentes dans les données.</p>
    </div></details>`;
    e2.plan = creerPlan($('e2-plan'), { xmin: 0, xmax: 10, ymin: 0, ymax: 10, pas: 2, lx: 'Couleur : vert → jaune → rouge', ly: 'Forme : ronde → allongée' });
    $('e2-tester').addEventListener('click', testerE2);
    redessinerE2();
    if (st.s2.avant) { afficherTableau(); afficherReserve(); afficherQ2(); }
  }
  function compo2() {
    const n = { rouge: 0, verte: 0, poire: 0 };
    train2().forEach((f) => n[f.g]++);
    return n;
  }
  function redessinerE2() {
    const pl = e2.plan, tr = train2();
    pl.pts.innerHTML = tr.map((f) => marque(f.c, pl.X(f.x), pl.Y(f.y), '', f.x)).join('');
    peindre(pl, tr, CONF.k2, COUL2);
    const n = compo2();
    $('e2-compo').innerHTML = `<div class="at-ia-compo-t">Exemples d'entraînement : ${tr.length} fruits</div>
      ${['rouge', 'verte', 'poire'].map((g) => `<div class="at-ia-barre"><span>${NOM_G[g]}</span><i style="--w:${(n[g] / 14) * 100}%"></i><b>${n[g]}</b></div>`).join('')}`;
  }
  function mesurer2() {
    const tr = train2(), g = { rouge: [0, 0], verte: [0, 0], poire: [0, 0] }, det = [];
    TESTS2.forEach((f) => { const r = knn(tr, f.x, f.y, CONF.k2); const ok = r.c === f.c; g[f.g][1]++; if (ok) g[f.g][0]++; det.push({ f, dit: r.c, ok }); });
    const justes = det.filter((d) => d.ok).length;
    return { res: { justes, total: det.length, g }, det };
  }
  function testerE2() {
    const { res, det } = mesurer2();
    const pl = e2.plan;
    pl.tests.innerHTML = det.map((d) => marque(d.f.c, pl.X(d.f.x), pl.Y(d.f.y), 'test') + (d.ok ? '' : `<circle class="at-ia-rate" cx="${pl.X(d.f.x)}" cy="${pl.Y(d.f.y)}" r="15"/>`)).join('');
    const premier = !st.s2.avant;
    if (premier || !st.s2.ajouts.length) st.s2.avant = res; else st.s2.apres = res;
    sauver();
    const v = res.g.verte;
    if (premier || !st.s2.ajouts.length) {
      dire('e2-comm', `Précision globale : <b>${res.justes} / ${res.total} (${pct(res.justes, res.total)} %)</b>. Ça a l'air correct… mais regarde les pommes vertes : <b>${v[0]} / ${v[1]}</b>. L'IA se trompe sur ce groupe presque à chaque fois. Ajoute des exemples ci-dessous pour réparer ses données, puis reteste.`, 'faux');
    } else if (v[0] >= 4) {
      dire('e2-comm', `Pommes vertes : <b>${v[0]} / ${v[1]}</b> (avant : ${st.s2.avant.g.verte[0]} / ${st.s2.avant.g.verte[1]}). Précision globale : ${pct(st.s2.avant.justes, st.s2.avant.total)} % → <b>${pct(res.justes, res.total)} %</b>. Les données rééquilibrées ont corrigé le biais.`, 'bon');
    } else {
      const dejaV = st.s2.ajouts.filter((id) => RESERVE2[id] && RESERVE2[id].g === 'verte').length;
      dire('e2-comm', `Pommes vertes : <b>${v[0]} / ${v[1]}</b>. ${dejaV === 0 ? 'Ajouter des pommes rouges ou des poires ne règle rien : c\'est d\'exemples de <b>pommes vertes</b> que l\'IA manque.' : `C'est mieux, mais ${dejaV} pomme${dejaV > 1 ? 's' : ''} verte${dejaV > 1 ? 's' : ''} parmi ${train2().length} fruits, c'est encore trop peu. Ajoutes-en d'autres.`}`, 'faux');
    }
    $('e2-tester').textContent = 'Mesurer à nouveau (25 fruits)';
    afficherTableau(); afficherReserve(); afficherQ2(); verifierE2();
  }
  function afficherTableau() {
    const a = st.s2.avant, b = st.s2.apres;
    if (!a) return;
    const cell = (r, g) => r ? (g ? `${r.g[g][0]} / ${r.g[g][1]} <small>(${pct(r.g[g][0], r.g[g][1])} %)</small>` : `<b>${r.justes} / ${r.total}</b> <small>(${pct(r.justes, r.total)} %)</small>`) : '—';
    $('e2-tableau').innerHTML = `<div class="at-ia-tabwrap"><table class="at-ia-tab at-ia-mesures" id="e2-mesures"
        data-avant="${a.justes}/${a.total}" data-avant-verte="${a.g.verte[0]}/${a.g.verte[1]}"
        data-apres="${b ? `${b.justes}/${b.total}` : ''}" data-apres-verte="${b ? `${b.g.verte[0]}/${b.g.verte[1]}` : ''}">
      <caption>Précision mesurée sur les 25 fruits du test</caption>
      <thead><tr><th scope="col">Groupe</th><th scope="col">Avant</th><th scope="col">Après tes ajouts</th></tr></thead>
      <tbody>${['rouge', 'poire', 'verte'].map((g) => `<tr${g === 'verte' ? ' class="at-ia-focus"' : ''}><th scope="row">${NOM_G[g]}</th><td>${cell(a, g)}</td><td>${cell(b, g)}</td></tr>`).join('')}
      <tr class="at-ia-total"><th scope="row">Tous les fruits</th><td>${cell(a)}</td><td>${cell(b)}</td></tr></tbody></table></div>`;
  }
  function afficherReserve() {
    if (!st.s2.avant) return;
    const montrerCoord = NIV >= 2;
    $('e2-reserve').innerHTML = `<h3 class="at-ia-h3">Répare les données : ajoute des fruits aux exemples</h3>
      <p class="at-ia-petit">Chaque fruit ajouté change aussitôt les zones colorées du plan. Choisis bien : tous les ajouts n'aident pas.</p>
      <div class="at-ia-reserve">${Object.entries(RESERVE2).map(([id, f]) => {
        const pris = st.s2.ajouts.includes(id);
        return `<button class="at-ia-fruit" data-fruit="${id}" aria-pressed="${pris}">
          <svg viewBox="0 0 24 26" width="26" height="28" aria-hidden="true">${marque(f.c, 12, 13, '', f.x)}</svg>
          <span><b>${NOM_G1[f.g][0].toUpperCase() + NOM_G1[f.g].slice(1)}</b>${montrerCoord ? `<small>couleur ${String(f.x).replace('.', ',')} · forme ${String(f.y).replace('.', ',')}</small>` : ''}</span>
          <span class="at-ia-fruit-etat">${pris ? 'ajoutée ✓' : '+ ajouter'}</span></button>`;
      }).join('')}</div>
      <div class="at-ia-outils"><button class="btn p" id="e2-retester">Mesurer à nouveau</button><button class="btn s small" id="e2-reset">Revenir aux données de départ</button></div>`;
    $('e2-reserve').querySelectorAll('[data-fruit]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.fruit, i = st.s2.ajouts.indexOf(id);
      if (i >= 0) st.s2.ajouts.splice(i, 1); else st.s2.ajouts.push(id);
      sauver(); redessinerE2(); afficherReserve();
      const f = RESERVE2[id];
      dire('e2-comm', `${i >= 0 ? 'Retirée' : 'Ajoutée'} : une ${NOM_G1[f.g]}. Regarde les zones du plan, puis clique sur « Mesurer à nouveau ».`);
      const nb2 = $('e2-reserve').querySelector(`[data-fruit="${id}"]`); if (nb2) nb2.focus();
    }));
    $('e2-retester').addEventListener('click', testerE2);
    $('e2-reset').addEventListener('click', () => { st.s2.ajouts = []; sauver(); redessinerE2(); afficherReserve(); e2.plan.tests.innerHTML = ''; dire('e2-comm', 'Données de départ remises : 1 seule pomme verte parmi 25 fruits.'); });
  }
  function afficherQ2() {
    if (!st.s2.avant) return;
    const p = pct(st.s2.avant.justes, st.s2.avant.total);
    $('e2-q').innerHTML = Q2.map((item, i) => {
      const fait = st.s2.q.includes(i);
      return `<article class="q${fait ? ' repondu' : ''}" data-q2="${i}">
        <h3>${typeof item.q === 'function' ? item.q(p) : item.q}</h3>
        <div class="rep">${item.r.map((r, k) => `<button data-k="${k}"${fait ? ` disabled${k === item.b ? ' class="bon"' : ''}` : ''}>${r}</button>`).join('')}</div>
        <div class="at-ia-retour" aria-live="polite">${fait ? item.e[item.b] : ''}</div></article>`;
    }).join('');
    $('e2-q').querySelectorAll('[data-q2]').forEach((art) => art.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-k]'); if (!b || b.disabled) return;
      const i = +art.dataset.q2, k = +b.dataset.k, item = Q2[i];
      art.querySelector('.at-ia-retour').innerHTML = item.e[k];
      if (k === item.b) {
        b.classList.add('bon'); art.querySelectorAll('button').forEach((x) => { x.disabled = true; });
        art.classList.add('repondu');
        if (!st.s2.q.includes(i)) { st.s2.q.push(i); sauver(); A.gagner(10, `${ID}:biais:q${i}`); majXP(); }
        verifierE2();
      } else { b.classList.add('faux'); b.disabled = true; }
    }));
  }
  function verifierE2() {
    const a = st.s2.apres;
    if (a && a.g.verte && a.g.verte[0] >= 4 && Q2.every((_, i) => st.s2.q.includes(i))) reussir(2);
    else if (a && a.g.verte && a.g.verte[0] >= 4) dire('e2-comm', `Biais corrigé : pommes vertes <b>${a.g.verte[0]} / ${a.g.verte[1]}</b>. Réponds maintenant ${Q2.length > 1 ? 'aux questions' : 'à la question'} ci-dessous pour terminer l'étape.`, 'bon');
  }

  /* =====================================================================
     ÉTAPE 3 — savoir demander (analyse locale, aucune IA appelée)
     ===================================================================== */
  const MATIERE = NIV === 3 ? 'SNT' : 'technologie';
  const SCEN = [
    { id: 'volcans', titre: 'Un exposé sur les volcans',
      mission: 'Tu prépares un exposé sur les volcans. Tu veux comprendre le sujet, pas qu\'on le fasse à ta place.',
      vague: 'volcans',
      precise: `Je suis ${EN_CLASSE} et je prépare un exposé de 3 minutes en SVT sur les volcans. Explique-moi en 5 points courts comment se produit une éruption, avec des mots simples. Ne rédige pas l'exposé à ma place. Indique-moi deux sources fiables pour vérifier.`,
      repVague: '<p>Un volcan est un relief formé par la sortie de magma à la surface de la Terre. Il en existe de nombreux types, partout dans le monde. Les volcans peuvent être dangereux, mais leurs cendres rendent aussi certains sols très fertiles. C\'est un sujet très vaste : il y aurait beaucoup à dire !</p>',
      critVague: 'Rien de faux, mais rien d\'utile : l\'assistant ne sait ni ton niveau, ni ce que tu dois en faire.',
      repPrecise: '<ol><li>En profondeur, une petite partie des roches fond : c\'est le <b>magma</b>.</li><li>Moins dense que les roches autour, il remonte et s\'accumule dans une <b>chambre magmatique</b>.</li><li>Il contient des gaz. En remontant, ces gaz forment des bulles, comme dans une bouteille de soda qu\'on ouvre.</li><li>Quand la pression est trop forte, le magma sort : c\'est l\'<b>éruption</b>. En surface, on l\'appelle la <b>lave</b>.</li><li>Lave fluide : elle coule (éruption <b>effusive</b>). Lave visqueuse : les gaz s\'échappent mal et ça explose (éruption <b>explosive</b>).</li></ol><p>Je ne rédige pas ton exposé : écris-le avec tes mots. Pour vérifier : ton manuel de SVT et le site de l\'Institut de physique du globe de Paris (IPGP), qui surveille les volcans français.</p>',
      critPrecise: 'Adaptée à ton niveau, au bon format, et elle te laisse faire ton travail.' },
    { id: 'photo', titre: 'Réviser la photosynthèse',
      mission: 'Tu as un contrôle de SVT sur la photosynthèse. Tu veux une explication courte et de quoi t\'entraîner.',
      vague: 'c\'est quoi la photosynthèse',
      precise: `Je suis ${EN_CLASSE} et je révise un contrôle de SVT. Explique la photosynthèse en 4 phrases maximum, avec des mots simples et un exemple de la vie courante, puis pose-moi 2 questions pour vérifier que j'ai compris. Dis-moi si un point est incertain.`,
      repVague: '<p>La photosynthèse est un processus biologique fondamental par lequel les organismes chlorophylliens convertissent l\'énergie lumineuse en énergie chimique, stockée sous forme de glucides synthétisés à partir de dioxyde de carbone et d\'eau, avec libération de dioxygène. Elle se déroule dans les chloroplastes et comprend une phase photochimique et une phase non photochimique (cycle de Calvin).</p>',
      critVague: 'Juste, mais écrite pour un étudiant : sans ton niveau, l\'assistant choisit au hasard.',
      repPrecise: '<p>1. La photosynthèse permet aux plantes vertes de fabriquer leur propre matière, notamment des sucres. 2. Pour cela, elles utilisent l\'eau puisée par les racines, le dioxyde de carbone de l\'air et l\'énergie de la lumière. 3. Cela se passe surtout dans les feuilles, grâce à la chlorophylle, le pigment vert. 4. En même temps, la plante rejette du dioxygène.</p><p><b>Exemple :</b> une plante d\'appartement laissée dans un placard sombre jaunit, puis dépérit.</p><p><b>Tes 2 questions :</b> en plus de la lumière, quels sont les deux éléments que la plante prélève dans son milieu ? Quel gaz rejette-t-elle ?</p><p>Rien d\'incertain ici : ce sont des notions du programme. Vérifie-les quand même dans ton manuel.</p>',
      critPrecise: 'Courte, à ton niveau, avec un exemple et des questions pour t\'entraîner.' },
    { id: 'binaire', titre: 'Comprendre le binaire',
      mission: `Tu as un exercice de ${MATIERE} : écrire un nombre en binaire. Tu veux la méthode, et t'entraîner seul.`,
      vague: 'binaire',
      precise: `Je suis ${EN_CLASSE} et j'ai un exercice de ${MATIERE} sur le binaire. Explique-moi étape par étape comment écrire 13 en binaire, sous forme de tableau, en moins de 100 mots. Ensuite, donne-moi un exercice du même type sans la solution. Dis-moi où vérifier dans mon manuel.`,
      repVague: '<p>Le binaire est un système de numération en base 2 qui n\'utilise que deux chiffres : 0 et 1. Il est utilisé en informatique. Souhaitez-vous en savoir plus sur un aspect particulier ?</p>',
      critVague: 'Une définition, puis une question : l\'assistant ne sait pas ce que tu veux en faire.',
      repPrecise: '<p>On décompose 13 en puissances de 2 : 13 = 8 + 4 + 1.</p><div class="at-ia-tabwrap"><table class="at-ia-tab at-ia-mini"><tr><th scope="col">8</th><th scope="col">4</th><th scope="col">2</th><th scope="col">1</th></tr><tr><td>1</td><td>1</td><td>0</td><td>1</td></tr></table></div><p>On écrit 1 sous chaque valeur utilisée, 0 sinon : 13 s\'écrit <b>1101</b> en binaire.</p><p><b>À toi :</b> écris 22 en binaire (je ne donne pas la solution).</p><p>Pour vérifier : le chapitre sur le codage de l\'information dans ton manuel.</p>',
      critPrecise: 'La méthode, au bon format, et un exercice pour t\'entraîner seul.' },
  ];
  const CRIT = [
    { id: 'but', nom: 'But clair', aide: 'Dis ce que tu veux avec un verbe d\'action : « Explique… », « Résume… », « Propose… ».',
      re: /\b(explique[rsz]?|resumer?|resume[sz]?|donne[rsz]?|propose[rsz]?|aide[rsz]?|corrige[rsz]?|compare[rsz]?|liste[rsz]?|decri(s|re|vez)|defini(s|r|ssez)|montre[rsz]?|pose[rsz]?|fai(s|re|tes)|cree[rsz]?|redige[rsz]?|tradui(s|re)|calcule[rsz]?|verifie[rsz]?|presente[rsz]?|trouve[rsz]?|ecri(s|re|vez)|indique[rsz]?|conseille[rsz]?|prepare[rsz]?|interroge[rsz]?|entraine[rsz]?)\b/ },
    { id: 'contexte', nom: 'Contexte', aide: 'Dis pourquoi tu demandes : « Je prépare un exposé en SVT… », « J\'ai un contrôle sur… ».',
      re: /\b(je prepare|je dois|j'ai (un|une|des)|je travaille|je revise|on etudie|nous etudions|pour (un|une|mon|ma|mes|demain)|exposes?|controles?|devoirs?|evaluations?|cours|exercices?|lecons?|projets?|revisions?|reviser|en svt|en techno|en technologie|en snt|en physique|en maths|en classe|chapitres?|parce que)\b/ },
    { id: 'niveau', nom: 'Niveau ou public', aide: 'Précise ton niveau : « Je suis en 5e », « avec des mots simples ».',
      re: /\b(6e|6eme|sixieme|5e|5eme|cinquieme|4e|4eme|quatrieme|3e|3eme|troisieme|seconde|2de|2nde|premiere|terminale|college|collegien(ne)?|lycee|lyceen(ne)?|\d{1,2} ans|enfants?|debutants?|eleves?|mots simples|simplement|niveau|vocabulaire simple|facile a comprendre)\b/ },
    { id: 'format', nom: 'Format de la réponse', aide: 'Dis quelle forme tu veux : « en 5 points », « un tableau », « étape par étape ».',
      re: /(\b\d+\s*(points?|phrases?|lignes?|etapes?|parties?|exemples?|questions?|idees?|paragraphes?)\b|\bsous forme\b|\btableau\b|\bliste\b|\betape par etape\b|\bplan\b|\bfiche\b|\bquiz\b|\bpuces?\b|\bschema\b|\ben (deux|trois|quatre|cinq|six|dix) (points|phrases|lignes|etapes|parties)\b)/ },
    { id: 'contraintes', nom: 'Contraintes', aide: 'Fixe des limites : « 100 mots maximum », « sans rédiger à ma place », « seulement… ».',
      re: /(\bmaximum\b|\bmax\b|\bau plus\b|\bmoins de\b|\bpas plus de\b|\bsans\b|\bne\b[^.!?]{0,40}\bpas\b|\bn'[^.!?]{0,40}\bpas\b|\bpas de\b|\buniquement\b|\bseulement\b|\bcourte?s?\b|\bbrefs?\b|\bbreves?\b|\blimite\b|\b\d+\s*(mots|lignes|minutes|caracteres)\b)/ },
    { id: 'sources', nom: 'Sources ou vérification', aide: 'Demande d\'où vient l\'information : « Indique tes sources », « dis-moi si tu n\'es pas sûr ».',
      re: /\b(sources?|references?|verifier|verifie|verification|incertaine?s?|incertitudes?|pas sur|pas certaine?|d'ou vien(t|nent)|citer?|fiables?|manuel|preuves?|doutes?)\b/ },
  ];
  const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’`]/g, '\'').toLowerCase();
  function analyser(texte) {
    const t = norm(texte);
    const crit = CRIT.map((c) => ({ id: c.id, nom: c.nom, aide: c.aide, ok: c.re.test(t) }));
    const alertes = [];
    if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(texte)) alertes.push('une adresse e-mail');
    if (/(\+33|\b0)\s*[1-9]([\s.-]*\d{2}){4}\b/.test(texte)) alertes.push('un numéro de téléphone');
    if (/\b\d{1,4}\s*,?\s*(rue|avenue|boulevard|bd|chemin|allee|impasse|place)\b/.test(t) || /\bj'habite\b|\bmon adresse\b/.test(t)) alertes.push('une adresse');
    if (/\bmot de passe\b|\bmdp\b/.test(t)) alertes.push('un mot de passe');
    if (/\bje m'appelle\b|\bmon nom (est|c'est)\b/.test(t)) alertes.push('ton nom');
    const triche = /\b(fai[st]|ecri[st]|redige)(-moi|\s+moi)?\s+(mon|ma|mes|le|la)\s+(expose|devoir|redaction|dissertation|exercice|dm)\b/.test(t);
    return { crit, n: crit.filter((c) => c.ok).length, alertes, triche, court: t.trim().length < 15 };
  }
  const e3 = { scen: 0, essais: {} };

  function construireE3() {
    $('ia-e3').innerHTML = `
    <div class="at-ia-honnete" role="note"><b>Ici, aucune IA n'est appelée.</b> Ton navigateur repère simplement des mots dans ta demande, selon 6 critères écrits à l'avance. Il peut se tromper. Les réponses montrées ont été écrites à l'avance pour te faire voir la différence : c'est un entraînement.</div>
    <div class="at-ia-onglets" role="group" aria-label="Choisis une mission">${SCEN.map((s, i) => `<button class="at-ia-onglet" data-scen="${i}" aria-pressed="${i === 0}">${s.titre}<span class="at-ia-onglet-s" id="e3-s-${s.id}"></span></button>`).join('')}</div>
    <div class="at-ia-duo at-ia-duo-e3">
      <div class="at-ia-carte at-ia-carte-txt">
        <p class="at-ia-mission" id="e3-mission"></p>
        <label class="at-ia-label" for="e3-texte">Ta demande à l'assistant (améliore-la) :</label>
        <textarea id="e3-texte" class="at-ia-texte" rows="5" maxlength="600" spellcheck="true"></textarea>
        <div class="at-ia-outils"><button class="btn p" id="e3-analyser">Analyser ma demande</button><button class="btn s small" id="e3-exemple" hidden>Voir une demande précise</button></div>
        <p class="at-ia-petit">Objectif : au moins <b>${CONF.seuil3} critères sur 6</b>, pour ${CONF.scen} mission${CONF.scen > 1 ? 's' : ''}.</p>
      </div>
      <div class="at-ia-panneau">
        <div class="at-ia-crit" id="e3-crit"></div>
        <div class="commentaire" id="e3-comm" aria-live="polite">Écris ta demande à gauche, puis clique sur « Analyser ma demande ».</div>
      </div>
    </div>
    <div id="e3-compare"></div>
    <details class="at-ia-plus"><summary>En savoir plus</summary><div>
      <p>Un assistant conversationnel produit un texte probable, mot après mot, à partir de ce qu'il a appris sur d'immenses quantités de textes. Il ne sait pas qui tu es : sans précision, il répond « en moyenne ».</p>
      <p>Il ne vérifie pas toujours ce qu'il écrit : il peut se tromper ou inventer avec assurance. Demander des sources aide, mais il faut ensuite vérifier qu'elles existent et disent bien cela.</p>
    </div></details>`;
    $('ia-e3').querySelectorAll('[data-scen]').forEach((b) => b.addEventListener('click', () => choisirScen(+b.dataset.scen)));
    $('e3-analyser').addEventListener('click', analyserE3);
    $('e3-exemple').addEventListener('click', () => {
      const s = SCEN[e3.scen];
      $('e3-compare').querySelector('.at-ia-ex')?.removeAttribute('hidden');
      dire('e3-comm', `Exemple de demande précise : « ${esc(s.precise)} » Ne la recopie pas : écris la tienne, avec tes mots.`);
    });
    choisirScen(0);
    majOnglets();
  }
  function majOnglets() {
    SCEN.forEach((s) => {
      const b = st.s3.best[s.id], el = $(`e3-s-${s.id}`);
      if (el) el.textContent = b != null ? (b >= CONF.seuil3 ? ' · réussie ✓' : ` · record ${b}/6`) : '';
    });
  }
  function choisirScen(i) {
    e3.scen = i;
    const s = SCEN[i];
    $('ia-e3').querySelectorAll('[data-scen]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.scen === i)));
    $('e3-mission').innerHTML = `<b>Mission.</b> ${s.mission}`;
    $('e3-texte').value = s.vague;
    $('e3-crit').innerHTML = '';
    $('e3-compare').innerHTML = '';
    $('e3-exemple').hidden = !((e3.essais[s.id] || 0) >= 2 || (st.s3.best[s.id] || 0) >= CONF.seuil3);
    dire('e3-comm', `Voici une demande vague : « ${esc(s.vague)} ». Améliore-la, puis clique sur « Analyser ma demande ».`);
  }
  function analyserE3() {
    const s = SCEN[e3.scen], texte = $('e3-texte').value;
    const r = analyser(texte);
    e3.essais[s.id] = (e3.essais[s.id] || 0) + 1;
    $('e3-crit').innerHTML = `<div class="at-ia-score at-ia-score-p" id="e3-score" data-n="${r.n}"><b>${r.n} / 6</b><span>critères repérés par ton navigateur (simple repérage de mots, pas une IA)</span></div>
      <ul class="at-ia-critl">${r.crit.map((c) => `<li class="${c.ok ? 'ok' : 'ko'}" data-crit="${c.id}"><span class="at-ia-ck" aria-hidden="true">${c.ok ? '✓' : '○'}</span>
        <span><b>${c.nom}</b>${c.ok ? '<span class="sr"> : repéré</span>' : `<span class="sr"> : manquant</span><small>${c.aide}</small>`}</span></li>`).join('')}</ul>`;
    const avant = st.s3.best[s.id] || 0;
    if (r.n > avant) { st.s3.best[s.id] = r.n; sauver(); }
    let msg = '', type = '';
    if (r.court) { msg = 'Ta demande est très courte : l\'assistant devra tout deviner. Ajoute ton but, ton niveau et la forme de réponse que tu veux.'; type = 'faux'; }
    else if (r.n >= CONF.seuil3) { msg = `<b>${r.n} critères sur 6 : demande précise !</b> Compare ci-dessous les deux réponses types.`; type = 'bon'; }
    else { const manque = r.crit.filter((c) => !c.ok).map((c) => c.nom.toLowerCase()); msg = `<b>${r.n} / 6.</b> Il manque : ${manque.join(', ')}. Complète ta demande, puis analyse-la à nouveau.`; }
    if (r.triche) msg += '<br>Demander à l\'IA de faire ton travail à ta place n\'est pas une bonne idée : demande-lui plutôt de t\'expliquer, ou de te poser des questions.';
    if (r.alertes.length) { msg += `<br><b>Attention :</b> ta demande semble contenir ${r.alertes.join(', ')}. Ne donne jamais d'informations personnelles à une IA.`; type = 'faux'; }
    dire('e3-comm', msg, type);
    $('e3-compare').innerHTML = `<p class="at-ia-petit at-ia-avert">Les deux réponses ci-dessous ont été écrites à l'avance par l'équipe de l'atelier. Aucune IA n'a été appelée.</p><div class="at-ia-compare">
      <article class="at-ia-rep at-ia-rep-vague"><div class="at-ia-rep-tag">Demande vague → réponse type</div><p class="at-ia-demande">« ${esc(s.vague)} »</p>
        <div class="at-ia-rep-txt">${s.repVague}</div><p class="at-ia-rep-crit">${s.critVague}</p></article>
      <article class="at-ia-rep at-ia-rep-precise"><div class="at-ia-rep-tag">Demande précise → réponse type</div>
        <p class="at-ia-demande at-ia-ex"${(r.n >= CONF.seuil3 || e3.essais[s.id] >= 2) ? '' : ' hidden'}>« ${esc(s.precise)} »</p>
        <div class="at-ia-rep-txt">${s.repPrecise}</div><p class="at-ia-rep-crit">${s.critPrecise}</p></article>
    </div>`;
    $('e3-exemple').hidden = !(e3.essais[s.id] >= 2 || r.n >= CONF.seuil3);
    if (r.n >= CONF.seuil3) A.gagner(15, `${ID}:prompt:${s.id}`);
    majOnglets(); majXP();
    const reussies = SCEN.filter((x) => (st.s3.best[x.id] || 0) >= CONF.seuil3).length;
    if (reussies >= CONF.scen) reussir(3);
    else if (r.n >= CONF.seuil3) dire('e3-comm', `${msg}<br>Encore ${CONF.scen - reussies} mission à réussir : choisis-en une autre au-dessus.`, type);
  }

  /* =====================================================================
     ÉTAPE 4 — esprit critique (réponses pré-écrites) + règles d'usage
     ===================================================================== */
  const ITEMS = {
    mercure: { q: 'Quelle est la planète la plus proche du Soleil ?',
      ph: ['La planète la plus proche du Soleil est Mercure.', 'Elle fait le tour du Soleil en environ 88 jours.', 'C\'est aussi, sans aucun doute, la planète la plus chaude du système solaire.'],
      faux: 2, type: 'Fait faux, dit avec certitude',
      e: 'La planète la plus chaude est <b>Vénus</b> (environ 460 °C en surface), à cause de son atmosphère épaisse qui piège la chaleur. Les deux premières phrases sont justes.' },
    eau: { q: 'À quelle température l\'eau bout-elle ?',
      ph: ['Au niveau de la mer, l\'eau pure bout à 100 °C.', 'En montagne, elle bout à une température plus basse, car la pression de l\'air y est plus faible.', 'Selon l\'Institut international des liquides (2019), l\'eau de mer bout à 150 °C.'],
      faux: 2, type: 'Source inventée et chiffre faux',
      e: 'Cet « institut » a été inventé pour l\'exercice, et le chiffre est faux : le sel ne fait monter la température d\'ébullition que de moins d\'un degré. Les deux premières phrases sont justes.' },
    hugo: { q: 'Qui a écrit Les Misérables ?',
      ph: ['Les Misérables est un roman de Victor Hugo.', 'Il a été publié en 1862.', 'Victor Hugo a reçu le prix Nobel de littérature en 1885 pour ce livre.'],
      faux: 2, type: 'Fait inventé',
      e: 'Impossible : le prix Nobel n\'existe que depuis <b>1901</b>, et Victor Hugo est mort en 1885. Le reste est juste.' },
    os: { q: 'Combien d\'os a un adulte ?',
      ph: ['Le squelette d\'un adulte compte en général 206 os.', 'Le plus long est le fémur, dans la cuisse.', 'Le plus petit est l\'étrier, dans l\'oreille.'],
      faux: -1, type: 'Aucune erreur',
      e: 'Tout est juste. Une IA ne se trompe pas toujours ! Mais tu ne pouvais pas le savoir sans vérifier : un manuel de SVT le confirme.' },
    saisons: { q: 'Pourquoi y a-t-il des saisons ?',
      ph: ['Les saisons existent parce que l\'axe de rotation de la Terre est incliné d\'environ 23° par rapport à son orbite.', 'En été, dans notre hémisphère, les rayons du Soleil arrivent plus droit et les journées sont plus longues.', 'Ce n\'est pas parce que la Terre est plus proche du Soleil : elle en est même au plus près début janvier.'],
      faux: -1, type: 'Aucune erreur',
      e: 'Tout est juste, y compris la dernière phrase, qui surprend souvent : la Terre passe au plus près du Soleil début janvier, en plein hiver chez nous.' },
    muraille: { q: 'La Grande Muraille de Chine se voit-elle depuis l\'espace ?',
      ph: ['La Grande Muraille s\'étend sur plusieurs milliers de kilomètres.', 'Elle est pourtant étroite : quelques mètres de large.', 'C\'est certain à 100 % : c\'est la seule construction humaine visible à l\'œil nu depuis la Lune.'],
      faux: 2, type: 'Fausse certitude',
      e: 'C\'est une légende. Depuis la Lune, à environ 384 000 km, aucune construction humaine ne se voit à l\'œil nu ; et la muraille, trop étroite, est déjà très difficile à voir depuis l\'orbite des astronautes. Le ton « certain à 100 % » doit justement t\'alerter.' },
    coeur: { q: 'Combien de fois bat le cœur ?',
      ph: ['Au repos, le cœur d\'un adulte bat en général entre 60 et 100 fois par minute.', 'Il envoie le sang dans tout le corps par les artères.', 'Selon une étude du professeur Martin Durand (« Revue mondiale du cœur », 2021), faire du sport double la taille du cœur en un mois.'],
      faux: 2, type: 'Source inventée',
      e: 'Ce professeur et cette revue ont été inventés pour l\'exercice : c\'est exactement le genre de source qui a l\'air sérieuse et n\'existe pas. Et le chiffre est absurde : l\'entraînement renforce le cœur sur des mois, il ne double pas sa taille.' },
  };
  const REGLES = [
    { t: 'Je donne mon nom, mon adresse et le nom de mon collège à l\'IA pour qu\'elle m\'aide mieux.', bon: false,
      e: 'Ne donne jamais d\'informations personnelles (nom, adresse, téléphone, photo, mot de passe) : tu ne sais pas ce que deviennent ces données.' },
    { t: 'Je vérifie un chiffre donné par l\'IA dans mon manuel ou sur un site fiable.', bon: true,
      e: 'Oui : une IA peut se tromper avec assurance. On vérifie dans au moins une source fiable.' },
    { t: 'Je rends un devoir écrit par une IA sans le dire.', bon: false,
      e: 'Non : ce serait présenter comme le tien un travail qui ne l\'est pas. Si tu utilises une IA pour un devoir, dis-le, et précise pour quoi faire.' },
    { t: 'Avant d\'utiliser une IA pour un devoir, je regarde ce que permettent le règlement de l\'établissement et mon professeur.', bon: true,
      e: 'Oui : les règles changent d\'un établissement et d\'un professeur à l\'autre. Beaucoup de services d\'IA fixent aussi un âge minimum : lis leurs conditions avec un adulte.' },
    { t: 'Si l\'IA cite une source, c\'est que cette source existe.', bon: false,
      e: 'Non : une IA peut inventer un titre, un auteur ou un site qui ont l\'air vrais. Cherche la source toi-même.' },
    { t: 'Une IA qui répond avec assurance a forcément raison.', bon: false,
      e: 'Non : le ton assuré ne prouve rien. Une IA écrit souvent avec la même assurance, qu\'elle ait raison ou tort.' },
  ].slice(0, CONF.regles4);
  const LISTE4 = CONF.items4;

  function construireE4() {
    $('ia-e4').innerHTML = `
    <p class="at-ia-intro">Voici des réponses d'assistant, écrites à l'avance pour l'exercice. Certaines contiennent une erreur ou une invention, d'autres sont justes. Pour chacune, <b>clique sur la phrase fausse</b>, ou sur « Aucune erreur ».</p>
    <div class="at-ia-items">${LISTE4.map((id, n) => {
      const it = ITEMS[id];
      return `<article class="at-ia-item" data-item="${id}">
        <p class="at-ia-question"><span class="at-ia-qn">${n + 1}</span>Question posée : « ${it.q} »</p>
        <div class="at-ia-bulle" role="group" aria-label="Réponse de l'assistant, phrase par phrase">${it.ph.map((p, k) => `<button class="at-ia-phrase" data-ph="${k}">${p}</button>`).join(' ')}</div>
        <button class="btn s small at-ia-aucune" data-ph="-1">Aucune erreur</button>
        <div class="at-ia-retour" aria-live="polite"></div></article>`;
    }).join('')}</div>
    <h3 class="at-ia-h3">Les règles d'un bon usage</h3>
    <p class="at-ia-petit">Bonne idée ou mauvaise idée ?</p>
    <div class="at-ia-regles">${REGLES.map((r, i) => `<article class="at-ia-regle" data-regle="${i}"><p>${r.t}</p>
      <div class="at-ia-rb"><button class="btn s small" data-v="1">Bonne idée</button><button class="btn s small" data-v="0">Mauvaise idée</button></div>
      <div class="at-ia-retour" aria-live="polite"></div></article>`).join('')}</div>
    <div class="commentaire" id="e4-comm" aria-live="polite">Réponds à tout : le score s'affiche à la fin.</div>
    <details class="at-ia-plus"><summary>En savoir plus</summary><div>
      <p>Un assistant conversationnel peut produire des phrases fausses avec beaucoup d'assurance : on parle parfois d'« hallucinations ». Trois signaux doivent t'alerter : un chiffre précis que tu ne peux pas vérifier, une source que tu ne retrouves pas, et un ton trop sûr (« c'est certain », « sans aucun doute »).</p>
      <p>Pour vérifier : ton manuel, ton professeur, un dictionnaire ou une encyclopédie reconnue, le site d'un organisme officiel.</p>
    </div></details>`;
    $('ia-e4').querySelectorAll('[data-item]').forEach((art) => art.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ph]'); if (!b || art.classList.contains('fait')) return;
      repondreItem(art.dataset.item, +b.dataset.ph, true);
    }));
    $('ia-e4').querySelectorAll('[data-regle]').forEach((art) => art.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b || art.classList.contains('fait')) return;
      repondreRegle(+art.dataset.regle, b.dataset.v === '1', true);
    }));
    // reprise
    for (const id of LISTE4) if (st.s4.rep[id] != null) repondreItem(id, st.s4.rep[id], false);
    REGLES.forEach((_, i) => { if (st.s4.regles[i] != null) repondreRegle(i, st.s4.regles[i], false); });
  }
  function repondreItem(id, k, nouveau) {
    const it = ITEMS[id], art = $('ia-e4').querySelector(`[data-item="${id}"]`);
    const ok = k === it.faux;
    art.classList.add('fait', ok ? 'juste' : 'rate');
    art.querySelectorAll('[data-ph]').forEach((b) => {
      const v = +b.dataset.ph; b.disabled = true;
      if (v === -1) { if (it.faux === -1) b.classList.add('bon'); else if (k === -1) b.classList.add('at-ia-choix-x'); return; }
      if (v === it.faux) { b.classList.add('at-ia-erreur'); b.insertAdjacentHTML('afterbegin', '<span class="at-ia-tag at-ia-tag-err">✗ Erreur</span> '); }
      else if (v === k) { b.classList.add('at-ia-choix-x'); b.insertAdjacentHTML('beforeend', ' <span class="at-ia-tag at-ia-tag-ok">ton choix (pourtant juste)</span>'); }
    });
    let avant = '';
    if (!ok) avant = it.faux === -1 ? 'Raté : cette phrase est juste, il n\'y avait aucune erreur ici.' : k === -1 ? 'Raté : il y avait bien une erreur, marquée « Erreur » en rouge.' : 'Raté : la phrase que tu as choisie est juste. L\'erreur est marquée en rouge.';
    art.querySelector('.at-ia-retour').innerHTML = `${ok ? '<b class="at-ia-ok">Bien vu.</b>' : `<b class="at-ia-ko">${avant}</b>`} <span class="at-ia-type">${it.type}</span> ${it.e}`;
    if (nouveau) {
      st.s4.rep[id] = k; sauver();
      if (ok) { A.gagner(10, `${ID}:esprit:${id}`); majXP(); }
      verifierE4();
    }
  }
  function repondreRegle(i, v, nouveau) {
    const r = REGLES[i], art = $('ia-e4').querySelector(`[data-regle="${i}"]`), ok = v === r.bon;
    art.classList.add('fait', ok ? 'juste' : 'rate');
    art.querySelectorAll('[data-v]').forEach((b) => {
      const bv = b.dataset.v === '1'; b.disabled = true;
      if (bv === r.bon) b.classList.add('bon'); else if (bv === v) b.classList.add('faux');
    });
    art.querySelector('.at-ia-retour').innerHTML = `<b>${ok ? 'Exact.' : (r.bon ? 'Si, c\'est une bonne idée.' : 'Non, c\'est une mauvaise idée.')}</b> ${r.e}`;
    if (nouveau) {
      st.s4.regles[i] = v; sauver();
      if (ok) { A.gagner(5, `${ID}:regle:${i}`); majXP(); }
      verifierE4();
    }
  }
  function score4() {
    const items = LISTE4.filter((id) => st.s4.rep[id] === ITEMS[id].faux).length;
    const regles = REGLES.filter((r, i) => st.s4.regles[i] === r.bon).length;
    const fini = LISTE4.every((id) => st.s4.rep[id] != null) && REGLES.every((_, i) => st.s4.regles[i] != null);
    return { items, regles, total: LISTE4.length + REGLES.length, bon: items + regles, fini };
  }
  function verifierE4() {
    const s = score4();
    if (!s.fini) { dire('e4-comm', `${Object.keys(st.s4.rep).filter((id) => LISTE4.includes(id)).length} réponse(s) d'assistant vérifiée(s) sur ${LISTE4.length}, ${Object.keys(st.s4.regles).filter((i) => +i < REGLES.length).length} règle(s) sur ${REGLES.length}.`); return; }
    dire('e4-comm', `<span id="e4-score" data-bon="${s.bon}" data-total="${s.total}"><b>${s.bon} / ${s.total}</b></span> : ${s.items} erreur${s.items > 1 ? 's' : ''} bien repérée${s.items > 1 ? 's' : ''} sur ${LISTE4.length} et ${s.regles} règle${s.regles > 1 ? 's' : ''} sur ${REGLES.length}. ${s.bon === s.total ? 'Parfait : tu as l\'œil d\'un vérificateur.' : 'Relis les explications des réponses ratées : ce sont elles qui t\'apprennent le plus.'}`, s.bon >= 0.8 * s.total ? 'bon' : '');
    reussir(4);
  }

  /* ---------- bilan ---------- */
  function bilan() {
    const s4 = score4();
    const maitrise = s4.fini && s4.bon >= Math.ceil(0.8 * s4.total);
    A.badge(maitrise ? ID : `${ID}-decouverte`);
    const p1 = st.s1.prec, a = st.s2.avant, b = st.s2.apres;
    const best = SCEN.map((s) => st.s3.best[s.id] || 0);
    $('bilan').innerHTML = `
      <div class="kicker">Bilan de l'atelier</div>
      <div class="note">4 / 4 étapes</div>
      <ul class="at-ia-bilan">
        <li>Ton IA d'insectes : <b>${p1 ? `${p1.justes} / ${p1.total}` : '—'}</b> au dernier test.</li>
        <li>Le biais : pommes vertes <b>${a ? `${a.g.verte[0]} / ${a.g.verte[1]}` : '—'}</b> avant, <b>${b ? `${b.g.verte[0]} / ${b.g.verte[1]}` : '—'}</b> après tes ajouts.</li>
        <li>Ta meilleure demande : <b>${Math.max(...best)} / 6</b> critères.</li>
        <li>Esprit critique : <b>${s4.bon} / ${s4.total}</b>.</li>
      </ul>
      <p class="at-ia-petit">${maitrise ? 'Tu sais comment une IA apprend, d\'où viennent ses biais, comment lui parler et comment la vérifier.' : 'Les bases sont là. Refais l\'étape 4 plus tard pour viser au moins 80 % et obtenir le badge.'}</p>
      <span class="badge at-ia-badge">${maitrise ? 'Badge « IA maîtrisée » obtenu' : 'Badge « découverte de l\'IA » obtenu'}</span>
      <div class="cta"><a class="btn p" href="index.html">Retour à l'accueil</a><a class="btn s" href="#etape1">Revoir l'atelier</a></div>`;
    $('bilan').classList.add('vu');
  }

  /* ---------- démarrage ---------- */
  construireE1(); construireE2(); construireE3(); construireE4();
  if (A.etape(ID) < st.faits.length) A.terminer(ID, st.faits.length);
  majXP(); majSommaire();
  if (st.faits.length === TOTAL) bilan();
  if (LISTE4.every((id) => st.s4.rep[id] != null)) verifierE4();
})();
