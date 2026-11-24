/* Module Forces et machines — ressort (loi de Hooke) et levier. D'après l'Angleterre (KS3 forces,
   moment, Hooke's law), le Japon (force du vent et du caoutchouc) et l'Ontario (structures et mécanismes). */
window.MODULE = {
  id: 'forces',
  titre: 'Forces et machines', titreHtml: 'Pousser, tirer,<br><span class="grad">soulever.</span>',
  kicker: 'Sciences · les forces', badge: 'mécanicien',
  couleur: ['#A0A6B8', '#5A6478'],
  sousTitre: "Une force se mesure en newtons. Accroche des masses à un ressort et regarde l'allongement. Puis place une charge sur un levier et cherche l'équilibre en déplaçant le pivot.",
  largeur: 900, hauteur: 420,
  etat: { mode: 'ressort', masse: 200, pivot: 50, charge: 300 },
  controles: [
    { id: 'mode', label: 'Expérience', options: [{ v: 'ressort', label: 'Ressort' }, { v: 'levier', label: 'Levier' }] },
    { id: 'masse', label: 'Masse suspendue', type: 'curseur', min: 0, max: 1000, step: 50, unit: ' g' },
    { id: 'pivot', label: 'Position du pivot', type: 'curseur', min: 10, max: 90, step: 5, unit: ' %' },
    { id: 'charge', label: 'Charge', type: 'curseur', min: 50, max: 1000, step: 50, unit: ' g' },
  ],
  dessiner(e) {
    if (e.mode === 'levier') {
      const L = 660, x0 = 120, xp = x0 + L * e.pivot / 100;
      const gauche = xp - x0, droite = x0 + L - xp;
      const effort = (e.charge * droite) / Math.max(20, gauche);
      return `
        <rect x="80" y="80" width="20" height="40" fill="#94A3B8"/>
        <line x1="${x0}" y1="180" x2="${x0 + L}" y2="180" stroke="#475569" stroke-width="14" stroke-linecap="round"/>
        <path d="M${xp - 26} 250 L${xp + 26} 250 L${xp} 186 Z" fill="#64748B"/>
        <text x="${xp}" y="272" text-anchor="middle" class="lab">pivot</text>
        <rect x="${x0 - 26}" y="120" width="52" height="52" rx="8" fill="#FCA5A5" stroke="#DC2626" stroke-width="2.5"/>
        <text x="${x0}" y="106" text-anchor="middle" class="lab">charge ${e.charge} g</text>
        <path d="M${x0 + L} 130 v36" stroke="#16A34A" stroke-width="5" stroke-linecap="round"/>
        <path d="M${x0 + L} 148 l-12 -14 M${x0 + L} 148 l12 -14" stroke="#16A34A" stroke-width="5" stroke-linecap="round" fill="none"/>
        <text x="${x0 + L}" y="112" text-anchor="middle" class="lab">effort ${Math.round(effort)} g</text>
        <line x1="${x0}" y1="200" x2="${xp}" y2="200" stroke="#0EA5E9" stroke-width="2" stroke-dasharray="6 5"/>
        <text x="${(x0 + xp) / 2}" y="${228}" text-anchor="middle" class="lab">${Math.round(gauche)} mm</text>
        <line x1="${xp}" y1="200" x2="${x0 + L}" y2="200" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6 5"/>
        <text x="${(xp + x0 + L) / 2}" y="${228}" text-anchor="middle" class="lab">${Math.round(droite)} mm</text>`;
    }
    const F = e.masse / 1000 * 9.81, k = 40, allong = F / k * 1000;
    return `
      <rect x="380" y="40" width="140" height="14" rx="6" fill="#64748B"/>
      <g stroke="#475569" stroke-width="6" fill="none" stroke-linejoin="round">
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${392 + (i % 2) * 116} ${56 + i * 14} h116"/>`).join('')}
      </g>
      <g transform="translate(0 ${Math.min(180, allong * 1.6)})">
        <line x1="450" y1="182" x2="450" y2="230" stroke="#94A3B8" stroke-width="3"/>
        <rect x="404" y="230" width="92" height="70" rx="12" fill="#FCD34D" stroke="#B45309" stroke-width="2.5"/>
        <text x="450" y="272" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="15" font-weight="700" fill="#5A3B00">${e.masse} g</text>
      </g>
      <line x1="600" y1="56" x2="600" y2="${56 + Math.min(180, allong * 1.6)}" stroke="#0071E3" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="612" y="${56 + Math.min(180, allong * 1.6) / 2}" class="lab">allongement ${allong.toFixed(0)} mm</text>
      <text x="200" y="60" class="lab">ressort k = 40 N/m</text>`;
  },
  mesures(e) {
    if (e.mode === 'levier') {
      const L = 660, xp = 120 + L * e.pivot / 100;
      const gauche = xp - 120, droite = 120 + L - xp;
      const effort = e.charge * droite / gauche;
      return [{ valeur: Math.round(effort) + ' g', label: 'effort à fournir' },
              { valeur: (droite / gauche).toFixed(2), label: 'avantage mécanique' },
              { valeur: Math.round(e.charge * droite) + ' N·mm', label: 'moment de la charge' }];
    }
    const F = e.masse / 1000 * 9.81, allong = F / 40 * 1000;
    return [{ valeur: F.toFixed(2) + ' N', label: 'poids (F = m × g)' },
            { valeur: allong.toFixed(0) + ' mm', label: 'allongement du ressort' },
            { valeur: '40 N/m', label: 'raideur k' }];
  },
  commentaire(e) {
    if (e.mode === 'levier') {
      const L = 660, xp = 120 + L * e.pivot / 100, gauche = xp - 120, droite = 120 + L - xp;
      const effort = e.charge * droite / gauche;
      const gain = effort < e.charge;
      return { classe: gain ? 'bon' : '', html: `<b>${gain ? 'Le levier multiplie la force.' : 'Le levier demande plus d\u2019effort.'}</b> Le moment se conserve : charge × bras court = effort × bras long. Ici, il faut ${Math.round(effort)} g pour soulever ${e.charge} g. Plus le pivot est proche de la charge, plus c'est facile.` };
    }
    return { classe: 'bon', html: `<b>L'allongement est proportionnel au poids.</b> Un ressort double de longueur pour un poids double : c'est la loi de Hooke, F = k × allongement. Au-delà d'une certaine masse, le ressort ne revient plus : il est déformé.` };
  },
  defis: [
    { id: 'hooke', texte: 'Double la masse et vérifie que l\u2019allongement double aussi.', xp: 20, bravo: 'la loi de Hooke vérifiée.',
      quand: (e) => e.mode === 'ressort' && e.masse >= 400 },
    { id: 'facile', texte: 'Sur le levier, obtiens un effort inférieur à la moitié de la charge.', xp: 25, bravo: 'brassard long côté effort : tu soulèves deux fois plus.',
      quand: (e) => { if (e.mode !== 'levier') return false; const L = 660, xp = 120 + L * e.pivot / 100; return e.charge * (120 + L - xp) / (xp - 120) < e.charge / 2; } },
    { id: 'equilibre', texte: 'Trouve la position du pivot qui demande exactement autant d\u2019effort que la charge.', xp: 20, bravo: 'pivot au milieu : aucun avantage, aucun désavantage.',
      quand: (e) => e.mode === 'levier' && e.pivot >= 45 && e.pivot <= 55 },
  ],
  fiches: [
    { id: 'newton', court: 'Mesure', nom: 'Une force se mesure en newtons', texte: "Une force est une action qui déforme ou modifie le mouvement. On la mesure avec un <b>dynamomètre</b>, en newtons (N). Le poids d'un objet de 1 kg est d'environ 9,81 N sur Terre.", plus: "Le poids dépend du lieu : sur la Lune, il serait six fois plus faible, alors que la masse reste la même. C'est la confusion la plus fréquente entre masse (en kg) et poids (en N)." },
    { id: 'hooke', court: 'Ressort', nom: 'La loi de Hooke', texte: "L'allongement d'un ressort est <b>proportionnel</b> à la force qui le tire : F = k × x, où k est la raideur en N/m. C'est le principe du pèse-personne mécanique.", plus: "Au-delà de la limite d'élasticité, le ressort ne revient plus à sa longueur initiale. La même loi décrit la déformation d'un pont ou d'une poutre sous une charge." },
    { id: 'levier', court: 'Levier', nom: 'Le moment, ou l\u2019effet de levier', texte: "Un levier permet de soulever lourd avec peu d'effort, à condition d'avoir un <b>grand bras</b> du côté de l'effort. Le moment vaut force × distance au pivot.", plus: "Une brouette, une pince, une paire de ciseaux, un pied-de-biche : tous sont des leviers. Archimède aurait dit : « Donnez-moi un point d'appui et je soulèverai le monde. »" },
    { id: 'frottement', court: 'Frottement', nom: 'Le frottement freine', texte: "Deux surfaces en contact s'opposent au mouvement : c'est le <b>frottement</b>. Il dépend des matériaux et de la force qui presse. Il chauffe et use.", plus: "Le frottement est parfois utile (freins, semelles, adhérence des pneus) et parfois nuisible (il faut le lubrifier dans un moteur). Dans l'eau ou dans l'air, on parle de résistance à l'avancement." },
  ],
  experiences: [
    { titre: 'Le dynamomètre maison', texte: 'Accroche un élastique à un clou, suspends des objets dont tu connais la masse (100 g, 200 g, 500 g) et mesure l\u2019allongement avec une règle. Double la masse, double l\u2019allongement.' },
    { titre: 'La règle-levier', texte: 'Pose une règle sur un crayon. Place une pièce d\u2019un côté, une pile de pièces de l\u2019autre. Déplace le crayon jusqu\u2019à l\u2019équilibre et note les distances.' },
    { titre: 'Le frottement', texte: 'Fais glisser un livre sur une table lisse, puis sur un torchon : il va moins loin. Incline la table et recommence avec un livre plus lourd.' },
  ],
  quiz: [
    { q: 'Dans quelle unité mesure-t-on une force ?', r: ['En kilogrammes', 'En newtons', 'En watts', 'En joules'], b: 1, e: 'La force se mesure en newtons (N) avec un dynamomètre. Le kilogramme est une masse, pas une force.' },
    { q: 'Que dit la loi de Hooke ?', r: ['L\u2019allongement est proportionnel à la force', 'Le ressort casse au-delà de 1 kg', 'La force ne dépend pas du ressort', 'L\u2019allongement double la masse'], b: 0, e: 'F = k × x : si la force double, l\u2019allongement double, tant qu\u2019on reste dans la zone élastique.' },
    { q: 'Pour soulever une lourde charge avec un levier, il faut…', r: ['Un pivot proche de la charge', 'Un pivot proche de la main', 'Un pivot au milieu', 'Aucun pivot'], b: 0, e: 'Plus le bras côté effort est long par rapport au bras côté charge, plus l\u2019effort nécessaire est faible.' },
    { q: 'Le poids d\u2019un objet de 1 kg sur Terre vaut environ…', r: ['1 N', '9,81 N', '100 N', '0,1 N'], b: 1, e: 'P = m × g avec g ≈ 9,81 N/kg. Sur la Lune, g ≈ 1,62 N/kg : le poids serait bien plus faible.' },
    { q: 'Quel dispositif utilise le frottement volontairement ?', r: ['Un patin à roulettes', 'Un frein de vélo', 'Une poulie', 'Un aimant'], b: 1, e: 'Le frein transforme le mouvement en chaleur par frottement : c\u2019est un frottement utile, voulu.' },
    { q: 'Une poulie simple sert à…', r: ['Multiplier la force par deux', 'Changer la direction de la force sans en gagner', 'Supprimer le poids', 'Chauffer l\u2019eau'], b: 1, e: 'Une poulie fixe ne change pas l\u2019intensité de la force : elle change seulement sa direction, ce qui rend le travail plus commode.' },
  ],
};
