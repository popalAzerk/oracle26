/* Atelier « Badge Pix · domaine 1 » — rechercher, gérer et traiter l'information.
   Entraînement inspiré du cadre de référence des compétences numériques (CRCN, décret n° 2019-919),
   non officiel, sans lien avec la plateforme Pix. Tout est simulé dans la page : aucun réseau. */
(function () {
  'use strict';
  const A = window.Atelier;
  if (!A) return;

  const ID = 'pix', TOTAL = 6, CLE_STATS = 'atelier.pix.v1';
  const P = A.profil();
  const CLASSE = ['5e', '3e', '2de'].includes(P.classe) ? P.classe : '3e';
  const N5 = CLASSE === '5e', N2DE = CLASSE === '2de';
  const calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = A.esc;

  /* ---------- outils ---------- */
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const fr = (n) => (typeof n === 'number' ? (Math.round(n * 100) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) : String(n));
  const defiler = (el) => { if (el && el.scrollIntoView) el.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'nearest' }); };
  function dire(el, html, type) { el.className = 'commentaire' + (type ? ' ' + type : ''); el.innerHTML = html; }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- statistiques propres à l'atelier (premier essai de chaque exercice) ---------- */
  let memStats = null;
  function lireStats() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(CLE_STATS) || 'null'); } catch (_) { d = null; }
    const sur = { v: 1, profils: {} };
    if (d && typeof d === 'object' && d.v === 1 && d.profils && typeof d.profils === 'object') {
      for (const [pid, p] of Object.entries(d.profils)) {
        if (!/^[\w-]{1,20}$/.test(pid) || !p || typeof p !== 'object' || !p.exos || typeof p.exos !== 'object') continue;
        const exos = {};
        for (const [k, v] of Object.entries(p.exos)) if (/^[\w-]{1,40}$/.test(k) && (v === 0 || v === 1)) exos[k] = v;
        sur.profils[pid] = { exos };
      }
    }
    const pid = A.profilId();
    if (!sur.profils[pid]) sur.profils[pid] = { exos: {} };
    return sur;
  }
  function stats() { if (!memStats) memStats = lireStats(); return memStats.profils[A.profilId()].exos; }
  function sauverStats() { try { localStorage.setItem(CLE_STATS, JSON.stringify(memStats)); } catch (_) { /* stockage bloqué : bilan gardé pendant la visite */ } }
  /** Note le résultat du PREMIER essai d'un exercice (les essais suivants ne changent rien). */
  function noter(exo, premierCoup) { const s = stats(); if (!(exo in s)) { s[exo] = premierCoup ? 1 : 0; sauverStats(); } }
  function effacerStats() { stats(); memStats.profils[A.profilId()] = { exos: {} }; sauverStats(); }
  function reussite(exo, xp) { A.gagner(xp || 10, 'pix:exo:' + exo); majXP(); }

  /* ---------- niveaux et repères (éduscol, « niveaux de maîtrise et repères pour enseigner ») ---------- */
  const NIV = {
    '5e': { titre: 'niveau&nbsp;2 · novice', txt: "En 5<sup>e</sup>, il n'y a pas encore de niveau officiel à atteindre. L'atelier vise le niveau&nbsp;2 : une marche avant le niveau&nbsp;3, attendu en&nbsp;3<sup>e</sup>." },
    '3e': { titre: 'niveau&nbsp;3 · indépendant&nbsp;1', txt: "C'est le niveau attendu en 3<sup>e</sup>, l'année où l'on passe la certification officielle (note de service du 23&nbsp;janvier&nbsp;2026)." },
    '2de': { titre: 'niveau&nbsp;4 · indépendant&nbsp;2', txt: "C'est le niveau attendu en terminale. En 2<sup>de</sup>, pas de niveau officiel à atteindre : tu t'y prépares." },
  };
  const REP = {
    1: { '5e': [2, "Reformuler sa requête en modifiant les mots-clés pour obtenir de meilleurs résultats"], '3e': [3, "Expliquer sa stratégie de recherche"], '2de': [4, "Utiliser des options de recherche avancées pour obtenir les meilleurs résultats"] },
    2: { '5e': [2, "Questionner la fiabilité et la pertinence des sources"], '3e': [3, "Connaître les principaux critères permettant d'évaluer la fiabilité et la pertinence de diverses sources"], '2de': [4, "Évaluer la fiabilité et la pertinence de diverses sources"] },
    3: { '5e': [2, "Sauvegarder des fichiers dans l'ordinateur utilisé, et dans un espace de stockage partagé et sécurisé, afin de pouvoir les réutiliser"], '3e': [3, "Stocker et organiser les données dans des environnements numériques sécurisés de sorte qu'elles soient facilement accessibles"], '2de': [4, "Stocker et organiser les données pour qu'elles soient accessibles dans des environnements numériques locaux et distants"] },
    4: { '5e': [2, "Sauvegarder des fichiers dans l'ordinateur utilisé, et dans un espace de stockage partagé et sécurisé, afin de pouvoir les réutiliser"], '3e': [3, "Savoir distinguer les différents types d'espaces de stockage"], '2de': [4, "Concevoir une organisation efficace de rangement de dossiers en tenant compte des formats de fichiers"] },
    5: { '5e': [2, "Insérer, saisir et trier des données dans un tableur pour les exploiter"], '3e': [3, "Saisir, organiser, trier et filtrer des données dans une application"], '2de': [4, "Traiter des données pour analyser une problématique"] },
    6: { '5e': [3, "Appliquer une formule simple pour résoudre un problème"], '3e': [3, "Appliquer une formule simple pour résoudre un problème"], '2de': [4, "Appliquer une fonction statistique simple"] },
  };
  const INTRO = {
    1: "Un moteur de recherche affiche les pages qui contiennent <b>tes mots</b>. À toi de choisir les bons mots-clés et les bons opérateurs. Le moteur et ses pages sont simulés.",
    2: "Avant de croire ou de partager, on enquête : <b>qui</b> parle, <b>quand</b>, avec quelles <b>preuves</b>, dans quel <b>but</b> ?",
    3: "Un fichier bien rangé se retrouve en dix secondes. Range chaque fichier dans son dossier : son nom te dit où il va.",
    4: "Un bon nom, le bon format, une copie de secours : trois réflexes pour ne jamais perdre ton travail.",
    5: "Voici les relevés (fictifs) de la station météo du collège. Comme dans un vrai tableur, chaque cellule a une adresse : la colonne puis la ligne, par exemple <b>C4</b>.",
    6: "Une formule commence par <b>=</b> et calcule à partir des cellules. Ce tableur calcule vraiment : tape ta formule dans la barre <b>fx</b>, puis Valider.",
  };
  const RESUME = {
    1: "Mots-clés, guillemets et signe moins : tu sais affiner une recherche.",
    2: "Auteur, date, preuves, intention, origine d'une image : tu sais enquêter sur une source.",
    3: "Chaque fichier dans son dossier : ton arborescence est en ordre.",
    4: "Bon nom, bon format, copie de secours et versions : c'est acquis.",
    5: "Trier, filtrer et lire une cellule : tu sais exploiter un tableau.",
    6: "SOMME, MOYENNE et le bon graphique : tu sais traiter des données.",
  };

  /* =====================================================================
     Étape 1 · moteur de recherche simulé
     ===================================================================== */
  const CORPUS = [
    { id: 'j1', t: 'jaguar', site: 'faune-junior.example › félins', titre: "Le jaguar, plus grand félin d'Amérique", ext: "Le jaguar est un animal des forêts tropicales. Contrairement à beaucoup de félins, il nage très bien." },
    { id: 'j2', t: 'voiture', site: 'auto-essais.example › essais', titre: 'Jaguar : notre essai de la voiture', ext: "Confort, autonomie, prix : notre avis après une semaine au volant de cette voiture de la marque Jaguar." },
    { id: 'j3', t: 'jaguar', site: 'atlas-nature.example › mammifères', titre: 'Où vit le jaguar ? La carte de son territoire', ext: "On trouve le jaguar du Mexique jusqu'au nord de l'Argentine, souvent près des rivières." },
    { id: 'j4', t: 'voiture', site: 'occasions-auto.example › conseils', titre: "Jaguar d'occasion : bien choisir sa voiture", ext: "Kilométrage, entretien, contrôle technique : nos conseils pour acheter une voiture d'occasion." },
    { id: 'j5', t: 'jaguar', site: 'faune-junior.example › quiz', titre: 'Jaguar ou léopard : comment les reconnaître ?', ext: "Les taches du jaguar forment de grandes rosettes, souvent avec un point noir au centre." },
    { id: 'j6', t: 'voiture', site: 'design-auto.example › logos', titre: 'Le félin bondissant : histoire du logo Jaguar', ext: "Comment un félin est devenu l'emblème des voitures de la marque." },
    { id: 'p1', t: 'pdt', site: 'histoire-aliments.example › légumes', titre: 'La pomme de terre, un tubercule venu des Andes', ext: "La pomme de terre a d'abord été cultivée dans les Andes, en Amérique du Sud, il y a des milliers d'années." },
    { id: 'p2', t: 'pdt', site: 'jardin-facile.example › potager', titre: 'Quand planter la pomme de terre au potager ?', ext: "On plante la pomme de terre au printemps, quand le sol s'est réchauffé." },
    { id: 'p3', t: 'pomme', site: 'loisirs-creatifs.example › argile', titre: 'Atelier poterie : façonne une pomme en terre cuite', ext: "Avec un peu d'argile, modèle une pomme, laisse sécher, puis fais cuire ta terre." },
    { id: 'p4', t: 'pomme', site: 'sciences-histoire.example › physique', titre: 'La pomme de Newton et la Terre', ext: "Selon une anecdote célèbre, Newton aurait pensé à la gravitation en voyant tomber une pomme : la Terre attire la pomme." },
    { id: 'p5', t: 'pdt', site: 'cuisine-ado.example › recettes', titre: 'Purée de pomme de terre : la recette facile', ext: "Épluche, fais cuire à l'eau, écrase avec un peu de lait : ta purée maison est prête." },
    { id: 'p6', t: 'frites', site: 'cuisine-ado.example › recettes', titre: 'Frites de pomme de terre : la cuisson en deux temps', ext: "Pour des frites croustillantes, on les cuit deux fois. Demande l'aide d'un adulte : l'huile très chaude brûle." },
    { id: 'p7', t: 'pomme', site: 'vergers.example › fruits', titre: 'Golden, gala, reinette : les variétés de pommes', ext: "Chaque pomme a son goût : plus sucrée, plus acide ou plus croquante." },
  ];
  CORPUS.forEach((d) => { const n = norm(d.titre + ' ' + d.ext); d._txt = ' ' + n + ' '; d._mots = n.split(' '); });
  const VIDES = new Set(['le', 'la', 'les', 'l', 'de', 'des', 'du', 'd', 'un', 'une', 'et', 'a', 'au', 'aux', 'en', 'sur', 'pour']);

  function analyser(q) {
    const termes = [], exclus = [];
    let erreur = null, src = q;
    if (((q.match(/"/g) || []).length) % 2) { erreur = 'Il manque un guillemet : une expression se met <b>entre deux</b> guillemets, "comme ceci".'; src = q.replace(/"/g, ' '); }
    const re = /(-?)"([^"]*)"|(\S+)/g;
    let m;
    while ((m = re.exec(src))) {
      if (m[2] !== undefined) { const ph = norm(m[2]); if (ph) (m[1] ? exclus : termes).push({ phrase: ph.includes(' '), v: ph }); continue; }
      let w = m[3], neg = false;
      if (w.length > 1 && w[0] === '-') { neg = true; w = w.slice(1); }
      const n = norm(w);
      if (!n) continue;
      if (n.includes(' ')) { (neg ? exclus : termes).push({ phrase: true, v: n }); continue; }   // pomme-de-terre : traité comme une expression
      if (!neg && VIDES.has(n)) continue;
      (neg ? exclus : termes).push({ phrase: false, v: n });
    }
    return { termes, exclus, erreur };
  }
  function contient(d, t) {
    if (t.phrase) return d._txt.includes(' ' + t.v + ' ');
    return d._mots.some((m) => m === t.v || m === t.v + 's' || m === t.v + 'x' || (t.v.length > 3 && t.v.endsWith('s') && m === t.v.slice(0, -1)));
  }
  function chercher(p) {
    if (!p.termes.length) return [];
    return CORPUS.filter((d) => p.termes.every((t) => contient(d, t)) && !p.exclus.some((t) => contient(d, t)));
  }

  const MISSIONS = [
    { id: 's1-m1', titre: "le jaguar, l'animal", texte: "Tu prépares un exposé sur le <b>jaguar, l'animal</b>. Fais une recherche qui affiche au moins deux pages sur lui, et <b>aucune</b> sur la voiture.",
      ok: (d) => d.t === 'jaguar',
      indice: (hors) => hors.every((d) => d.t === 'voiture')
        ? "Elles parlent toutes de <b>voiture</b> : exclus ce mot en tapant <code>-voiture</code> (le signe moins collé au mot)."
        : "Ajoute un mot qui écarte ces pages, ou exclus-en un avec le signe moins.",
      bravo: (p) => p.exclus.length ? "Le signe moins a exclu toutes les pages qui contiennent « voiture »." : "Ta requête marche. Retiens aussi l'opérateur <code>-mot</code> : il exclut toutes les pages qui contiennent ce mot." },
    { id: 's1-m2', titre: 'la pomme de terre', texte: "Tu cherches des pages sur la <b>pomme de terre</b>, le légume. Évite les pages où « pomme » et « terre » apparaissent séparément.",
      ok: (d) => d.t === 'pdt' || d.t === 'frites',
      indice: (hors) => {
        const sep = hors.some((d) => d.id === 'p3' || d.id === 'p4'), fruit = hors.some((d) => d.id === 'p7');
        return (sep ? "Ces pages contiennent « pomme » et « terre », mais pas l'expression « pomme de terre ». Mets l'expression entre guillemets : <code>\"pomme de terre\"</code>." : '') +
               (fruit ? " Le mot « pomme » seul trouve aussi le fruit." : '');
      },
      bravo: (p) => p.termes.some((t) => t.phrase) ? "Entre guillemets, le moteur cherche l'expression exacte : ces mots, collés, dans cet ordre." : "Ta requête marche." },
    { id: 's1-m3', titre: 'sans les frites', texte: "Toujours la <b>pomme de terre</b>, mais cette fois <b>aucune page sur les frites</b>. Combine les deux opérateurs.",
      ok: (d) => d.t === 'pdt',
      indice: (hors) => {
        const sep = hors.some((d) => d.id === 'p3' || d.id === 'p4' || d.id === 'p7'), frites = hors.some((d) => d.id === 'p6');
        return [sep ? "Mets <code>\"pomme de terre\"</code> entre guillemets pour écarter les pages où les mots sont séparés." : '',
                frites ? "Il reste une page sur les frites : ajoute <code>-frites</code>." : ''].filter(Boolean).join(' ');
      },
      bravo: () => "Guillemets + signe moins : c'est une recherche avancée. Les grands moteurs de recherche comprennent ces deux opérateurs." },
  ];

  function etape1(corps, fin) {
    const missions = MISSIONS.filter((m) => m.id !== 's1-m3' || N2DE);
    const blocs = [(box, suite) => moteur(box, missions, suite)];
    if (!N5) blocs.push((box, suite) => qcm(box, {
      id: 's1-q', q: 'Explique ta stratégie : pourquoi mettre pomme de terre entre guillemets ?',
      choix: ['Pour que le moteur trouve plus de pages', "Pour chercher l'expression exacte : ces mots, collés, dans cet ordre", 'Parce que les guillemets sont obligatoires dans toute recherche', 'Pour exclure les pages sur les pommes'],
      bon: 1,
      pourquoi: ["Au contraire : les guillemets <b>réduisent</b> le nombre de résultats, ils ne l'augmentent pas.", null, "Non : sans guillemets, une recherche fonctionne aussi. On les ajoute seulement pour une expression précise.", "Les guillemets n'excluent rien : pour exclure, on utilise le signe moins (<code>-mot</code>)."],
      expl: "Sans guillemets, le moteur cherche des pages qui contiennent « pomme » et « terre » n'importe où. Avec, il cherche l'expression telle quelle.",
    }, suite));
    enchainer(corps, blocs, fin);
  }

  function moteur(box, missions, suite) {
    const guide = `<p><b>Guillemets</b> <code>"pomme de terre"</code> : l'expression exacte, mots collés dans cet ordre.</p>
      <p><b>Signe moins</b> <code>-voiture</code> : exclut toutes les pages qui contiennent ce mot. Colle-le au mot, sans espace.</p>`;
    box.innerHTML = `
      <div class="at-pix-carte at-pix-moteur">
        <ol class="at-pix-missions" aria-label="Missions"></ol>
        <div class="at-pix-mission" aria-live="polite"></div>
        <div class="at-pix-recherche">
          <label class="sr" for="at-pix-q">Ta recherche</label>
          <input id="at-pix-q" class="at-pix-input" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Tape tes mots-clés…">
          <button type="button" class="btn p" data-chercher>Rechercher</button>
        </div>
        <div class="at-pix-ops" role="group" aria-label="Opérateurs">
          <button type="button" class="at-pix-op" data-op="guillemets"><code>" "</code> Expression exacte</button>
          <button type="button" class="at-pix-op" data-op="moins"><code>-</code> Exclure un mot</button>
        </div>
        ${N5 ? `<div class="at-pix-guide">${guide}</div>` : `<details><summary>Coup de pouce : les opérateurs</summary><div>${guide}</div></details>`}
        <div class="commentaire" aria-live="polite">Tape des mots-clés, puis « Rechercher » (ou la touche Entrée).</div>
        <p class="at-pix-nbres" aria-live="polite"></p>
        <ol class="at-pix-res" aria-label="Résultats simulés"></ol>
        <p class="at-pix-note">Sites inventés pour l'exercice (adresses en « .example ») : aucun lien n'est ouvert.</p>
      </div>`;
    const inp = box.querySelector('#at-pix-q'), fbk = box.querySelector('.commentaire');
    const liste = box.querySelector('.at-pix-missions'), carte = box.querySelector('.at-pix-mission');
    const res = box.querySelector('.at-pix-res'), nb = box.querySelector('.at-pix-nbres');
    let im = 0, essais = 0, fini = false;
    const majMissions = () => {
      liste.innerHTML = missions.map((m, i) => `<li class="${i < im ? 'ok' : i === im ? 'en-cours' : ''}"><span aria-hidden="true">${i < im ? '✓' : i + 1}</span> Mission ${i + 1} · ${m.titre}${i < im ? '<span class="sr"> (réussie)</span>' : ''}</li>`).join('');
      if (im < missions.length) carte.innerHTML = `<b>Mission ${im + 1} / ${missions.length}.</b> ${missions[im].texte}`;
    };
    majMissions();

    function lancer() {
      if (fini) return;
      const q = inp.value.trim();
      const p = analyser(q);
      const r = chercher(p);
      nb.innerHTML = p.termes.length ? `${r.length} résultat${r.length > 1 ? 's' : ''} (simulés) pour <code>${esc(q)}</code>` : '';
      res.innerHTML = r.map((d) => `<li class="at-pix-r"><span class="at-pix-site">${d.site}</span><span class="at-pix-titre">${d.titre}</span><span class="at-pix-ext">${d.ext}</span></li>`).join('');
      if (!q) { dire(fbk, 'Tape au moins un mot-clé.', 'faux'); return; }
      if (!p.termes.length) { dire(fbk, "Tape au moins un mot-clé. Les petits mots comme « le » ou « de » sont ignorés par le moteur.", 'faux'); return; }
      const m = missions[im];
      essais++;
      const hors = r.filter((d) => !m.ok(d)), bons = r.filter(m.ok);
      let msg = null;
      if (p.erreur) msg = p.erreur;
      else if (!r.length) msg = "<b>Aucun résultat.</b> Ta requête est trop stricte, ou un mot est mal écrit. Ce moteur simulé cherche les mots exacts.";
      else if (hors.length) {
        msg = `<b>${hors.length} page${hors.length > 1 ? 's' : ''} hors sujet</b> : ${hors.map((d) => '« ' + d.titre + ' »').join(', ')}. `;
        if (/(^|\s)-\s/.test(q)) msg += "Attention : le signe moins doit être <b>collé</b> au mot (<code>-voiture</code>) ; séparé par une espace, il est ignoré. ";
        msg += m.indice(hors);
      } else if (bons.length < 2) msg = "<b>Une seule page.</b> Ta requête est trop étroite : un mot-clé de trop écarte de bonnes pages. Garde le mot principal et utilise plutôt un opérateur.";
      if (msg) {
        dire(fbk, msg + ' Modifie ta recherche et relance.', 'faux');
        if (essais > 3) noter(m.id, false);
        return;
      }
      noter(m.id, essais <= 3);
      reussite(m.id, 10);
      dire(fbk, `<b>Mission ${im + 1} réussie !</b> ${bons.length} pages, toutes sur le sujet. ${m.bravo(p)}`, 'bon');
      im++; essais = 0;
      majMissions();
      if (im >= missions.length) { fini = true; carte.innerHTML = '<b>Toutes les missions sont réussies.</b>'; suite(); }
    }
    box.querySelector('[data-chercher]').addEventListener('click', lancer);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); lancer(); } });
    box.querySelector('.at-pix-ops').addEventListener('click', (e) => {
      const b = e.target.closest('[data-op]'); if (!b) return;
      const v = inp.value, a = inp.selectionStart ?? v.length, z = inp.selectionEnd ?? v.length;
      if (b.dataset.op === 'guillemets') {
        if (z > a) { inp.value = v.slice(0, a) + '"' + v.slice(a, z) + '"' + v.slice(z); inp.focus(); inp.setSelectionRange(z + 2, z + 2); }
        else { inp.value = v.slice(0, a) + '""' + v.slice(a); inp.focus(); inp.setSelectionRange(a + 1, a + 1); }
      } else {
        const avant = v.slice(0, a), ajout = (avant && !/\s$/.test(avant) ? ' ' : '') + '-';
        inp.value = avant + ajout + v.slice(z); inp.focus(); inp.setSelectionRange(a + ajout.length, a + ajout.length);
      }
    });
  }

  /* =====================================================================
     Étape 2 · fiabilité d'une source + image détournée
     ===================================================================== */
  const INDICES = {
    auteur: { ok: true, nom: 'Auteur inconnu', txt: "« Admin » n'est pas un nom : impossible de savoir qui écrit, ni s'il connaît le sujet." },
    date: { ok: true, nom: 'Date ancienne', txt: "Mise à jour en 2015 : l'information peut être dépassée, et la page n'est plus suivie." },
    preuve: { ok: true, nom: 'Preuve invérifiable', txt: "Quels scientifiques ? Quelle étude ? Aucun nom, aucune référence : impossible de vérifier." },
    temoin: { ok: true, nom: 'Témoignage isolé', txt: "Un seul témoignage ne prouve rien : on ne sait pas qui est Léo, ni s'il existe." },
    vente: { ok: true, nom: 'Intention de vendre', txt: "La page sert à faire acheter, avec une offre pressante (« aujourd'hui seulement ») pour t'empêcher de réfléchir." },
    lecture: { ok: false, txt: "La durée de lecture ne dit rien de la fiabilité : ce n'est pas un indice." },
    image: { ok: false, txt: "Une jolie image ne prouve rien, mais elle ne rend pas la page fausse non plus : ce n'est pas un indice. Ce qui compte : qui parle, quand, avec quelles preuves, dans quel but." },
  };
  const BRACELET_SVG = `<svg viewBox="0 0 160 80" width="160" height="80" aria-hidden="true"><ellipse cx="80" cy="42" rx="52" ry="24" fill="none" stroke="#7A5CFF" stroke-width="9"/><ellipse cx="80" cy="42" rx="52" ry="24" fill="none" stroke="#B9A8FF" stroke-width="3" stroke-dasharray="6 7"/><rect x="62" y="10" width="36" height="22" rx="6" fill="#2B1F66"/><text x="80" y="26" text-anchor="middle" font-size="11" font-weight="700" fill="#FFDE59">N+</text></svg>`;
  const RUE_SVG = `<svg viewBox="0 0 320 170" role="img" aria-label="Dessin : une rue inondée, avec un aileron de requin dans l'eau">
      <rect width="320" height="170" fill="#CFE0F0"/>
      <rect x="8" y="22" width="70" height="92" fill="#B7A99A"/><rect x="86" y="8" width="62" height="106" fill="#C9B9A6"/><rect x="156" y="30" width="74" height="84" fill="#A89888"/><rect x="238" y="14" width="74" height="100" fill="#C2B29F"/>
      <g fill="#E9F1F8"><rect x="20" y="34" width="14" height="16"/><rect x="48" y="34" width="14" height="16"/><rect x="20" y="62" width="14" height="16"/><rect x="48" y="62" width="14" height="16"/><rect x="98" y="22" width="14" height="16"/><rect x="122" y="22" width="14" height="16"/><rect x="98" y="52" width="14" height="16"/><rect x="122" y="52" width="14" height="16"/><rect x="170" y="44" width="16" height="16"/><rect x="200" y="44" width="16" height="16"/><rect x="252" y="28" width="14" height="16"/><rect x="282" y="28" width="14" height="16"/><rect x="252" y="58" width="14" height="16"/><rect x="282" y="58" width="14" height="16"/></g>
      <rect y="100" width="320" height="70" fill="#5F8FB4"/>
      <path d="M0 104q20-6 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#A9C7DE" stroke-width="3"/>
      <path d="M0 132q20-6 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#86ADCB" stroke-width="2"/>
      <path d="M150 120 L176 82 L190 120 Z" fill="#3E4A57"/><path d="M140 122q25 6 60 0" fill="none" stroke="#DDEAF4" stroke-width="3"/>
      <rect x="40" y="70" width="4" height="40" fill="#555"/><rect x="26" y="62" width="32" height="12" rx="2" fill="#2D6CB5"/>
    </svg>`;

  function etape2(corps, fin) {
    const requis = N5 ? 3 : N2DE ? 5 : 4;
    enchainer(corps, [
      (box, suite) => {
        box.innerHTML = `
          <div class="at-pix-carte">
            <h3 class="at-pix-h3">Défi 1 · enquête sur une page web</h3>
            <p class="at-pix-texte">Un camarade veut utiliser cette page pour son exposé. Clique sur les éléments qui doivent te mettre en alerte. Trouve <b>${requis} indice${requis > 1 ? 's' : ''}</b> (il y en a 5).</p>
            <div class="at-pix-navigateur" role="group" aria-label="Page web simulée">
              <div class="at-pix-barre"><span class="at-pix-pastilles" aria-hidden="true"><i></i><i></i><i></i></span><span class="at-pix-url">neuro-plus-boutique.example/article</span></div>
              <div class="at-pix-page">
                <p class="at-pix-page-titre">Le bracelet Neuro+ rend ton cerveau 2 fois plus rapide !</p>
                <p class="at-pix-meta"><button type="button" class="at-pix-ind" data-ind="auteur">Publié par : Admin</button> · <button type="button" class="at-pix-ind" data-ind="date">Mis à jour le 3 mars 2015</button> · <button type="button" class="at-pix-ind" data-ind="lecture">Lecture : 3 min</button></p>
                <button type="button" class="at-pix-ind at-pix-ind-img" data-ind="image" aria-label="Image du bracelet">${BRACELET_SVG}</button>
                <p>Fini les mauvaises notes ! Porte Neuro+ au poignet : ses ondes réveillent tes neurones pendant que tu révises. <button type="button" class="at-pix-ind" data-ind="preuve">Des scientifiques l'ont prouvé.</button></p>
                <p class="at-pix-citation"><button type="button" class="at-pix-ind" data-ind="temoin">« J'ai eu 20/20 partout ! » — Léo, 13 ans</button></p>
                <p><button type="button" class="at-pix-ind at-pix-promo" data-ind="vente">Commander −50 % · offre valable aujourd'hui seulement</button></p>
              </div>
            </div>
            <p class="at-pix-compteur" aria-live="polite"></p>
            <div class="commentaire" aria-live="polite">Clique sur un élément de la page pour l'examiner.</div>
          </div>`;
        const fbk = box.querySelector('.commentaire'), cpt = box.querySelector('.at-pix-compteur');
        const trouves = new Set(); let leurres = 0, fini = false;
        const maj = () => { cpt.textContent = `Indices trouvés : ${trouves.size} / ${requis}`; };
        maj();
        box.querySelector('.at-pix-page').addEventListener('click', (e) => {
          const b = e.target.closest('[data-ind]'); if (!b) return;
          const k = b.dataset.ind, ind = INDICES[k];
          if (ind.ok) {
            const neuf = !trouves.has(k);
            trouves.add(k); b.classList.add('trouve'); b.setAttribute('aria-pressed', 'true');
            maj();
            dire(fbk, `<b>${neuf ? 'Indice trouvé' : 'Déjà trouvé'} : ${ind.nom}.</b> ${ind.txt}`, 'bon');
            if (!fini && trouves.size >= requis) {
              fini = true;
              noter('s2-indices', leurres === 0);
              reussite('s2-indices', 10);
              const reste = Object.keys(INDICES).filter((x) => INDICES[x].ok && !trouves.has(x));
              dire(fbk, `<b>Bravo, ${trouves.size} indices !</b> ${ind.txt}${reste.length ? ` Il en restait ${reste.length} : ${reste.map((x) => INDICES[x].nom.toLowerCase()).join(', ')}.` : ''}`, 'bon');
              suite();
            }
          } else {
            leurres++; b.classList.add('leurre');
            dire(fbk, `<b>Pas un indice.</b> ${ind.txt}`, 'faux');
          }
        });
      },
      (box, suite) => qcm(box, {
        id: 's2-verdict', q: 'Alors, cette page est-elle une bonne source pour un exposé ?',
        choix: ['Oui : elle est bien présentée et cite des scientifiques', 'Peut-être : elle a sans doute un peu raison', "Non : pas d'auteur, pas de preuve, et elle cherche à vendre"],
        bon: 2,
        pourquoi: ["Une belle présentation ne prouve rien, et « des scientifiques » sans nom ni étude n'est pas une source.", "Ici, tous les indices vont dans le même sens. Une source qu'on ne peut pas vérifier ne se cite pas dans un exposé."],
        expl: "Une source fiable a un auteur identifiable, une date, des preuves vérifiables, et cherche d'abord à informer. Croise toujours avec une autre source sérieuse.",
      }, suite),
      (box, suite) => qcm(box, {
        id: 's2-intention', q: 'Quelle est l\'intention principale de cette page ?',
        choix: ['Informer', 'Vendre', 'Divertir', "Alerter d'un danger"],
        bon: 1,
        pourquoi: ["Une page qui informe donne des faits vérifiables et ne pousse pas à acheter.", null, "Rien n'y est fait pour amuser : tout mène au bouton « Commander ».", "Elle ne prévient d'aucun danger : elle promet un bénéfice pour faire acheter."],
        expl: "Repérer l'intention (informer, vendre, convaincre, divertir) aide à juger ce qu'on lit : une page qui vend a intérêt à exagérer.",
      }, suite),
      (box, suite) => qcm(box, {
        id: 's2-reflexe',
        avant: `<h3 class="at-pix-h3">Défi 2 · une image qui circule</h3>
          <div class="at-pix-post" role="group" aria-label="Message simulé sur un réseau social">
            <div class="at-pix-post-tete"><span class="at-pix-avatar" aria-hidden="true">!</span><span><b>@InfoChoc_24</b><small>il y a 2 h</small></span></div>
            <p>🚨 INCROYABLE : un requin nage dans une rue de Marseille après l'orage d'hier !!! Partagez avant que ça soit supprimé !!!</p>
            <div class="at-pix-post-img">${RUE_SVG}</div>
            <p class="at-pix-post-stats">12 400 partages · 3 100 commentaires</p>
          </div>
          <p class="at-pix-note">Message inventé. L'image est un dessin réalisé pour l'exercice, pas une vraie photo.</p>`,
        q: 'Avant de partager, que fais-tu en premier ?',
        choix: ["Je partage vite : si c'est vrai, il faut prévenir", "Je le crois : plus de 12 000 personnes l'ont partagé", "Je cherche l'origine de l'image avec une recherche d'image inversée", 'Je regarde si la photo est bien nette'],
        bon: 2,
        pourquoi: ["Partager sans vérifier, c'est aider une fausse information à circuler. Prends une minute pour vérifier.", "Le nombre de partages ne prouve rien : une fausse information peut être partagée des milliers de fois.", null, "Une image nette peut être un montage, ou une vraie photo sortie de son contexte."],
        expl: "Les grands moteurs de recherche proposent une recherche par image : elle retrouve où et quand cette image a déjà été publiée.",
      }, suite),
      (box, suite) => qcm(box, {
        id: 's2-conclusion',
        avant: `<div class="at-pix-inverse" role="group" aria-label="Résultat simulé d'une recherche d'image inversée">
            <p class="at-pix-inverse-titre">Recherche d'image inversée <small>(simulée)</small> · 2 pages contiennent cette image</p>
            <ol>
              <li><span class="at-pix-date">14 août 2019</span> · montages-rigolos.example — « Mon photomontage du jour : un requin dans une rue inondée »</li>
              <li><span class="at-pix-date">2 octobre 2022</span> · actu-buzz.example — « Un requin dans une rue de Miami ?! »</li>
            </ol>
          </div>`,
        q: "Qu'en conclus-tu ?",
        choix: ["L'information est vraie : l'image existe depuis 2019", "C'est un vieux photomontage réutilisé : l'information est fausse", 'Le requin était sans doute à Miami, pas à Marseille', 'On ne peut rien conclure'],
        bon: 1,
        pourquoi: ["Exister depuis longtemps ne rend pas une image vraie : ici, son auteur dit lui-même que c'est un montage.", null, "La page de 2022 a déjà réutilisé l'image avec une autre ville : c'est le même montage, pas un vrai requin.", "Si : la toute première publication présente l'image comme un montage. Retrouver la première publication suffit souvent."],
        expl: "L'image a été publiée en 2019 comme un montage, puis réutilisée pour d'autres villes. C'est une <b>image détournée</b> : sortie de son contexte d'origine pour faire croire autre chose.",
      }, suite),
      (box, suite) => qcm(box, {
        id: 's2-alerte', q: "Quel détail du message aurait dû t'alerter dès le début ?",
        choix: ['La présence d\'une image', '« Partagez avant que ça soit supprimé !!! »', 'Le nom de la ville', "L'heure de publication"],
        bon: 1,
        pourquoi: ["Beaucoup de vraies informations ont une image : ce n'est pas suspect en soi.", null, "Citer une ville n'est pas suspect en soi.", "L'heure ne dit rien de la vérité d'un message."],
        expl: "L'urgence, les points d'exclamation et l'appel à partager vite jouent sur l'émotion pour t'empêcher de vérifier.",
      }, suite),
    ], fin);
  }

  /* =====================================================================
     Étape 3 · arborescence
     ===================================================================== */
  const ARBRES = {
    '5e': { racine: 'Documents',
      dossiers: [['college', 'Collège', null], ['svt', 'SVT', 'college'], ['maths', 'Maths', 'college'], ['francais', 'Français', 'college'], ['photos', 'Photos', null]],
      fichiers: [['svt_schema-coeur.png', 'svt', "Le début du nom, « svt_ », indique la matière."], ['maths_exercices-fractions.pdf', 'maths', "Le début du nom, « maths_ », indique la matière."], ['francais_redaction-conte.odt', 'francais', "Le début du nom, « francais_ », indique la matière."], ['vacances_plage_01.jpg', 'photos', "« vacances_ » et l'extension .jpg : c'est une photo personnelle, pas un cours."], ['svt_releves-germination.csv', 'svt', "Le début du nom, « svt_ », indique la matière."]] },
    '3e': { racine: 'Documents',
      dossiers: [['college', 'Collège', null], ['svt', 'SVT', 'college'], ['maths', 'Maths', 'college'], ['francais', 'Français', 'college'], ['techno', 'Technologie', 'college'], ['photos', 'Photos', null]],
      fichiers: [['svt_tp-levures_2026-11-20.odt', 'svt', "Le début du nom, « svt_ », indique la matière."], ['maths_brevet-blanc_corrige.pdf', 'maths', "Le début du nom, « maths_ », indique la matière."], ['francais_expose-moliere.docx', 'francais', "Le début du nom, « francais_ », indique la matière."], ['techno_croquis-pont.png', 'techno', "« techno_ » : c'est un fichier de technologie."], ['vacances_plage_2026-07-14.jpg', 'photos', "« vacances_ » et l'extension .jpg : c'est une photo personnelle, pas un cours."], ['maths_sondage-classe.csv', 'maths', "Le début du nom, « maths_ », indique la matière."]] },
    '2de': { racine: 'Documents',
      dossiers: [['lycee', 'Lycée', null], ['svt', 'SVT', 'lycee'], ['svt-cours', 'Cours', 'svt'], ['svt-tp', 'TP', 'svt'], ['pc', 'Physique-chimie', 'lycee'], ['maths', 'Maths', 'lycee'], ['francais', 'Français', 'lycee'], ['photos', 'Photos', null]],
      fichiers: [['svt_cours_cellule.pdf', 'svt-cours', "« svt_cours_ » : un cours de SVT."], ['svt_tp_mesures-respiration.csv', 'svt-tp', "« svt_tp_ » : des mesures prises en TP de SVT."], ['svt_cours_schema-mitose.png', 'svt-cours', "« svt_cours_ » : un schéma du cours de SVT."], ['pc_tp_compte-rendu-titrage.odt', 'pc', "« pc_ » : physique-chimie."], ['maths_fonctions_exercices.pdf', 'maths', "Le début du nom, « maths_ », indique la matière."], ['francais_dissertation-plan.docx', 'francais', "Le début du nom, « francais_ », indique la matière."], ['vacances_montagne_2026-08-02.jpg', 'photos', "« vacances_ » et l'extension .jpg : c'est une photo personnelle, pas un cours."]] },
  };
  const EXT = {
    pdf: "l'extension .pdf dit que c'est un document figé, prêt à lire ou imprimer",
    odt: "l'extension .odt dit que c'est un texte LibreOffice Writer",
    docx: "l'extension .docx dit que c'est un texte Microsoft Word",
    png: "l'extension .png dit que c'est une image nette, comme un schéma",
    jpg: "l'extension .jpg dit que c'est une photo",
    csv: "l'extension .csv dit que c'est un tableau de données",
  };
  const extDe = (nom) => (nom.match(/\.([a-z0-9]+)$/i) || ['', ''])[1].toLowerCase();

  function etape3(corps, fin) {
    enchainer(corps, [rangement, (box, suite) => qcm(box, {
      id: 's3-espace', q: 'Ton exposé de groupe doit être modifié par tes trois camarades, chacun depuis chez lui. Où l\'enregistrer ?',
      choix: ['Sur le disque de ton ordinateur', 'Sur ta clé USB', 'Dans un espace de stockage en ligne partagé, comme celui de ton ENT', 'En pièce jointe d\'un message : chacun garde sa copie'],
      bon: 2,
      pourquoi: ["Ton ordinateur n'est accessible qu'à toi : tes camarades ne pourront pas ouvrir le fichier de chez eux.", "Une clé USB n'est qu'à un endroit à la fois, et elle se perd facilement.", null, "Chacun modifierait sa propre copie : vous auriez quatre versions différentes à rassembler."],
      expl: "Un espace en ligne partagé garde un seul fichier, ouvert à ceux à qui tu donnes l'accès. C'est aussi une copie hors de ton ordinateur.",
    }, suite)], fin);
  }

  function rangement(box, suite) {
    const arbre = ARBRES[CLASSE];
    const D = {}; arbre.dossiers.forEach(([id, nom, parent]) => { D[id] = { id, nom, parent }; });
    const ordre = [];
    (function parcours(parent, prof) { arbre.dossiers.filter((d) => d[2] === parent).forEach(([id]) => { ordre.push([id, prof]); parcours(id, prof + 1); }); })(null, 0);
    const chemin = (id) => { const out = []; let d = D[id]; while (d) { out.unshift(d.nom); d = D[d.parent]; } return [arbre.racine, ...out].join(' › '); };
    const ancetre = (a, b) => { let d = D[b] && D[b].parent; while (d) { if (d === a) return true; d = D[d].parent; } return false; };
    const F = arbre.fichiers.map(([nom, dest, ind]) => ({ nom, dest, ind }));
    box.innerHTML = `
      <div class="at-pix-carte">
        <h3 class="at-pix-h3">Défi · range les ${F.length} fichiers</h3>
        <div class="at-pix-rangement">
          <div>
            <p class="at-pix-petit">Fichiers à ranger</p>
            <div class="at-pix-fichiers" role="group" aria-label="Fichiers à ranger">
              ${F.map((f, i) => { const x = extDe(f.nom); return `<button type="button" class="at-pix-fichier" data-f="${i}" aria-pressed="false"><span class="at-pix-badge-ext at-pix-x-${x}" aria-hidden="true">${x.toUpperCase()}</span><span class="at-pix-fnom">${f.nom}</span></button>`; }).join('')}
            </div>
          </div>
          <div class="at-pix-arbre" role="group" aria-label="Dossiers">
            <p class="at-pix-racine"><span aria-hidden="true">🗂️</span> ${arbre.racine}</p>
            ${ordre.map(([id, prof]) => `<div class="at-pix-noeud" style="--p:${prof}"><button type="button" class="at-pix-dossier" data-d="${id}"><span aria-hidden="true">📁</span> ${D[id].nom}<span class="at-pix-nb" data-nb="${id}"></span></button><ul class="at-pix-contenu" data-c="${id}"></ul></div>`).join('')}
          </div>
        </div>
        <div class="commentaire" aria-live="polite">Choisis un fichier, puis clique sur le dossier où il doit aller. Tu peux aussi le faire glisser.</div>
      </div>`;
    const fbk = box.querySelector('.commentaire'), zoneF = box.querySelector('.at-pix-fichiers'), zoneD = box.querySelector('.at-pix-arbre');
    const place = {}, essais = {};
    let sel = null;
    const marquer = () => zoneF.querySelectorAll('[data-f]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.f === sel)));

    function poser(i, did) {
      const f = F[i]; if (place[i]) return;
      essais[i] = (essais[i] || 0) + 1;
      if (did === f.dest) {
        place[i] = true; sel = null;
        noter('s3-f' + i, essais[i] === 1); reussite('s3-f' + i, 5);
        const b = zoneF.querySelector(`[data-f="${i}"]`); b.classList.add('fait'); b.disabled = true; b.setAttribute('aria-pressed', 'false');
        const ul = zoneD.querySelector(`[data-c="${did}"]`); ul.insertAdjacentHTML('beforeend', `<li>${f.nom}</li>`);
        const n = ul.children.length; zoneD.querySelector(`[data-nb="${did}"]`).textContent = ` · ${n} fichier${n > 1 ? 's' : ''}`;
        const reste = F.length - Object.keys(place).length;
        dire(fbk, `<b>Bien rangé.</b> ${chemin(did)}. Le nom dit la matière, ${EXT[extDe(f.nom)] || "l'extension dit le format"}. ${reste ? `Encore ${reste} fichier${reste > 1 ? 's' : ''}.` : ''}`, 'bon');
        marquer();
        if (!reste) { dire(fbk, `<b>Tout est rangé !</b> Avec des noms clairs et des dossiers par matière, chaque fichier se retrouve en quelques secondes.`, 'bon'); suite(); }
        else { const prochain = zoneF.querySelector('[data-f]:not(.fait)'); if (prochain && document.activeElement === document.body) prochain.focus(); }
        return;
      }
      if (ancetre(did, f.dest)) dire(fbk, `<b>Presque.</b> « ${f.nom} » a sa place dans ${D[did].nom}, mais range-le plus précisément : ouvre un de ses sous-dossiers. ${f.ind}`, 'faux');
      else dire(fbk, `<b>Pas ici.</b> Le dossier ${D[did].nom} ne correspond pas à « ${f.nom} ». ${f.ind}`, 'faux');
    }

    zoneF.addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]'); if (!b || b.classList.contains('fait')) return;
      const i = +b.dataset.f; sel = sel === i ? null : i; marquer();
      if (sel !== null) dire(fbk, `Fichier choisi : <b>${F[i].nom}</b>. Clique maintenant sur son dossier.`);
    });
    zoneD.addEventListener('click', (e) => {
      const b = e.target.closest('[data-d]'); if (!b) return;
      if (sel === null) { dire(fbk, `Dossier ${D[b.dataset.d].nom}. Choisis d'abord un fichier à gauche, puis clique sur ce dossier.`); return; }
      poser(sel, b.dataset.d);
    });

    /* glisser-déposer (souris, doigt, stylet) : même règle que le clic */
    let g = null, ignorer = false;
    zoneF.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-f]'); if (!b || b.classList.contains('fait') || e.button > 0) return;
      g = { i: +b.dataset.f, b, x0: e.clientX, y0: e.clientY, fant: null, cible: null };
      try { b.setPointerCapture(e.pointerId); } catch (_) { /* rien */ }
    });
    zoneF.addEventListener('pointermove', (e) => {
      if (!g) return;
      if (!g.fant) {
        if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 8) return;
        g.fant = el('div', 'at-pix-fantome', esc(F[g.i].nom)); g.fant.setAttribute('aria-hidden', 'true');
        document.body.appendChild(g.fant);
      }
      g.fant.style.transform = `translate(${e.clientX + 8}px, ${e.clientY + 8}px)`;
      g.fant.style.visibility = 'hidden';
      const sous = document.elementFromPoint(e.clientX, e.clientY);
      g.fant.style.visibility = '';
      const d = sous && sous.closest && sous.closest('[data-d]');
      if (g.cible && g.cible !== d) g.cible.classList.remove('cible');
      if (d && box.contains(d)) d.classList.add('cible');
      g.cible = d && box.contains(d) ? d : null;
    });
    const finG = (e) => {
      if (!g) return;
      const x = g; g = null;
      if (!x.fant) return;
      x.fant.remove(); ignorer = true; setTimeout(() => { ignorer = false; }, 0);
      if (x.cible) { x.cible.classList.remove('cible'); if (e.type === 'pointerup') poser(x.i, x.cible.dataset.d); }
    };
    zoneF.addEventListener('pointerup', finG);
    zoneF.addEventListener('pointercancel', finG);
    zoneF.addEventListener('click', (e) => { if (ignorer) e.stopImmediatePropagation(); }, true);
  }

  /* =====================================================================
     Étape 4 · nommer, formats, sauvegarde
     ===================================================================== */
  const FMT = ['.pdf', '.docx', '.odt', '.png', '.jpg', '.csv'];
  const FMT_DESC = {
    '.pdf': "document figé : il s'affiche pareil sur tous les appareils et se modifie difficilement.",
    '.docx': 'texte modifiable, au format du logiciel Microsoft Word.',
    '.odt': 'texte modifiable, au format ouvert OpenDocument, celui de LibreOffice Writer.',
    '.png': 'image compressée sans perte : le texte reste net, la transparence est possible. Idéal pour les captures et les schémas.',
    '.jpg': 'image compressée avec perte : fichier léger, idéal pour les photos ; un texte fin peut devenir flou.',
    '.csv': 'tableau en texte brut, valeurs séparées par des virgules ou des points-virgules : il s\'ouvre dans tous les tableurs.',
  };
  const SCENARIOS = [
    { id: 'pdf', q: "Envoyer ton exposé terminé pour qu'il s'affiche pareil chez tout le monde, sans être modifié.", bon: '.pdf', besoin: "Ici, il faut un document figé qui s'affiche pareil partout." },
    { id: 'jpg', q: 'Envoyer une photo de vacances prise au téléphone, en gardant un fichier léger.', bon: '.jpg', besoin: 'Ici, c\'est une photo, et on veut un fichier léger.' },
    { id: 'png', q: "Enregistrer la capture d'écran d'un schéma dont le texte doit rester bien net.", bon: '.png', besoin: 'Ici, c\'est une image avec du texte fin, qui doit rester net.' },
    { id: 'csv', q: "Partager un tableau de mesures pour qu'il s'ouvre dans n'importe quel tableur.", bon: '.csv', besoin: "Ici, ce sont des données en tableau, à ouvrir partout." },
    { id: 'odt', q: 'Écrire un texte que tu modifieras ensuite avec LibreOffice Writer.', bon: '.odt', besoin: 'Ici, le texte doit rester modifiable dans LibreOffice Writer.' },
    { id: 'docx', q: "Rendre un texte modifiable à quelqu'un qui travaille avec Microsoft Word.", bon: '.docx', besoin: 'Ici, le texte doit rester modifiable dans Microsoft Word.' },
  ];
  const SC_CLASSE = { '5e': ['pdf', 'jpg', 'csv', 'odt'], '3e': ['pdf', 'jpg', 'png', 'csv', 'odt'], '2de': ['pdf', 'jpg', 'png', 'csv', 'odt', 'docx'] };

  function etape4(corps, fin) {
    const scs = SC_CLASSE[CLASSE].map((id) => SCENARIOS.find((s) => s.id === id));
    const blocs = [nommage];
    scs.forEach((s, i) => blocs.push((box, suite) => qcm(box, {
      id: 's4-fmt-' + s.id, classe: 'at-pix-fmt',
      avant: i === 0 ? '<h3 class="at-pix-h3">Défi · le bon format</h3>' : '',
      q: `Format ${i + 1} / ${scs.length} · ${s.q}`,
      choix: FMT.map((f) => `<b>${f}</b>`),
      bon: FMT.indexOf(s.bon),
      pourquoi: FMT.map((f) => (f === s.bon ? null : `Le <b>${f}</b> : ${FMT_DESC[f]} ${s.besoin}`)),
      expl: `Le <b>${s.bon}</b> : ${FMT_DESC[s.bon]}`,
    }, suite)));
    blocs.push((box, suite) => qcm(box, {
      id: 's4-sauv', avant: '<h3 class="at-pix-h3">Défi · sauvegarde et versions</h3>',
      q: "Ton exposé n'existe que sur ta clé USB. Comment éviter de le perdre ?",
      choix: ['Le renommer « IMPORTANT »', "En garder au moins une autre copie, sur un autre support (ordinateur, espace en ligne de l'ENT…)", 'Enregistrer plus souvent sur la même clé', 'Le mettre dans la corbeille pour le retrouver facilement'],
      bon: 1,
      pourquoi: ["Un nom ne protège de rien : si la clé est perdue ou abîmée, le fichier disparaît quand même.", null, "Enregistrer souvent est utile, mais si la clé casse, tout est perdu d'un coup.", "La corbeille sert à supprimer : quand on la vide, le fichier disparaît."],
      expl: "Une sauvegarde, c'est une <b>copie ailleurs</b>. Si un support casse ou se perd, l'autre copie te sauve." + (N2DE ? " On conseille souvent la règle « 3-2-1 » : 3 copies, sur 2 supports différents, dont 1 hors de chez soi." : ''),
    }, suite));
    blocs.push((box, suite) => qcm(box, {
      id: 's4-version', q: "Tu veux retravailler ton exposé tout en gardant l'ancienne version. Que fais-tu ?",
      choix: ['« Enregistrer » (Ctrl + S) par-dessus', 'Supprimer l\'ancienne version pour ne pas confondre', '« Enregistrer sous » avec un nouveau nom, par exemple …_v2.odt', 'Copier tout le texte dans un message'],
      bon: 2,
      pourquoi: ["« Enregistrer » remplace l'ancien fichier : l'ancienne version est perdue.", "Si la nouvelle version ne te plaît pas, tu ne pourras plus revenir en arrière.", null, "Un message n'est pas un rangement : tu ne retrouveras plus le bon fichier."],
      expl: "« Enregistrer sous » crée un <b>nouveau fichier</b> et laisse l'ancien intact. Un numéro de version (v1, v2…) ou une date dit lequel est le plus récent.",
    }, suite));
    enchainer(corps, blocs, fin);
  }

  function nommage(box, suite) {
    const regles = [
      { id: 'sujet', txt: 'Dit de quoi il s\'agit : la matière (svt) et le sujet (levures)', test: (v) => norm(v).includes('svt') && /levure/.test(norm(v)),
        expl: "Un nom comme « Document1 » ne dit rien : dans un mois, tu ne sauras plus ce qu'il contient. Mets la matière et le sujet." },
      { id: 'espace', txt: 'Aucune espace : remplace-les par - ou _', test: (v) => v.length > 0 && !/\s/.test(v),
        expl: "Les espaces marchent sur ton ordinateur, mais elles deviennent « %20 » dans une adresse web et gênent certains logiciels. Utilise - ou _." },
      { id: 'interdit', txt: 'Aucun caractère interdit : / \\ : * ? " < > |', test: (v) => v.length > 0 && !/[/\\:*?"<>|]/.test(v),
        expl: "Windows refuse ces caractères dans un nom de fichier : l'enregistrement échouerait." },
      { id: 'ext', txt: 'Se termine par l\'extension .odt', test: (v) => /[^.]\.odt$/i.test(v) && !/\.odt\.odt$/i.test(v),
        expl: "L'extension dit le format et le logiciel qui ouvre le fichier : LibreOffice Writer enregistre en .odt, à la toute fin du nom." },
    ];
    if (!N5) regles.push({ id: 'date', txt: 'Contient la date au format AAAA-MM-JJ (année-mois-jour)', test: (v) => /(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/.test(v),
      expl: "Écrite AAAA-MM-JJ (par exemple 2026-11-26), la date range les fichiers dans l'ordre chronologique quand on les trie par nom." });
    if (N2DE) regles.push({ id: 'version', txt: 'Indique la version : v2', test: (v) => /(^|[^a-z0-9])v0?2(?![0-9])/i.test(v),
      expl: "Sans numéro de version, impossible de savoir quel fichier est le plus récent." });
    const auj = new Date(), iso = `${auj.getFullYear()}-${String(auj.getMonth() + 1).padStart(2, '0')}-${String(auj.getDate()).padStart(2, '0')}`;
    const scen = `Tu as fini ton <b>compte rendu de TP de SVT sur les levures</b>, écrit avec LibreOffice Writer.` +
      (N5 ? '' : ` Tu l'as terminé aujourd'hui (${iso}).`) + (N2DE ? " C'est ta <b>deuxième version</b>." : '') + ' Donne-lui un bon nom.';
    box.innerHTML = `
      <article class="q at-pix-q">
        <h3>Défi · donne un bon nom à ton fichier</h3>
        <p class="at-pix-texte">${scen}</p>
        <label class="at-pix-petit" for="at-pix-nom">Nom du fichier</label>
        <div class="at-pix-recherche">
          <input id="at-pix-nom" class="at-pix-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Document1.odt">
          <button type="button" class="btn p" data-enregistrer>Enregistrer</button>
        </div>
        <ul class="at-pix-regles">${regles.map((r) => `<li data-r="${r.id}"><span class="at-pix-coche" aria-hidden="true">○</span><span>${esc(r.txt)}</span></li>`).join('')}</ul>
        <div class="commentaire" aria-live="polite">Tape un nom : la liste se coche au fur et à mesure.</div>
        <details><summary>En savoir plus</summary><div>Les accents fonctionnent sur les systèmes récents, mais certains logiciels ou sites les affichent mal : beaucoup de gens les évitent. Garde des noms courts et clairs : matière, sujet, date, version.</div></details>
      </article>`;
    const inp = box.querySelector('#at-pix-nom'), fbk = box.querySelector('.commentaire');
    let essais = 0, fini = false;
    const maj = () => {
      const v = inp.value.trim();
      regles.forEach((r) => {
        const li = box.querySelector(`[data-r="${r.id}"]`), ok = r.test(v);
        li.classList.toggle('ok', ok); li.querySelector('.at-pix-coche').textContent = ok ? '✓' : '○';
      });
    };
    inp.addEventListener('input', maj);
    const enregistrer = () => {
      if (fini) return;
      const v = inp.value.trim();
      if (!v) { dire(fbk, 'Tape d\'abord un nom de fichier.', 'faux'); return; }
      essais++;
      const ko = regles.filter((r) => !r.test(v));
      if (ko.length) {
        noter('s4-nom', false);
        dire(fbk, `<b>Pas encore.</b> « ${esc(v)} » : ${ko.map((r) => r.expl).join(' ')}`, 'faux');
        return;
      }
      fini = true;
      noter('s4-nom', essais === 1); reussite('s4-nom', 10);
      inp.readOnly = true;
      const ex = `${N5 ? '' : iso + '_'}svt_tp-levures${N2DE ? '_v2' : ''}.odt`;
      dire(fbk, `<b>Bon nom !</b> « ${esc(v)} » dit ce qu'il contient, passe partout et s'ouvre avec le bon logiciel. Autre exemple possible : <code>${ex}</code>.`, 'bon');
      suite();
    };
    box.querySelector('[data-enregistrer]').addEventListener('click', enregistrer);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); enregistrer(); } });
  }

  /* =====================================================================
     Tableur simulé (étapes 5 et 6) : tri, filtres, sélection, formules
     ===================================================================== */
  const METEO = [
    ['Lundi', 4, 11, 0, 'soleil'], ['Mardi', 6, 12, 3.5, 'pluie'], ['Mercredi', 7, 9, 12, 'pluie'], ['Jeudi', 3, 13, 0, 'nuages'],
    ['Vendredi', 2, 14, 0, 'soleil'], ['Samedi', 5, 8, 6.5, 'pluie'], ['Dimanche', 1, 10, 0, 'nuages'],
  ];
  const ENTETES = ['Jour', 'T min (°C)', 'T max (°C)', 'Pluie (mm)', 'Ciel'];
  const NOMS_COL = ['Jour', 'T min', 'T max', 'Pluie', 'Ciel'];
  const LET = ['A', 'B', 'C', 'D', 'E'];
  const colonne = (c) => METEO.map((r) => r[c]);

  /** Évalue une formule (=SOMME(D2:D8), =C2+C3, =MAX(C2:C8)-MIN(B2:B8)…) sans eval : petit analyseur. */
  function evaluer(src, lire, soi, maxLigne) {
    const info = { refs: [], fns: [], plages: [] };
    const s = String(src).trim();
    if (s[0] !== '=') return Object.assign(info, { err: 'egal' });
    const t = [];
    let i = 1;
    while (i < s.length) {
      const reste = s.slice(i);
      let m;
      if (/^\s/.test(reste)) { i++; continue; }
      if ((m = /^\d+(?:[.,]\d+)?/.exec(reste))) { t.push({ k: 'n', v: parseFloat(m[0].replace(',', '.')) }); i += m[0].length; continue; }
      if ((m = /^\$?([A-Za-z]{1,2})\$?(\d{1,3})(?![A-Za-z0-9_(])/.exec(reste))) { t.push({ k: 'r', c: m[1].toUpperCase(), l: +m[2] }); i += m[0].length; continue; }
      if ((m = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_.]*/.exec(reste))) { t.push({ k: 'f', v: m[0] }); i += m[0].length; continue; }
      if ('+-*/();:,'.includes(reste[0])) { t.push({ k: 'o', v: reste[0] }); i++; continue; }
      return Object.assign(info, { err: 'syntaxe' });
    }
    let p = 0;
    const voir = () => t[p], suivant = () => t[p++];
    const attendre = (v) => { const x = suivant(); if (!x || x.v !== v) throw { code: 'syntaxe' }; };
    const num = (v) => { if (typeof v === 'number') return v; if (v === '') return 0; throw { code: 'valeur' }; };
    const adresse = (x) => {
      const c = LET.indexOf(x.c);
      if (c < 0 || x.l < 1 || x.l > maxLigne) throw { code: 'ref' };
      const a = x.c + x.l;
      if (a === soi) throw { code: 'circulaire' };
      info.refs.push(a);
      return a;
    };
    const plage = (x, y) => {
      const c1 = Math.min(LET.indexOf(x.c), LET.indexOf(y.c)), c2 = Math.max(LET.indexOf(x.c), LET.indexOf(y.c));
      const l1 = Math.min(x.l, y.l), l2 = Math.max(x.l, y.l);
      if (c1 < 0 || l1 < 1 || l2 > maxLigne) throw { code: 'ref' };
      info.plages.push({ c1, c2, l1, l2 });
      const vals = [];
      for (let c = c1; c <= c2; c++) for (let l = l1; l <= l2; l++) vals.push(lire(adresse({ c: LET[c], l })));
      return vals;
    };
    const FN = {
      SOMME: (v) => v.reduce((a, b) => a + b, 0),
      MOYENNE: (v) => { if (!v.length) throw { code: 'div0' }; return v.reduce((a, b) => a + b, 0) / v.length; },
      MIN: (v) => (v.length ? Math.min(...v) : 0),
      MAX: (v) => (v.length ? Math.max(...v) : 0),
      NB: (v) => v.length,
    };
    const ANGLAIS = { SUM: 'SOMME', AVERAGE: 'MOYENNE', MEAN: 'MOYENNE', COUNT: 'NB' };
    function expr() { let v = terme(); while (voir() && (voir().v === '+' || voir().v === '-')) { const o = suivant().v, w = terme(); v = o === '+' ? num(v) + num(w) : num(v) - num(w); } return v; }
    function terme() { let v = facteur(); while (voir() && (voir().v === '*' || voir().v === '/')) { const o = suivant().v, w = facteur(); if (o === '/') { if (num(w) === 0) throw { code: 'div0' }; v = num(v) / num(w); } else v = num(v) * num(w); } return v; }
    function argument() {
      const x = voir();
      if (x && x.k === 'r' && t[p + 1] && t[p + 1].v === ':') { suivant(); suivant(); const y = suivant(); if (!y || y.k !== 'r') throw { code: 'syntaxe' }; return plage(x, y); }
      return [expr()];
    }
    function facteur() {
      const x = suivant();
      if (!x) throw { code: 'syntaxe' };
      if (x.v === '-') return -num(facteur());
      if (x.v === '+') return num(facteur());
      if (x.k === 'n') return x.v;
      if (x.k === 'r') { if (voir() && voir().v === ':') throw { code: 'plage' }; return lire(adresse(x)); }
      if (x.k === 'f') {
        const nom = x.v.toUpperCase();
        if (/^[A-Za-z]{1,2}$/.test(x.v) && (!voir() || voir().v !== '(')) throw { code: 'syntaxe' };
        if (!voir() || voir().v !== '(') throw { code: 'nom', nom: x.v };
        if (ANGLAIS[nom]) throw { code: 'anglais', nom, fr: ANGLAIS[nom] };
        if (!FN[nom]) throw { code: 'nom', nom: x.v };
        attendre('(');
        info.fns.push(nom);
        const args = [];
        if (voir() && voir().v !== ')') { args.push(...argument()); while (voir() && (voir().v === ';' || voir().v === ',')) { suivant(); args.push(...argument()); } }
        attendre(')');
        return FN[nom](args.filter((v) => typeof v === 'number'));
      }
      if (x.v === '(') { const v = expr(); attendre(')'); return v; }
      throw { code: 'syntaxe' };
    }
    try {
      if (!t.length) throw { code: 'syntaxe' };
      const val = expr();
      if (p < t.length) throw { code: 'syntaxe' };
      return Object.assign(info, { val });
    } catch (e) {
      if (e && e.code) return Object.assign(info, { err: e.code, nom: e.nom, fr: e.fr });
      throw e;
    }
  }
  const AFF_ERR = { syntaxe: '#ERREUR', plage: '#ERREUR', nom: '#NOM?', anglais: '#NOM?', div0: '#DIV/0!', valeur: '#VALEUR!', ref: '#REF!', circulaire: '#REF!' };

  function tableur(box, o) {
    const T = { lignes: METEO.map((r) => r.slice()), tri: null, filtres: { ciel: 'tous', pluie: 'tous' }, sel: null, formules: {}, cible: null, extras: o.extras || [] };
    const maxLigne = T.extras.length ? Math.max(...T.extras.map((x) => x.ligne)) : METEO.length + 1;
    box.insertAdjacentHTML('beforeend', `
      <div class="at-pix-tableur">
        <p class="at-pix-petit">Station météo du collège · une semaine (données fictives)</p>
        ${o.outils ? `<div class="at-pix-outils">
          <label>Filtre Ciel <select data-filtre="ciel"><option value="tous">tous</option><option value="soleil">soleil</option><option value="nuages">nuages</option><option value="pluie">pluie</option></select></label>
          <label>Filtre Pluie <select data-filtre="pluie"><option value="tous">tous les jours</option><option value="pluie">avec pluie (&gt; 0)</option><option value="sec">sans pluie (= 0)</option></select></label>
          <button type="button" class="btn s small" data-origine>Ordre d'origine</button>
        </div>` : ''}
        <div class="at-pix-fxbar">
          <span class="at-pix-nomcase" title="Cellule sélectionnée">—</span><span class="at-pix-fxlogo" aria-hidden="true">fx</span>
          <input class="at-pix-fx" type="text" aria-label="Barre de formule" autocomplete="off" autocapitalize="off" spellcheck="false" ${o.formule ? 'placeholder="=…"' : 'readonly placeholder="Clique sur une cellule"'}>
          ${o.formule ? '<button type="button" class="btn p small" data-valider>Valider</button>' : ''}
        </div>
        <div class="at-pix-defil"><table class="at-pix-grille"><thead><tr><th class="at-pix-coin" scope="col"><span class="sr">Lignes</span></th>${LET.map((l) => `<th scope="col">${l}</th>`).join('')}</tr></thead><tbody></tbody></table></div>
        <p class="sr" aria-live="polite" data-annonce></p>
      </div>`);
    const racine = box.lastElementChild;
    const tbody = racine.querySelector('tbody'), nomcase = racine.querySelector('.at-pix-nomcase'), fx = racine.querySelector('.at-pix-fx'), annonce = racine.querySelector('[data-annonce]');

    function lire(a) {
      const m = /^([A-E])(\d+)$/.exec(a); if (!m) return '';
      const c = LET.indexOf(m[1]), l = +m[2];
      if (l === 1) return ENTETES[c];
      if (l >= 2 && l <= METEO.length + 1) return T.lignes[l - 2][c];
      const ex = T.extras.find((x) => x.ligne === l);
      if (ex && c === 0) return ex.label;
      const f = T.formules[a];
      if (f) return f.err ? (f.err === 'egal' ? f.src : '') : f.val;
      return '';
    }
    const affiche = (a) => { const f = T.formules[a]; if (f) return f.err ? (f.err === 'egal' ? f.src : AFF_ERR[f.err]) : fr(f.val); const v = lire(a); return typeof v === 'number' ? fr(v) : v; };
    const visible = (r) => (T.filtres.ciel === 'tous' || r[4] === T.filtres.ciel) && (T.filtres.pluie === 'tous' || (T.filtres.pluie === 'pluie' ? r[3] > 0 : r[3] === 0));
    const cellule = (a) => { const v = lire(a); return `<td><button type="button" class="at-pix-cell${typeof v === 'number' || T.formules[a] ? ' nb' : ''}${T.sel === a ? ' sel' : ''}${T.cible === a ? ' cible' : ''}" data-a="${a}" aria-label="${a} : ${esc(affiche(a)) || 'vide'}">${esc(affiche(a))}</button></td>`; };

    function rendre() {
      let h = `<tr><th scope="row">1</th>${ENTETES.map((e, c) => {
        if (!o.tri) return `<td class="at-pix-ent"><span>${e}</span></td>`;
        const etat = T.tri && T.tri.c === c ? (T.tri.sens > 0 ? 'croissant' : 'décroissant') : '';
        return `<td class="at-pix-ent"><button type="button" class="at-pix-tri" data-tri="${c}" aria-label="Trier la colonne ${NOMS_COL[c]}${etat ? ' (tri ' + etat + ' en cours)' : ''}">${e}<span aria-hidden="true">${etat === 'croissant' ? '▲' : etat === 'décroissant' ? '▼' : '⇅'}</span></button></td>`;
      }).join('')}</tr>`;
      T.lignes.forEach((r, i) => { const l = i + 2; h += `<tr${visible(r) ? '' : ' hidden'}><th scope="row">${l}</th>${LET.map((L) => cellule(L + l)).join('')}</tr>`; });
      if (T.extras.length) for (let l = METEO.length + 2; l <= maxLigne; l++) h += `<tr class="at-pix-extra"><th scope="row">${l}</th>${LET.map((L) => cellule(L + l)).join('')}</tr>`;
      tbody.innerHTML = h;
    }
    function choisir(a, annoncer) {
      T.sel = a;
      nomcase.textContent = a || '—';
      fx.value = a ? (T.formules[a] ? T.formules[a].src : (lire(a) === '' ? '' : (typeof lire(a) === 'number' ? fr(lire(a)) : lire(a)))) : '';
      tbody.querySelectorAll('.at-pix-cell.sel').forEach((b) => b.classList.remove('sel'));
      const b = a && tbody.querySelector(`[data-a="${a}"]`); if (b) b.classList.add('sel');
      if (annoncer && a) annonce.textContent = `Cellule ${a} : ${affiche(a) || 'vide'}`;
      if (o.onSelect) o.onSelect(a);
    }
    tbody.addEventListener('click', (e) => {
      const tri = e.target.closest('[data-tri]');
      if (tri) {
        const c = +tri.dataset.tri;
        T.tri = T.tri && T.tri.c === c ? { c, sens: -T.tri.sens } : { c, sens: 1 };
        const s = T.tri.sens;
        T.lignes.sort((x, y) => (typeof x[c] === 'number' ? (x[c] - y[c]) : String(x[c]).localeCompare(String(y[c]), 'fr')) * s);
        rendre(); choisir(T.sel, false);
        annonce.textContent = `Colonne ${NOMS_COL[c]} triée par ordre ${s > 0 ? 'croissant' : 'décroissant'}.`;
        const btn = tbody.querySelector(`[data-tri="${c}"]`); if (btn) btn.focus();
        if (o.onChange) o.onChange();
        return;
      }
      const b = e.target.closest('[data-a]'); if (b) choisir(b.dataset.a, true);
    });
    if (o.outils) {
      racine.querySelectorAll('[data-filtre]').forEach((s) => s.addEventListener('change', () => {
        T.filtres[s.dataset.filtre] = s.value; rendre(); choisir(T.sel, false);
        const n = T.lignes.filter(visible).length;
        annonce.textContent = `Filtre appliqué : ${n} ligne${n > 1 ? 's' : ''} affichée${n > 1 ? 's' : ''}.`;
        if (o.onChange) o.onChange();
      }));
      racine.querySelector('[data-origine]').addEventListener('click', () => {
        T.lignes = METEO.map((r) => r.slice()); T.tri = null; T.filtres = { ciel: 'tous', pluie: 'tous' };
        racine.querySelectorAll('[data-filtre]').forEach((s) => { s.value = 'tous'; });
        rendre(); choisir(T.sel, false); annonce.textContent = "Tableau remis dans l'ordre d'origine, sans filtre.";
        if (o.onChange) o.onChange();
      });
    }
    function valider() {
      if (!o.onFormule) return;
      o.onFormule(T.sel, fx.value);
    }
    if (o.formule) {
      racine.querySelector('[data-valider]').addEventListener('click', valider);
      fx.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); valider(); } });
    }
    rendre();
    return {
      T, lire, affiche, visible, choisir, rendre, fx, racine,
      lignesVisibles: () => T.lignes.map((r, i) => ({ r, l: i + 2 })).filter((x) => visible(x.r)),
      poserFormule(a, src) { const r = evaluer(src, lire, a, maxLigne); T.formules[a] = Object.assign({ src: String(src).trim() }, r); rendre(); choisir(a, false); annonce.textContent = `${a} : ${affiche(a)}`; return r; },
      cibler(a) { T.cible = a; rendre(); choisir(a, false); },
      maxLigne,
    };
  }

  /* ---------- Étape 5 · trier, filtrer, lire ---------- */
  function etape5(corps, fin) {
    const carte = el('div', 'at-pix-carte'); corps.appendChild(carte);
    const zoneDefis = el('div', 'at-pix-defis');
    const tab = tableur(carte, { tri: true, outils: true });
    carte.appendChild(zoneDefis);
    const jourMax = (c, sens) => { const v = colonne(c); const cible = sens > 0 ? Math.min(...v) : Math.max(...v); return METEO.find((r) => r[c] === cible)[0]; };
    const nombre = (s) => { const v = String(s).trim().replace(',', '.').replace(/\s*(°c|°|mm)$/i, ''); return v === '' || isNaN(+v) ? null : +v; };

    function defi(box, d, suite) {
      box.innerHTML = `<div class="at-pix-defi"><h3 class="at-pix-h3">${d.titre}</h3><p class="at-pix-texte">${d.texte}</p>
        ${d.saisie ? `<div class="at-pix-recherche"><label class="sr" for="at-pix-r-${d.id}">${d.saisie}</label><input id="at-pix-r-${d.id}" class="at-pix-input at-pix-rep" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${d.saisie}"><button type="button" class="btn p" data-verifier>Vérifier</button></div>`
                   : '<button type="button" class="btn p" data-verifier>Vérifier</button>'}
        <div class="commentaire" aria-live="polite">${d.aide}</div></div>`;
      const fbk = box.querySelector('.commentaire'), inp = box.querySelector('.at-pix-rep');
      let essais = 0, fini = false;
      const go = () => {
        if (fini) return;
        essais++;
        const r = d.verifier(inp ? inp.value : '');
        if (r !== true) { noter(d.id, false); dire(fbk, `<b>Pas encore.</b> ${r}`, 'faux'); return; }
        fini = true; noter(d.id, essais === 1); reussite(d.id, 10);
        if (inp) inp.readOnly = true;
        dire(fbk, `<b>Exact !</b> ${d.bravo()}`, 'bon');
        suite();
      };
      box.querySelector('[data-verifier]').addEventListener('click', go);
      if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    }
    const ouEst = (val) => {
      const trouve = [];
      tab.T.lignes.forEach((r, i) => r.forEach((v, c) => { if (typeof v === 'number' && v === val) trouve.push(`${LET[c]}${i + 2} (${NOMS_COL[c]} de ${r[0].toLowerCase()})`); }));
      return trouve;
    };

    /* défi 1 : lire */
    const lireD = N5 ? {
      id: 's5-lire', titre: 'Défi 1 · lire une valeur', saisie: 'Ta réponse en °C',
      texte: 'Quelle était la <b>température minimale (T min)</b> du <b>mardi</b> ? Clique sur la cellule pour la lire dans la barre fx, puis tape la valeur.',
      aide: 'Repère la ligne du mardi, puis la colonne T min.',
      verifier: (v) => {
        const n = nombre(v), att = METEO.find((r) => r[0] === 'Mardi')[1];
        if (n === null) return 'Tape un nombre, par exemple 5.';
        if (n === att) return true;
        const ou = ouEst(n);
        return ou.length ? `${fr(n)}, c'est la valeur de ${ou.join(', ')}. La T min est dans la colonne B, celle du mardi sur sa ligne.` : `Aucune cellule ne contient ${fr(n)}. Clique sur la cellule et lis la barre fx.`;
      },
      bravo: () => 'Colonne B (T min), ligne du mardi : 6 °C.',
    } : N2DE ? {
      id: 's5-lire', titre: "Défi 1 · trouver l'adresse d'une cellule", saisie: 'Adresse, ex. A1',
      texte: "Quelle est l'<b>adresse</b> de la cellule qui contient la <b>pluie du mercredi</b> ?",
      aide: "L'adresse, c'est la lettre de la colonne, puis le numéro de la ligne.",
      verifier: (v) => {
        const a = String(v).trim().toUpperCase().replace(/\s+/g, '');
        const i = tab.T.lignes.findIndex((r) => r[0] === 'Mercredi'), att = 'D' + (i + 2);
        if (!/^[A-E]\d{1,2}$/.test(a)) return "Une adresse s'écrit lettre + numéro, par exemple B3.";
        if (a === att) return true;
        if (a === (i + 2) + 'D' || a[0] !== 'D') return `${a} n'est pas dans la colonne Pluie : la pluie est en colonne D.`;
        return `Bonne colonne (D), mais la ligne ${a.slice(1)} n'est pas celle du mercredi : regarde le numéro à gauche de « Mercredi ».`;
      },
      bravo: () => { const i = tab.T.lignes.findIndex((r) => r[0] === 'Mercredi'); return `Colonne D (Pluie), ligne ${i + 2} (mercredi) : D${i + 2}. Elle contient ${fr(tab.T.lignes[i][3])} mm.`; },
    } : {
      id: 's5-lire', titre: 'Défi 1 · lire une cellule', saisie: 'Valeur de C4',
      texte: 'Clique sur la cellule <b>C4</b> : quelle valeur contient-elle ?',
      aide: "C4 = colonne C, ligne 4. Le nom de la cellule s'affiche à gauche de la barre fx.",
      verifier: (v) => {
        const n = nombre(v), att = tab.lire('C4');
        if (n === null) return 'Tape un nombre.';
        if (n === att) return true;
        const ou = ouEst(n);
        return `${ou.length ? `${fr(n)}, c'est la valeur de ${ou[0]}. ` : ''}C4 se lit colonne C (la 3<sup>e</sup>), ligne 4 (numéro à gauche).`;
      },
      bravo: () => `C4 contient ${fr(tab.lire('C4'))} : la T max du ${String(tab.lire('A4')).toLowerCase()}.`,
    };

    /* défi 2 : trier */
    const c2 = N2DE ? 1 : 2, s2 = N2DE ? 1 : -1, jour2 = jourMax(c2, s2);
    const triD = {
      id: 's5-tri', titre: 'Défi 2 · trier',
      texte: N2DE ? 'Trie le tableau pour mettre le <b>jour le plus froid (T min)</b> tout en haut, puis <b>clique sur le nom de ce jour</b>. Vérifie ensuite.'
                  : 'Trie la colonne <b>T max</b> pour mettre le <b>jour le plus chaud</b> tout en haut, puis <b>clique sur le nom de ce jour</b>. Vérifie ensuite.',
      aide: "Clique sur l'en-tête d'une colonne (ligne 1) pour la trier. Un second clic inverse le sens.",
      verifier: () => {
        const tr = tab.T.tri;
        if (!tr) return `Le tableau n'est pas trié. Clique sur l'en-tête « ${ENTETES[c2]} ».`;
        if (tr.c !== c2) return `Tu as trié la colonne ${NOMS_COL[tr.c]}. Ici, il faut trier la colonne ${NOMS_COL[c2]}.`;
        if (tr.sens !== s2) return s2 < 0 ? 'Ton tri est croissant : le plus froid est en haut. Clique encore sur l\'en-tête pour un tri décroissant.' : 'Ton tri est décroissant : le plus chaud est en haut. Clique encore sur l\'en-tête pour un tri croissant.';
        const sel = tab.T.sel;
        if (!sel || sel[0] !== 'A') return 'Le tri est bon. Clique maintenant sur la cellule du jour tout en haut, dans la colonne A (Jour).';
        if (tab.lire(sel) !== jour2) return `Tu as sélectionné ${sel} (${tab.lire(sel)}). Le jour cherché est celui de la ligne 2, juste sous les en-têtes.`;
        return true;
      },
      bravo: () => `${jour2} est en haut : ${N2DE ? 'T min la plus basse' : 'T max la plus haute'} (${fr(METEO.find((r) => r[0] === jour2)[c2])} °C). Trier, c'est le moyen le plus sûr de trouver un maximum ou un minimum.`,
    };

    /* défi 3 : filtrer */
    const pluvieux = METEO.filter((r) => r[3] > 0), secs = METEO.filter((r) => r[3] === 0);
    const minSec = Math.min(...secs.map((r) => r[2]));
    const filtreD = N2DE ? {
      id: 's5-filtre', titre: 'Défi 3 · filtrer pour analyser', saisie: 'Ta réponse en °C',
      texte: 'Affiche <b>seulement les jours sans pluie</b> avec un filtre. Parmi eux, quelle est la <b>T max la plus basse</b> ?',
      aide: 'Utilise le menu « Filtre Pluie ».',
      verifier: (v) => {
        const n = nombre(v);
        if (tab.T.filtres.pluie !== 'sec') return "Le filtre n'est pas le bon : choisis « sans pluie (= 0) » dans le filtre Pluie.";
        if (tab.T.filtres.ciel !== 'tous') return 'Le filtre Ciel cache aussi des jours secs : remets-le sur « tous ».';
        if (n === null) return 'Tape un nombre.';
        if (n === minSec) return true;
        if (n === Math.min(...colonne(2))) return `${fr(n)} °C, c'est la T max d'un jour de pluie (samedi). Les jours de pluie sont masqués : lis seulement les lignes affichées.`;
        return `Regarde la colonne C des ${secs.length} lignes affichées et prends la plus petite valeur.`;
      },
      bravo: () => `${fr(minSec)} °C, le ${secs.find((r) => r[2] === minSec)[0].toLowerCase()}. Le filtre masque des lignes sans les effacer : regarde, des numéros de ligne manquent à gauche.`,
    } : {
      id: 's5-filtre', titre: 'Défi 3 · filtrer', saisie: 'Nombre de jours',
      texte: "Avec un filtre, affiche <b>seulement les jours de pluie</b>. Combien y en a-t-il ?",
      aide: 'Utilise le menu « Filtre Ciel » ou « Filtre Pluie ».',
      verifier: (v) => {
        const n = nombre(v);
        const vis = tab.lignesVisibles();
        const ok = vis.length === pluvieux.length && vis.every((x) => x.r[3] > 0);
        if (!ok) return vis.length === METEO.length ? "Aucun filtre n'est appliqué : choisis « pluie » dans le filtre Ciel, ou « avec pluie » dans le filtre Pluie." : "Le tableau n'affiche pas exactement les jours de pluie : vérifie tes deux filtres.";
        if (n === null) return 'Tape un nombre.';
        if (n === pluvieux.length) return true;
        return `Compte les lignes affichées : il y en a ${vis.length}.`;
      },
      bravo: () => `${pluvieux.length} jours de pluie : ${pluvieux.map((r) => r[0].toLowerCase()).join(', ')}. Les autres lignes sont masquées, pas effacées : regarde, leurs numéros manquent.`,
    };
    enchainer(zoneDefis, [(b, s) => defi(b, lireD, s), (b, s) => defi(b, triD, s), (b, s) => defi(b, filtreD, s)], fin);
  }

  /* ---------- Étape 6 · formules et graphiques ---------- */
  const somme = (c) => colonne(c).reduce((a, b) => a + b, 0);
  const CIBLES = [
    { id: 's6-somme', addr: 'D10', ligne: 10, label: 'Total pluie (mm)', fn: 'SOMME', col: 3,
      consigne: 'En <b>D10</b>, calcule le <b>total de pluie</b> de la semaine avec une formule.',
      attendu: () => somme(3), preuve: () => `${colonne(3).filter((v) => v > 0).map(fr).join(' + ')} = ${fr(somme(3))} mm (les jours sans pluie valent 0).` },
    { id: 's6-moyenne', addr: 'C11', ligne: 11, label: 'Moyenne T max (°C)', fn: 'MOYENNE', col: 2,
      consigne: 'En <b>C11</b>, calcule la <b>moyenne des températures maximales</b> (T max).',
      attendu: () => somme(2) / 7, preuve: () => `(${colonne(2).join(' + ')}) ÷ 7 = ${fr(somme(2))} ÷ 7 = ${fr(somme(2) / 7)} °C.` },
    { id: 's6-ecart', addr: 'C12', ligne: 12, label: 'Écart T max − T min', fn: null, col: null,
      consigne: "En <b>C12</b>, calcule l'<b>écart de la semaine</b> : la T max la plus haute moins la T min la plus basse. Indice : MAX et MIN.",
      attendu: () => Math.max(...colonne(2)) - Math.min(...colonne(1)), preuve: () => `MAX(T max) − MIN(T min) = ${Math.max(...colonne(2))} − ${Math.min(...colonne(1))} = ${fr(Math.max(...colonne(2)) - Math.min(...colonne(1)))} °C.` },
  ];
  const plageCol = (c) => [2, 3, 4, 5, 6, 7, 8].map((l) => LET[c] + l);
  CIBLES.forEach((c) => { c.couvre = c.col !== null ? plageCol(c.col) : plageCol(2).concat(plageCol(1)); });
  const CIBLES_CLASSE = { '5e': ['s6-somme'], '3e': ['s6-somme', 's6-moyenne'], '2de': ['s6-somme', 's6-moyenne', 's6-ecart'] };

  function diagnostic(c, r, src) {
    const s = String(src).trim();
    if (!s) return 'Tape une formule dans la barre fx.';
    if (r.err === 'egal') return 'Une formule commence toujours par le signe <b>=</b>. Sans lui, le tableur garde ton texte tel quel.';
    if (r.err === 'anglais') return `En français, la fonction s'appelle <b>${r.fr}</b> (${r.nom} est son nom en anglais).`;
    if (r.err === 'nom') return `Fonction inconnue : « ${esc(r.nom)} ». Le tableur affiche #NOM?. Utilise SOMME, MOYENNE, MIN ou MAX, suivie de parenthèses.`;
    if (r.err === 'circulaire') return `Ta formule utilise sa propre cellule (${c.addr}) : c'est une référence circulaire, le tableur ne peut pas calculer.`;
    if (r.err === 'ref') return "Une adresse n'existe pas dans ce tableau (colonnes A à E).";
    if (r.err === 'valeur') return "Tu fais un calcul avec une cellule qui contient du texte : le tableur affiche #VALEUR!. Utilise les colonnes de nombres (B, C ou D).";
    if (r.err === 'div0') return 'Division par zéro (#DIV/0!) : ta plage ne contient aucun nombre.';
    if (r.err) return 'Le tableur affiche #ERREUR : vérifie les parenthèses et la plage, écrite avec deux-points, par exemple D2:D8.';
    const att = c.attendu();
    if (typeof r.val !== 'number') return "Ta formule renvoie un texte, pas un nombre. Utilise les cellules de mesures.";
    if (!r.refs.length) return Math.abs(r.val - att) < 1e-9
      ? `Le nombre est juste, mais tu l'as calculé toi-même. Une formule doit <b>utiliser les cellules</b> : si une mesure change, le résultat se recalcule tout seul.`
      : 'Ta formule ne contient que des nombres. Utilise les adresses des cellules, par exemple une plage D2:D8.';
    const oublis = c.couvre.filter((a) => !r.refs.includes(a));
    if (Math.abs(r.val - att) < 1e-9) {
      if (!oublis.length) return true;
      return c.col !== null
        ? `Le résultat tombe juste, mais ta formule oublie ${oublis.join(', ')} : ces cellules valent 0 cette semaine. Si une mesure change, ton calcul sera faux. Prends toute la plage ${LET[c.col]}2:${LET[c.col]}8.`
        : "Le résultat est juste, mais tu as choisi les cellules toi-même. Avec MAX et MIN sur toute la colonne, le tableur trouve seul la plus haute et la plus basse, même si les données changent.";
    }
    const pl = r.plages[0];
    const parts = [`Le tableur a calculé ${fr(r.val)}, ce n'est pas ${c.fn === 'MOYENNE' ? 'la moyenne' : c.fn === 'SOMME' ? 'le total' : "l'écart"} attendu.`];
    if (c.col !== null && pl) {
      if (pl.c1 !== c.col || pl.c2 !== c.col) parts.push(`Ta plage est en colonne ${LET[pl.c1]}${pl.c2 !== pl.c1 ? '–' + LET[pl.c2] : ''} ; les valeurs cherchées (${NOMS_COL[c.col]}) sont en colonne ${LET[c.col]}.`);
      else if (pl.l1 !== 2 || pl.l2 !== 8) parts.push(`Ta plage va de la ligne ${pl.l1} à la ligne ${pl.l2} ; les mesures vont de la ligne 2 à la ligne 8${pl.l1 > 2 || pl.l2 < 8 ? ' : il en manque' : ' : tu en prends trop'}.`);
    }
    if (c.fn === 'MOYENNE' && r.fns.includes('SOMME') && !r.fns.includes('MOYENNE')) parts.push(`Tu as calculé une somme. La moyenne, c'est la somme divisée par le nombre de valeurs : utilise MOYENNE.`);
    if (c.fn === 'SOMME' && r.fns.includes('MOYENNE')) parts.push('Tu as calculé une moyenne. Pour un total, utilise SOMME.');
    if (c.id === 's6-ecart' && Math.abs(r.val - (Math.max(...colonne(2)) - Math.min(...colonne(2)))) < 1e-9) parts.push('Tu as pris le minimum dans la colonne C (T max) : la T min la plus basse est dans la colonne B.');
    if (c.id === 's6-ecart' && Math.abs(r.val + c.attendu()) < 1e-9) parts.push("Tu as fait l'inverse : c'est la plus haute moins la plus basse.");
    return parts.join(' ');
  }

  const GRAPHES = [
    { id: 's6-g1', q: 'Quel graphique pour montrer comment la T max a <b>évolué</b> du lundi au dimanche ?', bon: 0 },
    { id: 's6-g2', q: 'Quel graphique pour <b>comparer</b> la quantité de pluie tombée chaque jour ?', bon: 1 },
    { id: 's6-g3', q: 'Quel graphique pour montrer la <b>part</b> de chaque type de ciel dans la semaine ?', bon: 2 },
  ];
  const GRAPHES_CLASSE = { '5e': ['s6-g1', 's6-g3'], '3e': ['s6-g1', 's6-g2', 's6-g3'], '2de': ['s6-g1', 's6-g2', 's6-g3'] };
  const POURQUOI_G = {
    's6-g1': [null, "Les barres comparent des quantités séparées ; pour suivre une évolution au fil des jours, la courbe montre mieux la tendance.", "Un diagramme circulaire montre les parts d'un tout. Des températures ne se partagent pas comme un gâteau."],
    's6-g2': ["Une courbe suggère une évolution continue entre les jours. Pour comparer des quantités séparées, les barres sont plus lisibles.", null, "Un diagramme circulaire montre des parts d'un tout, pas une comparaison jour par jour : et les jours sans pluie n'y apparaîtraient pas."],
    's6-g3': ["Une courbe relie des points dans l'ordre : utile pour une évolution dans le temps, pas pour des parts.", "Des barres compteraient les jours, mais le diagramme circulaire montre directement la part de chaque ciel dans le total.", null],
  };
  const EXPL_G = {
    's6-g1': "La <b>courbe</b> relie les valeurs dans l'ordre du temps : on voit d'un coup d'œil la montée puis la baisse.",
    's6-g2': "Les <b>barres</b> se comparent par leur hauteur : le jour le plus pluvieux saute aux yeux.",
    's6-g3': "Le <b>diagramme circulaire</b> (en secteurs) montre comment un total se partage : ici, les 7 jours de la semaine.",
  };
  function svgCourbe() {
    const v = colonne(2), mn = Math.min(...v) - 1, mx = Math.max(...v) + 1;
    const pts = v.map((y, i) => [12 + i * 16, 58 - ((y - mn) / (mx - mn)) * 48]);
    return `<svg viewBox="0 0 120 66" aria-hidden="true"><path d="M8 4V60H116" fill="none" stroke="#8A8A90" stroke-width="1.2"/><polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#E07B00" stroke-width="2.4" stroke-linejoin="round"/>${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#B35F00"/>`).join('')}</svg>`;
  }
  function svgBarres() {
    const v = colonne(3), mx = Math.max(...v);
    return `<svg viewBox="0 0 120 66" aria-hidden="true"><path d="M8 4V60H116" fill="none" stroke="#8A8A90" stroke-width="1.2"/>${v.map((y, i) => { const h = (y / mx) * 50; return `<rect x="${12 + i * 15}" y="${60 - h}" width="10" height="${Math.max(h, 0.01)}" rx="1.5" fill="#3D74C9"/>`; }).join('')}</svg>`;
  }
  function svgSecteurs() {
    const types = [['soleil', '#F2A007'], ['nuages', '#8D97A5'], ['pluie', '#3D74C9']];
    const n = METEO.length; let a0 = -Math.PI / 2, h = '';
    types.forEach(([t, coul], i) => {
      const k = METEO.filter((r) => r[4] === t).length; const a1 = a0 + (k / n) * 2 * Math.PI;
      const x0 = 36 + 27 * Math.cos(a0), y0 = 33 + 27 * Math.sin(a0), x1 = 36 + 27 * Math.cos(a1), y1 = 33 + 27 * Math.sin(a1);
      h += `<path d="M36 33L${x0.toFixed(2)} ${y0.toFixed(2)}A27 27 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z" fill="${coul}" stroke="#fff" stroke-width="1.5"/>`;
      h += `<rect x="72" y="${15 + i * 15}" width="8" height="8" rx="2" fill="${coul}"/><text x="83" y="${22.5 + i * 15}" font-size="9" fill="#3A3A3F">${t}</text>`;
      a0 = a1;
    });
    return `<svg viewBox="0 0 120 66" aria-hidden="true">${h}</svg>`;
  }

  function etape6(corps, fin) {
    const cibles = CIBLES.filter((c) => CIBLES_CLASSE[CLASSE].includes(c.id));
    const carte = el('div', 'at-pix-carte'); corps.appendChild(carte);
    const consigne = el('div', 'at-pix-defi'); carte.appendChild(consigne);
    let actif = null, fbk = null, essais = 0, suiteF = null;
    const tab = tableur(carte, {
      formule: true,
      extras: cibles.map((c) => ({ ligne: c.ligne, label: c.label })),
      onFormule: (a, src) => {
        if (!actif) return;
        if (a !== actif.addr) { dire(fbk, `Clique d'abord sur la cellule <b>${actif.addr}</b> (encadrée en pointillés), puis tape ta formule.`, 'faux'); return; }
        if (!String(src).trim()) { dire(fbk, 'Tape une formule dans la barre fx, par exemple =SOMME(…).', 'faux'); return; }
        essais++;
        const r = tab.poserFormule(a, src);
        const d = diagnostic(actif, r, src);
        if (d !== true) { noter(actif.id, false); dire(fbk, `<b>Pas encore.</b> ${d}`, 'faux'); return; }
        noter(actif.id, essais === 1); reussite(actif.id, 10);
        const court = actif.fn && !r.fns.includes(actif.fn) ? ` Ça marche ! Plus court : <code>=${actif.fn}(${LET[actif.col]}2:${LET[actif.col]}8)</code>.` : '';
        dire(fbk, `<b>Exact : ${fr(r.val)}.</b> Le tableur a vraiment calculé : ${actif.preuve()}${court}`, 'bon');
        const c = actif; actif = null; tab.cibler(null); tab.choisir(c.addr, false);
        suiteF();
      },
    });
    const zone = el('div', 'at-pix-defis'); corps.appendChild(zone);
    consigne.innerHTML = `<h3 class="at-pix-h3"></h3><p class="at-pix-texte"></p>
      <details><summary>Coup de pouce : écrire une formule</summary><div><b>=SOMME(B2:B8)</b> additionne les cellules de B2 à B8. Le deux-points veut dire « jusqu'à ». <b>MOYENNE</b>, <b>MIN</b> et <b>MAX</b> s'écrivent pareil. On peut aussi calculer entre deux fonctions : =MAX(…)−MIN(…).</div></details>
      <div class="commentaire" aria-live="polite"></div>`;
    fbk = consigne.querySelector('.commentaire');
    const blocs = cibles.map((c, i) => (box, suite) => {
      actif = c; essais = 0; suiteF = suite;
      consigne.querySelector('h3').textContent = `Formule ${i + 1} / ${cibles.length}`;
      consigne.querySelector('.at-pix-texte').innerHTML = c.consigne;
      const invite = `La cellule <b>${c.addr}</b> est sélectionnée : tape ta formule dans la barre fx, puis Valider (ou Entrée).`;
      if (i === 0) dire(fbk, invite);
      else fbk.insertAdjacentHTML('beforeend', `<span class="at-pix-suivant"><b>Formule suivante.</b> ${invite}</span>`);   // la correction précédente reste lisible
      tab.cibler(c.addr);
      box.remove();
    });
    const graphes = GRAPHES.filter((g) => GRAPHES_CLASSE[CLASSE].includes(g.id));
    const vignettes = [['Courbe', svgCourbe()], ['Barres', svgBarres()], ['Diagramme circulaire', svgSecteurs()]];
    graphes.forEach((g, i) => blocs.push((box, suite) => qcm(box, {
      id: g.id, classe: 'at-pix-graphes',
      avant: i === 0 ? '<h3 class="at-pix-h3">Défi · choisir le bon graphique</h3><p class="at-pix-texte">Les trois graphiques sont tracés à partir du tableau ci-dessus.</p>' : '',
      q: `Graphique ${i + 1} / ${graphes.length} · ${g.q}`,
      choix: vignettes.map(([nom, svg]) => `${svg}<span>${nom}</span>`),
      bon: g.bon, pourquoi: POURQUOI_G[g.id], expl: EXPL_G[g.id],
    }, suite)));
    enchainer(zone, blocs, fin);
  }

  /* =====================================================================
     Composants communs : QCM avec nouvel essai, enchaînement de blocs
     ===================================================================== */
  function qcm(box, o, suite) {
    const art = el('article', 'q at-pix-q' + (o.classe ? ' ' + o.classe : ''));
    art.innerHTML = `${o.avant || ''}<h3>${o.q}</h3><div class="rep" role="group" aria-label="Réponses">${o.choix.map((c, k) => `<button type="button" data-k="${k}">${c}</button>`).join('')}</div><div class="commentaire" aria-live="polite">Choisis une réponse.</div>`;
    box.appendChild(art);
    const fbk = art.querySelector('.commentaire');
    let essais = 0, fini = false;
    art.querySelector('.rep').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-k]');
      if (!b || fini || b.getAttribute('aria-disabled') === 'true') return;
      const k = +b.dataset.k; essais++;
      if (k === o.bon) {
        fini = true; b.classList.add('bon');
        art.querySelectorAll('.rep button').forEach((x) => x.setAttribute('aria-disabled', 'true'));
        noter(o.id, essais === 1); reussite(o.id, 10);
        dire(fbk, `<b>${essais === 1 ? 'Exact !' : "Oui, c'est ça."}</b> ${o.expl}`, 'bon');
        if (suite) suite();
      } else {
        b.classList.add('faux'); b.setAttribute('aria-disabled', 'true'); noter(o.id, false);
        dire(fbk, `<b>Pas tout à fait.</b> ${(o.pourquoi && o.pourquoi[k]) || ''} Essaie encore.`, 'faux');
      }
    });
  }
  function enchainer(racine, blocs, fin) {
    let i = 0;
    const lancer = () => {
      if (i >= blocs.length) { fin(); return; }
      const box = el('div', 'at-pix-bloc'); racine.appendChild(box);
      const f = blocs[i++];
      f(box, lancer);
      if (i > 1 && box.isConnected) setTimeout(() => defiler(box), 60);
    };
    lancer();
  }

  /* =====================================================================
     Progression, reprise, bilan
     ===================================================================== */
  const ETAPES = { 1: etape1, 2: etape2, 3: etape3, 4: etape4, 5: etape5, 6: etape6 };
  const section = (k) => document.getElementById('at-pix-e' + k);
  let prog = Math.min(A.etape(ID) || 0, TOTAL);

  function rendreEtape(k, mode) {
    const s = section(k);
    s.className = 'at-pix-etape ' + mode;
    s.innerHTML = '';
    if (mode === 'verrou') { s.innerHTML = `<div class="at-pix-verrou"><span aria-hidden="true">🔒</span> Réussis l'étape ${k - 1} pour débloquer ce défi.</div>`; return; }
    if (mode === 'fait') { s.innerHTML = `<div class="at-pix-fait"><span class="pill ok">Étape ${k} réussie ✓</span><p>${RESUME[k]}</p><button type="button" class="btn s small" data-rejouer="${k}">Rejouer cette étape</button></div>`; return; }
    const [n, txt] = REP[k][CLASSE];
    s.innerHTML = `<div class="at-pix-consigne"><p>${INTRO[k]}</p><p class="at-pix-repere"><span>${N5 && k === 6 ? 'Défi bonus · ' : ''}Repère niveau ${n}</span> ${txt}</p></div>`;
    const corps = el('div', 'at-pix-corps'); s.appendChild(corps);
    ETAPES[k](corps, () => reussirEtape(k));
  }

  function reussirEtape(k) {
    A.gagner(30, `pix:etape:${k}`);
    if ((A.etape(ID) || 0) < k) A.terminer(ID, k);
    if (prog < k) prog = k;
    majXP();
    const s = section(k);
    s.classList.add('reussie');
    const b = el('div', 'at-pix-succes');
    b.setAttribute('role', 'status');
    b.innerHTML = `<span class="pill ok">Étape ${k} réussie ✓</span><span>${RESUME[k]}</span>${k < TOTAL ? `<button type="button" class="btn p small" data-aller="${k + 1}">Étape suivante ↓</button>` : '<button type="button" class="btn p small" data-aller="bilan">Voir le bilan ↓</button>'}`;
    s.appendChild(b);
    if (k < TOTAL) { if (section(k + 1).classList.contains('verrou')) rendreEtape(k + 1, 'actif'); }
    else bilan();
    setTimeout(() => defiler(b), 80);
  }

  const COMP = [['1.1', 'Mener une recherche et une veille d\'information', ['s1', 's2'], [1, 2]], ['1.2', 'Gérer des données', ['s3', 's4'], [3, 4]], ['1.3', 'Traiter des données', ['s5', 's6'], [5, 6]]];
  function exosAttendus() {
    const l = ['s1-m1', 's1-m2'];
    if (N2DE) l.push('s1-m3');
    if (!N5) l.push('s1-q');
    l.push('s2-indices', 's2-verdict', 's2-intention', 's2-reflexe', 's2-conclusion', 's2-alerte');
    ARBRES[CLASSE].fichiers.forEach((_, i) => l.push('s3-f' + i));
    l.push('s3-espace', 's4-nom');
    SC_CLASSE[CLASSE].forEach((id) => l.push('s4-fmt-' + id));
    l.push('s4-sauv', 's4-version', 's5-lire', 's5-tri', 's5-filtre');
    CIBLES_CLASSE[CLASSE].forEach((id) => l.push(id));
    GRAPHES_CLASSE[CLASSE].forEach((id) => l.push(id));
    return l;
  }

  function bilan() {
    const b = document.getElementById('bilan');
    const s = stats(), liste = exosAttendus();
    const notes = COMP.map(([code, nom, pref, etapes]) => {
      const ex = liste.filter((x) => pref.includes(x.slice(0, 2)));
      const ok = ex.filter((x) => s[x] === 1).length, vus = ex.filter((x) => x in s).length;
      return { code, nom, etapes, ok, total: ex.length, vus };
    });
    const ok = notes.reduce((a, n) => a + n.ok, 0), total = notes.reduce((a, n) => a + n.total, 0), vus = notes.reduce((a, n) => a + n.vus, 0);
    const taux = total ? ok / total : 0;
    const maitrise = taux >= 0.7;
    A.badge(maitrise ? 'pix' : 'pix-decouverte');
    const etat = (n) => { const t = n.total ? n.ok / n.total : 0; return t >= 0.7 ? ['ok', 'Acquis pour ton niveau'] : t >= 0.5 ? ['moyen', 'En bonne voie'] : ['faible', 'À retravailler']; };
    b.innerHTML = `
      <div class="kicker">Bilan de l'atelier</div>
      <div class="note">${ok} / ${total} <small>réponses justes du premier coup</small></div>
      <p class="at-pix-bilan-txt">Niveau visé : <b>${NIV[CLASSE].titre}</b>. ${vus < total ? "Certaines réponses ont été données avant un rechargement de page : elles ne comptent pas dans ce bilan." : ''}</p>
      <p class="at-pix-legende">Sur chaque barre, le trait noir marque 70 % : au-dessus, la compétence est acquise.</p>
      <div class="at-pix-comps">
        ${notes.map((n) => { const [cl, lib] = etat(n); return `<div class="at-pix-comp ${cl}"><div class="at-pix-comp-tete"><b>${n.code} · ${n.nom}</b><span class="pill ${cl === 'ok' ? 'ok' : ''}">${lib}</span></div>
          <div class="bar" role="img" aria-label="${n.ok} sur ${n.total} ; le trait marque 70 %"><i style="width:${n.total ? Math.round((n.ok / n.total) * 100) : 0}%"></i></div>
          <p>${n.ok} / ${n.total} du premier coup${cl !== 'ok' ? ` · <span class="at-pix-insecable">rejouer : <button type="button" class="at-pix-lien" data-rejouer="${n.etapes[0]}" aria-label="Rejouer l'étape ${n.etapes[0]}">étape ${n.etapes[0]}</button> · <button type="button" class="at-pix-lien" data-rejouer="${n.etapes[1]}" aria-label="Rejouer l'étape ${n.etapes[1]}">étape ${n.etapes[1]}</button></span>` : ''}</p></div>`; }).join('')}
      </div>
      <span class="badge at-pix-badge">${maitrise ? 'Badge « domaine 1 · maîtrise » obtenu' : 'Badge « domaine 1 · découverte » obtenu'}</span>
      <p class="at-pix-bilan-txt">${maitrise ? "Bravo ! Tu sais chercher, ranger et traiter l'information à ton niveau." : 'Rejoue les étapes marquées « à retravailler » : au-delà de 70 % du premier coup, tu obtiens le badge « maîtrise ».'} Rappel : entraînement non officiel, sans lien avec la plateforme Pix.</p>
      <div class="cta"><a class="btn p" href="index.html">Retour à l'accueil</a><button type="button" class="btn s" data-tout-rejouer>Tout rejouer</button></div>`;
    b.classList.add('vu');
  }

  function majXP() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    const x = document.getElementById('xp');
    if (!x) return;
    x.innerHTML = `<span class="lvl">Nv. ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div>
      <small>${p.xp} XP · ${esc(p.nom)} (${esc(p.classe)})</small>`;
  }
  function majNiveau() {
    const z = document.getElementById('at-pix-niveau');
    if (!z) return;
    z.innerHTML = `<span class="at-pix-niv-badge">Niveau visé · ${NIV[CLASSE].titre}</span><p><b>${esc(P.nom)}</b> (${esc(P.classe)}) · ${NIV[CLASSE].txt}</p><p class="at-pix-avance" aria-live="polite">${prog} / ${TOTAL} étapes réussies</p>`;
  }
  window.addEventListener('atelier:maj', () => { const z = document.querySelector('.at-pix-avance'); if (z) z.textContent = `${Math.min(A.etape(ID) || 0, TOTAL)} / ${TOTAL} étapes réussies`; });

  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-rejouer]');
    if (r) {
      const k = +r.dataset.rejouer;
      rendreEtape(k, 'actif');
      const t = section(k).previousElementSibling || section(k);
      t.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    const a = e.target.closest('[data-aller]');
    if (a) {
      const cible = a.dataset.aller === 'bilan' ? document.getElementById('bilan') : section(+a.dataset.aller).previousElementSibling;
      cible.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'start' });
      const f = cible.matches('.bilan') ? cible.querySelector('a,button') : section(+a.dataset.aller).querySelector('input,button');
      if (f) f.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest('[data-tout-rejouer]')) {
      effacerStats();
      for (let k = 1; k <= TOTAL; k++) rendreEtape(k, k === 1 ? 'actif' : 'verrou');
      const b = document.getElementById('bilan'); b.classList.remove('vu'); b.innerHTML = '';
      section(1).previousElementSibling.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'start' });
    }
  });

  /* ---------- démarrage : reprise là où l'enfant en était ---------- */
  majXP(); majNiveau();
  for (let k = 1; k <= TOTAL; k++) rendreEtape(k, k <= prog ? 'fait' : k === prog + 1 ? 'actif' : 'verrou');
  if (prog >= TOTAL) bilan();
  else if (prog > 0) {
    const s = section(prog + 1);
    s.insertAdjacentHTML('afterbegin', `<p class="at-pix-reprise" role="status">On reprend ici : ${prog} étape${prog > 1 ? 's' : ''} déjà réussie${prog > 1 ? 's' : ''}.</p>`);
    requestAnimationFrame(() => { const h = s.previousElementSibling; if (h) h.scrollIntoView({ behavior: 'auto', block: 'start' }); });
  }

  /* point d'entrée de test (lecture seule) : calcul du tableur hors interface */
  window.AtelierPix = Object.freeze({ evaluer: (src) => evaluer(src, (a) => { const m = /^([A-E])(\d+)$/.exec(a); if (!m) return ''; const l = +m[2], c = LET.indexOf(m[1]); return l === 1 ? ENTETES[c] : (l >= 2 && l <= 8 ? METEO[l - 2][c] : ''); }, null, 12) });
})();
