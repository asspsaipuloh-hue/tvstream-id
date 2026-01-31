addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  let targetUrl = url.searchParams.get('url');

  if (!targetUrl) return new Response('Missing url param', { status: 400 });

  targetUrl = decodeURIComponent(targetUrl);

  // Izinkan hanya domain aman (tambah kalau perlu)
  const allowedDomains = ['sindikasi.inews.id', 'vidio.com', 'metube.id', 'detik.com', 'transtv.co.id', 'antvklik.com'];
  if (!allowedDomains.some(domain => targetUrl.includes(domain))) {
    return new Response('Domain not allowed', { status: 403 });
  }

  const headers = new Headers(request.headers);
  headers.set('Referer', 'https://www.vidio.com/');  // Atau ganti sesuai channel (e.g., rctiplus.com)
  headers.set('Origin', 'https://www.vidio.com');
  headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    redirect: 'follow'
  });

  let response = await fetch(proxyRequest);
  if (response.redirected) {
    response = await fetch(response.url, { headers });
  }

  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Headers', '*');

  return newResponse;
}
