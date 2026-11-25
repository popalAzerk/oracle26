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
      lea:  { nom: 'Nellia', classe: '5e',  avatar: '🦊', xp: 0, badges: [], fait: {}, note: {}, acquis: [] },
      noe:  { nom: 'Elyas',  classe: '3e',  avatar: '🦉', xp: 0, badges: [], fait: {}, note: {}, acquis: [] },
      manon:{ nom: 'Maël',   classe: '2de', avatar: '🐬', xp: 0, badges: [], fait: {}, note: {}, acquis: [] },
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
      // réussites déjà payées en XP (« module:quiz:3 », « module:defi:id ») : une bonne réponse ne rapporte qu'une fois
      p.acquis = Array.isArray(src.acquis) ? [...new Set(src.acquis.filter((k) => typeof k === 'string' && /^[\w:-]{1,60}$/.test(k)))].slice(0, 600) : [];
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
      b.textContent = 'Ta progression ne peut pas être enregistrée sur cet appareil (navigation privée ou stockage bloqué). Elle est gardée pendant cette visite, puis perdue en fermant le navigateur : pense à « Sauvegarder la progression ».';
      document.body.prepend(b);
    } else if (ok && b) b.remove();
  }

  let memoire = null;   // copie de travail quand le navigateur refuse d'enregistrer : la progression tient pendant la visite
  function lire() {
    if (!stockageOK && memoire) return JSON.parse(JSON.stringify(memoire));
    let brut = null;
    try { brut = localStorage.getItem(CLE); } catch (_) { return memoire ? JSON.parse(JSON.stringify(memoire)) : NEUF(); }
    if (!brut) return NEUF();
    try { return normaliser(JSON.parse(brut)); }
    catch (_) {
      // donnée illisible : on la met de côté avant qu'une prochaine écriture ne l'écrase
      try { if (!localStorage.getItem(CLE_SECOURS)) localStorage.setItem(CLE_SECOURS, brut); } catch (__) {}
      return NEUF();
    }
  }

  function ecrire(d) {
    d.maj = Date.now();
    memoire = JSON.parse(JSON.stringify(d));
    try {
      localStorage.setItem(CLE, JSON.stringify(d));
      signalerStockage(true);
    } catch (_) { signalerStockage(false); }
    window.dispatchEvent(new CustomEvent('atelier:maj', { detail: d }));
    return d;
  }
  const profil = () => { const d = lire(); return d.profils[d.actif] || d.profils.lea; };
  const profilId = () => lire().actif;
  function choisir(id) { const d = lire(); if (Object.prototype.hasOwnProperty.call(d.profils, id)) { d.actif = id; ecrire(d); } }

  /** gagner(25, 'composants:pose:cpu') ; terminer('composants', 3) ; badge('composants')
      Avec une clé, l'XP n'est donnée qu'une fois : refaire un quiz ou recharger la page ne rapporte plus rien.
      Renvoie true si l'XP a été comptée. */
  function gagner(xp, cle) {
    const d = lire(), p = d.profils[d.actif];
    if (cle) { if (p.acquis.includes(cle)) return false; p.acquis.push(cle); }
    p.xp += Math.max(0, +xp || 0); ecrire(d); return true;
  }
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
    // Safari efface le stockage d'un site après 7 jours sans visite, sauf stockage « persistant » ;
    // demandé ici, sur un geste de l'enfant, car Firefox affiche alors une question d'autorisation.
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
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
  /* ---------- voix des fiches : pistes audio enregistrées (même voix que les récits) ----------
     Chaque texte a sa piste assets/audio/voix/<empreinte>.mp3 ; l'empreinte (FNV-1a 32 bits du texte
     normalisé) est recalculée à l'identique par recits/voix_fiches.py. Si une piste manque, repli sur
     la synthèse du système. Un second clic sur le même bouton arrête la lecture. */
  const VOIX = 'assets/audio/voix/';
  const ICO_STOP = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:6px"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
  function empreinte(texte) {
    const t = String(texte).replace(/\s+/g, ' ').trim();
    let h = 0x811c9dc5;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }
  let piste = null, bouton = null;
  function remettreBouton() {
    if (bouton && bouton.dataset.repos != null) { bouton.innerHTML = bouton.dataset.repos; bouton.removeAttribute('aria-pressed'); bouton.classList.remove('joue'); }
    bouton = null;
  }
  function stop() {
    if (piste) { piste.pause(); piste.removeAttribute('src'); piste = null; }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    remettreBouton();
  }
  function synthese(texte) {
    if (!('speechSynthesis' in window)) { remettreBouton(); return false; }
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = 'fr-FR'; u.rate = 0.98;
    const v = speechSynthesis.getVoices().find((x) => /^fr/i.test(x.lang));
    if (v) u.voice = v;
    u.onend = remettreBouton;
    speechSynthesis.speak(u);
    return true;
  }
  function parler(texte, btn) {
    const h = empreinte(texte);
    const memeTexte = piste && piste.dataset.h === h;
    stop();
    if (memeTexte) return false;                                                       // second clic : arrêt
    document.querySelectorAll('audio').forEach((a) => { if (!a.paused) a.pause(); });   // pas deux voix en même temps
    if (btn) {
      bouton = btn; if (btn.dataset.repos == null) btn.dataset.repos = btn.innerHTML;
      btn.innerHTML = ICO_STOP + 'Arrêter'; btn.setAttribute('aria-pressed', 'true'); btn.classList.add('joue');
    }
    const a = new Audio(VOIX + h + '.mp3');
    a.dataset.h = h; a.preload = 'auto';
    piste = a;
    const repli = () => { if (piste === a) { piste = null; synthese(texte); } };
    a.addEventListener('ended', () => { if (piste === a) { piste = null; remettreBouton(); } });
    a.addEventListener('error', repli);
    a.play().catch((e) => { if (e && e.name === 'NotAllowedError') stop(); else repli(); });
    return true;
  }

  // test d'écriture au chargement : prévient tout de suite si le stockage est bloqué
  try { localStorage.setItem(CLE + '.test', '1'); localStorage.removeItem(CLE + '.test'); }
  catch (_) { const f = () => signalerStockage(false); if (document.body) f(); else document.addEventListener('DOMContentLoaded', f); }

  window.Atelier = { lire, ecrire, profil, profilId, choisir, gagner, terminer, badge, etape, niveau, exporter, importer, reinitialiser, voix: parler, stopVoix: stop, empreinte, esc, normaliser, stockageOK: () => stockageOK };
})();
