// የእዳ መዝገብ — Service Worker (ከመስመር ውጭ እንዲሰራ)
// index.html ባሻሻልክ ቁጥር CACHE ን ቀይር (v1 → v2 …) የድሮው ካሽ እንዲጸዳ።
const CACHE = 'edha-v2';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ካሽ ካለ ወዲያው ይመልሳል፣ ከጀርባ ከኢንተርኔት ያሻሽላል። ኢንተርኔት ከሌለ ካሽ ብቻ።
// ከሌላ ድር (ለምሳሌ Telegram) የሚሄዱ ጥያቄዎችን አይነካም።
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(cached => {
      const net = fetch(req).then(res => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || net;
    })
  );
});
