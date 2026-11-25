/* « Le poste de travail en 3D » — WebGL / three.js (r160), géométrie procédurale, aucun modèle externe.
   Direction : châssis ouvert, palette Apple (graphite / aluminium) + un accent par pièce,
   éclatement sur un seul axe, cadrage automatique, ombre au sol, étiquettes numérotées projetées.
   Règles de perf : un seul contexte, rendu à la demande, dpr plafonné, pause hors écran / onglet caché,
   repli poster sans WebGL, état dans data-verify-state (une capture seule ne prouve rien). */
import * as THREE from './three.module.min.js';

const zone = document.getElementById('scene3d');
const A = window.Atelier;
const etat = { frames: 0, selection: null, places: 0, total: 7, webgl: false, vue: 'eclate', settled: false };

function poster(raison) {
  zone.innerHTML = `<div class="poster">
    <svg viewBox="0 0 420 320" role="img" aria-label="Schéma d'une tour d'ordinateur">
      <rect x="60" y="20" width="200" height="270" rx="14" fill="#EEF2F8" stroke="#94A3B8" stroke-width="3"/>
      <rect x="84" y="44" width="150" height="120" rx="8" fill="#DBE9FF" stroke="#2F5BFF" stroke-width="2.5"/>
      <rect x="132" y="86" width="54" height="40" rx="6" fill="#6AA6FF"/>
      <rect x="96" y="176" width="12" height="86" rx="4" fill="#B57BFF"/>
      <rect x="118" y="176" width="12" height="86" rx="4" fill="#B57BFF"/>
      <rect x="150" y="192" width="80" height="54" rx="8" fill="#0EA47A"/>
      <rect x="76" y="238" width="58" height="40" rx="6" fill="#FF9F0A"/>
      <circle cx="230" cy="210" r="24" fill="#E7EAF0" stroke="#8FA2C0" stroke-width="2"/>
    </svg>
    <p>${raison} Les fiches et le quiz restent utilisables.</p>
  </div>`;
  document.documentElement.dataset.scene3d = 'poster';
}

let renderer = null;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (!renderer) poster('Ton appareil ne prend pas en charge WebGL : voici le schéma.'); else demarrer();

