/* Animations des fiches : électricité. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-elec-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  circuit: {
    legende: 'Interrupteur fermé : le courant fait le tour. Ouvert : la boucle est coupée, tout s’arrête.',
    alt: 'Un circuit avec une pile, une lampe et un interrupteur. Quand l’interrupteur se ferme, des points lumineux font le tour du circuit et la lampe s’allume ; quand il s’ouvre, ils s’arrêtent et la lampe s’éteint.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-elec-circuit">
<style>
.a-elec-circuit .fil{fill:none;stroke:#3A3A3C;stroke-width:4;stroke-linejoin:round}
.a-elec-circuit .e{fill:#FF9F0A;offset-path:path('M60 120 V40 H260 V140 H60 Z');offset-rotate:0deg;offset-distance:var(--d0);animation:a-elec-circuit-tour 8s linear infinite,a-elec-circuit-pale 8s ease-in-out infinite}
.a-elec-circuit .lame{transform-origin:130px 140px;animation:a-elec-circuit-lame 8s ease-in-out infinite}
.a-elec-circuit .halo{opacity:.85;animation:a-elec-circuit-halo 8s ease-in-out infinite}
.a-elec-circuit .ampoule{fill:#FFD60A;animation:a-elec-circuit-ampoule 8s ease-in-out infinite}
.a-elec-circuit .etat{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-elec-circuit .ouvert{opacity:0;animation:a-elec-circuit-txt1 8s steps(1) infinite}
.a-elec-circuit .ferme{animation:a-elec-circuit-txt2 8s steps(1) infinite}
@keyframes a-elec-circuit-lame{0%,8%{transform:rotate(-28deg)}14%,62%{transform:rotate(0deg)}68%,100%{transform:rotate(-28deg)}}
@keyframes a-elec-circuit-halo{0%,13%{opacity:0}17%,61%{opacity:.85}64%,100%{opacity:0}}
@keyframes a-elec-circuit-ampoule{0%,13%{fill:#E5E5EA}17%,61%{fill:#FFD60A}64%,100%{fill:#E5E5EA}}
@keyframes a-elec-circuit-tour{0%,14%{offset-distance:var(--d0)}62%,100%{offset-distance:calc(var(--d0) + 50%)}}
@keyframes a-elec-circuit-txt1{0%{opacity:1}14%{opacity:0}65%{opacity:1}}
@keyframes a-elec-circuit-pale{0%,12%{opacity:.35}16%,62%{opacity:1}66%,100%{opacity:.35}}
@keyframes a-elec-circuit-txt2{0%{opacity:0}14%{opacity:1}65%{opacity:0}}
</style>
<path class="fil" d="M60 120 V40 H260 V140 H170"/><path class="fil" d="M130 140 H60 V120"/>
<g><rect x="40" y="62" width="40" height="50" rx="6" fill="#1D1D1F"/><rect x="52" y="56" width="16" height="7" rx="2" fill="#1D1D1F"/>
<text x="60" y="84" text-anchor="middle" font-size="13" font-weight="800" fill="#FFD60A" font-family="-apple-system,system-ui,sans-serif">+</text>
<text x="60" y="104" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="-apple-system,system-ui,sans-serif">−</text></g>
<g><circle class="halo" cx="200" cy="40" r="24" fill="#FFD60A"/><circle class="ampoule" cx="200" cy="40" r="13" stroke="#3A3A3C" stroke-width="3"/></g>
<circle cx="130" cy="140" r="5" fill="#3A3A3C"/><circle cx="170" cy="140" r="5" fill="#3A3A3C"/>
<line class="lame" x1="130" y1="140" x2="170" y2="140" stroke="#3A3A3C" stroke-width="5" stroke-linecap="round"/>
<g>${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((d) => `<circle class="e" r="4.5" style="--d0:${d}%"/>`).join('')}</g>
<text class="etat ouvert" x="150" y="172" text-anchor="middle">interrupteur ouvert : boucle coupée</text>
<text class="etat ferme" x="150" y="172" text-anchor="middle">interrupteur fermé : le courant circule</text>
</svg>`,
  },
  serie: {
    legende: 'Un seul chemin : le même courant traverse les deux lampes. On en dévisse une : tout s’éteint.',
    alt: 'Une pile et deux lampes placées l’une après l’autre sur une seule boucle. Des points lumineux font le tour au même rythme partout et les deux lampes brillent faiblement. Puis une lampe est dévissée : la boucle est coupée, les points s’arrêtent et l’autre lampe s’éteint aussi. La lampe est revissée et tout se rallume.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-elec-serie">
<style>
.a-elec-serie .fil{fill:none;stroke:#3A3A3C;stroke-width:4;stroke-linejoin:round}
.a-elec-serie .e{fill:#FF9F0A;offset-path:path('M60 120 V40 H260 V140 H60 Z');offset-rotate:0deg;offset-distance:var(--d0);animation:a-elec-serie-tour 8s linear infinite,a-elec-serie-pale 8s ease-in-out infinite}
.a-elec-serie .halo{fill:#FFD60A;opacity:.5;animation:a-elec-serie-halo 8s ease-in-out infinite}
.a-elec-serie .amp{fill:#FFE066;stroke:#3A3A3C;stroke-width:3;animation:a-elec-serie-amp 8s ease-in-out infinite}
.a-elec-serie .ote{transform-box:fill-box;transform-origin:center;animation:a-elec-serie-ote 8s ease-in-out infinite}
.a-elec-serie .b{font:800 13px -apple-system,system-ui,sans-serif}
.a-elec-serie .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-elec-serie .t1{animation:a-elec-serie-t1 8s steps(1) infinite}
.a-elec-serie .t2{opacity:0;animation:a-elec-serie-t2 8s steps(1) infinite}
@keyframes a-elec-serie-tour{0%{offset-distance:var(--d0)}48%,88%{offset-distance:calc(var(--d0) + 40%)}100%{offset-distance:calc(var(--d0) + 50%)}}
@keyframes a-elec-serie-pale{0%,47%{opacity:1}52%,86%{opacity:.35}89%,100%{opacity:1}}
@keyframes a-elec-serie-halo{0%,47%{opacity:.5}51%,86%{opacity:0}89%,100%{opacity:.5}}
@keyframes a-elec-serie-amp{0%,47%{fill:#FFE066}51%,86%{fill:#E5E5EA}89%,100%{fill:#FFE066}}
@keyframes a-elec-serie-ote{0%,46%{transform:none}55%,77%{transform:translate(6px,-22px) rotate(-25deg)}86%,100%{transform:none}}
@keyframes a-elec-serie-t1{0%{opacity:1}50%{opacity:0}88%{opacity:1}}
@keyframes a-elec-serie-t2{0%{opacity:0}50%{opacity:1}88%{opacity:0}}
</style>
<circle class="halo" cx="130" cy="40" r="20"/>
<path class="fil" d="M60 120 V40 H117 M143 40 H187 M213 40 H260 V140 H60 V120"/>
<circle class="amp" cx="130" cy="40" r="13"/>
<g class="ote"><circle class="halo" cx="200" cy="40" r="20"/><circle class="amp" cx="200" cy="40" r="13"/></g>
<g>${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((d) => `<circle class="e" r="4.5" style="--d0:${d}%"/>`).join('')}</g>
<g><rect x="40" y="62" width="40" height="50" rx="6" fill="#1D1D1F"/><rect x="52" y="56" width="16" height="7" rx="2" fill="#1D1D1F"/>
<text x="60" y="84" text-anchor="middle" class="b" fill="#FFD60A">+</text>
<text x="60" y="104" text-anchor="middle" class="b" fill="#fff">−</text></g>
<text class="t t1" x="160" y="172" text-anchor="middle">un seul chemin : même courant partout</text>
<text class="t t2" x="160" y="172" text-anchor="middle">une lampe dévissée : tout s’éteint</text>
</svg>`,
  },
  parallele: {
    legende: 'Chaque lampe a sa propre branche : on en retire une, l’autre reste allumée aussi fort.',
    alt: 'Une pile alimente deux lampes placées chacune sur sa propre branche. Des points lumineux partent de la borne plus, se partagent entre les deux branches et se rejoignent avant la borne moins : ils sont deux fois plus nombreux dans le fil commun. Puis la lampe de droite est retirée : sa branche s’arrête, mais la lampe de gauche reste allumée aussi fort. La lampe revient.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-elec-parallele">
<style>
.a-elec-parallele .fil{fill:none;stroke:#3A3A3C;stroke-width:4;stroke-linejoin:round}
.a-elec-parallele .e{fill:#FF9F0A;offset-rotate:0deg;offset-distance:var(--d0)}
.a-elec-parallele .ea{offset-path:path('M40 150 V30 H160 V150 Z');animation:a-elec-parallele-ta 8s linear infinite}
.a-elec-parallele .eb{offset-path:path('M40 150 V30 H280 V150 Z');animation:a-elec-parallele-tb 8s linear infinite,a-elec-parallele-vb 8s ease-in-out infinite}
.a-elec-parallele .halo{fill:#FFD60A;opacity:.85}
.a-elec-parallele .amp{fill:#FFD60A;stroke:#3A3A3C;stroke-width:3}
.a-elec-parallele .ote .halo{animation:a-elec-parallele-halo 8s ease-in-out infinite}
.a-elec-parallele .ote .amp{animation:a-elec-parallele-amp 8s ease-in-out infinite}
.a-elec-parallele .ote{transform-box:fill-box;transform-origin:center;animation:a-elec-parallele-ote 8s ease-in-out infinite}
.a-elec-parallele .b{font:800 13px -apple-system,system-ui,sans-serif}
.a-elec-parallele .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-elec-parallele .t1{animation:a-elec-parallele-t1 8s steps(1) infinite}
.a-elec-parallele .t2{opacity:0;animation:a-elec-parallele-t2 8s steps(1) infinite}
@keyframes a-elec-parallele-ta{to{offset-distance:calc(var(--d0) + 100%)}}
@keyframes a-elec-parallele-tb{to{offset-distance:calc(var(--d0) + 66.6667%)}}
@keyframes a-elec-parallele-vb{0%,45%{opacity:1}50%,86%{opacity:0}90%,100%{opacity:1}}
@keyframes a-elec-parallele-halo{0%,45%{opacity:.85}49%,86%{opacity:0}90%,100%{opacity:.85}}
@keyframes a-elec-parallele-amp{0%,45%{fill:#FFD60A}49%,86%{fill:#E5E5EA}90%,100%{fill:#FFD60A}}
@keyframes a-elec-parallele-ote{0%,44%{transform:none}53%,78%{transform:translate(20px,-4px) rotate(25deg)}87%,100%{transform:none}}
@keyframes a-elec-parallele-t1{0%{opacity:1}49%{opacity:0}88%{opacity:1}}
@keyframes a-elec-parallele-t2{0%{opacity:0}49%{opacity:1}88%{opacity:0}}
</style>
<circle class="halo" cx="160" cy="90" r="22"/>
<path class="fil" d="M40 150 V30 H280 V77 M280 103 V150 H40 M160 30 V77 M160 103 V150"/>
<circle cx="160" cy="30" r="5" fill="#3A3A3C"/><circle cx="160" cy="150" r="5" fill="#3A3A3C"/>
<circle class="amp" cx="160" cy="90" r="13"/>
<g class="ote"><circle class="halo" cx="280" cy="90" r="22"/><circle class="amp" cx="280" cy="90" r="13"/></g>
<g>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<circle class="e ea" r="4.5" style="--d0:${k * 12.5}%"/>`).join('')}${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => `<circle class="e eb" r="4.5" style="--d0:${((30 + 60 * k) / 7.2).toFixed(2)}%"/>`).join('')}</g>
<g><rect x="20" y="65" width="40" height="50" rx="6" fill="#1D1D1F"/><rect x="32" y="59" width="16" height="7" rx="2" fill="#1D1D1F"/>
<text x="40" y="87" text-anchor="middle" class="b" fill="#FFD60A">+</text>
<text x="40" y="107" text-anchor="middle" class="b" fill="#fff">−</text></g>
<text class="t t1" x="160" y="172" text-anchor="middle">chaque lampe a son propre chemin</text>
<text class="t t2" x="160" y="172" text-anchor="middle">une lampe retirée : l’autre reste allumée</text>
</svg>`,
  },
  materiaux: {
    legende: 'Le cuivre laisse passer le courant : la lampe brille. Le plastique le bloque : tout s’arrête.',
    alt: 'Un circuit avec une pile, une lampe et deux pinces. Une barre de cuivre est serrée entre les pinces : des points lumineux font le tour et la lampe brille. Puis la barre glisse et c’est une barre de plastique qui se retrouve entre les pinces : les points s’arrêtent et la lampe s’éteint. Le cuivre revient et la lampe se rallume.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-elec-materiaux">
<style>
.a-elec-materiaux .fil{fill:none;stroke:#3A3A3C;stroke-width:4;stroke-linejoin:round}
.a-elec-materiaux .e{fill:#FF9F0A;offset-path:path('M60 150 V60 H260 V150 Z');offset-rotate:0deg;offset-distance:var(--d0);animation:a-elec-materiaux-tour 8s linear infinite,a-elec-materiaux-pale 8s ease-in-out infinite}
.a-elec-materiaux .barre{animation:a-elec-materiaux-glisse 8s ease-in-out infinite}
.a-elec-materiaux .halo{fill:#FFD60A;opacity:.85;animation:a-elec-materiaux-halo 8s ease-in-out infinite}
.a-elec-materiaux .amp{fill:#FFD60A;stroke:#3A3A3C;stroke-width:3;animation:a-elec-materiaux-amp 8s ease-in-out infinite}
.a-elec-materiaux .b{font:800 13px -apple-system,system-ui,sans-serif}
.a-elec-materiaux .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-elec-materiaux .nom{font:700 12px -apple-system,system-ui,sans-serif}
.a-elec-materiaux .t1{animation:a-elec-materiaux-t1 8s steps(1) infinite}
.a-elec-materiaux .t2{opacity:0;animation:a-elec-materiaux-t2 8s steps(1) infinite}
@keyframes a-elec-materiaux-tour{0%{offset-distance:var(--d0)}44%,100%{offset-distance:calc(var(--d0) + 40%)}}
@keyframes a-elec-materiaux-pale{0%,44%{opacity:1}48%,94%{opacity:.35}98%,100%{opacity:1}}
@keyframes a-elec-materiaux-glisse{0%,43%{transform:none}52%,86%{transform:translateY(32px)}95%,100%{transform:none}}
@keyframes a-elec-materiaux-halo{0%,44%{opacity:.85}47%,95%{opacity:0}98%,100%{opacity:.85}}
@keyframes a-elec-materiaux-amp{0%,44%{fill:#FFD60A}47%,95%{fill:#E5E5EA}98%,100%{fill:#FFD60A}}
@keyframes a-elec-materiaux-t1{0%{opacity:1}48%{opacity:0}96%{opacity:1}}
@keyframes a-elec-materiaux-t2{0%{opacity:0}48%{opacity:1}96%{opacity:0}}
</style>
<circle class="halo" cx="260" cy="105" r="24"/>
<path class="fil" d="M60 150 V60 H125 M195 60 H260 V92 M260 118 V150 H60"/>
<g>${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((d) => `<circle class="e" r="4.5" style="--d0:${d}%"/>`).join('')}</g>
<g class="barre"><rect x="126" y="52" width="68" height="16" rx="4" fill="#9A3412"/><text class="nom" x="160" y="64.5" text-anchor="middle" fill="#fff">cuivre</text></g>
<g class="barre"><rect x="126" y="20" width="68" height="16" rx="4" fill="#E5E5EA" stroke="#3A3A3C" stroke-width="2"/><text class="nom" x="160" y="32.5" text-anchor="middle" fill="#1D1D1F">plastique</text></g>
<circle cx="125" cy="60" r="5" fill="#3A3A3C"/><circle cx="195" cy="60" r="5" fill="#3A3A3C"/>
<circle class="amp" cx="260" cy="105" r="13"/>
<g><rect x="40" y="82" width="40" height="50" rx="6" fill="#1D1D1F"/><rect x="52" y="76" width="16" height="7" rx="2" fill="#1D1D1F"/>
<text x="60" y="104" text-anchor="middle" class="b" fill="#FFD60A">+</text>
<text x="60" y="124" text-anchor="middle" class="b" fill="#fff">−</text></g>
<text class="t t1" x="160" y="173" text-anchor="middle">cuivre : conducteur, le courant passe</text>
<text class="t t2" x="160" y="173" text-anchor="middle">plastique : isolant, courant bloqué</text>
</svg>`,
  },
  securite: {
    legende: 'Un fil relie directement les bornes : le courant devient énorme, le fil chauffe et le fusible coupe tout.',
    alt: 'Une pile, un fusible et une lampe allumée. Un fil vient relier les deux côtés du circuit sans passer par la lampe : la lampe s’éteint, le courant fonce dans cette petite boucle, le fil et la pile chauffent. Puis le fil du fusible fond : tout s’arrête. On retire le fil et on change le fusible.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-elec-securite">
<style>
.a-elec-securite .fil{fill:none;stroke:#3A3A3C;stroke-width:4;stroke-linejoin:round}
.a-elec-securite .e{fill:#FF9F0A;offset-rotate:0deg;offset-distance:var(--d0)}
.a-elec-securite .eg{opacity:0;offset-path:path('M60 120 V40 H260 V140 H60 Z');animation:a-elec-securite-tg 8s linear infinite,a-elec-securite-vg 8s ease-in-out infinite}
.a-elec-securite .ec{offset-path:path('M60 120 V40 H200 V140 H60 Z');animation:a-elec-securite-tc 8s linear infinite,a-elec-securite-vc 8s ease-in-out infinite}
.a-elec-securite .halo{fill:#FFD60A;opacity:0;animation:a-elec-securite-halo 8s ease-in-out infinite}
.a-elec-securite .amp{fill:#E5E5EA;stroke:#3A3A3C;stroke-width:3;animation:a-elec-securite-amp 8s ease-in-out infinite}
.a-elec-securite .shunt{animation:a-elec-securite-shunt 8s ease-in-out infinite}
.a-elec-securite .sf{stroke:#FF3B30;animation:a-elec-securite-sf 8s ease-in-out infinite}
.a-elec-securite .chaud{opacity:.5;animation:a-elec-securite-chaud 8s ease-in-out infinite}
.a-elec-securite .fu{stroke:#3A3A3C;stroke-width:2.5;transform-box:fill-box;animation:a-elec-securite-fond 8s ease-in-out infinite,a-elec-securite-rougit 8s ease-in-out infinite}
.a-elec-securite .b{font:800 13px -apple-system,system-ui,sans-serif}
.a-elec-securite .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-elec-securite .t0{opacity:0;animation:a-elec-securite-t0 8s steps(1) infinite}
.a-elec-securite .t1{animation:a-elec-securite-t1 8s steps(1) infinite}
.a-elec-securite .t2{opacity:0;animation:a-elec-securite-t2 8s steps(1) infinite}
@keyframes a-elec-securite-tg{0%{offset-distance:var(--d0)}22%,100%{offset-distance:calc(var(--d0) + 25%)}}
@keyframes a-elec-securite-vg{0%,22%{opacity:1}22.6%,95%{opacity:0}99%,100%{opacity:1}}
@keyframes a-elec-securite-tc{0%,24%{offset-distance:var(--d0)}58%,100%{offset-distance:calc(var(--d0) + 100%)}}
@keyframes a-elec-securite-vc{0%,22%{opacity:0}23.5%,57%{opacity:1}61%,90%{opacity:.3}94%,100%{opacity:0}}
@keyframes a-elec-securite-halo{0%,22%{opacity:.85}22.6%,96%{opacity:0}99%,100%{opacity:.85}}
@keyframes a-elec-securite-amp{0%,22%{fill:#FFD60A}22.6%,96%{fill:#E5E5EA}99%,100%{fill:#FFD60A}}
@keyframes a-elec-securite-shunt{0%,15%{transform:translateY(-34px);opacity:0}22%,91%{transform:none;opacity:1}96%,100%{transform:translateY(-34px);opacity:0}}
@keyframes a-elec-securite-sf{0%,25%{stroke:#3A3A3C}40%,58%{stroke:#FF3B30}72%,100%{stroke:#3A3A3C}}
@keyframes a-elec-securite-chaud{0%,26%{opacity:0}42%,58%{opacity:.5}72%,100%{opacity:0}}
@keyframes a-elec-securite-fond{0%,58%{transform:none}61%,93%{transform:scaleX(.3)}97%,100%{transform:none}}
@keyframes a-elec-securite-rougit{0%,40%{stroke:#3A3A3C}52%,58%{stroke:#FF3B30}61%,100%{stroke:#3A3A3C}}
@keyframes a-elec-securite-t0{0%{opacity:1}22%{opacity:0}96%{opacity:1}}
@keyframes a-elec-securite-t1{0%{opacity:0}22%{opacity:1}59%{opacity:0}}
@keyframes a-elec-securite-t2{0%{opacity:0}59%{opacity:1}96%{opacity:0}}
</style>
<rect class="chaud" x="32" y="50" width="56" height="70" rx="12" fill="#FF9F0A"/>
<circle class="halo" cx="260" cy="90" r="24"/>
<path class="fil" d="M60 120 V40 H260 V77 M260 103 V140 H60 V120"/>
<rect x="94" y="32" width="32" height="16" rx="4" fill="#fff" stroke="#3A3A3C" stroke-width="2.5"/>
<line class="fu" x1="97" y1="40" x2="110" y2="40" style="transform-origin:left center"/><line class="fu" x1="110" y1="40" x2="123" y2="40" style="transform-origin:right center"/>
<g class="shunt"><line class="chaud" x1="200" y1="40" x2="200" y2="140" stroke="#FF9F0A" stroke-width="14" stroke-linecap="round"/><line class="sf" x1="200" y1="40" x2="200" y2="140" stroke-width="4"/><circle cx="200" cy="40" r="5" fill="#3A3A3C"/><circle cx="200" cy="140" r="5" fill="#3A3A3C"/></g>
<circle class="amp" cx="260" cy="90" r="13"/>
<g>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<circle class="e eg" r="4.5" style="--d0:${k * 12.5}%"/>`).join('')}${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => `<circle class="e ec" r="4.5" style="--d0:${(k * 100 / 12).toFixed(2)}%"/>`).join('')}</g>
<g><rect x="40" y="62" width="40" height="50" rx="6" fill="#1D1D1F"/><rect x="52" y="56" width="16" height="7" rx="2" fill="#1D1D1F"/>
<text x="60" y="84" text-anchor="middle" class="b" fill="#FFD60A">+</text>
<text x="60" y="104" text-anchor="middle" class="b" fill="#fff">−</text></g>
<text class="t" x="110" y="22" text-anchor="middle">fusible</text>
<text class="t t0" x="160" y="172" text-anchor="middle">circuit normal : la lampe brille</text>
<text class="t t1" x="160" y="172" text-anchor="middle">court-circuit : le fil chauffe !</text>
<text class="t t2" x="160" y="172" text-anchor="middle">le fusible fond : tout est coupé</text>
</svg>`,
  },
};
