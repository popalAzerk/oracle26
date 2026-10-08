export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const lang = url.searchParams.get('lang') || 'fr';
  if (!q) return Response.json({ results: [] });
  const target = 'https://searx.popalazerk.com/search?q=' + encodeURIComponent(q) +
    '&format=json&language=' + encodeURIComponent(lang) + '&safesearch=1';
  const r = await fetch(target, { headers: { 'Accept': 'application/json', 
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' } });
  if (!r.ok) return Response.json({ results: [], error: 'searx ' + r.status }, { status: 200 });
  const d = await r.json();
  return Response.json(d, { headers: { 'Access-Control-Allow-Origin': '*' } });
}
