// memento service worker.
// Caches only static, content-hashed assets plus an offline page. Never caches pages or data:
// those are personal and must not outlive a sign-out on a shared device.
const CACHE = "memento-static-v1";
const OFFLINE_URL = "/offline";
const MAX_ENTRIES = 250;
const PRECACHE = [OFFLINE_URL, "/fonts/inter-latin.woff2", "/fonts/sora-latin.woff2", "/icons/icon-192.png"];

const isStatic = (url) =>
  url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/icons/");

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE);
      // Also keep the offline page's own CSS/JS so it renders styled without a network.
      const html = await (await cache.match(OFFLINE_URL)).text();
      const assets = [...html.matchAll(/(?:href|src)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
      await Promise.all([...new Set(assets)].map((a) => cache.add(a).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  const protectedUrls = new Set(PRECACHE.map((p) => new URL(p, self.location.origin).href));
  const removable = keys.filter((r) => !protectedUrls.has(r.url));
  for (const req of removable.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) await cache.delete(req);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isStatic(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) {
          await cache.put(request, res.clone());
          trim(cache);
        }
        return res;
      })(),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error()),
    );
  }
});
