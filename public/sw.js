// Web Share Target API を利用したスタンプ
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // If this is an incoming POST request for the
  // registered "action" URL, respond to it.
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(Response.redirect('/#/push', 303));
    event.waitUntil(
      (async function () {
        const data = await event.request.formData();
        const client = await self.clients.get(
          event.resultingClientId || event.clientId
        );

        const file = data.get('file');
        // send the image data to the client
        client.postMessage({ file, action: 'load-image' });
      })()
    );
  }
});
