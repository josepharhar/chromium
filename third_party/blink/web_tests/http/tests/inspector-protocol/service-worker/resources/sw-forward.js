this.addEventListener('fetch', fetchEvent => {
  console.log('sw-forward.js forwarding fetch for url: ' + fetchEvent.request.url);
  fetchEvent.respondWith(fetch(fetchEvent.request.url));
});
