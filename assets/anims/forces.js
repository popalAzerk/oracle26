/* Animations des fiches : forces. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-forces-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  newton: {
    legende: 'Une masse de 1 kg tire sur le ressort du dynamomètre : il indique environ 9,81 N, son poids.',
    alt: 'Un dynamomètre est accroché à un support. Une masse de 1 kg pend à son crochet : le ressort est étiré et le repère rouge indique environ 9,81 newtons. On décroche la masse et on la pose sur une table : le ressort se raccourcit et le repère revient à 0 N. On raccroche la masse : le ressort s’étire de nouveau jusqu’à environ 9,81 N.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-forces-newton">
<style>
.a-forces-newton .txt{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-forces-newton .ressort{fill:none;stroke:#3A3A3C;stroke-width:3;stroke-linejoin:round;vector-effect:non-scaling-stroke;transform-origin:130px 16px;animation:a-forces-newton-ressort 8s ease-in-out infinite}
.a-forces-newton .tige{animation:a-forces-newton-tige 8s ease-in-out infinite}
.a-forces-newton .masse{animation:a-forces-newton-masse 8s ease-in-out infinite}
.a-forces-newton .lu{animation:a-forces-newton-lu 8s ease-in-out infinite}
.a-forces-newton .zero{opacity:0;animation:a-forces-newton-zero 8s ease-in-out infinite}
@keyframes a-forces-newton-ressort{0%,36%{transform:scaleY(1)}44%,84%{transform:scaleY(.222)}92%,100%{transform:scaleY(1)}}
@keyframes a-forces-newton-tige{0%,36%{transform:translateY(0)}44%,84%{transform:translateY(-49px)}92%,100%{transform:translateY(0)}}
@keyframes a-forces-newton-masse{0%,36%{transform:translate(0,0)}44%{transform:translate(0,-49px)}48%{transform:translate(40px,-60px)}52%,76%{transform:translate(80px,0)}80%{transform:translate(40px,-60px)}84%{transform:translate(0,-49px)}92%,100%{transform:translate(0,0)}}
@keyframes a-forces-newton-lu{0%,34%{opacity:1}38%,90%{opacity:0}94%,100%{opacity:1}}
@keyframes a-forces-newton-zero{0%,44%{opacity:0}48%,80%{opacity:1}84%,100%{opacity:0}}
</style>
<path d="M95 8H185" stroke="#3A3A3C" stroke-width="4" stroke-linecap="round"/>
<path d="M130 8V12" stroke="#3A3A3C" stroke-width="3"/>
<rect x="110" y="11" width="40" height="76" rx="8" fill="#fff" stroke="#3A3A3C" stroke-width="3"/>
<path d="M141 30h7M143 35h5M143 40h5M143 45h5M143 50h5M141 55h7M143 60h5M143 65h5M143 70h5M143 75h5M141 80h7" stroke="#3A3A3C" stroke-width="1.5"/>
<path class="ressort" d="M130 16V19.0L121 20.4L139 23.3L121 26.1L139 29.0L121 31.8L139 34.7L121 37.5L139 40.4L121 43.2L139 46.1L121 48.9L139 51.8L121 54.6L139 57.5L121 60.3L139 63.2L121 66.0L139 68.9L121 71.7L139 74.6L130 76.0V79"/>
<g class="tige">
<path d="M130 79V141" stroke="#3A3A3C" stroke-width="3"/>
<path d="M116 79H150" stroke="#FF3B30" stroke-width="3" stroke-linecap="round"/>
<path d="M130 140v6a5 5 0 1 1-7 4" fill="none" stroke="#3A3A3C" stroke-width="3" stroke-linecap="round"/>
<text class="txt lu" x="156" y="84">≈ 9,81 N</text>
<text class="txt zero" x="156" y="84">0 N</text>
</g>
<rect x="110" y="84" width="40" height="3" fill="#3A3A3C"/>
<path d="M175 178H245" stroke="#3A3A3C" stroke-width="4" stroke-linecap="round"/>
<g class="masse">
<circle cx="130" cy="149" r="3.5" fill="none" stroke="#3A3A3C" stroke-width="2.5"/>
<rect x="108" y="152" width="44" height="24" rx="5" fill="#3A3A3C"/>
<text x="130" y="169" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="-apple-system,system-ui,sans-serif">1 kg</text>
</g>
<text class="txt" x="104" y="52" text-anchor="end">dynamomètre</text>
</svg>`,
  },
  hooke: {
    legende: 'Deux fois plus de force, deux fois plus d’allongement : l’allongement du ressort est proportionnel à la force.',
    alt: 'Trois ressorts identiques pendent côte à côte. Le premier est au repos. On accroche une masse (force F) au deuxième : il s’allonge de x. On accroche deux masses (force 2F) au troisième : il s’allonge de 2x, deux fois plus. Les masses sont retirées, les ressorts reprennent leur longueur, puis on les raccroche.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-forces-hooke">
<style>
.a-forces-hooke .txt{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-forces-hooke .r{fill:none;stroke:#3A3A3C;stroke-width:3;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.a-forces-hooke .rB{transform-origin:160px 14px;animation:a-forces-hooke-rB 8s ease-in-out infinite}
.a-forces-hooke .rC{transform-origin:240px 14px;animation:a-forces-hooke-rC 8s ease-in-out infinite}
.a-forces-hooke .bB{animation:a-forces-hooke-bB 8s ease-in-out infinite}
.a-forces-hooke .bC{animation:a-forces-hooke-bC 8s ease-in-out infinite}
.a-forces-hooke .m{animation:a-forces-hooke-m 8s ease-in-out infinite}
.a-forces-hooke .cote{animation:a-forces-hooke-cote 8s ease-in-out infinite}
.a-forces-hooke .mt{font:800 13px -apple-system,system-ui,sans-serif;fill:#fff}
@keyframes a-forces-hooke-rB{0%,40%{transform:scaleY(1)}50%,70%{transform:scaleY(.5)}82%,100%{transform:scaleY(1)}}
@keyframes a-forces-hooke-rC{0%,40%{transform:scaleY(1)}50%,70%{transform:scaleY(.3333)}82%,100%{transform:scaleY(1)}}
@keyframes a-forces-hooke-bB{0%,40%{transform:translateY(0)}50%,70%{transform:translateY(-30px)}82%,100%{transform:translateY(0)}}
@keyframes a-forces-hooke-bC{0%,40%{transform:translateY(0)}50%,70%{transform:translateY(-60px)}82%,100%{transform:translateY(0)}}
@keyframes a-forces-hooke-m{0%,40%{opacity:1}48%,62%{opacity:0}70%,100%{opacity:1}}
@keyframes a-forces-hooke-cote{0%,38%{opacity:1}44%,79%{opacity:0}84%,100%{opacity:1}}
</style>
<path d="M50 12H290" stroke="#3A3A3C" stroke-width="4" stroke-linecap="round"/>
<path d="M56 44H296" stroke="#8E8E93" stroke-width="1.5" stroke-dasharray="4 4"/>
<path class="r" d="M80 14V17.0L71 17.8L89 19.2L71 20.8L89 22.2L71 23.8L89 25.2L71 26.8L89 28.2L71 29.8L89 31.2L71 32.8L89 34.2L71 35.8L89 37.2L71 38.8L89 40.2L80 41.0V44"/>
<circle cx="80" cy="47" r="3" fill="none" stroke="#3A3A3C" stroke-width="2.5"/>
<text class="txt" x="80" y="68" text-anchor="middle">repos</text>
<path class="r rB" d="M160 14V17.0L151 18.7L169 22.1L151 25.4L169 28.8L151 32.2L169 35.6L151 38.9L169 42.3L151 45.7L169 49.1L151 52.4L169 55.8L151 59.2L169 62.6L151 65.9L169 69.3L160 71.0V74"/>
<g class="bB"><circle cx="160" cy="77" r="3" fill="none" stroke="#3A3A3C" stroke-width="2.5"/>
<g class="m"><rect x="143" y="80" width="34" height="18" rx="4" fill="#0A84FF"/><text class="mt" x="160" y="94" text-anchor="middle">F</text></g></g>
<path class="r rC" d="M240 14V17.0L231 19.6L249 24.9L231 30.1L249 35.4L231 40.6L249 45.9L231 51.1L249 56.4L231 61.6L249 66.9L231 72.1L249 77.4L231 82.6L249 87.9L231 93.1L249 98.4L240 101.0V104"/>
<g class="bC"><circle cx="240" cy="107" r="3" fill="none" stroke="#3A3A3C" stroke-width="2.5"/>
<g class="m"><rect x="223" y="110" width="34" height="18" rx="4" fill="#0A84FF"/><text class="mt" x="240" y="124" text-anchor="middle">F</text>
<circle cx="240" cy="131" r="3" fill="none" stroke="#3A3A3C" stroke-width="2.5"/>
<rect x="223" y="134" width="34" height="18" rx="4" fill="#0A84FF"/><text class="mt" x="240" y="148" text-anchor="middle">F</text></g></g>
<g class="cote" fill="none" stroke="#FF9F0A" stroke-width="3" stroke-linecap="round">
<path d="M180 44h6v30h-6"/><path d="M260 44h6v60h-6"/></g>
<g class="cote"><text class="txt" x="191" y="64">x</text><text class="txt" x="271" y="79">2x</text></g>
<text class="txt" x="160" y="174" text-anchor="middle">2× la force → 2× l’allongement</text>
</svg>`,
  },
  levier: {
    legende: 'Petit effort au bout du grand bras, lourde charge près du pivot : force × bras est égal des deux côtés.',
    alt: 'Une barre posée sur un pivot. Une lourde charge est placée près du pivot (petit bras), une petite flèche d’effort appuie loin du pivot (grand bras, trois fois plus long). La flèche du poids est trois fois plus longue que celle de l’effort. L’effort appuie, le grand bras descend beaucoup et la charge monte un peu, puis la barre revient à l’horizontale.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-forces-levier">
<style>
.a-forces-levier .txt{font:700 12px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-forces-levier .barre{transform-origin:110px 125px;animation:a-forces-levier-barre 8s ease-in-out infinite}
.a-forces-levier .effort{animation:a-forces-levier-effort 8s ease-in-out infinite}
.a-forces-levier .poids{animation:a-forces-levier-poids 8s ease-in-out infinite}
@keyframes a-forces-levier-barre{0%,18%{transform:rotate(0deg)}42%,62%{transform:rotate(8deg)}86%,100%{transform:rotate(0deg)}}
@keyframes a-forces-levier-effort{0%,18%{transform:translateY(0)}42%,62%{transform:translateY(20.9px)}86%,100%{transform:translateY(0)}}
@keyframes a-forces-levier-poids{0%,18%{transform:translateY(0)}42%,62%{transform:translateY(-7px)}86%,100%{transform:translateY(0)}}
</style>
<path d="M20 160H300" stroke="#3A3A3C" stroke-width="4" stroke-linecap="round"/>
<path d="M110 128L94 160H126Z" fill="#8E8E93" stroke="#3A3A3C" stroke-width="3" stroke-linejoin="round"/>
<g fill="none" stroke="#636366" stroke-width="2"><path d="M60 66V80M110 66V80M260 66V80"/><path d="M60 73H110M110 73H260" stroke-dasharray="4 3"/></g>
<text class="txt" x="85" y="61" text-anchor="middle">petit bras</text>
<text class="txt" x="185" y="61" text-anchor="middle">grand bras</text>
<g class="barre">
<rect x="42" y="122" width="226" height="7" rx="3" fill="#3A3A3C"/>
<rect x="42" y="86" width="36" height="36" rx="5" fill="#FF9F0A" stroke="#3A3A3C" stroke-width="3"/>
</g>
<circle cx="110" cy="125" r="3.5" fill="#fff"/>
<g class="poids"><path d="M60 102V136" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M60 102V136" stroke="#FF3B30" stroke-width="4" stroke-linecap="round"/><path d="M51 133L60 149L69 133Z" fill="#FF3B30" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></g>
<g class="effort"><path d="M260 109V114" stroke="#0A84FF" stroke-width="4" stroke-linecap="round"/><path d="M253 114L260 124L267 114Z" fill="#0A84FF"/></g>
<text class="txt" x="160" y="176" text-anchor="middle">effort × grand bras = poids × petit bras</text>
</svg>`,
  },
  frottement: {
    legende: 'Le bloc glisse : le frottement, dirigé à l’opposé du mouvement, le freine jusqu’à l’arrêt.',
    alt: 'Un bloc est lancé vers la droite sur un sol rugueux. Une flèche bleue « mouvement » pointe vers la droite et raccourcit à mesure que le bloc ralentit. Une flèche rouge « frottement », au contact du sol, pointe vers la gauche, à l’opposé du mouvement. De petites marques orange montrent que le contact chauffe. Le bloc s’arrête, les flèches disparaissent, puis il est relancé.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-forces-frottement">
<style>
.a-forces-frottement .txt{font:700 13px -apple-system,system-ui,sans-serif}
.a-forces-frottement .mob{animation:a-forces-frottement-x 8s linear infinite,a-forces-frottement-vu 8s ease-in-out infinite}
.a-forces-frottement .fl{animation:a-forces-frottement-fl 8s ease-in-out infinite}
.a-forces-frottement .arret{opacity:0;animation:a-forces-frottement-arret 8s ease-in-out infinite}
.a-forces-frottement .v{transform-box:fill-box;transform-origin:0 50%;transform:scaleX(.55);animation:a-forces-frottement-v 8s linear infinite}
@keyframes a-forces-frottement-x{0%{transform:translateX(0)}5%{transform:translateX(11.9px)}10%{transform:translateX(21.5px)}15%{transform:translateX(28.9px)}20%{transform:translateX(34.4px)}25%{transform:translateX(37.6px)}30%,61%{transform:translateX(38.7px)}62%,75%{transform:translateX(-91.3px)}80%{transform:translateX(-68.7px)}85%{transform:translateX(-48.4px)}90%{transform:translateX(-30.1px)}95%{transform:translateX(-14px)}100%{transform:translateX(0)}}
@keyframes a-forces-frottement-v{0%{transform:scaleX(.55)}30%,75%{transform:scaleX(0)}75.1%{transform:scaleX(1)}100%{transform:scaleX(.55)}}
@keyframes a-forces-frottement-fl{0%,28%{opacity:1}32%,73%{opacity:0}76%,100%{opacity:1}}
@keyframes a-forces-frottement-arret{0%,30%{opacity:0}34%,56%{opacity:1}60%,100%{opacity:0}}
@keyframes a-forces-frottement-vu{0%,55%{opacity:1}60%,64%{opacity:0}71%,100%{opacity:1}}
</style>
<rect x="10" y="129" width="300" height="12" rx="3" fill="#C7C7CC"/>
<path d="M10 129l6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4" fill="none" stroke="#3A3A3C" stroke-width="2" stroke-linejoin="round"/>
<g class="mob">
<rect x="146" y="86" width="56" height="40" rx="6" fill="#AF52DE" stroke="#3A3A3C" stroke-width="3"/>
<g class="fl">
<path class="v" d="M146 74H226L218 68M226 74L218 80" fill="none" stroke="#0A84FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<text class="txt" x="174" y="60" text-anchor="middle" fill="#0A4FA8">mouvement</text>
<path d="M148 128H112M120 122L112 128L120 134" fill="none" stroke="#FF3B30" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<text class="txt" x="152" y="160" text-anchor="middle" fill="#B3261E">frottement</text>
<path d="M132 120q4-5 0-10M139 121q4-5 0-10" fill="none" stroke="#FF9F0A" stroke-width="2.5" stroke-linecap="round"/>
</g>
<text class="txt arret" x="174" y="60" text-anchor="middle" fill="#1D1D1F">à l’arrêt</text>
</g>
</svg>`,
  },
};
