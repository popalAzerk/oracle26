/* Pulse Search — recherche multi-sources via SearXNG (NAS) + iFixit API */
const API = window.SEARCH_API || '';            // ex. '' = même origine /api
const IFIXIT = 'https://www.ifixit.com/api/2.0/search/';

const FILTERS = [
  {label:'Tout',        frag:''},
  {label:'Batterie',    frag:'battery swollen OR "battery health"'},
  {label:'Écran',       frag:'screen replacement OR display issue'},
  {label:'iOS / bug',   frag:'iOS bug OR crash'},
  {label:'Genius Bar',  frag:'"genius bar" appointment'},
  {label:'Garantie',    frag:'warranty AppleCare'},
];
const REGIONS = [
  {label:'Monde',     frag:''},
  {label:'France',    frag:'site:.fr', lang:'fr'},
  {label:'Apple officiel', frag:'site:discussions.apple.com OR site:support.apple.com'},
];

let fragF='', fragR='', lang='fr';
const $ = id => document.getElementById(id);
const esc = s => (s||'').replace(/</g,'&lt;');

function renderFilters(){
  const f = $('filters');
  const mk = (list, cls, sel, cb) => {
    const box = document.createElement('div'); box.className='pills '+cls;
    list.forEach((o,i)=>{
      const b=document.createElement('button'); b.type='button';
      b.className='pill'+(i===sel?' on':''); b.textContent=o.label;
      b.onclick=()=>{ [...box.children].forEach(x=>x.classList.remove('on')); b.classList.add('on'); cb(o); };
      box.appendChild(b);
    });
    f.appendChild(box);
  };
  mk(FILTERS, 'pf', 0, o=>{fragF=o.frag;});
  mk(REGIONS, 'pr', 0, o=>{fragR=o.frag; if(o.lang) lang=o.lang;});
}

async function callSearx(q){
  const qq = [q, fragF, fragR].filter(Boolean).join(' ');
  const u = `${API}/search?q=${encodeURIComponent(qq)}&format=json&language=${lang}&safesearch=1`;
  const r = await fetch(u, {headers:{'Accept':'application/json'}});
  if(!r.ok) throw new Error('searx '+r.status);
  return r.json();
}

async function callIfixit(q){
  const u = IFIXIT + encodeURIComponent(q) + '?doctypes=guide,question&limit=6';
  const r = await fetch(u);
  if(!r.ok) throw new Error('ifixit '+r.status);
  const d = await r.json();
  return (d.results||[]).map(x=>({
    url: x.url || ('https://www.ifixit.com/'+ (x.namespace==='ITEM'?'Item/':'Guide/') + String(x.title||'').replace(/\s+/g,'_')),
    title: x.title||'', snippet: (x.text||x.summary||'').slice(0,180), source:'iFixit'
  }));
}

function norm(res){
  return (res||[]).map(x=>({
    url:x.url, title:x.title||x.url, snippet:esc((x.content||'').slice(0,200)),
    source: (new URL(x.url)).hostname.replace(/^www\./,''), lang: x.lang||'', date: x.publishedDate||''
  }));
}

async function run(e){
  if(e) e.preventDefault();
  const q = $('q').value.trim();
  if(!q) return;
  $('results').innerHTML = '<p class="emute">Recherche en cours…</p>';
  const out = [];
  const jobs = [ callSearx(q).then(d=>out.push(...norm(d.results).slice(0,20)))
                 .catch(err=>out.push({url:'',title:'⚠ SearXNG indisponible',snippet:String(err),source:'erreur'})) ,
                 callIfixit(q).then(d=>out.push(...d))
                 .catch(()=>out.push({url:'',title:'',snippet:'',source:''})) ];
  await Promise.allSettled(jobs);
  const seen = new Set();
  const dedup = out.filter(x=>x.url && !seen.has(x.url) && seen.add(x.url));
  $('results').innerHTML = dedup.length? dedup.map(x=>`
    <a class="rcard" href="${x.url}" target="_blank" rel="noopener">
      <span class="rsrc">${esc(x.source)}</span>
      <span class="rtit">${esc(x.title)}</span>
      <span class="rsnip">${x.snippet||''}</span>
      ${x.date?`<span class="rdate">${esc(String(x.date).slice(0,10))}</span>`:''}
    </a>`).join('')
    : '<p class="emute">Aucun résultat — reformule ou change de filtre.</p>';
}

renderFilters();
$('searchform').addEventListener('submit', run);
document.addEventListener('DOMContentLoaded', ()=>{ const q=new URLSearchParams(location.search).get('q'); if(q){ $('q').value=q; run(); } });
