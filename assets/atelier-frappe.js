/* Atelier « Frappe à 10 doigts » — apprendre le clavier AZERTY sans regarder ses mains.
   Tout est local : textes, mesures et statistiques restent sur cet ordinateur (clé atelier.frappe.v1).
   Règle de comparaison : on compare le caractère produit (e.key), jamais la position physique (e.code). */
(function () {
  'use strict';
  const A = window.Atelier;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => A.esc(s);
  const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SEUIL = 90;                                  // % de précision pour réussir une leçon
  const DUREE_TEST = 60000;                          // test de vitesse : 1 minute
  const OBJECTIF = { '5e': 20, '3e': 25, '2de': 30 };// mots/min visés au test (justifiés dans la page)
  const LIGNES = { '5e': 3, '3e': 4, '2de': 5 };     // longueur des leçons selon la classe

  /* ---------- doigts ---------- */
  const DOIGTS = {
    L5: 'auriculaire gauche', L4: 'annulaire gauche', L3: 'majeur gauche', L2: 'index gauche',
    R2: 'index droit', R3: 'majeur droit', R4: 'annulaire droit', R5: 'auriculaire droit', P: 'pouce',
  };
  const main = (f) => (f[0] === 'L' ? 'gauche' : f[0] === 'R' ? 'droite' : '');

  /* ---------- clavier AZERTY français (disposition ISO réelle, 15 unités par rangée = 60 colonnes) ---------- */
  const RANGEES = [
    [['²', '', 'L5'], ['&', '1', 'L5'], ['é', '2', 'L4'], ['"', '3', 'L3'], ["'", '4', 'L2'], ['(', '5', 'L2'], ['-', '6', 'R2'],
     ['è', '7', 'R2'], ['_', '8', 'R3'], ['ç', '9', 'R4'], ['à', '0', 'R5'], [')', '°', 'R5'], ['=', '+', 'R5'],
     { id: 'retour', lab: 'Retour', court: '⌫', w: 8, f: 'R5' }],
    [{ id: 'tab', lab: 'Tab', court: '⇥', w: 6, f: 'L5' }, ['a', 'A', 'L5'], ['z', 'Z', 'L4'], ['e', 'E', 'L3'], ['r', 'R', 'L2'],
     ['t', 'T', 'L2'], ['y', 'Y', 'R2'], ['u', 'U', 'R2'], ['i', 'I', 'R3'], ['o', 'O', 'R4'], ['p', 'P', 'R5'],
     ['^', '¨', 'R5', 'morte'], ['$', '£', 'R5']],
    [{ id: 'verr', lab: 'Verr. Maj', court: '⇪', w: 7, f: 'L5' }, ['q', 'Q', 'L5'], ['s', 'S', 'L4'], ['d', 'D', 'L3'],
     ['f', 'F', 'L2', 'bosse'], ['g', 'G', 'L2'], ['h', 'H', 'R2'], ['j', 'J', 'R2', 'bosse'], ['k', 'K', 'R3'], ['l', 'L', 'R4'],
     ['m', 'M', 'R5'], ['ù', '%', 'R5'], ['*', 'µ', 'R5']],
    [{ id: 'majg', lab: 'Maj', court: '⇧', w: 5, f: 'L5' }, ['<', '>', 'L5'], ['w', 'W', 'L5'], ['x', 'X', 'L4'], ['c', 'C', 'L3'],
     ['v', 'V', 'L2'], ['b', 'B', 'L2'], ['n', 'N', 'R2'], [',', '?', 'R2'], [';', '.', 'R3'], [':', '/', 'R4'], ['!', '§', 'R5'],
     { id: 'majd', lab: 'Maj', court: '⇧', w: 11, f: 'R5' }],
    [{ id: 'ctrlg', lab: 'Ctrl', w: 7 }, { id: 'alt', lab: 'Alt', w: 8 },
     { id: 'espace', lab: 'Espace', w: 25, f: 'P' }, { id: 'altgr', lab: 'Alt Gr', w: 10 }, { id: 'ctrld', lab: 'Ctrl', w: 10 }],
  ];
  const TOUCHES = [];        // toutes les touches dessinées
  const CARTE = new Map();   // caractère → { cle, maj, morte, morteMaj }
  let CIRC = null;
  RANGEES.forEach((rangee, r) => {
    let col = 0;
    rangee.forEach((d) => {
      const k = Array.isArray(d)
        ? { id: 'c' + r + '_' + col, base: d[0], maj: d[1], f: d[2], morte: d[3] === 'morte', bosse: d[3] === 'bosse', w: 4, r, col: col++ }
        : { id: d.id, lab: d.lab, court: d.court || d.lab, f: d.f || '', w: d.w, r, col: -1 };
      TOUCHES.push(k);
      if (k.base !== undefined) {
        if (k.morte) { CIRC = k; return; }
        CARTE.set(k.base, { cle: k, maj: false });
        if (k.maj) CARTE.set(k.maj, { cle: k, maj: true });
      }
    });
  });
  // touche Entrée ISO en L inversé : partie haute (rangée A) + partie basse (rangée Q), dessinées comme une seule touche
  TOUCHES.push({ id: 'entree', lab: 'Entrée', court: '↵', f: 'R5', w: 6, r: 1, col: -1, entree: 'haut' });
  TOUCHES.push({ id: 'entree2', lab: '', f: 'R5', w: 5, r: 2, col: -1, entree: 'bas' });
  const CLE = (id) => TOUCHES.find((k) => k.id === id);
  CARTE.set(' ', { cle: CLE('espace'), maj: false });
  // touche morte ^ : ^ puis voyelle = â ê î ô û ; Maj + ^ (¨) puis voyelle = ä ë ï ö ü
  [['â', 'a'], ['ê', 'e'], ['î', 'i'], ['ô', 'o'], ['û', 'u']].forEach(([c, v]) => CARTE.set(c, { cle: CARTE.get(v).cle, maj: false, morte: CIRC, morteMaj: false }));
  [['ä', 'a'], ['ë', 'e'], ['ï', 'i'], ['ö', 'o'], ['ü', 'u']].forEach(([c, v]) => CARTE.set(c, { cle: CARTE.get(v).cle, maj: false, morte: CIRC, morteMaj: true }));
  const shiftPour = (f) => (f[0] === 'L' ? CLE('majd') : CLE('majg'));   // Maj de la main opposée

  /* ---------- contenus ---------- */
  const LECONS = [
    { n: 1, titre: 'La rangée de repos', court: 'Q S D F · J K L M',
      consigne: "Index gauche sur F, index droit sur J (les bosses). Q S D à gauche, K L M à droite, pouces sur la barre d'espace. À la fin, les index s'étirent vers G et H, puis reviennent.",
      lignes: ['ff jj ff jj fj jf fj jf', 'dd kk dk kd ss ll sl ls', 'qq mm qm mq qsdf jklm', 'gg hh fg hj fgf jhj', 'sdf jkl qsd lkm dfg hjk'] },
    { n: 2, titre: 'La rangée du haut', court: 'A Z E R T Y U I O P',
      consigne: "Chaque doigt monte d'une rangée, puis revient sur sa touche de repos. A avec l'auriculaire gauche, P avec l'auriculaire droit.",
      lignes: ['aa zz ee rr tt yy uu ii oo pp', 'tu as du papier', 'garde tes doigts au repos', 'le loup a peur du feu', 'il pleut sur le toit'] },
    { n: 3, titre: 'La rangée du bas', court: 'W X C V B N , ; :',
      consigne: "Les doigts descendent d'une rangée. En français, on met une espace avant « ; » et « : », pas avant la virgule.",
      lignes: ['cc vv bb nn ww xx cv bn wx', 'liste : six kiwis, deux citrons, un melon', 'le vent souffle ; les nuages avancent', 'un chat noir dort sur le banc', 'le cerveau commande nos mouvements'] },
    { n: 4, titre: 'Majuscules, ponctuation et accents', court: 'Maj · é è à ç ù · . ? !',
      consigne: "Majuscule : Maj de l'autre main. é è ç à sont sur la rangée des chiffres, sans Maj. ù est à droite du M. Le point se fait avec Maj + « ; », le « ? » avec Maj + « , ».",
      lignes: ['Léo a mangé à la cantine.', 'Où est ma règle ? Je la cherche.', 'Il a reçu une lettre de Paris !', "L'eau gèle à zéro degré Celsius.", 'Nina et Hugo vont à Marseille, puis à Lyon.'] },
    { n: 5, titre: 'Test de vitesse · 1 minute', court: 'texte libre chronométré', test: true,
      consigne: "Des phrases de sciences et de la vie de tous les jours. Le chrono d'une minute démarre à ta première touche. Garde au moins 90 % de précision." },
  ];
  const BONUS = { titre: 'Bonus : les accents circonflexes', consigne: "Le ^ est une touche morte : appuie dessus (rien ne s'affiche), puis sur la voyelle. ^ puis e donne ê. Facultatif, 20 XP.",
    texte: "La fête a lieu près du château. Il faut être à l'heure ! Une île est entourée d'eau." };
  // [thème, niveau, phrase] — niveau 1 pour tous, niveau 2 ajouté en 3e et en 2de
  const PHRASES = [
    ['quotidien', 1, 'Ce soir, je range mon sac et je prépare mes affaires pour demain.'],
    ['quotidien', 1, 'Le bus passe à huit heures ; il ne faut pas le rater.'],
    ['quotidien', 1, "Pense à boire de l'eau pendant le match de basket."],
    ['quotidien', 1, 'Mon frère joue de la guitare le mercredi.'],
    ['quotidien', 1, 'Ma grand-mère cultive des tomates dans son jardin.'],
    ['quotidien', 1, 'Range ta chambre avant de jouer aux jeux vidéo.'],
    ['quotidien', 2, 'Avant de partir, vérifie que tu as tes clés, ton téléphone et ton carnet.'],
    ['quotidien', 2, 'Un mot de passe solide est long et difficile à deviner.'],
    ['sciences', 1, 'La Terre fait le tour du Soleil en une année.'],
    ['sciences', 1, "La Lune n'émet pas de lumière : elle renvoie celle du Soleil."],
    ['sciences', 1, "Un aimant attire le fer, mais pas l'aluminium."],
    ['sciences', 1, 'Les volcans rejettent de la lave, des gaz et des cendres.'],
    ['sciences', 1, 'Le son ne se propage pas dans le vide.'],
    ['sciences', 1, 'Les plantes vertes utilisent la lumière du Soleil pour fabriquer leur matière.'],
    ['sciences', 2, "L'eau pure bout à cent degrés Celsius au niveau de la mer."],
    ['sciences', 2, 'Le sang transporte le dioxygène vers tous les organes.'],
    ['sciences', 2, 'La lumière va beaucoup plus vite que le son.'],
    ['sciences', 2, "Un atome contient un noyau entouré d'électrons."],
    ['sciences', 2, 'Le dioxyde de carbone retient une partie de la chaleur de la Terre.'],
    ['sciences', 2, 'Une cellule est la plus petite unité du vivant.'],
    ['sciences', 2, "L'ADN porte l'information génétique de chaque cellule."],
    ['sciences', 2, 'La lumière parcourt environ trois cent mille kilomètres par seconde dans le vide.'],
  ];

  /* ---------- profil et statistiques propres à l'atelier (une entrée par profil) ---------- */
  const CLE_STATS = 'atelier.frappe.v1';
  const classe = () => { const c = A.profil().classe; return Object.prototype.hasOwnProperty.call(OBJECTIF, c) ? c : '3e'; };
  const nombre = (v, min, max) => (Number.isFinite(+v) ? Math.min(max, Math.max(min, +v)) : min);
  function valider(d) {
    const sur = { v: 1, profils: {} };
    if (!d || typeof d !== 'object' || d.v !== 1 || !d.profils || typeof d.profils !== 'object') return sur;
    for (const [id, p] of Object.entries(d.profils)) {
      if (!/^[\w-]{1,20}$/.test(id) || !p || typeof p !== 'object') continue;
      const q = { lecons: {}, touches: {}, tests: [], libre: false };
      if (p.lecons && typeof p.lecons === 'object') {
        for (const n of ['1', '2', '3', '4', '5']) {
          const l = p.lecons[n];
          if (l && typeof l === 'object') q.lecons[n] = { ok: l.ok === true, mpm: nombre(l.mpm, 0, 400), prec: nombre(l.prec, 0, 100) };
        }
      }
      if (p.touches && typeof p.touches === 'object') {
        for (const [c, v] of Object.entries(p.touches)) {
          if ([...c].length !== 1 || !CARTE.has(c) || !Array.isArray(v)) continue;
          const n = Math.floor(nombre(v[0], 0, 1e6)), e = Math.floor(nombre(v[1], 0, 1e6));
          if (n > 0) q.touches[c] = [n, Math.min(e, n)];
        }
      }
      if (Array.isArray(p.tests)) q.tests = p.tests.filter((t) => t && typeof t === 'object').slice(-20).map((t) => ({ mpm: nombre(t.mpm, 0, 400), prec: nombre(t.prec, 0, 100), t: nombre(t.t, 0, 1e13) }));
      q.libre = p.libre === true;
      sur.profils[id] = q;
    }
    return sur;
  }
  let memoireStats = null;
  function lireTout() {
    if (memoireStats) return memoireStats;
    let d = null;
    try { d = JSON.parse(localStorage.getItem(CLE_STATS) || 'null'); } catch (_) { d = null; }
    memoireStats = valider(d);
    return memoireStats;
  }
  function stats() {
    const d = lireTout(), id = A.profilId();
    if (!d.profils[id]) d.profils[id] = { lecons: {}, touches: {}, tests: [], libre: false };
    return d.profils[id];
  }
  function sauver() { try { localStorage.setItem(CLE_STATS, JSON.stringify(lireTout())); } catch (_) { /* stockage bloqué : on garde en mémoire */ } }
  window.addEventListener('storage', (e) => { if (e.key === CLE_STATS) { memoireStats = null; majLecons(); majFaibles(); } });
  window.addEventListener('atelier:maj', () => { majXP(); });

  /* ---------- outils ---------- */
  const melange = (t) => { const a = t.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nomCar = (c) => (c === ' ' ? 'l\u2019espace' : '« ' + esc(c) + ' »');
  const affCar = (c) => (c === ' ' ? 'espace' : esc(c));
  function doigtDe(c) { const i = CARTE.get(c); return i ? i.cle.f : ''; }
  function commentTaper(c) {
    const i = CARTE.get(c);
    if (!i) return '';
    const f = i.cle.f;
    if (c === ' ') return 'pouce sur la barre d\u2019espace';
    if (i.morte) return `d'abord ${i.morteMaj ? 'Maj + ' : ''}^ (auriculaire droit, rien ne s'affiche), puis ${esc(i.cle.base.toUpperCase())} (${DOIGTS[f]})`;
    if (i.maj) { const s = shiftPour(f); return `Maj ${s.id === 'majd' ? 'droite' : 'gauche'} (${DOIGTS[s.f]}) + ${DOIGTS[f]}`; }
    return DOIGTS[f];
  }

  /* ---------- dessin du clavier, des mains, de la légende ---------- */
  const clavier = $('atfClavier');
  clavier.innerHTML = '<div class="atf-grille">' + TOUCHES.map((k) => {
    const pos = k.entree === 'haut' ? 'grid-column:55 / span 6;grid-row:2' : k.entree === 'bas' ? 'grid-column:56 / span 5;grid-row:3'
      : `grid-row:${k.r + 1};grid-column:span ${k.w}`;
    let contenu;
    if (k.base !== undefined) {
      const lettre = /^[a-z]$/.test(k.base);
      contenu = lettre ? `<span class="atf-l">${esc(k.maj)}</span>`
        : `<span class="atf-h">${esc(k.maj)}</span><span class="atf-b">${esc(k.base)}</span>`;
    } else contenu = k.lab ? `<span class="atf-long">${esc(k.lab)}</span><span class="atf-court">${esc(k.court)}</span>` : '';
    return `<div class="atf-k${k.bosse ? ' atf-bosse' : ''}${k.f ? '' : ' atf-neutre'}${k.w > 4 ? ' atf-large' : ''}${k.entree ? ' atf-entree-' + k.entree : ''}" data-id="${k.id}" ${k.f ? `data-f="${k.f}"` : ''} style="${pos}">${contenu}</div>`;
  }).join('') + '</div>';
  const domTouche = new Map();
  clavier.querySelectorAll('.atf-k').forEach((el) => domTouche.set(el.dataset.id, el));

  // mains stylisées : 5 doigts par main, chaque doigt dans sa couleur
  const MAIN_G = [['L5', 22, 50, 50], ['L4', 46, 28, 70], ['L3', 70, 18, 80], ['L2', 94, 28, 70]];
  const doigtSVG = (f, x, y, h) => `<rect class="atf-doigt" data-f="${f}" x="${x}" y="${y}" width="21" height="${h}" rx="10.5"/>`;
  const mainSVG = (mir) => {
    const m = (f) => (mir ? f.replace('L', 'R') : f);
    return `<g${mir ? ' transform="translate(330,0) scale(-1,1)"' : ''}>
      ${MAIN_G.map(([f, x, y, h]) => doigtSVG(m(f), x, y, h)).join('')}
      <rect class="atf-doigt" data-f="P" x="112" y="70" width="22" height="50" rx="11" transform="rotate(42 123 118)"/>
      <path class="atf-paume" d="M20 92 Q20 80 32 80 H106 Q118 80 118 92 V112 Q118 136 94 136 H44 Q20 136 20 112 Z"/>
    </g>`;
  };
  $('atfMains').innerHTML = mainSVG(false) + mainSVG(true) +
    '<text x="70" y="147" text-anchor="middle" class="atf-main-nom">main gauche</text><text x="260" y="147" text-anchor="middle" class="atf-main-nom">main droite</text>';
  $('atfLegende').innerHTML = ['L5', 'R5', 'L4', 'R4', 'L3', 'R3', 'L2', 'R2', 'P'].map((f) => `<li data-f="${f}"><i></i>${f === 'P' ? 'pouces (espace)' : DOIGTS[f]}</li>`).join('');

  function eclairer(c, morteFaite) {
    domTouche.forEach((el) => el.classList.remove('atf-cible', 'atf-cible2'));
    document.querySelectorAll('#atfMains .atf-doigt, #atfLegende li').forEach((el) => el.classList.remove('atf-on'));
    const pro = $('atfProchaine');
    const i = c === undefined ? null : CARTE.get(c);
    if (!i) { pro.textContent = ''; return; }
    const doigts = new Set();
    if (i.morte && !morteFaite) {
      domTouche.get(i.morte.id).classList.add('atf-cible'); doigts.add(i.morte.f);
      if (i.morteMaj) { const s = CLE('majg'); domTouche.get(s.id).classList.add('atf-cible2'); doigts.add(s.f); }
    } else {
      domTouche.get(i.cle.id).classList.add('atf-cible'); doigts.add(i.cle.f);
      if (i.maj) { const s = shiftPour(i.cle.f); domTouche.get(s.id).classList.add('atf-cible2'); doigts.add(s.f); }
    }
    doigts.forEach((f) => document.querySelectorAll(`#atfMains .atf-doigt[data-f="${f}"], #atfLegende li[data-f="${f}"]`).forEach((el) => el.classList.add('atf-on')));
    pro.innerHTML = i.morte && morteFaite
      ? `Touche morte prise : tape maintenant <b>${esc(i.cle.base.toUpperCase())}</b> (${DOIGTS[i.cle.f]}) pour obtenir « ${esc(c)} ».`
      : `Touche suivante : <b>${affCar(c)}</b> · ${commentTaper(c)}`;
  }

  /* ---------- explication de chaque erreur ---------- */
  function expliquer(att, tape, verr) {
    const ia = CARTE.get(att), it = CARTE.get(tape);
    const comment = commentTaper(att);
    if (att === ' ') return `Il fallait une <b>espace</b> (pouce sur la barre). Tu as tapé ${nomCar(tape)}.`;
    if (tape === ' ') return `Espace trop tôt : il manque encore ${nomCar(att)} (${comment}).`;
    if (tape !== att && tape.toLowerCase() === att && tape !== tape.toLowerCase()) {
      return verr ? `Tu as tapé ${nomCar(tape)} en majuscule parce que <b>Verr. Maj est activé</b>. Appuie une fois sur Verr. Maj pour le couper.`
        : `Tu as tapé ${nomCar(tape)} en majuscule : relâche la touche Maj avant de taper ${nomCar(att)}.`;
    }
    if (tape !== att && att.toLowerCase() === tape && att !== tape) {
      return `Il fallait une <b>majuscule</b> : ${comment}. Garde Maj enfoncée pendant que tu tapes la lettre.`;
    }
    if (!ia) return `Tu as tapé ${nomCar(tape)} au lieu de ${nomCar(att)}.`;
    if (it && it.morte && !ia.morte) return `Tu as obtenu ${nomCar(tape)} : une touche morte (^ ou ¨) était encore active et a modifié la lettre. Ici, il faut ${nomCar(att)} tout seul (${comment}).`;
    if (it && ia.cle === it.cle && !ia.morte) {
      if (it.maj && !ia.maj) {
        return /^[éèçà]$/.test(att)
          ? `Tu as obtenu ${nomCar(tape)} : Maj${verr ? ' (ou Verr. Maj)' : ''} était enfoncée. Sur un clavier français, ${nomCar(att)} se tape <b>sans Maj</b>, et le chiffre avec Maj.`
          : `Bonne touche, mais sans Maj : ${nomCar(att)} est en bas de la touche, ${nomCar(tape)} en haut. Relâche Maj.`;
      }
      return `Bonne touche, mais il faut <b>ajouter Maj</b> : ${nomCar(att)} est en haut de la touche ${nomCar(tape)}. ${comment}.`;
    }
    if (ia.morte && it && it.cle === ia.cle) return `Il manquait la touche morte : ${nomCar(att)} se fait en deux temps, ${comment}.`;
    if (!it) return `${nomCar(tape)} n'est pas dans le texte : il fallait ${nomCar(att)} (${comment}).`;
    const ka = ia.morte ? ia.morte : ia.cle, kt = it.cle;
    if (ka.r === kt.r && ka.col >= 0 && kt.col >= 0 && Math.abs(ka.col - kt.col) === 1) {
      return `Tu as tapé ${nomCar(tape)}, juste à ${kt.col < ka.col ? 'gauche' : 'droite'} de ${nomCar(att)} : ton doigt a glissé d'une touche. ${nomCar(att)} se tape avec : ${comment}.`;
    }
    if (ka.f === kt.f) return `${nomCar(tape)} et ${nomCar(att)} se tapent avec le même doigt (${DOIGTS[ka.f]}) : ici, il fallait ${ka.r < kt.r ? 'monter' : ka.r > kt.r ? 'descendre' : 'aller'} sur ${nomCar(att)}.`;
    if (ka.f && kt.f && ka.f.slice(1) === kt.f.slice(1) && ka.f[0] !== kt.f[0]) {
      return `Même doigt, mais pas la bonne main : ${nomCar(att)} se tape avec la main ${main(ka.f)} (${DOIGTS[ka.f]}), ${nomCar(tape)} avec la main ${main(kt.f)}.`;
    }
    return `Tu as tapé ${nomCar(tape)} au lieu de ${nomCar(att)}. ${nomCar(att)} se tape avec : ${comment}.`;
  }

  /* ---------- état de l'exercice ---------- */
  const S = {
    def: null, texte: '', pos: 0, frappes: 0, err: 0, t0: 0, tDer: 0, actif: false, fini: false,
    morte: false, fauteIci: false, touches: {}, timer: 0, lignePos: -1, dernierTraite: { c: '', t: 0 }, majCote: '',
  };
  const texteEl = $('atfTexte'), capteur = $('atfCapteur'), retour = $('atfRetour');
  let spans = [];
  const dire = (html, type) => { retour.className = 'commentaire' + (type ? ' ' + type : ''); retour.innerHTML = html; };

  function rendreTexte(depuis) {
    const frag = document.createDocumentFragment();
    for (let i = depuis; i < S.texte.length; i++) {
      const s = document.createElement('span');
      s.textContent = S.texte[i];
      if (S.texte[i] === ' ') s.className = 'atf-esp';
      frag.appendChild(s);
      spans[i] = s;
    }
    texteEl.appendChild(frag);
  }
  function suivreLigne() {
    const s = spans[S.pos];
    if (!s) return;
    const top = s.offsetTop;
    if (top === S.lignePos) return;
    S.lignePos = top;
    const lh = parseFloat(getComputedStyle(texteEl).lineHeight) || 36;
    texteEl.scrollTop = Math.max(0, top - lh - 6);
  }
  function majCurseur() {
    spans.forEach((s) => s && s.classList.remove('atf-ici'));
    if (spans[S.pos]) spans[S.pos].classList.add('atf-ici');
    suivreLigne();
    eclairer(S.texte[S.pos], S.morte);
  }

  function texteTest() {
    const c = classe();
    const pool = PHRASES.filter((p) => p[1] === 1 || c !== '5e').map((p) => p[2]);
    return melange(pool).join(' ');
  }
  function definition(n) {
    const l = LECONS[n - 1];
    if (l.test) return { id: 'lecon:5', n: 5, titre: l.titre, consigne: l.consigne, texte: texteTest(), test: true };
    return { id: 'lecon:' + n, n, titre: 'Leçon ' + n + ' · ' + l.titre, consigne: l.consigne, texte: l.lignes.slice(0, LIGNES[classe()]).join(' ') };
  }

  /** Prépare un exercice (sans le lancer) : texte, mesures à zéro, clavier éclairé sur la 1re touche. */
  function ouvrir(def) {
    arreterTimer();
    Object.assign(S, { def, texte: def.texte, pos: 0, frappes: 0, err: 0, t0: 0, tDer: 0, actif: false, fini: false, morte: false, fauteIci: false, touches: {}, lignePos: -1 });
    $('atfTitre').textContent = def.titre;
    $('atfConsigne').textContent = def.consigne;
    texteEl.innerHTML = ''; spans = []; texteEl.scrollTop = 0;
    rendreTexte(0);
    $('atfGo').textContent = 'Commencer'; $('atfGo').hidden = false; $('atfStop').hidden = true;
    $('atfZone').classList.remove('atf-actif');
    const bilan = $('atfBilan'); bilan.classList.remove('vu'); bilan.innerHTML = '';
    majCurseur(); majMesures();
    dire(def.test ? "Test d'une minute : le chrono démarre à ta première touche. Si tu te trompes, le texte attend la bonne touche."
      : 'Appuie sur Commencer, puis tape le texte. Si tu te trompes, le texte attend la bonne touche et t\u2019explique l\u2019erreur.');
    majLecons();
  }
  function lancer() {
    if (!S.def) return;
    if (S.fini || S.pos > 0 || S.frappes > 0) ouvrir(S.def.test ? Object.assign({}, S.def, { texte: texteTest() }) : S.def);
    S.actif = true;
    $('atfGo').hidden = true; $('atfStop').hidden = false;
    $('atfZone').classList.add('atf-actif');
    capteur.value = '';
    if (!tactileSansClavier()) capteur.focus({ preventScroll: true });
    $('atfPoste').scrollIntoView({ behavior: reduit() ? 'auto' : 'smooth', block: 'start' });
    dire(tactileSansClavier() && !clavierVu ? 'Appuie sur une touche de ton clavier pour commencer. Sans clavier physique, cet atelier ne fonctionne pas bien.'
      : 'C\u2019est parti : regarde l\u2019écran, pas tes mains. <b>Échap</b> pour arrêter.');
  }
  function arreter(message) {
    if (!S.actif) return;
    S.actif = false; arreterTimer();
    enregistrerTouches();
    $('atfGo').textContent = 'Recommencer'; $('atfGo').hidden = false; $('atfStop').hidden = true;
    $('atfZone').classList.remove('atf-actif');
    dire(message || 'Exercice arrêté. Appuie sur Recommencer quand tu es prêt.');
  }
  function arreterTimer() { if (S.timer) { clearInterval(S.timer); S.timer = 0; } }

  /* ---------- mesures ---------- */
  function calcul(fin) {
    const maintenant = performance.now();
    let ms = S.t0 ? (fin ? (S.def.test ? DUREE_TEST : S.tDer - S.t0) : Math.min(maintenant - S.t0, S.def.test ? DUREE_TEST : Infinity)) : 0;
    const msCalc = Math.max(ms, 1000);                 // évite une vitesse absurde sur 2 frappes
    const mpm = S.t0 ? (S.pos / 5) / (msCalc / 60000) : 0;
    const prec = S.frappes ? (100 * (S.frappes - S.err)) / S.frappes : 100;
    return { ms, msCalc, mpm, prec };
  }
  const precTexte = (p) => Math.floor(p) + '\u00A0%';     // arrondi vers le bas : 89,6 % s'affiche 89 %, comme le seuil le compte
  function majMesures() {
    const m = calcul(false);
    const reste = S.def && S.def.test ? Math.max(0, Math.ceil((DUREE_TEST - (S.t0 ? m.ms : 0)) / 1000)) : null;
    $('atfMesures').innerHTML = `
      <div><b id="atfMpm">${S.t0 && m.ms >= 3000 ? Math.round(m.mpm) : '–'}</b><span>mots/min</span></div>
      <div><b id="atfPrec">${precTexte(m.prec)}</b><span>précision</span></div>
      <div><b id="atfErr">${S.err}</b><span>erreur${S.err > 1 ? 's' : ''}</span></div>
      <div>${reste !== null ? `<b id="atfTemps">${Math.floor(reste / 60)}:${String(reste % 60).padStart(2, '0')}</b><span>temps restant</span>`
        : `<b id="atfAvance">${S.pos}/${S.texte.length}</b><span>caractères</span>`}</div>
      <i class="atf-barre" style="--p:${S.def ? (S.def.test ? (S.t0 ? Math.min(1, m.ms / DUREE_TEST) : 0) : S.pos / Math.max(1, S.texte.length)) : 0}"></i>`;
  }

  /* ---------- frappe ---------- */
  function noter(c, ok) { const t = S.touches[c] || (S.touches[c] = [0, 0]); t[0]++; if (!ok) t[1]++; }
  function traiter(c, verr) {
    if (!S.actif || S.fini) return;
    const att = S.texte[S.pos];
    if (att === undefined) return;
    if (S.def.test && S.t0 && performance.now() - S.t0 >= DUREE_TEST) { finir(); return; }   // la minute est écoulée
    if (!S.t0) {
      S.t0 = performance.now();
      S.timer = setInterval(() => { majMesures(); if (S.def.test && performance.now() - S.t0 >= DUREE_TEST) finir(); }, 200);
    }
    S.tDer = performance.now();
    S.frappes++;
    S.dernierTraite = { c, t: S.tDer };
    const info = CARTE.get(att);
    if (c === att) {
      noter(att, true);
      spans[S.pos].classList.add(S.fauteIci ? 'atf-corrige' : 'atf-ok');
      spans[S.pos].classList.remove('atf-faux');
      S.pos++; S.morte = false; S.fauteIci = false;
      if (info && info.maj && S.majCote && /^[A-Z]$/.test(c)) {
        const bon = info.cle.f[0] === 'L' ? 'd' : 'g';
        if (S.majCote !== bon) dire(`Juste ! Astuce : pour ${nomCar(c)}, prends plutôt la Maj ${bon === 'd' ? 'droite' : 'gauche'} (l'autre main que la lettre).`);
      }
      if (S.def.test && S.texte.length - S.pos < 150) { const avant = S.texte.length; S.texte += ' ' + texteTest(); rendreTexte(avant); }
      if (S.pos >= S.texte.length) { finir(); return; }
      if (retour.classList.contains('faux')) dire('Bien, continue.');
    } else {
      noter(att, false);
      S.err++; S.fauteIci = true; S.morte = false;
      const s = spans[S.pos];
      s.classList.remove('atf-faux'); void s.offsetWidth; s.classList.add('atf-faux');
      dire(expliquer(att, c, verr), 'faux');
    }
    majCurseur(); majMesures();
  }
  function surMorte(e) {
    const att = S.texte[S.pos], info = CARTE.get(att);
    if (info && info.morte) {
      S.morte = true; majCurseur();
      dire(`Touche morte prise (rien ne s'affiche, c'est normal). Tape maintenant ${esc(info.cle.base.toUpperCase())}.`);
    } else {
      dire(`Tu as appuyé sur une touche morte (^ ou ¨) : rien ne s'affiche, mais la prochaine lettre serait modifiée. Ici, il faut ${nomCar(att)} (${commentTaper(att)}).`, 'faux');
    }
  }

  /* ---------- écouteurs clavier ---------- */
  let clavierVu = false;
  const tactileSansClavier = () => window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches;
  const editable = (t) => t && t !== capteur && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  const verrMaj = (e) => !!(e.getModifierState && e.getModifierState('CapsLock'));
  function majVerr(e) { if (e.getModifierState) $('atfVerr').hidden = !verrMaj(e); }

  document.addEventListener('keydown', (e) => {
    if (e.key && e.key !== 'Unidentified' && e.key !== 'Process' && e.keyCode !== 229 && !clavierVu) {
      clavierVu = true; $('atfSansClavier').hidden = true;
    }
    if (!S.actif) return;
    if (editable(e.target)) return;
    majVerr(e);
    if (e.key === 'Shift') { S.majCote = e.location === 2 ? 'd' : 'g'; return; }
    if (e.isComposing || e.keyCode === 229) return;          // composition en cours (touche morte, IME) : on attend le caractère final
    if (e.key === 'Escape') { e.preventDefault(); arreter(); return; }
    if (e.key === 'Dead') { surMorte(e); return; }           // ne pas bloquer : le navigateur compose le caractère suivant
    if ((e.ctrlKey && !e.altKey) || e.metaKey) return;      // raccourcis (Ctrl+C…) ; Alt Gr = Ctrl+Alt passe
    if ([...e.key].length !== 1) { if (e.key === 'Backspace') e.preventDefault(); return; }
    e.preventDefault();                                       // empêche notamment l'espace de faire défiler la page
    if (e.repeat) return;                                     // touche maintenue : on ne compte pas les répétitions
    traiter(e.key, verrMaj(e));
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') S.majCote = '';
    if (S.actif && e.key === ' ' && !editable(e.target)) e.preventDefault();
  });
  // filet de sécurité : caractères arrivés par composition (touches mortes sous certains systèmes) ou par saisie sans keydown
  capteur.addEventListener('compositionend', (e) => { for (const c of [...(e.data || '')]) dejaTraite(c) || traiter(c, false); capteur.value = ''; });
  capteur.addEventListener('input', (e) => {
    if (e.isComposing || e.inputType === 'insertCompositionText') return;
    if (e.inputType === 'insertText' && e.data) for (const c of [...e.data]) dejaTraite(c) || traiter(c, false);
    capteur.value = '';
  });
  const dejaTraite = (c) => S.dernierTraite.c === c && performance.now() - S.dernierTraite.t < 60;
  capteur.addEventListener('focus', () => $('atfZone').classList.add('atf-focus'));
  capteur.addEventListener('blur', () => $('atfZone').classList.remove('atf-focus'));
  $('atfZone').addEventListener('click', () => { if (!S.actif && S.def) lancer(); else if (!tactileSansClavier()) capteur.focus({ preventScroll: true }); });
  $('atfGo').addEventListener('click', lancer);
  $('atfStop').addEventListener('click', () => arreter());

  /* ---------- fin d'exercice, bilan, progression ---------- */
  function enregistrerTouches() {
    if (S.frappes < 5) return;
    const st = stats();
    for (const [c, [n, e]] of Object.entries(S.touches)) {
      const t = st.touches[c] || (st.touches[c] = [0, 0]);
      t[0] = Math.min(1e6, t[0] + n); t[1] = Math.min(t[0], t[1] + e);
    }
    S.touches = {};
    sauver(); majFaibles();
  }
  function lecOk() { const st = stats(); return [1, 2, 3, 4, 5].filter((n) => st.lecons[n] && st.lecons[n].ok).length; }
  function finir() {
    if (S.fini) return;
    S.fini = true; S.actif = false; arreterTimer();
    const m = calcul(true);
    const mpm = Math.round(m.mpm), prec = m.prec;
    const def = S.def, st = stats(), obj = OBJECTIF[classe()];
    const assez = !def.test || S.pos >= 25;
    const reussi = prec >= SEUIL && assez;
    const session = S.touches;
    enregistrerTouches();
    let gain = 0, message = '';
    if (def.n) {
      const l = st.lecons[def.n] || { ok: false, mpm: 0, prec: 0 };
      if (reussi) l.ok = true;
      if (mpm > l.mpm || (reussi && prec > l.prec)) { l.mpm = Math.max(l.mpm, mpm); l.prec = Math.max(l.prec, Math.floor(prec)); }
      st.lecons[def.n] = l;
      if (def.test && S.pos > 0) st.tests = st.tests.concat([{ mpm, prec: Math.floor(prec), t: Date.now() }]).slice(-20);
      sauver();
      if (reussi && A.gagner(40, 'frappe:lecon:' + def.n)) gain += 40;
      if (reussi) { const n = lecOk(); if (A.etape('frappe') < n) A.terminer('frappe', n); }
      if (def.test && reussi && mpm >= obj && A.gagner(60, 'frappe:objectif')) gain += 60;
    } else if (reussi && def.cle) {
      if (A.gagner(def.xp, def.cle)) gain += def.xp;
      if (def.cle === 'frappe:libre') { st.libre = true; sauver(); }
    }
    // badges : découverte dès 3 leçons, atelier maîtrisé = 5 leçons + objectif de vitesse de ta classe atteint au test
    const nOk = lecOk();
    if (nOk >= 3) A.badge('frappe-decouverte');
    const meilleur = st.tests.filter((t) => t.prec >= SEUIL).reduce((a, t) => Math.max(a, t.mpm), 0);
    const maitrise = nOk === 5 && meilleur >= obj;
    if (maitrise) A.badge('frappe');
    majXP(); majLecons();

    const pire = lesRatees(session);           // touches ratées pendant cet exercice
    if (reussi) message = def.test
      ? (mpm >= obj ? `Objectif de ta classe (${obj} mots/min) atteint, avec plus de 90 % de précision. Bravo !` : `Précision réussie. Ta vitesse progressera avec l'entraînement : l'objectif indicatif en ${esc(classe())} est ${obj} mots/min.`)
      : 'Leçon réussie : plus de 90 % de frappes justes. Tes doigts commencent à connaître le chemin.';
    else if (!assez) message = "Trop peu de caractères pour mesurer ta vitesse : tape au moins quelques mots pendant la minute.";
    else message = `Il faut au moins ${SEUIL} % de précision. Tu as fait ${S.err} erreur${S.err > 1 ? 's' : ''} sur ${S.frappes} frappes. Ralentis un peu : la vitesse viendra une fois les gestes justes.`;
    const suivante = def.n && def.n < 5 && reussi;
    const bilan = $('atfBilan');
    bilan.innerHTML = `
      <div class="kicker">${reussi ? 'Réussi' : 'Pas encore'} · ${esc(def.titre)}</div>
      <div class="note" id="atfResultat" data-car="${S.pos}" data-frappes="${S.frappes}" data-err="${S.err}" data-ms="${Math.round(m.ms)}" data-mpm="${m.mpm.toFixed(3)}" data-prec="${prec.toFixed(3)}" data-reussi="${reussi}">${mpm} mots/min · ${precTexte(prec)}</div>
      <p class="atf-bilan-texte">${message}${gain ? ` <b>+${gain} XP</b>.` : ''}</p>
      <p class="atf-bilan-detail">${S.pos} caractères justes en ${(m.ms / 1000).toFixed(1).replace('.', ',')}\u00A0s, soit ${String(Math.round(S.pos / 5 * 10) / 10).replace('.', ',')} « mots » de 5 caractères · ${S.frappes} frappes dont ${S.err} erreur${S.err > 1 ? 's' : ''}.</p>
      ${pire.length ? `<p class="atf-bilan-detail">Touches les plus ratées ici : ${pire.map(([c, n, e]) => `<b>${affCar(c)}</b> (${e} sur ${n}, ${DOIGTS[doigtDe(c)] || ''})`).join(', ')}.</p>` : ''}
      ${maitrise ? '<span class="pill ok">Badge « 10 doigts » obtenu</span>' : nOk >= 3 ? '<span class="pill">Badge « découverte du clavier » obtenu</span>' : ''}
      <div class="cta">
        ${suivante ? `<button class="btn p" type="button" data-aller="${def.n + 1}">Leçon suivante</button>` : ''}
        <button class="btn ${suivante ? 's' : 'p'}" type="button" data-refaire="1">Recommencer</button>
        ${pire.length ? '<button class="btn s" type="button" data-faibles="1">Exercice sur mes touches faibles</button>' : ''}
        <a class="btn s" href="index.html">Retour à l'accueil</a>
      </div>`;
    bilan.classList.add('vu');
    $('atfGo').textContent = 'Recommencer'; $('atfGo').hidden = false; $('atfStop').hidden = true;
    $('atfZone').classList.remove('atf-actif');
    eclairer(undefined);
    majMesuresFin(m);
    dire(reussi ? 'Terminé ! Ton bilan est juste en dessous.' : 'Terminé. Regarde ton bilan juste en dessous pour savoir quoi travailler.', reussi ? 'bon' : 'faux');
    bilan.scrollIntoView({ behavior: reduit() ? 'auto' : 'smooth', block: 'center' });
  }
  function majMesuresFin(m) {
    majMesures();
    $('atfMpm').textContent = Math.round(m.mpm);
    $('atfPrec').textContent = precTexte(m.prec);
    if ($('atfTemps')) $('atfTemps').textContent = '0:00';
  }
  function lesRatees(t) {
    return Object.entries(t || {}).map(([c, [n, e]]) => [c, n, e]).filter((x) => x[2] > 0).sort((a, b) => b[2] / b[1] - a[2] / a[1] || b[2] - a[2]).slice(0, 3);
  }
  $('atfBilan').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.aller) { ouvrir(definition(+b.dataset.aller)); lancer(); }
    else if (b.dataset.refaire) lancer();
    else if (b.dataset.faibles) lancerFaibles();
  });

  /* ---------- choix des leçons ---------- */
  function majLecons() {
    const st = stats();
    const premiere = [1, 2, 3, 4, 5].find((n) => !(st.lecons[n] && st.lecons[n].ok)) || 5;
    $('atfLecons').innerHTML = LECONS.map((l) => {
      const r = st.lecons[l.n];
      const etat = r && r.ok ? `<span class="pill ok">réussie · ${Math.floor(r.prec)} %</span>` : l.n === premiere ? '<span class="pill go">à faire</span>' : '<span class="pill">à faire</span>';
      const actif = S.def && S.def.n === l.n;
      return `<button type="button" class="atf-lecon${actif ? ' atf-choisie' : ''}" data-lecon="${l.n}" aria-pressed="${actif}">
        <span class="atf-num">${l.n}</span><span class="atf-nom">${esc(l.titre)}<small>${esc(l.court)}</small></span>${etat}</button>`;
    }).join('') + `<button type="button" class="atf-lecon atf-bonus${S.def && S.def.cle === 'frappe:bonus:circonflexe' ? ' atf-choisie' : ''}" data-bonus="1" aria-pressed="${!!(S.def && S.def.cle === 'frappe:bonus:circonflexe')}">
        <span class="atf-num">^</span><span class="atf-nom">Bonus facultatif<small>accents circonflexes : ê â î ô û</small></span></button>`;
    $('atfCta').textContent = st.lecons[5] && st.lecons[5].ok && premiere === 5 ? 'Refaire le test d\u2019une minute' : 'Commencer la leçon ' + premiere;
    $('atfCta').dataset.lecon = premiere;
  }
  $('atfCta').addEventListener('click', () => {
    if (S.actif) arreter('Exercice précédent arrêté.');
    const n = +$('atfCta').dataset.lecon || 1;
    if (!(S.def && S.def.n === n)) ouvrir(definition(n));
    lancer();
  });
  $('atfLecons').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (S.actif) arreter('Exercice précédent arrêté.');
    if (b.dataset.bonus) ouvrir({ id: 'bonus', titre: BONUS.titre, consigne: BONUS.consigne, texte: BONUS.texte, cle: 'frappe:bonus:circonflexe', xp: 20 });
    else ouvrir(definition(+b.dataset.lecon));
    $('atfPoste').scrollIntoView({ behavior: reduit() ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- touches faibles ---------- */
  function faibles() {
    return Object.entries(stats().touches).map(([c, [n, e]]) => ({ c, n, e, taux: e / n }))
      .filter((x) => x.n >= 4 && x.e > 0).sort((a, b) => b.taux - a.taux || b.e - a.e).slice(0, 5);
  }
  function majFaibles() {
    const f = faibles(), el = $('atfFaibles');
    if (!f.length) {
      el.innerHTML = `<p class="atf-vide">Pas encore de touche faible. Fais une leçon : l'atelier note, pour chaque touche, combien de fois tu l'as réussie ou ratée.</p>`;
      return;
    }
    el.innerHTML = `<ul class="atf-liste-faibles">${f.map((x) => `<li style="--f:var(--atf-${doigtDe(x.c) || 'P'})"><b>${affCar(x.c)}</b>
        <span>${x.e}\u00A0erreur${x.e > 1 ? 's' : ''} sur\u00A0${x.n} (${Math.round(x.taux * 100)}\u00A0%)</span><small>${commentTaper(x.c)}</small></li>`).join('')}</ul>
      <div class="atf-boutons"><button class="btn p" type="button" id="atfFaiblesGo">Exercice ciblé sur ces touches</button></div>`;
    $('atfFaiblesGo').addEventListener('click', lancerFaibles);
  }
  const BANQUE = (() => {
    const mots = new Set();
    LECONS.forEach((l) => (l.lignes || []).slice(1).forEach((x) => x.split(' ').forEach((m) => mots.add(m))));
    PHRASES.forEach((p) => p[2].split(' ').forEach((m) => mots.add(m)));
    mots.add(BONUS.texte.split(' ')[1]);
    return [...mots].filter((m) => m.length > 1 && m !== ';' && m !== ':' && m !== '?' && m !== '!');
  })();
  function texteFaibles() {
    const f = faibles().slice(0, 4);
    if (!f.length) return '';
    const parts = [];
    f.forEach(({ c }) => {
      if (/^[a-zéèçàù]$/.test(c) && !CARTE.get(c).morte) parts.push(`${c}${c} f${c}j ${c}${c}`);
      const mots = melange(BANQUE.filter((m) => m.includes(c))).slice(0, 3);
      if (c === ' ') parts.push('le la un de du et');
      else if (mots.length) parts.push(mots.join(' '));
      else if (/^[,;:!?.]$/.test(c)) parts.push(c === ',' ? 'oui, non, oui, non' : c === '.' ? 'Fin. Oui. Non.' : `oui ${c} non ${c}`);
      else parts.push(`${c} ${c} ${c}`);
    });
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }
  function lancerFaibles() {
    const t = texteFaibles();
    if (!t) { majFaibles(); return; }
    if (S.actif) arreter('Exercice précédent arrêté.');
    ouvrir({ id: 'faibles', titre: 'Exercice ciblé · tes touches faibles', consigne: 'Le texte insiste sur les touches que tu rates le plus souvent. Prends ton temps : la précision d\u2019abord.', texte: t, cle: 'frappe:faibles', xp: 20 });
    lancer();
  }

  /* ---------- entraînement libre ---------- */
  document.querySelectorAll('[data-libre]').forEach((b) => b.addEventListener('click', () => {
    const theme = b.dataset.libre, c = classe();
    const pool = PHRASES.filter((p) => p[0] === theme && (p[1] === 1 || c !== '5e')).map((p) => p[2]);
    if (S.actif) arreter('Exercice précédent arrêté.');
    ouvrir({ id: 'libre', titre: 'Entraînement libre · ' + (theme === 'sciences' ? 'sciences' : 'vie quotidienne'), consigne: 'Sans chrono imposé : tape à ton rythme, la vitesse est mesurée quand même.', texte: melange(pool).slice(0, 3).join(' '), cle: 'frappe:libre', xp: 10 });
    lancer();
  }));
  const REMPLACE = { '\u2019': "'", '\u2018': "'", '\u201C': '"', '\u201D': '"', '«': '"', '»': '"', 'œ': 'oe', 'Œ': 'Oe', 'æ': 'ae', 'Æ': 'Ae',
    'À': 'A', 'Â': 'A', 'Ç': 'C', 'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E', 'Î': 'I', 'Ï': 'I', 'Ô': 'O', 'Ù': 'U', 'Û': 'U', 'Ü': 'U', '\u2026': '...', '\u2013': '-', '\u2014': '-' };
  $('atfPersoGo').addEventListener('click', () => {
    const brut = $('atfPerso').value.slice(0, 300);
    let t = brut.replace(/[\s\u00A0\u202F]+/g, ' ').replace(/./gu, (c) => REMPLACE[c] !== undefined ? REMPLACE[c] : c);
    const retires = new Set();
    t = [...t].filter((c) => { if (CARTE.has(c)) return true; retires.add(c); return false; }).join('').replace(/ +/g, ' ').trim();
    const out = $('atfPersoRetour');
    if (t.length < 10) {
      out.innerHTML = 'Écris au moins une phrase (10 caractères) avec des lettres du clavier français.';
      return;
    }
    const remplaces = [...brut].some((c) => REMPLACE[c] !== undefined);
    out.innerHTML = (remplaces ? 'Les caractères absents d\u2019une touche simple (œ, É, « »…) ont été remplacés par leur équivalent : oe, E, ". ' : '')
      + (retires.size ? `Retiré${retires.size > 1 ? 's' : ''} car introuvable${retires.size > 1 ? 's' : ''} sans Alt Gr : ${[...retires].slice(0, 8).map((c) => '« ' + esc(c) + ' »').join(' ')}.` : '');
    if (S.actif) arreter('Exercice précédent arrêté.');
    ouvrir({ id: 'perso', titre: 'Entraînement libre · ton texte', consigne: 'Ton propre texte, à ton rythme.', texte: t, cle: 'frappe:libre', xp: 10 });
    lancer();
  });

  /* ---------- objectifs selon la classe ---------- */
  function majObjectifs() {
    const c = classe();
    const lignes = [
      ['5e', 'Au bas de la fourchette « collège » (20 à 30 mots/min) de Typing.com.'],
      ['3e', 'Au milieu de cette fourchette : tu as plus d\u2019années de clavier derrière toi.'],
      ['2de', 'Au bas de la fourchette « lycée » (30 à 40 mots/min) du même site.'],
    ];
    $('atfObjectifs').innerHTML = lignes.map(([cl, j]) => `<tr${cl === c ? ' class="atf-toi"' : ''}><th scope="row">${cl}${cl === c ? ' <span class="pill go">ta classe</span>' : ''}</th><td><b>${OBJECTIF[cl]}</b> mots/min</td><td>${j}</td></tr>`).join('');
  }

  /* ---------- XP (même rendu que les modules) ---------- */
  function majXP() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    const el = document.getElementById('xp');
    if (!el) return;
    el.innerHTML = `<span class="lvl">Nv. ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div>
      <small>${p.xp} XP · ${A.esc(p.nom)} (${A.esc(p.classe)})</small>`;
  }

  /* ---------- démarrage : reprise là où l'enfant en était ---------- */
  if (tactileSansClavier()) $('atfSansClavier').hidden = false;
  majXP(); majObjectifs(); majFaibles();
  (function reprendre() {
    const st = stats();
    let n = [1, 2, 3, 4, 5].find((k) => !(st.lecons[k] && st.lecons[k].ok));
    if (!n) n = 5;
    if (!Object.keys(st.lecons).length && A.etape('frappe') > 0) n = Math.min(5, A.etape('frappe') + 1);
    ouvrir(definition(n));
    if (A.etape('frappe') > 0) dire(`Reprise : tu as réussi ${A.etape('frappe')} leçon${A.etape('frappe') > 1 ? 's' : ''} sur 5. On continue avec la leçon ${n}. Appuie sur Commencer.`);
  })();
})();