function demarrer() {
  etat.webgl = true;
  const mobile = innerWidth < 700;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.setSize(zone.clientWidth, zone.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Vue 3D interactive du poste de travail');
  zone.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, zone.clientWidth / zone.clientHeight, 1, 900);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d2e0, 0.95));
  const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(85, 120, 95); key.castShadow = !mobile;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -140; key.shadow.camera.right = 140;
  key.shadow.camera.top = 140; key.shadow.camera.bottom = -140; key.shadow.bias = -0.0012; scene.add(key);
  const fill = new THREE.DirectionalLight(0xbdd4ff, 0.75); fill.position.set(-110, 45, 60); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.55); rim.position.set(-30, -60, -110); scene.add(rim);

  /* ---------- matériaux : neutres + accent ---------- */
  const GRAPHITE = 0x2e2f33, ALU = 0xe3e4e8, PCB = 0x24313f, METAL = 0x9aa3b2;
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.2, ...o });
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const cyl = (r, h, m, s = 26) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, s), m);
  const bord = (mesh, c = 0x11151b, o = 0.5) => {
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o })));
    return mesh;
  };
  const accent = (c) => mat(c, { roughness: 0.35, metalness: 0.3, emissive: new THREE.Color(c), emissiveIntensity: 0.12 });

  const pieces = [];
  const aPlacer = () => pieces.filter((p) => p.userData.logement);
  function piece(id, nom, role, couleur, logement, detail, n, construire) {
    const g = new THREE.Group(); construire(g);
    g.userData = { id, nom, role, couleur, logement, detail, n, place: false, eclate: new THREE.Vector3() };
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g); pieces.push(g); return g;
  }

  /* ---------- 1 · châssis ouvert (arêtes seules, pas de volume qui masque) ---------- */
  const cadre = new THREE.Group();
  const coque = bord(box(22, 46, 42, new THREE.MeshStandardMaterial({ color: ALU, transparent: true, opacity: 0.07, roughness: 0.15, metalness: 0.5, depthWrite: false })), 0x7c869b, 0.65);
  cadre.add(coque);
  const plancher = box(22, 0.8, 42, mat(ALU, { metalness: 0.65, roughness: 0.35 })); plancher.position.y = -23; cadre.add(plancher);
  const toit = box(22, 0.8, 42, mat(ALU, { metalness: 0.65, roughness: 0.35 })); toit.position.y = 23; cadre.add(toit);
  const montant = box(1.6, 46, 1.6, mat(0xb9c0cd, { metalness: 0.7 })); montant.position.set(10.2, 0, 20.2); cadre.add(montant);
  cadre.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  cadre.userData = { id: 'boitier', nom: 'Châssis', role: 'Supporte les composants, guide l\u2019air et limite le bruit.', couleur: '#94A3B8', logement: null, detail: 'acier 0,8 mm', n: 0, place: true };
  scene.add(cadre); pieces.push(cadre);

  /* ---------- 2 · carte mère ---------- */
  piece('cm', 'Carte mère', 'Relie tous les composants et distribue l\u2019énergie.', '#2F5BFF', new THREE.Vector3(-6.4, 0, 0),
    'PCB · format ATX', 1, (g) => {
      g.add(bord(box(1.2, 36, 32, mat(PCB, { roughness: 0.7, metalness: 0.08 })), 0x0d1620, 0.55));
      const socket = box(0.6, 8, 8, mat(0x1a2330, { metalness: 0.5 })); socket.position.set(0.9, 8, -4); g.add(socket);
      for (let i = 0; i < 4; i++) { const s = box(1.5, 1.8, 14, mat(0x39424f, { metalness: 0.65 })); s.position.set(1, -4 - i * 4.2, 3); g.add(s); }
      for (let i = 0; i < 5; i++) { const c = cyl(0.85, 2.2, mat(0x515b6a, { metalness: 0.8 })); c.rotation.z = Math.PI / 2; c.position.set(1, 13 - i * 3.4, 12); g.add(c); }
      const io = box(1.7, 8.6, 11, mat(METAL, { metalness: 0.9, roughness: 0.3 })); io.position.set(-0.1, 13.4, -11); g.add(io);
      const liseré = box(0.35, 35, 0.5, accent(0x2f5bff)); liseré.position.set(0.8, 0, 15.6); g.add(liseré);
    });

  /* ---------- 3 · processeur + ventirad ---------- */
  piece('cpu', 'Processeur', 'Exécute les instructions : c\u2019est le cerveau du poste.', '#6AA6FF', new THREE.Vector3(-4.2, 8, -4),
    '8 c\u0153urs · 3,8 GHz', 2, (g) => {
      g.add(bord(box(6.6, 0.9, 6.6, mat(0x2b3446, { metalness: 0.75, roughness: 0.25 })), 0x101726, 0.6));
      const radiateur = cyl(3.2, 2.8, mat(ALU, { metalness: 0.95, roughness: 0.22 }), 30); radiateur.position.y = 2.1; g.add(radiateur);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const ailette = box(0.14, 2.4, 6, mat(0xd7dde8, { metalness: 0.95 })); ailette.position.set(Math.cos(a) * 3.1, 2.1, Math.sin(a) * 3.1); ailette.rotation.y = a; g.add(ailette); }
      const anneau = cyl(3.35, 0.35, accent(0x6aa6ff), 30); anneau.position.y = 3.5; g.add(anneau);
    });

  /* ---------- 4 · mémoire vive (barrettes) ---------- */
  piece('ram', 'Mémoire vive', 'Garde les données en cours d\u2019utilisation. Effacée à l\u2019extinction.', '#B57BFF', new THREE.Vector3(-4.9, 9, 11),
    '2 × 8 Go · DDR4', 3, (g) => {
      for (let i = 0; i < 2; i++) {
        const x = i * 2.1;
        const tige = bord(box(0.55, 13, 3.1, mat(GRAPHITE, { roughness: 0.6 })), 0x14161a, 0.55);
        tige.position.x = x; g.add(tige);
        for (let k = 0; k < 4; k++) { const puce = box(0.35, 2.1, 2.4, mat(0x1d2026)); puce.position.set(x + 0.42, -4.4 + k * 2.9, 0); g.add(puce); }
        const barrette = box(0.22, 12.4, 0.5, accent(0xb57bff)); barrette.position.set(x + 0.4, 0, 1.5); g.add(barrette);
        const dents = box(0.5, 0.9, 3.1, mat(0xc9a227, { metalness: 0.9, roughness: 0.3 })); dents.position.set(x, -6.6, 0); g.add(dents);
      }
    });

  /* ---------- 5 · carte graphique ---------- */
  piece('gpu', 'Carte graphique', 'Calcule les images affichées à l\u2019écran.', '#0EA47A', new THREE.Vector3(-4.1, -7, 0),
    '3 ventilateurs · 8 Go', 4, (g) => {
      g.add(bord(box(2.6, 5, 25, mat(PCB)), 0x0d1620, 0.5));
      const carter = bord(box(1.8, 4.4, 24, mat(GRAPHITE, { roughness: 0.45 })), 0x121418, 0.5); carter.position.set(2, 0.3, 0); g.add(carter);
      for (const z of [-7.4, 0, 7.4]) {
        const f = cyl(2.9, 0.9, mat(0x1d2026, { roughness: 0.55 }), 24); f.rotation.z = Math.PI / 2; f.position.set(3, 0.4, z); g.add(f);
        const hub = cyl(0.8, 1, mat(0xa8b0bd, { metalness: 0.85 })); hub.rotation.z = Math.PI / 2; hub.position.set(3.3, 0.4, z); g.add(hub);
      }
      const liseré = box(0.3, 0.4, 24, accent(0x0ea47a)); liseré.position.set(2.1, 2.5, 0); g.add(liseré);
      const bracket = box(0.6, 4.6, 1.8, mat(METAL, { metalness: 0.9 })); bracket.position.set(1.4, 0.2, 13); g.add(bracket);
    });

  /* ---------- 6 · stockage M.2 ---------- */
  piece('ssd', 'Stockage SSD', 'Conserve les fichiers même hors tension.', '#FF9F0A', new THREE.Vector3(-4.3, -13, 9),
    'M.2 · 500 Go', 5, (g) => {
      g.add(bord(box(0.6, 2.2, 12, mat(PCB)), 0x0d1620, 0.5));
      const etiq = box(0.28, 1.7, 9.4, mat(0x2b2f36, { roughness: 0.7 })); etiq.position.set(0.42, 0, 0); g.add(etiq);
      const liseré = box(0.3, 0.35, 9.4, accent(0xff9f0a)); liseré.position.set(0.44, -0.6, 0); g.add(liseré);
      const dents = box(0.55, 1.9, 1.2, mat(0xc9a227, { metalness: 0.9 })); dents.position.set(0, 0, -6.2); g.add(dents);
    });

  /* ---------- 7 · alimentation ---------- */
  piece('psu', 'Alimentation', 'Transforme le 230 V du secteur en basses tensions continues.', '#E5342B', new THREE.Vector3(0, -18, -7),
    '230 V → 12 / 5 / 3,3 V', 6, (g) => {
      g.add(bord(box(18, 8.6, 13, mat(0x3a3d44, { metalness: 0.7, roughness: 0.35 })), 0x16181c, 0.55));
      const grille = cyl(4.1, 0.25, new THREE.MeshBasicMaterial({ color: 0x0b0d10 }), 26); grille.rotation.x = Math.PI / 2; grille.position.set(0, 0, 6.6); g.add(grille);
      const helice = cyl(3.7, 0.5, mat(0x9aa3b2, { metalness: 0.6 }), 26); helice.rotation.x = Math.PI / 2; helice.position.set(0, 0, 6.5); g.add(helice);
      const prise = box(3, 2.2, 0.7, mat(0x14161a)); prise.position.set(-5.4, 0, 6.7); g.add(prise);
      const liseré = box(1.2, 0.3, 12, accent(0xe5342b)); liseré.position.set(8.4, 3.4, 0); g.add(liseré);
    });

  /* ---------- 8 · ventilateur de façade ---------- */
  piece('fan', 'Ventilateur', 'Fait circuler l\u2019air pour évacuer la chaleur.', '#8FA2C0', new THREE.Vector3(0, 0, 17),
    '140 mm · 1 000 tr/min', 7, (g) => {
      g.add(bord(box(18, 18, 2, mat(ALU, { transparent: true, opacity: 0.28, metalness: 0.4, depthWrite: false })), 0x7c869b, 0.5));
      const moyeu = cyl(2.1, 2.2, mat(0x6f7889, { metalness: 0.7 })); moyeu.rotation.x = Math.PI / 2; g.add(moyeu);
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2;
        const pale = box(0.5, 7, 0.35, mat(0xd9dee7, { transparent: true, opacity: 0.92, roughness: 0.4 }));
        pale.position.set(Math.cos(a) * 4.2, Math.sin(a) * 4.2, 0.1); pale.rotation.z = a + 0.5; g.add(pale);
      }
      const anneau = new THREE.Mesh(new THREE.TorusGeometry(8.4, 0.28, 8, 40), accent(0x8fa2c0)); anneau.position.z = 1.1; g.add(anneau);
    });

  /* ---------- positions éclatées : décalages explicites, sans chevauchement ---------- */
  // disposition large (l'écran est en 2:1) : éventail horizontal, deux étages
  const ECLATE = {
    cm:  [-62, 4, 4], cpu: [-34, 26, -8], ram: [-12, 22, 14], gpu: [10, -20, 6],
    ssd: [30, -24, 18], psu: [50, -6, -4], fan: [56, 18, 18],
  };
  aPlacer().forEach((p) => {
    const e = ECLATE[p.userData.id] || [26, 0, 26];
    p.userData.eclate.set(e[0], e[1], e[2]);
    p.userData.place = false;
    p.position.copy(p.userData.logement).add(p.userData.eclate);
  });

  /* ---------- sol + réception d'ombre ---------- */

  const halo = document.createElement('canvas'); halo.width = halo.height = 128;
  const hc = halo.getContext('2d'); const hg = hc.createRadialGradient(64, 64, 6, 64, 64, 62);
  hg.addColorStop(0, 'rgba(72,96,130,0.22)'); hg.addColorStop(1, 'rgba(72,96,130,0)');
  hc.fillStyle = hg; hc.fillRect(0, 0, 128, 128);
  const disque = new THREE.Mesh(new THREE.PlaneGeometry(210, 170), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(halo), transparent: true, depthWrite: false }));
  disque.rotation.x = -Math.PI / 2; disque.position.y = -30; scene.add(disque);

  /* ---------- logements fantômes ---------- */
  const fantomes = new Map();
  aPlacer().forEach((p) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 7), new THREE.MeshBasicMaterial({ color: 0x2f5bff, transparent: true, opacity: 0.05 }));
    f.add(new THREE.LineSegments(new THREE.EdgesGeometry(f.geometry), new THREE.LineBasicMaterial({ color: 0x2f5bff, transparent: true, opacity: 0.3 })));
    f.position.copy(p.userData.logement); f.visible = false; scene.add(f); fantomes.set(p, f);
  });

  /* ---------- cadrage automatique ---------- */
  const orb = { theta: 0.72, phi: 1.16, r: 240, cible: new THREE.Vector3() };
  function cadrer() {
    scene.updateMatrixWorld(true); // sans cela Box3 lit des matrices périmées
    const b = new THREE.Box3();
    pieces.forEach((p) => b.expandByObject(p));
    b.getCenter(orb.cible);
    const min = b.min, max = b.max;
    const coins = [];
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) coins.push(new THREE.Vector3(x, y, z));
    // on part de près et on recule jusqu'à ce que les 8 coins tiennent dans 90 % du cadre
    let r = 40;
    for (let i = 0; i < 45; i++) {
      orb.r = r;
      camera.position.copy(camPos()); camera.lookAt(orb.cible);
      camera.updateMatrixWorld(true); camera.updateProjectionMatrix();
      let pire = 0;
      for (const c of coins) { const v = c.clone().project(camera); pire = Math.max(pire, Math.abs(v.x), Math.abs(v.y), v.z > 1 ? 2 : 0); }
      if (pire <= 0.9) break;
      r *= 1.07;
    }
    orb.r = r;
    etat.settled = false;
    marquer();
  }
  const camPos = () => new THREE.Vector3(
    orb.r * Math.sin(orb.phi) * Math.sin(orb.theta), orb.r * Math.cos(orb.phi), orb.r * Math.sin(orb.phi) * Math.cos(orb.theta)
  ).add(orb.cible);

  let salir = true, enVue = true;
  const marquer = () => { salir = true; };

  let pointeur = null;
  zone.addEventListener('pointerdown', (e) => { pointeur = { x: e.clientX, y: e.clientY, t: performance.now(), bouge: 0 }; zone.setPointerCapture(e.pointerId); });
  zone.addEventListener('pointermove', (e) => {
    if (!pointeur) return;
    const dx = e.clientX - pointeur.x, dy = e.clientY - pointeur.y;
    pointeur.bouge += Math.abs(dx) + Math.abs(dy);
    orb.theta -= dx * 0.008;
    orb.phi = Math.min(Math.PI - 0.3, Math.max(0.3, orb.phi - dy * 0.006));
    pointeur.x = e.clientX; pointeur.y = e.clientY; marquer();
  });
  zone.addEventListener('pointerup', (e) => {
    const court = pointeur && performance.now() - pointeur.t < 430 && pointeur.bouge < 10;
    pointeur = null; if (court) choisir(e.clientX, e.clientY);
  });
  zone.addEventListener('pointercancel', () => { pointeur = null; });
  zone.addEventListener('wheel', (e) => { e.preventDefault(); orb.r = Math.min(orb.r * 1.9, Math.max(40, orb.r + e.deltaY * 0.22)); marquer(); }, { passive: false });
  zone.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowLeft') orb.theta += 0.12;
    else if (k === 'ArrowRight') orb.theta -= 0.12;
    else if (k === 'ArrowUp') orb.phi = Math.max(0.3, orb.phi - 0.09);
    else if (k === 'ArrowDown') orb.phi = Math.min(Math.PI - 0.3, orb.phi + 0.09);
    else if (k === '+' || k === '=') orb.r = Math.max(40, orb.r - 12);
    else if (k === '-') orb.r = Math.min(orb.r * 1.9, orb.r + 12);
    else return;
    e.preventDefault(); marquer();
  });
  zone.tabIndex = 0;

  /* ---------- sélection ---------- */
  const raycaster = new THREE.Raycaster();
  const surligne = (g, on) => g.traverse((o) => {
    if (o.isMesh && o.material && o.material.emissive) { o.material.emissive.setHex(on ? 0x2f5bff : 0x000000); o.material.emissiveIntensity = on ? 0.7 : 0; }
  });
  function choisir(cx, cy) {
    const r = zone.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
    const hits = raycaster.intersectObjects(aPlacer(), true);
    if (!hits.length) { selectionner(null); return; }
    let o = hits[0].object; while (o && !o.userData.id) o = o.parent;
    if (!o) { selectionner(null); return; }
    if (!o.userData.place) { placer(o); return; }
    selectionner(o);
  }
  function selectionner(g) {
    pieces.forEach((p) => surligne(p, false));
    etat.selection = g ? g.userData.id : null;
    if (g) surligne(g, true);
    document.querySelectorAll('.puce-piece').forEach((b) => b.classList.toggle('on', !!g && b.dataset.piece === g.userData.id));
    document.querySelectorAll('.etiquette3d').forEach((b) => b.classList.toggle('ouvert', !!g && b.dataset.piece === g.userData.id));
    majPanneau(g); marquer();
  }
  function placer(g) {
    g.userData.place = true; g.position.copy(g.userData.logement);
    const f = fantomes.get(g); if (f) f.visible = false;
    etat.places = aPlacer().filter((p) => p.userData.place).length;
    selectionner(g); majProgression(); marquer();
    if (etat.places >= aPlacer().length) reussi('assemble');
  }
  function eclater(v) {
    aPlacer().forEach((p) => {
      p.userData.place = !v;
      p.position.copy(p.userData.logement);
      if (v) p.position.add(p.userData.eclate);
      const f = fantomes.get(p); if (f) f.visible = v;
    });
    etat.places = aPlacer().filter((p) => p.userData.place).length;
    majProgression(); marquer();
  }
  function vue(nom) {
    etat.vue = nom;
    if (nom === 'eclate') { orb.theta = 0.3; orb.phi = 1.2; eclater(true); cadrer(); }
    if (nom === 'face') { orb.theta = 0.12; orb.phi = 1.34; eclater(false); cadrer(); }
    if (nom === 'dessus') { orb.theta = 0.5; orb.phi = 0.62; eclater(false); cadrer(); }
    if (nom === 'interieur') { orb.theta = 1.5; orb.phi = 1.3; orb.r = 96; eclater(false); marquer(); }
    marquer();
  }

  /* ---------- étiquettes projetées ---------- */
  const boiteEtiquettes = document.getElementById('etiquettes3d');
  const etiquettes = aPlacer().map((p) => {
    const d = document.createElement('button');
    d.className = 'etiquette3d'; d.type = 'button';
    d.dataset.piece = p.userData.id;
    d.setAttribute('aria-label', p.userData.nom);
    d.innerHTML = `<b style="--c:${p.userData.couleur}">${p.userData.n}</b><span>${p.userData.nom}</span>`;
    d.addEventListener('pointerenter', () => d.classList.add('ouvert'));
    d.addEventListener('pointerleave', () => { if (etat.selection !== p.userData.id) d.classList.remove('ouvert'); });
    d.addEventListener('click', () => { if (!p.userData.place) placer(p); else selectionner(p); });
    boiteEtiquettes.appendChild(d);
    return { el: d, p };
  });
  const v3 = new THREE.Vector3();
  function placerEtiquettes() {
    const r = zone.getBoundingClientRect();
    // 1. projection
    const places = etiquettes.map(({ el, p }) => {
      p.getWorldPosition(v3); v3.y += 4;
      const pr = v3.clone().project(camera);
      const dedans = pr.z < 1 && Math.abs(pr.x) < 1 && Math.abs(pr.y) < 1;
      const x = (pr.x * 0.5 + 0.5) * r.width, y = (-pr.y * 0.5 + 0.5) * r.height;
      el.style.opacity = dedans ? '1' : '0';
      el.style.pointerEvents = dedans ? 'auto' : 'none';
      return { el, x, y, dedans };
    });
    // 2. anti-chevauchement : on écarte verticalement les pastilles trop proches
    const vis = places.filter((o) => o.dedans);
    for (let passe = 0; passe < 6; passe++) {
      for (let i = 0; i < vis.length; i++) {
        for (let j = i + 1; j < vis.length; j++) {
          const a = vis[i], b = vis[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const trop = Math.abs(dx) < 26 && Math.abs(dy) < 26;
          if (!trop) continue;
          const pousse = (26 - Math.abs(dy)) / 2 + 1;
          const sens = dy >= 0 ? 1 : -1;
          a.y -= pousse * sens * 0.5; b.y += pousse * sens * 0.5;
        }
      }
    }
    // 3. application
    places.forEach((o) => {
      o.el.style.transform = `translate(-50%,-50%) translate(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px)`;
    });
  }

  /* ---------- boucle ---------- */
  const obs = new IntersectionObserver((es) => { enVue = es[0].isIntersecting; if (enVue) marquer(); }, { threshold: 0.05 });
  obs.observe(zone);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) marquer(); });

  function boucle() {
    requestAnimationFrame(boucle);
    if (!enVue || document.hidden) return;
    const cible = camPos();
    if (camera.position.distanceTo(cible) > 0.4) { camera.position.lerp(cible, 0.2); salir = true; } else if (!etat.settled) { camera.position.copy(cible); etat.settled = true; }
    camera.lookAt(orb.cible);
    aPlacer().forEach((g) => {
      if (!g.userData.place) return;
      if (g.position.distanceTo(g.userData.logement) > 0.08) { g.position.lerp(g.userData.logement, 0.24); salir = true; }
    });
    if (salir) {
      renderer.render(scene, camera);
      placerEtiquettes();
      salir = false; etat.frames++;
      zone.dataset.verifyState = JSON.stringify({
        frames: etat.frames, webgl: etat.webgl, selection: etat.selection, places: etat.places,
        total: aPlacer().length, vue: etat.vue, settled: etat.settled,
        camera: [Math.round(orb.theta * 100) / 100, Math.round(orb.phi * 100) / 100, Math.round(orb.r)]
      });
      document.getElementById('hud-cam').textContent = `θ ${(orb.theta * 180 / Math.PI).toFixed(0)}° · φ ${(orb.phi * 180 / Math.PI).toFixed(0)}° · recul ${Math.round(orb.r)}`;
    }
  }
  requestAnimationFrame(boucle);

  addEventListener('resize', () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5));
    renderer.setSize(zone.clientWidth, zone.clientHeight, false);
    camera.aspect = zone.clientWidth / zone.clientHeight; camera.updateProjectionMatrix(); cadrer();
  });

  /* ---------- contrôles ---------- */
  document.querySelectorAll('[data-vue]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-vue]').forEach((x) => x.classList.toggle('on', x === b));
    vue(b.dataset.vue);
  }));
  document.getElementById('btn-eclate').addEventListener('click', () => {
    eclater(true); cadrer();
    document.querySelectorAll('[data-vue]').forEach((x) => x.classList.toggle('on', x.dataset.vue === 'eclate'));
  });

  const puces = document.getElementById('puces');
  aPlacer().forEach((p) => {
    const b = document.createElement('button');
    b.className = 'puce-piece'; b.dataset.piece = p.userData.id;
    b.innerHTML = `<i style="--c:${p.userData.couleur}"></i>${p.userData.nom}`;
    b.addEventListener('click', () => { if (!p.userData.place) placer(p); else selectionner(p); });
    puces.appendChild(b);
  });

  function majPanneau(g) {
    const b = document.getElementById('fiche3d');
    if (!g) { b.innerHTML = `<p class="vide">Clique une pièce dans la scène, son étiquette, ou choisis-la dans la liste.</p>`; return; }
    const u = g.userData;
    b.innerHTML = `
      <span class="role" style="--c:${u.couleur}">${u.place ? 'en place' : 'à placer'}</span>
      <h3><span class="num">${u.n || ''}</span>${u.nom}</h3>
      <p>${u.role}</p><p class="detail">${u.detail || ''}</p>
      <button class="dire" data-lire="${u.id}">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:6px"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>Écouter</button>`;
    b.querySelector('[data-lire]').addEventListener('click', () => A.voix(`${u.nom}. ${u.role}`));
  }

  const faits = new Set(), identifiees = new Set();
  function majProgression() {
    const n = aPlacer().length;
    document.getElementById('compteur').textContent = `${etat.places} / ${n}`;
    const barre = document.querySelector('#barre3d i'); if (barre) barre.style.width = (etat.places / n * 100) + '%';
  }
  function reussi(id) {
    if (faits.has(id)) return;
    faits.add(id);
    const el = document.getElementById('defi-' + id);
    if (el) { el.classList.add('fait'); el.querySelector('.st').textContent = '✓ réussi'; }
    A.gagner(id === 'assemble' ? 30 : 15);
    const b = document.getElementById('bravo');
    b.textContent = id === 'assemble' ? 'Défi réussi : toutes les pièces sont en place.' : 'Défi réussi : tu as identifié les cinq pièces.';
    b.classList.add('vu'); setTimeout(() => b.classList.remove('vu'), 4000);
    majXP();
    if (faits.size >= 2) { A.terminer('poste3d', 3); majXP(); }
  }
  const _sel = selectionner;
  selectionner = (g) => { _sel(g); if (g && g.userData.logement) { identifiees.add(g.userData.id); if (identifiees.size >= 5) reussi('identifier'); } };
  function majXP() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    document.getElementById('xp').innerHTML = `<span class="lvl">⭐ Niveau ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div><small>${p.xp} XP · ${p.nom} · ${p.classe}</small>`;
  }

  vue('eclate'); camera.position.copy(camPos()); camera.lookAt(orb.cible);
  majPanneau(null); majXP(); majProgression();
  window.__scene = { etat, pieces, aPlacer, eclater, vue, selectionner, placer, orb, marquer, camera, cadrer };
}
