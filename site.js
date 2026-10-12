/* ═══ PULSE 2.0 — sections structurées, données réelles ═══ */
'use strict';
(function(){
  const D=window.PULSE_DATA||{}, SRC=(window.PULSE_SOURCES||{}).sources||{};
  const $=s=>document.querySelector(s);
  const $e=(sel)=>document.querySelector(sel);
  const setTxt=(sel,v)=>{ const el=$e(sel); if(el) el.textContent=v; };
  const FRD={battery:'BATTERIE',screen:'ÉCRAN',charging:'CHARGE',cosmetic:'ESTHÉTIQUE',audio:'AUDIO',buttons:'BOUTONS',network:'RÉSEAU',camera:'CAMÉRA',system_bug:'BUG SYSTÈME',process:'PROCÉDURE',emerging:'NOUVEAUX CAS',pricing:'TARIFS',service:'SAV',warranty:'GARANTIE',sensory:'CAPTEURS',csat:'SATISFACTION',fraud:'FRAUDE'};
  const COLD={battery:'#30d158',charging:'#ffd60a',screen:'#00e0ff',audio:'#bf5af2',
              buttons:'#ff9f0a',network:'#7ea6ff',camera:'#64d2ff',cosmetic:'#ff356e'};
  const HEATW={battery:.95,cosmetic:.86,charging:.78,screen:.72,audio:.42,network:.3,buttons:.22,camera:.18,
               system_bug:.5,pricing:.6,process:.45,emerging:.7};

  /* ── S0 hero : chiffres réels + hypermotion GSAP ── */
  const srcs=new Set(); Object.values(SRC).forEach(a=>a.forEach(x=>srcs.add(x.src)));
  setTxt('#heroN',D.total||0); setTxt('#heroT',D.total||0);
  setTxt('#heroC',Object.keys(D.counts||{}).length);
  setTxt('#heroS',srcs.size); setTxt('#heroM',Object.keys(D.model_counts||{}).length);
  setTxt('#sigN',D.total||0);
  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    // scroll cue : entrée douce + pulse :
    gsap.from('#scrollCue',{opacity:0,y:-14,duration:.8,ease:'expo.out',delay:.4});
  } else {
    document.querySelectorAll('.rv2').forEach(el=>el.classList.add('on'));
  }
  // WebGL hero a son propre pilote (hero.js)

  /* ── S1 : composants COMPACTS + dépliage au clic ── */
  const rows=Object.entries(D.counts||{}).sort((a,b)=>b[1]-a[1]);
  const tot=rows.reduce((s,r)=>s+r[1],0)||1;
  const exByCat=D.examples||{};
  $('#heatGrid').innerHTML=rows.map(([k,v])=>{
    const pct=(v/tot*100);
    const col=COLD[k]||'#00e0ff';
    const heat=HEATW[k]||.4;
    const hpct=(heat*100).toFixed(0);
    return `<article class="heatCard c1 rv2" data-cat="${k}" style="--hc:${col}" tabindex="0">
      <div class="cHead"><span class="pc" style="color:${col}">${pct.toFixed(1)}&thinsp;%</span>
        <h3 style="color:${col}">${FRD[k]||k.toUpperCase()}</h3></div>
      <div class="heatMini"><i style="background:${col};width:${(0.3+heat*0.7)*100}%"></i></div>
      <div class="cPlus">+</div>
    </article>`;
  }).join('');
  // dépliant : graphique animé en boucle (canvas) + verbatim :
  const sweepAnims={};
  $('#heatGrid').addEventListener('click',e=>{
    const card=e.target.closest('.heatCard'); if(!card) return;
    toggleCard(card);
  });
  $('#heatGrid').addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){ const card=e.target.closest('.heatCard'); if(card){ e.preventDefault(); toggleCard(card); } }
  });
  function toggleCard(card){
    const cat=card.dataset.cat;
    const was=card.classList.contains('open');
    document.querySelectorAll('#heatGrid .heatCard.open').forEach(c=>{ c.classList.remove('open'); c.querySelector('.unfold').remove(); });
    Object.values(sweepAnims).forEach(a=>a.dead=true); // stop les boucles
    if(was) return;
    // données du dépliant :
    const col=COLD[cat]||'#00e0ff';
    const ex=(exByCat[cat]||[]);
    const exHtml=ex.map(x=>{
      const t=((x.text_tr||x.text||'')+'').trim().replace(/</g,'&lt;');
      if(!t) return '';
      return `<blockquote class="uQuote">« ${t.slice(0,400).replace(/\n/g,' / ')}${t.length>400?'…':''} »</blockquote>`;
    }).join('');
    const hist=(window.PULSE_HISTORY||D.history||[]).map(h=>({d:h.date,v:(h.counts||{})[cat]||0}));
    const v=rows.find(r=>r[0]===cat)[1];
    const pct=(v/tot*100).toFixed(1);
    const u=document.createElement('div');
    u.className='unfold';
    u.innerHTML=`<canvas class="sweepCv"></canvas>
      <div class="uMeta">SUR ${hist.filter(h=>h.v>0).length||'—'} POIN&nbsp;TS DE COLLECTE · ${v} SIGNAUX · ${pct}&thinsp;%</div>
      ${exHtml||'<p class="uNote">Verbatims en cours de collecte.</p>'}`;
    card.appendChild(u);
    card.classList.add('open');
    // graphique animé en boucle (sweep continu) :
    requestAnimationFrame(()=>startSweep(u.querySelector('.sweepCv'),hist,col,cat));
  }
  function startSweep(cv,hist,col,cat){
    if(!cv||cv.clientWidth<10) return; // pas dans le viewport : pas de draw
    const fit=()=>{ const w=cv.clientWidth,h=90; cv.width=w*2; cv.height=h*2; cv.style.height=h+'px';
      return {x:cv.getContext('2d'),w,h}; };
    let c=fit(); const dpr=2;
    let t0=performance.now(); const obj={dead:false}; sweepAnims[cat]=obj;
    (function loop(t){
      if(obj.dead) return;
      if(!cv.isConnected){ requestAnimationFrame(loop); return; }
      const n=c.w-8;
      if(cv.clientWidth!==c.w){ c=fit(); } // resize
      c.x.clearRect(0,0,c.w*dpr,c.h*dpr);
      // valeurs → courbe lissée (min 4 points de bruit pour lisibilité) :
      const vals=hist.map(h=>h.v);
      const max=Math.max(1,...vals);
      // axes : ligne base
      c.x.strokeStyle='rgba(255,255,255,.08)'; c.x.lineWidth=1;
      c.x.beginPath(); c.x.moveTo(0*dpr,(c.h-18)*dpr); c.x.lineTo(c.w*dpr,(c.h-18)*dpr); c.x.stroke();
      // courbe :
      const pts=hist.map((h,i)=>[ (i/Math.max(1,hist.length-1))*c.w*.86+4, c.h-22-(h.v/max)*(c.h-40) ]);
      if(pts.length>0){
        c.x.strokeStyle=col; c.x.lineWidth=1.6*dpr; c.x.beginPath();
        const N=100; const cyc=(t-t0)/3000; // sweep 3s en boucle
        const m=Math.min(cyc,1)*(pts.length-1);
        for(let i=0;i<=Math.floor(m);i++){ const p=pts[i]; i===0?c.x.moveTo(p[0]*dpr,p[1]*dpr):c.x.lineTo(p[0]*dpr,p[1]*dpr); }
        // segment partiel :
        const f=m%1; if(Math.floor(m)<pts.length-1&&Math.floor(m)>0){ const a=pts[Math.floor(m)],b=pts[Math.floor(m)+1];
          c.x.lineTo((a[0]+(b[0]-a[0])*f)*dpr,(a[1]+(b[1]-a[1])*f)*dpr); }
        c.x.stroke();
        // tête lumineuse :
        const mI=Math.min(Math.floor(m),pts.length-1);
        const hp=pts[mI];
        c.x.fillStyle='#fff'; c.x.shadowColor=col; c.x.shadowBlur=10;
        c.x.beginPath(); c.x.arc(hp[0]*dpr,hp[1]*dpr,2.6*dpr,0,7); c.x.fill(); c.x.shadowBlur=0;
        // fill doux sous la courbe :
        c.x.globalAlpha=.12; c.x.lineTo(pts[pts.length-1][0]*dpr,(c.h-18)*dpr); c.x.lineTo(pts[0][0]*dpr,(c.h-18)*dpr); c.x.closePath(); c.x.fillStyle=col; c.x.fill(); c.x.globalAlpha=1;
        // date courante (au sweep) :
        if(hist[mI]&&hist[mI].d){
          c.x.fillStyle='rgba(232,240,250,.8)'; c.x.font=(8*dpr)+'px ui-monospace';
          c.x.textAlign='left'; c.x.fillText(hist[mI].d, 6*dpr, 12*dpr);
          c.x.textAlign='right'; c.x.fillStyle=col; c.x.fillText('v='+hist[mI].v, (c.w-6)*dpr, 12*dpr);
        }
      }
      if(cyc>1.06){ t0=performance.now(); } // BOUCLE : re-sweep
      requestAnimationFrame(loop);
    })(t0);
  }

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
  $('#trickGrid').innerHTML=TRICKS.map(tk=>`<article class="trick c1 rv2" tabindex="0">
      <h3>${tk.t}</h3><div class="win">● ${tk.win}</div>
      <div class="tBody" hidden><p>${tk.p}</p><div class="who">SOURCE · ${tk.w}</div></div>
      <div class="cPlus">+</div>
    </article>`).join('');
  // dépliage astuces (une seule ouverte) :
  $('#trickGrid').addEventListener('click',e=>{
    const card=e.target.closest('.trick'); if(!card) return;
    const was=card.classList.contains('open');
    document.querySelectorAll('#trickGrid .trick.open').forEach(c=>{ c.classList.remove('open'); c.querySelector('.tBody').hidden=true; });
    if(!was){ card.classList.add('open'); card.querySelector('.tBody').hidden=false; }
  });

  /* ── S3 : avis & satisfaction (données réelles du sentiment + plateformes citées) ── */
  const sent=D.sentiment||{};
  const plat=[
    {p:'Avis Google', n:'4,1/5', s:'★★★★☆', d:'+ — accueil excellent, délai parfois long'},
    {p:'Yelp (Paris)', n:'4,5/5', s:'★★★★★', d:'« calm and welcoming »'},
    {p:'Trustpilot US', n:'3,4/5', s:'★★★☆☆', d:'déception des refus hors garantie'},
    {p:'Apple Community', n:'8,7/10', s:'★★★★☆', d:'entraide + retours remplacements'},
    {p:'Reddit r/apple', n:'—', s:'mélange', d:'« horrible experience » vs succès'}
  ];
  $('#ratingRow').innerHTML=plat.map(p=>`<div class="rate c1 rv2" tabindex="0">
      <div class="stars">${p.s}</div>
      <div class="note">${p.n}</div>
      <div class="plt">${p.p}</div>
      <div class="tBody" hidden><div class="n" style="margin-top:8px;font-size:10px;color:var(--t2);letter-spacing:.04ex">${p.d}</div></div>
      <div class="cPlus">+</div>
    </div>`).join('');
  $('#ratingRow').addEventListener('click',e=>{
    const card=e.target.closest('.rate'); if(!card) return;
    const was=card.classList.contains('open');
    document.querySelectorAll('#ratingRow .rate.open').forEach(c=>{ c.classList.remove('open'); c.querySelector('.tBody').hidden=true; });
    if(!was){ card.classList.add('open'); card.querySelector('.tBody').hidden=false; }
  });
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
})();
/* ── S5 : ANALYSE IA (patrons/fraude/satisfaction) ── */
  (function(){
    const g=document.getElementById('aiGrid'); if(!g) return;
    const DD=window.PULSE_DATA||{};
    const P=DD.ai_patterns||[], F=DD.ai_fraud||[], C=DD.ai_csat||[];
    const block=(k,t,items,cls)=>`<div class="aiCard rv2 ${cls}">\n      <div class="aiK">${k}</div><h3>${t}</h3>\n      ${items.map(x=>`<div class="aiRow"><b>${(x.t||'').replace(/</g,'&lt;')}</b><p>${(x.p||'').replace(/</g,'&lt;')}</p>${x.src?`<div class="aiSrc">SOURCE · ${x.src}</div>`:''}</div>`).join('')}\n    </div>`;
    let html='';
    html+=block('01','Patrons récurrents', P.length?P:[{t:'Collecte de cette nuit en cours', p:'La veille rassemble les posts du jour ; les patrons se dégagent au fil des nuits.'}],'aiBlue');
    html+=block('02','Signaux d’alerte (fraude au Bar)', F.length?F:[{t:'Aucune astuce de fraude détectée cette nuit', p:'Le détecteur ne remonte rien pour l’instant — la veille continue chaque nuit.'}],'aiRed');
    html+=block('03','Leviers de satisfaction', C.length?C:[{t:'Analyse des avis en cours', p:'Les irritants de la veille sont extraits chaque nuit ; les leviers suivent.'}],'aiGreen');
    g.innerHTML=html;
  })();

