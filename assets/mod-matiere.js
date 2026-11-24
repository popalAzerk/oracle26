/* Module Matière et matériaux — états et changements d'état, mélanges et séparation.
   D'après l'Ontario 7e (théorie particulaire, substances pures et mélanges) et la Finlande (air et eau). */
window.MODULE = {
  id: 'matiere',
  titre: 'Matière et matériaux', titreHtml: 'La matière,<br><span class="grad">état par état.</span>',
  kicker: 'Sciences · la matière', badge: 'chimiste',
  couleur: ['#8B5CF6', '#6D28D9'],
  sousTitre: "Chauffe et refroidis : les particules changent de comportement, pas de nature. Puis choisis la bonne technique pour séparer un mélange.",
  largeur: 900, hauteur: 400,
  etat: { mode: 'etats', temperature: 20, melange: 'sable' },
  controles: [
    { id: 'mode', label: 'Expérience', options: [{ v: 'etats', label: 'États de l\u2019eau' }, { v: 'melanges', label: 'Séparer un mélange' }] },
    { id: 'temperature', label: 'Température', type: 'curseur', min: -20, max: 120, step: 5, unit: ' °C' },
    { id: 'melange', label: 'Mélange', options: [{ v: 'sable', label: 'Eau + sable' }, { v: 'sel', label: 'Eau + sel' }, { v: 'huile', label: 'Eau + huile' }, { v: 'fer', label: 'Eau + limaille de fer' }] },
  ],
  TECHNIQUES: {
    sable: { nom: 'filtration', texte: 'Le sable ne se dissout pas : on filtre. Le sable reste dans le filtre, l\u2019eau passe.', rend: 0.98 },
    sel: { nom: 'évaporation / distillation', texte: 'Le sel est dissous : il traverse le filtre. On chauffe pour évaporer l\u2019eau et récupérer le sel.', rend: 0.95 },
    huile: { nom: 'décantation puis séparation', texte: 'L\u2019huile ne se mélange pas et flotte : on laisse reposer puis on sépare les deux couches.', rend: 0.92 },
    fer: { nom: 'aimant', texte: 'La limaille de fer est attirée par un aimant : on la retire sans toucher à l\u2019eau.', rend: 0.99 },
  },
  dessiner(e) {
    if (e.mode === 'melanges') {
      const t = window.MODULE.TECHNIQUES[e.melange];
      return `
        <rect x="120" y="140" width="180" height="180" rx="0" fill="#DBEAFE" stroke="#60A5FA" stroke-width="3"/>
        <path d="M120 140 h180" stroke="#60A5FA" stroke-width="3"/>
        ${e.melange === 'huile' ? '<rect x="121" y="142" width="178" height="40" fill="#FDE68A"/>' : ''}
        ${e.melange === 'sable' ? '<g fill="#B45309"><circle cx="160" cy="300" r="5"/><circle cx="190" cy="308" r="4"/><circle cx="230" cy="298" r="5"/><circle cx="265" cy="310" r="4"/></g>' : ''}
        ${e.melange === 'sel' ? '<g fill="#60A5FA" opacity=".5"><circle cx="160" cy="240" r="2.5"/><circle cx="200" cy="270" r="2.5"/><circle cx="250" cy="230" r="2.5"/><circle cx="225" cy="295" r="2.5"/></g>' : ''}
        ${e.melange === 'fer' ? '<g fill="#475569"><circle cx="160" cy="300" r="4"/><circle cx="200" cy="305" r="4"/><circle cx="245" cy="298" r="4"/></g>' : ''}
        <text x="210" y="132" text-anchor="middle" class="lab">mélange de départ</text>
        <path d="M330 230 h90" stroke="#6D28D9" stroke-width="6" stroke-linecap="round"/>
        <path d="M420 230 l-14 -9 M420 230 l-14 9" stroke="#6D28D9" stroke-width="6" stroke-linecap="round" fill="none"/>
        <rect x="450" y="120" width="330" height="200" rx="18" fill="#F5F3FF" stroke="#8B5CF6" stroke-width="2.5"/>
        <text x="615" y="160" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="17" font-weight="700" fill="#1D1D1F">${t.nom}</text>
        <foreignObject x="470" y="176" width="290" height="130">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:-apple-system,sans-serif;font-size:13.5px;line-height:1.45;color:#4B5563">${t.texte}</div>
        </foreignObject>
        <text x="615" y="342" text-anchor="middle" class="lab">efficacité ${Math.round(t.rend * 100)} %</text>`;
    }
    const T = e.temperature;
    const etatNom = T < 0 ? 'solide' : T < 100 ? 'liquide' : 'gaz';
    const mob = T < 0 ? 4 : T < 100 ? 12 : 26;
    const part = Array.from({ length: 46 }, (_, i) => {
      const a = (i * 137.5) % 360 * Math.PI / 180, r = (i % 7) * 14 + 12;
      const bx = 450 + Math.cos(a) * r * (etatNom === 'gaz' ? 2.6 : etatNom === 'liquide' ? 1.5 : 1);
      const by = 250 + Math.sin(a) * r * (etatNom === 'gaz' ? 1.6 : etatNom === 'liquide' ? 1.1 : 0.9);
      return `<circle cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" r="7" fill="#8B5CF6" opacity=".8"/>`;
    }).join('');
    return `
      <rect x="120" y="120" width="660" height="240" rx="20" fill="#F5F3FF" stroke="#C4B5FD" stroke-width="2.5"/>
      ${part}
      <text x="450" y="96" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="20" font-weight="800" fill="#1D1D1F">${etatNom.toUpperCase()} — ${T} °C</text>
      <text x="450" y="392" text-anchor="middle" class="lab">${etatNom === 'solide' ? 'particules serrées, ordonnées, elles vibrent sur place' : etatNom === 'liquide' ? 'particules proches mais libres de glisser les unes sur les autres' : 'particules très éloignées et rapides, elles occupent tout le volume'}</text>
      <line x1="120" y1="378" x2="780" y2="378" stroke="#E9D5FF" stroke-width="10" stroke-linecap="round"/>
      <line x1="120" y1="378" x2="${120 + 660 * ((T + 20) / 140)}" y2="378" stroke="#8B5CF6" stroke-width="10" stroke-linecap="round"/>
      <text x="120" y="404" class="lab">-20 °C</text><text x="440" y="404" class="lab">0 °C (fusion)</text>
      <text x="700" y="404" class="lab">100 °C (ébullition)</text>`;
  },
  mesures(e) {
    if (e.mode === 'melanges') { const t = window.MODULE.TECHNIQUES[e.melange];
      return [{ valeur: t.nom, label: 'technique adaptée' }, { valeur: Math.round(t.rend * 100) + ' %', label: 'efficacité' }, { valeur: e.melange === 'sel' ? 'homogène' : 'hétérogène', label: 'type de mélange' }]; }
    const T = e.temperature;
    return [{ valeur: T < 0 ? 'solide' : T < 100 ? 'liquide' : 'gaz', label: 'état de l\u2019eau' },
            { valeur: T + ' °C', label: 'température' },
            { valeur: T < 0 ? 'glace' : T < 100 ? 'eau' : 'vapeur', label: 'nom usuel' }];
  },
  commentaire(e) {
    if (e.mode === 'melanges') { const t = window.MODULE.TECHNIQUES[e.melange];
      return { classe: 'bon', html: `<b>${t.nom.charAt(0).toUpperCase() + t.nom.slice(1)}.</b> ${t.texte} Un mélange <b>homogène</b> (le sel dans l'eau) ne se sépare pas en le regardant : il faut évaporer ou distiller.` }; }
    const T = e.temperature;
    return { classe: 'bon', html: `<b>À ${T} °C, l'eau est ${T < 0 ? 'solide' : T < 100 ? 'liquide' : 'gaz'}.</b> Les molécules sont toujours les mêmes : seule leur liberté de mouvement change. Le passage de solide à liquide s'appelle la <b>fusion</b> (0 °C), de liquide à gaz l'<b>ébullition</b> (100 °C).` };
  },
  defis: [
    { id: 'glace', texte: 'Refroidis l\u2019eau sous 0 °C et observe les particules.', xp: 20, bravo: 'les particules se figent en réseau.', quand: (e) => e.mode === 'etats' && e.temperature <= -10 },
    { id: 'vapeur', texte: 'Fais bouillir l\u2019eau et compare avec la glace.', xp: 20, bravo: 'même molécule, trois libertés de mouvement.', quand: (e) => e.mode === 'etats' && e.temperature >= 105 },
    { id: 'sel', texte: 'Sépare correctement l\u2019eau salée (et non l\u2019eau sablée).', xp: 25, bravo: 'distillation, pas filtration : le sel est dissous.', quand: (e) => e.mode === 'melanges' && e.melange === 'sel' },
  ],
  fiches: [
    { id: 'etats', court: 'États', nom: 'Trois états, une seule matière', texte: "Solide, liquide, gaz : les <b>molécules ne changent pas</b>, leur organisation si. Chauffer donne de l'énergie aux particules, qui se libèrent progressivement.", plus: "Il existe un quatrième état, le plasma (étoiles, aurores boréales), et des états intermédiaires comme les cristaux liquides de ton écran." },
    { id: 'changements', court: 'Changements', nom: 'Fusion, solidification, ébullition', texte: "Les changements d'état se font à température <b>constante</b> tant que la transformation dure : la glace reste à 0 °C le temps de fondre. La chaleur sert alors à casser les liens, pas à chauffer.", plus: "C'est pour cela qu'un verre de glace refroidit longtemps : chaque gramme de glace qui fond absorbe beaucoup d'énergie sans changer de température." },
    { id: 'melanges', court: 'Mélanges', nom: 'Homogène ou hétérogène', texte: "Un mélange <b>hétérogène</b> laisse voir ses constituants (eau + sable). Un mélange <b>homogène</b> est uniforme (eau + sel) : on ne distingue plus les composants.", plus: "Filtrer sépare ce qui ne se dissout pas ; distiller sépare ce qui est dissous ; l'aimant sépare les métaux magnétiques ; la décantation laisse faire la gravité." },
    { id: 'masse', court: 'Conservation', nom: 'Rien ne disparaît', texte: "Pendant un changement d'état, la <b>masse se conserve</b> : la glace fondue pèse exactement le même poids. Seul l'aspect change.", plus: "Une bouteille d'eau qui gèle peut éclater : l'eau est le rare corps qui occupe plus de place à l'état solide que liquide. C'est pourquoi les tuyaux éclatent l'hiver." },
  ],
  experiences: [
    { titre: 'La fusion chronométrée', texte: 'Un glaçon dans un verre, un thermomètre : note la température toutes les 30 secondes. Elle reste à 0 °C jusqu\u2019à la fusion complète.' },
    { titre: 'Séparer le sel et le sable', texte: 'Mélange sel et sable, ajoute de l\u2019eau, filtre (le sable reste), puis laisse évaporer l\u2019eau (le sel revient en cristaux).' },
    { titre: 'L\u2019eau qui monte', texte: 'Un verre d\u2019eau, une feuille de sopalin qui trempe : l\u2019eau monte par capillarité. C\u2019est ainsi que les plantes boivent.' },
  ],
  quiz: [
    { q: 'Quand l\u2019eau gèle, ses molécules…', r: ['Disparaissent', 'Se figent en réseau ordonné', 'Changent de nature', 'Deviennent du gaz'], b: 1, e: 'Les molécules sont les mêmes : elles perdent de l\u2019énergie et s\u2019ordonnent en un réseau solide.' },
    { q: 'Pendant la fusion de la glace, la température…', r: ['Monte vite', 'Reste à 0 °C', 'Descend', 'Double'], b: 1, e: 'Tant que la glace n\u2019a pas fini de fondre, l\u2019énergie sert à casser les liens, pas à chauffer.' },
    { q: 'Comment séparer de l\u2019eau salée ?', r: ['Par filtration', 'Par décantation', 'Par évaporation ou distillation', 'Avec un aimant'], b: 2, e: 'Le sel est dissous, donc il traverse le filtre. Il faut évaporer l\u2019eau pour le récupérer.' },
    { q: 'Que fait un aimant sur un mélange eau + limaille de fer ?', r: ['Rien', 'Il attire la limaille', 'Il dissout le fer', 'Il fait bouillir l\u2019eau'], b: 1, e: 'Le fer est magnétique : l\u2019aimant l\u2019attire et le sépare de l\u2019eau sans contact.' },
    { q: 'L\u2019eau + huile est un mélange…', r: ['Homogène', 'Hétérogène', 'Une solution', 'Un corps pur'], b: 1, e: 'On distingue nettement les deux couches : le mélange est hétérogène et se sépare par décantation.' },
    { q: 'Que devient la masse de l\u2019eau quand elle gèle ?', r: ['Elle diminue', 'Elle augmente', 'Elle reste identique', 'Elle double'], b: 2, e: 'La masse se conserve : c\u2019est le volume qui augmente légèrement, d\u2019où les canalisations qui éclatent.' },
  ],
};
