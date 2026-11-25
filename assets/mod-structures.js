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
  /* Stabilité : la poutre est POSÉE sur deux appuis et dépasse à droite (porte-à-faux).
     G = centre de gravité de l'ensemble poutre + charge. Tant que G reste au-dessus de la base d'appui
     (du bord gauche de l'appui gauche au bord droit de l'appui droit), rien ne bascule ;
     dès que G dépasse le bord de l'appui droit, l'ensemble pivote autour de ce bord. */
  GEO: { x1: 170, x2: 600, bout: 800, baseG: 130, baseD: 640, baseY: 300 },
  stabilite(e) {
    const g = window.MODULE.GEO;
    const mPoutre = 20 * e.epaisseur;                          // kg : la poutre pèse plus quand elle est épaisse
    const xPoutre = (g.x1 + g.bout) / 2;                       // son propre centre de gravité, au milieu
    const px = g.x1 + (g.bout - 46 - g.x1) * (e.deplacement / 100);
    const xG = (mPoutre * xPoutre + e.charge * px) / (mPoutre + e.charge);
    return { px, xG, mPoutre, bascule: e.charge > 0 && xG > g.baseD };
  },
  dessiner(e) {
    const M = window.MODULE, g = M.GEO, max = M.capaciteMax(e);
    const rupture = e.charge > max;
    const st = M.stabilite(e);
    const fleche = st.bascule ? 0 : Math.min(60, (e.charge / Math.max(1, max)) * 28);
    const { x1, x2, bout, baseY } = g, cx = (x1 + x2) / 2;
    const remplir = rupture ? '#FCA5A5' : '#94A3B8', trait = rupture ? '#DC2626' : '#475569';
    /* La poutre fléchit ENTRE les appuis (ses extrémités restent posées dessus) :
       charge entre les appuis → creux au milieu, le bout du porte-à-faux se relève un peu ;
       charge sur le porte-à-faux → le bout plonge, la travée se soulève légèrement. */
    const sA = x1, sB = g.baseD - 30, h = e.epaisseur * 4;
    const surPorteAFaux = st.px > sB;
    const creux = (x) => {
      if (x <= sA) return 0;
      if (x <= sB) { const t = (x - sA) / (sB - sA); return (surPorteAFaux ? -0.25 : 1) * fleche * Math.sin(Math.PI * t); }
      const u = (x - sB) / (bout - sB); return (surPorteAFaux ? 1 : -0.35) * fleche * u;
    };
    const xs = []; for (let x = x1; x < bout; x += 10) xs.push(x); xs.push(bout);
    const plateau = `<path d="M${xs.map((x) => `${x} ${(baseY - h + creux(x)).toFixed(1)}`).join(' L')} L${xs.slice().reverse().map((x) => `${x} ${(baseY + h + creux(x)).toFixed(1)}`).join(' L')} Z" fill="${remplir}" stroke="${trait}" stroke-width="2" stroke-linejoin="round"/>`;
    let forme = plateau;
    if (e.forme === 'triangule') {
      forme += `<path d="M${x1} ${baseY + e.epaisseur * 4} L${cx} ${baseY - 70} L${x2} ${baseY + e.epaisseur * 4} Z" fill="none" stroke="#1E40AF" stroke-width="5"/>
        <path d="M${x1 + 100} ${baseY + e.epaisseur * 4} L${cx} ${baseY - 70} M${x2 - 100} ${baseY + e.epaisseur * 4} L${cx} ${baseY - 70}" stroke="#1E40AF" stroke-width="3" opacity=".6"/>`;
    } else if (e.forme === 'arc') {
      forme += `<path d="M${x1} ${baseY + e.epaisseur * 4} Q${cx} ${baseY - 150 - e.epaisseur * 6} ${x2} ${baseY + e.epaisseur * 4} L${x2} ${baseY + e.epaisseur * 4 + e.epaisseur * 6} Q${cx} ${baseY - 130 - e.epaisseur * 6} ${x1} ${baseY + e.epaisseur * 4 + e.epaisseur * 6} Z" fill="${remplir}" stroke="${trait}" stroke-width="2"/>`;
    }
    const yAppui = baseY + e.epaisseur * 4 + 2, sol = 372, hAppui = Math.max(6, sol - yAppui);
    const pivot = `${g.baseD} ${baseY + e.epaisseur * 4}`;
    const ensemble = `
      ${forme}
      <g transform="translate(${st.px} ${baseY - h + creux(st.px)})">
        <rect x="-46" y="-46" width="92" height="46" rx="8" fill="${rupture ? '#DC2626' : '#FCD34D'}" stroke="#B45309" stroke-width="2.5"/>
        <text x="0" y="-16" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="15" font-weight="700" fill="${rupture ? '#fff' : '#5A3B00'}">${e.charge} kg</text>
      </g>
      <circle cx="${st.xG}" cy="${baseY + creux(st.xG)}" r="11" fill="${st.bascule ? '#DC2626' : '#0EA5E9'}" stroke="#fff" stroke-width="2.5"/>
      <text x="${st.xG}" y="${baseY + creux(st.xG) + 5}" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="13" font-weight="800" fill="#fff">G</text>`;
    const couleurBase = st.bascule ? '#DC2626' : '#16A34A';
    return `
      <rect x="${g.baseG}" y="${yAppui}" width="60" height="${hAppui}" fill="#CBD5E1"/>
      <rect x="${g.baseD - 60}" y="${yAppui}" width="60" height="${hAppui}" fill="#CBD5E1"/>
      ${st.bascule ? `<g transform="rotate(9 ${pivot})">${ensemble}</g>` : ensemble}
      <line x1="${st.xG}" y1="${baseY + 14}" x2="${st.xG}" y2="${sol + 16}" stroke="${st.bascule ? '#DC2626' : '#0EA5E9'}" stroke-width="2" stroke-dasharray="5 5"/>
      <path d="M${g.baseG} ${sol + 6}v10h${g.baseD - g.baseG}v-10" fill="none" stroke="${couleurBase}" stroke-width="3"/>
      <text x="${(g.baseG + g.baseD) / 2}" y="${sol + 36}" text-anchor="middle" class="lab" fill="${couleurBase}">base d'appui</text>
      <text x="${bout - 70}" y="${sol - 10}" text-anchor="middle" class="lab">porte-à-faux</text>
      <text x="${cx + 60}" y="60" text-anchor="middle" class="lab">${st.bascule ? 'ÇA BASCULE : G est sorti de la base d\u2019appui' : rupture ? 'LA STRUCTURE CÈDE' : 'la structure tient'}</text>
      ${rupture && !st.bascule ? `<text x="${cx + 60}" y="84" text-anchor="middle" class="lab" fill="#DC2626">limite dépassée : ${Math.round(max)} kg maximum</text>` : ''}`;
  },
  mesures(e) {
    const M = window.MODULE, max = M.capaciteMax(e), r = e.charge / max, st = M.stabilite(e);
    return [{ valeur: Math.round(max) + ' kg', label: 'charge maximale' },
            { valeur: Math.round(r * 100) + ' %', label: 'de la limite', alerte: r > 1 },
            { valeur: st.bascule ? 'bascule' : 'stable', label: 'stabilité', alerte: st.bascule }];
  },
  commentaire(e) {
    const M = window.MODULE, max = M.capaciteMax(e), rupture = e.charge > max, st = M.stabilite(e);
    if (st.bascule) return { classe: 'faux', html: `<b>Ça bascule.</b> Le centre de gravité G de l'ensemble (poutre de ${st.mPoutre} kg + charge de ${e.charge} kg) est passé au-delà de l'appui de droite : plus rien ne retient la poutre de l'autre côté. Recule la charge, ou imagine un contrepoids à gauche, comme sur une grue.` };
    if (rupture) return { classe: 'faux', html: `<b>Ça cède.</b> Cette forme supporte au maximum ${Math.round(max)} kg avec ${e.epaisseur} cm d'épaisseur. Le triangle est la forme la plus rigide : il ne se déforme pas sans changer la longueur de ses côtés.` };
    return { classe: 'bon', html: `<b>Ça tient.</b> ${e.forme === 'triangule' ? 'Le triangle est indéformable : c\u2019est pourquoi il est partout (grues, charpentes, ponts).' : e.forme === 'arc' ? 'L\u2019arc reporte la charge vers les appuis latéraux : c\u2019est le principe des voûtes romaines.' : 'La poutre plate travaille en flexion : elle plie au milieu. Doubler son épaisseur la rend bien plus résistante.'} ${st.xG > M.GEO.baseD - 40 ? 'Attention : G s\u2019approche du bord de l\u2019appui de droite.' : ''}` };
  },
  defis: [
    { id: 'tri', texte: 'Passe en triangulée et soutiens 400 kg.', xp: 25, bravo: 'le triangle gagne, largement.', quand: (e) => e.forme === 'triangule' && e.charge >= 400 && e.charge <= window.MODULE.capaciteMax(e) },
    { id: 'casse', texte: 'Dépasse la limite et observe la rupture.', xp: 20, bravo: 'tu as trouvé le point de rupture.', quand: (e) => e.charge > window.MODULE.capaciteMax(e) },
    { id: 'basculer', texte: 'Décale le poids vers le bout du porte-à-faux jusqu\u2019à ce que ça bascule, et explique pourquoi.', xp: 20, bravo: 'le centre de gravité G est sorti de la base d\u2019appui.', quand: (e) => window.MODULE.stabilite(e).bascule },
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
