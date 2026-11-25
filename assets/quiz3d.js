/* Module « Le poste en 3D » : fiches, quiz et bilan (indépendants de WebGL). */
  /* quiz court, indépendant du moteur 3D (utilisable même sans WebGL) */
  (function () {
    const Q = [
      { q: 'Quel composant exécute les calculs ?', r: ['Le processeur', 'Le ventilateur', 'L\u2019alimentation', 'Le boîtier'], b: 0, e: 'Le processeur exécute les instructions ; les autres l\u2019alimentent, le refroidissent ou le protègent.' },
      { q: 'Que perd-on en éteignant le poste ?', r: ['Le contenu du SSD', 'Le contenu de la mémoire vive', 'Le processeur', 'La carte mère'], b: 1, e: 'La mémoire vive s\u2019efface faute de courant ; le SSD conserve les fichiers.' },
      { q: 'À quoi sert l\u2019alimentation ?', r: ['À refroidir', 'À transformer le 230 V en basses tensions continues', 'À calculer', 'À stocker les photos'], b: 1, e: 'Elle convertit le courant du secteur en tensions stables utilisables par les composants.' },
      { q: 'Pourquoi un ventilateur est-il indispensable ?', r: ['Pour faire du bruit', 'Pour évacuer la chaleur des composants', 'Pour alimenter la carte mère', 'Pour accélérer Internet'], b: 1, e: 'Sans évacuation de la chaleur, le processeur surchauffe et ralentit, ou s\u2019arrête pour se protéger.' },
    ];
    const zone = document.getElementById('quiz3d'), bilan = document.getElementById('bilan3d');
    let fait = 0, bon = 0;
    zone.innerHTML = Q.map((t, i) => `<article class="q" data-q="${i}"><h3>${i + 1}. ${t.q}</h3>
      <div class="rep">${t.r.map((r, k) => `<button data-k="${k}" data-i="${i}">${r}</button>`).join('')}</div>
      <div class="expl"><b>Explication.</b> ${t.e}</div></article>`).join('');
    zone.addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-k]'); if (!b) return;
      const art = b.closest('.q'); if (art.classList.contains('repondu')) return;
      const i = +b.dataset.i, k = +b.dataset.k;
      art.classList.add('repondu');
      art.querySelectorAll('button').forEach((x, idx) => { x.disabled = true; if (idx === Q[i].b) x.classList.add('bon'); else if (idx === k) x.classList.add('faux'); });
      fait++; if (k === Q[i].b) { bon++; window.Atelier.gagner(10, `poste3d:quiz:${i}`); }
      if (fait === Q.length) {
        bilan.innerHTML = `<div class="kicker">Bilan</div><div class="note">${bon} / ${Q.length} — ${Math.round(bon / Q.length * 20)}/20</div>
          <div class="cta"><a class="btn p" href="index.html">Retour à l'accueil</a><a class="btn s" href="module-composants.html">Refaire le module 2D</a></div>`;
        bilan.classList.add('vu');
        window.Atelier.terminer('poste3d', 3);
        if (bon === Q.length) window.Atelier.badge('poste3d'); else if (bon >= 2) window.Atelier.badge('poste3d-explorateur');
      }
    });
  })();
