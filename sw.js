/* Senza rete: prima prova la rete, se manca usa la copia. Librerie, caratteri e foto: prima la copia. */
const C = 'iron-1', OUT = ['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'images.unsplash.com'];
/* Alla prima apertura mette da parte anche librerie e caratteri, così la seconda funziona già senza rete. */
async function prep() { const c = await caches.open(C); await c.addAll(['./', 'manifest.webmanifest', 'icona-180.png']); const h = await (await c.match('./')).text(), put = async u => { try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) await c.put(u, r); return r.ok ? c.match(u) : null; } catch (e) { return null; } };
  const L = [...h.matchAll(/(?:src|href)="(https:\/\/(?:unpkg\.com|fonts\.googleapis\.com)\/[^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&')); for (const u of L) { const r = await put(u); if (r && u.includes('googleapis')) for (const m of (await r.text()).matchAll(/url\((https:[^)]+)\)/g)) await put(m[1]); } }
self.addEventListener('install', e => e.waitUntil(prep().then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('iron-') && x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url), own = u.origin === location.origin; if (!own && !OUT.includes(u.hostname)) return; if (own && u.pathname.includes('/test/')) return;
  const keep = x => { if (x && (x.ok || x.type === 'opaque')) { const y = x.clone(); caches.open(C).then(c => c.put(r, y)); } return x; };
  e.respondWith(own ? fetch(r).then(keep).catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || (r.mode === 'navigate' ? caches.match('./') : Response.error()))) : caches.match(r, { ignoreVary: true }).then(x => x || fetch(r).then(keep))); });
