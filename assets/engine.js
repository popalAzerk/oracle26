/* Moteur commun des modules de l'Atelier.
   Un module = un fichier de données (assets/mod-<id>.js) qui remplit window.MODULE :
   { id, titre, sousTitre, kicker, couleur, etat, controles, dessiner, mesures, commentaire, defis, fiches, experiences, quiz }
   Le moteur construit la page entière (banc, commandes, mesures, défis, fiches, quiz, bilan) et gère
   l'XP, les badges et la progression locale. Aucune dépendance, aucun réseau. */
(function () {
  const A = window.Atelier;
  const M = window.MODULE;
  if (!A || !M) { console.error('Atelier ou MODULE manquant'); return; }

  const SVG_PLAY = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:6px"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>';
  const etat = JSON.parse(JSON.stringify(M.etat || {}));
  const reussis = {};
  const vusFiches = new Set();
  const quiz = { fait: 0, bon: 0 };

  /* ---------- en-tête de page ---------- */
  const c1 = (M.couleur || ['#6AA6FF', '#2F5BFF'])[0], c2 = (M.couleur || ['#6AA6FF', '#2F5BFF'])[1];
  document.title = M.titre + ' — Atelier';
  document.getElementById('kicker').textContent = M.kicker || 'Atelier';
  document.getElementById('kicker').style.background = `linear-gradient(135deg,${c1},${c2})`;
  document.getElementById('titre').innerHTML = M.titreHtml || M.titre;
  document.getElementById('soustitre').textContent = M.sousTitre || '';
  document.getElementById('lien-accueil').href = 'index.html';
  document.getElementById('tag-haut').textContent = M.titre.toLowerCase();

  /* ---------- XP ---------- */
  function majXP() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    document.getElementById('xp').innerHTML =
      `<span class="lvl">⭐ Niveau ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div>
       <small>${p.xp} XP · ${A.esc(p.nom)} · ${A.esc(p.classe)}</small>`;
  }
  function terminerEtape(n) { if ((A.etape(M.id) || 0) < n) { A.terminer(M.id, n); majXP(); } }

  /* ---------- commandes ---------- */
  function construireControles() {
    const zone = document.getElementById('commandes');
    zone.innerHTML = (M.controles || []).map((ctrl) => {
      if (ctrl.type === 'curseur') {
        return `<div class="grp curseur"><span>${ctrl.label}</span>
          <input type="range" id="c-${ctrl.id}" min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step || 1}" value="${etat[ctrl.id]}" aria-label="${ctrl.label}">
          <output id="o-${ctrl.id}">${etat[ctrl.id]}${ctrl.unit || ''}</output></div>`;
      }
      return `<div class="grp${ctrl.danger ? ' danger' : ''}"><span>${ctrl.label}</span>
        ${ctrl.options.map((o) => `<button data-ctrl="${ctrl.id}" data-val="${o.v}" class="${String(etat[ctrl.id]) === String(o.v) ? 'on' : ''}">${o.label}</button>`).join('')}</div>`;
    }).join('');

    zone.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ctrl]'); if (!b) return;
      const id = b.dataset.ctrl, val = b.dataset.val;
      const def = (M.controles || []).find((c) => c.id === id);
      const opt = def && def.options.find((o) => String(o.v) === String(val));
      etat[id] = opt && typeof opt.v === 'boolean' ? opt.v : (isNaN(+val) ? val : +val);
      zone.querySelectorAll(`[data-ctrl="${id}"]`).forEach((x) => x.classList.toggle('on', String(x.dataset.val) === String(val)));
      rendre();
    });
    zone.addEventListener('input', (e) => {
      const inp = e.target.closest('input[type="range"]'); if (!inp) return;
      const id = inp.id.slice(2);
      etat[id] = +inp.value;
      const out = document.getElementById('o-' + id); if (out) out.textContent = inp.value + ((M.controles.find((c) => c.id === id) || {}).unit || '');
      rendre();
    });
  }

  /* ---------- rendu ---------- */
  function rendre() {
    const api = { etat, A };
    document.getElementById('banc').innerHTML = `<svg viewBox="0 0 ${M.largeur || 900} ${M.hauteur || 400}" role="img" aria-label="${M.titre}">${M.dessiner(etat, api)}</svg>`;
    const mes = (M.mesures ? M.mesures(etat, api) : []) || [];
    document.getElementById('mesures').innerHTML = mes.map((m) =>
      `<div class="mes${m.alerte ? ' alerte' : ''}"><b>${m.valeur}</b><span>${m.label}</span></div>`).join('');
    const com = M.commentaire ? M.commentaire(etat, api) : null;
    const zone = document.getElementById('commentaire');
    if (com) { zone.className = 'commentaire ' + (com.classe || ''); zone.innerHTML = com.html; }
    (M.apresRendu && M.apresRendu(etat, api));
    verifierDefis();
  }

  function verifierDefis() {
    (M.defis || []).forEach((d, i) => {
      if (reussis[d.id]) return;
      if (d.quand.call(M, etat, { M, A })) {
        reussis[d.id] = true;
        const el = document.getElementById('defi-' + d.id);
        if (el) { el.classList.add('fait'); el.querySelector('.st').textContent = '✓ réussi'; }
        A.gagner(d.xp || 20);
        const b = document.getElementById('bravo');
        b.textContent = `Défi ${i + 1} réussi : ${d.bravo || d.texte}`;
        b.classList.add('vu'); setTimeout(() => b.classList.remove('vu'), 4000);
        majXP();
      }
    });
    const n = (M.defis || []).length;
    if (n && Object.keys(reussis).length === n) terminerEtape(1);
  }

  /* ---------- défis, fiches, expériences ---------- */
  function construireDefis() {
    const zone = document.getElementById('defis');
    zone.innerHTML = (M.defis || []).map((d, i) =>
      `<div class="defi" id="defi-${d.id}"><span class="n">${i + 1}</span><p>${d.texte}</p><span class="st">à faire</span></div>`).join('');
  }
  function construireFiches() {
    const zone = document.getElementById('fiches');
    zone.innerHTML = (M.fiches || []).map((f) => `
      <article class="fiche" style="--c1:${(M.couleur || ['#6AA6FF', '#2F5BFF'])[0]};--c2:${(M.couleur || ['#6AA6FF', '#2F5BFF'])[1]}">
        <div class="role">${f.court}</div><h3>${f.nom}</h3><p>${f.texte}</p>
        <details data-fiche="${f.id}"><summary>En savoir plus</summary><div>${f.plus}</div></details>
        <button class="dire" data-lire="${f.id}">${SVG_PLAY}Écouter</button>
      </article>`).join('');
    zone.addEventListener('toggle', (e) => {
      const d = e.target.closest('details[data-fiche]');
      if (d && d.open) { vusFiches.add(d.dataset.fiche); if (vusFiches.size >= Math.min(3, (M.fiches || []).length)) terminerEtape(2); }
    }, true);
    zone.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lire]'); if (!b) return;
      const f = (M.fiches || []).find((x) => x.id === b.dataset.lire); if (!f) return;
      A.voix(`${f.nom}. ` + f.texte.replace(/<[^>]+>/g, '') + ' ' + f.plus.replace(/<[^>]+>/g, ''));
    });
  }
  function construireExperiences() {
    const zone = document.getElementById('experiences');
    const liste = M.experiences || [];
    if (!liste.length) { document.getElementById('bloc-experiences').style.display = 'none'; return; }
    zone.innerHTML = liste.map((x, i) => `
      <article class="fiche" style="--c1:${c1};--c2:${c2}">
        <div class="role">Expérience ${i + 1}</div><h3>${x.titre}</h3><p>${x.texte}</p>
      </article>`).join('');
  }

  /* ---------- quiz ---------- */
  function construireQuiz() {
    const zone = document.getElementById('quiz');
    const Q = M.quiz || [];
    zone.innerHTML = Q.map((item, i) => `
      <article class="q" data-q="${i}"><h3>${i + 1}. ${item.q}</h3>
        <div class="rep">${item.r.map((r, k) => `<button data-k="${k}" data-i="${i}">${r}</button>`).join('')}</div>
        <div class="expl"><b>Explication.</b> ${item.e}</div></article>`).join('');
    zone.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-k]'); if (!b) return;
      const art = b.closest('.q'); if (art.classList.contains('repondu')) return;
      const i = +b.dataset.i, k = +b.dataset.k, item = Q[i];
      art.classList.add('repondu');
      art.querySelectorAll('button').forEach((x, idx) => { x.disabled = true; if (idx === item.b) x.classList.add('bon'); else if (idx === k) x.classList.add('faux'); });
      quiz.fait++; if (k === item.b) { quiz.bon++; A.gagner(10); }
      majXP();
      if (quiz.fait === Q.length) bilan();
    });
  }
  function bilan() {
    const Q = M.quiz || [], bon = quiz.bon, n = Q.length, el = document.getElementById('bilan');
    const badge = bon >= Math.ceil(n * 0.83) ? `Badge « ${M.badge || M.titre.toLowerCase()} »`
      : bon >= Math.ceil(n * 0.5) ? 'Badge « explorateur »' : null;
    if (badge) A.badge(M.id);
    terminerEtape(3);
    el.innerHTML = `
      <div class="kicker">Bilan du module</div>
      <div class="note">${bon} / ${n} — ${Math.round((bon / n) * 20)}/20</div>
      <p style="margin-top:8px;color:var(--ink2);font-size:15px;line-height:1.5">
        ${bon >= Math.ceil(n * 0.83) ? 'Tu maîtrises ce bloc : tu sais expliquer ce que tu as manipulé.'
        : bon >= Math.ceil(n * 0.5) ? 'Les bases sont là. Rejoue l\u2019atelier en changeant les réglages, puis relis une fiche, et refais le quiz.'
        : 'Reprends l\u2019atelier pas à pas, en changeant un seul réglage à la fois. Puis reviens au quiz.'}
      </p>
      ${badge ? `<span class="tagb">${badge} obtenu</span>` : ''}
      <div class="cta"><a class="btn p" href="index.html">Retour à l'accueil</a>
        <button class="btn s" id="refaire">Refaire le quiz</button>
        <a class="btn s" href="index.html#modules">Voir les autres blocs</a></div>`;
    el.classList.add('vu');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('refaire').onclick = () => {
      quiz.fait = 0; quiz.bon = 0;
      document.querySelectorAll('#quiz .q').forEach((q) => { q.classList.remove('repondu'); q.querySelectorAll('button').forEach((b) => { b.disabled = false; b.classList.remove('bon', 'faux'); }); });
      el.classList.remove('vu'); window.scrollTo({ top: document.getElementById('quiz').offsetTop - 80, behavior: 'smooth' });
    };
  }

  construireControles(); construireDefis(); construireFiches(); construireExperiences(); construireQuiz(); rendre(); majXP();
})();
