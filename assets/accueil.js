/* Accueil de l'Atelier : qui travaille, progression et badges, modules par famille, espace parent, bande annonce. */
(function () {
  const A = window.Atelier;
  const mods = [
    { id: 'electricite', titre: 'Électricité', ico: '⚡', c: ['#FFD84D', '#FF9F0A'],
      desc: "Fermer une boucle, comparer série et dérivation, tester conducteurs et isolants, éviter le court-circuit.", min: 20, href: 'module-electricite.html', total: 3 },
    { id: 'lumiere', titre: 'Lumière', ico: '🔆', c: ['#FF9EC4', '#F0417E'],
      desc: "Ombres, propagation rectiligne, réfraction, lentilles et couleurs.", min: 20, href: 'module-lumiere.html', total: 3 },
    { id: 'poste3d', titre: 'Le poste en 3D', ico: '🧊', c: ['#38BDF8', '#0E7490'],
      desc: "Visite en 3D : tourne le poste, clique chaque pièce, remets les 7 composants en place.", min: 15, href: 'module-poste-3d.html', total: 3, badge: '3D' },
    { id: 'composants', titre: 'Les composants', ico: '🔧', c: ['#6AA6FF', '#2F5BFF'],
      desc: "Processeur, mémoire, stockage, alimentation : les placer dans le boîtier et expliquer leur rôle.", min: 18, href: 'module-composants.html', total: 3 },
    { id: 'energie', titre: 'Énergie', ico: '🔋', c: ['#34D399', '#0EA47A'],
      desc: "Formes d'énergie, chaîne de conversion, rendement, sources et CO₂.", min: 18, href: 'module-energie.html', total: 3 },
    { id: 'forces', titre: 'Forces et machines', ico: '⚙️', c: ['#A0A6B8', '#5A6478'],
      desc: "Newtons, loi de Hooke sur un ressort, leviers et moments.", min: 20, href: 'module-forces.html', total: 3 },
    { id: 'eau', titre: 'Eau et fluides', ico: '💧', c: ['#5AC8FA', '#0071E3'],
      desc: "Cycle de l'eau, flottabilité, pression et vérins hydrauliques.", min: 22, href: 'module-eau.html', total: 3 },
    { id: 'chaleur', titre: 'Chaleur et son', ico: '🌡️', c: ['#FB923C', '#EA580C'],
      desc: "Conduction thermique, isolants, ondes sonores et vitesse du son.", min: 20, href: 'module-chaleur.html', total: 3 },
    { id: 'matiere', titre: 'Matière et matériaux', ico: '🧪', c: ['#8B5CF6', '#6D28D9'],
      desc: "États et changements d'état, mélanges homogènes, filtration et distillation.", min: 20, href: 'module-matiere.html', total: 3 },
    { id: 'structures', titre: 'Structures', ico: '🏗️', c: ['#0EA5E9', '#1E40AF'],
      desc: "Formes, triangulation, centre de gravité, charge maximale et rupture.", min: 20, href: 'module-structures.html', total: 3 },
    { id: 'information', titre: 'Information', ico: '💻', c: ['#F472B6', '#BE185D'],
      desc: "Binaire, portes logiques ET/OU/NON, capteur → programme → actionneur, biais d'IA.", min: 22, href: 'module-information.html', total: 3 },
  ];
  const ateliers = [
    { id: 'frappe', titre: 'Frappe · 10 doigts', ico: '⌨️', c: ['#B57BFF', '#6A5BFF'],
      desc: 'Apprendre l’AZERTY sans regarder les mains, touche par touche, puis test de vitesse.', min: 30, total: 5, href: 'atelier-frappe.html' },
    { id: 'ia', titre: 'Comprendre une IA', ico: '🤖', c: ['#FF7EB3', '#F0417E'],
      desc: 'Entraîner une IA, corriger son biais, savoir lui demander et repérer ses erreurs.', min: 25, total: 4, href: 'atelier-ia.html' },
    { id: 'pix', titre: 'Badge Pix · domaine 1', ico: '🏅', c: ['#FFDE59', '#FF9F0A'],
      desc: 'Rechercher, gérer et traiter des données — niveau 3 attendu en 3e.', min: 30, total: 6, href: 'atelier-pix.html' },
  ];
  const FAMILLES = [
    { titre: 'Physique et énergie', ids: ['electricite', 'lumiere', 'forces', 'energie', 'chaleur'] },
    { titre: 'Matière et fluides', ids: ['eau', 'matiere'] },
    { titre: 'Objets et informatique', ids: ['composants', 'poste3d', 'information', 'structures'] },
  ];
  const AVATARS = { lea: '🦊', noe: '🦉', manon: '🐬' };
  const TOUT = mods.concat(ateliers);
  const XP_NIVEAU = 200;
  const $ = (id) => document.getElementById(id);

  /** « de Nellia », « d’Elyas » : élision devant une voyelle ou un h muet. */
  const de = (nom) => (/^[aeiouyhàâäéèêëîïôöûüœ]/i.test(nom) ? 'd’' : 'de ') + nom;

  /** Le badge d'un module : 'electricite' = maîtrise ; 'electricite-apprenti', '-decouverte'… = premier palier. */
  function badgeDe(p, id) {
    if (p.badges.includes(id)) return 'or';
    return p.badges.some((b) => b.startsWith(id + '-')) ? 'argent' : '';
  }

  /* ---------- qui travaille : un menu, construit une seule fois (le focus reste dessus) ---------- */
  function construireQui() {
    const d = A.lire(), sel = $('qui');
    sel.innerHTML = Object.entries(d.profils).map(([id, p]) =>
      `<option value="${Atelier.esc(id)}">${AVATARS[id] || '👤'} ${Atelier.esc(p.nom)} · ${Atelier.esc(p.classe)}</option>`).join('');
    sel.value = d.actif;
  }

  function rendreProgres() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % XP_NIVEAU, reste = XP_NIVEAU - dans;
    $('xp').innerHTML =
      `<span class="lvl">⭐ Niveau ${niv}</span><div class="rail" role="progressbar" aria-label="Vers le niveau ${niv + 1}" aria-valuemin="0" aria-valuemax="${XP_NIVEAU}" aria-valuenow="${dans}"><i style="width:${(dans / XP_NIVEAU) * 100}%"></i></div>
       <small>${p.xp} XP</small>`;
    $('objectif').textContent = p.xp === 0
      ? `Bienvenue ${p.nom} ! Ouvre un premier module : chaque défi réussi rapporte des points.`
      : `Encore ${reste} XP avant le niveau ${niv + 1}.`;
    const nb = TOUT.filter((m) => badgeDe(p, m.id) === 'or').length;
    $('nbBadges').textContent = `${nb} sur ${TOUT.length}`;
    $('etagere').innerHTML = TOUT.map((m) => {
      const b = badgeDe(p, m.id);
      const etat = b === 'or' ? 'badge obtenu' : b === 'argent' ? 'premier palier' : 'pas encore';
      return `<li class="badge ${b}" style="--c1:${m.c[0]};--c2:${m.c[1]}" title="${m.titre} : ${etat}"><span aria-hidden="true">${m.ico}</span><span class="sr">${m.titre} : ${etat}</span></li>`;
    }).join('');
    // « Reprendre » mène au module réellement en cours, sinon au premier pas encore commencé
    const enCours = mods.find((m) => (p.fait[m.id] || 0) > 0 && (p.fait[m.id] || 0) < m.total);
    const neuf = mods.find((m) => !(p.fait[m.id] || 0));
    const cible = enCours || neuf || mods[0];
    const btn = $('btnReprendre');
    btn.href = cible.href;
    btn.textContent = enCours ? `▶ Reprendre : ${cible.titre}` : neuf ? `▶ Commencer : ${cible.titre}` : '↻ Tout revoir';
  }

  /* ---------- cartes : toute la carte est cliquable, l'action est écrite ---------- */
  function carte(m) {
    const p = A.profil(), fait = Math.min(p.fait[m.id] || 0, m.total), pc = Math.round((fait / m.total) * 100);
    const etat = pc === 100 ? '<span class="pill ok">✓ terminé</span>'
      : pc > 0 ? `<span class="pill go">en cours · ${fait}/${m.total}</span>`
      : '<span class="pill">à découvrir</span>';
    const action = pc === 100 ? 'Revoir' : pc > 0 ? 'Reprendre' : 'Commencer';
    return `<article class="card${pc === 100 ? ' fini' : ''}" style="--c1:${m.c[0]};--c2:${m.c[1]}">
      <div class="ico" aria-hidden="true">${m.ico}</div>
      <h3><a href="${m.href}">${m.titre}</a></h3>
      <p>${m.desc}</p>
      <div class="bar" aria-hidden="true"><i style="width:${pc}%"></i></div>
      <div class="meta">${etat}<span>${m.min} min</span><span class="action" aria-hidden="true">${action} ›</span></div>
    </article>`;
  }
  function rendreCartes() {
    const parId = Object.fromEntries(mods.map((m) => [m.id, m]));
    $('familles').innerHTML = FAMILLES.map((f) =>
      `<h3 class="famille-titre">${f.titre}</h3><div class="cards">${f.ids.map((id) => carte(parId[id])).join('')}</div>`).join('');
    $('ateliers').innerHTML = ateliers.map(carte).join('');
  }

  /* ---------- espace parent : vue d'ensemble des trois profils ---------- */
  function rendreParent() {
    const d = A.lire();
    $('bilanParent').innerHTML = Object.entries(d.profils).map(([id, p]) => {
      const finis = mods.filter((m) => (p.fait[m.id] || 0) >= m.total).length;
      const badges = TOUT.filter((m) => p.badges.includes(m.id)).length;
      return `<tr><th scope="row">${AVATARS[id] || '👤'} ${Atelier.esc(p.nom)} <span class="cl">${Atelier.esc(p.classe)}</span></th>
        <td>${A.niveau(p.xp)} <span class="cl">(${p.xp} XP)</span></td><td>${finis} / ${mods.length}</td><td>${badges} / ${TOUT.length}</td></tr>`;
    }).join('');
    $('btnResetProfil').textContent = `Effacer la progression ${de(A.profil().nom)}`;
  }

  function tout() {
    $('qui').value = A.profilId();
    rendreProgres(); rendreCartes(); rendreParent();
  }

  $('qui').addEventListener('change', (e) => {
    A.choisir(e.target.value);
    const p = A.profil();
    $('annonce').textContent = `Profil ${de(p.nom)} activé, niveau ${A.niveau(p.xp)}.`;
  });
  $('btnExport').onclick = () => A.exporter();
  $('btnImport').onclick = () => $('fichier').click();
  $('fichier').onchange = async (e) => {
    if (!e.target.files[0]) return;
    const f = e.target.files[0]; e.target.value = '';
    if (!confirm('Remplacer la progression actuelle des trois profils par celle de ce fichier ? (Une copie de secours de la progression actuelle est gardée.)')) return;
    try { await A.importer(f); construireQui(); tout(); $('annonce').textContent = 'Sauvegarde restaurée.'; alert('Sauvegarde restaurée.'); }
    catch (err) { alert('Ce fichier n’est pas une sauvegarde de l’Atelier. Choisis un fichier nommé « atelier-sauvegarde-…json », créé par le bouton « Sauvegarder dans un fichier ».'); }
  };
  $('btnResetProfil').onclick = () => {
    const d = A.lire(), p = d.profils[d.actif];
    if (!confirm(`Effacer les points, les badges et les modules ${de(p.nom)} ? Les deux autres profils ne changent pas. Une copie de secours est gardée.`)) return;
    try { localStorage.setItem('atelier.profils.v1.bak', JSON.stringify(d)); } catch (_) {}
    Object.assign(p, { xp: 0, badges: [], fait: {}, note: {}, acquis: [] });
    A.ecrire(d);
    $('annonce').textContent = `Progression ${de(p.nom)} effacée.`;
  };
  $('btnReset').onclick = () => {
    if (confirm('Effacer toute la progression des trois profils ? Une copie de secours est gardée, mais ce bouton ne la restaure pas.')) { A.reinitialiser(); construireQui(); }
  };
  window.addEventListener('atelier:maj', tout);
  construireQui();
  tout();
})();

  /* ---------- bande annonce : lecture maîtrisée ----------
     Pas d'attribut autoplay : la vidéo ne se télécharge et ne joue que si le mouvement est autorisé,
     qu'elle est à l'écran et que l'onglet est visible. Une pause demandée par l'enfant est respectée. */
  (function () {
    const film = document.getElementById('film');
    const bouton = document.getElementById('filmPlay');
    if (!film || !bouton) return;
    const ICONE_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5h3v14H8zM14 5h3v14h-3z" fill="currentColor"/></svg>';
    const ICONE_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let pauseVoulue = reduit, visible = false;
    const majBouton = () => {
      const enPause = film.paused;
      bouton.innerHTML = enPause ? ICONE_PLAY : ICONE_PAUSE;
      bouton.setAttribute('aria-label', enPause ? 'Lire la bande annonce' : 'Mettre la bande annonce en pause');
    };
    const peutJouer = () => !pauseVoulue && visible && !document.hidden;
    const appliquer = () => { if (peutJouer()) { if (film.paused) film.play().catch(() => {}); } else if (!film.paused) film.pause(); };
    bouton.addEventListener('click', () => {
      if (film.paused) { pauseVoulue = false; visible = true; film.play().catch(() => {}); }
      else { pauseVoulue = true; film.pause(); }
    });
    film.addEventListener('play', majBouton); film.addEventListener('pause', majBouton);
    majBouton();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entrees) => { entrees.forEach((e) => { visible = e.isIntersecting; appliquer(); }); }, { threshold: .25 }).observe(film);
    } else { visible = true; appliquer(); }
    document.addEventListener('visibilitychange', appliquer);
  })();
