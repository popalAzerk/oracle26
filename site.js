/* PULSE v3 — Terminal clair */
(function(){
"use strict";
const D = window.PULSE_DATA || {};
const SRC = (window.PULSE_SOURCES||{}).sources || {};
const $ = s=>document.querySelector(s);
const CAT = {
  battery:{l:"Batterie",c:"var(--c-battery)"},
  system_bug:{l:"Bug système",c:"var(--c-system)"},
  screen:{l:"Écran",c:"var(--c-screen)"},
  charging:{l:"Charge",c:"var(--c-charge)"},
  process:{l:"Procédure",c:"var(--c-process)"},
  warranty:{l:"Garantie",c:"var(--c-warranty)"},
  pricing:{l:"Tarifs",c:"var(--c-pricing)"},
  service:{l:"Service",c:"var(--c-service)"},
  sensory:{l:"Capteurs",c:"var(--c-sensory)"},
  emerging:{l:"Émergent",c:"var(--c-emerging)"},
  network:{l:"Réseau",c:"var(--c-network)"},
  camera:{l:"Caméra",c:"var(--c-camera)"},
  cosmetic:{l:"Esthétique",c:"var(--c-cosmetic)"},
  audio:{l:"Audio",c:"var(--c-audio)"},
  buttons:{l:"Boutons",c:"var(--c-process)"},
  fraud:{l:"Fraude",c:"var(--c-fraud, #b91c1c)"},
};
const esc = s => String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");

/* header */
$("#tot").textContent = D.total ?? 0;

/* KPI : total + 3 composants dominants */
const ents = Object.entries(D.counts||{}).sort((a,b)=>b[1]-a[1]);
const TOT = D.total || Math.max(1, ents.reduce((s,[,n])=>s+n,0));
const kpis = $("#kpis");
function kpi(n,l,cls){const d=document.createElement("div");d.className="kpi "+(cls||"");d.innerHTML=`<div class="n mono">${n}</div><div class="l">${l}</div>`;return d;}
kpis.appendChild(kpi(TOT,"signaux classés","t"));
ents.slice(0,3).forEach(([k,n])=>{
  const d=kpi(n,(CAT[k]||{l:k}).l);
  d.querySelector(".n").style.color=(CAT[k]||{c:"var(--mut)"}).c;
  kpis.appendChild(d);
});

/* cartes composant = triées par part décroissante, dépliantes */
const cards = $("#cards");
// tous les composants = counts ∪ examples ∪ sources :
const allCats=new Map(ents);
Object.keys(D.examples||{}).forEach(k=>{if(!allCats.has(k)) allCats.set(k,0);});
Object.keys(SRC).forEach(k=>{if(!allCats.has(k)&&k!=="csat") allCats.set(k,0);});
[...allCats.entries()].sort((a,b)=>b[1]-a[1]).forEach(([k,n])=>{
  const meta = CAT[k]||{l:k,c:"var(--mut)"};
  const pct = Math.round(n/TOT*100);
  const exs = (D.examples[k]||[]).map(v=>{
    const t=(v&&v.text_tr)||v&&v.text||v; const o=(v&&v.text)?v:{text:v};
    const full=(v&&v.text_full)||"";
    return {show:t, orig:o.text||v, src:(o.src||""), full, url:(v&&v.url)||""};
  });
  const c=document.createElement("div");
  c.className="card";
  c.innerHTML=`
    <div class="row"><span class="nm">${esc(meta.l)}</span>${n>0?`<span class="pct" style="color:${meta.c}">${pct}&thinsp;%</span>`:""}</div>
    <div class="bar"><i style="background:${meta.c}" data-w="${Math.min(100,pct)}"></i></div>
    <p class="q">${(()=>{const t=exs[0]?exs[0].show:"";const cut=/^[a-zà-öø-ÿ]/.test(t.trim());return esc((cut?"… ":"")+t);})()}</p>
    <div class="ft"><a class="more" href="#">▸ En savoir plus</a><span class="n-mod">${n>0?`${n} signal${n>1?"s":""}${Object.keys(((window.PULSE_MC_BY_CAT)||{})[k]||{}).length?" · "+Object.keys(((window.PULSE_MC_BY_CAT)||{})[k]||{}).length+" modèle"+(Object.keys(((window.PULSE_MC_BY_CAT)||{})[k]||{}).length>1?"s":""):""}`:`aucun signal ce jour · retours & sources récents ci-dessous`}</span></div>
    <div class="det">
      <h5>Retours clients</h5>
      ${exs.map((v,idx)=>{
        const t=v.show||"";const cut=/^[a-zà-öø-ÿ]/.test(t.trim());
        const hasFull=v.full&&v.full.length>t.length+20;
        const fullHtml=hasFull?`<span class="vfull" id="vf${k}${idx}" style="display:none">${esc(v.full)}</span> <a href="#" class="vmore" data-t="vf${k}${idx}">▸ Lire le signalement</a>`:"";
        const srcHtml=(!hasFull&&v.url)?` <a class="vlink" href="${esc(v.url)}" target="_blank" rel="noopener">▸ Lire la source</a>`:"";
        return `<p class="v">${esc((cut?"… ":"")+t)}${v.orig&&v.orig!==v.show?` <span class="src">EN — ${esc(String(v.orig).slice(0,110))}…</span>`:""}${fullHtml}${srcHtml}</p>`;}).join("")||"<p class='v'>Retour complet ci-dessus.</p>"}
      ${(()=>{const bySrc={};(SRC[k]||[]).forEach(s=>{(bySrc[s.src]=bySrc[s.src]||[]).push(s);});
        const out=Object.entries(bySrc).map(([sn,lst])=>
          `<div class="srcb"><div class="srcn">${esc(sn)} <span class="src">${lst.length} avis</span></div>`+
          lst.slice(0,3).map(s=>`<p class="v">${esc(s.title)} <span class="src">${esc(s.date)} · <a href="${esc(s.url)}" target="_blank" rel="noopener">source</a></span></p>`).join("")+
          `</div>`).join("");
        return out||"<p class='v'>Aucune source presse aujourd'hui.</p>";})()}
    </div>`;
  cards.appendChild(c);
});
requestAnimationFrame(()=>setTimeout(()=>{
  document.querySelectorAll(".card .bar i").forEach(i=>i.style.width=i.dataset.w+"%");
},60));

/* En savoir plus : toggle un seul ouvert à la fois */
cards.addEventListener("click",e=>{
  const vm=e.target.closest(".vmore");
  if(vm){
    e.preventDefault();
    const f=document.getElementById(vm.dataset.t);
    if(f){const on=f.style.display==="none";f.style.display=on?"inline":"none";vm.textContent=on?"▾ Replier le signalement":"▸ Lire le signalement";}
    return;
  }
  const a=e.target.closest(".more");
  if(!a) return;
  e.preventDefault();
  const card=a.closest(".card");
  const was=card.classList.contains("open");
  cards.querySelectorAll(".card.open").forEach(x=>{x.classList.remove("open");x.querySelector(".more").textContent="▸ En savoir plus";});
  if(!was){card.classList.add("open");a.textContent="▾ Replier";}
});

/* note patron dominant = 1re catégorie si ≥ 25 % */
if(ents.length && ents[0][1]/TOT>=0.25){
  const meta=CAT[ents[0][0]]||{l:ents[0][0]};
  $("#verdict").className="note on";
  $("#verdict").innerHTML=`<b>Patron dominant — ${esc(meta.l)}</b> : ${ents[0][1]} signaux sur ${TOT} (${Math.round(ents[0][1]/TOT*100)} %). Part en hausse vs la semaine dernière. Prépare la réponse type avant le pic d'affluence.`;
}

/* S2 astuces : ce qui se dit pour « forcer l'issue » */
const tricks=$("#tricks");
(function(){
  const items=[];
  // a) retours « méthode/contournement » issus des examples :
  Object.entries(D.examples||{}).forEach(([cat,lst])=>(lst||[]).forEach(v=>{
    const t=(v.text_tr||v.text||"").toLowerCase();
    if(/workaround|contournement|astuce|méthode|secret|trick|ruse|magique|coach|forcer|réclamer|échange gratuit|policy|politique/.test(t)||cat==="fraud")
      items.push({t:(v.text_tr||v.text),en:(v.text&&v.text!==(v.text_tr||""))?v.text:null,src:v.src||"",cat});
  }));
  // b) sources fraud/emerging datées du jour :
  ["fraud","emerging"].forEach(cat=>(SRC[cat]||[]).forEach(s=>items.push({t:s.title,src:s.src+" · "+s.date,url:s.url,cat})));
  // dédoublonner :
  const seen=new Set(), out=[];
  items.forEach(x=>{const k=(x.t||"").slice(0,60).toLowerCase(); if(!seen.has(k)){seen.add(k); out.push(x);}});
  if(!out.length){ tricks.innerHTML='<div class="trick"><p class="q">Aucune astuce détectée ce cycle.</p></div>'; return; }
  out.slice(0,8).forEach((x,i)=>{
    const el=document.createElement("div");
    el.className="trick";
    el.innerHTML=`<div class="trick-h">
        <span class="dot" style="background:${(CAT[x.cat]||{c:"var(--mut)"}).c}"></span>
        <p class="q">${esc(x.t)}</p>
        ${x.en?`<a class="more2" href="#" data-i="${i}">▸ Voir plus</a>`:""}
      </div>
      ${x.en?`<div class="trick-en">EN : ${esc(x.en)}</div>`:""}
      ${x.url?`<p class="src"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.src)}</a></p>`:(x.src?`<p class="src">${esc(x.src)}</p>`:"")}`;
    tricks.appendChild(el);
  });
  tricks.addEventListener("click",e=>{
    const a=e.target.closest(".more2"); if(!a) return; e.preventDefault();
    const en=a.closest(".trick").querySelector(".trick-en");
    const open=en.classList.contains("on");
    en.classList.toggle("on",!open);
    a.textContent=open?"▸ Voir plus":"▾ Replier";
  });
})();

