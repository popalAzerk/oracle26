/* Animations des fiches : composants. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-comp-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  cpu: {
    legende: 'Les instructions entrent dans le processeur, il calcule et chauffe : le ventilateur évacue la chaleur.',
    alt: 'Vue de côté d’un processeur posé dans son socket sur la carte mère, avec un radiateur à ailettes et un ventilateur au-dessus. Des instructions (plus, fois, plus petit que, égal) arrivent par la gauche et entrent dans le processeur, qui rougeoie en calculant. Le ventilateur tourne et des ondulations de chaleur montent au-dessus.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-comp-cpu">
<style>
.a-comp-cpu .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-comp-cpu .tk{transform:translateX(var(--x0));animation:a-comp-cpu-tk 8s linear infinite}
.a-comp-cpu .tk text{font:800 13px -apple-system,system-ui,sans-serif;fill:#fff}
.a-comp-cpu .halo{opacity:.7;animation:a-comp-cpu-halo 8s ease-in-out infinite}
.a-comp-cpu .pale{animation:a-comp-cpu-pale 8s linear infinite}
.a-comp-cpu .ch{fill:none;stroke:#FF3B30;stroke-width:3;stroke-linecap:round}
.a-comp-cpu .ch path{animation:a-comp-cpu-ch 8s ease-in-out infinite}
@keyframes a-comp-cpu-tk{0%{transform:translateX(0);opacity:0}4%,47%{opacity:1}50%{transform:translateX(104px);opacity:0}50.01%{transform:translateX(0);opacity:0}54%,97%{opacity:1}100%{transform:translateX(104px);opacity:0}}
@keyframes a-comp-cpu-halo{0%,50%,100%{opacity:.45}25%,75%{opacity:.9}}
@keyframes a-comp-cpu-pale{to{transform:rotate(1440deg)}}
@keyframes a-comp-cpu-ch{${[0, 25, 50, 75].map((p) => `${p}%{transform:translateY(8px);opacity:0}${p + 8}%{opacity:1}${p + 24.9}%{transform:translateY(-10px);opacity:0}`).join('')}}
</style>
<rect x="10" y="146" width="300" height="12" rx="4" fill="#248A3D"/>
<path d="M14 136 H118" stroke="#B8860B" stroke-width="2" stroke-dasharray="3 5"/>
${['+', '×', '<', '='].map((c, i) => `<g class="tk" style="--x0:${i * 24}px;animation-delay:-${i}s"><rect x="14" y="127" width="20" height="18" rx="5" fill="#0A84FF"/><text x="24" y="141" text-anchor="middle">${c}</text></g>`).join('')}
<rect x="118" y="140" width="84" height="6" rx="2" fill="#8E8E93"/>
<rect class="halo" x="120" y="122" width="80" height="22" rx="8" fill="#FF3B30"/>
<rect x="128" y="128" width="64" height="12" rx="2" fill="#3A3A3C"/>
<rect x="122" y="118" width="76" height="9" rx="2" fill="#AEAEB2" stroke="#3A3A3C" stroke-width="2"/>
<path d="${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `M${127 + i * 7.3} 117 V90`).join(' ')}" stroke="#8E8E93" stroke-width="4"/>
<g transform="translate(160 79) scale(1 .3)"><circle r="44" fill="#E5E5EA" stroke="#3A3A3C" stroke-width="3" vector-effect="non-scaling-stroke"/>
<g class="pale">${[0, 90, 180, 270].map((a) => `<ellipse cx="22" rx="20" ry="9" transform="rotate(${a})" fill="#0A84FF"/>`).join('')}</g><circle r="8" fill="#3A3A3C"/></g>
<g class="ch">${[140, 160, 180].map((x) => `<path style="animation-delay:-${(x - 140) / 30}s" d="M${x} 58 q-4 -5 0 -10 q4 -5 0 -10"/>`).join('')}</g>
<path d="M207 79 H226 M196 134 H226" stroke="#3A3A3C" stroke-width="2"/>
<text class="t" x="230" y="84">ventilateur</text><text class="t" x="230" y="139">processeur</text>
</svg>`,
  },

  ram: {
    legende: 'Allumée, la mémoire vive se remplit très vite. Courant coupé : tout s’efface d’un coup.',
    alt: 'Une barrette de mémoire vive avec quatre puces noires. Un éclair jaune indique que le courant passe : les puces se remplissent rapidement de petits carrés de couleur, les données des programmes ouverts. Puis l’éclair devient gris, le courant est coupé : tous les carrés disparaissent en même temps. Le courant revient, mais la mémoire reste vide jusqu’à ce qu’on la remplisse de nouveau.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-comp-ram">
<style>
.a-comp-ram .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-comp-ram .ec{fill:#FFD60A;animation:a-comp-ram-ec 8s ease-in-out infinite}
.a-comp-ram .lon{animation:a-comp-ram-lon 8s ease-in-out infinite}
.a-comp-ram .loff{opacity:0;animation:a-comp-ram-loff 8s ease-in-out infinite}
${[0, 1, 2, 3].map((j) => `.a-comp-ram .d${j}{animation:a-comp-ram-d${j} 8s ease-in-out infinite}
@keyframes a-comp-ram-d${j}{0%,${3 + 4 * j}%{opacity:0}${6 + 4 * j}%,60%{opacity:1}62%,100%{opacity:0}}`).join('\n')}
@keyframes a-comp-ram-ec{0%,59%{fill:#FFD60A}61%,89%{fill:#C7C7CC}91%,100%{fill:#FFD60A}}
@keyframes a-comp-ram-lon{0%,4%{opacity:0}7%,59%{opacity:1}61%,100%{opacity:0}}
@keyframes a-comp-ram-loff{0%,60%{opacity:0}62%,89%{opacity:1}91%,100%{opacity:0}}
</style>
<path class="ec" d="M30 14 L18 36 H28 L24 54 L40 28 H30 L36 14 Z" stroke="#3A3A3C" stroke-width="2.5" stroke-linejoin="round"/>
<rect x="56" y="58" width="252" height="58" rx="5" fill="#1E7B34"/>
<path d="${Array.from({ length: 20 }, (_, i) => i).filter((i) => i !== 9).map((i) => `M${66 + i * 12} 116 v8`).join(' ')}" stroke="#E0A800" stroke-width="7"/>
${[0, 1, 2, 3].map((j) => { const x = 66 + j * 60; return `<rect x="${x}" y="66" width="50" height="40" rx="3" fill="#1D1D1F"/><g class="d${j}">${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<rect x="${x + 5 + (k % 4) * 10.5}" y="${73 + Math.floor(k / 4) * 14}" width="8" height="10" rx="2" fill="${['#0A84FF', '#FFD60A', '#34C759', '#FF9F0A', '#AF52DE'][(k + j * 3) % 5]}"/>`).join('')}</g>`; }).join('\n')}
<text class="t lon" x="182" y="40" text-anchor="middle">allumé : données des programmes</text>
<text class="t loff" x="182" y="40" text-anchor="middle">courant coupé : tout s’efface</text>
<text class="t" x="182" y="152" text-anchor="middle">mémoire vive (volatile)</text>
</svg>`,
  },

  ssd: {
    legende: 'Allumé, on lit les fichiers du SSD. Éteint, ils restent : rien ne s’efface, et rien ne tourne.',
    alt: 'Un disque SSD au format M.2, une carte allongée avec des puces noires sur lesquelles sont posés quatre fichiers. Quand l’éclair est jaune (courant), des copies des fichiers montent pour être lues, sans que les originaux bougent. Quand l’éclair devient gris (éteint), les quatre fichiers restent bien là. Aucune pièce ne bouge sur le disque.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-comp-ssd">
<style>
.a-comp-ssd .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-comp-ssd .ec{fill:#C7C7CC;animation:a-comp-ssd-ec 8s ease-in-out infinite}
.a-comp-ssd .lon{opacity:0;animation:a-comp-ssd-lon 8s ease-in-out infinite}
.a-comp-ssd .loff{animation:a-comp-ssd-loff 8s ease-in-out infinite}
.a-comp-ssd .cp{opacity:0;animation:a-comp-ssd-cp 8s ease-in-out infinite}
@keyframes a-comp-ssd-ec{0%,48%{fill:#FFD60A}51%,97%{fill:#C7C7CC}100%{fill:#FFD60A}}
@keyframes a-comp-ssd-lon{0%,48%{opacity:1}51%,97%{opacity:0}100%{opacity:1}}
@keyframes a-comp-ssd-loff{0%,48%{opacity:0}51%,97%{opacity:1}100%{opacity:0}}
@keyframes a-comp-ssd-cp{0%,2%{opacity:0;transform:translateY(0)}5%,18%{opacity:1}22%{opacity:0;transform:translateY(-44px)}22.1%,25%{opacity:0;transform:translateY(0)}28%,41%{opacity:1}45%,100%{opacity:0;transform:translateY(-44px)}}
</style>
<path class="ec" d="M30 14 L18 36 H28 L24 54 L40 28 H30 L36 14 Z" stroke="#3A3A3C" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M36 74 H282 V82 H288 V98 H282 V106 H36 a8 8 0 0 1 0 -16 Z" fill="#1E7B34"/>
<path d="M286 76 h10 M286 80 h10 M286 84 h10 M286 96 h10 M286 100 h10 M286 104 h10" stroke="#E0A800" stroke-width="2.5"/>
<rect x="62" y="80" width="38" height="20" rx="2" fill="#3A3A3C"/>
<rect x="118" y="78" width="70" height="24" rx="2" fill="#1D1D1F"/><rect x="200" y="78" width="70" height="24" rx="2" fill="#1D1D1F"/>
${(() => { const f = (x, y, c = '#fff') => `<path d="M${x} ${y} h10 l5 5 v13 h-15 z" fill="${c}"/><path d="M${x + 10} ${y} v5 h5" fill="none" stroke="#AEAEB2" stroke-width="1.5"/>`;
    return [134, 157, 216, 239].map((x) => f(x, 81)).join('') + `<g class="cp">${f(134, 81, '#64D2FF')}${f(239, 81, '#64D2FF')}</g>`; })()}
<text class="t lon" x="160" y="140" text-anchor="middle">allumé : on lit les fichiers</text>
<text class="t loff" x="160" y="140" text-anchor="middle">éteint : les fichiers restent</text>
<text class="t" x="160" y="160" text-anchor="middle">aucune pièce qui tourne</text>
</svg>`,
  },

  psu: {
    legende: 'Le 230 V alternatif du secteur entre ; il ressort en tensions continues : 12 V, 5 V et 3,3 V.',
    alt: 'À gauche, une prise du secteur reliée par un câble au boîtier d’alimentation. Sur ce câble, des points vont et viennent sur place : c’est le courant alternatif 230 V. Dans le boîtier, un ventilateur tourne. À droite sortent trois fils de couleur, 12 V, 5 V et 3,3 V, sur lesquels des points avancent toujours dans le même sens : c’est du courant continu.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-comp-psu">
<style>
.a-comp-psu .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-comp-psu .n{font:600 12px -apple-system,system-ui,sans-serif;fill:#3A3A3C}
.a-comp-psu .ac{animation:a-comp-psu-ac 8s ease-in-out infinite}
.a-comp-psu .dc{fill:none;stroke:#1D1D1F;stroke-width:5;stroke-linecap:round;stroke-dasharray:0 16;animation:a-comp-psu-dc 8s linear infinite}
.a-comp-psu .fan{animation:a-comp-psu-fan 8s linear infinite}
@keyframes a-comp-psu-ac{${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `${i * 12.5}%{transform:translateX(-8px)}${i * 12.5 + 6.25}%{transform:translateX(8px)}`).join('')}100%{transform:translateX(-8px)}}
@keyframes a-comp-psu-dc{to{stroke-dashoffset:-128}}
@keyframes a-comp-psu-fan{to{transform:rotate(720deg)}}
</style>
<rect x="10" y="66" width="38" height="48" rx="8" fill="#fff" stroke="#3A3A3C" stroke-width="3"/><circle cx="23" cy="90" r="3.5" fill="#3A3A3C"/><circle cx="35" cy="90" r="3.5" fill="#3A3A3C"/>
<path d="M48 90 H122" stroke="#3A3A3C" stroke-width="5"/>
<g class="ac">${[66, 85, 104].map((x) => `<circle cx="${x}" cy="90" r="4.5" fill="#FF9F0A"/>`).join('')}</g>
<text class="t" x="85" y="74" text-anchor="middle">230 V ~</text><text class="n" x="85" y="114" text-anchor="middle">alternatif</text>
${[[62, '#FFD60A', '12 V'], [90, '#FF3B30', '5 V'], [118, '#FF9F0A', '3,3 V']].map(([y, c, l]) => `<path d="M196 ${y} H262" stroke="${c}" stroke-width="8" stroke-linecap="round"/><path class="dc" d="M204 ${y} H260"/><text class="t" x="270" y="${y + 5}">${l}</text>`).join('')}
<text class="n" x="230" y="146" text-anchor="middle">continu</text>
<rect x="120" y="44" width="76" height="92" rx="10" fill="#3A3A3C"/>
<g transform="translate(158 78)"><circle r="22" fill="#1D1D1F" stroke="#8E8E93" stroke-width="3"/><g class="fan">${[0, 120, 240].map((a) => `<ellipse cx="11" rx="10" ry="5" transform="rotate(${a})" fill="#AEAEB2"/>`).join('')}</g></g>
<text x="158" y="125" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="-apple-system,system-ui,sans-serif">~ → =</text>
</svg>`,
  },
};
