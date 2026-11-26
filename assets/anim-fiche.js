/* Animations courtes des fiches (« En savoir plus »).
   Chaque page module charge assets/anims/<module>.js, qui remplit window.ANIMS_FICHES :
     { <id de fiche>: { legende: 'phrase courte', alt: 'description pour lecteur d’écran', svg: '<svg …>' } }
   Ce script place l'animation sous le titre de la fiche correspondante.
   - Animations en CSS uniquement (keyframes dans le <style> du SVG, classes préfixées a-<module>-<fiche>).
   - Bouton pause (critère WCAG 2.2.2) ; animation suspendue hors de l'écran (économie de batterie).
   - Mouvement réduit demandé : image fixe (l'état de base du SVG est conçu pour être lisible seul). */
(function () {
  'use strict';
  const PAUSE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  const LECTURE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  let obs = null;

  function poser() {
    const A = window.ANIMS_FICHES || {};
    document.querySelectorAll('.fiche details[data-fiche]').forEach((d) => {
      const art = d.closest('.fiche'), a = A[d.dataset.fiche];
      if (!art || !a || art.querySelector('.fiche-anim')) return;
      const fig = document.createElement('figure');
      fig.className = 'fiche-anim';
      fig.innerHTML = a.svg +
        `<figcaption><span>${a.legende}</span>` +
        `<button type="button" class="fa-pause" aria-pressed="false" aria-label="Mettre l’animation en pause">${PAUSE}</button></figcaption>`;
      const svg = fig.querySelector('svg');
      if (svg) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', a.alt || a.legende); svg.setAttribute('focusable', 'false'); }
      const h3 = art.querySelector('h3');
      if (h3) h3.after(fig); else art.prepend(fig);
      if (obs) obs.observe(fig);
    });
  }

  if ('IntersectionObserver' in window) {
    obs = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('hors', !e.isIntersecting)), { rootMargin: '80px' });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.fa-pause'); if (!b) return;
    const fig = b.closest('.fiche-anim'), fige = fig.classList.toggle('fige');
    b.setAttribute('aria-pressed', String(fige));
    b.setAttribute('aria-label', fige ? 'Relancer l’animation' : 'Mettre l’animation en pause');
    b.innerHTML = fige ? LECTURE : PAUSE;
  });

  poser();
  document.addEventListener('DOMContentLoaded', poser);
  // les fiches sont parfois construites après ce script : on surveille leur apparition
  const zone = document.getElementById('fiches');
  if (zone && 'MutationObserver' in window) new MutationObserver(poser).observe(zone, { childList: true });
})();