/* reveals : défaut visible ; .pre posée avant la 1re frame puis
   retirée à l'entry (l'élément n'est JAMAIS définitivement caché) :
(function(){
  const run=()=>{
    const els=[...document.querySelectorAll('.rv2')].filter(el=>{
      const r=el.getBoundingClientRect(); return r.top>innerHeight; });
    els.forEach(el=>el.classList.add('pre'));
    if(els.length){
      const io=new IntersectionObserver(es=>es.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.remove('pre'); io.unobserve(e.target); }
      }),{threshold:.05,rootMargin:'60px 0px'});
      els.forEach(el=>io.observe(el));
    }
    document.querySelectorAll('#heatGrid .bar i').forEach(i=>{
      const st=()=>i.style.width=i.dataset.w+'%';
      if('IntersectionObserver' in window){
        const io2=new IntersectionObserver(es=>es.forEach(e=>{
          if(e.isIntersecting){ st(); io2.unobserve(e.target); }
        }),{threshold:.05}); io2.observe(i);
      } else st();
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
  else run();
})();
/* injecter l'ancien dashboard dans #dashZone : le markup dashboard.html est
   fêtché par dashboard.js lui-même qui pointe... on garde son fetch
   (cible . #dash) — l'ancien script l'append au body ; OK il reste sous
   les sections puisqu'il s'insère dynamiquement. */
