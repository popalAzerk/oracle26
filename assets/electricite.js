/* Module « Électricité » — simulateur de circuit, défis, fiches, quiz.
   Contenus inspirés des programmes publiés : Angleterre (KS2-KS3), Singapour (electrical system),
   Japon (pathway of electricity). Direction : Atelier (Apple + couleur, une couleur par notion). */
(function () {
  const A = window.Atelier;
  const SVG_PLAY = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:6px"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>';

  const R_LAMPE = 10;           // ohms, valeur ronde pour des calculs lisibles
  const MATERIAUX = {
    cuivre:      { nom: 'Fil de cuivre',   conduit: true,  note: 'métal : les électrons y circulent très bien' },
    aluminium:   { nom: 'Fil d\u2019aluminium', conduit: true, note: 'métal : conduit un peu moins bien que le cuivre' },
    eau_salee:   { nom: 'Eau salée',       conduit: true,  note: 'les ions du sel transportent le courant' },
    bois:        { nom: 'Morceau de bois', conduit: false, note: 'isolant : aucun courant ne passe' },
    verre:       { nom: 'Verre',           conduit: false, note: 'isolant : aucun courant ne passe' },
    plastique:   { nom: 'Plastique',       conduit: false, note: 'isolant : c\u2019est pour cela qu\u2019on gaine les fils' },
  };
  const TENSIONS = [1.5, 3, 4.5, 9];

  const etat = {
    tension: 4.5,
    interrupteur: false,
    topologie: 'simple',      // simple | serie | parallele
    materiau: 'cuivre',
    courtCircuit: false,
    defis: { allumer: false, comparer: false, isolant: false },
    fichesVues: new Set(),
    quiz: { fait: 0, bon: 0 },
    vuSerie: false, vuParallele: false,
  };

  /* ---------- calculs ---------- */
  function circuit() {
    const V = etat.tension;
    const nb = etat.topologie === 'serie' ? 2 : 1;
    if (!etat.interrupteur) return { ferme: false, motif: 'L\u2019interrupteur est ouvert : le circuit n\u2019est pas une boucle fermée, aucun courant ne circule.' };
    if (!MATERIAUX[etat.materiau].conduit) return { ferme: false, motif: `Le ${MATERIAUX[etat.materiau].nom.toLowerCase()} est un isolant : le courant ne peut pas traverser.` };
    if (etat.courtCircuit) return { ferme: true, I: V / 0.05, P: null, alerte: 'Court-circuit ! Le courant ne rencontre presque aucune résistance : la pile chauffe, le fil peut fondre. À ne jamais faire.' };
    if (etat.topologie === 'parallele') {
      const n = 2, R = R_LAMPE / n;
      const I = V / R;
      return { ferme: true, I, P: V * V / R_LAMPE, R };
    }
    const R = R_LAMPE * nb;
    const I = V / R;
    return { ferme: true, I, P: I * I * R_LAMPE, R };
  }

  /* ---------- rendu du banc ---------- */
  const banc = document.getElementById('banc');
  const FIL = '#94A3B8', FIL_ON = '#F59E0B';

  function dessiner() {
    const serie = etat.topologie === 'serie';
    const par = etat.topologie === 'parallele';
    const c = circuit();
    const allume = c.ferme && !c.alerte;
    const lum = allume ? Math.min(1, (c.P || 0) / 2.2) : 0;

    const lampe = (x, y) => `
      <g transform="translate(${x} ${y})">
        <circle r="${40 + 22 * lum}" fill="url(#haloLampe)" opacity="${lum * .9}"/>
        <circle r="24" fill="${lum > 0 ? '#FFF3C4' : '#FFFFFF'}" stroke="${lum > 0 ? '#B45309' : '#6E6E73'}" stroke-width="3"/>
        <path d="M-17 -17 L17 17 M17 -17 L-17 17" stroke="${lum > 0 ? '#B45309' : '#6E6E73'}" stroke-width="3" stroke-linecap="round"/>
        <rect x="-6" y="-33" width="12" height="9" rx="2" fill="#94A3B8"/>
        <rect x="-6" y="24" width="12" height="9" rx="2" fill="#94A3B8"/>
      </g>`;

    const trait = (d, actif) => `<path d="${d}" fill="none" stroke="${actif ? FIL_ON : FIL}" stroke-width="7" stroke-linecap="round"/>
      ${actif ? `<path d="${d}" class="flux" fill="none" stroke="#FFF7CC" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 18"/>` : ''}`;

    let chemins = '', lampes = '', etiquette = '';
    if (serie) {
      chemins += trait('M110 210 V90 H250', allume);
      chemins += trait('M250 90 H340', allume);
      lampes += lampe(370, 90);
      chemins += trait('M400 90 H560', allume);
      lampes += lampe(590, 90);
      chemins += trait('M620 90 H790 V330 H110 V210', allume);
      etiquette = '<text x="450" y="52" text-anchor="middle" class="lab">montage en SÉRIE — un seul chemin</text>';
    } else if (par) {
      chemins += trait('M110 210 V90 H790 V330 H110 V210', allume);
      chemins += trait('M470 90 V150', allume);
      lampes += lampe(470, 180);
      chemins += trait('M470 210 V330', allume);
      chemins += trait('M680 90 V150', allume);
      lampes += lampe(680, 180);
      chemins += trait('M680 210 V330', allume);
      etiquette = '<text x="450" y="52" text-anchor="middle" class="lab">montage en DÉRIVATION (parallèle) — deux chemins</text>';
    } else {
      chemins += trait('M110 210 V90 H380', allume);
      lampes += lampe(410, 90);
      chemins += trait('M440 90 H790 V330 H110 V210', allume);
      etiquette = '<text x="450" y="52" text-anchor="middle" class="lab">une seule lampe — la boucle doit être fermée</text>';
    }

    // interrupteur (sur le fil du bas, x=300)
    const ferme = etat.interrupteur;
    const inter = `
      <g transform="translate(300 330)">
        <circle r="6" fill="${FIL}"/><circle cx="70" r="6" fill="${FIL}"/>
        <path d="M0 0 ${ferme ? 'H70' : 'L58 -22'}" stroke="${ferme ? FIL_ON : FIL}" stroke-width="7" stroke-linecap="round" fill="none"/>
        <text x="35" y="40" text-anchor="middle" class="lab">interrupteur ${ferme ? 'fermé' : 'ouvert'}</text>
      </g>`;

    // pile
    const pile = `
      <g transform="translate(110 210)">
        <path d="M-2 -30 V30" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
        <path d="M12 -16 V16" stroke="#334155" stroke-width="9" stroke-linecap="round"/>
        <text x="-14" y="-38" text-anchor="middle" class="lab">+</text>
        <text x="22" y="-38" text-anchor="middle" class="lab">−</text>
        <text x="0" y="62" text-anchor="middle" class="lab">${etat.tension} V</text>
        ${etat.courtCircuit ? '<text x="0" y="-58" text-anchor="middle" class="lab" fill="#DC2626">chauffe !</text>' : ''}
      </g>`;

    // matériau testé (sur le fil du bas, x=560)
    const mat = MATERIAUX[etat.materiau];
    const blocMat = `
      <g transform="translate(560 330)">
        <rect x="-34" y="-12" width="68" height="24" rx="8" fill="${mat.conduit ? '#DCFCE7' : '#FEE2E2'}" stroke="${mat.conduit ? '#16A34A' : '#DC2626'}" stroke-width="2"/>
        <text x="0" y="42" text-anchor="middle" class="lab">${mat.nom}</text>
      </g>`;

    banc.innerHTML = `
    <svg viewBox="0 0 900 400" role="img" aria-label="Circuit électrique interactif">
      <defs>
        <radialGradient id="haloLampe"><stop offset="0" stop-color="#FFE066" stop-opacity=".95"/><stop offset="1" stop-color="#FFE066" stop-opacity="0"/></radialGradient>
      </defs>
      ${etiquette}
      ${chemins}
      ${lampes}
      ${pile}
      ${inter}
      ${blocMat}
      ${etat.courtCircuit ? `<text x="450" y="382" text-anchor="middle" class="lab" fill="#DC2626">COURT-CIRCUIT — la pile chauffe</text>` : ''}
    </svg>`;

    // mesures
    const mes = document.getElementById('mesures');
    const P = c.P;
    mes.innerHTML = c.alerte
      ? `<div class="mes alerte"><b>${Math.round(c.I)} A</b><span>court-circuit</span></div>`
      : !c.ferme
        ? `<div class="mes"><b>0 A</b><span>aucun courant</span></div><div class="mes"><b>0 W</b><span>chaque lampe éteinte</span></div>`
        : `<div class="mes"><b>${c.I.toFixed(2)} A</b><span>intensité totale</span></div>
           <div class="mes"><b>${P.toFixed(2)} W</b><span>par lampe</span></div>
           <div class="mes"><b>${etat.tension} V</b><span>tension de la pile</span></div>`;

    const com = document.getElementById('commentaire');
    if (c.alerte) com.className = 'commentaire faux', com.innerHTML = `<b>Attention.</b> ${c.alerte}`;
    else if (!c.ferme) com.className = 'commentaire', com.innerHTML = `<b>Rien ne s'allume.</b> ${c.motif}`;
    else {
      const lumTexte = etat.topologie === 'serie'
        ? 'En série, les deux lampes se partagent la tension : chacune éclaire <b>faiblement</b>.'
        : etat.topologie === 'parallele'
          ? 'En dérivation, chaque lampe reçoit toute la tension : elles éclairent <b>normalement</b>, mais la pile se vide deux fois plus vite.'
          : 'La boucle est fermée : le courant circule, la lampe éclaire.';
      com.className = 'commentaire bon';
      com.innerHTML = `<b>Ça marche.</b> ${lumTexte} <span class="muted">Intensité : ${c.I.toFixed(2)} A · puissance par lampe : ${P.toFixed(2)} W.</span>`;
    }
    verifierDefis(c, lum);
  }

  /* ---------- défis ---------- */
  function verifierDefis(c, lum) {
    const d = etat.defis;
    if (!d.allumer && c.ferme && !c.alerte && etat.topologie === 'simple') {
      d.allumer = true; A.gagner(20, 'electricite:defi:allumer'); direDefi('Défi 1 réussi : tu as fermé la boucle.', 1);
    }
    if (etat.topologie === 'serie' && c.ferme && !c.alerte) etat.vuSerie = true;
    if (etat.topologie === 'parallele' && c.ferme && !c.alerte) etat.vuParallele = true;
    if (!d.comparer && etat.vuSerie && etat.vuParallele) {
      d.comparer = true; A.gagner(25, 'electricite:defi:comparer'); direDefi('Défi 2 réussi : tu as comparé série et dérivation.', 2);
    }
    if (!d.isolant && !MATERIAUX[etat.materiau].conduit && etat.interrupteur) {
      d.isolant = true; A.gagner(20, 'electricite:defi:isolant'); direDefi('Défi 3 réussi : tu as prouvé qu\u2019un isolant coupe le courant.', 3);
    }
    if (d.allumer && d.comparer && d.isolant) terminerEtape(1);
  }
  function direDefi(texte, n) {
    const el = document.getElementById('defi' + n);
    if (el) { el.classList.add('fait'); el.querySelector('.st').textContent = '✓ réussi'; }
    const b = document.getElementById('bravo');
    b.textContent = texte; b.classList.add('vu');
    setTimeout(() => b.classList.remove('vu'), 4000);
    majXP();
  }

  /* ---------- contrôles ---------- */
  document.getElementById('commandes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act, val = b.dataset.val;
    if (act === 'inter') etat.interrupteur = !etat.interrupteur;
    if (act === 'topo') { etat.topologie = val; etat.courtCircuit = false; }
    if (act === 'mat') etat.materiau = val;
    if (act === 'tension') etat.tension = parseFloat(val);
    if (act === 'cc') etat.courtCircuit = !etat.courtCircuit;
    document.querySelectorAll('[data-act="inter"]').forEach((x) => { x.classList.toggle('on', etat.interrupteur); x.textContent = etat.interrupteur ? 'Interrupteur fermé' : 'Interrupteur ouvert'; });
    document.querySelectorAll('[data-act="topo"]').forEach((x) => x.classList.toggle('on', x.dataset.val === etat.topologie));
    document.querySelectorAll('[data-act="mat"]').forEach((x) => x.classList.toggle('on', x.dataset.val === etat.materiau));
    document.querySelectorAll('[data-act="tension"]').forEach((x) => x.classList.toggle('on', parseFloat(x.dataset.val) === etat.tension));
    document.querySelectorAll('[data-act="cc"]').forEach((x) => x.classList.toggle('on', etat.courtCircuit));
    dessiner();
  });

  /* ---------- fiches ---------- */
  const FICHES = [
    { id: 'circuit', court: 'Boucle', nom: 'Un circuit, une boucle fermée', c: ['#FFD60A', '#FF9F0A'],
      texte: "Le courant ne circule que si le chemin forme une <b>boucle fermée</b> entre les deux bornes de la pile. Ouvrir l\u2019interrupteur coupe la boucle : tout s\u2019éteint instantanément.",
      plus: "Les électrons se déplacent très lentement (quelques millimètres par seconde dans un fil), mais l\u2019information électrique va presque à la vitesse de la lumière : c\u2019est pour cela que la lampe s\u2019allume sans attendre. Le sens conventionnel du courant va du + vers le −, alors que les électrons vont dans l\u2019autre sens." },
    { id: 'serie', court: 'Série', nom: 'Montage en série', c: ['#FFB340', '#FF7A3D'],
      texte: "Les composants sont <b>les uns à la suite des autres</b> : un seul chemin. Si une lampe grille, le circuit est coupé et tout s\u2019éteint. Les lampes se partagent la tension, donc elles éclairent moins fort.",
      plus: "C\u2019est ainsi que sont câblées les guirlandes de Noël bon marché : une ampoule morte et toute la guirlande s\u2019éteint. Deux lampes identiques en série sous 4,5 V reçoivent 2,25 V chacune." },
    { id: 'parallele', court: 'Dérivation', nom: 'Montage en dérivation (parallèle)', c: ['#2EE6C8', '#0EA47A'],
      texte: "Chaque composant a <b>son propre chemin</b> entre les deux bornes. Retirer une lampe ne coupe pas l\u2019autre, et chaque lampe reçoit toute la tension : elle éclaire normalement.",
      plus: "C\u2019est le montage de la maison : chaque pièce est en dérivation, sinon éteindre la cuisine éteindrait le salon. L\u2019intensité totale est la somme des intensités de chaque branche, donc la pile se vide plus vite." },
    { id: 'materiaux', court: 'Matériaux', nom: 'Conducteurs et isolants', c: ['#B57BFF', '#6A5BFF'],
      texte: "Un <b>conducteur</b> laisse passer le courant (métaux, eau salée, graphite). Un <b>isolant</b> le bloque (bois sec, verre, plastique, air). Les fils sont en cuivre et gainés de plastique pour cette raison.",
      plus: "Le corps humain est conducteur (il contient de l\u2019eau salée) : c\u2019est pourquoi on ne touche jamais un fil dénudé. L\u2019eau pure conduit très mal ; c\u2019est le sel dissous qui la rend conductrice." },
    { id: 'securite', court: 'Sécurité', nom: 'Court-circuit et sécurité', c: ['#FF7EB3', '#F0417E'],
      texte: "Un <b>court-circuit</b>, c\u2019est un chemin direct entre les deux bornes, sans lampe : le courant devient énorme. La pile chauffe, le fil peut fondre ou prendre feu. On protège les circuits avec un fusible ou un disjoncteur.",
      plus: "À la maison, le disjoncteur coupe le courant en quelques millisecondes. Sur une pile, un court-circuit peut brûler les doigts. Ne jamais relier les deux bornes d\u2019une pile avec un fil : c\u2019est l\u2019expérience à ne pas faire, même « pour voir »." },
  ];
  const fiches = document.getElementById('fiches');
  fiches.innerHTML = FICHES.map((f) => `
    <article class="fiche" style="--c1:${f.c[0]};--c2:${f.c[1]}">
      <div class="role">${f.court}</div>
      <h3>${f.nom}</h3>
      <p>${f.texte}</p>
      <details data-fiche="${f.id}"><summary>En savoir plus</summary><div>${f.plus}</div></details>
      <button class="dire" data-lire="${f.id}">${SVG_PLAY}Écouter</button>
    </article>`).join('');
  fiches.addEventListener('toggle', (e) => {
    const d = e.target.closest('details[data-fiche]');
    if (d && d.open) { etat.fichesVues.add(d.dataset.fiche); if (etat.fichesVues.size >= 4) terminerEtape(2); }
  }, true);
  fiches.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lire]'); if (!b) return;
    const f = FICHES.find((x) => x.id === b.dataset.lire);
    A.voix(`${f.nom}. ` + f.texte.replace(/<[^>]+>/g, '') + ' ' + f.plus.replace(/<[^>]+>/g, ''), b);
  });

  /* ---------- quiz ---------- */
  const QUIZ = [
    { q: "Que faut-il pour qu\u2019une lampe s\u2019allume&nbsp;?", r: ['Une boucle fermée entre les deux bornes de la pile', 'Une pile puissante, même avec un fil coupé', 'Un interrupteur ouvert', 'Deux lampes au minimum'], b: 0,
      e: "Le courant ne peut circuler que dans un chemin continu. Un fil coupé ou un interrupteur ouvert interrompt la boucle." },
    { q: "Dans un montage en série, une lampe grille. Que se passe-t-il&nbsp;?", r: ['Les autres continuent d\u2019éclairer', 'Tout s\u2019éteint, le circuit est coupé', 'Les autres éclairent plus fort', 'La pile se recharge'], b: 1,
      e: "En série, il n\u2019y a qu\u2019un seul chemin : l\u2019ampoule grillée ouvre le circuit, donc plus rien ne brille." },
    { q: "Deux lampes identiques en dérivation sous 4,5 V : quelle tension reçoit chacune&nbsp;?", r: ['2,25 V', '4,5 V', '9 V', '0 V'], b: 1,
      e: "En dérivation, chaque branche est reliée directement aux deux bornes : chaque lampe reçoit toute la tension de la pile." },
    { q: "Pourquoi les fils électriques sont-ils gainés de plastique&nbsp;?", r: ['Pour les rendre plus solides', 'Parce que le plastique est un isolant qui protège du courant', 'Pour mieux conduire l\u2019électricité', 'Pour les rendre plus légers'], b: 1,
      e: "Le plastique est un isolant : il empêche le courant de passer vers l\u2019extérieur, donc vers la main qui touche le fil." },
    { q: "Qu\u2019est-ce qu\u2019un court-circuit&nbsp;?", r: ['Un circuit très long', 'Un chemin direct entre les deux bornes, sans résistance', 'Une lampe grillée', 'Un interrupteur fermé'], b: 1,
      e: "Le courant ne rencontre presque aucune résistance : il devient très intense, la pile chauffe et le fil peut fondre." },
    { q: "Quelle intensité traverse une lampe de 10 Ω branchée seule sous 4,5 V&nbsp;?", r: ['0,45 A', '4,5 A', '45 A', '0,045 A'], b: 0,
      e: "I = U ÷ R = 4,5 ÷ 10 = 0,45 A. C\u2019est la loi d\u2019Ohm, au programme de 3e." },
  ];
  const quiz = document.getElementById('quiz');
  quiz.innerHTML = QUIZ.map((item, i) => `
    <article class="q" data-q="${i}">
      <h3>${i + 1}. ${item.q}</h3>
      <div class="rep">${item.r.map((r, k) => `<button data-k="${k}" data-i="${i}">${r}</button>`).join('')}</div>
      <div class="expl"><b>Explication.</b> ${item.e}</div>
    </article>`).join('');

  quiz.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-k]'); if (!b) return;
    const art = b.closest('.q'); if (art.classList.contains('repondu')) return;
    const i = +b.dataset.i, k = +b.dataset.k, item = QUIZ[i];
    art.classList.add('repondu');
    art.querySelectorAll('button').forEach((x, idx) => { x.disabled = true; if (idx === item.b) x.classList.add('bon'); else if (idx === k) x.classList.add('faux'); });
    etat.quiz.fait++;
    if (k === item.b) { etat.quiz.bon++; A.gagner(10, `electricite:quiz:${i}`); }
    majXP();
    if (etat.quiz.fait === QUIZ.length) bilan();
  });

  /* ---------- bilan ---------- */
  function bilan() {
    const bon = etat.quiz.bon, n = QUIZ.length, el = document.getElementById('bilan');
    const badge = bon >= 5 ? 'Badge « électricien »' : bon >= 3 ? 'Badge « apprenti »' : null;
    if (badge) A.badge(bon >= 5 ? 'electricite' : 'electricite-apprenti');   // badge du module = maîtrise seulement
    terminerEtape(3);
    el.innerHTML = `
      <div class="kicker">Bilan du module</div>
      <div class="note">${bon} / ${n} — ${Math.round((bon / n) * 20)}/20</div>
      <p style="margin-top:8px;color:var(--ink2);font-size:15px;line-height:1.5">
        ${bon >= 5 ? 'Tu sais expliquer un circuit, la différence entre série et dérivation, et repérer un danger.'
          : bon >= 3 ? 'Les bases sont là. Rejoue l\u2019atelier en dérivation, puis relis la fiche sur les matériaux.'
          : 'Reprends l\u2019atelier : ferme la boucle, ajoute une deuxième lampe en série, puis passe en dérivation. Reviens ensuite au quiz.'}
      </p>
      ${badge ? `<span class="tagb">${badge} obtenu</span>` : ''}
      <div class="cta"><a class="btn p" href="index.html">Retour à l'accueil</a>
        <button class="btn s" id="refaire">Refaire le quiz</button></div>`;
    el.classList.add('vu');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('refaire').onclick = () => {
      etat.quiz = { fait: 0, bon: 0 };
      quiz.querySelectorAll('.q').forEach((q) => { q.classList.remove('repondu'); q.querySelectorAll('button').forEach((b) => { b.disabled = false; b.classList.remove('bon', 'faux'); }); });
      el.classList.remove('vu'); window.scrollTo({ top: quiz.offsetTop - 80, behavior: 'smooth' });
    };
  }

  function terminerEtape(n) { if ((A.etape('electricite') || 0) < n) { A.terminer('electricite', n); majXP(); } }
  function majXP() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    const el = document.getElementById('xp'); if (!el) return;
    el.innerHTML = `<span class="lvl">⭐ Niveau ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div>
      <small>${p.xp} XP · ${A.esc(p.nom)} · ${A.esc(p.classe)}</small>`;
  }

  dessiner(); majXP();
})();
