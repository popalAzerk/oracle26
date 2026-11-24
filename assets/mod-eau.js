/* Module Eau et fluides — cycle de l'eau, flottabilité, pression. D'après l'Ontario 8e année
   (fluid mechanics, water systems), Singapour (cycles in matter and water) et la Finlande (air et eau). */
window.MODULE = {
  id: 'eau',
  titre: 'Eau et fluides', titreHtml: 'L\'eau,<br><span class="grad">ça pèse et ça pousse.</span>',
  kicker: 'Sciences · l\'eau', badge: 'hydrographe',
  couleur: ['#5AC8FA', '#0071E3'],
  sousTitre: "Pourquoi un bateau en acier flotte et caillou coule ? Pourquoi l'eau du fond pousse-t-elle plus que celle de la surface ? Règle la masse volumique et la profondeur, et observe.",
  largeur: 900, hauteur: 420,
  etat: { mode: 'flottaison', densite: 700, profondeur: 2 },
  controles: [
    { id: 'mode', label: 'Expérience', options: [{ v: 'flottaison', label: 'Flottaison' }, { v: 'pression', label: 'Pression' }, { v: 'cycle', label: 'Cycle de l\u2019eau' }] },
    { id: 'densite', label: 'Masse volumique', type: 'curseur', min: 100, max: 2000, step: 20, unit: ' kg/m³' },
    { id: 'profondeur', label: 'Profondeur', type: 'curseur', min: 0, max: 10, step: 0.5, unit: ' m' },
  ],
  dessiner(e) {
    if (e.mode === 'cycle') return `
      <rect x="0" y="0" width="900" height="420" fill="#F8FAFC"/>
      <rect x="0" y="300" width="900" height="120" fill="#DBEAFE"/>
      <path d="M0 300 q120 -26 240 0 t240 0 t240 0 t180 0 v6 H0 Z" fill="#93C5FD"/>
      <circle cx="740" cy="80" r="40" fill="#FDE68A" stroke="#F59E0B" stroke-width="3"/>
      <g stroke="#0EA5E9" stroke-width="4" fill="none" stroke-linecap="round">
        <path d="M700 320 q-40 -90 -110 -120"/><path d="M560 250 q-60 -20 -90 -80"/>
      </g>
      <path d="M300 200 q20 -40 60 -30 q30 -46 80 -20 q50 -6 50 40 z" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2.5"/>
      <g stroke="#0071E3" stroke-width="4" stroke-linecap="round">
        <path d="M250 120 v40 M270 130 v40 M290 120 v40"/>
        <path d="M420 300 v-40 M440 310 v-40 M460 300 v-40"/>
      </g>
      <g fill="#1D1D1F" font-family="-apple-system,sans-serif" font-size="14" font-weight="600">
        <text x="90" y="70">1 · Évaporation</text><text x="330" y="150">2 · Condensation</text>
        <text x="640" y="170">3 · Précipitations</text><text x="470" y="380">4 · Ruissellement et infiltration</text>
      </g>
      <text x="90" y="92" font-size="12" fill="#6E6E73" font-family="-apple-system,sans-serif">le soleil chauffe, l'eau s'évapore</text>
      <text x="330" y="172" font-size="12" fill="#6E6E73" font-family="-apple-system,sans-serif">la vapeur refroidit, forme des gouttes</text>
      <text x="640" y="192" font-size="12" fill="#6E6E73" font-family="-apple-system,sans-serif">pluie, neige, grêle</text>
      <text x="470" y="402" font-size="12" fill="#6E6E73" font-family="-apple-system,sans-serif">nappes phréatiques, rivières, retour à la mer</text>`;
    if (e.mode === 'pression') {
      const y = 340 - e.profondeur * 26;
      return `
      <rect x="60" y="60" width="780" height="320" rx="8" fill="#DBEAFE" stroke="#60A5FA" stroke-width="3"/>
      <path d="M60 60 q80 -18 160 0 t160 0 t160 0 t160 0 t140 0" fill="none" stroke="#93C5FD" stroke-width="4"/>
      <circle cx="450" cy="${y}" r="16" fill="#0071E3"/>
      <text x="470" y="${y + 5}" class="lab">capteur</text>
      <line x1="450" y1="${y}" x2="450" y2="380" stroke="#0071E3" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="456" y="374" class="lab">${e.profondeur} m</text>
      <g stroke="#1D1D1F" stroke-width="2"><line x1="760" y1="80" x2="760" y2="360"/><path d="M754 88 l6 -10 l6 10"/><path d="M754 352 l6 10 l6 -10"/></g>
      <text x="790" y="230" class="lab">profondeur</text>
      <text x="90" y="96" class="lab">surface</text>
      <text x="90" y="370" class="lab">fond</text>`;
    }
    const rho = e.densite, immerge = Math.min(1, rho / 1000);
    const cy = 210 + immerge * 70;
    return `
      <rect x="0" y="150" width="900" height="270" fill="#DBEAFE"/>
      <path d="M0 150 q60 -16 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t60 0" fill="none" stroke="#60A5FA" stroke-width="4"/>
      <text x="70" y="140" class="lab">surface de l'eau</text>
      <g transform="translate(450 ${cy})">
        <rect x="-70" y="-56" width="140" height="112" rx="12" fill="${rho < 1000 ? '#FCD34D' : '#94A3B8'}" stroke="#1D1D1F" stroke-width="2.5"/>
        <text x="0" y="6" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="15" font-weight="700" fill="#1D1D1F">${rho} kg/m³</text>
      </g>
      <line x1="120" y1="150" x2="120" y2="${cy}" stroke="#0071E3" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="130" y="${cy - 10}" class="lab">${Math.round(immerge * 100)} % immergé</text>
      <text x="640" y="392" class="lab">eau : 1000 kg/m³</text>`;
  },
  mesures(e) {
    if (e.mode === 'pression') {
      const p = 1000 * 9.81 * e.profondeur;
      return [{ valeur: (p / 1000).toFixed(1) + ' kPa', label: 'pression à cette profondeur' },
              { valeur: (p / 100000).toFixed(2) + ' bar', label: 'soit en bars' },
              { valeur: e.profondeur + ' m', label: 'profondeur' }];
    }
    if (e.mode === 'cycle') return [{ valeur: '5', label: 'étapes du cycle' }, { valeur: '71 %', label: 'de la Terre couverte d\u2019eau' }, { valeur: '3 %', label: 'd\u2019eau douce' }];
    const immerge = Math.min(1, e.densite / 1000) * 100;
    return [{ valeur: e.densite < 1000 ? 'flotte' : 'coule', label: 'résultat', alerte: e.densite >= 1000 && e.densite < 1010 },
            { valeur: Math.round(immerge) + ' %', label: 'volume immergé' },
            { valeur: (1000 - e.densite) + '', label: 'écart avec l\u2019eau' }];
  },
  commentaire(e) {
    if (e.mode === 'cycle') return { classe: 'bon', html: `<b>L'eau tourne en boucle.</b> Elle s'évapore avec la chaleur du Soleil, se condense en nuages, retombe en pluie et ruisselle jusqu'à la mer : la quantité d'eau sur Terre ne change pas, seule sa forme change.` };
    if (e.mode === 'pression') {
      const p = (1000 * 9.81 * e.profondeur / 1000).toFixed(1);
      return { classe: '', html: `<b>La pression augmente avec la profondeur.</b> À ${e.profondeur} m, l'eau exerce ${p} kPa de plus que l'air à la surface : c'est le poids de la colonne d'eau au-dessus. Tous les 10 m, on gagne environ 1 bar.` };
    }
    return e.densite < 1000
      ? { classe: 'bon', html: `<b>Ça flotte.</b> Un objet moins dense que l'eau (moins de 1000 kg/m³) remonte : il déplace un volume d'eau dont le poids égale le sien. C'est la poussée d'Archimède.` }
      : { classe: 'faux', html: `<b>Ça coule.</b> Plus dense que l'eau, l'objet descend : la poussée d'Archimède ne suffit plus à le porter. Un bateau en acier flotte parce que sa <b>forme creuse</b> le rend globalement moins dense que l'eau.` };
  },
  defis: [
    { id: 'flotte', texte: 'Trouve une masse volumique qui flotte à moitié immergée.', xp: 20, bravo: 'tu as trouvé l\u2019équilibre autour de 500 kg/m³.',
      quand: (e) => e.mode === 'flottaison' && e.densite >= 470 && e.densite <= 530 },
    { id: 'fond', texte: 'Atteins 10 mètres de profondeur et lis la pression.', xp: 20, bravo: 'environ 1 bar de plus qu\u2019en surface.',
      quand: (e) => e.mode === 'pression' && e.profondeur >= 10 },
    { id: 'couler', texte: 'Fais couler un objet, puis explique pourquoi un bateau en acier flotte.', xp: 25, bravo: 'la forme creuse change tout.',
      quand: (e) => e.mode === 'flottaison' && e.densite >= 1000 },
  ],
  fiches: [
    { id: 'archimede', court: 'Flottaison', nom: 'La poussée d\u2019Archimède', texte: "Un objet plongé dans un liquide subit une poussée verticale vers le haut égale au <b>poids du liquide déplacé</b>. Si cette poussée dépasse son poids, il flotte.", plus: "C'est en sortant de son bain que le savant grec Archimède aurait compris ce principe. Un paquebot déplace des dizaines de milliers de tonnes d'eau : voilà pourquoi il ne coule pas." },
    { id: 'pression', court: 'Pression', nom: 'La pression de l\u2019eau', texte: "La pression augmente avec la <b>profondeur</b> : chaque 10 mètres ajoutent environ 1 bar. Elle dépend aussi du liquide (l'eau salée est plus dense) mais pas de la forme du récipient.", plus: "C'est le principe des barrages et des châteaux d'eau : la pression vient du poids de la colonne d'eau au-dessus. Un plongeur ressent cette pression dans les oreilles dès 2 ou 3 mètres." },
    { id: 'hydraulique', court: 'Hydraulique', nom: 'Transmettre une force par un liquide', texte: "Un liquide est presque <b>incompressible</b> : pousser d'un côté transmet la force de l'autre. Les freins de voiture, les pelles mécaniques et les vérins utilisent cette propriété.", plus: "Avec des pistons de tailles différentes, on multiplie la force (principe de Pascal) : une petite pression sur un petit piston peut soulever une charge lourde sur un gros piston." },
    { id: 'cycle', court: 'Cycle', nom: 'Le cycle de l\u2019eau', texte: "Évaporation, condensation, précipitations, ruissellement : l'eau change d'état et de place en permanence. <b>La quantité totale ne change pas.</b>", plus: "Le traitement de l'eau du robinet reproduit ces étapes en accéléré : dégrillage, décantation, filtration, désinfection. Une station d'épuration refait le travail après usage." },
  ],
  experiences: [
    { titre: 'L\u2019œuf qui flotte', texte: 'Un verre d\u2019eau, un œuf : il coule. Ajoute du sel et remue : l\u2019œuf remonte. L\u2019eau salée est plus dense, donc la poussée d\u2019Archimède augmente.' },
    { titre: 'La pression du trou', texte: 'Perce trois trous à des hauteurs différentes dans une bouteille remplie d\u2019eau : le jet du trou le plus bas va plus loin. La pression augmente avec la profondeur.' },
    { titre: 'Le verre retourné', texte: 'Remplis un verre, pose une feuille de papier dessus et retourne-le rapidement : l\u2019eau ne tombe pas. La pression de l\u2019air extérieur la retient.' },
  ],
  quiz: [
    { q: 'Un objet de 700 kg/m³ est posé dans l\u2019eau. Que fait-il ?', r: ['Il flotte', 'Il coule', 'Il reste au milieu sans bouger', 'Il se dissout'], b: 0, e: 'Moins dense que l\u2019eau (1000 kg/m³), il remonte jusqu\u2019à flotter en déplaçant son propre poids d\u2019eau.' },
    { q: 'La pression dans l\u2019eau dépend de…', r: ['La forme du récipient', 'La profondeur', 'La couleur de l\u2019eau', 'La largeur du seau'], b: 1, e: 'Elle dépend de la profondeur et de la densité du liquide, pas de la forme du récipient.' },
    { q: 'Tous les 10 m de profondeur, la pression augmente d\u2019environ…', r: ['0,1 bar', '1 bar', '10 bars', '100 bars'], b: 1, e: 'Environ 1 bar par 10 m d\u2019eau : c\u2019est pour cela qu\u2019un plongeur doit remonter lentement.' },
    { q: 'Pourquoi un bateau en acier flotte-t-il ?', r: ['L\u2019acier est plus léger que l\u2019eau', 'Sa forme creuse le rend globalement moins dense que l\u2019eau', 'Il est poussé par le vent', 'Il est aimanté par la Terre'], b: 1, e: 'L\u2019acier seul coule ; mais la coque contient beaucoup d\u2019air, donc l\u2019ensemble déplace plus d\u2019eau que son poids.' },
    { q: 'Quel montage transmet une force par un liquide ?', r: ['Un engrenage', 'Un vérin hydraulique', 'Une poulie', 'Un ressort'], b: 1, e: 'Un vérin utilise un liquide incompressible : pousser d\u2019un côté déplace le piston de l\u2019autre côté.' },
    { q: 'Dans le cycle de l\u2019eau, que devient la vapeur en altitude ?', r: ['Elle se condense en gouttelettes', 'Elle disparaît', 'Elle devient du sel', 'Elle se transforme en glace uniquement'], b: 0, e: 'En refroidissant, la vapeur se condense en fines gouttelettes qui forment les nuages, puis retombent.' },
  ],
};
