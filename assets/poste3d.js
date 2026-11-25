/* « Le poste de travail en 3D » — v4, modélisation détaillée à l'échelle réelle (1 unité = 1 mm).
   three.js r160, géométrie 100 % procédurale, textures générées au canvas, environnement PMREM
   construit à la volée (aucun fichier externe, aucune licence tierce à créditer).
   Cotes réelles utilisées : carte mère ATX 305×244×1,6 · DIMM 133,35×31,25 · LGA1700 45×37,5 ·
   M.2 2280 22×80 · ATX PSU 150×86×140 · ventilateur 140×25 · tour 210×460×440.
   Perf : un seul contexte, rendu à la demande, dpr plafonné, pause hors écran, repli poster. */
import * as THREE from './three.module.min.js';
import { GLTFLoader } from './three-addons/GLTFLoader.js?v=1';

const zone = document.getElementById('scene3d');
const A = window.Atelier;
const QA = /[?&]qa\b/.test(location.search);   // crochets de test exposés seulement avec ?qa
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
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' }); } catch (e) { renderer = null; }
if (!renderer) poster('Ton appareil ne prend pas en charge WebGL : voici le schéma.'); else demarrer();

/* ------------------------------------------------------------------ */
/* textures procédurales (canvas) — nettes, légères, sans licence       */
/* ------------------------------------------------------------------ */
function texCircuit(base = '#1d3a2a', trace = '#2f6b46', silk = '#c9d6cf') {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  // pistes
  g.strokeStyle = trace; g.lineWidth = 2;
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 190; i++) {
    let x = Math.floor(rnd() * 32) * 16, y = Math.floor(rnd() * 32) * 16;
    g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      if (rnd() > 0.5) x += (rnd() > 0.5 ? 16 : -16) * 2; else y += (rnd() > 0.5 ? 16 : -16) * 2;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  // pastilles
  g.fillStyle = '#caa53d';
  for (let i = 0; i < 220; i++) { g.beginPath(); g.arc(rnd() * 512, rnd() * 512, 1.6, 0, 7); g.fill(); }
  // sérigraphie
  g.strokeStyle = silk; g.lineWidth = 1.6; g.globalAlpha = 0.75;
  for (let i = 0; i < 26; i++) { const x = rnd() * 480, y = rnd() * 480; g.strokeRect(x, y, 10 + rnd() * 50, 6 + rnd() * 22); }
  g.globalAlpha = 0.9; g.fillStyle = silk; g.font = 'bold 11px ui-monospace,monospace';
  g.fillText('ATELIER  REV 4', 18, 26); g.fillText('ATX 305 × 244', 18, 500);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function texBrosse() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const y = Math.random() * 256, v = 100 + Math.random() * 90;
    g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = Math.random() * 1.4;
    g.beginPath(); g.moveTo(Math.random() * 256, y); g.lineTo(Math.random() * 256, y); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function texPlastique() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); g.fillStyle = '#7d7d7d'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 5000; i++) { const v = 110 + Math.random() * 40; g.fillStyle = `rgba(${v},${v},${v},.5)`; g.fillRect(Math.random() * 128, Math.random() * 128, 1.4, 1.4); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function demarrer() {
  etat.webgl = true;
  const mobile = innerWidth < 700;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.setSize(zone.clientWidth, zone.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Vue 3D interactive du poste de travail, pièces à l\u2019échelle réelle');
  zone.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, zone.clientWidth / zone.clientHeight, 2, 12000);

  /* ---------- environnement studio (PMREM) : reflets crédibles sans HDR externe ---------- */
  (function environnement() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const s = new THREE.Scene();
    const plane = new THREE.PlaneGeometry(3000, 3000);
    const pan = (hex, intensite, pos, rot) => {
      const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(intensite), side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]); m.rotation.set(rot[0], rot[1], rot[2]); s.add(m);
    };
    pan(0xffffff, 1.0, [0, 1400, 0], [Math.PI / 2, 0, 0]);      // ciel
    pan(0xe9edf2, 0.6, [0, -900, 0], [-Math.PI / 2, 0, 0]);      // sol
    pan(0xffffff, 2.2, [-1200, 500, 700], [0, Math.PI / 3, 0]);  // boîte à lumière
    pan(0xfff3e2, 0.75, [1300, 300, -600], [0, -Math.PI / 4, 0]);
    pan(0xf2f5f9, 0.9, [0, 200, -1400], [0, 0, 0]);
    scene.environment = pmrem.fromScene(s, 0.05).texture;
    pmrem.dispose();
  })();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c3d2, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.5); key.position.set(420, 700, 520); key.castShadow = !mobile;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 100, far: 3200 });
  key.shadow.bias = -0.0006; scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9dcff, 0.6); fill.position.set(-600, 260, 380); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(-150, -320, -620); scene.add(rim);

  /* ---------- matières ---------- */
  const TPCB = texCircuit(), TBR = texBrosse(), TPL = texPlastique();
  TBR.repeat.set(6, 2); TPL.repeat.set(3, 3);
  const ALU = new THREE.MeshStandardMaterial({ color: 0xe2e5ea, metalness: 0.96, roughness: 0.28, roughnessMap: TBR, envMapIntensity: 1.35 });
  const ACIER = new THREE.MeshStandardMaterial({ color: 0xb9c0cc, metalness: 0.92, roughness: 0.42, roughnessMap: TBR });
  const PLASTIQUE = new THREE.MeshStandardMaterial({ color: 0x35373c, metalness: 0.08, roughness: 0.68, roughnessMap: TPL, envMapIntensity: 0.6 });
  const PLASTIQUE_CLAIR = new THREE.MeshStandardMaterial({ color: 0xf0f2f6, metalness: 0.06, roughness: 0.5, roughnessMap: TPL, envMapIntensity: 0.7 });
  TPCB.repeat.set(0.5, 0.5);
  const PCB = new THREE.MeshStandardMaterial({ map: TPCB, color: 0xffffff, metalness: 0.2, roughness: 0.7, roughnessMap: TPL, envMapIntensity: 0.5 });
  const OR = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 1, roughness: 0.28 });
  const CUIVRE = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 1, roughness: 0.35 });
  const acc = (hex) => new THREE.MeshStandardMaterial({ color: hex, metalness: 0.4, roughness: 0.38, emissive: new THREE.Color(hex), emissiveIntensity: 0.16 });
  // verre « simple » (transparence) : la transmission physique imposait une seconde passe de rendu de toute la scène
  const VERRE = new THREE.MeshStandardMaterial({ color: 0xdfe8f5, metalness: 0.1, roughness: 0.08, transparent: true, opacity: 0.22, depthWrite: false });

  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const cyl = (r, h, m, s = 24, creux = false) => {
    if (!creux) return new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, s), m);
    // anneau : le cadre du ventilateur, ouvert au centre pour laisser voir les pales
    const forme = new THREE.Shape();
    forme.absarc(0, 0, r, 0, Math.PI * 2, false);
    const trou = new THREE.Path(); trou.absarc(0, 0, r * 0.86, 0, Math.PI * 2, true);
    forme.holes.push(trou);
    const geo = new THREE.ExtrudeGeometry(forme, { depth: h, bevelEnabled: false, curveSegments: s });
    geo.translate(0, 0, -h / 2); geo.rotateX(-Math.PI / 2);
    return new THREE.Mesh(geo, m);
  };
  const ar = (mesh, c = 0x0e1116, o = 0.45) => { mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o }))); return mesh; };

  const pieces = [];
  const aPlacer = () => pieces.filter((p) => p.userData.logement);
  function piece(id, nom, role, couleur, logement, detail, n, construire) {
    const g = new THREE.Group(); construire(g);
    g.userData = { id, nom, role, couleur, logement, detail, n, place: false, eclate: new THREE.Vector3() };
    // clones de matériaux par pièce : indispensable pour que le surlignage ne bave pas
    const clones = new Map();
    g.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
      let c = clones.get(o.material.uuid);
      if (!c) { c = o.material.clone(); if (o.material.emissive) c.userData.base = o.material.emissive.getHex(); clones.set(o.material.uuid, c); }
      o.material = c;
    });
    scene.add(g); pieces.push(g);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  /* ================= 0 · châssis 210 × 460 × 440 ================= */
  const chassis = new THREE.Group();
  {
    const T = 1.2, W = 210, H = 460, D = 440;
    const panneau = (w, h, d, x, y, z, m) => { const p = box(w, h, d, m); p.position.set(x, y, z); chassis.add(p); return p; };
    panneau(W, T, D, 0, -H / 2, 0, ACIER);              // plancher
    panneau(W, T, D, 0, H / 2, 0, ACIER);               // plafond
    panneau(T, H, D, -W / 2, 0, 0, ACIER);              // flanc gauche (côté carte mère)
    panneau(W, H, T, 0, 0, -D / 2, ACIER);              // arrière
    // panneau avant : cadre percé + grille
    panneau(W, 60, T, 0, H / 2 - 30, D / 2, PLASTIQUE);
    panneau(W, 90, T, 0, -H / 2 + 45, D / 2, PLASTIQUE);
    panneau(24, H - 150, T, -W / 2 + 12, 0, D / 2, PLASTIQUE);
    panneau(24, H - 150, T, W / 2 - 12, 0, D / 2, PLASTIQUE);
    // grille avant (barreaux)
    for (let i = 0; i < 9; i++) { const b = box(W - 60, 5, 4, PLASTIQUE); b.position.set(0, -120 + i * 26, D / 2 - 3); chassis.add(b); }
    // panneau latéral vitré
    const vitre = box(T * 0.6, H - 40, D - 30, VERRE); vitre.position.set(W / 2 + 1, 0, 0); chassis.add(vitre);
    // vis de panneau
    for (const [y, z] of [[H / 2 - 20, D / 2 - 20], [H / 2 - 20, -D / 2 + 20], [-H / 2 + 20, D / 2 - 20], [-H / 2 + 20, -D / 2 + 20]]) {
      const v = cyl(4, 6, ACIER, 14); v.rotation.z = Math.PI / 2; v.position.set(W / 2 + 3, y, z); chassis.add(v);
    }
    // pieds
    for (const [x, z] of [[-W / 2 + 24, D / 2 - 24], [W / 2 - 24, D / 2 - 24], [-W / 2 + 24, -D / 2 + 24], [W / 2 - 24, -D / 2 + 24]]) {
      const p = cyl(11, 12, PLASTIQUE, 18); p.position.set(x, -H / 2 - 6, z); chassis.add(p);
    }
  }
  chassis.userData = { id: 'boitier', nom: 'Châssis', role: 'Supporte les composants, guide l\u2019air et limite le bruit.', couleur: '#94A3B8', logement: null, detail: '210 × 460 × 440 mm · acier 1 mm', n: 0, place: true };
  {
    const clones = new Map();
    chassis.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
      let c = clones.get(o.material.uuid);
      if (!c) { c = o.material.clone(); if (o.material.emissive) c.userData.base = o.material.emissive.getHex(); clones.set(o.material.uuid, c); }
      o.material = c;
    });
  }
  scene.add(chassis); pieces.push(chassis);

  /* ================= 1 · carte mère ATX 305 × 244 ================= */
  piece('cm', 'Carte mère', 'Relie tous les composants et distribue l\u2019énergie.', '#2F5BFF', new THREE.Vector3(-96, 10, 40),
    'ATX 305 × 244 mm · PCB 1,6 mm', 1, (g) => {
      const pcb = ar(box(1.6, 244, 305, PCB), 0x0b1410, 0.5); g.add(pcb);
      // socket LGA1700 45 × 37,5 + levier
      const soc = ar(box(6, 45, 37.5, PLASTIQUE), 0x11151b, 0.5); soc.position.set(3.4, 46, -70); g.add(soc);
      const levier = cyl(1.6, 58, ACIER, 10); levier.rotation.x = Math.PI / 2; levier.position.set(6.6, 22, -70); g.add(levier);
      // 4 slots DIMM 133,35 mm
      for (let i = 0; i < 4; i++) {
        const slot = box(6, 133.35, 8, PLASTIQUE); slot.position.set(3.4, 84, 40 + i * 9.2); g.add(slot);
        const dents = box(2, 120, 3, OR); dents.position.set(6.2, 84, 40 + i * 9.2); g.add(dents);
      }
      // PCIe x16 (89 mm) + x1 (25 mm)
      const pcie = box(10, 89, 8, PLASTIQUE); pcie.position.set(5.4, -34, -60); g.add(pcie);
      const loquet = box(4, 26, 10, PLASTIQUE_CLAIR); loquet.position.set(5.4, -82, -60); g.add(loquet);
      const pcie1 = box(10, 25, 7, PLASTIQUE); pcie1.position.set(5.4, -96, -60); g.add(pcie1);
      // connecteur 24 broches + EPS 8 broches
      const atx24 = box(8, 52, 12, PLASTIQUE_CLAIR); atx24.position.set(4.4, 78, 132); g.add(atx24);
      const eps = box(8, 24, 12, PLASTIQUE_CLAIR); eps.position.set(4.4, 108, -40); g.add(eps);
      // condensateurs (instanciés) + chokes + puces
      const cond = new THREE.InstancedMesh(new THREE.CylinderGeometry(3.2, 3.2, 9, 14), ALU, 14);
      const choke = new THREE.InstancedMesh(new THREE.BoxGeometry(9, 9, 9), PLASTIQUE, 8);
      const d = new THREE.Object3D();
      for (let i = 0; i < 14; i++) { d.position.set(6.5, 6 + (i % 7) * 13, -20 + Math.floor(i / 7) * 16); d.rotation.set(0, 0, Math.PI / 2); d.updateMatrix(); cond.setMatrixAt(i, d.matrix); }
      for (let i = 0; i < 8; i++) { d.position.set(7, 60 + (i % 4) * 12, -20 + Math.floor(i / 4) * 14); d.rotation.set(0, 0, 0); d.updateMatrix(); choke.setMatrixAt(i, d.matrix); }
      g.add(cond, choke);
      // dissipateur VRM + puce chipset
      const vrm = box(14, 46, 10, ALU); vrm.position.set(10, 70, -30); g.add(vrm);
      const chipset = ar(box(6, 32, 32, ALU), 0x11151b, 0.4); chipset.position.set(6, -46, 60); g.add(chipset);
      // M.2 2280 slot (22 × 80) + vis
      const m2 = box(4, 22, 80, PLASTIQUE); m2.position.set(4, 12, 96); g.add(m2);
      const vis = cyl(2, 4, ACIER, 10); vis.rotation.z = Math.PI / 2; vis.position.set(7, -6, 130); g.add(vis);
      // connecteurs SATA
      for (let i = 0; i < 4; i++) { const s = box(8, 13, 8, PLASTIQUE_CLAIR); s.position.set(4.6, -108, 60 + i * 14); g.add(s); }
      // blindage E/S arrière 158,75 × 44,45
      const io = box(3, 158.75, 44.45, ACIER); io.position.set(-1, 84, -152); g.add(io);
      const liseré = box(0.8, 244, 3, acc(0x2f5bff)); liseré.position.set(1.2, 0, 152); g.add(liseré);
    });

  /* ================= 2 · processeur + ventirad 120 mm ================= */
  piece('cpu', 'Processeur', 'Exécute les instructions : c\u2019est le cerveau du poste.', '#6AA6FF', new THREE.Vector3(-84, 60, -70),
    'LGA1700 · IHS 45 × 37,5 · ventirad 120 mm', 2, (g) => {
      /* Tout est empilé sur l'axe X, qui est l'axe de montage :
         substrat → pâte → IHS (couvercle) → embase du ventirad → caloducs → ailettes → ventilateur. */
      const sub = ar(box(1.4, 45, 37.5, PCB), 0x0b1410, 0.5); g.add(sub);                 // substrat 45 × 37,5
      const ihs = ar(box(3.2, 40, 33, ALU), 0x9aa3b2, 0.35); ihs.position.x = 2.3; g.add(ihs); // couvercle, DESSUS du substrat
      const emb = ar(box(9, 58, 58, ALU), 0x8a93a2, 0.4); emb.position.x = 8.6; g.add(emb);    // embase du ventirad
      // 4 caloducs qui traversent les ailettes, le long de X
      for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
        const cal = cyl(2.6, 34, CUIVRE, 14); cal.rotation.z = Math.PI / 2; cal.position.set(28, sy * 13, sz * 13); g.add(cal);
      }
      // 26 ailettes, toutes parallèles, empilées sur X
      for (let i = 0; i < 26; i++) { const f = box(0.7, 54, 54, ALU); f.position.set(14 + i * 1.35, 0, 0); g.add(f); }
      const chap = box(1.6, 56, 56, PLASTIQUE); chap.position.x = 50; g.add(chap);          // chapeau supérieur
      // ventilateur au-dessus du radiateur, même axe X
      const moyeu = cyl(13, 18, PLASTIQUE, 24); moyeu.rotation.z = Math.PI / 2; moyeu.position.set(61, 0, 0); g.add(moyeu);
      const cadre = cyl(56, 20, PLASTIQUE, 40, true); cadre.rotation.z = Math.PI / 2; cadre.position.set(61, 0, 0); g.add(cadre);
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2;
        const p = box(2, 42, 11, PLASTIQUE_CLAIR); p.position.set(61, Math.cos(a) * 27, Math.sin(a) * 27); p.rotation.x = -a; g.add(p);
      }
      const anneau = new THREE.Mesh(new THREE.TorusGeometry(56, 2.2, 8, 40), acc(0x6aa6ff)); anneau.rotation.y = Math.PI / 2; anneau.position.set(69, 0, 0); g.add(anneau);
    });

  /* ================= 3 · barrettes DIMM 133,35 × 31,25 ================= */
  piece('ram', 'Mémoire vive', 'Garde les données en cours d\u2019utilisation. Effacée à l\u2019extinction.', '#B57BFF', new THREE.Vector3(-64, 84, 60),
    '2 × 16 Go · DIMM 133,35 mm · 288 broches', 3, (g) => {
      /* Un module DIMM est un circuit imprimé : longueur 133,35 mm (Z), hauteur 31,25 mm (Y),
         épaisseur 1,2 mm (X). Les broches dorées sont sur la TRANCHE DU BAS et débouchent
         sur les DEUX faces ; les puces mémoire sont au-dessus, sur les deux faces. */
      const L = 133.35, H = 31.25, E = 1.2;
      for (let i = 0; i < 2; i++) {
        const x = i * 9;                                     // deux barrettes, deux slots voisins
        const pcb = ar(box(E, H, L, PCB), 0x0b1410, 0.5); pcb.position.set(x, 0, 0); g.add(pcb);
        // broches : une seule pièce qui traverse l'épaisseur → contact visible des deux côtés
        const broches = new THREE.InstancedMesh(new THREE.BoxGeometry(E + 0.9, 5.6, 2.2), OR, 40);
        const d = new THREE.Object3D(); let n = 0;
        for (let k = 0; k < 40; k++) {
          const z = -L / 2 + 3 + k * 3.28;
          if (Math.abs(z - 6) < 10) continue;                // encoche de détrompage
          d.position.set(x, -H / 2 + 2.8, z); d.updateMatrix(); broches.setMatrixAt(n++, d.matrix);
        }
        broches.count = n; g.add(broches);
        for (const s of [-1, 1]) {
          // 8 puces DRAM par face, alignées au-dessus des broches
          for (let k = 0; k < 8; k++) {
            const c = box(1.3, 10, 12.5, PLASTIQUE); c.position.set(x + s * (E / 2 + 0.65), 3.5, -55 + k * 15.6); g.add(c);
          }
          // petite puce SPD (celle qui dit au poste à quelle fréquence aller)
          if (s > 0) { const spd = box(1.1, 5, 7, PLASTIQUE_CLAIR); spd.position.set(x + s * (E / 2 + 0.55), 8, -60); g.add(spd); }
        }
        // crête colorée sur la tranche haute + étiquette constructeur
        const crete = box(6.4, 2.6, L - 12, acc(0xb57bff)); crete.position.set(x, H / 2 + 0.3, 0); g.add(crete);
        const etiq = box(0.5, 11, 58, PLASTIQUE_CLAIR); etiq.position.set(x + 3.3, 3, -8); g.add(etiq);
      }
    });

  /* ================= 4 · carte graphique 2 slots, 280 mm ================= */
  piece('gpu', 'Carte graphique', 'Calcule les images affichées à l\u2019écran.', '#0EA47A', new THREE.Vector3(-96, -60, -40),
    '280 mm · 2 slots · 3 ventilateurs 90 mm', 4, (g) => {
      const pcb = ar(box(1.6, 111, 280, PCB), 0x0b1410, 0.5); g.add(pcb);
      // carte + carter + dosseret
      const carter = ar(box(30, 105, 276, PLASTIQUE), 0x11151b, 0.45); carter.position.set(26, 0, 0); g.add(carter);
      const dos = ar(box(3, 100, 270, ACIER), 0x9aa3b2, 0.4); dos.position.set(-3, 0, 0); g.add(dos);
      // 3 ventilateurs 90 mm
      for (const z of [-88, 0, 88]) {
        const cadre = cyl(45, 12, PLASTIQUE, 40, true); cadre.rotation.z = Math.PI / 2; cadre.position.set(44, 6, z); g.add(cadre);
        for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2; const p = box(2.4, 34, 11, PLASTIQUE_CLAIR); p.position.set(44, 6 + Math.cos(a) * 24, z + Math.sin(a) * 24); p.rotation.x = -a; g.add(p); }
        const moyeu = cyl(11, 14, ALU, 20); moyeu.rotation.z = Math.PI / 2; moyeu.position.set(44, 6, z); g.add(moyeu);
        const anneau = new THREE.Mesh(new THREE.TorusGeometry(45, 1.6, 8, 40), acc(0x0ea47a)); anneau.rotation.y = Math.PI / 2; anneau.position.set(42, 6, z); g.add(anneau);
      }
      // équerre 120 mm + connecteurs d'alimentation 8 broches
      const eq = box(3, 40, 120, ACIER); eq.position.set(6, 40, -140); g.add(eq);
      const conn = box(14, 16, 26, PLASTIQUE_CLAIR); conn.position.set(12, 46, -108); g.add(conn);
      // caloducs visibles
      for (let i = 0; i < 4; i++) { const c = cyl(2.2, 120, CUIVRE, 12); c.rotation.x = Math.PI / 2; c.position.set(10, 40 - i * 6, 0); g.add(c); }
      const liseré = box(0.7, 3, 270, acc(0x0ea47a)); liseré.position.set(22, 51, 0); g.add(liseré);
    });

  /* ================= 5 · SSD M.2 2280 22 × 80 ================= */
  piece('ssd', 'Stockage SSD', 'Conserve les fichiers même hors tension.', '#FF9F0A', new THREE.Vector3(-64, -30, 96),
    'M.2 2280 · 22 × 80 × 2,4 mm · 500 Go', 5, (g) => {
      const pcb = ar(box(1.6, 80, 22, PCB), 0x0b1410, 0.5); pcb.rotation.x = 0; g.add(pcb);
      g.children[0].rotation.z = 0; g.children[0].rotation.y = 0;
      // puces NAND + contrôleur
      for (let i = 0; i < 4; i++) { const c = box(1.2, 14, 14, PLASTIQUE); c.position.set(1.4, -22 + i * 15, 0); g.add(c); }
      const ctrl = box(1.2, 12, 12, PLASTIQUE); ctrl.position.set(1.4, 30, 0); g.add(ctrl);
      // étiquette
      const etiq = box(0.5, 62, 16, acc(0xff9f0a)); etiq.position.set(-1.1, 0, 0); g.add(etiq);
      // connecteur M.2 (M-key)
      const conn = box(1.4, 4, 18, OR); conn.position.set(0, -41, 0); g.add(conn);
    });

  /* ================= 6 · alimentation ATX 150 × 86 × 140 ================= */
  piece('psu', 'Alimentation', 'Transforme le 230 V du secteur en basses tensions continues.', '#E5342B', new THREE.Vector3(0, -170, -80),
    'ATX 150 × 86 × 140 mm · 230 V → 12/5/3,3 V', 6, (g) => {
      const boitier = ar(box(150, 86, 140, ACIER), 0x1a1f26, 0.5); g.add(boitier);
      // grille + hélice 120 mm
      const grille = cyl(50, 2, new THREE.MeshBasicMaterial({ color: 0x0b0d10 }), 32); grille.rotation.x = Math.PI / 2; grille.position.set(0, 8, 71); g.add(grille);
      for (let i = 0; i < 6; i++) { const b = box(96, 1.6, 1.6, ACIER); b.position.set(0, 8 + (i - 2.5) * 15, 72); g.add(b); }
      const helice = cyl(46, 10, PLASTIQUE, 28); helice.rotation.x = Math.PI / 2; helice.position.set(0, 8, 70); g.add(helice);
      // prise secteur + interrupteur
      const prise = ar(box(34, 24, 6, PLASTIQUE), 0x0b0d10, 0.6); prise.position.set(-46, 8, -71); g.add(prise);
      const inter = box(14, 10, 6, PLASTIQUE_CLAIR); inter.position.set(-12, 8, -72); g.add(inter);
      // faisceau de câbles : 24 fils + 2×8 EPS (instanciés)
      const fils = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.5, 1.5, 120, 8), PLASTIQUE, 34);
      const d = new THREE.Object3D();
      const couleurs = [0x1d2026];
      for (let i = 0; i < 34; i++) {
        d.position.set(40 + (i % 6) * 3.4, 20 + Math.floor(i / 6) * 3.4, -90);
        d.rotation.set(Math.PI / 2, 0, 0); d.updateMatrix(); fils.setMatrixAt(i, d.matrix);
      }
      g.add(fils);
      const liseré = box(3, 3, 138, acc(0xe5342b)); liseré.position.set(74, 40, 0); g.add(liseré);
    });

  /* ================= 7 · ventilateur 140 × 25 (modèle fait sous Blender) ================= */
  const fanPiece = piece('fan', 'Ventilateur', 'Fait circuler l\u2019air pour évacuer la chaleur.', '#8FA2C0', new THREE.Vector3(0, 120, 200),
    '140 × 140 × 25 mm · 1 000 tr/min · modèle Blender', 7, (g) => {
      // repli immédiat : pales vrillées procédurales (remplacées dès que le GLB est chargé)
      const moyeu = cyl(21, 25, PLASTIQUE, 26); moyeu.rotation.x = Math.PI / 2; g.add(moyeu);
      const cadre = box(140, 140, 25, PLASTIQUE); cadre.visible = false; g.add(cadre);
      for (let i = 0; i < 7; i++) {
        const pivot = new THREE.Group(); pivot.rotation.z = i / 7 * Math.PI * 2;
        const pale = box(46, 3, 2, PLASTIQUE_CLAIR); pale.position.set(52, 0, 0); pale.rotation.x = 0.42;
        pivot.add(pale); g.add(pivot);
      }
    });
  fanPiece.userData.blender = false;
  // chargement asynchrone du GLB (léger, mis en cache par le navigateur)
  new GLTFLoader().load('assets/models/ventilateur140.glb?v=3', (gltf) => {
    const modele = gltf.scene;
    modele.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      const nom = (o.material && o.material.name || '').toLowerCase();
      const m = o.material ? o.material.clone() : PLASTIQUE;
      if (nom.includes('pale')) { m.color.setHex(0xdfe4ec); m.metalness = 0.05; m.roughness = 0.4; }
      else if (nom.includes('moyeu')) { m.color.setHex(0x3a3f47); m.metalness = 0.65; m.roughness = 0.3; }
      else { m.color.setHex(0x35373c); m.metalness = 0.1; m.roughness = 0.6; }
      m.envMapIntensity = 0.8; o.material = m;
    });
    // le GLB est en millimètres : échelle 1
    // glTF est en Y-up : l'axe du ventilateur est Y ; on le couche pour qu'il soit face à l'avant (+Z)
    modele.rotation.x = Math.PI / 2;
    while (fanPiece.children.length) fanPiece.remove(fanPiece.children[0]);
    fanPiece.add(modele);
    fanPiece.userData.blender = true;
    fanPiece.userData.procedural = false;
    fanPiece.userData.detail = '140 × 140 × 25 mm · 1 000 tr/min · modèle Blender';
    marquer();
  }, undefined, (err) => { console.warn('[atelier] GLB ventilateur non chargé, repli procédural :', err && (err.message || err)); });

  /* ---------- positions éclatées (mm, éventail large) ---------- */
  // Chaque pièce sort LE LONG DE SON AXE DE MONTAGE : le processeur, la mémoire et le SSD
  // restent donc exactement devant leur socket ou leur connecteur (mêmes Y et Z), à des
  // distances croissantes en X. L'alimentation sort par le bas, le ventilateur par l'avant.
  const ECLATE = {
    cm: [-70, 0, 0],
    cpu: [110, 0, 0], ram: [250, 0, 0], ssd: [180, 0, 0], gpu: [330, 0, 0],
    psu: [0, -150, 0], fan: [0, 0, 235],
  };
  aPlacer().forEach((p) => {
    const e = ECLATE[p.userData.id] || [260, 0, 260];
    p.userData.eclate.set(e[0], e[1], e[2]);
    p.userData.place = false;
    p.position.copy(p.userData.logement).add(p.userData.eclate);
  });

  /* ---------- lignes de rappel : chaque pièce reliée à son emplacement ---------- */
  const liens = new Map();
  aPlacer().forEach((p) => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const mat = new THREE.LineDashedMaterial({ color: new THREE.Color(p.userData.couleur || '#2F5BFF'),
      dashSize: 12, gapSize: 8, transparent: true, opacity: 0.8 });
    const l = new THREE.Line(geo, mat);
    l.visible = false; l.frustumCulled = false; scene.add(l); liens.set(p, l);
  });
  const majLiens = () => {
    liens.forEach((l, p) => {
      const a = l.geometry.attributes.position;
      a.setXYZ(0, p.position.x, p.position.y, p.position.z);
      a.setXYZ(1, p.userData.logement.x, p.userData.logement.y, p.userData.logement.z);
      a.needsUpdate = true;
      l.geometry.computeBoundingSphere();
      l.computeLineDistances();
    });
  };

  /* ---------- halo au sol (remplace un plan d'ombre qui noircit la scène) ---------- */
  const halo = document.createElement('canvas'); halo.width = halo.height = 128;
  const hc = halo.getContext('2d'); const hg = hc.createRadialGradient(64, 64, 6, 64, 64, 62);
  hg.addColorStop(0, 'rgba(64,88,120,0.24)'); hg.addColorStop(1, 'rgba(64,88,120,0)');
  hc.fillStyle = hg; hc.fillRect(0, 0, 128, 128);
  const disque = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1200), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(halo), transparent: true, depthWrite: false }));
  disque.rotation.x = -Math.PI / 2; disque.position.y = -300; scene.add(disque);

  /* ---------- logements fantômes ---------- */
  const fantomes = new Map();
  aPlacer().forEach((p) => {
    const taille = p.userData.id === 'cm' ? [10, 260, 320] : [60, 60, 60];
    const f = new THREE.Mesh(new THREE.BoxGeometry(...taille), new THREE.MeshBasicMaterial({ color: 0x2f5bff, transparent: true, opacity: 0.045 }));
    f.add(new THREE.LineSegments(new THREE.EdgesGeometry(f.geometry), new THREE.LineBasicMaterial({ color: 0x2f5bff, transparent: true, opacity: 0.28 })));
    f.position.copy(p.userData.logement); f.visible = false; scene.add(f); fantomes.set(p, f);
  });

  /* ---------- caméra + cadrage automatique ---------- */
  const orb = { theta: 0.62, phi: 1.22, r: 1800, cible: new THREE.Vector3() };
  const camPos = () => new THREE.Vector3(
    orb.r * Math.sin(orb.phi) * Math.sin(orb.theta), orb.r * Math.cos(orb.phi), orb.r * Math.sin(orb.phi) * Math.cos(orb.theta)
  ).add(orb.cible);

  let salir = true, enVue = true, enCours = false;
  // rendu à la demande : la boucle s'arrête dès que tout est immobile, et repart au moindre geste
  const relancer = () => { if (!enCours) { enCours = true; requestAnimationFrame(boucle); } };
  const marquer = () => { salir = true; relancer(); };

  function cadrer() {
    scene.updateMatrixWorld(true);
    const b = new THREE.Box3();
    pieces.forEach((p) => b.expandByObject(p));
    b.getCenter(orb.cible);
    const coins = [];
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) coins.push(new THREE.Vector3(x, y, z));
    let r = 200;
    for (let i = 0; i < 60; i++) {
      orb.r = r;
      camera.position.copy(camPos()); camera.lookAt(orb.cible);
      camera.updateMatrixWorld(true); camera.updateProjectionMatrix();
      let pire = 0;
      for (const c of coins) { const v = c.clone().project(camera); pire = Math.max(pire, Math.abs(v.x), Math.abs(v.y), v.z > 1 ? 2 : 0); }
      if (pire <= 0.9) break;
      r *= 1.06;
    }
    orb.r = r; etat.settled = false; marquer();
  }

  /* ---------- interactions ---------- */
  let pointeur = null;
  // deux doigts = pincer pour zoomer (iPhone, iPad, tablettes)
  const doigts = new Map(); let pince = null;
  const ecart = () => { const [a, b] = [...doigts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  zone.addEventListener('pointerdown', (e) => {
    doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (doigts.size === 2) { pointeur = null; pince = { d: ecart(), r: orb.r }; return; }
    pointeur = { x: e.clientX, y: e.clientY, t: performance.now(), bouge: 0 }; zone.setPointerCapture(e.pointerId);
  });
  const lever = (e) => { doigts.delete(e.pointerId); if (doigts.size < 2) pince = null; };
  zone.addEventListener('pointermove', (e) => {
    if (doigts.has(e.pointerId)) doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pince && doigts.size === 2) {
      const d = ecart(); if (d > 10) { orb.r = Math.min(pince.r * 2.2, Math.max(240, pince.r * pince.d / d)); marquer(); }
      return;
    }
    if (!pointeur) return;
    const dx = e.clientX - pointeur.x, dy = e.clientY - pointeur.y;
    pointeur.bouge += Math.abs(dx) + Math.abs(dy);
    orb.theta -= dx * 0.007;
    orb.phi = Math.min(Math.PI - 0.28, Math.max(0.28, orb.phi - dy * 0.005));
    pointeur.x = e.clientX; pointeur.y = e.clientY; marquer();
  });
  zone.addEventListener('pointerup', (e) => {
    const deuxDoigts = doigts.size >= 2 || pince; lever(e);
    if (deuxDoigts) { pointeur = null; return; }
    const court = pointeur && performance.now() - pointeur.t < 430 && pointeur.bouge < 10;
    pointeur = null; if (court) choisir(e.clientX, e.clientY);
  });
  zone.addEventListener('pointercancel', (e) => { pointeur = null; lever(e); });
  zone.addEventListener('wheel', (e) => { e.preventDefault(); orb.r = Math.min(orb.r * 2.2, Math.max(240, orb.r + e.deltaY * 2.2)); marquer(); }, { passive: false });
  zone.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowLeft') orb.theta += 0.1;
    else if (k === 'ArrowRight') orb.theta -= 0.1;
    else if (k === 'ArrowUp') orb.phi = Math.max(0.28, orb.phi - 0.08);
    else if (k === 'ArrowDown') orb.phi = Math.min(Math.PI - 0.28, orb.phi + 0.08);
    else if (k === '+' || k === '=') orb.r = Math.max(240, orb.r - 90);
    else if (k === '-') orb.r = Math.min(orb.r * 2.2, orb.r + 90);
    else return;
    e.preventDefault(); marquer();
  });
  zone.tabIndex = 0;

  /* ---------- sélection ---------- */
  const raycaster = new THREE.Raycaster();
  const surligne = (g, on) => g.traverse((o) => {
    if (o.isMesh && o.material && o.material.emissive) { o.material.emissive.setHex(on ? 0x2f5bff : (o.material.userData.base ?? 0x000000)); o.material.emissiveIntensity = on ? 0.6 : 0.12; }
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
  let focus = null;
  function cadrerSur(g) {
    if (!g) return;
    scene.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(g);
    const centre = b.getCenter(new THREE.Vector3());
    const taille = b.getSize(new THREE.Vector3()).length();
    orb.cible.copy(centre);
    orb.r = Math.max(120, taille * 2.35);
    etat.settled = false; marquer();
  }
  function selectionner(g) {
    pieces.forEach((p) => surligne(p, false));
    focus = g;
    etat.selection = g ? g.userData.id : null;
    if (g) surligne(g, true);
    document.querySelectorAll('.puce-piece').forEach((b) => b.classList.toggle('on', !!g && b.dataset.piece === g.userData.id));
    document.querySelectorAll('.etiquette3d').forEach((b) => b.classList.toggle('ouvert', !!g && b.dataset.piece === g.userData.id));
    if (g && g.userData.place) cadrerSur(g);
    majPanneau(g); marquer();
  }
  function placer(g) {
    g.userData.place = true; g.position.copy(g.userData.logement);
    const f = fantomes.get(g); if (f) f.visible = false;
    const l = liens.get(g); if (l) l.visible = false;
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
      const l = liens.get(p); if (l) l.visible = v;
    });
    if (v) majLiens();
    etat.places = aPlacer().filter((p) => p.userData.place).length;
    majProgression(); marquer();
  }
  function vue(nom) {
    etat.vue = nom;
    if (nom === 'eclate') { orb.theta = 1.05; orb.phi = 1.26; eclater(true); focus = null; cadrer(); }
    if (nom === 'face') { orb.theta = 0.06; orb.phi = 1.38; focus = null; eclater(false); cadrer(); }
    if (nom === 'dessus') { orb.theta = 0.5; orb.phi = 0.62; focus = null; eclater(false); cadrer(); }
    if (nom === 'interieur') { orb.theta = 1.42; orb.phi = 1.3; focus = null; eclater(false); cadrer(); orb.r = orb.r * 0.72; }
    marquer();
  }

  /* ---------- étiquettes projetées + anti-chevauchement ---------- */
  const boite = document.getElementById('etiquettes3d');
  const etiquettes = aPlacer().map((p) => {
    const d = document.createElement('button');
    d.className = 'etiquette3d'; d.type = 'button';
    d.dataset.piece = p.userData.id; d.setAttribute('aria-label', p.userData.nom);
    d.innerHTML = `<b style="--c:${p.userData.couleur}">${p.userData.n}</b><span>${p.userData.nom}</span>`;
    d.addEventListener('pointerenter', () => d.classList.add('ouvert'));
    d.addEventListener('pointerleave', () => { if (etat.selection !== p.userData.id) d.classList.remove('ouvert'); });
    d.addEventListener('click', () => { if (!p.userData.place) placer(p); else selectionner(p); });
    boite.appendChild(d);
    return { el: d, p };
  });
  const v3 = new THREE.Vector3();
  function placerEtiquettes() {
    const r = zone.getBoundingClientRect();
    const places = etiquettes.map(({ el, p }) => {
      p.getWorldPosition(v3); v3.y += 12;
      const pr = v3.clone().project(camera);
      const dedans = pr.z < 1 && Math.abs(pr.x) < 1 && Math.abs(pr.y) < 1;
      el.style.opacity = dedans ? '1' : '0';
      el.style.pointerEvents = dedans ? 'auto' : 'none';
      return { el, x: (pr.x * 0.5 + 0.5) * r.width, y: (-pr.y * 0.5 + 0.5) * r.height, dedans };
    });
    const vis = places.filter((o) => o.dedans);
    for (let passe = 0; passe < 6; passe++) {
      for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
        const a = vis[i], b = vis[j], dx = b.x - a.x, dy = b.y - a.y;
        if (Math.abs(dx) < 26 && Math.abs(dy) < 26) {
          const pousse = (26 - Math.abs(dy)) / 2 + 1, sens = dy >= 0 ? 1 : -1;
          a.y -= pousse * sens * 0.5; b.y += pousse * sens * 0.5;
        }
      }
    }
    places.forEach((o) => { o.el.style.transform = `translate(-50%,-50%) translate(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px)`; });
  }

  /* ---------- boucle ---------- */
  const obs = new IntersectionObserver((es) => { enVue = es[0].isIntersecting; if (enVue) marquer(); }, { threshold: 0.05 });
  obs.observe(zone);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) marquer(); });

  function boucle() {
    enCours = false;
    if (!enVue || document.hidden) return;          // repart via l'observateur ou le retour sur l'onglet
    let anime = false;
    const cible = camPos();
    if (camera.position.distanceTo(cible) > 0.8) { camera.position.lerp(cible, 0.2); salir = anime = true; }
    else if (!etat.settled || !camera.position.equals(cible)) { camera.position.copy(cible); etat.settled = true; salir = true; }
    camera.lookAt(orb.cible);
    aPlacer().forEach((g) => {
      if (!g.userData.place) return;
      if (g.position.distanceTo(g.userData.logement) > 0.4) { g.position.lerp(g.userData.logement, 0.24); salir = anime = true; }
      else if (!g.position.equals(g.userData.logement)) { g.position.copy(g.userData.logement); salir = true; }
    });
    if (anime) relancer();
    if (salir) {
      renderer.render(scene, camera);
      placerEtiquettes();
      salir = false; etat.frames++;
      if (QA) zone.dataset.verifyState = JSON.stringify({
        frames: etat.frames, webgl: etat.webgl, selection: etat.selection, places: etat.places,
        total: aPlacer().length, vue: etat.vue, settled: etat.settled,
        camera: [Math.round(orb.theta * 100) / 100, Math.round(orb.phi * 100) / 100, Math.round(orb.r)],
        triangles: renderer.info.render.triangles,
      });
      document.getElementById('hud-cam').textContent = `θ ${(orb.theta * 180 / Math.PI).toFixed(0)}° · φ ${(orb.phi * 180 / Math.PI).toFixed(0)}° · recul ${Math.round(orb.r)} mm`;
    }
  }
  relancer();

  // perte du contexte WebGL (mise en veille, trop d'onglets 3D) : on prévient, puis on redessine au retour
  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault(); zone.dataset.perdu = '1';
    const hud = document.getElementById('hud-cam'); if (hud) hud.textContent = 'Affichage 3D en pause : il reprend tout seul.';
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => { delete zone.dataset.perdu; marquer(); });

  addEventListener('resize', () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5));
    renderer.setSize(zone.clientWidth, zone.clientHeight, false);
    camera.aspect = zone.clientWidth / zone.clientHeight; camera.updateProjectionMatrix(); cadrer(); marquer();
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
    A.gagner(id === 'assemble' ? 30 : 15, `poste3d:defi:${id}`);
    const b = document.getElementById('bravo');
    b.textContent = id === 'assemble' ? 'Défi réussi : toutes les pièces sont en place.' : 'Défi réussi : tu as identifié les pièces principales.';
    b.classList.add('vu'); setTimeout(() => b.classList.remove('vu'), 4000);
    majXP();
    if (faits.size >= 2) { A.terminer('poste3d', 3); majXP(); }
  }
  const _sel = selectionner;
  selectionner = (g) => { _sel(g); if (g && g.userData.logement) { identifiees.add(g.userData.id); if (identifiees.size >= 5) reussi('identifier'); } };
  function majXP() {
    const p = A.profil(), niv = A.niveau(p.xp), dans = p.xp % 200;
    document.getElementById('xp').innerHTML = `<span class="lvl">⭐ Niveau ${niv}</span><div class="rail"><i style="width:${(dans / 200) * 100}%"></i></div><small>${p.xp} XP · ${window.Atelier.esc(p.nom)} · ${window.Atelier.esc(p.classe)}</small>`;
  }

  vue('eclate'); camera.position.copy(camPos()); camera.lookAt(orb.cible);
  majPanneau(null); majXP(); majProgression();
  if (/[?&]qa\b/.test(location.search)) window.__scene = { etat, pieces, aPlacer, eclater, vue, selectionner, placer, orb, marquer, camera, cadrer, renderer };
}
