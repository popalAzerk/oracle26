/* Animations des fiches : eau. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-eau-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  archimede: {
    legende: 'Plus le bloc s’enfonce, plus il déplace d’eau et plus la poussée grandit : il flotte quand poussée = poids.',
    alt: 'Un bloc de bois flotte dans une cuve d’eau : une flèche rouge « poids » vers le bas et une flèche bleue « poussée » vers le haut, de même longueur. Le bloc disparaît puis réapparaît au-dessus de l’eau, sans poussée. On le lâche : en entrant dans l’eau, le niveau monte et la flèche de poussée s’allonge. Il s’enfonce trop, la poussée dépasse le poids et le fait remonter, puis il se stabilise quand poussée et poids sont égaux.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-eau-archimede">
<style>
.a-eau-archimede .bloc{animation:a-eau-archimede-bloc 8s ease-in-out infinite}
.a-eau-archimede .eau{fill:#0A84FF;opacity:.3;transform-origin:160px 156px;animation:a-eau-archimede-niv 8s ease-in-out infinite}
.a-eau-archimede .surf{stroke:#0A84FF;stroke-width:3;animation:a-eau-archimede-surf 8s ease-in-out infinite}
.a-eau-archimede .pou{transform-box:fill-box;transform-origin:50% 100%;animation:a-eau-archimede-pou 8s ease-in-out infinite}
.a-eau-archimede .lp{animation:a-eau-archimede-lp 8s ease-in-out infinite}
.a-eau-archimede .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-eau-archimede .e2,.a-eau-archimede .e3,.a-eau-archimede .e4{opacity:0}
.a-eau-archimede .e1{animation:a-eau-archimede-e1 8s steps(1) infinite}
.a-eau-archimede .e2{animation:a-eau-archimede-e2 8s steps(1) infinite}
.a-eau-archimede .e3{animation:a-eau-archimede-e3 8s steps(1) infinite}
.a-eau-archimede .e4{animation:a-eau-archimede-e4 8s steps(1) infinite}
@keyframes a-eau-archimede-bloc{0%,1%{transform:none;opacity:1}3.5%{transform:none;opacity:0}3.6%{transform:translateY(-56px);opacity:0}6%,30%{transform:translateY(-56px);opacity:1}38%{transform:translateY(-18px);opacity:1}44%{transform:translateY(10px);opacity:1}50%{transform:translateY(-4px);opacity:1}56%,100%{transform:none;opacity:1}}
@keyframes a-eau-archimede-niv{0%,1%{transform:none}3.5%,38%{transform:scaleY(.882)}44%{transform:scaleY(1.059)}50%{transform:scaleY(.971)}56%,100%{transform:none}}
@keyframes a-eau-archimede-surf{0%,1%{transform:none}3.5%,38%{transform:translateY(8px)}44%{transform:translateY(-4px)}50%{transform:translateY(2px)}56%,100%{transform:none}}
@keyframes a-eau-archimede-pou{0%,1%{transform:none}3.5%,38%{transform:scaleY(0)}44%{transform:scaleY(1.54)}50%{transform:scaleY(.77)}56%,100%{transform:none}}
@keyframes a-eau-archimede-lp{0%,1%{opacity:1}3%,40%{opacity:0}44%,100%{opacity:1}}
@keyframes a-eau-archimede-e1{0%{opacity:1}3.5%{opacity:0}52%{opacity:1}}
@keyframes a-eau-archimede-e2{0%{opacity:0}3.5%{opacity:1}37%{opacity:0}}
@keyframes a-eau-archimede-e3{0%{opacity:0}37%{opacity:1}42%{opacity:0}}
@keyframes a-eau-archimede-e4{0%{opacity:0}42%{opacity:1}52%{opacity:0}}
</style>
<g class="bloc"><rect x="130" y="70" width="60" height="44" rx="5" fill="#FF9F0A" stroke="#3A3A3C" stroke-width="3"/></g>
<rect class="eau" x="60" y="88" width="200" height="68"/>
<line class="surf" x1="60" y1="88" x2="260" y2="88"/>
<path d="M58 60 V158 H262 V60" fill="none" stroke="#3A3A3C" stroke-width="4" stroke-linejoin="round"/>
<g class="bloc">
<g fill="#FF3B30"><line x1="160" y1="92" x2="160" y2="126" stroke="#FF3B30" stroke-width="4"/><polygon points="153,124 167,124 160,137"/></g>
<g class="pou" fill="#0040DD"><polygon points="153,61 167,61 160,48"/><line x1="160" y1="59" x2="160" y2="92" stroke="#0040DD" stroke-width="4"/></g>
<text class="t" x="151" y="134" text-anchor="end" style="fill:#B3261E">poids</text>
<text class="t lp" x="169" y="58" style="fill:#0040A8">poussée</text>
</g>
<text class="t e1" x="160" y="175" text-anchor="middle">il flotte : poussée = poids</text>
<text class="t e2" x="160" y="175" text-anchor="middle">hors de l’eau : aucune poussée</text>
<text class="t e3" x="160" y="175" text-anchor="middle">il s’enfonce : la poussée grandit</text>
<text class="t e4" x="160" y="175" text-anchor="middle">poussée &gt; poids : il remonte</text>
</svg>`,
  },
  pression: {
    legende: 'Plus le capteur descend, plus la pression le serre (+1 bar tous les 10 m), cuve large ou tube étroit.',
    alt: 'Une cuve large et un tube étroit, remplis d’eau à la même hauteur, avec des repères à 10 m (+1 bar) et 20 m (+2 bar). Dans chacun, un capteur entouré de quatre flèches de pression remonte jusqu’à la surface, où les flèches sont petites, puis redescend : à 10 m puis 20 m les flèches grandissent, exactement pareil dans la cuve et dans le tube.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-eau-pression">
<style>
.a-eau-pression .cap{animation:a-eau-pression-cap 8s ease-in-out infinite}
.a-eau-pression .f{fill:#0040A8;animation:a-eau-pression-f 8s ease-in-out infinite}
.a-eau-pression .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-eau-pression .eau{fill:#5AC8FA;opacity:.45}
@keyframes a-eau-pression-cap{0%,6%{transform:none}22%,32%{transform:translateY(-91px)}52%,60%{transform:translateY(-49px)}80%,100%{transform:none}}
@keyframes a-eau-pression-f{0%,6%{transform:none}22%,32%{transform:scale(.38)}52%,60%{transform:scale(.667)}80%,100%{transform:none}}
</style>
<rect class="eau" x="48" y="40" width="120" height="120"/><rect class="eau" x="208" y="40" width="44" height="120"/>
<path d="M48 40 H168 M208 40 H252" stroke="#0A84FF" stroke-width="3"/>
<path d="M40 89 H258 M40 138 H258" stroke="#8E8E93" stroke-width="1.5" stroke-dasharray="4 4"/>
<path d="M46 28 V162 H170 V28 M206 28 V162 H254 V28" fill="none" stroke="#3A3A3C" stroke-width="4" stroke-linejoin="round"/>
<text class="t" x="4" y="93">10 m</text><text class="t" x="4" y="142">20 m</text>
<text class="t" x="262" y="93">+1 bar</text><text class="t" x="262" y="142">+2 bar</text>
${[108, 230].map((x) => `<g class="cap"><circle cx="${x}" cy="138" r="5" fill="#FFD60A" stroke="#1D1D1F" stroke-width="2"/>${[[x - 7, 138, 0], [x + 7, 138, 180], [x, 131, 90], [x, 145, -90]].map(([a, b, r]) => `<g transform="translate(${a} ${b}) rotate(${r})"><path class="f" d="M-12 -1.5H-6V-4L0 0-6 4V1.5H-12Z"/></g>`).join('')}</g>`).join('')}
</svg>`,
  },
  hydraulique: {
    legende: 'Petite force : le petit piston descend beaucoup ; le liquide pousse le gros piston, qui monte peu mais fort.',
    alt: 'Un tube en U rempli de liquide, avec un petit piston à gauche et un gros piston portant une caisse à droite. Le petit piston remonte, la caisse redescend un peu. Puis une petite flèche orange appuie sur le petit piston : il descend beaucoup, le liquide passe de l’autre côté et le gros piston monte un peu, poussé par une grande flèche verte, en soulevant la caisse.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-eau-hydraulique">
<style>
.a-eau-hydraulique .liq{fill:#5AC8FA}
.a-eau-hydraulique .lc{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.4286);animation:a-eau-hydraulique-lc 8s ease-in-out infinite}
.a-eau-hydraulique .rc{transform-box:fill-box;transform-origin:50% 100%;animation:a-eau-hydraulique-rc 8s ease-in-out infinite}
.a-eau-hydraulique .gp{animation:a-eau-hydraulique-gp 8s ease-in-out infinite}
.a-eau-hydraulique .dp{animation:a-eau-hydraulique-dp 8s ease-in-out infinite}
.a-eau-hydraulique .fl{animation:a-eau-hydraulique-fl 8s ease-in-out infinite}
.a-eau-hydraulique .t{font:700 13px -apple-system,system-ui,sans-serif}
@keyframes a-eau-hydraulique-lc{0%,6%{transform:scaleY(.4286)}18%,32%{transform:none}72%,100%{transform:scaleY(.4286)}}
@keyframes a-eau-hydraulique-rc{0%,6%{transform:none}18%,32%{transform:scaleY(.667)}72%,100%{transform:none}}
@keyframes a-eau-hydraulique-gp{0%,6%{transform:none}18%,32%{transform:translateY(-40px)}72%,100%{transform:none}}
@keyframes a-eau-hydraulique-dp{0%,6%{transform:none}18%,32%{transform:translateY(10px)}72%,100%{transform:none}}
@keyframes a-eau-hydraulique-fl{0%,6%{opacity:1}12%,34%{opacity:0}40%,100%{opacity:1}}
</style>
<rect class="liq" x="50" y="130" width="222" height="30"/>
<rect class="liq lc" x="50" y="60" width="24" height="70"/>
<rect class="liq rc" x="176" y="100" width="96" height="30"/>
<path d="M48 20 V162 H274 V40 M76 20 V128 H174 V40" fill="none" stroke="#3A3A3C" stroke-width="4" stroke-linejoin="round"/>
<g class="gp"><rect x="50" y="92" width="24" height="8" fill="#3A3A3C"/><line x1="62" y1="92" x2="62" y2="76" stroke="#3A3A3C" stroke-width="4"/><rect x="53" y="72" width="18" height="5" rx="2" fill="#3A3A3C"/>
<g class="fl"><line x1="62" y1="59" x2="62" y2="62" stroke="#FF9F0A" stroke-width="4"/><polygon points="56,61 68,61 62,70" fill="#FF9F0A"/></g></g>
<text class="t fl" x="82" y="52" fill="#8A4B00">petite force</text>
<g class="dp"><rect x="176" y="92" width="96" height="8" fill="#3A3A3C"/><rect x="192" y="58" width="64" height="34" rx="4" fill="#FFD60A" stroke="#3A3A3C" stroke-width="3"/><path d="M192 58 L256 92 M256 58 L192 92" stroke="#3A3A3C" stroke-width="2"/>
<g class="fl"><line x1="224" y1="55" x2="224" y2="28" stroke="#34C759" stroke-width="7"/><polygon points="212,30 236,30 224,11" fill="#34C759"/></g></g>
<text class="t fl" x="210" y="24" text-anchor="end" fill="#1E6B30">grande force</text>
</svg>`,
  },
  cycle: {
    legende: 'Une goutte fait le tour : évaporation, condensation dans le nuage, pluie, ruissellement jusqu’à la mer.',
    alt: 'Paysage avec soleil, mer, nuage et montagne. Des gouttes suivent une boucle : elles s’élèvent de la mer sous forme de vapeur (points blancs), entrent dans le nuage qui gonfle, retombent en pluie bleue sur la montagne, puis ruissellent le long d’une rivière jusqu’à la mer, et recommencent. Aucune goutte ne disparaît.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-eau-cycle">
<style>
.a-eau-cycle .g{fill:#0A84FF;stroke:#0A84FF;stroke-width:1.5;offset-path:path('M95 147 C95 105 115 72 150 50 H205 V111 L150 147 H95');offset-rotate:0deg;offset-distance:var(--d0);animation:a-eau-cycle-tour 8s linear infinite,a-eau-cycle-etat 8s linear infinite;animation-delay:var(--dl)}
.a-eau-cycle .g.v{fill:#fff}
.a-eau-cycle .nuage{transform-box:fill-box;transform-origin:50% 50%;animation:a-eau-cycle-gonfle 8s ease-in-out infinite}
.a-eau-cycle .t{font:700 12px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
@keyframes a-eau-cycle-tour{0%{offset-distance:0%}100%{offset-distance:100%}}
@keyframes a-eau-cycle-etat{0%{fill:#0A84FF}5%,32%{fill:#fff}35%,100%{fill:#0A84FF}}
@keyframes a-eau-cycle-gonfle{0%,100%{transform:none}50%{transform:scale(1.06)}}
</style>
<circle cx="30" cy="30" r="13" fill="#FFD60A" stroke="#FF9F0A" stroke-width="3"/>
<path d="M0 142 Q20 137 40 142 T80 142 T120 142 T160 142 V180 H0 Z" fill="#B5E3F8"/>
<path d="M100 180 L270 70 L320 100 V180 Z" fill="#B4E6BF"/>
<path d="M95 147 C95 105 115 72 150 50 H205 V111 L150 147 H95" fill="none" stroke="#0A84FF" stroke-width="2" stroke-dasharray="3 6" opacity=".45"/>
<path d="M205 111 L150 147" stroke="#0A84FF" stroke-width="3" stroke-linecap="round"/>
<g>${Array.from({ length: 10 }, (_, k) => `<circle class="g${k >= 1 && k <= 3 ? ' v' : ''}" r="4" style="--d0:${k * 10}%;--dl:${-k * 0.8}s"/>`).join('')}</g>
<g class="nuage"><g fill="#C7C7CC"><circle cx="162" cy="44" r="16"/><circle cx="182" cy="35" r="19"/><circle cx="202" cy="44" r="16"/><rect x="148" y="38" width="68" height="22" rx="11"/></g>
<g fill="#fff"><circle cx="162" cy="44" r="14"/><circle cx="182" cy="35" r="17"/><circle cx="202" cy="44" r="14"/><rect x="150" y="40" width="64" height="18" rx="9"/></g></g>
<text class="t" x="8" y="110">évaporation</text>
<text class="t" x="224" y="30">condensation</text>
<text class="t" x="221" y="59">précipitations</text>
<text class="t" x="240" y="152" text-anchor="middle">ruissellement</text>
</svg>`,
  },
};
