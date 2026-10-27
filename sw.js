// የእዳ መዝገብ — Service Worker (ከመስመር ውጭ እንዲሰራ)
// index.html ባሻሻልክ ቁጥር CACHE ን ቀይር (v14 → v15 …)
const CACHE = 'edha-v14';
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

// የአፑ ገጽ፡ መጀመሪያ ከኢንተርኔት (አዲስ ስሪት ወዲያው እንዲመጣ)፣ ኢንተርኔት ከሌለ ከካሽ።
// ሌሎች ፋይሎች፡ ካሽ ወዲያው፣ ከጀርባ ያሻሽላል። ከሌላ ድር (Telegram) የሚሄዱትን አይነካም።
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const keep = res => { if (res && res.status === 200) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; };
  if (req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname)) {
    e.respondWith(fetch(req).then(keep).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(cached => cached || fetch(req).then(keep)));
});
