/* Module Chaleur et son — transferts thermiques et ondes sonores.
   D'après la Finlande (chaleur, mouvement ondulatoire) et l'Angleterre (waves, sound, energy). */
window.MODULE = {
  id: 'chaleur',
  titre: 'Chaleur et son', titreHtml: 'Ça chauffe,<br><span class="grad">ça vibre.</span>',
  kicker: 'Sciences · chaleur et son', badge: 'thermicien',
  couleur: ['#FB923C', '#EA580C'],
  sousTitre: "Pourquoi une cuillère en métal brûle et pas le manche en bois ? Comment une vibration devient un son ? Choisis un matériau, une durée, puis une fréquence.",
  largeur: 900, hauteur: 400,
  etat: { mode: 'chaleur', materiau: 'metal', temps: 30, frequence: 440, milieu: 'air' },
  controles: [
    { id: 'mode', label: 'Expérience', options: [{ v: 'chaleur', label: 'Transfert de chaleur' }, { v: 'son', label: 'Son' }] },
    { id: 'materiau', label: 'Matériau', options: [{ v: 'metal', label: 'Métal' }, { v: 'verre', label: 'Verre' }, { v: 'bois', label: 'Bois' }, { v: 'plastique', label: 'Plastique' }] },
    { id: 'temps', label: 'Durée de chauffe', type: 'curseur', min: 0, max: 120, step: 5, unit: ' s' },
    { id: 'frequence', label: 'Fréquence', type: 'curseur', min: 100, max: 1000, step: 10, unit: ' Hz' },
    { id: 'milieu', label: 'Milieu', options: [{ v: 'air', label: 'Air' }, { v: 'eau', label: 'Eau' }, { v: 'acier', label: 'Acier' }] },
  ],
  COND: { metal: { nom: 'métal', k: 1, note: 'excellent conducteur' }, verre: { nom: 'verre', k: 0.35, note: 'conducteur moyen' },
          bois: { nom: 'bois', k: 0.08, note: 'mauvais conducteur' }, plastique: { nom: 'plastique', k: 0.05, note: 'isolant' } },
  VITESSES: { air: 343, eau: 1480, acier: 5000 },
  dessiner(e) {
    if (e.mode === 'son') {
      const lambda = window.MODULE.VITESSES[e.milieu] / e.frequence;
      const periodes = Math.min(14, Math.max(2, Math.round(8e2 / e.frequence * 6)));
      let d = `M 80 200`;
      for (let i = 0; i < 300; i++) { const x = 80 + i * 2.4; d += ` L ${x} ${200 - 70 * Math.sin((i / 300) * Math.PI * 2 * (periode(e.frequence)))}`; }
      function periode(fq) { return Math.max(1.5, Math.min(14, 6000 / fq)); }
      return `
        <line x1="60" y1="200" x2="860" y2="200" stroke="#E2E8F0" stroke-width="2"/>
        <path d="${d}" fill="none" stroke="#EA580C" stroke-width="3.5"/>
        <text x="450" y="60" text-anchor="middle" class="lab">onde sonore · ${e.frequence} Hz · longueur d'onde ${lambda.toFixed(2)} m</text>
        <circle cx="120" cy="200" r="26" fill="#FED7AA" stroke="#EA580C" stroke-width="3"/>
        <g stroke="#EA580C" stroke-width="3"><path d="M100 200 h-8"/><path d="M108 180 h-8"/><path d="M108 220 h-8"/></g>
        <text x="120" y="256" text-anchor="middle" class="lab">haut-parleur</text>
        <rect x="700" y="150" width="120" height="100" rx="10" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2"/>
        <text x="760" y="206" text-anchor="middle" class="lab">oreille</text>
        <text x="450" y="360" text-anchor="middle" class="lab">dans ${e.milieu} : ${window.MODULE.VITESSES[e.milieu]} m/s</text>`;
    }
    const c = window.MODULE.COND[e.materiau];
    const chaud = Math.min(1, (e.temps / 120) * c.k * 1.6);
    const tempFin = 20 + chaud * 60;
    return `
      <rect x="60" y="200" width="240" height="26" rx="6" fill="#FB923C"/>
      <text x="180" y="186" text-anchor="middle" class="lab">source chaude 80 °C</text>
      <rect x="300" y="196" width="560" height="34" rx="8" fill="${e.materiau === 'metal' ? '#CBD5E1' : e.materiau === 'verre' ? '#BFDBFE' : e.materiau === 'bois' ? '#D6B98C' : '#E2E8F0'}"/>
      <g opacity="${chaud}">
        <rect x="300" y="196" width="${560 * Math.min(1, chaud * 1.4)}" height="34" rx="8" fill="url(#degradeChaud)"/>
      </g>
      <defs><linearGradient id="degradeChaud"><stop offset="0" stop-color="#F97316"/><stop offset="1" stop-color="#FDBA74" stop-opacity="0"/></linearGradient></defs>
      <text x="580" y="182" text-anchor="middle" class="lab">${c.nom} — ${c.note}</text>
      <circle cx="840" cy="213" r="16" fill="#FFF" stroke="#94A3B8" stroke-width="2"/>
      <text x="840" y="258" text-anchor="middle" class="lab">${tempFin.toFixed(0)} °C</text>
      <line x1="840" y1="150" x2="840" y2="${213 - 40 - 60 * chaud}" stroke="#EA580C" stroke-width="6" stroke-linecap="round" opacity="${0.2 + chaud * 0.8}"/>
      <text x="450" y="330" text-anchor="middle" class="lab">la chaleur se déplace du chaud vers le froid, par conduction</text>`;
  },
  mesures(e) {
    if (e.mode === 'son') {
      const v = window.MODULE.VITESSES[e.milieu];
      return [{ valeur: e.frequence + ' Hz', label: 'fréquence' }, { valeur: (v / e.frequence).toFixed(2) + ' m', label: 'longueur d\u2019onde' },
              { valeur: v + ' m/s', label: 'vitesse du son' }];
    }
    const c = window.MODULE.COND[e.materiau], chaud = Math.min(1, (e.temps / 120) * c.k * 1.6);
    return [{ valeur: (20 + chaud * 60).toFixed(0) + ' °C', label: 'température à l\u2019autre bout' },
            { valeur: (chaud * 100).toFixed(0) + ' %', label: 'chaleur transmise' },
            { valeur: c.k.toFixed(2), label: 'conductivité relative' }];
  },
  commentaire(e) {
    if (e.mode === 'son') return { classe: 'bon', html: `<b>Un son est une vibration qui se propage.</b> Plus la fréquence est élevée, plus le son est <b>aigu</b>. La longueur d'onde diminue quand la fréquence augmente, et le son va 4 fois plus vite dans l'eau que dans l'air.` };
    const c = window.MODULE.COND[e.materiau];
    return { classe: '', html: `<b>${c.nom.charAt(0).toUpperCase() + c.nom.slice(1)} : ${c.note}.</b> La chaleur se transmet par <b>conduction</b>, de proche en proche, du chaud vers le froid. Un métal transmet vite (électrons libres), le bois et le plastique presque pas — d'où les manches isolants en cuisine.` };
  },
  defis: [
    { id: 'isole', texte: 'Trouve le matériau qui transmet le moins la chaleur.', xp: 20, bravo: 'le plastique isole le mieux.',
      quand: (e) => e.mode === 'chaleur' && e.materiau === 'plastique' && e.temps >= 60 },
    { id: 'aigu', texte: 'Monte à 1000 Hz et observe la longueur d\u2019onde.', xp: 20, bravo: 'plus c\u2019est aigu, plus la longueur d\u2019onde est courte.',
      quand: (e) => e.mode === 'son' && e.frequence >= 1000 },
    { id: 'acier', texte: 'Compare la vitesse du son dans l\u2019air et dans l\u2019acier.', xp: 25, bravo: '14 fois plus vite dans l\u2019acier.',
      quand: (e) => e.mode === 'son' && e.milieu === 'acier' },
  ],
  fiches: [
    { id: 'conduction', court: 'Conduction', nom: 'La chaleur se déplace', texte: "Trois modes : <b>conduction</b> (de proche en proche, dans un solide), <b>convection</b> (un fluide chaud monte), <b>rayonnement</b> (le Soleil, sans support).", plus: "Un thermos combine les trois : double paroi (conduction limitée), vide (convection supprimée), surface réfléchissante (rayonnement renvoyé)." },
    { id: 'isolant', court: 'Isolation', nom: 'Conducteur ou isolant thermique', texte: "Les métaux conduisent bien la chaleur, l'air immobile, le bois et les mousses isolent. C'est pourquoi un pull en laine garde la chaleur : il <b>emprisonne de l'air</b>.", plus: "La sensation de froid en touchant du métal vient de la vitesse à laquelle il évacue la chaleur de ta main — pas de sa température réelle. À 20 °C, le métal ne fait pas plus froid que le bois : il évacue plus vite." },
    { id: 'son', court: 'Son', nom: 'Le son a besoin d\u2019un milieu', texte: "Le son est une vibration qui se propage de proche en proche. Il a besoin de <b>matière</b> : dans le vide, aucun son. Sa vitesse est de 343 m/s dans l'air, 1480 m/s dans l'eau.", plus: "La fréquence (en hertz) fixe la hauteur du son : 20 Hz à 20 000 Hz pour une oreille humaine, davantage pour un chien. L'amplitude fixe le volume, le timbre dépend des harmoniques." },
    { id: 'energie', court: 'Bilan', nom: 'Chaleur et énergie', texte: "Chauffer, c'est apporter de l'énergie. Il faut par exemple 4 180 joules pour élever 1 litre d'eau de 1 °C. Cette énergie vient toujours d'une autre forme.", plus: "C'est la grandeur « capacité thermique » : 4 180 J/kg/°C pour l'eau, contre environ 900 J/kg/°C pour l'aluminium. L'eau stocke donc beaucoup de chaleur — d'où son usage en chauffage." },
  ],
  experiences: [
    { titre: 'Le test des cuillères', texte: 'Plonge une cuillère en métal, une en bois et un crayon dans un bol d\u2019eau chaude. Touche les manches après 30 secondes : le métal chauffe, le bois non.' },
    { titre: 'Le son dans la table', texte: 'Pose un téléphone en haut-parleur sur la table et bouche-toi les oreilles, puis colle l\u2019oreille à la table : le son passe bien mieux dans le solide que dans l\u2019air.' },
    { titre: 'Le verre musical', texte: 'Remplis trois verres d\u2019eau à des hauteurs différentes et frotte le bord du doigt : plus il y a d\u2019eau, plus le son est grave.' },
  ],
  quiz: [
    { q: 'Comment la chaleur se transmet-elle dans un métal ?', r: ['Par conduction', 'Par rayonnement seulement', 'Par convection', 'Elle ne se transmet pas'], b: 0, e: 'Dans un solide, la chaleur se propage par conduction, de proche en proche, sans déplacement de matière.' },
    { q: 'Pourquoi un manche en bois protège-t-il de la chaleur ?', r: ['Il est froid', 'Il conduit mal la chaleur', 'Il conduit très bien la chaleur', 'Il refroidit la casserole'], b: 1, e: 'Le bois est un mauvais conducteur : la chaleur met très longtemps à le traverser.' },
    { q: 'Le son peut-il se propager dans le vide ?', r: ['Oui, très vite', 'Non, il a besoin de matière', 'Oui, mais seulement les sons graves', 'Oui, si le son est fort'], b: 1, e: 'Le son est une vibration de matière : sans matière, rien ne vibre, donc pas de son.' },
    { q: 'Une fréquence plus élevée correspond à un son…', r: ['Plus grave', 'Plus aigu', 'Plus fort', 'Plus long'], b: 1, e: 'La fréquence fixe la hauteur : plus elle est élevée, plus le son est aigu. L\u2019amplitude fixe le volume.' },
    { q: 'Quelle est la vitesse du son dans l\u2019air ?', r: ['34 m/s', '343 m/s', '1 480 m/s', '5 000 m/s'], b: 1, e: 'Environ 343 m/s dans l\u2019air, 1480 m/s dans l\u2019eau et 5000 m/s dans l\u2019acier.' },
    { q: 'Quel mode de transfert utilise le Soleil pour nous chauffer ?', r: ['Conduction', 'Convection', 'Rayonnement', 'Évaporation'], b: 2, e: 'Entre le Soleil et la Terre, il n\u2019y a pas de matière : seule la lumière, par rayonnement, transporte la chaleur.' },
  ],
};
