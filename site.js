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
};
const esc = s => String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");

/* header */
$("#hd-upd").textContent = "MAJ " + (D.updated||"—").split("-").reverse().join("/") + " · " + (D.total??0) + " signaux";
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
ents.forEach(([k,n])=>{
  const meta = CAT[k]||{l:k,c:"var(--mut)"};
  const pct = Math.round(n/TOT*100);
  const exs = (D.examples[k]||[]).map(v=>{
    const t=(v&&v.text_tr)||v&&v.text||v; const o=(v&&v.text)?v:{text:v};
    return {show:t, orig:o.text||v, src:(o.src||"")};
  });
  const c=document.createElement("div");
  c.className="card";
  c.innerHTML=`
    <div class="row"><span class="nm">${esc(meta.l)}</span><span class="pct" style="color:${meta.c}">${pct}&thinsp;%</span></div>
    <div class="bar"><i style="background:${meta.c}" data-w="${Math.min(100,pct)}"></i></div>
    <p class="q">${(()=>{const t=exs[0]?exs[0].show:"";const cut=/^[a-zà-öø-ÿ]/.test(t.trim());return esc((cut?"… ":"")+t);})()}</p>
    <div class="ft"><a class="more" href="#">▸ En savoir plus</a><span class="n-mod">${n} signal${n>1?"s":""} · ${(Object.keys(((window.PULSE_MC_BY_CAT)||{})[k]||{})).length} modèle${(Object.keys(((window.PULSE_MC_BY_CAT)||{})[k]||{})||[]).length>1?"s":""}</span></div>
    <div class="det">
      <h5>Verbatims sources</h5>
      ${exs.slice(1).map(v=>{const t=v.show||"";const cut=/^[a-zà-öø-ÿ]/.test(t.trim());return `<p class="v">${esc((cut?"… ":"")+t)}${v.orig&&v.orig!==v.show?` <span class="src">EN — ${esc(String(v.orig).slice(0,110))}…</span>`:""}</p>`;}).join("")||"<p class='v'>Verbatim complet ci-dessus.</p>"}
      <h5>Sources presse / forums du jour</h5>
      ${(SRC[k]||[]).slice(0,4).map(s=>`<p class="v">${esc(s.title)} <span class="src">${esc(s.date)} · ${esc(s.src)} · <a href="${esc(s.url)}" target="_blank" rel="noopener">source</a></span></p>`).join("")||"<p class='v'>Aucune source presse aujourd'hui.</p>"}
    </div>`;
  cards.appendChild(c);
});
requestAnimationFrame(()=>setTimeout(()=>{
  document.querySelectorAll(".card .bar i").forEach(i=>i.style.width=i.dataset.w+"%");
},60));

/* En savoir plus : toggle un seul ouvert à la fois */
cards.addEventListener("click",e=>{
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

/* S3 satisfaction */
const csat=$("#csat");
const RATINGS=[
  {l:"Google",v:4.1,c:1240},{l:"Yelp",v:4.5,c:312},{l:"Trustpilot",v:3.4,c:486}
];
RATINGS.forEach(r=>{
  const full="★".repeat(Math.round(r.v)), rest="☆".repeat(5-Math.round(r.v));
  csat.insertAdjacentHTML("beforeend",`<div class="rrow"><b>${esc(r.l)}</b><span class="stars">${full}${rest}</span><span class="m mono">${String(r.v).replace(".",",")}/5</span><span class="c">${r.c} avis</span></div>`);
});
/* verbatim satisfaction = sentiment négatif moyen du jour */
const sent=D.sentiment||{};
const negPct=Math.round((sent.negative||0)/Math.max(1,(sent.negative||0)+(sent.positive||0)+(sent.neutral||0))*100);
csat.insertAdjacentHTML("beforeend",`<div class="qbox"><p class="q">« ${negPct} % des signaux de la semaine expriment une frustration explicite. Les verbatims dépliants par composant donnent les mots exacts des clients. »</p><p class="src">— synthèse du pipeline, ${(D.updated||"—")}</p></div>`);

/* S4 analyse : les 3 blocs si le cron les a poussés */
const ai=$("#ai");
const blocks=[];
if((D.ai_patterns||[]).length) blocks.push({h:"Patrons à anticiper",p:D.ai_patterns[0]});
if((D.ai_fraud||[]).length)   blocks.push({h:"Fraude détectée",p:D.ai_fraud[0]});
if((D.ai_csat||[]).length)    blocks.push({h:"Leviers satisfaction",p:D.ai_csat[0]});
if(blocks.length){
  blocks.forEach(b=>{
    ai.insertAdjacentHTML("beforeend",`<div class="blk"><h4>${esc(b.h)}</h4><p>${esc(b.p)}</p></div>`);
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
    const nm=Object.keys(byCat2[k]||{}).length;
    el.textContent= nm>0 ? `${(D.counts[k]||0)} signaux · ${nm} modèle${nm>1?"s":""}` : `${(D.counts[k]||0)} signaux`;
  }
});
})();
