/* Atelier SVT & Techno — profils locaux, progression, sauvegarde.
   Aucun réseau, aucun compte : tout reste dans le navigateur de cet ordinateur. */
(function () {
  const CLE = 'atelier.profils.v1';
  const CLE_SECOURS = CLE + '.bak';

  // profils enregistrés avant le changement de prénoms : renommage appliqué une seule fois
  const RENOMMAGES = { 'Léa': 'Nellia', 'Noé': 'Elyas', 'Manon': 'Maël' };

  const NEUF = () => ({
    version: 2,
    profils: {
      lea:  { nom: 'Nellia', classe: '5e',  avatar: '🦊', xp: 0, badges: [], fait: {}, note: {} },
      noe:  { nom: 'Elyas',  classe: '3e',  avatar: '🦉', xp: 0, badges: [], fait: {}, note: {} },
      manon:{ nom: 'Maël',   classe: '2de', avatar: '🐬', xp: 0, badges: [], fait: {}, note: {} },
    },
    actif: 'lea',
    maj: Date.now(),
  });

  /** Échappe un texte avant insertion dans du HTML (prénom, classe… venant d'un fichier importé). */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Reconstruit un état sûr à partir de n'importe quel objet : seuls les champs connus et bien typés sont repris. */
  function normaliser(d) {
    const sur = NEUF();
    if (!d || typeof d !== 'object' || !d.profils || typeof d.profils !== 'object') throw new Error('fichier inattendu');
    const texte = (v, max, defaut) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : defaut);
    const entier = (v) => (Number.isFinite(+v) && +v >= 0 ? Math.min(Math.floor(+v), 1e6) : 0);
    let repris = 0;
    for (const id of Object.keys(sur.profils)) {
      const src = d.profils[id];
      if (!src || typeof src !== 'object') continue;
      const p = sur.profils[id];
      p.nom = texte(RENOMMAGES[src.nom] || src.nom, 30, p.nom);
      p.classe = texte(src.classe, 10, p.classe);
      p.avatar = texte(src.avatar, 4, p.avatar);
      p.xp = entier(src.xp);
      p.badges = Array.isArray(src.badges) ? [...new Set(src.badges.filter((b) => typeof b === 'string' && /^[\w-]{1,40}$/.test(b)))].slice(0, 50) : [];
      p.fait = {};
      if (src.fait && typeof src.fait === 'object') {
        for (const [m, n] of Object.entries(src.fait)) if (/^[\w-]{1,40}$/.test(m)) p.fait[m] = Math.min(entier(n), 10);
      }
      p.note = {};
      if (src.note && typeof src.note === 'object') {
        for (const [m, n] of Object.entries(src.note)) if (/^[\w-]{1,40}$/.test(m) && Number.isFinite(+n)) p.note[m] = +n;
      }
      repris++;
    }
    if (!repris) throw new Error('aucun profil reconnu');
    sur.actif = Object.prototype.hasOwnProperty.call(sur.profils, d.actif) ? d.actif : 'lea';
    return sur;
  }

  let stockageOK = true;
  function signalerStockage(ok) {
    if (ok === stockageOK) return;
    stockageOK = ok;
    window.dispatchEvent(new CustomEvent('atelier:stockage', { detail: { ok } }));
    let b = document.getElementById('atelier-stockage');
    if (!ok && !b && document.body) {
      b = document.createElement('div'); b.id = 'atelier-stockage'; b.setAttribute('role', 'status');
      b.textContent = 'Ta progression ne peut pas être enregistrée sur cet appareil (navigation privée ou stockage bloqué). Tu peux continuer, mais elle sera perdue en fermant la page.';
      document.body.prepend(b);
    } else if (ok && b) b.remove();
  }

  function lire() {
    try {
      const brut = localStorage.getItem(CLE);
      if (!brut) return NEUF();
      return normaliser(JSON.parse(brut));
    } catch (_) { return NEUF(); }
  }

  let persistanceDemandee = false;
  function ecrire(d) {
    d.maj = Date.now();
    try {
      localStorage.setItem(CLE, JSON.stringify(d));
      signalerStockage(true);
      // Safari efface le stockage d'un site après 7 jours sans visite, sauf stockage « persistant »
      if (!persistanceDemandee && navigator.storage && navigator.storage.persist) { persistanceDemandee = true; navigator.storage.persist().catch(() => {}); }
    } catch (_) { signalerStockage(false); }
    window.dispatchEvent(new CustomEvent('atelier:maj', { detail: d }));
    return d;
  }
  const profil = () => { const d = lire(); return d.profils[d.actif] || d.profils.lea; };
  const profilId = () => lire().actif;
  function choisir(id) { const d = lire(); if (Object.prototype.hasOwnProperty.call(d.profils, id)) { d.actif = id; ecrire(d); } }

  /** gagner(25) ; terminer('composants', 3) ; badge('composants') */
  function gagner(xp) { const d = lire(); d.profils[d.actif].xp += Math.max(0, +xp || 0); return ecrire(d); }
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
  /** Lit un fichier de sauvegarde, le valide champ par champ, garde une copie de l'état actuel, puis remplace. */
  function importer(fichier) {
    return new Promise((ok, ko) => {
      if (fichier.size > 200000) { ko(new Error('fichier trop gros')); return; }
      const r = new FileReader();
      r.onload = () => {
        try {
          const d = normaliser(JSON.parse(r.result));
          try { const avant = localStorage.getItem(CLE); if (avant) localStorage.setItem(CLE_SECOURS, avant); } catch (_) {}
          ecrire(d); ok(d);
        } catch (e) { ko(e); }
      };
      r.onerror = ko;
      r.readAsText(fichier);
    });
  }
  function reinitialiser() {
    try { const avant = localStorage.getItem(CLE); if (avant) localStorage.setItem(CLE_SECOURS, avant); localStorage.removeItem(CLE); } catch (_) {}
    window.dispatchEvent(new CustomEvent('atelier:maj', { detail: lire() }));
  }

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

  // test d'écriture au chargement : prévient tout de suite si le stockage est bloqué
  try { localStorage.setItem(CLE + '.test', '1'); localStorage.removeItem(CLE + '.test'); }
  catch (_) { const f = () => signalerStockage(false); if (document.body) f(); else document.addEventListener('DOMContentLoaded', f); }

  window.Atelier = { lire, ecrire, profil, profilId, choisir, gagner, terminer, badge, etape, niveau, exporter, importer, reinitialiser, voix: parler, stopVoix: stop, esc, normaliser, stockageOK: () => stockageOK };
})();