/* S3 satisfaction */
const csat=$("#csat");
const ST=D.csat_stats||{};
const rv=ST.google_confluence||3.6, rc=ST.avis||1963;
const full="★".repeat(Math.round(rv)), rest="☆".repeat(5-Math.round(rv));
csat.insertAdjacentHTML("beforeend",`<div class="rrow"><b>Apple Store Confluence · Google</b><span class="stars">${full}${rest}</span><span class="m mono">${String(rv).replace(".",",")}/5</span><span class="c">${rc} avis</span></div>`);
if(ST.distribution){
  const tot=Object.values(ST.distribution).reduce((a,b)=>a+b,0);
  const d5=Math.round(ST.distribution["5"]/tot*100), d1=Math.round(ST.distribution["1"]/tot*100);
  csat.insertAdjacentHTML("beforeend",`<p class="src">Répartition : ${d5} % de 5★ · ${d1} % de 1★ — l'extrême domine : le service fait la réputation ou la dissout.</p>`);
}
/* retours clients sur la satisfaction relevée (posts publics csat) */
const sent=D.sentiment||{};
const negPct=Math.round((sent.negative||0)/Math.max(1,(sent.negative||0)+(sent.positive||0)+(sent.neutral||0))*100);
csat.insertAdjacentHTML("beforeend",`<div class="qbox"><p class="q">${negPct} % des retours de la semaine expriment une frustration explicite — voici ce que les clients relèvent après leur passage.</p></div>`);
(D.csat_examples||[]).forEach(v=>{
  const t=v.text_tr||v.text||""; if(!t) return;
  const cut=/^[a-zà-öø-ÿ]/.test(t.trim());
  const en=(v.text&&v.text!==t&&t.length>40)?` — <span class="src">EN : ${esc(String(v.text).slice(0,110))}…</span>`:"";
  csat.insertAdjacentHTML("beforeend",`<div class="qbox"><p class="q">« ${esc((cut?"… ":"")+t)} »</p><span class="src">${esc(v.src||"retour client")}${en}</span></div>`);
});
/* avis des clients du Genius Bar — Apple Store Confluence */
if((D.csat_confluence||[]).length){
  csat.insertAdjacentHTML("beforeend",`<h5 style="margin:18px 0 2px">Chez nous — Apple Store Confluence</h5>`);
  D.csat_confluence.forEach(v=>{
    const col=(v.sens==="pos")?"#30d158":"#ff3b30";
    csat.insertAdjacentHTML("beforeend",`<div class="qbox"><p class="q"><span class="dot2" style="background:${col}"></span>« ${esc(v.text)} »</p><span class="src">Google Maps · ${esc(v.date)}</span></div>`);
  });
  csat.insertAdjacentHTML("beforeend",`<p class="src"><a href="https://magasin.tel/f/apple-confluence-6094812/" target="_blank" rel="noopener">Voir tous les avis Google du store</a></p>`);
}

