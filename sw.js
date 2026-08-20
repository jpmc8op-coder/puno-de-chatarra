/* ---------- SERVICE WORKER ----------
   Guarda el juego entero en el móvil para que arranque sin conexión. Como todo
   vive en un único index.html, el "app shell" son cuatro archivos.

   IMPORTANTE: al publicar una versión nueva hay que subir VERSION. Si no, el
   móvil sigue sirviendo la copia vieja de la caché y parece que los cambios no
   se han aplicado.                                                            */
const VERSION = "pdc-v8";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icono-192.png",
  "./icono-512.png",
  "./icono-maskable.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Red primero y caché de respaldo: así, con cobertura, siempre ve la última
   versión, y sin cobertura sigue jugando. Al revés (caché primero) tendría que
   desinstalar para ver una actualización. */
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
