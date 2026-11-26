/* Animations des fiches : lumière. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-lum-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  propagation: {
    legende: 'Trous alignés : la lumière passe en ligne droite. Un carton décalé : elle est arrêtée.',
    alt: 'Une lampe éclaire un écran à travers trois cartons percés d’un trou. Tant que les trous sont alignés, la lumière va tout droit jusqu’à l’écran, où une tache s’allume. Puis le carton du milieu monte : la lumière s’arrête sur lui et l’écran reste sombre, car elle ne peut pas contourner l’obstacle. Le carton redescend et la lumière passe de nouveau.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-lum-propagation">
<style>
.a-lum-propagation .r{stroke:#FFD60A;stroke-width:7;stroke-linecap:round}
.a-lum-propagation .p{stroke:#FF9F0A;stroke-width:7;stroke-dasharray:6 18;animation:a-lum-propagation-p 8s linear infinite}
.a-lum-propagation .c{fill:#3A3A3C}
.a-lum-propagation .c2{animation:a-lum-propagation-c2 8s ease-in-out infinite}
.a-lum-propagation .ap{animation:a-lum-propagation-ap 8s ease-in-out infinite}
.a-lum-propagation .bl{opacity:0;animation:a-lum-propagation-bl 8s ease-in-out infinite}
.a-lum-propagation .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
@keyframes a-lum-propagation-p{to{stroke-dashoffset:-480}}
@keyframes a-lum-propagation-c2{0%,38%{transform:none}50%,84%{transform:translateY(-24px)}96%,100%{transform:none}}
@keyframes a-lum-propagation-ap{0%,42%{opacity:1}46%,90%{opacity:0}94%,100%{opacity:1}}
@keyframes a-lum-propagation-bl{0%,42%{opacity:0}46%,90%{opacity:1}94%,100%{opacity:0}}
</style>
<circle cx="30" cy="85" r="22" fill="#FFD60A" opacity=".35"/><line class="r" x1="40" y1="85" x2="168" y2="85"/><line class="p" x1="45" y1="85" x2="168" y2="85"/><g class="ap"><line class="r" x1="165" y1="85" x2="287" y2="85"/><line class="p" x1="165" y1="85" x2="287" y2="85"/></g>
<g class="c"><rect x="105" y="34" width="6" height="44" rx="2"/><rect x="105" y="92" width="6" height="44" rx="2"/><rect x="225" y="34" width="6" height="44" rx="2"/><rect x="225" y="92" width="6" height="44" rx="2"/></g><g class="c c2"><rect x="165" y="34" width="6" height="44" rx="2"/><rect x="165" y="92" width="6" height="44" rx="2"/></g>
<ellipse class="bl" cx="163" cy="85" rx="3" ry="6" fill="#FFD60A" stroke="#FF9F0A" stroke-width="2"/><rect x="290" y="30" width="9" height="110" rx="3" fill="#fff" stroke="#3A3A3C" stroke-width="3"/><ellipse class="ap" cx="290" cy="85" rx="4" ry="9" fill="#FFD60A" stroke="#FF9F0A" stroke-width="2"/><circle cx="30" cy="85" r="12" fill="#FFD60A" stroke="#FF9F0A" stroke-width="3"/>
<text class="t ap" x="160" y="166" text-anchor="middle">trous alignés : la lumière passe</text><text class="t bl" x="160" y="166" text-anchor="middle">carton décalé : la lumière est arrêtée</text>
</svg>`,
  },
  ombre: {
    legende: 'L’ombre est la zone que la lumière n’atteint pas : plus l’objet est près de la lampe, plus elle est grande.',
    alt: 'Une petite lampe éclaire un écran. Un ballon placé entre les deux arrête la lumière : derrière lui, une zone grise sans lumière, l’ombre, va jusqu’à l’écran, limitée par deux rayons rectilignes qui frôlent le ballon. Le ballon se rapproche de la lampe et l’ombre sur l’écran s’agrandit, puis il s’éloigne et l’ombre rétrécit.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-lum-ombre">
<style>
.a-lum-ombre .cone{fill:#6E6E73;transform-origin:40px 90px;transform:scaleY(.5929);animation:a-lum-ombre-c 8s linear infinite}
.a-lum-ombre .bord{fill:none;stroke:#FF9F0A;stroke-width:2;transform-origin:40px 90px;transform:scaleY(.5929);animation:a-lum-ombre-c 8s linear infinite}
.a-lum-ombre .ecr{fill:#1D1D1F;transform-origin:294px 90px;transform:scaleY(.5929);animation:a-lum-ombre-c 8s linear infinite}
.a-lum-ombre .lum{fill:#FFF3B0;transform-origin:40px 90px;transform:scale(.2462,.146);animation:a-lum-ombre-l 8s linear infinite}
.a-lum-ombre .obj{animation:a-lum-ombre-b 8s linear infinite}
.a-lum-ombre .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-lum-ombre .pres{animation:a-lum-ombre-p 8s ease-in-out infinite}
.a-lum-ombre .loin{opacity:0;animation:a-lum-ombre-f 8s ease-in-out infinite}
@keyframes a-lum-ombre-p{0%,30%{opacity:0}40%,64%{opacity:1}74%,100%{opacity:0}}
@keyframes a-lum-ombre-f{0%,30%{opacity:1}40%,64%{opacity:0}74%,100%{opacity:1}}
@keyframes a-lum-ombre-b{0%{transform:translateX(95px)}10%{transform:translateX(95px)}15%{transform:translateX(89.74px)}20%{transform:translateX(76.17px)}25%{transform:translateX(57.61px)}30%{transform:translateX(37.39px)}35%{transform:translateX(18.83px)}40%{transform:translateX(5.26px)}45%{transform:translateX(0px)}60%{transform:translateX(0px)}65%{transform:translateX(7.04px)}70%{transform:translateX(24.63px)}75%{transform:translateX(47.5px)}80%{transform:translateX(70.37px)}85%{transform:translateX(87.96px)}90%{transform:translateX(95px)}100%{transform:translateX(95px)}}
@keyframes a-lum-ombre-c{0%{transform:scaleY(.2354)}10%{transform:scaleY(.2354)}15%{transform:scaleY(.2435)}20%{transform:scaleY(.2672)}25%{transform:scaleY(.3082)}30%{transform:scaleY(.3702)}35%{transform:scaleY(.4546)}40%{transform:scaleY(.5463)}45%{transform:scaleY(.5929)}60%{transform:scaleY(.5929)}65%{transform:scaleY(.5322)}70%{transform:scaleY(.4244)}75%{transform:scaleY(.3363)}80%{transform:scaleY(.2787)}85%{transform:scaleY(.2463)}90%{transform:scaleY(.2354)}100%{transform:scaleY(.2354)}}
@keyframes a-lum-ombre-l{0%{transform:scale(.6344,.1493)}10%{transform:scale(.6344,.1493)}15%{transform:scale(.6131,.1493)}20%{transform:scale(.5583,.1492)}25%{transform:scale(.4831,.1489)}30%{transform:scale(.4008,.1484)}35%{transform:scale(.3246,.1476)}40%{transform:scale(.2682,.1465)}45%{transform:scale(.2462,.146)}60%{transform:scale(.2462,.146)}65%{transform:scale(.2757,.1467)}70%{transform:scale(.3485,.1479)}75%{transform:scale(.442,.1487)}80%{transform:scale(.5348,.1491)}85%{transform:scale(.606,.1493)}90%{transform:scale(.6344,.1493)}100%{transform:scale(.6344,.1493)}}
</style>
<path d="M40 90 L290 8 V172Z" fill="#FFF3B0"/><path class="cone" d="M40 90 L290 -10 V190Z"/><path class="lum" d="M40 90 L290 -10 V190Z"/><path class="bord" d="M290 -10 L40 90 L290 190" vector-effect="non-scaling-stroke"/>
<rect x="290" y="10" width="9" height="160" rx="3" fill="#fff" stroke="#3A3A3C" stroke-width="3"/><rect class="ecr" x="290" y="-10" width="9" height="200"/><circle class="obj" cx="105" cy="90" r="15" fill="#FF9F0A" stroke="#3A3A3C" stroke-width="3"/><circle cx="40" cy="90" r="8" fill="#FFD60A" stroke="#FF9F0A" stroke-width="3"/>
<text x="262" y="95" text-anchor="middle" style="font:700 13px -apple-system,system-ui,sans-serif" fill="#fff">ombre</text><text class="t pres" x="150" y="22" text-anchor="middle">près de la lampe : grande ombre</text><text class="t loin" x="150" y="22" text-anchor="middle">loin de la lampe : petite ombre</text>
</svg>`,
  },
  refraction: {
    legende: 'En passant de l’air à l’eau, la lumière ralentit et se rapproche de la normale.',
    alt: 'Un rayon de lumière descend de l’air vers l’eau. À la surface, il change de direction et se rapproche de la normale, la ligne pointillée perpendiculaire à la surface ; un pointillé gris montre où il serait allé tout droit. Des traits clairs avancent le long du rayon : dans l’eau, ils vont moins vite et se resserrent, car la lumière ralentit.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-lum-refraction">
<style>
.a-lum-refraction .r{fill:none;stroke:#FF9F0A;stroke-width:5;stroke-linecap:round}
.a-lum-refraction .pa{fill:none;stroke:#fff;stroke-width:3;stroke-dasharray:8 16;animation:a-lum-refraction-a 8s linear infinite}
.a-lum-refraction .pw{fill:none;stroke:#fff;stroke-width:3;stroke-dasharray:6.02 12.03;stroke-dashoffset:9.2;animation:a-lum-refraction-w 8s linear infinite}
.a-lum-refraction .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
@keyframes a-lum-refraction-a{to{stroke-dashoffset:-288}}
@keyframes a-lum-refraction-w{from{stroke-dashoffset:9.2}to{stroke-dashoffset:-207.34}}
.a-lum-refraction .ph{fill:#FFD60A;stroke:#FF3B30;stroke-width:2.5;offset-path:path('M48.7 10 L150 95 L208.5 178');offset-rotate:0deg;offset-distance:var(--d0);animation:a-lum-refraction-ph 8s linear infinite}
@keyframes a-lum-refraction-ph{0%{offset-distance:0%;opacity:1}24.24%{offset-distance:56.57%}49%{offset-distance:100%;opacity:1}50%,100%{offset-distance:100%;opacity:0}}
</style>
<rect x="0" y="95" width="320" height="85" fill="#BFDFFF"/><line x1="0" y1="95" x2="320" y2="95" stroke="#0A84FF" stroke-width="3"/>
<line x1="150" y1="14" x2="150" y2="176" stroke="#3A3A3C" stroke-width="2" stroke-dasharray="6 5"/><line x1="150" y1="95" x2="248.9" y2="178" stroke="#636366" stroke-width="2" stroke-dasharray="2 5"/>
<path d="M150 65 A30 30 0 0 0 127 75.7" fill="none" stroke="#AF52DE" stroke-width="3"/><path d="M150 125 A30 30 0 0 0 167.3 119.5" fill="none" stroke="#AF52DE" stroke-width="3"/>
<path class="r" d="M48.7 10 L150 95 L208.5 178" stroke-linejoin="round"/><line class="pa" x1="48.7" y1="10" x2="150" y2="95"/><line class="pw" x1="150" y1="95" x2="208.48" y2="178"/>
<circle class="ph" r="6" style="--d0:10%"/><circle class="ph" r="6" style="--d0:89%;animation-delay:-4s"/><path d="M99.6 52.7 L85.3 48 L92.5 39.5Z" fill="#FF3B30"/><path d="M186.2 146.4 L173.6 138.2 L182.7 131.7Z" fill="#FF3B30"/>
<text class="t" x="156" y="26">normale</text><text class="t" x="300" y="84" text-anchor="end">air</text><text class="t" x="300" y="116" text-anchor="end">eau</text>
</svg>`,
  },
  couleurs: {
    legende: 'Le prisme étale la lumière blanche en spectre : le violet est le plus dévié, le rouge le moins.',
    alt: 'Un faisceau de lumière blanche entre dans un prisme de verre. Il en ressort étalé en six couleurs qui arrivent sur un écran : de haut en bas rouge, orange, jaune, vert, bleu et violet. Le rouge est le moins dévié, le violet le plus dévié. L’ensemble s’efface puis le faisceau repart.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-lum-couleurs">
<style>
.a-lum-couleurs .d{stroke-dasharray:100 100}
.a-lum-couleurs .bl{fill:none;stroke-linecap:round;animation:a-lum-couleurs-b 8s ease-in-out infinite}
.a-lum-couleurs .in line{stroke-width:2;animation:a-lum-couleurs-i 8s ease-in-out infinite}
.a-lum-couleurs .out line{stroke-width:4;animation:a-lum-couleurs-o 8s ease-in-out infinite}
.a-lum-couleurs .sp{animation:a-lum-couleurs-s 8s ease-in-out infinite}
.a-lum-couleurs .tout{animation:a-lum-couleurs-g 8s ease-in-out infinite}
.a-lum-couleurs .t{font:700 12px -apple-system,system-ui,sans-serif}
@keyframes a-lum-couleurs-b{0%{stroke-dashoffset:100}12%,100%{stroke-dashoffset:0}}
@keyframes a-lum-couleurs-i{0%,11%{stroke-dashoffset:100}16%,100%{stroke-dashoffset:0}}
@keyframes a-lum-couleurs-o{0%,16%{stroke-dashoffset:100}30%,100%{stroke-dashoffset:0}}
@keyframes a-lum-couleurs-s{0%,26%{opacity:0}32%,100%{opacity:1}}
@keyframes a-lum-couleurs-g{0%,86%{opacity:1}95%,100%{opacity:0}}
</style>
<path d="M150 25 L208 130 H92Z" fill="#EAF4FF" stroke="#3A3A3C" stroke-width="3" stroke-linejoin="round"/>
<g class="tout"><line class="bl d" pathLength="100" x1="8" y1="104" x2="118.1" y2="82.8" stroke="#3A3A3C" stroke-width="9"/><line class="bl d" pathLength="100" x1="8" y1="104" x2="118.1" y2="82.8" stroke="#fff" stroke-width="5"/>
<g class="in"><line class="d" pathLength="100" x1="118.1" y1="82.8" x2="179" y2="77.5" stroke="#FF3B30"/><line class="d" pathLength="100" x1="118.1" y1="82.8" x2="180.7" y2="80.7" stroke="#FF9F0A"/><line class="d" pathLength="100" x1="118.1" y1="82.8" x2="182.5" y2="83.8" stroke="#FFD60A"/><line class="d" pathLength="100" x1="118.1" y1="82.8" x2="184.2" y2="86.9" stroke="#34C759"/><line class="d" pathLength="100" x1="118.1" y1="82.8" x2="186" y2="90.1" stroke="#0A84FF"/><line class="d" pathLength="100" x1="118.1" y1="82.8" x2="187.7" y2="93.2" stroke="#AF52DE"/></g>
<g class="out"><line class="d" pathLength="100" x1="179" y1="77.5" x2="299" y2="96.7" stroke="#FF3B30"/><line class="d" pathLength="100" x1="180.7" y1="80.7" x2="299" y2="107.6" stroke="#FF9F0A"/><line class="d" pathLength="100" x1="182.5" y1="83.8" x2="299" y2="118.3" stroke="#FFD60A"/><line class="d" pathLength="100" x1="184.2" y1="86.9" x2="299" y2="128.7" stroke="#34C759"/><line class="d" pathLength="100" x1="186" y1="90.1" x2="299" y2="138.9" stroke="#0A84FF"/><line class="d" pathLength="100" x1="187.7" y1="93.2" x2="299" y2="148.9" stroke="#AF52DE"/></g>
<g class="sp"><rect x="299" y="91.7" width="9" height="10" fill="#FF3B30"/><rect x="299" y="102.6" width="9" height="10" fill="#FF9F0A"/><rect x="299" y="113.3" width="9" height="10" fill="#FFD60A"/><rect x="299" y="123.7" width="9" height="10" fill="#34C759"/><rect x="299" y="133.9" width="9" height="10" fill="#0A84FF"/><rect x="299" y="143.9" width="9" height="10" fill="#AF52DE"/></g></g><rect x="299" y="88" width="9" height="78" rx="2" fill="none" stroke="#3A3A3C" stroke-width="2"/>
<text class="t" x="8" y="70" fill="#1D1D1F">lumière blanche</text><text class="t" x="311" y="46" text-anchor="end" fill="#B3261E">rouge : le moins dévié</text><text class="t" x="311" y="176" text-anchor="end" fill="#7B2CBF">violet : le plus dévié</text>
</svg>`,
  },
};