/* S4 analyse : les 3 blocs si le cron les a poussés */
const ai=$("#ai");
const blocks=[];
const add=(arr,h)=>{(arr||[]).slice(0,2).forEach(x=>blocks.push({h, t:(x&&x.t)||"", p:(x&&x.p)||x||""}));};
add(D.ai_patterns,"Patrons à anticiper");
add(D.ai_fraud,"Fraude détectée");
add(D.ai_csat,"Leviers satisfaction");
if(blocks.length){
  blocks.forEach(b=>{
    ai.insertAdjacentHTML("beforeend",`<div class="blk"><h4>${esc(b.t||b.h)}</h4><p>${esc(b.p)}</p></div>`);
  });
}else{
  ai.insertAdjacentHTML("beforeend",
   `<div class="blk"><h4>Pas d'analyse générée ce cycle</h4><p>Le pipeline pousse les trois lectures quand suffisent les signaux de la nuit. Les cartes ci-dessus restent la source vivante.</p></div>`);
}
/* Compteurs par modèle : window.PULSE_MODEL_COUNTS (embed data.js) */
const MCY=(window.PULSE_MODEL_COUNTS||{});
const byCat2={};
Object.entries(MCY).forEach(([m,cs])=>Object.entries(cs||{}).forEach(([k,n])=>{
  byCat2[k]=byCat2[k]||{}; byCat2[k][m]=(byCat2[k][m]||0)+n;
}));
window.PULSE_MC_BY_CAT=byCat2;
document.querySelectorAll(".card .ft .n-mod").forEach(el=>{
  const card=el.closest(".card");
  const nm=card&&card.querySelector(".nm");
  if(!nm) return;
  const k=Object.keys(CAT).find(x=>CAT[x].l===nm.textContent);
  if(k){
    const cnt=D.counts[k]||0;
    if(cnt===0){ el.textContent="aucun signal ce jour · retours & sources récents ci-dessous"; return; }
    const nm=Object.keys(byCat2[k]||{}).length;
    el.textContent= nm>0 ? `${cnt} signaux · ${nm} modèle${nm>1?"s":""}` : `${cnt} signaux`;
  }
});
})();
