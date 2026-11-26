/* Animations des fiches : énergie. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-energie-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  formes: {
    legende: 'Lampe de poche : l’énergie chimique de la pile devient électrique, puis lumineuse et thermique.',
    alt: 'Une pile verte reliée à une lampe par des fils. Des points orange (énergie électrique) partent de la borne plus, font le tour du circuit et traversent la lampe allumée ; de la lampe partent des rayons de lumière vers la droite et des ondulations rouges de chaleur montent à côté. Étiquettes : chimique, électrique, lumineuse, thermique.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-energie-formes">
<style>
.a-energie-formes .fil{fill:none;stroke:#3A3A3C;stroke-width:4;stroke-linejoin:round}
.a-energie-formes .e{fill:#FF9F0A;offset-path:path('M40 70 V30 H240 V140 H40 Z');offset-rotate:0deg;offset-distance:var(--d0);animation:a-energie-formes-tour 8s linear infinite}
.a-energie-formes .ray{stroke:#FF9F0A;stroke-width:4;stroke-linecap:round;stroke-dasharray:8 10;animation:a-energie-formes-ray 8s linear infinite}
.a-energie-formes .chal{fill:none;stroke:#FF3B30;stroke-width:3;stroke-linecap:round;stroke-dasharray:6 6;animation:a-energie-formes-chal 8s linear infinite}
.a-energie-formes .halo{opacity:.6;animation:a-energie-formes-halo 8s ease-in-out infinite}
.a-energie-formes .t{font:700 12px -apple-system,system-ui,sans-serif}
@keyframes a-energie-formes-tour{0%{offset-distance:var(--d0)}100%{offset-distance:calc(var(--d0) + 100%)}}
@keyframes a-energie-formes-ray{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-72px}}
@keyframes a-energie-formes-chal{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-96px}}
@keyframes a-energie-formes-halo{0%,50%,100%{opacity:.6}25%,75%{opacity:.35}}
</style>
<path class="fil" d="M40 66 V30 H240 V140 H40 V122"/>
<g>${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((d) => `<circle class="e" r="4.5" style="--d0:${d}%"/>`).join('')}</g>
<rect x="22" y="70" width="36" height="52" rx="5" fill="#34C759" stroke="#1D1D1F" stroke-width="3"/><rect x="33" y="64" width="14" height="7" rx="2" fill="#1D1D1F"/>
<text x="40" y="90" text-anchor="middle" font-size="15" font-weight="800" fill="#1D1D1F" font-family="-apple-system,system-ui,sans-serif">+</text>
<g>${[[257, 65, 270, 50], [264, 74, 282, 66], [266, 85, 286, 85], [264, 96, 282, 104], [257, 105, 270, 120]].map(([a, b, c, d]) => `<line class="ray" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`).join('')}</g>
<g>${[198, 210, 222].map((x) => `<path class="chal" d="M${x} 112 q-4 -6 0 -12 t0 -12 t0 -12 t0 -12"/>`).join('')}</g>
<circle class="halo" cx="240" cy="85" r="22" fill="#FFD60A"/><circle cx="240" cy="85" r="13" fill="#FFD60A" stroke="#3A3A3C" stroke-width="3"/>
<text class="t" x="66" y="100" fill="#1E6B30">chimique</text>
<text class="t" x="140" y="22" text-anchor="middle" fill="#8A4B00">électrique</text>
<text class="t" x="280" y="42" text-anchor="middle" fill="#8A4B00">lumineuse</text>
<text class="t" x="194" y="128" text-anchor="middle" fill="#B3261E">thermique</text>
</svg>`,
  },
  rendement: {
    legende: 'Ampoule à incandescence : sur 100 % d’électricité, 5 % deviennent lumière utile, 95 % partent en chaleur.',
    alt: 'Un large ruban orange « électricité 100 % » entre par la gauche et se partage à l’ampoule : un fil jaune très fin continue tout droit, « lumière 5 % » (l’énergie utile), et un énorme ruban rouge descend, « chaleur 95 % » (l’énergie perdue). Des traits clairs avancent dans les rubans pour montrer l’énergie qui circule.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-energie-rendement">
<style>
.a-energie-rendement .flux{fill:none;stroke:#fff;stroke-opacity:.5;stroke-dasharray:14 18;animation:a-energie-rendement-flux 8s linear infinite}
.a-energie-rendement .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
@keyframes a-energie-rendement-flux{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-320px}}
</style>
<path d="M8 60 H150" stroke="#FF9F0A" stroke-width="60"/>
<path d="M150 61.5 C195 61.5 205 126 250 126 H262" fill="none" stroke="#FF3B30" stroke-width="57"/>
<polygon points="262,90 294,126 262,162" fill="#FF3B30"/>
<path d="M150 31.5 H204" stroke="#FFD60A" stroke-width="3"/><polygon points="204,25.5 214,31.5 204,37.5" fill="#FFD60A" stroke="#8A4B00" stroke-width="1"/>
<path class="flux" d="M8 45 H150 M8 75 H150" stroke-width="5"/>
<path class="flux" d="M150 50 C195 50 205 112 262 112 M150 76 C195 76 205 140 262 140" stroke-width="5"/>
<text class="t" x="78" y="65" text-anchor="middle">électricité 100 %</text>
<text class="t" x="219" y="36">lumière 5 %</text>
<text class="t" x="268" y="177" text-anchor="middle" style="fill:#B3261E">chaleur 95 %</text>
</svg>`,
  },
  renouvelable: {
    legende: 'Le vent revient sans cesse, le charbon s’épuise ; mais l’éolienne émet aussi du CO₂ : 12 g contre 1000 g.',
    alt: 'À gauche, une éolienne tourne dans le vent ; à droite, une centrale à charbon fume à côté de son tas de charbon. En bas, deux barres de CO₂ émis par kWh sur tout le cycle de vie se remplissent : celle de l’éolienne reste minuscule (12 g), celle du charbon traverse presque toute l’image (1000 g). Aucune n’est nulle.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-energie-renouvelable">
<style>
.a-energie-renouvelable .rotor{transform-origin:60px 40px;animation:a-energie-renouvelable-tourne 8s linear infinite}
.a-energie-renouvelable .vent{fill:none;stroke:#0A84FF;stroke-width:3;stroke-linecap:round;stroke-dasharray:10 14;animation:a-energie-renouvelable-vent 8s linear infinite}
.a-energie-renouvelable .fum{fill:#8E8E93;transform-box:fill-box;transform-origin:50% 50%;opacity:.7;animation:a-energie-renouvelable-fum 8s ease-out infinite;animation-delay:var(--dl)}
.a-energie-renouvelable .bar{transform-box:fill-box;transform-origin:0 50%;animation:a-energie-renouvelable-bar 8s ease-in-out infinite}
.a-energie-renouvelable .t{font:700 12px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
@keyframes a-energie-renouvelable-tourne{to{transform:rotate(720deg)}}
@keyframes a-energie-renouvelable-vent{to{stroke-dashoffset:-96px}}
@keyframes a-energie-renouvelable-fum{0%{transform:none;opacity:.7}50%,100%{transform:translate(14px,-20px) scale(1.6);opacity:0}}
@keyframes a-energie-renouvelable-bar{0%{transform:none}5%,14%{transform:scaleX(0)}55%,100%{transform:none}}
</style>
<path class="vent" d="M4 28 H24 M2 44 H22 M4 60 H24"/>
<polygon points="57,112 63,112 61.5,40 58.5,40" fill="#3A3A3C"/>
<g class="rotor">${[0, 120, 240].map((r) => `<path d="M60 40 Q65 26 60 13 Q55 26 60 40Z" fill="#fff" stroke="#3A3A3C" stroke-width="2" transform="rotate(${r} 60 40)"/>`).join('')}<circle cx="60" cy="40" r="4" fill="#3A3A3C"/></g>
${[0, -2, -4, -6].map((d) => `<circle class="fum" cx="242" cy="38" r="7" style="--dl:${d}s"/>`).join('')}
<rect x="236" y="44" width="12" height="40" fill="#3A3A3C"/><rect x="196" y="82" width="56" height="30" rx="2" fill="#3A3A3C"/>
<polygon points="258,112 279,92 300,112" fill="#1D1D1F"/>
<text class="t" x="8" y="127" style="fill:#3A3A3C">CO₂ émis par kWh produit (cycle de vie)</text>
<rect class="bar" x="124" y="134" width="2.2" height="14" fill="#34C759"/>
<rect class="bar" x="124" y="156" width="186" height="14" rx="2" fill="#3A3A3C"/>
<text class="t" x="8" y="145">éolienne : 12 g</text><text class="t" x="8" y="167">charbon : 1000 g</text>
</svg>`,
  },
  chaine: {
    legende: 'L’énergie traverse les blocs : alimenter, distribuer, convertir (électrique → mécanique), transmettre, agir.',
    alt: 'Cinq blocs alignés, reliés par des flèches : alimenter (une pile), distribuer (un interrupteur), convertir (un moteur M), transmettre (deux engrenages qui tournent), agir (une roue qui tourne). Des points d’énergie avancent de gauche à droite : orange (électrique) avant le moteur, verts (mécanique) après.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-energie-chaine">
<style>
.a-energie-chaine .e{fill:#FF9F0A;offset-path:path('M32 90 H288');offset-rotate:0deg;offset-distance:var(--d0);animation:a-energie-chaine-av 8s linear infinite,a-energie-chaine-forme 8s linear infinite;animation-delay:var(--dl)}
.a-energie-chaine .e.m{fill:#34C759}
.a-energie-chaine .b{fill:#fff;stroke:#3A3A3C;stroke-width:3;animation:a-energie-chaine-hl 8s ease-in-out infinite;animation-delay:var(--dl)}
.a-energie-chaine .rg{transform-box:fill-box;transform-origin:50% 50%;animation:a-energie-chaine-rg 8s linear infinite}
.a-energie-chaine .rp{transform-box:fill-box;transform-origin:50% 50%;animation:a-energie-chaine-rp 8s linear infinite}
.a-energie-chaine .dent{fill:none;stroke:#3A3A3C;stroke-width:4;stroke-dasharray:3.1416 3.1416}
.a-energie-chaine .t{font:700 12px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
@keyframes a-energie-chaine-av{0%{offset-distance:0%}100%{offset-distance:100%}}
@keyframes a-energie-chaine-forme{0%,49.9%{fill:#FF9F0A}50%,100%{fill:#34C759}}
@keyframes a-energie-chaine-rg{to{transform:rotate(720deg)}}
@keyframes a-energie-chaine-rp{to{transform:rotate(-1260deg)}}
@keyframes a-energie-chaine-hl{0%,36%,64%,100%{stroke:#3A3A3C;fill:#fff}46%,54%{stroke:var(--hc);fill:var(--hf)}}
</style>
<path d="M32 90 H288" stroke="#3A3A3C" stroke-width="3"/>
<g fill="#3A3A3C">${[64, 128, 192, 256].map((x) => `<polygon points="${x - 3},84 ${x + 4},90 ${x - 3},96"/>`).join('')}</g>
<g>${Array.from({ length: 16 }, (_, k) => `<circle class="e${k >= 8 ? ' m' : ''}" r="3.5" style="--d0:${k * 6.25 + 3.125}%;--dl:${-(k * 0.5 + 0.25)}s"/>`).join('')}</g>
${[32, 96, 160, 224, 288].map((x, k) => `<rect class="b" x="${x - 20}" y="74" width="40" height="32" rx="7" style="--dl:${(((1.4 * k - 3.5) % 8 + 8) % 8 - 8).toFixed(1)}s;--hc:${k < 2 ? '#FF9F0A' : k > 2 ? '#34C759' : '#AF52DE'};--hf:${k < 2 ? '#FFF1DB' : k > 2 ? '#E3F7E8' : '#F3E6FA'}"/>`).join('')}
<rect x="21" y="84" width="19" height="12" rx="2" fill="#1D1D1F"/><rect x="40" y="87" width="3" height="6" fill="#1D1D1F"/>
<circle cx="88" cy="95" r="2.5" fill="#3A3A3C"/><circle cx="104" cy="95" r="2.5" fill="#3A3A3C"/><line x1="88" y1="95" x2="103" y2="91" stroke="#3A3A3C" stroke-width="3" stroke-linecap="round"/>
<circle cx="160" cy="90" r="11" fill="#fff" stroke="#3A3A3C" stroke-width="2.5"/><text x="160" y="95" text-anchor="middle" font-size="13" font-weight="800" fill="#1D1D1F" font-family="-apple-system,system-ui,sans-serif">M</text>
<g class="rg"><circle class="dent" cx="218" cy="90" r="7"/><circle cx="218" cy="90" r="5.5" fill="#3A3A3C"/></g>
<g class="rp"><circle class="dent" cx="234" cy="90" r="4"/><circle cx="234" cy="90" r="2.5" fill="#3A3A3C"/></g>
<g class="rg"><circle cx="288" cy="90" r="11" fill="#fff" stroke="#3A3A3C" stroke-width="3"/><path d="M277 90 H299 M282.5 80.5 L293.5 99.5 M293.5 80.5 L282.5 99.5" stroke="#3A3A3C" stroke-width="2"/></g>
<text class="t" x="36" y="66" text-anchor="middle">alimenter</text><text class="t" x="160" y="66" text-anchor="middle">convertir</text><text class="t" x="288" y="66" text-anchor="middle">agir</text>
<text class="t" x="96" y="124" text-anchor="middle">distribuer</text><text class="t" x="224" y="124" text-anchor="middle">transmettre</text>
</svg>`,
  },
};
