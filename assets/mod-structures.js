/* Module Structures et stabilité — formes, triangulation, centre de gravité, charge.
   D'après l'Ontario (structures et mécanismes : forme, fonction, stabilité) et l'Angleterre (forces, structures). */
window.MODULE = {
  id: 'structures',
  titre: 'Structures', titreHtml: 'Tenir debout,<br><span class="grad">ça s\u2019apprend.</span>',
  kicker: 'Technologie · structures', badge: 'ingénieur',
  couleur: ['#0EA5E9', '#1E40AF'],
  sousTitre: "Trois formes, trois résistances. Ajoute des charges et regarde à partir de quand ça casse. Déplace ensuite le centre de gravité et teste la stabilité.",
  largeur: 900, hauteur: 420,
  etat: { forme: 'plat', epaisseur: 3, charge: 100, deplacement: 0 },
  controles: [
    { id: 'forme', label: 'Forme', options: [{ v: 'plat', label: 'Poutre plate' }, { v: 'triangule', label: 'Triangulée' }, { v: 'arc', label: 'Arc' }] },
    { id: 'epaisseur', label: 'Épaisseur', type: 'curseur', min: 1, max: 8, step: 1, unit: ' cm' },
    { id: 'charge', label: 'Charge posée', type: 'curseur', min: 0, max: 800, step: 25, unit: ' kg' },
    { id: 'deplacement', label: 'Décalage du poids', type: 'curseur', min: 0, max: 100, step: 5, unit: ' %' },
  ],
  CAPACITE: { plat: 40, triangule: 220, arc: 150 },
  capaciteMax(e) { return window.MODULE.CAPACITE[e.forme] * Math.pow(e.epaisseur, 1.8) / 3; },
  dessiner(e) {
    const max = window.MODULE.capaciteMax(e);
    const rupture = e.charge > max;
    const fleche = Math.min(60, (e.charge / Math.max(1, max)) * 28);
    const baseY = 300, x1 = 180, x2 = 720, cx = (x1 + x2) / 2;
    let forme = '';
    if (e.forme === 'plat') {
      forme = `<rect x="${x1}" y="${baseY - e.epaisseur * 4}" width="${x2 - x1}" height="${e.epaisseur * 8}" rx="3" fill="${rupture ? '#FCA5A5' : '#94A3B8'}" stroke="${rupture ? '#DC2626' : '#475569'}" stroke-width="2"/>`;
    } else if (e.forme === 'triangule') {
      forme = `<g><rect x="${x1}" y="${baseY - e.epaisseur * 4}" width="${x2 - x1}" height="${e.epaisseur * 8}" rx="3" fill="${rupture ? '#FCA5A5' : '#94A3B8'}" stroke="${rupture ? '#DC2626' : '#475569'}" stroke-width="2"/>
        <path d="M${x1} ${baseY + e.epaisseur * 4} L${cx} ${baseY - 70} L${x2} ${baseY + e.epaisseur * 4} Z" fill="none" stroke="#1E40AF" stroke-width="5"/>
        <path d="M${x1 + 120} ${baseY + e.epaisseur * 4} L${cx} ${baseY - 70} M${x2 - 120} ${baseY + e.epaisseur * 4} L${cx} ${baseY - 70}" stroke="#1E40AF" stroke-width="3" opacity=".6"/></g>`;
    } else {
      forme = `<path d="M${x1} ${baseY + e.epaisseur * 4} Q${cx} ${baseY - 150 - e.epaisseur * 6} ${x2} ${baseY + e.epaisseur * 4} L${x2} ${baseY + e.epaisseur * 4 + e.epaisseur * 6} Q${cx} ${baseY - 130 - e.epaisseur * 6} ${x1} ${baseY + e.epaisseur * 4 + e.epaisseur * 6} Z" fill="${rupture ? '#FCA5A5' : '#94A3B8'}" stroke="${rupture ? '#DC2626' : '#475569'}" stroke-width="2"/>`;
    }
    const px = x1 + (x2 - x1) * (e.deplacement / 100);
    return `
      <rect x="${x1 - 40}" y="${baseY + e.epaisseur * 8 + 5}" width="60" height="70" fill="#CBD5E1"/>
      <rect x="${x2 - 20}" y="${baseY + e.epaisseur * 8 + 5}" width="60" height="70" fill="#CBD5E1"/>
      <g transform="translate(0 ${fleche})">${forme}</g>
      <g transform="translate(${px} ${baseY - 30 - fleche - e.epaisseur * 4})">
        <rect x="-46" y="-46" width="92" height="46" rx="8" fill="${rupture ? '#DC2626' : '#FCD34D'}" stroke="#B45309" stroke-width="2.5"/>
        <text x="0" y="-16" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="15" font-weight="700" fill="${rupture ? '#fff' : '#5A3B00'}">${e.charge} kg</text>
      </g>
      <line x1="${px}" y1="${baseY + 90}" x2="${px}" y2="${baseY + 40}" stroke="#0EA5E9" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="${px}" y="${baseY + 112}" text-anchor="middle" class="lab">poids ici</text>
      <text x="${cx}" y="60" text-anchor="middle" class="lab">${rupture ? 'LA STRUCTURE CÈDE' : 'la structure tient'}</text>
      ${rupture ? `<text x="${cx}" y="84" text-anchor="middle" class="lab" fill="#DC2626">limite dépassée : ${Math.round(max)} kg maximum</text>` : ''}`;
  },
  mesures(e) {
    const max = window.MODULE.capaciteMax(e), r = e.charge / max;
    const bascule = e.deplacement > 60;
    return [{ valeur: Math.round(max) + ' kg', label: 'charge maximale' },
            { valeur: Math.round(r * 100) + ' %', label: 'de la limite', alerte: r > 1 },
            { valeur: bascule ? 'bascule' : 'stable', label: 'stabilité', alerte: bascule }];
  },
  commentaire(e) {
    const max = window.MODULE.capaciteMax(e), rupture = e.charge > max;
    if (rupture) return { classe: 'faux', html: `<b>Ça cède.</b> Cette forme supporte au maximum ${Math.round(max)} kg avec ${e.epaisseur} cm d'épaisseur. Le triangle est la forme la plus rigide : il ne se déforme pas sans changer la longueur de ses côtés.` };
    return { classe: 'bon', html: `<b>Ça tient.</b> ${e.forme === 'triangule' ? 'Le triangle est indéformable : c\u2019est pourquoi il est partout (grues, charpentes, ponts).' : e.forme === 'arc' ? 'L\u2019arc reporte la charge vers les appuis latéraux : c\u2019est le principe des voûtes romaines.' : 'La poutre plate travaille en flexion : elle plie au milieu. Doubler son épaisseur la rend bien plus résistante.'} ${e.deplacement > 60 ? 'Attention, le poids est très décalé : la structure risque de basculer.' : ''}` };
  },
  defis: [
    { id: 'tri', texte: 'Passe en triangulée et soutiens 400 kg.', xp: 25, bravo: 'le triangle gagne, largement.', quand: (e) => e.forme === 'triangule' && e.charge >= 400 && e.charge <= window.MODULE.capaciteMax(e) },
    { id: 'casse', texte: 'Dépasse la limite et observe la rupture.', xp: 20, bravo: 'tu as trouvé le point de rupture.', quand: (e) => e.charge > window.MODULE.capaciteMax(e) },
    { id: 'basculer', texte: 'Décale le poids à 100 % et explique pourquoi ça bascule.', xp: 20, bravo: 'le centre de gravité sort de la base.', quand: (e) => e.deplacement >= 90 },
  ],
  fiches: [
    { id: 'forme', court: 'Formes', nom: 'La forme fait la résistance', texte: "Une poutre plate plie ; un triangle ne se déforme pas ; un arc reporte la charge sur ses appuis. <b>La géométrie compte autant que la matière.</b>", plus: "Une feuille de papier droite ne porte rien ; pliée en accordéon ou en U, elle supporte un livre. Les ingénieurs jouent sur la forme autant que sur l'épaisseur." },
    { id: 'gravite', court: 'Stabilité', nom: 'Le centre de gravité', texte: "Un objet reste debout si son <b>centre de gravité</b> tombe à l'intérieur de sa base d'appui. Plus la base est large et le centre bas, plus c'est stable.", plus: "Un bus est plus stable qu'une armoire : son centre de gravité est bas. Une grue ajoute des contrepoids pour garder son centre dans sa base, même avec une charge au bout du bras." },
    { id: 'materiaux', court: 'Matériaux', nom: 'Chaque matériau a son rôle', texte: "L'acier résiste à la traction, le béton à la compression : le béton armé combine les deux. Le bois est léger et résiste bien en flexion.", plus: "Un pont suspendu travaille en traction (câbles), un pont en arc en compression (pierres). Choisir la structure, c'est choisir comment les forces vont circuler." },
    { id: 'triangulation', court: 'Triangulation', nom: 'Pourquoi tout est triangulé', texte: "Un quadrilatère peut se déformer sans changer la longueur de ses côtés ; un triangle, non. D'où les croix de Saint-André sur les charpentes et les portiques.", plus: "Les pylônes électriques, les grues, les toits, les vélos : partout où l'on voit des triangles, c'est pour empêcher la déformation de la structure." },
  ],
  experiences: [
    { titre: 'La feuille qui porte', texte: 'Pose une feuille entre deux verres et pose une pièce : elle plie. Plie la feuille en accordéon et recommence : elle supporte plusieurs pièces.' },
    { titre: 'Le centre de gravité', texte: 'Tiens une règle au bout de ton doigt : elle tient à l\u2019endroit du centre de gravité. Ajoute une gomme à une extrémité : le point d\u2019équilibre se déplace vers la gomme.' },
    { titre: 'Le triangle indéformable', texte: 'Fabrique un carré et un triangle avec des pailles et du fil. Déforme-les : le carré bouge, le triangle non.' },
  ],
  quiz: [
    { q: 'Quelle forme est la plus rigide ?', r: ['Le carré', 'Le triangle', 'Le rectangle', 'Le losange'], b: 1, e: 'Le triangle ne peut pas se déformer sans changer la longueur de ses côtés : c\u2019est la seule forme indéformable.' },
    { q: 'Un objet reste debout si son centre de gravité…', r: ['Est très haut', 'Tombe dans sa base d\u2019appui', 'Est à l\u2019extérieur', 'Est au-dessus du sol'], b: 1, e: 'Tant que la verticale passant par le centre de gravité tombe dans la base, l\u2019objet ne bascule pas.' },
    { q: 'Doubler l\u2019épaisseur d\u2019une poutre…', r: ['Ne change rien', 'La rend beaucoup plus résistante', 'La rend plus fragile', 'La rend plus lourde sans effet'], b: 1, e: 'La résistance augmente beaucoup plus vite que l\u2019épaisseur : une poutre deux fois plus épaisse supporte bien plus que le double.' },
    { q: 'Pourquoi les grues ont-elles un contrepoids ?', r: ['Pour décorer', 'Pour garder le centre de gravité dans la base', 'Pour aller plus vite', 'Pour chauffer le moteur'], b: 1, e: 'La charge au bout du bras déplacerait le centre de gravité hors de la base : le contrepoids le ramène à l\u2019intérieur.' },
    { q: 'Dans un pont en arc, les pierres travaillent…', r: ['En traction', 'En compression', 'En torsion', 'Sans effort'], b: 1, e: 'L\u2019arc reporte la charge en compression vers les appuis : la pierre résiste bien à la compression, pas à la traction.' },
    { q: 'Une base large rend un objet…', r: ['Plus stable', 'Plus instable', 'Plus léger', 'Plus fragile'], b: 0, e: 'Plus la base est large, plus le centre de gravité peut se déplacer avant de sortir de la zone d\u2019appui.' },
  ],
};
