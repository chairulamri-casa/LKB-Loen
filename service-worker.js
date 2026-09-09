// Service Worker — Buku LKB Cloud
// Fungsi utama: membuat aplikasi ini bisa "diinstall" (PWA) di HP/laptop.
// Data tetap perlu koneksi internet (tersimpan di Supabase), tapi tampilan
// aplikasinya (app shell) bisa langsung muncul cepat berkat cache ini.

const CACHE_NAME = 'buku-lkb-shell-v1';
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {}) // jangan sampai gagal install cuma karena satu aset tidak ke-cache
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Untuk permintaan HTML (buka halaman): coba jaringan dulu supaya selalu
  // dapat versi teraktual; kalau sedang offline, baru pakai salinan cache.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Untuk aset lain (manifest, ikon, dll): coba cache dulu, baru jaringan.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});
