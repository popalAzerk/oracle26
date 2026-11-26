/* Animations des fiches : matière. Format : voir assets/anim-fiche.js.
   Règles : CSS keyframes uniquement, classes préfixées a-mat-<fiche>, viewBox 320×180,
   l'état de base (sans animation) est une image fixe juste et lisible. */
window.ANIMS_FICHES = {
  etats: {
    legende: 'Mêmes particules, organisation différente : serrées et rangées, serrées en désordre, ou très éloignées.',
    alt: 'Trois boîtes contiennent les mêmes particules bleues. Dans le solide, elles sont serrées et rangées en lignes et vibrent sur place. Dans le liquide, elles restent serrées mais en désordre et glissent les unes sur les autres. Dans le gaz, elles sont très éloignées et filent vite d’une paroi à l’autre. Des flèches orange indiquent qu’on passe de l’un à l’autre en chauffant.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-mat-etats">
<style>
.a-mat-etats .b{fill:none;stroke:#3A3A3C;stroke-width:3}
.a-mat-etats .m{fill:#0A84FF;stroke:#0A4FA0;stroke-width:1.5}
.a-mat-etats .s{animation:a-mat-etats-v 8s linear infinite}
.a-mat-etats .lo{offset-path:path('M128 92 C150 84 170 96 192 88 C197 104 190 116 194 126 C170 130 150 122 128 127 C123 114 131 104 128 92Z');offset-rotate:0deg;offset-distance:var(--d0);animation:a-mat-etats-l 8s linear infinite}
.a-mat-etats .li{offset-path:path('M146 104 C143 108 145 111 144 114 C156 116 166 110 178 114 C177 110 180 107 178 104 C166 108 156 101 146 104Z');offset-rotate:0deg;offset-distance:var(--d0);animation:a-mat-etats-l 8s linear infinite}
.a-mat-etats .g{offset-rotate:0deg;offset-distance:var(--d0);animation:a-mat-etats-g 8s linear infinite}
.a-mat-etats .s:nth-child(3n+1){animation-delay:-.13s}.a-mat-etats .s:nth-child(3n+2){animation-delay:-.27s}.a-mat-etats .s:nth-child(4n){animation-direction:reverse}
.a-mat-etats .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
@keyframes a-mat-etats-v{0%,100%{transform:none}1.25%,6.25%,11.25%,16.25%,21.25%,26.25%,31.25%,36.25%,41.25%,46.25%,51.25%,56.25%,61.25%,66.25%,71.25%,76.25%,81.25%,86.25%,91.25%,96.25%{transform:translate(1.5px,-1px)}3.75%,8.75%,13.75%,18.75%,23.75%,28.75%,33.75%,38.75%,43.75%,48.75%,53.75%,58.75%,63.75%,68.75%,73.75%,78.75%,83.75%,88.75%,93.75%,98.75%{transform:translate(-1.5px,1px)}}
@keyframes a-mat-etats-l{to{offset-distance:calc(var(--d0) + 100%)}}
@keyframes a-mat-etats-g{to{offset-distance:calc(var(--d0) + 300%)}}
</style>
<rect class="b" x="10" y="28" width="84" height="104" rx="12"/><rect class="b" x="118" y="28" width="84" height="104" rx="12"/><rect class="b" x="226" y="28" width="84" height="104" rx="12"/><path d="M102 72 l8 8 l-8 8" fill="none" stroke="#FF9F0A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M210 72 l8 8 l-8 8" fill="none" stroke="#FF9F0A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<g><circle class="m s" cx="28" cy="88" r="5.5"/><circle class="m s" cx="40" cy="88" r="5.5"/><circle class="m s" cx="52" cy="88" r="5.5"/><circle class="m s" cx="64" cy="88" r="5.5"/><circle class="m s" cx="76" cy="88" r="5.5"/><circle class="m s" cx="28" cy="100" r="5.5"/><circle class="m s" cx="40" cy="100" r="5.5"/><circle class="m s" cx="52" cy="100" r="5.5"/><circle class="m s" cx="64" cy="100" r="5.5"/><circle class="m s" cx="76" cy="100" r="5.5"/><circle class="m s" cx="28" cy="112" r="5.5"/><circle class="m s" cx="40" cy="112" r="5.5"/><circle class="m s" cx="52" cy="112" r="5.5"/><circle class="m s" cx="64" cy="112" r="5.5"/><circle class="m s" cx="76" cy="112" r="5.5"/><circle class="m s" cx="28" cy="124" r="5.5"/><circle class="m s" cx="40" cy="124" r="5.5"/><circle class="m s" cx="52" cy="124" r="5.5"/><circle class="m s" cx="64" cy="124" r="5.5"/><circle class="m s" cx="76" cy="124" r="5.5"/></g>
<circle class="m lo" r="5.5" style="--d0:0%"/><circle class="m lo" r="5.5" style="--d0:7.1%"/><circle class="m lo" r="5.5" style="--d0:14.3%"/><circle class="m lo" r="5.5" style="--d0:21.4%"/><circle class="m lo" r="5.5" style="--d0:28.6%"/><circle class="m lo" r="5.5" style="--d0:35.7%"/><circle class="m lo" r="5.5" style="--d0:42.9%"/><circle class="m lo" r="5.5" style="--d0:50%"/><circle class="m lo" r="5.5" style="--d0:57.1%"/><circle class="m lo" r="5.5" style="--d0:64.3%"/><circle class="m lo" r="5.5" style="--d0:71.4%"/><circle class="m lo" r="5.5" style="--d0:78.6%"/><circle class="m lo" r="5.5" style="--d0:85.7%"/><circle class="m lo" r="5.5" style="--d0:92.9%"/><circle class="m li" r="5.5" style="--d0:7%"/><circle class="m li" r="5.5" style="--d0:27%"/><circle class="m li" r="5.5" style="--d0:47%"/><circle class="m li" r="5.5" style="--d0:67%"/><circle class="m li" r="5.5" style="--d0:87%"/>
<circle class="m g" r="5.5" style="offset-path:path('M262 35 L303 61 L251 125 L233 67Z');--d0:68.1%"/><circle class="m g" r="5.5" style="offset-path:path('M242 35 L303 59 L261 125 L233 109Z');--d0:91.5%"/><circle class="m g" r="5.5" style="offset-path:path('M260 35 L303 104 L275 125 L233 100Z');--d0:29.7%"/><circle class="m g" r="5.5" style="offset-path:path('M303 98 L255 125 L233 67 L256 35Z');--d0:77.1%"/><circle class="m g" r="5.5" style="offset-path:path('M233 68 L275 35 L303 97 L243 125Z');--d0:66%"/>
<text class="t" x="52" y="154" text-anchor="middle">solide</text><text class="t" x="160" y="154" text-anchor="middle">liquide</text><text class="t" x="268" y="154" text-anchor="middle">gaz</text>
</svg>`,
  },
  changements: {
    legende: 'Pendant que la glace fond, la température reste bloquée à 0 °C : c’est le palier de fusion.',
    alt: 'Un graphique montre la température en fonction du temps pendant qu’on chauffe un glaçon. Un point rouge suit la courbe : la température monte jusqu’à 0 °C, puis reste à 0 °C, palier horizontal, tant que la glace fond ; dans le bécher à côté, le glaçon rapetisse et l’eau liquide monte. Quand toute la glace a fondu, la température remonte.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-mat-changements">
<style>
.a-mat-changements .ax{fill:none;stroke:#3A3A3C;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.a-mat-changements .cb{fill:none;stroke:#AF52DE;stroke-width:4;stroke-linejoin:round;stroke-linecap:round}
.a-mat-changements .pt{offset-path:path('M48 142 L82 104 L166 104 L200 40');offset-rotate:0deg;offset-distance:44.8%;animation:a-mat-changements-p 8s linear infinite}
.a-mat-changements .gl{transform-box:fill-box;transform-origin:50% 100%;transform:scale(.5);animation:a-mat-changements-gl 8s linear infinite}
.a-mat-changements .eau{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.5);animation:a-mat-changements-e 8s linear infinite}
.a-mat-changements .fl{transform-box:fill-box;transform-origin:50% 100%;animation:a-mat-changements-f 8s ease-in-out infinite}
.a-mat-changements .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
@keyframes a-mat-changements-p{0%,8%{offset-distance:0%;opacity:1}24.11%{offset-distance:24.58%}63.89%{offset-distance:65.07%}80%,90%{offset-distance:100%;opacity:1}95%{offset-distance:100%;opacity:0}96%{offset-distance:0%;opacity:0}100%{offset-distance:0%;opacity:1}}
@keyframes a-mat-changements-gl{0%,24.11%{transform:scale(1);opacity:1}63.89%,95%{transform:scale(0);opacity:1}96%{transform:scale(1);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes a-mat-changements-e{0%,24.11%{transform:scaleY(0);opacity:1}63.89%,90%{transform:scaleY(1);opacity:1}96%{transform:scaleY(1);opacity:0}97%,100%{transform:scaleY(0);opacity:0}}
@keyframes a-mat-changements-f{0%,20%,40%,60%,80%,100%{transform:scaleY(1)}10%,30%,50%,70%,90%{transform:scaleY(.85)}}
</style>
<path class="ax" d="M40 158 V22 M34 30 L40 22 L46 30 M32 150 H206 M198 144 L206 150 L198 156"/><line x1="34" y1="104" x2="166" y2="104" stroke="#3A3A3C" stroke-width="1.5" stroke-dasharray="3 4"/>
<path class="cb" d="M48 142 L82 104 L166 104 L200 40"/><circle class="pt" r="6" fill="#FF3B30" stroke="#fff" stroke-width="2"/>
<rect class="eau" x="230" y="118" width="68" height="20" fill="#9CCBFF"/><rect class="gl" x="249" y="106" width="30" height="30" rx="4" fill="#EAF6FF" stroke="#5AA9E6" stroke-width="2.5"/><path d="M228 66 V134 Q228 140 234 140 H294 Q300 140 300 134 V66" fill="none" stroke="#3A3A3C" stroke-width="3" stroke-linejoin="round"/>
<path class="fl" d="M264 172 C254 172 251 163 256 156 C258 160 261 160 261 156 C261 151 265 148 268 145 C268 152 276 156 274 165 C273 169 269 172 264 172Z" fill="#FF9F0A"/>
<text class="t" x="31" y="109" text-anchor="end">0 °C</text><text class="t" x="206" y="172" text-anchor="end">temps</text><text class="t" x="50" y="30">température</text><text class="t" x="124" y="126" text-anchor="middle" style="font-size:12px">la glace fond</text>
</svg>`,
  },
  melanges: {
    legende: 'Eau + sable : le sable reste visible (hétérogène). Eau + sel : le sel disparaît, c’est uniforme (homogène).',
    alt: 'Deux béchers d’eau. À gauche, on verse du sable : les grains tombent au fond et restent visibles, le mélange est hétérogène. À droite, on verse du sel : les grains se dissolvent et disparaissent, l’eau reste uniforme, le mélange est homogène.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-mat-melanges">
<style>
.a-mat-melanges .w{fill:#CFE6FF}
.a-mat-melanges .v{fill:none;stroke:#3A3A3C;stroke-width:3;stroke-linejoin:round}
.a-mat-melanges .sa{fill:#C68A3A;stroke:#7A4A0E;stroke-width:1.2;transform:none;animation:a-mat-melanges-a 8s ease-in-out infinite}
.a-mat-melanges .se{fill:#fff;stroke:#636366;stroke-width:1.2;opacity:0;transform-box:fill-box;transform-origin:50% 50%;animation:a-mat-melanges-s 8s ease-in-out infinite}
.a-mat-melanges .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-mat-melanges .p{font-size:12px;font-weight:600;fill:#3A3A3C}
@keyframes a-mat-melanges-a{0%,4%{transform:translate(var(--x),var(--y));opacity:1}30%,86%{transform:none;opacity:1}93%{transform:none;opacity:0}94%{transform:translate(var(--x),var(--y));opacity:0}100%{transform:translate(var(--x),var(--y));opacity:1}}
@keyframes a-mat-melanges-s{0%,4%{transform:translate(var(--x),var(--y)) scale(1);opacity:1}28%{transform:none;opacity:1}52%,94%{transform:scale(.2);opacity:0}95%{transform:translate(var(--x),var(--y)) scale(1);opacity:0}100%{transform:translate(var(--x),var(--y)) scale(1);opacity:1}}
</style>
<path class="w" d="M41.5 64 H118.5 V132 Q118.5 138.5 112 138.5 H48 Q41.5 138.5 41.5 132Z"/><path class="w" d="M201.5 64 H278.5 V132 Q278.5 138.5 272 138.5 H208 Q201.5 138.5 201.5 132Z"/>
<circle class="sa" cx="49.2" cy="134.1" r="3.2" style="--x:28.4px;--y:-111px"/><circle class="sa" cx="54.4" cy="133.3" r="3.2" style="--x:16.9px;--y:-107.9px"/><circle class="sa" cx="57.3" cy="133.6" r="3.2" style="--x:31.6px;--y:-111.9px"/><circle class="sa" cx="63" cy="134" r="3.2" style="--x:19.5px;--y:-115.5px"/><circle class="sa" cx="66.4" cy="130.6" r="3.2" style="--x:14px;--y:-106.2px"/><circle class="sa" cx="70.5" cy="129.3" r="3.2" style="--x:14.1px;--y:-106.4px"/><circle class="sa" cx="73.4" cy="129.2" r="3.2" style="--x:13.2px;--y:-107.5px"/><circle class="sa" cx="78.7" cy="126.6" r="3.2" style="--x:5.2px;--y:-100.4px"/><circle class="sa" cx="81.7" cy="126.5" r="3.2" style="--x:-2.7px;--y:-100.1px"/><circle class="sa" cx="87.1" cy="125.4" r="3.2" style="--x:-13.7px;--y:-106.2px"/><circle class="sa" cx="91.4" cy="129.9" r="3.2" style="--x:-9.1px;--y:-109.9px"/><circle class="sa" cx="94" cy="129.8" r="3.2" style="--x:-16.7px;--y:-107px"/><circle class="sa" cx="98.3" cy="134.6" r="3.2" style="--x:-15px;--y:-108.4px"/><circle class="sa" cx="103.1" cy="134.8" r="3.2" style="--x:-20px;--y:-116.2px"/><circle class="sa" cx="107.1" cy="134.7" r="3.2" style="--x:-19.8px;--y:-112.1px"/><circle class="sa" cx="110.6" cy="133.5" r="3.2" style="--x:-24.7px;--y:-110.8px"/>
<rect class="se" x="203.1" y="79" width="4.5" height="4.5" style="--x:41.2px;--y:-54.1px"/><rect class="se" x="207.9" y="114.4" width="4.5" height="4.5" style="--x:28.5px;--y:-97.9px"/><rect class="se" x="214.2" y="112.9" width="4.5" height="4.5" style="--x:30.5px;--y:-97.5px"/><rect class="se" x="221" y="78.2" width="4.5" height="4.5" style="--x:21px;--y:-59.8px"/><rect class="se" x="227.5" y="123.1" width="4.5" height="4.5" style="--x:10.6px;--y:-98.1px"/><rect class="se" x="230.7" y="79.7" width="4.5" height="4.5" style="--x:9.1px;--y:-64.4px"/><rect class="se" x="235.8" y="95.6" width="4.5" height="4.5" style="--x:4.2px;--y:-79px"/><rect class="se" x="240.7" y="117.7" width="4.5" height="4.5" style="--x:-6px;--y:-93.1px"/><rect class="se" x="249.6" y="94.1" width="4.5" height="4.5" style="--x:-12.3px;--y:-73.9px"/><rect class="se" x="254.1" y="104.6" width="4.5" height="4.5" style="--x:-15px;--y:-83.4px"/><rect class="se" x="260.8" y="100.3" width="4.5" height="4.5" style="--x:-24px;--y:-78.1px"/><rect class="se" x="263.5" y="90.5" width="4.5" height="4.5" style="--x:-16.9px;--y:-70.2px"/>
<path class="v" d="M40 44 V132 Q40 140 48 140 H112 Q120 140 120 132 V44"/><path class="v" d="M200 44 V132 Q200 140 208 140 H272 Q280 140 280 132 V44"/>
<text class="t" x="80" y="158" text-anchor="middle">hétérogène</text><text class="t p" x="80" y="174" text-anchor="middle">eau + sable</text><text class="t" x="240" y="158" text-anchor="middle">homogène</text><text class="t p" x="240" y="174" text-anchor="middle">eau + sel</text>
</svg>`,
  },
  masse: {
    legende: 'La glace fond dans un bocal fermé : la balance ne bouge pas, la masse se conserve.',
    alt: 'Une balance à deux plateaux est en équilibre : à gauche, un bocal fermé contenant un glaçon ; à droite, une masse marquée. Le glaçon fond peu à peu et devient de l’eau liquide, mais le fléau reste horizontal et l’aiguille au milieu : la masse n’a pas changé, seul l’aspect a changé.',
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" class="a-mat-masse">
<style>
.a-mat-masse .gl{transform-box:fill-box;transform-origin:50% 100%;transform:scale(.6);animation:a-mat-masse-g 8s linear infinite}
.a-mat-masse .eau{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.5);animation:a-mat-masse-e 8s linear infinite}
.a-mat-masse .t{font:700 13px -apple-system,system-ui,sans-serif;fill:#1D1D1F}
.a-mat-masse .e1{opacity:0;animation:a-mat-masse-1 8s ease-in-out infinite}
.a-mat-masse .e2{animation:a-mat-masse-2 8s ease-in-out infinite}
.a-mat-masse .e3{opacity:0;animation:a-mat-masse-3 8s ease-in-out infinite}
@keyframes a-mat-masse-g{0%,10%{transform:scale(1);opacity:1}55%,92%{transform:scale(0);opacity:1}93%{transform:scale(1);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes a-mat-masse-e{0%,10%{transform:scaleY(0);opacity:1}55%,86%{transform:scaleY(1);opacity:1}93%{transform:scaleY(1);opacity:0}94%,100%{transform:scaleY(0);opacity:0}}
@keyframes a-mat-masse-1{0%,12%{opacity:1}17%,92%{opacity:0}97%,100%{opacity:1}}
@keyframes a-mat-masse-2{0%,12%{opacity:0}17%,50%{opacity:1}55%,100%{opacity:0}}
@keyframes a-mat-masse-3{0%,50%{opacity:0}55%,90%{opacity:1}95%,100%{opacity:0}}
</style>
<path d="M130 172 L140 156 H180 L190 172Z" fill="#3A3A3C"/><rect x="156" y="118" width="8" height="40" fill="#3A3A3C"/><rect x="66" y="114" width="188" height="7" rx="3.5" fill="#3A3A3C"/><rect x="66" y="104" width="7" height="12" fill="#3A3A3C"/><rect x="247" y="104" width="7" height="12" fill="#3A3A3C"/><rect x="26" y="99" width="88" height="6" rx="3" fill="#636366"/><rect x="206" y="99" width="88" height="6" rx="3" fill="#636366"/>
<path d="M144 96 A18 18 0 0 1 176 96" fill="none" stroke="#3A3A3C" stroke-width="2"/><line x1="160" y1="76" x2="160" y2="82" stroke="#3A3A3C" stroke-width="2"/><line x1="160" y1="117" x2="160" y2="80" stroke="#FF3B30" stroke-width="3" stroke-linecap="round"/><circle cx="160" cy="117" r="5" fill="#3A3A3C"/>
<rect class="eau" x="38" y="84" width="64" height="14" fill="#9CCBFF"/><rect class="gl" x="55" y="67" width="30" height="30" rx="4" fill="#EAF6FF" stroke="#5AA9E6" stroke-width="2.5"/><rect x="36" y="50" width="68" height="49" rx="6" fill="none" stroke="#3A3A3C" stroke-width="3"/><rect x="32" y="42" width="76" height="9" rx="3" fill="#FF9F0A"/>
<path d="M232 99 L237 72 H263 L268 99Z" fill="#8E8E93" stroke="#3A3A3C" stroke-width="2.5" stroke-linejoin="round"/><circle cx="250" cy="66" r="6" fill="#8E8E93" stroke="#3A3A3C" stroke-width="2.5"/>
<text class="t" x="160" y="22" text-anchor="middle">la balance reste en équilibre</text><text class="t e1" x="70" y="140" text-anchor="middle">glace</text><text class="t e2" x="70" y="140" text-anchor="middle">la glace fond</text><text class="t e3" x="70" y="140" text-anchor="middle">eau liquide</text>
</svg>`,
  },
};
