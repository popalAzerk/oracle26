/* Module Information et automatismes — binaire, portes logiques, capteur → programme → actionneur.
   D'après le Japon (technology of information), Singapour et le programme français (chaîne d'information, IA). */
window.MODULE = {
  id: 'information',
  titre: 'Information', titreHtml: "L'information,<br><span class=\"grad\">zéro et un.</span>",
  kicker: 'Technologie · l\'information', badge: 'logicien',
  couleur: ['#F472B6', '#BE185D'],
  sousTitre: "Un ordinateur ne comprend que deux signaux : 0 et 1. Compose une lettre en binaire, puis fais fonctionner une porte logique et une chaîne automatique.",
  largeur: 900, hauteur: 400,
  etat: { mode: 'binaire', code: 65, porte: 'ET', a: false, b: true },
  controles: [
    { id: 'mode', label: 'Expérience', options: [{ v: 'binaire', label: 'Code binaire' }, { v: 'portes', label: 'Portes logiques' }, { v: 'chaine', label: 'Automatisme' }] },
    { id: 'code', label: 'Code du caractère', type: 'curseur', min: 32, max: 122, step: 1, unit: '' },
    { id: 'porte', label: 'Porte', options: [{ v: 'ET', label: 'ET (AND)' }, { v: 'OU', label: 'OU (OR)' }, { v: 'NON', label: 'NON (NOT)' }, { v: 'XOR', label: 'OU exclusif' }] },
    { id: 'a', label: 'Entrée A', options: [{ v: true, label: '1' }, { v: false, label: '0' }] },
    { id: 'b', label: 'Entrée B', options: [{ v: true, label: '1' }, { v: false, label: '0' }] },
  ],
  NOMS: { ET: 'ET (AND)', OU: 'OU (OR)', NON: 'NON (NOT)', XOR: 'OU exclusif (XOR)' },
  dessiner(e) {
    if (e.mode === 'binaire') {
      const c = Math.round(e.code), bits = c.toString(2).padStart(8, '0').split('');
      const car = String.fromCharCode(c);
      return `
        <text x="450" y="70" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="19" font-weight="700" fill="#1D1D1F">le caractère « ${car === ' ' ? '␣' : car} » a le code ${c}</text>
        <g>
          ${bits.map((b, i) => {
            const poids = Math.pow(2, 7 - i);
            const actif = b === '1';
            return `<g transform="translate(${130 + i * 84} 120)">
              <rect width="70" height="120" rx="16" fill="${actif ? '#F472B6' : '#F1F5F9'}" stroke="${actif ? '#BE185D' : '#CBD5E1'}" stroke-width="2.5"/>
              <text x="35" y="60" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="34" font-weight="800" fill="${actif ? '#fff' : '#94A3B8'}">${b}</text>
              <text x="35" y="96" text-anchor="middle" class="lab" fill="${actif ? '#fff' : '#94A3B8'}">${poids}</text>
            </g>`;
          }).join('')}
        </g>
        <text x="450" y="290" text-anchor="middle" class="lab">${bits.map((b, i) => (b === '1' ? Math.pow(2, 7 - i) : 0)).filter(Boolean).join(' + ') || '0'} = ${c}</text>
        <text x="450" y="330" text-anchor="middle" class="lab">un bit vaut 0 ou 1 · huit bits forment un octet</text>`;
    }
    if (e.mode === 'portes') {
      const res = window.MODULE.sortie(e);
      const entree = (x, y, val, nom) => `
        <g transform="translate(${x} ${y})"><circle r="16" fill="${val ? '#34D399' : '#E2E8F0'}" stroke="${val ? '#0EA47A' : '#94A3B8'}" stroke-width="2.5"/>
        <text x="-28" y="6" class="lab">${nom}</text><text x="0" y="6" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="15" font-weight="800" fill="${val ? '#065F46' : '#64748B'}">${val ? 1 : 0}</text></g>`;
      return `
        ${entree(200, 140, e.a, 'A')}
        ${e.porte === 'NON' ? '' : entree(200, 260, e.b, 'B')}
        <rect x="330" y="120" width="240" height="160" rx="26" fill="#FCE7F3" stroke="#F472B6" stroke-width="3"/>
        <text x="450" y="200" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="26" font-weight="800" fill="#9D174D">${e.porte}</text>
        <text x="450" y="232" text-anchor="middle" class="lab">porte logique</text>
        <path d="M216 140 H330" stroke="${e.a ? '#34D399' : '#CBD5E1'}" stroke-width="6" stroke-linecap="round"/>
        ${e.porte === 'NON' ? '' : `<path d="M216 260 H330" stroke="${e.b ? '#34D399' : '#CBD5E1'}" stroke-width="6" stroke-linecap="round"/>`}
        <path d="M570 200 H720" stroke="${res ? '#34D399' : '#CBD5E1'}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="770" cy="200" r="34" fill="${res ? '#FDE68A' : '#F1F5F9'}" stroke="${res ? '#F59E0B' : '#CBD5E1'}" stroke-width="3"/>
        ${res ? '<circle cx="770" cy="200" r="52" fill="#FDE68A" opacity=".4"/>' : ''}
        <text x="770" y="208" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="22" font-weight="800" fill="${res ? '#92400E' : '#94A3B8'}">${res ? 1 : 0}</text>
        <text x="770" y="262" text-anchor="middle" class="lab">lampe</text>
        <text x="450" y="356" text-anchor="middle" class="lab">${window.MODULE.explique(e)}</text>`;
    }
    const chaud = true;
    return `
      <g transform="translate(70 140)">
        <rect width="180" height="120" rx="18" fill="#DBEAFE" stroke="#0071E3" stroke-width="2.5"/>
        <text x="90" y="46" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="16" font-weight="700" fill="#1D1D1F">Capteur</text>
        <text x="90" y="74" text-anchor="middle" class="lab">température = 24 °C</text>
        <text x="90" y="96" text-anchor="middle" class="lab">signal électrique</text>
      </g>
      <path d="M250 200 H320" stroke="#BE185D" stroke-width="6"/><path d="M320 200 l-13 -8 M320 200 l-13 8" stroke="#BE185D" stroke-width="6" fill="none"/>
      <g transform="translate(320 130)">
        <rect width="230" height="140" rx="18" fill="#FCE7F3" stroke="#F472B6" stroke-width="2.5"/>
        <text x="115" y="42" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="16" font-weight="700" fill="#9D174D">Programme</text>
        <text x="115" y="74" text-anchor="middle" class="lab">si température &lt; 19 °C</text>
        <text x="115" y="98" text-anchor="middle" class="lab">alors allumer</text>
        <text x="115" y="122" text-anchor="middle" class="lab">sinon éteindre</text>
      </g>
      <path d="M550 200 H620" stroke="#BE185D" stroke-width="6"/><path d="M620 200 l-13 -8 M620 200 l-13 8" stroke="#BE185D" stroke-width="6" fill="none"/>
      <g transform="translate(620 140)">
        <rect width="180" height="120" rx="18" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2.5"/>
        <text x="90" y="46" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="16" font-weight="700" fill="#1D1D1F">Actionneur</text>
        <text x="90" y="74" text-anchor="middle" class="lab">chauffage</text>
        <text x="90" y="98" text-anchor="middle" class="lab">éteint (24 &gt; 19)</text>
      </g>
      <text x="450" y="330" text-anchor="middle" class="lab">chaîne d'information : acquérir → traiter → communiquer → agir</text>`;
  },
  sortie(e) {
    const a = !!e.a, b = !!e.b;
    return e.porte === 'ET' ? a && b : e.porte === 'OU' ? a || b : e.porte === 'NON' ? !a : (a !== b);
  },
  explique(e) {
    const t = { ET: 'la lampe s\u2019allume seulement si A ET B valent 1', OU: 'la lampe s\u2019allume si A OU B vaut 1', NON: 'la lampe s\u2019allume quand A vaut 0', XOR: 'la lampe s\u2019allume si A et B sont différents' };
    return t[e.porte];
  },
  mesures(e) {
    if (e.mode === 'portes') return [{ valeur: `${e.a ? 1 : 0} ${e.porte} ${e.porte === 'NON' ? '' : (e.b ? 1 : 0)}`, label: 'entrées' },
      { valeur: window.MODULE.sortie(e) ? 1 : 0, label: 'sortie' }, { valeur: window.MODULE.NOMS[e.porte], label: 'porte' }];
    if (e.mode === 'chaine') return [{ valeur: '24 °C', label: 'mesure du capteur' }, { valeur: 'seuil 19 °C', label: 'règle du programme' }, { valeur: 'éteint', label: 'état du chauffage' }];
    const c = Math.round(e.code), bits = c.toString(2).padStart(8, '0');
    return [{ valeur: String.fromCharCode(c) === ' ' ? '␣' : String.fromCharCode(c), label: 'caractère' },
            { valeur: c, label: 'code décimal' }, { valeur: bits, label: 'binaire' }, { valeur: '0x' + c.toString(16).toUpperCase(), label: 'hexadécimal' }];
  },
  commentaire(e) {
    if (e.mode === 'portes') return { classe: 'bon', html: `<b>${window.MODULE.NOMS[e.porte]} : ${window.MODULE.sortie(e) ? 1 : 0}.</b> ${window.MODULE.explique(e)}. Les portes logiques sont les briques de base de tout processeur : des milliards d'entre elles, combinées, font un ordinateur.` };
    if (e.mode === 'chaine') return { classe: 'bon', html: `<b>Un automatisme enchaîne quatre étapes.</b> Il <b>acquiert</b> une information (capteur), la <b>traite</b> (programme : comparer à un seuil), la <b>communique</b>, puis <b>agit</b> (actionneur). C'est exactement la chaîne d'information du programme de technologie.` };
    return { classe: 'bon', html: `<b>Tout est nombre.</b> Un ordinateur ne stocke que des 0 et des 1 : le caractère « ${String.fromCharCode(Math.round(e.code))} » est le nombre ${Math.round(e.code)}, écrit en binaire sur 8 bits. Une image, un son, une vidéo : tout est codé de la même façon.` };
  },
  defis: [
    { id: 'a', texte: 'Affiche le caractère « A » en binaire (code 65).', xp: 20, bravo: '01000001 : tu sais lire un octet.',
      quand: (e) => e.mode === 'binaire' && Math.round(e.code) === 65 },
    { id: 'et', texte: 'Avec la porte ET, trouve la seule combinaison qui allume la lampe.', xp: 20, bravo: 'il faut 1 ET 1.',
      quand: (e) => e.mode === 'portes' && e.porte === 'ET' && e.a === true && e.b === true },
    { id: 'ou', texte: 'Avec la porte OU, allume la lampe avec une seule entrée à 1.', xp: 20, bravo: 'une seule suffit pour OU.',
      quand: (e) => e.mode === 'portes' && e.porte === 'OU' && window.MODULE.sortie(e) === true },
  ],
  fiches: [
    { id: 'binaire', court: 'Binaire', nom: 'Compter avec deux chiffres', texte: "En binaire, chaque position vaut une puissance de 2 (1, 2, 4, 8, 16, 32, 64, 128). Huit bits forment un <b>octet</b> et codent 256 valeurs, assez pour tous les caractères ASCII.", plus: "Un octet = 8 bits. Un kilooctet = 1000 octets, un mégaoctet = un million. Une photo de 3 Mo contient environ 24 millions de 0 et de 1." },
    { id: 'portes', court: 'Logique', nom: 'ET, OU, NON', texte: "Une porte logique combine des signaux : <b>ET</b> exige les deux, <b>OU</b> se contente d'un seul, <b>NON</b> inverse. Avec ces trois-là, on peut construire n'importe quel circuit.", plus: "Le processeur d'un téléphone contient des milliards de portes. La vitesse vient de leur taille minuscule, pas de la vitesse de la lumière dans les fils." },
    { id: 'chaine', court: 'Automatisme', nom: 'Capteur, programme, actionneur', texte: "Acquérir, traiter, communiquer, agir : c'est la <b>chaîne d'information</b>. Un thermostat, une porte automatique, un robot suivent tous ce schéma.", plus: "Un capteur transforme une grandeur physique (température, lumière, distance) en signal électrique. La carte microcontrôleur lit ce signal, applique une règle, puis commande un actionneur (moteur, lampe, vanne)." },
    { id: 'ia', court: 'IA', nom: 'Apprendre au lieu de programmer', texte: "Une intelligence artificielle ne suit pas des règles écrites à la main : elle <b>apprend</b> à partir d'exemples. Le programme de technologie demande d'en comprendre les usages et les <b>biais</b>.", plus: "Si on montre à une IA mille photos de chats blancs, elle risque de croire que « chat » veut dire « blanc » : c'est un biais, causé par les données, pas par l'algorithme. Un bon usage commence par vérifier les données." },
  ],
  experiences: [
    { titre: 'Écrire son prénom en binaire', texte: 'Prends le code ASCII de chaque lettre (A = 65, B = 66…) et écris-la en binaire sur 8 bits. Exemple : A = 01000001. Fais vérifier ensuite avec l\u2019atelier.' },
    { titre: 'Le circuit ET en vrai', texte: 'Deux piles, deux interrupteurs et une ampoule : branche-les de manière que l\u2019ampoule ne s\u2019allume que si les DEUX sont fermés. C\u2019est une porte ET matérielle.' },
    { titre: 'Un automatisme autour de toi', texte: 'Trouve trois objets automatiques à la maison (chauffe-eau, portail, éclairage d\u2019escalier) et note pour chacun : le capteur, la règle, l\u2019actionneur.' },
  ],
  quiz: [
    { q: 'Combien de valeurs code un octet ?', r: ['8', '16', '256', '1 000'], b: 2, e: '8 bits donnent 2⁸ = 256 combinaisons : c\u2019est pourquoi l\u2019ASCII tient dans un octet.' },
    { q: 'La lettre A a le code 65. En binaire, cela donne…', r: ['01100001', '01000001', '10000010', '01000010'], b: 1, e: '64 + 1 = 65, donc les bits de poids 64 et 1 : 01000001.' },
    { q: 'La porte ET allume la lampe quand…', r: ['Une seule entrée vaut 1', 'Les deux entrées valent 1', 'Les deux valent 0', 'Toujours'], b: 1, e: 'ET exige les deux signaux à 1. C\u2019est la fonction « les deux à la fois ».' },
    { q: 'La porte NON sert à…', r: ['Inverser le signal', 'Additionner deux signaux', 'Doubler le courant', 'Chauffer le circuit'], b: 0, e: 'NON transforme 1 en 0 et 0 en 1 : c\u2019est l\u2019inverseur.' },
    { q: 'Dans la chaîne d\u2019information, le capteur…', r: ['Agit sur le monde', 'Acquiert une grandeur physique', 'Stocke les fichiers', 'Alimente en énergie'], b: 1, e: 'Le capteur mesure (température, lumière, distance) et transforme cette grandeur en signal électrique.' },
    { q: 'Qu\u2019est-ce qu\u2019un biais d\u2019IA ?', r: ['Une erreur de câblage', 'Un travers systématique causé par les données d\u2019apprentissage', 'Une panne de courant', 'Un virus'], b: 1, e: 'Si les exemples d\u2019entraînement sont déséquilibrés, le modèle apprend ce déséquilibre et se trompe de façon systématique.' },
  ],
};
