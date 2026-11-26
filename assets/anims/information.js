/* Animations des fiches : information. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-info-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  binaire: {
    legende: 'Les 8 cases s’allument une à une : chaque position vaut le double de sa voisine de droite.',
    alt: 'Huit cases en ligne, un octet. Au-dessus de chaque case, sa valeur : 128, 64, 32, 16, 8, 4, 2, 1. Les cases passent de 0 à 1 une par une, de droite à gauche, jusqu’à ce que les huit bits valent 1, puis tout revient à 0. En bas : 8 bits = 1 octet, 256 valeurs.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-info-binaire">
<style>
.a-info-binaire .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-info-binaire .p{font:700 13px -apple-system,system-ui,sans-serif;fill:#3A3A3C}
.a-info-binaire .d{font:800 16px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-info-binaire .r{stroke:#3A3A3C;stroke-width:3}
.a-info-binaire .on{transform-box:fill-box;transform-origin:center}
${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const p = (0.1 + 0.8 * k) / 8 * 100; return `.a-info-binaire .on${k}{animation:a-info-binaire-b${k} 8s ease-in-out infinite}
@keyframes a-info-binaire-b${k}{0%,${p.toFixed(1)}%{opacity:0;transform:scale(.8)}${(p + 2).toFixed(1)}%,92%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(1)}}`; }).join('\n')}
</style>
<text class="t" x="160" y="34" text-anchor="middle">valeur de chaque position</text>
${[128, 64, 32, 16, 8, 4, 2, 1].map((v, i) => { const x = 22 + i * 35, k = 7 - i; return `<text class="p" x="${x + 15}" y="64" text-anchor="middle">${v}</text>
<rect class="r" x="${x}" y="72" width="30" height="36" rx="6" fill="#E5E5EA"/><text class="d" x="${x + 15}" y="96" text-anchor="middle">0</text>
<g class="on on${k}"><rect class="r" x="${x}" y="72" width="30" height="36" rx="6" fill="#FFD60A"/><text class="d" x="${x + 15}" y="96" text-anchor="middle">1</text></g>`; }).join('\n')}
<path d="M22 116 v6 H297 v-6 M159.5 122 v8" fill="none" stroke="#3A3A3C" stroke-width="3" stroke-linejoin="round"/>
<text class="t" x="160" y="152" text-anchor="middle">8 bits = 1 octet → 256 valeurs</text>
</svg>`,
  },

  portes: {
    legende: 'Les entrées changent : ET s’allume avec les deux, OU avec au moins une, NON fait l’inverse.',
    alt: 'Trois portes logiques en colonne : ET, OU et NON. À gauche, les entrées A et B (vert = 1, gris = 0) passent par les quatre cas : 0 et 0, puis A seul, puis B seul, puis les deux. La lampe de ET ne s’allume que quand A et B sont à 1 ; celle de OU dès qu’une entrée est à 1 ; celle de NON, branchée sur A seul, est allumée quand A vaut 0 et éteinte quand A vaut 1.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-info-portes">
<style>
.a-info-portes .w{fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round}
.a-info-portes .pt{fill:currentColor}
.a-info-portes .lp{fill:currentColor;stroke:#3A3A3C;stroke-width:3}
.a-info-portes .g{fill:#fff;stroke:#3A3A3C;stroke-width:3}
.a-info-portes .t{font:800 14px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-info-portes .l{font:700 13px -apple-system,system-ui,sans-serif;fill:#3A3A3C}
.a-info-portes .sa{color:#34C759;animation:a-info-portes-a 8s ease-in-out infinite}
.a-info-portes .sb{color:#AEAEB2;animation:a-info-portes-b 8s ease-in-out infinite}
.a-info-portes .set{color:#D1D1D6;animation:a-info-portes-et 8s ease-in-out infinite}
.a-info-portes .sou{color:#FF9F0A;animation:a-info-portes-ou 8s ease-in-out infinite}
.a-info-portes .snon{color:#D1D1D6;animation:a-info-portes-non 8s ease-in-out infinite}
${[['a', '', [0, 1, 0, 1], '#34C759', '#AEAEB2'], ['b', '', [0, 0, 1, 1], '#34C759', '#AEAEB2'], ['et', '', [0, 0, 0, 1], '#FF9F0A', '#D1D1D6'], ['ou', '', [0, 1, 1, 1], '#FF9F0A', '#D1D1D6'], ['non', '', [1, 0, 1, 0], '#FF9F0A', '#D1D1D6']].map(([n, , v, on, off]) => { const c = (j) => (v[j] ? on : off); return `@keyframes a-info-portes-${n}{0%,24%{color:${c(0)}}26%,49%{color:${c(1)}}51%,74%{color:${c(2)}}76%,98%{color:${c(3)}}100%{color:${c(0)}}}`; }).join('\n')}
</style>
${[['ET', 32, 'set'], ['OU', 90, 'sou']].map(([n, y, s]) => `<g class="sa"><path class="w" d="M40 ${y - 9} H110"/><circle class="pt" cx="34" cy="${y - 9}" r="6"/></g>
<g class="sb"><path class="w" d="M40 ${y + 9} H110"/><circle class="pt" cx="34" cy="${y + 9}" r="6"/></g>
<text class="l" x="14" y="${y - 5}" text-anchor="middle">A</text><text class="l" x="14" y="${y + 13}" text-anchor="middle">B</text>
<g class="${s}"><path class="w" d="M180 ${y} H246"/><circle class="lp" cx="258" cy="${y}" r="11"/></g>
<rect class="g" x="110" y="${y - 18}" width="70" height="36" rx="9"/><text class="t" x="145" y="${y + 5}" text-anchor="middle">${n}</text>`).join('\n')}
<g class="sa"><path class="w" d="M40 148 H110"/><circle class="pt" cx="34" cy="148" r="6"/></g>
<text class="l" x="14" y="152" text-anchor="middle">A</text>
<g class="snon"><path class="w" d="M180 148 H246"/><circle class="lp" cx="258" cy="148" r="11"/></g>
<rect class="g" x="110" y="130" width="70" height="36" rx="9"/><text class="t" x="145" y="153" text-anchor="middle">NON</text>
</svg>`,
  },

  chaine: {
    legende: 'Il fait froid : le capteur mesure, le programme décide, l’ordre part, le radiateur chauffe.',
    alt: 'Une chaîne d’information en quatre cases reliées par des flèches, exemple du thermostat. Le thermomètre (acquérir, capteur) voit la température baisser ; la flèche s’allume et la puce (traiter, programme) s’éclaire ; des ondes partent (communiquer, le message) ; enfin le radiateur (agir, actionneur) devient orange et chauffe, et la température remonte.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-info-chaine">
<style>
.a-info-chaine .c{fill:#fff;stroke:#3A3A3C;stroke-width:3}
.a-info-chaine .v{font:700 12px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-info-chaine .n{font:500 12px -apple-system,system-ui,sans-serif;fill:#3A3A3C}
.a-info-chaine .fl{color:#FF9F0A}
.a-info-chaine .fl path{fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.a-info-chaine .niv{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.7);animation:a-info-chaine-niv 8s ease-in-out infinite}
.a-info-chaine .c1{animation:a-info-chaine-c1 8s ease-in-out infinite}
.a-info-chaine .c2{animation:a-info-chaine-c2 8s ease-in-out infinite}
.a-info-chaine .c3{animation:a-info-chaine-c3 8s ease-in-out infinite}
.a-info-chaine .c4{animation:a-info-chaine-c4 8s ease-in-out infinite}
.a-info-chaine .f1{animation:a-info-chaine-f1 8s ease-in-out infinite}
.a-info-chaine .f2{animation:a-info-chaine-f2 8s ease-in-out infinite}
.a-info-chaine .f3{animation:a-info-chaine-f3 8s ease-in-out infinite}
.a-info-chaine .puce{fill:#0A84FF;animation:a-info-chaine-puce 8s ease-in-out infinite}
.a-info-chaine .onde{fill:none;stroke:#AF52DE;stroke-width:3;stroke-linecap:round;animation:a-info-chaine-onde 8s ease-in-out infinite}
.a-info-chaine .rad{fill:#FF9F0A;animation:a-info-chaine-rad 8s ease-in-out infinite}
.a-info-chaine .ch{fill:none;stroke:#FF3B30;stroke-width:2.5;stroke-linecap:round;animation:a-info-chaine-ch 8s ease-in-out infinite}
@keyframes a-info-chaine-niv{0%{transform:scaleY(.7)}15%,70%{transform:scaleY(.3)}95%,100%{transform:scaleY(.7)}}
${[['c1', 3, 20], ['c2', 28, 45], ['c3', 50, 62], ['c4', 66, 95]].map(([n, a, b]) => `@keyframes a-info-chaine-${n}{0%,${a}%{stroke:#3A3A3C}${a + 2}%,${b}%{stroke:#FF9F0A;stroke-width:5}${b + 3}%,100%{stroke:#3A3A3C}}`).join('\n')}
${[['f1', 18, 30], ['f2', 43, 52], ['f3', 60, 68]].map(([n, a, b]) => `@keyframes a-info-chaine-${n}{0%,${a}%{color:#C7C7CC}${a + 2}%,${b}%{color:#FF9F0A}${b + 3}%,100%{color:#C7C7CC}}`).join('\n')}
@keyframes a-info-chaine-puce{0%,28%{fill:#3A3A3C}31%,45%{fill:#0A84FF}48%,100%{fill:#3A3A3C}}
@keyframes a-info-chaine-onde{0%,50%{opacity:.15}54%,62%{opacity:1}65%,100%{opacity:.15}}
@keyframes a-info-chaine-rad{0%,66%{fill:#C7C7CC}70%,93%{fill:#FF9F0A}97%,100%{fill:#C7C7CC}}
@keyframes a-info-chaine-ch{0%,67%{opacity:0;transform:translateY(4px)}74%{opacity:1}93%{opacity:1;transform:translateY(-4px)}97%,100%{opacity:0}}
</style><g transform="translate(-3 0)">
${[40, 120, 200, 280].map((x, i) => `<rect class="c c${i + 1}" x="${x - 28}" y="44" width="56" height="56" rx="10"/>`).join('')}
${[68, 148, 228].map((x, i) => `<g class="fl f${i + 1}"><path d="M${x + 2} 72 H${x + 21} M${x + 15} 66 L${x + 21} 72 L${x + 15} 78"/></g>`).join('')}
<rect x="34" y="50" width="12" height="38" rx="6" fill="#fff" stroke="#3A3A3C" stroke-width="3"/><rect class="niv" x="37.5" y="56" width="5" height="32" fill="#FF3B30"/><circle cx="40" cy="89" r="7" fill="#FF3B30" stroke="#3A3A3C" stroke-width="3"/>
<path d="M104 62 h-6 M104 72 h-6 M104 82 h-6 M136 62 h6 M136 72 h6 M136 82 h6" stroke="#3A3A3C" stroke-width="3"/><rect class="puce" x="104" y="56" width="32" height="32" rx="4"/><rect x="113" y="65" width="14" height="14" rx="2" fill="#fff" opacity=".85"/>
<circle cx="190" cy="72" r="4" fill="#AF52DE"/><path class="onde" d="M197 64 a11 11 0 0 1 0 16 M203 58 a19 19 0 0 1 0 28"/><path d="M190 76 V92" stroke="#3A3A3C" stroke-width="3"/>
<g class="ch"><path d="M268 60 q-3 -4 0 -8 q3 -4 0 -8 M280 60 q-3 -4 0 -8 q3 -4 0 -8 M292 60 q-3 -4 0 -8 q3 -4 0 -8"/></g>
<rect class="rad" x="263" y="66" width="34" height="26" rx="4" stroke="#3A3A3C" stroke-width="3"/><path d="M272 69 V89 M280 69 V89 M288 69 V89" stroke="#3A3A3C" stroke-width="2.5"/>
${[[40, 'acquérir', 'capteur'], [120, 'traiter', 'programme'], [200, 'communiquer', 'message'], [280, 'agir', 'actionneur']].map(([x, v, n]) => `<text class="v" x="${x}" y="120" text-anchor="middle">${v}</text><text class="n" x="${x}" y="137" text-anchor="middle">${n}</text>`).join('')}
</g></svg>`,
  },

  ia: {
    legende: 'Cette IA reçoit des exemples variés, ses liens se renforcent, puis elle reconnaît un chat jamais vu.',
    alt: 'À gauche, trois exemples de chats de couleurs différentes : blanc, noir, roux. L’un après l’autre, ils entrent dans la boîte IA, dont le petit réseau de connexions se renforce à chaque exemple. Ensuite, on lui montre par en dessous un chat gris qu’elle n’a jamais vu, et l’IA répond à droite : c’est un chat.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-info-ia">
<style>
.a-info-ia .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-info-ia .k{stroke:#3A3A3C;stroke-width:2.5;stroke-linejoin:round}
.a-info-ia .fl{fill:none;stroke:#3A3A3C;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.a-info-ia .lien{stroke:#AF52DE;stroke-width:2.5;animation:a-info-ia-lien 8s ease-in-out infinite}
.a-info-ia .ex{transform-box:fill-box;transform-origin:center}
.a-info-ia .e1{animation:a-info-ia-e1 8s ease-in-out infinite}
.a-info-ia .e2{animation:a-info-ia-e2 8s ease-in-out infinite}
.a-info-ia .e3{animation:a-info-ia-e3 8s ease-in-out infinite}
.a-info-ia .lex{animation:a-info-ia-lex 8s ease-in-out infinite}
.a-info-ia .neuf{transform-box:fill-box;transform-origin:center;animation:a-info-ia-neuf 8s ease-in-out infinite}
.a-info-ia .rep{animation:a-info-ia-rep 8s ease-in-out infinite}
@keyframes a-info-ia-lien{0%,5%{opacity:.15}17%,26%{opacity:.4}29%,38%{opacity:.7}41%,90%{opacity:1}96%,100%{opacity:.15}}
${[[1, 52, 5], [2, 94, 17], [3, 136, 29]].map(([n, y, a]) => `@keyframes a-info-ia-e${n}{0%,${a}%{transform:translate(0,0) scale(1);opacity:1}${a + 10}%{transform:translate(123px,${74 - y}px) scale(.4);opacity:0}${a + 11}%,90%{transform:translate(0,0) scale(1);opacity:0}96%,100%{transform:translate(0,0) scale(1);opacity:1}}`).join('\n')}
@keyframes a-info-ia-lex{0%,36%{opacity:1}39%,90%{opacity:0}96%,100%{opacity:1}}
@keyframes a-info-ia-neuf{0%,44%{opacity:0;transform:scale(.6)}52%,90%{opacity:1;transform:scale(1)}95%,100%{opacity:0;transform:scale(1)}}
@keyframes a-info-ia-rep{0%,58%{opacity:0}63%,90%{opacity:1}95%,100%{opacity:0}}
</style>
<text class="t lex" x="43" y="20" text-anchor="middle">exemples</text>
${(() => { const chat = (x, y, f, o) => `<path class="k" d="M${x - 13} ${y - 4} L${x - 12} ${y - 22} L${x - 3} ${y - 13} Z M${x + 13} ${y - 4} L${x + 12} ${y - 22} L${x + 3} ${y - 13} Z" fill="${f}"/><circle class="k" cx="${x}" cy="${y}" r="14" fill="${f}"/><circle cx="${x - 5}" cy="${y - 2}" r="2.2" fill="${o}"/><circle cx="${x + 5}" cy="${y - 2}" r="2.2" fill="${o}"/><path d="M${x - 2} ${y + 5} h4 l-2 2.5 z" fill="${o}"/>`;
    return `<g class="ex e1">${chat(40, 52, '#FFFFFF', '#3A3A3C')}</g><g class="ex e2">${chat(40, 94, '#1D1D1F', '#FFD60A')}</g><g class="ex e3">${chat(40, 136, '#FF9F0A', '#1D1D1F')}</g><g class="neuf">${chat(163, 150, '#8E8E93', '#1D1D1F')}<text class="t" x="184" y="155">jamais vu</text><path class="fl" d="M163 126 V116 M157 122 L163 116 L169 122"/></g>`; })()}
<path class="fl" d="M68 74 H110 M103 67 L110 74 L103 81 M212 74 H236 M229 67 L236 74 L229 81"/>
<text class="t" x="163" y="28" text-anchor="middle">IA</text>
<rect x="118" y="36" width="90" height="76" rx="12" fill="#fff" stroke="#AF52DE" stroke-width="3"/>
<g class="lien">${[54, 74, 94].map((b) => [48, 74, 100].map((d) => `<line x1="136" y1="${b}" x2="163" y2="${d}"/>`).join('')).join('')}${[48, 74, 100].map((d) => `<line x1="163" y1="${d}" x2="190" y2="74"/>`).join('')}</g>
${[[136, 54], [136, 74], [136, 94], [163, 48], [163, 74], [163, 100], [190, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#AF52DE"/>`).join('')}
<g class="rep"><path d="M262 52 l6 6 l11 -13" fill="none" stroke="#248A3D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text class="t" x="272" y="78" text-anchor="middle">c’est</text><text class="t" x="272" y="95" text-anchor="middle">un chat</text></g>
</svg>`,
  },
};
