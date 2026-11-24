/* Module Énergie — chaîne d'énergie, conversions, rendement, émissions.
   D'après le programme français (chaîne d'énergie), l'Ontario (matter and energy) et la Finlande. */
window.MODULE = {
  id: 'energie',
  titre: 'Énergie', titreHtml: "L'énergie<br><span class=\"grad\">change de forme.</span>",
  kicker: 'Technologie · l\'énergie', badge: 'énergéticien',
  couleur: ['#34D399', '#0EA47A'],
  sousTitre: "Aucune énergie ne se crée : elle se transforme, et une partie se perd toujours en chaleur. Choisis une source et un usage, et lis le rendement réel de la chaîne.",
  largeur: 900, hauteur: 400,
  etat: { source: 'soleil', usage: 'ampoule' },
  controles: [
    { id: 'source', label: 'Source', options: [{ v: 'soleil', label: 'Soleil' }, { v: 'vent', label: 'Vent' }, { v: 'eau', label: 'Eau (barrage)' }, { v: 'charbon', label: 'Charbon' }, { v: 'pile', label: 'Pile' }] },
    { id: 'usage', label: 'Usage', options: [{ v: 'ampoule', label: 'Éclairer' }, { v: 'chauffer', label: 'Chauffer' }, { v: 'rouler', label: 'Rouler' }, { v: 'calculer', label: 'Calculer' }] },
  ],
  CHAINES: {
    soleil: { nom: 'Soleil', conv: 'panneau photovoltaïque', rend: 0.20, co2: 25, renouv: true },
    vent: { nom: 'Vent', conv: 'éolienne', rend: 0.45, co2: 12, renouv: true },
    eau: { nom: 'Eau', conv: 'turbine de barrage', rend: 0.90, co2: 6, renouv: true },
    charbon: { nom: 'Charbon', conv: 'centrale thermique', rend: 0.38, co2: 1000, renouv: false },
    pile: { nom: 'Pile', conv: 'réaction chimique', rend: 0.85, co2: 60, renouv: false },
  },
  USAGES: {
    ampoule: { nom: 'éclairer', rend: 0.35, perte: 'chaleur dans l\u2019ampoule' },
    chauffer: { nom: 'chauffer', rend: 0.98, perte: 'très peu de perte : la chaleur est le but' },
    rouler: { nom: 'rouler', rend: 0.30, perte: 'frottements et chaleur du moteur' },
    calculer: { nom: 'calculer', rend: 0.90, perte: 'chaleur des composants' },
  },
  calcul(e) {
    const s = window.MODULE.CHAINES[e.source], u = window.MODULE.USAGES[e.usage];
    const total = s.rend * u.rend;
    return { s, u, total, perdue: 1 - total, utile: total * 100 };
  },
  dessiner(e) {
    const { s, u, total } = window.MODULE.calcul(e);
    const boite = (x, titre, sous, couleur) => `
      <g transform="translate(${x} 150)">
        <rect width="180" height="110" rx="18" fill="${couleur}" opacity=".14"/>
        <rect width="180" height="110" rx="18" fill="none" stroke="${couleur}" stroke-width="2.5"/>
        <text x="90" y="46" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="16" font-weight="700" fill="#1D1D1F">${titre}</text>
        <text x="90" y="72" text-anchor="middle" class="lab">${sous}</text>
      </g>`;
    const fleche = (x, pct, versLeBas) => `
      <path d="M${x} 205 h${versLeBas ? 0 : 60}" stroke="#0EA47A" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M${x + 60} 205 l-12 -8 M${x + 60} 205 l-12 8" stroke="#0EA47A" stroke-width="6" stroke-linecap="round" fill="none"/>`;
    return `
      ${boite(60, s.nom, 'source d\u2019énergie', '#F59E0B')}
      ${boite(330, s.conv, 'conversion · ' + Math.round(s.rend * 100) + ' %', '#0EA47A')}
      ${boite(600, u.nom.charAt(0).toUpperCase() + u.nom.slice(1), 'usage · ' + Math.round(u.rend * 100) + ' %', '#0071E3')}
      <path d="M240 205 h90" stroke="#0EA47A" stroke-width="7" stroke-linecap="round"/>
      <path d="M330 205 l-14 -9 M330 205 l-14 9" stroke="#0EA47A" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M510 205 h90" stroke="#0EA47A" stroke-width="7" stroke-linecap="round"/>
      <path d="M600 205 l-14 -9 M600 205 l-14 9" stroke="#0EA47A" stroke-width="7" stroke-linecap="round" fill="none"/>
      <g stroke="#E5342B" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85">
        <path d="M420 260 v40"/><path d="M414 292 l6 10 l6 -10"/>
        <path d="M690 260 v40"/><path d="M684 292 l6 10 l6 -10"/>
      </g>
      <text x="420" y="330" text-anchor="middle" class="lab" fill="#B3231B">pertes ${Math.round((1 - s.rend) * 100)} %</text>
      <text x="690" y="330" text-anchor="middle" class="lab" fill="#B3231B">pertes ${Math.round((1 - u.rend) * 100)} %</text>
      <text x="450" y="376" text-anchor="middle" class="lab">rendement total de la chaîne : ${Math.round(total * 100)} %</text>`;
  },
  mesures(e) {
    const { s, u, total, utile, perdue } = window.MODULE.calcul(e);
    return [{ valeur: Math.round(utile) + ' %', label: 'énergie réellement utile' },
            { valeur: Math.round(perdue * 100) + ' %', label: 'perdue en chaleur' },
            { valeur: s.co2 + ' g', label: 'CO₂ par kWh' },
            { valeur: s.renouv ? 'oui' : 'non', label: 'renouvelable', alerte: !s.renouv }];
  },
  commentaire(e) {
    const { s, u, total } = window.MODULE.calcul(e);
    return { classe: s.renouv ? 'bon' : 'faux',
      html: `<b>${s.nom} → ${s.conv} → ${u.nom}.</b> Sur 100 unités d'énergie de départ, il reste <b>${Math.round(total * 100)}</b> unités utiles : le reste part en ${u.perte}. ${s.renouv ? 'Cette source est renouvelable, mais son rendement reste limité par la conversion.' : 'Cette source émet beaucoup de CO₂ : ' + s.co2 + ' g par kWh.'}` };
  },
  defis: [
    { id: 'bon', texte: 'Trouve la chaîne au meilleur rendement total.', xp: 25, bravo: 'le barrage + chauffer : imbattable.',
      quand: (e) => window.MODULE.calcul(e).total >= 0.85 },
    { id: 'perte', texte: 'Trouve une chaîne qui perd plus de 80 % de l\u2019énergie.', xp: 20, bravo: 'tu as vu où part presque tout.',
      quand: (e) => window.MODULE.calcul(e).total <= 0.10 },
    { id: 'sale', texte: 'Compare une source renouvelable et une source fossile sur le CO₂.', xp: 20, bravo: '12 g contre 1000 g par kWh.',
      quand: (e) => e.source === 'charbon' },
  ],
  fiches: [
    { id: 'formes', court: 'Formes', nom: 'Les formes d\u2019énergie', texte: "Cinétique (mouvement), potentielle (position, ressort), thermique (chaleur), chimique (aliments, carburant), électrique, lumineuse, nucléaire. Toutes se <b>convertissent</b> les unes dans les autres.", plus: "Une lampe de poche convertit : chimique (pile) → électrique → lumineuse + thermique. Ton corps fait la même chose avec les aliments : chimique → mouvement + chaleur." },
    { id: 'rendement', court: 'Rendement', nom: 'Le rendement, toujours inférieur à 100 %', texte: "Le rendement est l'énergie utile divisée par l'énergie consommée. Il n'atteint jamais 100 % : une partie se perd toujours, presque toujours sous forme de <b>chaleur</b>.", plus: "Une ampoule à incandescence transforme environ 5 % de l'électricité en lumière : 95 % partent en chaleur. Une LED atteint 35 à 50 %, c'est pourquoi elle chauffe beaucoup moins." },
    { id: 'renouvelable', court: 'Sources', nom: 'Renouvelable ne veut pas dire sans impact', texte: "Le soleil, le vent, l'eau sont renouvelables ; le charbon, le pétrole, le gaz ne le sont pas. Mais un panneau solaire ou une éolienne demandent des métaux et de la place.", plus: "Le CO₂ d'une éolienne est d'environ 12 g par kWh sur son cycle de vie, contre 1000 g pour le charbon. Aucune source n'a un bilan nul : on compare des ordres de grandeur." },
    { id: 'chaine', court: 'Chaîne', nom: 'La chaîne d\u2019énergie', texte: "Alimenter → distribuer → convertir → transmettre → <b>agir</b>. C'est le vocabulaire du programme de technologie : la chaîne d'énergie transporte la puissance, la chaîne d'information la commande.", plus: "Dans un lave-linge : la chaîne d'information (programme, capteurs) commande la chaîne d'énergie (moteur, résistance chauffante, pompe). Les deux se rejoignent à l'actionneur." },
  ],
  experiences: [
    { titre: 'Le rendement à la main', texte: 'Frotte tes mains l\u2019une contre l\u2019autre : le mouvement produit de la chaleur. C\u2019est une conversion cinétique → thermique, avec un rendement loin de 100 %.' },
    { titre: 'LED contre ampoule', texte: 'Compare une lampe LED et une ampoule à incandescence de même éclat : touche-les après 3 minutes. L\u2019incandescente brûle : presque toute son énergie part en chaleur.' },
    { titre: 'Le chauffage solaire', texte: 'Remplis deux bouteilles d\u2019eau, mets-en une au soleil, l\u2019autre à l\u2019ombre. Mesure la température au bout d\u2019une heure : la différence, c\u2019est l\u2019énergie captée.' },
  ],
  quiz: [
    { q: 'Peut-on créer de l\u2019énergie ?', r: ['Oui, avec une centrale', 'Non, on la transforme', 'Oui, mais seulement de l\u2019électricité', 'Oui, avec une pile'], b: 1, e: 'L\u2019énergie se conserve : elle change de forme. Une pile ne crée rien, elle convertit de l\u2019énergie chimique.' },
    { q: 'Que devient l\u2019énergie perdue dans une lampe ?', r: ['Elle disparaît', 'Elle devient de la chaleur', 'Elle retourne dans le mur', 'Elle devient de l\u2019eau'], b: 1, e: 'Presque toutes les pertes finissent en chaleur, que l\u2019on ressent en touchant la lampe.' },
    { q: 'Le rendement d\u2019une ampoule à incandescence est d\u2019environ…', r: ['5 %', '50 %', '95 %', '100 %'], b: 0, e: 'Environ 5 % de l\u2019énergie devient de la lumière : le reste part en chaleur, d\u2019où son inefficacité.' },
    { q: 'Quelle source est renouvelable ?', r: ['Le charbon', 'Le gaz naturel', 'Le vent', 'Le pétrole'], b: 2, e: 'Le vent se renouvelle en permanence. Le charbon et le pétrole ont mis des millions d\u2019années à se former.' },
    { q: 'Dans une chaîne d\u2019énergie, quel est l\u2019ordre ?', r: ['Convertir → alimenter → agir', 'Alimenter → distribuer → convertir → transmettre → agir', 'Agir → convertir → alimenter', 'Distribuer → agir → alimenter'], b: 1, e: 'C\u2019est l\u2019ordre du programme : on alimente, on distribue, on convertit, on transmet, puis l\u2019actionneur agit.' },
    { q: 'Quelle source émet le plus de CO₂ par kWh ?', r: ['Le vent', 'L\u2019eau', 'Le charbon', 'Le solaire'], b: 2, e: 'Environ 1000 g de CO₂ par kWh pour le charbon, contre 12 g pour l\u2019éolien : l\u2019écart est d\u2019un facteur 80.' },
  ],
};
