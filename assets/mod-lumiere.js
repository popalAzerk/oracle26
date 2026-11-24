/* Module Lumière — ombres et réfraction. D'après les programmes anglais (KS3 light waves),
   japonais (propriétés de la lumière) et finlandais (phénomènes du son et de la lumière). */
window.MODULE = {
  id: 'lumiere',
  titre: 'Lumière', titreHtml: 'La lumière<br><span class="grad">droit devant.</span>',
  kicker: 'Sciences · la lumière', badge: 'opticien',
  couleur: ['#FF9EC4', '#F0417E'],
  sousTitre: "Une ombre, c'est simplement de la lumière qui n'arrive pas. Déplace la source, l'objet et l'écran : la taille de l'ombre se calcule. Puis fais entrer un rayon dans l'eau et regarde-le se plier.",
  largeur: 900, hauteur: 400,
  etat: { mode: 'ombre', distance: 200, taille: 60, angle: 40 },
  controles: [
    { id: 'mode', label: 'Expérience', options: [{ v: 'ombre', label: 'Ombre' }, { v: 'refraction', label: 'Réfraction' }] },
    { id: 'distance', label: 'Objet → écran', type: 'curseur', min: 60, max: 400, step: 10, unit: ' cm' },
    { id: 'taille', label: 'Taille de l\u2019objet', type: 'curseur', min: 20, max: 120, step: 5, unit: ' mm' },
    { id: 'angle', label: 'Angle du rayon', type: 'curseur', min: 0, max: 70, step: 1, unit: '°' },
  ],
  dessiner(e) {
    if (e.mode === 'refraction') {
      const i = e.angle * Math.PI / 180;
      const r = Math.asin(Math.sin(i) / 1.33);
      const Px = 420, Py = 250, L1 = 250, L2 = 320;
      const Sx = Px - L1 * Math.sin(i), Sy = Py - L1 * Math.cos(i);
      const Ex = Px + L2 * Math.sin(r), Ey = Py + L2 * Math.cos(r);
      const deg = (x) => Math.round(x * 180 / Math.PI);
      return `
        <rect x="0" y="250" width="900" height="160" fill="#DBEAFE"/>
        <line x1="0" y1="250" x2="900" y2="250" stroke="#60A5FA" stroke-width="3"/>
        <text x="70" y="200" class="lab">AIR</text>
        <text x="70" y="300" class="lab" fill="#1D4ED8">EAU</text>
        <line x1="${Px}" y1="20" x2="${Px}" y2="395" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="7 7"/>
        <text x="${Px + 10}" y="34" class="lab">normale</text>
        <line x1="${Sx}" y1="${Sy}" x2="${Px}" y2="${Py}" stroke="#F0417E" stroke-width="5" stroke-linecap="round"/>
        <line x1="${Px}" y1="${Py}" x2="${Ex}" y2="${Ey}" stroke="#0071E3" stroke-width="5" stroke-linecap="round"/>
        <circle cx="${Px}" cy="${Py}" r="7" fill="#1D1D1F"/>
        <text x="${Px + 14}" y="${Py + 26}" class="lab">point d'entrée</text>
        <path d="M ${Px} ${Py - 84} A 84 84 0 0 0 ${Px - 84 * Math.sin(i)} ${Py - 84 * Math.cos(i)}" fill="none" stroke="#F0417E" stroke-width="2"/>
        <text x="${Px - 34}" y="${Py - 92}" text-anchor="end" class="lab" fill="#BE123C">${deg(i)}°</text>
        <path d="M ${Px} ${Py + 84} A 84 84 0 0 1 ${Px + 84 * Math.sin(r)} ${Py + 84 * Math.cos(r)}" fill="none" stroke="#0071E3" stroke-width="2"/>
        <text x="${Px + 26}" y="${Py + 100}" class="lab" fill="#1D4ED8">${deg(r)}°</text>
        <text x="450" y="386" text-anchor="middle" class="lab">dans l'eau, le rayon se rapproche de la normale : ${deg(i)}° devient ${deg(r)}°</text>`;
    }
    const S = { x: 160, y: 200 }, O = { x: 380, y: 200 };
    const Ec = { x: Math.min(860, O.x + e.distance * 1.4) };
    const h = e.taille / 2;
    const k = (Ec.x - O.x) / (O.x - S.x);
    const hOmbre = h * (1 + k);
    return `
      <rect x="${Ec.x}" y="${200 - hOmbre - 20}" width="10" height="${2 * hOmbre + 40}" fill="#334155"/>
      <text x="${Ec.x - 22}" y="${200 - hOmbre - 26}" text-anchor="end" class="lab">écran</text>
      <g stroke="#F59E0B" stroke-width="2.5">
        <line x1="${S.x + 26}" y1="${S.y - 10}" x2="${Ec.x}" y2="${200 - hOmbre}"/>
        <line x1="${S.x + 26}" y1="${S.y + 10}" x2="${Ec.x}" y2="${200 + hOmbre}"/>
      </g>
      <circle cx="${S.x}" cy="${S.y}" r="22" fill="#FDE68A" stroke="#F59E0B" stroke-width="3"/>
      <circle cx="${S.x}" cy="${S.y}" r="40" fill="#FDE68A" opacity=".35"/>
      <text x="${S.x}" y="${S.y + 62}" text-anchor="middle" class="lab">source</text>
      <rect x="${O.x - 8}" y="${200 - h}" width="16" height="${2 * h}" rx="4" fill="#1D1D1F"/>
      <text x="${O.x}" y="${200 - h - 18}" text-anchor="middle" class="lab">objet ${e.taille} mm</text>
      <path d="M${O.x} ${200 - h} L${Ec.x} ${200 - hOmbre} L${Ec.x} ${200 + hOmbre} L${O.x} ${200 + h} Z" fill="#0F172A" opacity=".82"/>
      <text x="${(O.x + Ec.x) / 2}" y="${200 + hOmbre + 24}" text-anchor="middle" class="lab">ombre</text>`;
  },
  mesures(e) {
    if (e.mode === 'refraction') {
      const i = e.angle, r = Math.asin(Math.sin(i * Math.PI / 180) / 1.33) * 180 / Math.PI;
      return [{ valeur: i + '°', label: 'angle dans l\u2019air' }, { valeur: r.toFixed(0) + '°', label: 'angle dans l\u2019eau' },
              { valeur: '1,33', label: 'indice de l\u2019eau' }];
    }
    const k = e.distance / 220, hOmbre = e.taille * (1 + k);
    return [{ valeur: Math.round(hOmbre) + ' mm', label: 'hauteur de l\u2019ombre' },
            { valeur: '×' + (1 + k).toFixed(1), label: 'agrandissement' },
            { valeur: e.distance + ' cm', label: 'recul de l\u2019écran' }];
  },
  commentaire(e) {
    if (e.mode === 'refraction') return { classe: 'bon', html: `<b>Le rayon se plie.</b> En passant de l'air à l'eau, la lumière ralentit : elle change de direction. Plus l'angle d'arrivée est grand, plus la déviation est forte — c'est ce qui casse visuellement une paille dans un verre.` };
    return { classe: '', html: `<b>Une ombre grandit quand l'écran s'éloigne.</b> La lumière se propage en ligne droite : les rayons rasants de la source passent juste au bord de l'objet puis continuent tout droit, donc l'ombre s'élargit avec la distance.` };
  },
  defis: [
    { id: 'grande', texte: 'Obtiens une ombre au moins deux fois plus grande que l\u2019objet.', xp: 20, bravo: 'ton ombre atteint le double de l\u2019objet.',
      quand: (e) => e.mode === 'ombre' && (1 + e.distance / 220) >= 2 },
    { id: 'plie', texte: 'Fais entrer un rayon dans l\u2019eau avec un angle de 60° ou plus.', xp: 20, bravo: 'tu as vu le rayon se plier fortement.',
      quand: (e) => e.mode === 'refraction' && e.angle >= 60 },
    { id: 'zero', texte: 'Trouve le cas où la lumière n\u2019est pas déviée du tout.', xp: 25, bravo: 'à l\u2019incidence nulle, aucun virage.',
      quand: (e) => e.mode === 'refraction' && e.angle <= 1 },
  ],
  fiches: [
    { id: 'propagation', court: 'Propagation', nom: 'La lumière va en ligne droite', c1: '#FFD60A', texte: "Dans un milieu transparent et homogène, la lumière se propage en <b>ligne droite</b>. C'est pour cela qu'on dessine des rayons, et pour cela que les ombres ont des bords nets quand la source est petite.", plus: "La lumière du Soleil met environ 8 minutes à nous parvenir. Dans le vide, elle file à 299 792 458 mètres par seconde : c'est la vitesse la plus grande possible dans l'univers." },
    { id: 'ombre', court: 'Ombres', nom: 'Une ombre, c\u2019est de la lumière en moins', c: 1, texte: "L'ombre est la zone où la lumière ne passe pas. Plus la source est petite et l'objet proche de l'écran, plus l'ombre est <b>nette</b>. Une source large (néon, ciel) donne une ombre floue : c'est la pénombre.", plus: "Les éclipses sont des ombres à l'échelle du système solaire : la Lune s'éclipse en entrant dans l'ombre de la Terre, le Soleil s'éclipse quand la Lune projette son ombre sur nous." },
    { id: 'refraction', court: 'Réfraction', nom: 'La lumière se plie en changeant de milieu', c: 1, texte: "Quand la lumière passe de l'air à l'eau (ou au verre), elle <b>ralentit</b> et change de direction : c'est la réfraction. Ce changement est utilisé par les lentilles, les lunettes, l'œil et les appareils photo.", plus: "L'indice de réfraction de l'eau est 1,33 et celui du verre environ 1,5. Au-delà d'un certain angle (41° pour l'eau), la lumière ne sort plus : c'est la réflexion totale, utilisée dans les fibres optiques." },
    { id: 'couleurs', court: 'Couleurs', nom: 'Le blanc contient toutes les couleurs', c: 1, texte: "Un prisme sépare la lumière blanche en couleurs : c'est un <b>spectre</b>. Chaque couleur est une longueur d'onde différente. Un objet rouge renvoie le rouge et absorbe le reste.", plus: "L'arc-en-ciel est un spectre naturel : les gouttes de pluie jouent le rôle de millions de petits prismes. Le violet dévie le plus, le rouge le moins." },
  ],
  experiences: [
    { titre: 'L\u2019ombre qui grandit', texte: 'Une lampe de bureau (ou la lampe du téléphone), un jouet, un mur blanc. Approche puis éloigne le jouet du mur : l\u2019ombre change de taille. Mesure les deux ombres avec une règle.' },
    { titre: 'La cuillère cassée', texte: 'Un verre d\u2019eau, une cuillère. Regarde le verre de côté, à hauteur d\u2019eau : la partie immergée de la cuillère paraît cassée et décalée. C\u2019est la réfraction.' },
    { titre: 'Le rayon qui se courbe', texte: 'Dans une pièce sombre, fais entrer un rayon de lampe torche dans un bocal d\u2019eau légèrement savonneuse : le trajet du rayon se voit dans l\u2019eau et se plie à la surface.' },
  ],
  quiz: [
    { q: 'Comment se propage la lumière dans l\u2019air ?', r: ['En ligne droite', 'En zigzag', 'En tournant autour des objets', 'Elle ne se propage pas'], b: 0, e: 'Dans un milieu transparent et homogène, la lumière suit des lignes droites : c\u2019est le modèle du rayon.' },
    { q: 'Que se passe-t-il si l\u2019écran s\u2019éloigne de l\u2019objet ?', r: ['L\u2019ombre rétrécit', 'L\u2019ombre grandit', 'L\u2019ombre ne change pas', 'L\u2019ombre disparaît'], b: 1, e: 'Les bords des rayons s\u2019écartent en s\u2019éloignant de la source : l\u2019ombre s\u2019élargit avec la distance.' },
    { q: 'Qu\u2019est-ce que la réfraction ?', r: ['Un changement de couleur', 'Le changement de direction de la lumière en changeant de milieu', 'Une ombre très nette', 'Un miroir'], b: 1, e: 'En passant d\u2019un milieu à un autre, la vitesse change, donc la direction du rayon change.' },
    { q: 'Dans quel cas le rayon n\u2019est-il pas dévié ?', r: ['Arrivée perpendiculaire à la surface', 'Arrivée à 45°', 'Arrivée à 60°', 'Il est toujours dévié'], b: 0, e: 'Si le rayon arrive exactement le long de la normale, il ne change pas de direction : il ralentit mais continue tout droit.' },
    { q: 'Pourquoi voyons-nous un objet rouge ?', r: ['Il produit sa propre lumière rouge', 'Il réfléchit le rouge et absorbe les autres couleurs', 'Il absorbe le rouge', 'Il change le blanc en rouge'], b: 1, e: 'Un objet ne crée pas de lumière : il renvoie vers nos yeux certaines couleurs de la lumière reçue et absorbe les autres.' },
    { q: 'Quelle expérience prouve la propagation rectiligne ?', r: ['Une ombre nette derrière un objet', 'Un verre d\u2019eau colorée', 'Un aimant qui attire une boussole', 'Un glaçon qui fond'], b: 0, e: 'Une ombre aux bords nets ne peut exister que si la lumière va en ligne droite : sinon, elle serait diffuse autour de l\u2019objet.' },
  ],
};
