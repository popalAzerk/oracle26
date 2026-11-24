/* Atelier SVT & Techno — profils locaux, progression, sauvegarde.
   Aucun réseau, aucun compte : tout reste dans le navigateur de cet ordinateur. */
(function () {
  const CLE = 'atelier.profils.v1';

  const NEUF = () => ({
    version: 1,
    profils: {
      lea:  { nom: 'Léa',   classe: '5e',   avatar: '🦊', xp: 0, badges: [], fait: {}, note: {} },
      noe:  { nom: 'Noé',   classe: '3e',   avatar: '🦉', xp: 0, badges: [], fait: {}, note: {} },
      manon:{ nom: 'Manon', classe: '2de',  avatar: '🐬', xp: 0, badges: [], fait: {}, note: {} },
    },
    actif: 'lea',
    maj: Date.now(),
  });

  function lire() {
    try {
      const brut = localStorage.getItem(CLE);
      if (!brut) return NEUF();
      const d = JSON.parse(brut);
      if (!d || !d.profils) return NEUF();
      return d;
    } catch (_) { return NEUF(); }
  }
  function ecrire(d) {
    d.maj = Date.now();
    localStorage.setItem(CLE, JSON.stringify(d));
    window.dispatchEvent(new CustomEvent('atelier:maj', { detail: d }));
    return d;
  }
  const profil = () => { const d = lire(); return d.profils[d.actif] || d.profils.lea; };
  const profilId = () => lire().actif;
  function choisir(id) { const d = lire(); if (d.profils[id]) { d.actif = id; ecrire(d); } }

  /** gagner(25) ; terminer('composants', 3) ; badge('composants') */
  function gagner(xp) { const d = lire(); d.profils[d.actif].xp += xp; return ecrire(d); }
  function terminer(module, etapes) {
    const d = lire(), p = d.profils[d.actif];
    p.fait[module] = Math.max(p.fait[module] || 0, etapes);
    return ecrire(d);
  }
  function badge(nom) {
    const d = lire(), p = d.profils[d.actif];
    if (!p.badges.includes(nom)) { p.badges.push(nom); ecrire(d); return true; }
    return false;
  }
  function etape(module) { return profil().fait[module] || 0; }
  function niveau(xp) { return Math.floor(xp / 200) + 1; }
  function exporter() {
    const d = lire();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 1)], { type: 'application/json' }));
    a.download = 'atelier-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function importer(fichier) {
    return new Promise((ok, ko) => {
      const r = new FileReader();
      r.onload = () => {
        try {
          const d = JSON.parse(r.result);
          if (!d.profils) throw new Error('fichier inattendu');
          ecrire(d); ok(d);
        } catch (e) { ko(e); }
      };
      r.onerror = ko;
      r.readAsText(fichier);
    });
  }
  function reinitialiser() { localStorage.removeItem(CLE); window.dispatchEvent(new CustomEvent('atelier:maj', { detail: lire() })); }

  /* --- voix : lit un texte en français avec la voix du système --- */
  function parler(texte) {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = 'fr-FR'; u.rate = 0.98; u.pitch = 1;
    const v = speechSynthesis.getVoices().find((x) => /^fr/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
    return true;
  }
  const stop = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };

  window.Atelier = { lire, ecrire, profil, profilId, choisir, gagner, terminer, badge, etape, niveau, exporter, importer, reinitialiser, voix: parler, stopVoix: stop };
})();
