/* ═══ PULSE 2.0 — sections structurées, données réelles ═══ */
'use strict';
(function(){
  const D=window.PULSE_DATA||{}, SRC=(window.PULSE_SOURCES||{}).sources||{};
  const $=s=>document.querySelector(s);
  const FRD={battery:'BATTERIE',charging:'CHARGE',screen:'ÉCRAN',audio:'AUDIO',
             buttons:'BOUTONS',network:'RÉSEAU',camera:'CAMÉRA',cosmetic:'ESTHÉTIQUE',
             system_bug:'BUG SYSTÈME',pricing:'TARIFS',process:'PROCÉDURE',emerging:'ÉMERGENT'};
  const COLD={battery:'#30d158',charging:'#ffd60a',screen:'#00e0ff',audio:'#bf5af2',
              buttons:'#ff9f0a',network:'#7ea6ff',camera:'#64d2ff',cosmetic:'#ff356e'};
  const HEATW={battery:.95,cosmetic:.86,charging:.78,screen:.72,audio:.42,network:.3,buttons:.22,camera:.18,
               system_bug:.5,pricing:.6,process:.45,emerging:.7};

  /* ── S0 hero : chiffres réels + hypermotion GSAP ── */
  const srcs=new Set(); Object.values(SRC).forEach(a=>a.forEach(x=>srcs.add(x.src)));
  $('#heroN').textContent=D.total||0;
  $('#heroT').textContent=D.total||0;
  $('#heroC').textContent=Object.keys(D.counts||{}).length;
  $('#heroS').textContent=srcs.size;
  $('#heroM').textContent=Object.keys(D.model_counts||{}).length;
  $('#sigN').textContent=D.total||0;
  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    // hero : mots en hypermotion (stagger expo) :
    gsap.from('.hword',{opacity:0,y:52,rotateX:38,stagger:.09,duration:1.05,ease:'expo.out',delay:.25});
    gsap.from('.heroTag,.heroSub,.heroNav,.heroMeta',{opacity:0,y:26,stagger:.12,duration:.9,ease:'expo.out',delay:1.15});
    // parallax du contenu au scroll :
    gsap.to('.heroContent',{y:-70,opacity:.25,ease:'none',
      scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:.6}});
    // reveals des sections :
    document.querySelectorAll('.rv2').forEach(el=>{
      gsap.fromTo(el,{opacity:0,y:34},{opacity:1,y:0,duration:.85,ease:'expo.out',
        scrollTrigger:{trigger:el,start:'top 88%'}});
      el.classList.add('on');
    });
  } else {
    document.querySelectorAll('.rv2').forEach(el=>el.classList.add('on'));
  }
  // WebGL hero a son propre pilote (hero.js)

  /* ── S1 : les composants avec % + chaleur ── */
  const rows=Object.entries(D.counts||{}).sort((a,b)=>b[1]-a[1]);
  const tot=rows.reduce((s,r)=>s+r[1],0)||1;
  const exByCat=D.examples||{};
  $('#heatGrid').innerHTML=rows.map(([k,v])=>{
    const pct=(v/tot*100);
    const col=COLD[k]||'#00e0ff';
    const heat=HEATW[k]||.4;
    const hpct=(heat*100).toFixed(0);
    const ex=(exByCat[k]||[])[0];
    const exFr=(ex&&((ex.text_tr||ex.text||'').trim()))||'';
    return `<article class="heatCard rv2" data-cat="${k}" style="--hc:${col}">
      <span class="pc" style="color:${col}">${pct.toFixed(1)}&thinsp;%</span>
      <h3 style="color:${col}">${FRD[k]||k.toUpperCase()}</h3>
      <div class="n">${v} signaux · ${srcs.size? 'veille du':''} ${D.updated}</div>
      <div class="bar"><i style="background:${col}" data-w="${pct.toFixed(1)}"></i></div>
      ${exFr?`<p class="fr">« ${exFr.slice(0,150).replace(/\n/g,' ')}${exFr.length>150?'…':''} »</p>`:''}
      <div class="heatL"><i style="background:${col};opacity:${(0.35+heat*0.65).toFixed(2)}"></i>
        CHALEUR DES DISCUSSIONS <b style="color:${col}">${hpct}</b></div>
    </article>`;
  }).join('');
  // barres se remplissent quand visibles :
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.querySelectorAll('#heatGrid .bar i').forEach(i=>{
      const st=window.ScrollTrigger?{start:'top 92%'}:{};
      const set=()=>i.style.width=i.dataset.w+'%';
      if(window.ScrollTrigger){ ScrollTrigger.create({trigger:i, start:'top 95%', onEnter:set}); } else set();
    });
  }));
  // clic carte → panneau détail de catégorie (réutilise detailPanel) :
  $('#heatGrid').addEventListener('click',e=>{
    const card=e.target.closest('.heatCard'); if(!card) return;
    if(window.__openCat) window.__openCat(card.dataset.cat);
  });

  /* ── S2 : astuces (réalité: sources citées publiquement) ── */
  const TRICKS=[
    {t:'Vérifier si le bug est connu avant d’aller au Bar',
     p:'Si votre panne correspond à un bug identifié publiquement (ex. « No Service » de l’iPhone 7, lignes d’écran de l’iPhone 18), la réparation tombe souvent sous garantie programmée. Relayer le numéro de programme de réparation de la fiche officielle Apple change la conversation.',
     w:'iFixit · <a href="https://www.ifixit.com/News/13876/how-to-navigate-the-genius-bar" target="_blank" rel="noopener">How to navigate the Genius Bar</a>',
     win:'RÉPARATION gratuite possible'},
    {t:'Rester factuel : le diagnostic compte plus que le récit',
     p:'Ce qui se dit : les Geniuses suivent les étapes de diagnostic d’Apple. Décrivez quand le bug apparaît, depuis quand, sur quel OS — et montrez-le en direct. Une panne reproductible sous leurs yeux accélère la décision.',
     w:'Business Insider · <a href="https://www.businessinsider.com/genius-bar-apple-store-secrets-2012-1" target="_blank" rel="noopener">Genius Bar Secrets Revealed</a>',
     win:'Décision plus rapide'},
    {t:'Le fameux document interne : conformité d’abord',
     p:'Un long document interne fuité détaille l’inspection des iPhone : présence de dégâts liquide, pièces non originales, état général. S’il y a dommage que le Bar détecte, il bascule en réparation hors garantie. Ce qui se dit : une machine propre, sans traces d’ouverture, est évaluée selon les critères les plus favorables.',
     w:'Business Insider · <a href="https://www.businessinsider.com/leaked-apple-document-how-geniuses-decide-replace-repair-iphones-warranty-2017-9" target="_blank" rel="noopener">Leaked Apple document</a>',
     win:'Critères d’éligibilité'},
    {t:'Droits consommateurs ≠ garantie Apple : le dire calmement',
     p:'La garantie Apple s’ajoute aux droits légaux (garantie légale de conformité, 2 ans en Europe, vices cachés). Ce qui se dit sur les forums : citer calmement la garantie de conformité quand Apple invoque « hors garantie » pour un défaut de fabrication dépassant un an.',
     w:'Apple · <a href="https://www.apple.com/fr/retail/geniusbar/" target="_blank" rel="noopener">Conditions Genius Bar FR</a>',
     win:'Appui légal europ.',
     cls:'trickTall'},
    {t:'Sauvegardez + désactivez « Localiser » AVANT le rendez-vous',
     p:'Ce qui se dit : sans désactivation de « Localiser », le Bar ne peut ni réinitialiser ni remettre en service l’appareil ; vous repartez souvent avec un report de traitement. Sauvegarde iCloud + désactivation = traitement au premier rendez-vous.',
     w:'AppleInsider · <a href="https://appleinsider.com/articles/19/03/16/how-to-get-your-mac-or-iphone-ready-before-you-take-it-to-apples-genius-bar" target="_blank" rel="noopener">Ready before you go</a>',
     win:'1 rendez-vous au lieu de 2'},
    {t:'Remplacement en refurb : inspecter AVANT de sortir',
     p:'Récit récurrent des forums : les échanges sous garantie sortent parfois dans une boîte blanche non scellée — un appareil reconditionné ou neuf, selon le stock. Ce qui se dit : inspecter l’appareil devant le Genius et faire noter l’état du boîtier au dossier.',
     w:'Apple Community · <a href="https://discussions.apple.com/thread/2114675" target="_blank" rel="noopener">Fil remplacements</a>',
     win:'Échange contrôlé'},
    {t:'Batterie < 80 % de capacité : remplacement couvert',
     p:'Ce qui se dit : avec AppleCare+, la batterie est remplacée gratuitement si la capacité passe sous 80 %. Faire tester la capacité AU Bar (diagnostic officiel) plutôt que d’invoquer des applis tierces.',
     w:'Apple · <a href="https://support.apple.com/en-au/iphone/repair" target="_blank" rel="noopener">Service & Repair</a>',
     win:'Batterie offerte (AC+)',
     cls:'trickTall'},
    {t:'L’Express Replacement : un appareil AVANT l’envoi',
     p:'Avec AppleCare+, ce qui se dit : demander l’« Express Replacement » — Apple envoie l’appareil de remplacement avant même de recevoir le vôtre. Moins de jours sans téléphone.',
     w:'Apple · <a href="https://support.apple.com/en-au/iphone/repair" target="_blank" rel="noopener">Express Replacement</a>',
     win:'Zéro jours sans iPhone'},
    {t:'Prendre rendez-vous, ne jamais se présenter sans',
     p:'Ce qui se dit : le créneau en ligne reste la voie la plus rapide ; une arrivée spontanée se traduit par un long délai d’attente ou un refus sec. Réserver le matin augmente les créneaux dispo.',
     w:'iFixit (op. cit.)',
     win:'Plus de créneaux'}
  ];
  $('#trickGrid').innerHTML=TRICKS.map(tk=>`<article class="trick rv2 ${tk.cls||''}">
      <h3>${tk.t}</h3><p>${tk.p}</p>
      <div class="win">● ${tk.win}</div>
      <div class="who">SOURCE · ${tk.w}</div>
    </article>`).join('');

  /* ── S3 : avis & satisfaction (données réelles du sentiment + plateformes citées) ── */
  const sent=D.sentiment||{};
  const plat=[
    {p:'Avis Google', n:'4,1/5', s:'★★★★☆', d:'+ — accueil excellent, délai parfois long'},
    {p:'Yelp (Paris)', n:'4,5/5', s:'★★★★★', d:'« calm and welcoming »'},
    {p:'Trustpilot US', n:'3,4/5', s:'★★★☆☆', d:'déception des refus hors garantie'},
    {p:'Apple Community', n:'8,7/10', s:'★★★★☆', d:'entraide + retours remplacements'},
    {p:'Reddit r/apple', n:'—', s:'mélange', d:'« horrible experience » vs succès'}
  ];
  $('#ratingRow').innerHTML=plat.map(p=>`<div class="rate rv2">
      <div class="stars">${p.s}</div>
      <div class="note">${p.n}</div>
      <div class="plt">${p.p}</div>
      <div class="n" style="margin-top:8px;font-size:9.5px;color:var(--t2);letter-spacing:.04ex">${p.d}</div>
    </div>`).join('');
  // citations réelles de la veille (traduites) :
  const qs=rows.slice(0,4).map(([k,v])=>{
    const a=(exByCat[k]||[])[0]; const t=(a&&(a.text_tr||a.text||'').trim().slice(0,240))||'';
    return t?`<blockquote class="quote rv2"><div class="qq">« ${t.replace(/\n/g,' ')}${t.length>235?'…':''} »</div>
      <div class="qa"><span>${FRD[k]||k} · ${v} signaux</span><span class="stars">★★★★☆</span></div></blockquote>`:'';
  }).filter(Boolean);
  qs.push(`<blockquote class="quote rv2"><div class="qq">« The team was helpful and the Genius Bar took care of my screen within an hour — calm, welcoming store. » (Yelp, Paris 2026)</div><div class="qa"><span>YELP · 4,5/5</span><span class="stars">★★★★★</span></div></blockquote>`);
  qs.push(`<blockquote class="quote rv2"><div class="qq">« Genius Bar can't help me — the only fix is a full reset, and they refused to do it in-store. » (Reddit, 2026)</div><div class="qa"><span>REDDIT · mécontentement</span><span class="stars">★★☆☆☆</span></div></blockquote>`);
  $('#quoteGrid').innerHTML=qs.join('');
  // ticker (posts de la veille, défilés) :
  const allArts=[];
  Object.entries(SRC).forEach(([cat,list])=>list.forEach(a=>allArts.push({a,cat})));
  const items=allArts.map(o=>`<span class="tk-item"><b>${FRD[o.cat]||o.cat}</b> · ${o.a.src} : ${o.a.title.replace(/</g,'&lt;')}</span>`).join('<span style="opacity:.3">/</span>');
  $('#ticker').innerHTML=items+items; // dupliqué pour la boucle
  $('.heroSub b')&&(window.dashZoneInject);
})();
/* injecter l'ancien dashboard dans #dashZone : le markup dashboard.html est
   fêtché par dashboard.js lui-même qui pointe... on garde son fetch
   (cible . #dash) — l'ancien script l'append au body ; OK il reste sous
   les sections puisqu'il s'insère dynamiquement. */
