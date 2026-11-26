/* Animations des fiches : chaleur et son. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-chaleur-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  conduction: {
    legende: 'Conduction de proche en proche dans le métal, convection de l’eau chaude qui monte, rayonnement du Soleil.',
    alt: 'Trois scènes côte à côte. À gauche, une barre de métal chauffée à un bout par une flamme : ses particules rougissent l’une après l’autre, de proche en proche. Au milieu, une casserole d’eau chauffée par-dessous : l’eau chaude, en rouge, monte au centre, se refroidit en haut et redescend sur les côtés en bleu. À droite, le Soleil chauffe un bloc à travers le vide.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-chaleur-conduction">
<style>
.a-chaleur-conduction .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-chaleur-conduction .p{transform-box:fill-box;transform-origin:center}
${['#FF3B30', '#FF3B30', '#FF6B2C', '#FF9F0A', '#FFC23A', '#FFD60A'].map((c, i) => `.a-chaleur-conduction .p${i}{fill:${c};animation:a-chaleur-conduction-p${i} 8s ease-in-out infinite}
@keyframes a-chaleur-conduction-p${i}{0%,${3 + i * 7}%{fill:#C7C7CC;transform:none}${7 + i * 7}%{fill:${c};transform:scale(1.4)}${12 + i * 7}%,84%{fill:${c};transform:none}96%,100%{fill:#C7C7CC}}`).join('\n')}
.a-chaleur-conduction .g{offset-rotate:0deg;offset-distance:var(--d0);animation:a-chaleur-conduction-tour 8s linear infinite,a-chaleur-conduction-couleur 8s linear infinite}
.a-chaleur-conduction .gl{offset-path:path('M160 126 C160 100 160 82 147 80 C133 78 131 96 131 108 C131 124 146 126 160 126 Z')}
.a-chaleur-conduction .gr{offset-path:path('M160 126 C160 100 160 82 173 80 C187 78 189 96 189 108 C189 124 174 126 160 126 Z')}
.a-chaleur-conduction .r{fill:none;stroke:#FF9F0A;stroke-width:3;stroke-linecap:round;stroke-dasharray:6 8;animation:a-chaleur-conduction-ray 8s linear infinite}
.a-chaleur-conduction .bloc{fill:#FF9F0A;animation:a-chaleur-conduction-bloc 8s ease-in-out infinite}
@keyframes a-chaleur-conduction-tour{from{offset-distance:0%}to{offset-distance:100%}}
@keyframes a-chaleur-conduction-couleur{0%,30%{fill:#FF3B30}50%,85%{fill:#0A84FF}100%{fill:#FF3B30}}
@keyframes a-chaleur-conduction-ray{to{stroke-dashoffset:-224}}
@keyframes a-chaleur-conduction-bloc{0%{fill:#C7C7CC}40%,85%{fill:#FF9F0A}100%{fill:#C7C7CC}}
</style>
<path d="M107 14 V150 M213 14 V150" stroke="#D1D1D6" stroke-width="2" stroke-dasharray="4 6"/>
<rect x="10" y="70" width="88" height="22" rx="6" fill="#E5E5EA" stroke="#3A3A3C" stroke-width="2.5"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<circle class="p p${i}" cx="${19 + i * 14}" cy="81" r="5.5"/>`).join('')}
<path d="M19 98 C9 110 11 124 19 124 C27 124 29 110 19 98 Z" fill="#FF9F0A"/><path d="M19 108 C14 116 15 122 19 122 C23 122 24 116 19 108 Z" fill="#FF3B30"/>
<path d="M122 58 V126 Q122 136 132 136 H188 Q198 136 198 126 V58" fill="none" stroke="#3A3A3C" stroke-width="3" stroke-linejoin="round"/>
<rect x="124" y="70" width="72" height="64" rx="6" fill="#64D2FF" opacity=".35"/>
${[0, 1, 2, 3, 4].map((k) => `<circle class="g gl" r="4" style="--d0:${k * 20}%;fill:${k < 2 ? '#FF3B30' : '#0A84FF'};animation-delay:-${(k * 1.6).toFixed(1)}s"/><circle class="g gr" r="4" style="--d0:${k * 20}%;fill:${k < 2 ? '#FF3B30' : '#0A84FF'};animation-delay:-${(k * 1.6).toFixed(1)}s"/>`).join('')}
<path d="M160 138 C152 147 154 156 160 156 C166 156 168 147 160 138 Z" fill="#FF9F0A"/><path d="M160 146 C156 151 157 154 160 154 C163 154 164 151 160 146 Z" fill="#FF3B30"/>
<circle cx="238" cy="44" r="14" fill="#FFD60A" stroke="#FF9F0A" stroke-width="3"/>
<path d="M238 22 V16 M238 66 V72 M216 44 H210 M260 44 H266 M222 28 L218 24 M254 28 L258 24 M222 60 L218 64" stroke="#FF9F0A" stroke-width="3" stroke-linecap="round"/>
<path class="r" d="M250 58 L274 122"/><path class="r" d="M256 52 L292 120"/><path class="r" d="M260 46 L308 118"/>
<rect class="bloc" x="266" y="124" width="46" height="18" rx="4" stroke="#3A3A3C" stroke-width="2.5"/>
<text class="t" x="53" y="170" text-anchor="middle">conduction</text>
<text class="t" x="160" y="170" text-anchor="middle">convection</text>
<text class="t" x="267" y="170" text-anchor="middle">rayonnement</text>
</svg>`,
  },
  isolant: {
    legende: 'Collés à la même source chaude, le métal chauffe vite sur toute sa longueur ; le bois et la laine, à peine.',
    alt: 'Trois barres touchent une même plaque chaude à gauche : une barre de métal, une barre de bois et une bande de laine pleine de petites bulles d’air. La chaleur, en rouge et orange, avance très vite dans le métal jusqu’au bout, à peine dans le bois, et presque pas dans la laine qui emprisonne de l’air.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-chaleur-isolant">
<style>
.a-chaleur-isolant .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-chaleur-isolant .h{fill:url(#a-chaleur-isolant-g);transform-box:fill-box;transform-origin:left center}
.a-chaleur-isolant .h1{animation:a-chaleur-isolant-h1 8s ease-in-out infinite}
.a-chaleur-isolant .h2{transform:scaleX(.25);animation:a-chaleur-isolant-h2 8s ease-in-out infinite}
.a-chaleur-isolant .h3{transform:scaleX(.1);animation:a-chaleur-isolant-h3 8s ease-in-out infinite}
.a-chaleur-isolant .o{fill:none;stroke:#3A3A3C;stroke-width:2.5}
@keyframes a-chaleur-isolant-h1{0%{transform:scaleX(0)}45%,85%{transform:scaleX(1)}97%,100%{transform:scaleX(0)}}
@keyframes a-chaleur-isolant-h2{0%{transform:scaleX(0)}45%,85%{transform:scaleX(.25)}97%,100%{transform:scaleX(0)}}
@keyframes a-chaleur-isolant-h3{0%{transform:scaleX(0)}45%,85%{transform:scaleX(.1)}97%,100%{transform:scaleX(0)}}
</style>
<defs><linearGradient id="a-chaleur-isolant-g"><stop offset="0" stop-color="#FF3B30"/><stop offset=".7" stop-color="#FF9F0A"/><stop offset="1" stop-color="#FF9F0A" stop-opacity="0"/></linearGradient></defs>
<rect x="12" y="20" width="30" height="148" rx="8" fill="#FF3B30"/>
<path d="M22 34 q-4 6 0 12 q4 6 0 12 M32 34 q-4 6 0 12 q4 6 0 12 M22 130 q-4 6 0 12 q4 6 0 12 M32 130 q-4 6 0 12 q4 6 0 12" fill="none" stroke="#FFD60A" stroke-width="2.5" stroke-linecap="round"/>
<rect x="42" y="36" width="262" height="20" rx="5" fill="#D1D1D6"/><rect class="h h1" x="42" y="36" width="262" height="20" rx="5"/><rect class="o" x="42" y="36" width="262" height="20" rx="5"/>
<rect x="42" y="90" width="262" height="20" rx="5" fill="#D9A066"/><rect class="h h2" x="42" y="90" width="262" height="20" rx="5"/><rect class="o" x="42" y="90" width="262" height="20" rx="5"/>
<rect x="42" y="144" width="262" height="20" rx="8" fill="#F2F2F7"/><rect class="h h3" x="42" y="144" width="262" height="20" rx="8"/>
<g fill="#fff" stroke="#AEAEB2" stroke-width="1.5">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => `<circle cx="${56 + i * 16}" cy="${i % 2 ? 150 : 158}" r="3.5"/>`).join('')}</g>
<rect class="o" x="42" y="144" width="262" height="20" rx="8"/>
<text class="t" x="50" y="29">métal</text>
<text class="t" x="50" y="83">bois</text>
<text class="t" x="50" y="137">laine : air emprisonné</text>
</svg>`,
  },
  son: {
    legende: 'Dans l’air, la vibration passe d’une particule à la voisine jusqu’à l’oreille. Dans le vide : aucun son.',
    alt: 'En haut, un haut-parleur vibre dans l’air : les particules d’air, en colonnes, se poussent l’une l’autre et des zones serrées voyagent jusqu’à une oreille. En bas, le même haut-parleur vibre sous une cloche vide d’air : il n’y a aucune particule pour transmettre la vibration, rien n’arrive à l’oreille.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-chaleur-son">
<style>
.a-chaleur-son .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-chaleur-son .c{stroke:#0A84FF;stroke-width:5;stroke-linecap:round;stroke-dasharray:0 9.6;transform:translateX(var(--x));animation:a-chaleur-son-osc 8s ease-in-out infinite}
.a-chaleur-son .m{stroke:#AF52DE;stroke-width:4;stroke-linecap:round;transform:translateX(var(--x));animation:a-chaleur-son-osc 8s ease-in-out infinite}
.a-chaleur-son .o{fill:none;stroke:#3A3A3C;stroke-width:3;stroke-linecap:round}
@keyframes a-chaleur-son-osc{0%,12.5%,25%,37.5%,50%,62.5%,75%,87.5%,100%{transform:translateX(-6px)}6.25%,18.75%,31.25%,43.75%,56.25%,68.75%,81.25%,93.75%{transform:translateX(6px)}}
</style>
${[[55, true], [141, false]].map(([y, air]) => {
    const st = (k) => `style="--x:${(-6 * Math.cos(2 * Math.PI * k * 0.125)).toFixed(1)}px;animation-delay:-${(k * 0.125).toFixed(3)}s"`;
    return `<rect x="14" y="${y - 13}" width="14" height="26" rx="3" fill="#3A3A3C"/><path d="M28 ${y - 8} L44 ${y - 21} V${y + 21} L28 ${y + 8} Z" fill="#3A3A3C"/>
<line class="m" x1="49" y1="${y - 19}" x2="49" y2="${y + 19}" ${st(16)}/>` +
      (air ? [...Array(15).keys()].map((i) => `<line class="c" x1="${64 + i * 12}" y1="${y - 24}" x2="${64 + i * 12}" y2="${y + 24}" ${st(15 - i)}/>`).join('') : '') +
      `<path class="o" d="M268 ${y - 12} C268 ${y - 30} 296 ${y - 30} 296 ${y - 8} C296 ${y + 4} 285 ${y + 6} 284 ${y + 16} C283 ${y + 26} 271 ${y + 26} 269 ${y + 16} M277 ${y - 6} C277 ${y - 17} 288 ${y - 17} 288 ${y - 7} C288 ${y - 1} 282 ${y + 1} 282 ${y + 6}"/>`;
  }).join('\n')}
<path d="M10 170 V138 Q10 112 40 112 H216 Q246 112 246 138 V170 M4 172 H252" fill="none" stroke="#8E8E93" stroke-width="2.5" stroke-linecap="round"/>
<text class="t" x="14" y="17">dans l’air : le son se propage</text>
<text class="t" x="258" y="104" text-anchor="end">dans le vide : aucun son</text>
</svg>`,
  },
  energie: {
    legende: 'L’énergie électrique devient chaleur : 4 180 joules font monter 1 litre d’eau de 1 °C.',
    alt: 'Une prise électrique envoie de l’énergie, en jaune, le long d’un fil jusqu’à une plaque chauffante rouge. La plaque transmet la chaleur, en vagues orange, à une casserole contenant 1 litre d’eau. Le thermomètre plongé dans l’eau monte doucement d’une graduation : plus 1 degré pour 4 180 joules. Puis l’apport s’arrête.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-chaleur-energie">
<style>
.a-chaleur-energie .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-chaleur-energie .flux{fill:none;stroke:#FFD60A;stroke-width:4;stroke-dasharray:6 10;animation:a-chaleur-energie-flux 8s linear infinite,a-chaleur-energie-actif 8s ease-in-out infinite}
.a-chaleur-energie .v{fill:none;stroke:#FF9F0A;stroke-width:3;stroke-linecap:round;stroke-dasharray:8 8;animation:a-chaleur-energie-vague 8s linear infinite,a-chaleur-energie-actif 8s ease-in-out infinite}
.a-chaleur-energie .plaque{fill:#FF3B30;animation:a-chaleur-energie-plaque 8s ease-in-out infinite}
.a-chaleur-energie .col{transform-box:fill-box;transform-origin:center bottom;animation:a-chaleur-energie-monte 8s ease-in-out infinite}
.a-chaleur-energie .plus{animation:a-chaleur-energie-plus 8s ease-in-out infinite}
@keyframes a-chaleur-energie-flux{0%{stroke-dashoffset:0}72%,100%{stroke-dashoffset:-160}}
@keyframes a-chaleur-energie-vague{0%{stroke-dashoffset:0}72%,100%{stroke-dashoffset:-128}}
@keyframes a-chaleur-energie-actif{0%,70%{opacity:1}76%,94%{opacity:0}100%{opacity:1}}
@keyframes a-chaleur-energie-plaque{0%,70%{fill:#FF3B30}78%,94%{fill:#8E8E93}100%{fill:#FF3B30}}
@keyframes a-chaleur-energie-monte{0%{transform:scaleY(0)}70%,88%{transform:scaleY(1)}98%,100%{transform:scaleY(0)}}
@keyframes a-chaleur-energie-plus{0%,64%{opacity:0}72%,88%{opacity:1}95%,100%{opacity:0}}
</style>
<rect x="14" y="56" width="40" height="40" rx="9" fill="#F2F2F7" stroke="#3A3A3C" stroke-width="2.5"/><circle cx="28" cy="76" r="3.5" fill="#3A3A3C"/><circle cx="40" cy="76" r="3.5" fill="#3A3A3C"/>
<path d="M38 18 L26 36 H34 L30 50 L44 30 H36 Z" fill="#FFD60A" stroke="#3A3A3C" stroke-width="2" stroke-linejoin="round"/>
<path d="M54 76 H80 V155 H112" fill="none" stroke="#3A3A3C" stroke-width="4" stroke-linejoin="round"/>
<path class="flux" d="M54 76 H80 V155 H112"/>
<text class="t" x="74" y="130" text-anchor="end">4&#8239;180&#8239;J</text>
<rect class="plaque" x="112" y="150" width="96" height="10" rx="4"/>
<rect x="116" y="66" width="88" height="76" rx="6" fill="#64D2FF" opacity=".45"/>
<path d="M114 48 V136 Q114 144 122 144 H198 Q206 144 206 136 V48" fill="none" stroke="#3A3A3C" stroke-width="3" stroke-linejoin="round"/>
${[128, 146, 164].map((x) => `<path class="v" d="M${x} 140 q-5 -8 0 -16 q5 -8 0 -16 q-5 -8 0 -16 q5 -8 0 -16"/>`).join('')}
<text class="t" x="150" y="40" text-anchor="middle">1 L d’eau</text>
<rect x="183" y="44" width="10" height="86" rx="5" fill="#fff" stroke="#3A3A3C" stroke-width="2"/>
<rect x="186" y="90" width="4" height="40" fill="#FF3B30"/><rect class="col" x="186" y="70" width="4" height="21" fill="#FF3B30"/>
<circle cx="188" cy="130" r="8" fill="#FF3B30" stroke="#3A3A3C" stroke-width="2"/>
<path d="M195 90 H203 M195 70 H203" stroke="#3A3A3C" stroke-width="2.5" stroke-linecap="round"/>
<text class="t plus" x="212" y="75">+1 °C</text>
</svg>`,
  },
};
