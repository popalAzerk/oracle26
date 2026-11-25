/* Accueil de l'Atelier : profils, cartes des modules, sauvegarde, bande annonce. */
(function () {
  const A = window.Atelier;
  const mods = [
    { id: 'electricite', titre: 'Électricité', ico: '⚡', c: ['#FFD84D', '#FF9F0A'],
      desc: "Fermer une boucle, comparer série et dérivation, tester conducteurs et isolants, éviter le court-circuit.", min: 20, href: 'module-electricite.html', total: 3 },
    { id: 'lumiere', titre: 'Lumière', ico: '🔆', c: ['#FF9EC4', '#F0417E'],
      desc: "Ombres, propagation rectiligne, réfraction, lentilles et couleurs.", min: 20, href: 'module-lumiere.html', total: 3 },
    { id: 'poste3d', titre: 'Le poste en 3D', ico: '🧊', c: ['#38BDF8', '#0E7490'],
      desc: "Visite WebGL : tourne le poste, clique chaque pièce, remets les 7 composants en place.", min: 15, href: 'module-poste-3d.html', total: 3, badge: '3D' },
    { id: 'composants', titre: 'Les composants', ico: '🔧', c: ['#6AA6FF', '#2F5BFF'],
      desc: "Nommer les cinq constituants d'un poste, les placer, expliquer leur rôle.", min: 18, href: 'module-composants.html', total: 3 },
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
      desc: 'Apprendre l’AZERTY sans regarder les mains, touche par touche.', min: 5, total: 5 },
    { id: 'ia', titre: 'Comprendre une IA', ico: '🤖', c: ['#FF7EB3', '#F0417E'],
      desc: 'Entraîner un classifieur, le voir se tromper, corriger son biais.', min: 10, total: 4 },
    { id: 'pix', titre: 'Badge Pix · domaine 1', ico: '🏅', c: ['#FFDE59', '#FF9F0A'],
      desc: 'Rechercher, gérer et traiter des données — niveau 3 attendu en 3e.', min: 8, total: 6 },
  ];
  const AVATARS = { lea: '🦊', noe: '🦉', manon: '🐬' };

  function rendreProfil() {
    const d = A.lire();
    const nav = document.getElementById('profils');
    nav.innerHTML = Object.entries(d.profils).map(([id, p]) =>
      `<button data-id="${id}" class="${id === d.actif ? 'on' : ''}" aria-pressed="${id === d.actif}"><span class="av">${AVATARS[id] || '👤'}</span>${Atelier.esc(p.nom)}<span class="cl">${Atelier.esc(p.classe)}</span></button>`).join('');
  }
  function rendreXp() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    document.getElementById('xp').innerHTML =
      `<span class="lvl">⭐ Niveau ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div>
       <small>${p.xp} XP · ${Atelier.esc(p.nom)} · ${Atelier.esc(p.classe)}</small>`;
    document.getElementById('kicker').textContent = `Technologie & sciences · ${p.classe} · profil de ${p.nom}`;
    // « Reprendre » mène au module réellement en cours, sinon au premier pas encore commencé
    const enCours = mods.find((m) => (p.fait[m.id] || 0) > 0 && (p.fait[m.id] || 0) < m.total);
    const neuf = mods.find((m) => !(p.fait[m.id] || 0));
    const cible = enCours || neuf || mods[0];
    const btn = document.getElementById('btnReprendre');
    btn.href = cible.href;
    btn.textContent = enCours ? `▶ Reprendre : ${cible.titre}` : neuf ? `▶ Commencer : ${cible.titre}` : '↻ Tout revoir';
  }
  function carte(m, i, prefixe) {
    const p = A.profil(), fait = p.fait[m.id] || 0, pc = Math.round((fait / m.total) * 100);
    const etat = pc === 100 ? '<span class="pill ok">✓ terminé</span>'
      : pc > 0 ? `<span class="pill go">en cours · ${fait}/${m.total}</span>`
      : m.href ? '<span class="pill">à découvrir</span>' : '<span class="pill">bientôt</span>';
    return `<article class="card" style="--c1:${m.c[0]};--c2:${m.c[1]}">
      <div class="ico" aria-hidden="true">${m.ico}</div>
      <div class="no">${prefixe}</div>
      <h3>${m.href ? `<a href="${m.href}">${m.titre}</a>` : m.titre + ' <span style="font-size:12.5px;font-weight:600;color:var(--ink3)">· bientôt</span>'}</h3>
      <p>${m.desc}</p>
      <div class="bar"><i style="width:${pc}%"></i></div>
      <div class="meta">${etat}<span>${m.min} min</span></div>
    </article>`;
  }
  function rendreCartes() {
    document.getElementById('modules').innerHTML = mods.map((m, i) => carte(m, i, String(i + 1).padStart(2, '0') + ' / 11')).join('');
    document.getElementById('ateliers').innerHTML = ateliers.map((a) => carte(a, 0, 'Atelier')).join('');
  }
  function tout() { rendreProfil(); rendreXp(); rendreCartes(); }

  document.getElementById('profils').addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]'); if (!b) return;
    A.choisir(b.dataset.id); tout();
  });
  document.getElementById('btnExport').onclick = () => A.exporter();
  document.getElementById('btnImport').onclick = () => document.getElementById('fichier').click();
  document.getElementById('fichier').onchange = async (e) => {
    if (!e.target.files[0]) return;
    const f = e.target.files[0]; e.target.value = '';
    if (!confirm('Remplacer la progression actuelle des trois profils par celle de ce fichier ? (Une copie de secours de la progression actuelle est gardée.)')) return;
    try { await A.importer(f); tout(); alert('Sauvegarde restaurée.'); }
    catch (err) { alert('Ce fichier n’est pas une sauvegarde valide de l’Atelier.'); }
  };
  document.getElementById('btnReset').onclick = () => {
    if (confirm('Effacer toute la progression des trois profils ? Cette action ne peut pas être annulée.')) { A.reinitialiser(); tout(); }
  };
  window.addEventListener('atelier:maj', tout);
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
