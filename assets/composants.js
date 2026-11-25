/* Module « Les composants d'un ordinateur » — atelier d'assemblage, fiches, quiz.
   Direction retenue : carnet d'ingénieur + mécaniques de jeu (XP, badge, progression). */
(function () {
  const A = window.Atelier;
  const SVG_PLAY = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:6px"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>';
  const SVG_STOP = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:6px"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
  const etat = { selection: null, pose: {}, fichesVues: new Set(), quiz: { fait: 0, bon: 0, total: 0 } };

  /* ---------- données ---------- */
  const COUL = {
    cpu: ['#6AA6FF', '#2F5BFF'], ram: ['#B57BFF', '#6A5BFF'],
    ssd: ['#2EE6C8', '#0EA47A'], psu: ['#FFB340', '#FF7A3D'],
  };
  const ICONE = { cpu: '▣', ram: '▥', ssd: '▬', psu: '⬛' };
  const PIECES = {
    cpu: { nom: 'Processeur', courte: 'CPU', role: 'exécuter les instructions',
      texte: "Le processeur exécute les instructions des programmes : il calcule, compare, décide. Il chauffe, c'est pourquoi on pose un ventilateur dessus. Il se clipse dans le <b>socket</b> de la carte mère, dans un seul sens possible.",
      plus: "Un processeur récent a plusieurs <b>cœurs</b> : chacun traite une tâche à la fois, ce qui permet de faire plusieurs choses en parallèle. Sa vitesse se mesure en gigahertz (GHz), mais comparer deux processeurs au seul GHz ne veut rien dire : l'architecture compte autant.",
      slot: 'cpu' },
    ram: { nom: 'Mémoire vive', courte: 'RAM', role: 'garder le travail en cours',
      texte: "La mémoire vive garde les données des programmes <b>en cours d'utilisation</b>. Elle est très rapide, mais <b>volatile</b> : elle se vide dès qu'on coupe le courant. Plus il y en a, plus on peut ouvrir de choses à la fois.",
      plus: "DDR4 et DDR5 ne sont <b>pas compatibles</b> : l'encoche n'est pas au même endroit et la tension diffère. Deux barrettes identiques fonctionnent mieux ensemble (canaux jumelés). Une barrette mal clipsée est l'une des causes les plus fréquentes d'un écran noir au démarrage.",
      slot: 'ram' },
    ssd: { nom: 'Disque SSD', courte: 'SSD', role: 'conserver les fichiers',
      texte: "Le disque stocke les fichiers, le système et les logiciels. Lui <b>ne s'efface pas</b> quand on éteint : c'est une mémoire de masse. Un SSD n'a aucune pièce qui tourne, donc il est silencieux et rapide ; il se branche en M.2 sur la carte mère.",
      plus: "Un disque dur classique (HDD) utilise des plateaux magnétiques qui tournent : plus lent, plus fragile, mais moins cher au téraoctet. On compare souvent les deux : le SSD démarre le système en quelques secondes, le HDD en dizaines de secondes.",
      slot: 'ssd' },
    psu: { nom: 'Alimentation', courte: 'PSU', role: 'fournir l\u2019énergie',
      texte: "L'alimentation transforme le 230 V du secteur en tensions continues utilisables par les composants (12 V, 5 V, 3,3 V). Sa puissance s'exprime en <b>watts</b>. Trop faible, l'ordinateur s'éteint en pleine charge.",
      plus: "On parle de rendement « 80 PLUS » (Bronze, Gold…). Un meilleur rendement gaspille moins d'énergie en chaleur. La puissance nécessaire dépend surtout de la carte graphique, pas du processeur.",
      slot: 'psu' },
  };
  const SLOTS = { cpu: 'Processeur', ram: 'Mémoire vive', ssd: 'Disque SSD', psu: 'Alimentation' };

  /* ---------- rendu de l'établi ---------- */
  const stage = document.getElementById('etabli');
  stage.innerHTML = `
  <svg viewBox="0 0 620 400" role="group" aria-label="Établi : glisser les composants dans le boîtier">
    <g stroke="var(--line)" stroke-width="2" fill="none">
      <rect x="22" y="22" width="576" height="352" rx="20"/>
      <path d="M22 306 h576" stroke-dasharray="4 6"/>
    </g>
    <text x="34" y="346" class="pname">BOÎTIER</text>
    <g>
      <rect x="66" y="76" width="306" height="212" rx="16" fill="#E7F0FF" stroke="#1D1D1F10"/>
      <text x="219" y="64" text-anchor="middle" class="pname">CARTE MÈRE</text>
      <g fill="#B4C8EA">
        <rect x="288" y="96" width="9" height="46" rx="1"/><rect x="304" y="96" width="9" height="46" rx="1"/>
        <rect x="320" y="96" width="9" height="46" rx="1"/>
        <rect x="212" y="240" width="130" height="8" rx="2"/>
      </g>
      
    </g>
    <rect class="slot" data-slot="cpu" x="98" y="104" width="70" height="70" rx="12" stroke="#6AA6FF"/>
    <text x="133" y="194" text-anchor="middle" class="pname">SOCKET</text>
    <rect class="slot" data-slot="ram" x="196" y="100" width="22" height="104" rx="8" stroke="#B57BFF"/>
    <text x="207" y="222" text-anchor="middle" class="pname">RAM</text>
    <rect class="slot" data-slot="ssd" x="96" y="234" width="96" height="18" rx="7" stroke="#2EE6C8"/>
    <text x="144" y="268" text-anchor="middle" class="pname">M.2</text>
    <rect class="slot" data-slot="psu" x="410" y="104" width="150" height="104" rx="14" stroke="#FFB340"/>
    <text x="485" y="228" text-anchor="middle" class="pname">ALIMENTATION</text>
    <g id="poses"></g>
  </svg>`;

  const tray = document.getElementById('tray');
  tray.innerHTML = Object.entries(PIECES).map(([id, p]) =>
    `<button class="piece-btn" data-piece="${id}" aria-pressed="false" style="--c1:${COUL[id][0]};--c2:${COUL[id][1]}">
       <span class="chip" aria-hidden="true">${ICONE[id]}</span>
       <span>${p.nom}<small>${p.role}</small></span>
     </button>`).join('');

  const comm = document.getElementById('commentaire');
  const jauge = document.getElementById('jauge');
  const dire = (texte, type) => {
    comm.className = 'commentaire' + (type ? ' ' + type : '');
    comm.innerHTML = texte;
  };
  const majJauge = () => {
    const n = Object.keys(etat.pose).length;
    jauge.innerHTML = `<span>${n} / 4 pièces posées</span><span>+25 XP par pose juste</span>`;
    if (n === 4) terminerEtape(1);
  };

  function dessinerPose(id) {
    const g = document.getElementById('poses');
    const formes = {
      cpu: `<rect x="98" y="104" width="70" height="70" rx="12" fill="#2F5BFF" class="piece pose"/>
            <rect x="116" y="122" width="34" height="34" rx="7" fill="#fff" opacity=".92"/>`,
      ram: `<rect x="196" y="100" width="22" height="104" rx="8" fill="#6A5BFF" class="piece pose"/>
            <g fill="#fff" opacity=".9"><rect x="200" y="112" width="14" height="10" rx="2"/><rect x="200" y="130" width="14" height="10" rx="2"/><rect x="200" y="148" width="14" height="10" rx="2"/><rect x="200" y="166" width="14" height="10" rx="2"/></g>`,
      ssd: `<rect x="96" y="234" width="96" height="18" rx="7" fill="#0EA47A" class="piece pose"/>
            <rect x="112" y="238" width="22" height="10" rx="2" fill="#fff" opacity=".92"/>
            <rect x="142" y="238" width="22" height="10" rx="2" fill="#fff" opacity=".7"/>`,
      psu: `<rect x="410" y="104" width="150" height="104" rx="14" fill="#FF9F0A" class="piece pose"/>
            <circle cx="452" cy="156" r="20" fill="#fff" opacity=".92"/>
            <path d="M452 136 a20 20 0 0 1 0 40" fill="none" stroke="#FF7A3D" stroke-width="3"/>
            <rect x="492" y="140" width="46" height="8" rx="4" fill="#fff" opacity=".8"/>
            <rect x="492" y="158" width="30" height="8" rx="4" fill="#fff" opacity=".6"/>`,
    };
    g.insertAdjacentHTML('beforeend', formes[id]);
    const slot = stage.querySelector(`[data-slot="${id}"]`);
    if (slot) slot.classList.add('rempli');
  }

  function poser(id, slotCible) {
    if (etat.pose[id]) return;
    if (PIECES[id].slot !== slotCible) {
      const attendu = { cpu: 'processeur', ram: 'barrette de mémoire', ssd: 'SSD', psu: 'alimentation' }[id];
      dire(`<b>Non.</b> Le ${attendu} ne va pas ici. Regarde la forme du logement : ${PIECES[id].slot === 'ram' ? 'une barrette se dresse dans un long rail étroit' : PIECES[id].slot === 'psu' ? 'une alimentation occupe un gros bloc carré' : PIECES[id].slot === 'ssd' ? 'un SSD M.2 se couche dans une fente plate' : 'un processeur se pose à plat dans un carré à broches'}.`, 'faux');
      return;
    }
    etat.pose[id] = true;
    dessinerPose(id);
    A.gagner(25);
    majXP();
    tray.querySelector(`[data-piece="${id}"]`).classList.add('fait');
    tray.querySelector(`[data-piece="${id}"]`).setAttribute('aria-pressed', 'false');
    etat.selection = null;
    const p = PIECES[id];
    dire(`<b>Bien joué.</b> ${p.nom} : ${p.role}. ${p.texte.replace(/<[^>]+>/g, '')}`, 'bon');
    majJauge();
  }

  /* sélection + pose (clic, tactile, clavier) */
  tray.addEventListener('click', (e) => {
    const b = e.target.closest('[data-piece]');
    if (!b || b.classList.contains('fait')) return;
    const id = b.dataset.piece;
    etat.selection = etat.selection === id ? null : id;
    tray.querySelectorAll('[data-piece]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.piece === etat.selection)));
    if (etat.selection) dire(`Pièce choisie : <b>${PIECES[id].nom}</b>. Clique maintenant sur son logement dans le boîtier.`);
  });
  stage.addEventListener('click', (e) => {
    const s = e.target.closest('[data-slot]');
    if (!s) return;
    if (etat.selection) { poser(etat.selection, s.dataset.slot); return; }
    const dejaPose = Object.keys(etat.pose).find((k) => PIECES[k].slot === s.dataset.slot);
    dire(dejaPose ? `<b>${PIECES[dejaPose].nom}</b> est déjà en place. Il reste ${4 - Object.keys(etat.pose).length} pièce(s) à poser : choisis-en une à droite.`
                   : `Ce logement attend ${SLOTS[s.dataset.slot] ? SLOTS[s.dataset.slot].toLowerCase() : 'une pièce'}. Choisis d'abord une pièce à droite, puis clique ici.`);
  });

  /* glisser-déposer (souris, stylet, doigt) : même règle que le clic, via poser() */
  let glisse = null, ignorerClic = false;
  tray.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-piece]');
    if (!b || b.classList.contains('fait') || e.button > 0) return;
    glisse = { id: b.dataset.piece, b, x0: e.clientX, y0: e.clientY, fant: null, cible: null };
    b.setPointerCapture(e.pointerId);
  });
  tray.addEventListener('pointermove', (e) => {
    if (!glisse) return;
    if (!glisse.fant) {
      if (Math.hypot(e.clientX - glisse.x0, e.clientY - glisse.y0) < 8) return;
      glisse.fant = glisse.b.cloneNode(true);
      glisse.fant.className = 'fantome'; glisse.fant.removeAttribute('data-piece'); glisse.fant.setAttribute('aria-hidden', 'true');
      document.body.appendChild(glisse.fant);
      dire(`Dépose <b>${PIECES[glisse.id].nom}</b> sur son logement dans le boîtier.`);
    }
    glisse.fant.style.transform = `translate(${e.clientX - 40}px, ${e.clientY - 24}px)`;
    glisse.fant.style.visibility = 'hidden';
    const sous = document.elementFromPoint(e.clientX, e.clientY);
    glisse.fant.style.visibility = '';
    const s = sous && sous.closest && sous.closest('[data-slot]');
    if (glisse.cible && glisse.cible !== s) glisse.cible.classList.remove('cible');
    if (s) s.classList.add('cible');
    glisse.cible = s;
  });
  const finGlisse = (e) => {
    if (!glisse) return;
    const g = glisse; glisse = null;
    if (!g.fant) return;                       // simple clic : géré par l'écouteur « click »
    g.fant.remove(); ignorerClic = true; setTimeout(() => { ignorerClic = false; }, 0);
    if (g.cible) { g.cible.classList.remove('cible'); if (e.type === 'pointerup') poser(g.id, g.cible.dataset.slot); }
  };
  tray.addEventListener('pointerup', finGlisse);
  tray.addEventListener('pointercancel', finGlisse);
  tray.addEventListener('click', (e) => { if (ignorerClic) { e.stopImmediatePropagation(); } }, true);

  /* ---------- fiches ---------- */
  const fiches = document.getElementById('fiches');
  fiches.innerHTML = Object.entries(PIECES).map(([id, p]) => `
    <article class="fiche">
      <div class="role">${p.courte}</div>
      <h3>${p.nom}</h3>
      <p>${p.texte}</p>
      <details data-fiche="${id}"><summary>En savoir plus</summary><div>${p.plus}</div></details>
      <button class="dire" data-lire="${id}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:6px"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>Écouter</button>
    </article>`).join('');
  fiches.addEventListener('toggle', (e) => {
    const d = e.target.closest('details[data-fiche]');
    if (d && d.open) { etat.fichesVues.add(d.dataset.fiche); if (etat.fichesVues.size >= 4) terminerEtape(2); }
  }, true);
  fiches.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lire]');
    if (!b) return;
    const p = PIECES[b.dataset.lire];
    if (A.voix(`${p.nom}. ${p.role}. ` + p.texte.replace(/<[^>]+>/g, ''))) {
      b.innerHTML = SVG_STOP + 'Arrêter';
      setTimeout(() => { b.innerHTML = SVG_PLAY + 'Écouter'; }, 1000 * Math.max(6, p.texte.length / 14));
    }
  });

  /* ---------- quiz ---------- */
  const QUIZ = [
    { q: "Où se place le processeur ?",
      r: ["Dans le socket de la carte mère", "Dans un rail de la mémoire", "Dans la fente M.2", "Dans l'alimentation"],
      b: 0, e: "Le processeur se pose à plat dans le socket, dans un seul sens possible (un triangle repère l'orientation)." },
    { q: "Que devient le contenu de la mémoire vive quand on éteint l'ordinateur ?",
      r: ["Il est conservé sur le disque", "Il disparaît : la mémoire vive est volatile", "Il est transféré dans le processeur", "Il reste en mémoire jusqu'au lendemain"],
      b: 1, e: "La RAM est volatile : elle a besoin du courant pour garder l'information. C'est pour cela qu'on enregistre son travail." },
    { q: "Quel composant conserve les fichiers quand l'ordinateur est éteint ?",
      r: ["Le processeur", "La mémoire vive", "Le disque SSD", "La carte mère"],
      b: 2, e: "Le stockage (SSD ou disque dur) est une mémoire de masse : elle garde les données sans courant." },
    { q: "À quoi sert la carte mère ?",
      r: ["À refroidir le processeur", "À relier les composants et faire circuler énergie et données", "À stocker les fichiers", "À afficher l'image"],
      b: 1, e: "C'est le support de tous les échanges : elle distribue l'énergie et transporte les données entre processeur, mémoire, stockage et périphériques." },
    { q: "Peut-on mélanger une barrette DDR4 et une barrette DDR5 ?",
      r: ["Oui, si elles ont la même capacité", "Oui, la carte mère s'adapte", "Non, l'encoche et la tension diffèrent", "Oui, mais seulement sur un portable"],
      b: 2, e: "L'encoche n'est pas au même endroit : une DDR5 ne rentre pas dans un logement DDR4. Les deux normes ne sont pas compatibles." },
    { q: "Dans quelle unité mesure-t-on la puissance d'une alimentation ?",
      r: ["En gigahertz (GHz)", "En watts (W)", "En gigaoctets (Go)", "En volts (V) seulement"],
      b: 1, e: "La puissance s'exprime en watts. La tension (volts) est ce qu'elle fournit, la puissance est ce qu'elle peut délivrer." },
  ];
  const quiz = document.getElementById('quiz');
  quiz.innerHTML = QUIZ.map((item, i) => `
    <article class="q" data-q="${i}">
      <h3>${i + 1}. ${item.q}</h3>
      <div class="rep">${item.r.map((r, k) => `<button data-k="${k}" data-i="${i}">${r}</button>`).join('')}</div>
      <div class="expl"><b>Explication.</b> ${item.e}</div>
    </article>`).join('');

  quiz.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-k]');
    if (!b) return;
    const art = b.closest('.q'); if (art.classList.contains('repondu')) return;
    const i = +b.dataset.i, k = +b.dataset.k, item = QUIZ[i];
    art.classList.add('repondu');
    art.querySelectorAll('button').forEach((x, idx) => {
      x.disabled = true;
      if (idx === item.b) x.classList.add('bon');
      else if (idx === k) x.classList.add('faux');
    });
    etat.quiz.fait++;
    if (k === item.b) { etat.quiz.bon++; A.gagner(10); }
    etat.quiz.total = QUIZ.length;
    majXP();
    if (etat.quiz.fait === QUIZ.length) bilan();
  });

  /* ---------- bilan et progression ---------- */
  const bilanEl = document.getElementById('bilan');
  function bilan() {
    const bon = etat.quiz.bon, n = QUIZ.length;
    const note = Math.round((bon / n) * 20);
    const badge = bon >= 5 ? 'Badge « dépanneur »' : bon >= 3 ? 'Badge « assembleur »' : null;
    if (badge) A.badge('composants');
    terminerEtape(3);
    bilanEl.innerHTML = `
      <div class="kicker">Bilan du module</div>
      <div class="note">${bon} / ${n} — ${note}/20</div>
      <p style="margin-top:8px;color:var(--ink2);font-size:15px;line-height:1.5">
        ${bon >= 5 ? "Tu sais nommer les composants et expliquer leur rôle. La compétence 1 du programme est acquise." :
          bon >= 3 ? "Les bases sont là. Relis les fiches de la mémoire vive et de la carte mère, puis refais le quiz." :
          "Reprends l'atelier d'assemblage : poser les pièces aide à retenir leur rôle. Puis refais le quiz."}
      </p>
      ${badge ? `<span class="badge">${badge} obtenu</span>` : ''}
      <div class="cta"><a class="btn p" href="index.html">Retour à l'accueil</a>
      <button class="btn s" id="refaire">Refaire le quiz</button></div>`;
    bilanEl.classList.add('vu');
    bilanEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('refaire').onclick = () => {
      etat.quiz = { fait: 0, bon: 0, total: 0 };
      quiz.querySelectorAll('.q').forEach((q) => { q.classList.remove('repondu'); q.querySelectorAll('button').forEach((b) => { b.disabled = false; b.classList.remove('bon', 'faux'); }); });
      bilanEl.classList.remove('vu');
      window.scrollTo({ top: quiz.offsetTop - 80, behavior: 'smooth' });
    };
  }

  function terminerEtape(n) {
    if ((A.etape('composants') || 0) < n) { A.terminer('composants', n); majXP(); }
  }
  function majXP() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    const el = document.getElementById('xp');
    if (!el) return;
    el.innerHTML = `<span class="lvl">Nv. ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div>
      <small>${p.xp} XP · ${A.esc(p.nom)} (${A.esc(p.classe)})</small>`;
  }

  majJauge(); majXP();
})();
