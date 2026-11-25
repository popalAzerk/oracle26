/* Récit audio synchronisé : lecteur, sous-titres phrase par phrase, bulles animées.
   Données : window.RECIT (assets/recits/<id>.js, généré par recits/fabriquer.py).
   Montage : <section id="recit" data-recit="<id>" hidden></section> + ce script. */
(function () {
  const zone = document.getElementById('recit');
  if (!zone) return;
  const id = zone.dataset.recit;
  if (!zone.style.getPropertyValue('--c1') && window.MODULE && MODULE.couleur) { zone.style.setProperty('--c1', MODULE.couleur[0]); zone.style.setProperty('--c2', MODULE.couleur[1]); }
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICO = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    fermer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  function charger() {
    if (window.RECIT && window.RECIT.id === id) return monter(window.RECIT);
    const s = document.createElement('script');
    s.src = `assets/recits/${id}.js?v=${zone.dataset.v || '1'}`;
    s.onload = () => window.RECIT && monter(window.RECIT);
    document.head.appendChild(s);
  }

  function monter(R) {
    const qui = (p) => (p.qui === 'q' ? R.voix.q : R.voix.N);
    zone.hidden = false;
    zone.innerHTML = `
      <h2 class="sec"><span>Écoute d'abord · l'explication racontée</span><span>${mmss(R.duree)} · ${R.chapitres.length} chapitres · avec des images</span></h2>
      <div class="recit">
        <div class="recit-tete">
          <button class="recit-play" type="button" aria-label="Écouter l'explication">${ICO.play}</button>
          <div class="recit-titre"><b>${esc(R.titre)}</b>
            <span>Racontée par ${esc(R.voix.N)}, avec les questions d'${esc(R.voix.q)} · voix de synthèse</span></div>
          <div class="recit-vitesse" role="group" aria-label="Vitesse de lecture">
            <button type="button" data-v="0.85">Plus lent</button><button type="button" data-v="1" aria-pressed="true">Normal</button></div>
        </div>
        <div class="recit-barre">
          <input type="range" min="0" max="${R.duree}" step="0.1" value="0" aria-label="Position dans le récit">
          <div class="recit-reperes">${R.chapitres.map((c) => `<i style="left:${(c.debut / R.duree) * 100}%"></i>`).join('')}</div>
          <span class="recit-temps">0:00 / ${mmss(R.duree)}</span>
        </div>
        <div class="recit-chapitres">${R.chapitres.map((c, i) => `<button type="button" data-c="${i}"><b>${i + 1}</b>${esc(c.titre)}</button>`).join('')}</div>
        <div class="recit-sous" aria-hidden="true"><span class="recit-qui"></span><p>Appuie sur lecture : une voix t'explique, et des images apparaissent en bas de l'écran pour t'aider à comprendre.</p></div>
        <details class="recit-texte"><summary>Lire tout le texte</summary>
          ${R.chapitres.map((c, ci) => `<h4>${ci + 1}. ${esc(c.titre)}</h4>` + R.phrases.map((p, k) => (p.c === ci
            ? `<p data-k="${k}" class="${p.qui === 'q' ? 'q' : ''}"><span>${esc(qui(p))}</span>${esc(p.t)}</p>` : '')).join('')).join('')}
        </details>
        <audio preload="none" src="${R.audio}"></audio>
      </div>`;

    const $ = (s) => zone.querySelector(s);
    const audio = $('audio'), btn = $('.recit-play'), barre = $('input[type=range]'), temps = $('.recit-temps');
    const sous = $('.recit-sous p'), quiEl = $('.recit-qui'), chapBtns = [...zone.querySelectorAll('.recit-chapitres button')];
    const lignes = [...zone.querySelectorAll('.recit-texte p')];

    // bulle flottante (une seule pour la page)
    const bulle = document.createElement('aside');
    bulle.className = 'recit-bulle'; bulle.setAttribute('aria-live', 'polite'); bulle.hidden = true;
    bulle.innerHTML = `<div class="rb-tete"><b></b><button type="button" class="rb-pause" aria-label="Pause">${ICO.pause}</button><button type="button" class="rb-fermer" aria-label="Fermer l'image">${ICO.fermer}</button></div>
      <div class="rb-svg"></div><p></p>`;
    // grand écran : bulle flottante (visible même en manipulant le banc) ; téléphone : dans le lecteur, sous le sous-titre
    const petit = matchMedia('(max-width: 640px)');
    const placer = () => { if (petit.matches) zone.querySelector('.recit-sous').after(bulle); else document.body.appendChild(bulle); bulle.classList.toggle('integree', petit.matches); };
    placer(); petit.addEventListener('change', placer);
    let bulleActive = null, fermees = new Set(), kActif = -1, cActif = -1, raf = 0;

    function montrerBulle(b) {
      if (bulleActive === b) return;
      bulleActive = b;
      if (!b) { bulle.classList.remove('vue'); setTimeout(() => { if (!bulleActive) bulle.hidden = true; }, 260); return; }
      bulle.querySelector('b').textContent = b.titre;
      bulle.querySelector('.rb-svg').innerHTML = b.svg;
      bulle.querySelector('p').textContent = b.legende;
      bulle.hidden = false; requestAnimationFrame(() => bulle.classList.add('vue'));
      if (bulle.classList.contains('integree')) {          // téléphone : amener l'image à l'écran si l'enfant regarde le lecteur
        const r = zone.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) setTimeout(() => bulle.scrollIntoView({ block: 'nearest', behavior: reduit ? 'auto' : 'smooth' }), 60);
      }
    }
    function maj() {
      const t = audio.currentTime;
      barre.value = t; barre.style.setProperty('--p', `${(t / R.duree) * 100}%`);
      temps.textContent = `${mmss(t)} / ${mmss(R.duree)}`;
      let k = -1;
      for (let i = 0; i < R.phrases.length; i++) if (t >= R.phrases[i].debut - 0.05) k = i; else break;
      if (k !== kActif) {
        kActif = k;
        const p = R.phrases[k];
        if (p) {
          sous.textContent = p.t; quiEl.textContent = qui(p); quiEl.className = 'recit-qui' + (p.qui === 'q' ? ' q' : '');
          lignes.forEach((l) => l.classList.toggle('lu', +l.dataset.k === k));
          if (p.c !== cActif) { cActif = p.c; chapBtns.forEach((b, i) => b.classList.toggle('on', i === cActif)); const on = chapBtns[cActif]; if (on && on.parentNode.scrollWidth > on.parentNode.clientWidth) on.parentNode.scrollTo({ left: on.offsetLeft - 8, behavior: 'smooth' }); }
        }
      }
      const b = R.bulles.find((x) => t >= x.debut && t < x.fin && !fermees.has(x.id));
      montrerBulle(audio.paused && !b ? bulleActive : b || null);
    }
    const boucle = () => { maj(); if (!audio.paused) raf = requestAnimationFrame(boucle); };
    function etat() {
      const joue = !audio.paused;
      btn.innerHTML = joue ? ICO.pause : ICO.play; btn.setAttribute('aria-label', joue ? 'Mettre en pause' : 'Écouter l\'explication');
      bulle.querySelector('.rb-pause').innerHTML = joue ? ICO.pause : ICO.play;
      bulle.querySelector('.rb-pause').setAttribute('aria-label', joue ? 'Pause' : 'Reprendre');
      bulle.classList.toggle('arret', !joue);
      zone.querySelector('.recit').classList.toggle('joue', joue);
    }
    function basculer() {
      if (audio.paused) {
        if (window.Atelier && Atelier.stopVoix) Atelier.stopVoix();       // coupe la voix système des fiches
        audio.play().catch(() => {});
      } else audio.pause();
    }
    function aller(t) {
      const cible = Math.max(0, Math.min(R.duree - 0.05, t));
      // Safari iOS ignore currentTime tant que les métadonnées ne sont pas chargées (preload="none")
      if (audio.readyState < 1) { audio.addEventListener('loadedmetadata', () => { audio.currentTime = cible; maj(); }, { once: true }); audio.load(); }
      else audio.currentTime = cible;
      fermees.clear(); maj();
    }

    btn.addEventListener('click', basculer);
    bulle.querySelector('.rb-pause').addEventListener('click', basculer);
    bulle.querySelector('.rb-fermer').addEventListener('click', () => { if (bulleActive) fermees.add(bulleActive.id); montrerBulle(null); });
    audio.addEventListener('play', () => { etat(); cancelAnimationFrame(raf); boucle(); });
    audio.addEventListener('pause', () => { etat(); maj(); });
    audio.addEventListener('ended', () => { etat(); montrerBulle(null); });
    barre.addEventListener('input', () => aller(+barre.value));
    chapBtns.forEach((b, i) => b.addEventListener('click', () => { aller(R.chapitres[i].debut); if (audio.paused) basculer(); }));
    lignes.forEach((l) => l.addEventListener('click', () => { aller(R.phrases[+l.dataset.k].debut); if (audio.paused) basculer(); }));
    zone.querySelectorAll('.recit-vitesse button').forEach((b) => b.addEventListener('click', () => {
      audio.playbackRate = +b.dataset.v;
      zone.querySelectorAll('.recit-vitesse button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && bulleActive) bulle.querySelector('.rb-fermer').click(); });
    if (reduit) bulle.classList.add('fixe');
    window.__recit = { audio, R, aller, maj };   // crochet de test
  }
  charger();
})();
