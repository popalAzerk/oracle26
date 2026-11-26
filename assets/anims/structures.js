/* Animations des fiches : structures. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-structures-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  forme: {
    legende: 'Même charge : la poutre plate plie, l’arc tient et reporte la charge sur ses appuis.',
    alt: 'À gauche, une poutre plate posée sur deux appuis ; à droite, un arc posé sur deux appuis. La même charge se pose sur chacun. La poutre plate plie au milieu ; l’arc ne bouge pas et des flèches orange descendent le long de l’arc, du sommet vers les deux appuis. Les charges sont retirées (la poutre redevient droite), puis reposées.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-structures-forme">
<style>
.a-structures-forme .txt{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-structures-forme .p{stroke:#0A84FF;stroke-width:6;stroke-linecap:round}
.a-structures-forme .pg{transform-origin:24px 97px;transform:rotate(6deg);animation:a-structures-forme-pg 8s ease-in-out infinite}
.a-structures-forme .pd{transform-origin:136px 97px;transform:rotate(-6deg);animation:a-structures-forme-pd 8s ease-in-out infinite}
.a-structures-forme .cg{animation:a-structures-forme-cg 8s ease-in-out infinite}
.a-structures-forme .cd{animation:a-structures-forme-cd 8s ease-in-out infinite}
.a-structures-forme .flux{animation:a-structures-forme-flux 8s ease-in-out infinite}
.a-structures-forme .ch{fill:#FF9F0A;offset-rotate:auto;offset-distance:var(--d0);animation:a-structures-forme-ch 8s linear infinite;animation-delay:calc(var(--k) * -8s)}
.a-structures-forme .g1{offset-path:path('M240 93Q212 93 184 132')}
.a-structures-forme .g2{offset-path:path('M240 93Q268 93 296 132')}
@keyframes a-structures-forme-pg{0%,40%{transform:rotate(6deg)}46%,74%{transform:rotate(0deg)}82%,100%{transform:rotate(6deg)}}
@keyframes a-structures-forme-pd{0%,40%{transform:rotate(-6deg)}46%,74%{transform:rotate(0deg)}82%,100%{transform:rotate(-6deg)}}
@keyframes a-structures-forme-cg{0%,40%{transform:translateY(0);opacity:1}46%{transform:translateY(-6px);opacity:1}54%,66%{transform:translateY(-40px);opacity:0}74%{transform:translateY(-6px);opacity:1}82%,100%{transform:translateY(0);opacity:1}}
@keyframes a-structures-forme-cd{0%,46%{transform:translateY(0);opacity:1}54%,66%{transform:translateY(-34px);opacity:0}74%,100%{transform:translateY(0);opacity:1}}
@keyframes a-structures-forme-flux{0%,42%{opacity:1}48%,76%{opacity:0}82%,100%{opacity:1}}
.a-structures-forme .ta{animation:a-structures-forme-ta 8s steps(1) infinite}.a-structures-forme .tb{opacity:0;animation:a-structures-forme-tb 8s steps(1) infinite}
@keyframes a-structures-forme-ta{0%{opacity:1}47%{opacity:0}78%{opacity:1}}@keyframes a-structures-forme-tb{0%{opacity:0}47%{opacity:1}78%{opacity:0}}
@keyframes a-structures-forme-ch{0%{offset-distance:0%}100%{offset-distance:100%}}
</style>
<path d="M6 142H314" stroke="#3A3A3C" stroke-width="4" stroke-linecap="round"/>
<rect x="13" y="100" width="22" height="42" rx="3" fill="#8E8E93"/><rect x="125" y="100" width="22" height="42" rx="3" fill="#8E8E93"/>
<line class="p pg" x1="24" y1="97" x2="80" y2="97"/><line class="p pd" x1="80" y1="97" x2="136" y2="97"/>
<rect class="cg" x="66" y="78" width="28" height="22" rx="4" fill="#3A3A3C"/>
<rect x="168" y="126" width="28" height="16" rx="3" fill="#8E8E93"/><rect x="284" y="126" width="28" height="16" rx="3" fill="#8E8E93"/>
<path d="M184 132Q240 54 296 132" fill="none" stroke="#0A84FF" stroke-width="7" stroke-linecap="round"/>
<rect class="cd" x="226" y="68" width="28" height="22" rx="4" fill="#3A3A3C"/>
<g class="flux">${[0.15, 0.48, 0.81].map((k) => `<path class="ch g1" d="M-5-4L4 0-5 4Z" style="--d0:${k * 100}%;--k:${k}"/><path class="ch g2" d="M-5-4L4 0-5 4Z" style="--d0:${k * 100}%;--k:${k}"/>`).join('')}</g>
<text class="txt ta" x="80" y="166" text-anchor="middle">chargée : elle plie</text><text class="txt tb" x="80" y="166" text-anchor="middle">sans charge : droite</text>
<text class="txt ta" x="240" y="166" text-anchor="middle">arc : il tient</text><text class="txt tb" x="240" y="166" text-anchor="middle">arc, sans charge</text>
</svg>`,
  },
  gravite: {
    legende: 'Centre de gravité au-dessus de la base : l’objet retombe sur sa base. En dehors : il bascule.',
    alt: 'Deux caisses identiques penchées sur un sol, avec leur centre de gravité G et une ligne verticale qui en descend. À gauche, peu penchée, la verticale de G tombe dans la base d’appui (en vert) : la caisse retombe sur sa base, stable. À droite, plus penchée, la verticale de G passe en dehors de la base (en rouge) : la caisse bascule et se couche, puis l’expérience recommence.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-structures-gravite">
<style>
.a-structures-gravite .txt{font:700 13px -apple-system,system-ui,sans-serif}
.a-structures-gravite .boite{fill:#D6E8FF;stroke:#0A84FF;stroke-width:3;stroke-linejoin:round}
.a-structures-gravite .ag{transform-origin:120px 140px;transform:rotate(15deg);animation:a-structures-gravite-ag 8s infinite}
.a-structures-gravite .lg{transform-origin:100px 100px;transform:rotate(-15deg);animation:a-structures-gravite-lg 8s infinite}
.a-structures-gravite .ad{transform-origin:220px 140px;transform:rotate(40deg);animation:a-structures-gravite-ad 8s infinite,a-structures-gravite-vu 8s ease-in-out infinite}
.a-structures-gravite .ld{transform-origin:200px 100px;transform:rotate(-40deg);animation:a-structures-gravite-ld 8s infinite}
.a-structures-gravite .pl{stroke-width:2.5;stroke-dasharray:4 3}
.a-structures-gravite .pld{stroke:#D70015;animation:a-structures-gravite-ld 8s infinite,a-structures-gravite-c 8s steps(1) infinite,a-structures-gravite-pv 8s ease-in-out infinite}
@keyframes a-structures-gravite-ag{0%{transform:rotate(15deg);animation-timing-function:ease-in}18%,55%{transform:rotate(0deg);animation-timing-function:ease-in-out}100%{transform:rotate(15deg)}}
@keyframes a-structures-gravite-lg{0%{transform:rotate(-15deg);animation-timing-function:ease-in}18%,55%{transform:rotate(0deg);animation-timing-function:ease-in-out}100%{transform:rotate(-15deg)}}
@keyframes a-structures-gravite-ad{0%{transform:rotate(40deg);animation-timing-function:ease-in}22%,61%{transform:rotate(90deg)}62%,70%{transform:rotate(0deg);animation-timing-function:linear}100%{transform:rotate(40deg)}}
@keyframes a-structures-gravite-ld{0%{transform:rotate(-40deg);animation-timing-function:ease-in}22%,61%{transform:rotate(-90deg)}62%,70%{transform:rotate(0deg);animation-timing-function:linear}100%{transform:rotate(-40deg)}}
@keyframes a-structures-gravite-vu{0%,54%{opacity:1}59%,63%{opacity:0}68%,100%{opacity:1}}
@keyframes a-structures-gravite-pv{0%,7%{opacity:1}12%,62%{opacity:0}66%,100%{opacity:1}}
@keyframes a-structures-gravite-c{0%{stroke:#D70015}62%{stroke:#1B7F3B}90%{stroke:#D70015}}
</style>
<g class="ag"><rect class="boite" x="80" y="60" width="40" height="80" rx="3"/>
<line class="pl lg" x1="100" y1="100" x2="100" y2="142" stroke="#1B7F3B"/>
<circle cx="100" cy="100" r="4" fill="#1D1D1F"/><text class="txt lg" x="106" y="95" fill="#1D1D1F">G</text></g>
<g class="ad"><rect class="boite" x="180" y="60" width="40" height="80" rx="3"/>
<line class="pl ld pld" x1="200" y1="100" x2="200" y2="142"/>
<circle cx="200" cy="100" r="4" fill="#1D1D1F"/><text class="txt ld" x="206" y="95" fill="#1D1D1F">G</text></g>
<path d="M20 140H310" stroke="#3A3A3C" stroke-width="4" stroke-linecap="round"/>
<path d="M80 140H120M180 140H220" stroke="#34C759" stroke-width="5"/>
<text class="txt" x="100" y="166" text-anchor="middle" fill="#1B7F3B">stable</text>
<text class="txt" x="250" y="166" text-anchor="middle" fill="#B3261E">bascule</text>
</svg>`,
  },
  materiaux: {
    legende: 'Poutre chargée : le béton du haut est comprimé, l’acier du bas est tiré. Sans acier, le béton se fissure.',
    alt: 'Une poutre en béton armé posée sur deux appuis porte une charge en son milieu. En haut, des flèches bleues se rapprochent : le béton travaille en compression. En bas, des flèches rouges s’écartent : la barre d’acier travaille en traction. La barre d’acier disparaît : une fissure s’ouvre en bas du béton, côté traction. L’acier revient, la fissure se referme.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-structures-materiaux">
<style>
.a-structures-materiaux .txt{font:700 13px -apple-system,system-ui,sans-serif}
.a-structures-materiaux .acier{animation:a-structures-materiaux-acier 8s ease-in-out infinite}
.a-structures-materiaux .fis{opacity:0;transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(0);animation:a-structures-materiaux-fis 8s ease-in-out infinite}
.a-structures-materiaux .comp{animation:a-structures-materiaux-comp 8s ease-in-out infinite}
.a-structures-materiaux .trac{animation:a-structures-materiaux-trac 8s ease-in-out infinite}
.a-structures-materiaux .t1{animation:a-structures-materiaux-t1 8s ease-in-out infinite}
.a-structures-materiaux .t2{opacity:0;animation:a-structures-materiaux-t2 8s ease-in-out infinite}
@keyframes a-structures-materiaux-acier{0%,36%{opacity:1}44%,72%{opacity:0}80%,100%{opacity:1}}
@keyframes a-structures-materiaux-fis{0%,44%{opacity:0;transform:scaleY(0)}46%{opacity:1;transform:scaleY(.1)}56%,70%{opacity:1;transform:scaleY(1)}76%,100%{opacity:0;transform:scaleY(0)}}
@keyframes a-structures-materiaux-comp{0%,100%{transform:translateX(0)}50%{transform:translateX(-3px)}}
@keyframes a-structures-materiaux-trac{0%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}
@keyframes a-structures-materiaux-t1{0%,38%{opacity:1}42%,76%{opacity:0}80%,100%{opacity:1}}
@keyframes a-structures-materiaux-t2{0%,40%{opacity:0}44%,74%{opacity:1}78%,100%{opacity:0}}
</style>
<text class="txt" x="160" y="22" text-anchor="middle" fill="#0A4FA8">compression : béton</text>
<path d="M160 32V58" stroke="#FF9F0A" stroke-width="4" stroke-linecap="round"/><path d="M152 56L160 68L168 56Z" fill="#FF9F0A"/>
<path d="M58 108L46 128H70ZM262 108L250 128H274Z" fill="#8E8E93" stroke="#3A3A3C" stroke-width="2.5" stroke-linejoin="round"/>
<rect x="40" y="70" width="240" height="38" rx="4" fill="#D1D1D6" stroke="#3A3A3C" stroke-width="3"/>
<g fill="#8E8E93"><circle cx="70" cy="80" r="2"/><circle cx="118" cy="96" r="2.5"/><circle cx="205" cy="82" r="2"/><circle cx="250" cy="94" r="2.5"/><circle cx="140" cy="84" r="1.8"/></g>
<g class="acier"><path d="M46 99H274" stroke="#3A3A3C" stroke-width="5" stroke-linecap="round"/><path d="M60 99h0M80 99h0M100 99h0M120 99h0M140 99h0M180 99h0M200 99h0M220 99h0M240 99h0M260 99h0" stroke="#8E8E93" stroke-width="3" stroke-linecap="round"/></g>
<path class="fis" d="M152 107L158 88L160 80L162 88L168 107Z" fill="#1D1D1F"/>
<g fill="none" stroke="#0A84FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
<g class="comp"><path d="M96 81H134M128 75L134 81L128 87"/></g><g class="trac"><path d="M224 81H186M192 75L186 81L192 87"/></g></g>
<g fill="none" stroke="#FF3B30" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
<g class="trac"><path d="M134 121H96M102 115L96 121L102 127"/></g><g class="comp"><path d="M186 121H224M218 115L224 121L218 127"/></g></g>
<text class="txt t1" x="160" y="150" text-anchor="middle" fill="#B3261E">traction : acier</text>
<text class="txt t2" x="160" y="150" text-anchor="middle" fill="#B3261E">sans acier, le béton se fissure</text>
</svg>`,
  },
  triangulation: {
    legende: 'Poussé, le carré articulé se déforme sans changer ses côtés ; le triangle, lui, garde sa forme.',
    alt: 'À gauche, un carré fait de quatre barres articulées aux coins ; à droite, un triangle de barres articulées. Une flèche orange pousse le haut de chaque forme vers la droite. Le carré s’aplatit en losange penché (ses côtés gardent leur longueur), le contour pointillé montre sa forme de départ. Le triangle ne bouge pas. La poussée cesse, le carré se redresse, puis on pousse de nouveau.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-structures-triangulation">
<style>
.a-structures-triangulation .txt{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-structures-triangulation .b{stroke:#3A3A3C;stroke-width:6;stroke-linecap:round}
.a-structures-triangulation .j{fill:#fff;stroke:#3A3A3C;stroke-width:2.5}
.a-structures-triangulation .cg{transform-origin:40px 140px;transform:rotate(30deg);animation:a-structures-triangulation-c 8s ease-in-out infinite}
.a-structures-triangulation .cd{transform-origin:120px 140px;transform:rotate(30deg);animation:a-structures-triangulation-c 8s ease-in-out infinite}
.a-structures-triangulation .haut{transform:translate(40px,10.7px);animation:a-structures-triangulation-h 8s ease-in-out infinite}
.a-structures-triangulation .pousse{animation:a-structures-triangulation-p 8s ease-in-out infinite}
@keyframes a-structures-triangulation-c{0%,30%{transform:rotate(30deg)}46%,66%{transform:rotate(0deg)}82%,100%{transform:rotate(30deg)}}
@keyframes a-structures-triangulation-h{0%,30%{transform:translate(40px,10.7px)}46%,66%{transform:translate(0,0)}82%,100%{transform:translate(40px,10.7px)}}
@keyframes a-structures-triangulation-p{0%,30%{opacity:1}36%,60%{opacity:0}66%,100%{opacity:1}}
</style>
<path d="M40 60H120V140H40Z" fill="none" stroke="#8E8E93" stroke-width="2" stroke-dasharray="5 4"/>
<path d="M10 152H310" stroke="#3A3A3C" stroke-width="4" stroke-linecap="round"/>
<path d="M40 140L32 152H48ZM120 140L112 152H128ZM200 140L192 152H208ZM280 140L272 152H288Z" fill="#8E8E93"/>
<line class="b cg" x1="40" y1="140" x2="40" y2="60"/><line class="b cd" x1="120" y1="140" x2="120" y2="60"/>
<line class="b" x1="40" y1="140" x2="120" y2="140"/>
<g class="haut"><line class="b" x1="40" y1="60" x2="120" y2="60"/><circle class="j" cx="40" cy="60" r="5"/><circle class="j" cx="120" cy="60" r="5"/>
<g class="pousse"><path d="M4 60H30" stroke="#FF9F0A" stroke-width="4" stroke-linecap="round"/><path d="M28 53L38 60L28 67Z" fill="#FF9F0A"/></g></g>
<circle class="j" cx="40" cy="140" r="5"/><circle class="j" cx="120" cy="140" r="5"/>
<path class="b" d="M200 140H280L240 70.7Z" fill="none" stroke-linejoin="round"/>
<circle class="j" cx="200" cy="140" r="5"/><circle class="j" cx="280" cy="140" r="5"/><circle class="j" cx="240" cy="70.7" r="5"/>
<g class="pousse"><path d="M200 70.7H226" stroke="#FF9F0A" stroke-width="4" stroke-linecap="round"/><path d="M224 63.7L234 70.7L224 77.7Z" fill="#FF9F0A"/></g>
<text class="txt" x="80" y="172" text-anchor="middle">se déforme</text>
<text class="txt" x="240" y="172" text-anchor="middle">indéformable</text>
</svg>`,
  },
};
