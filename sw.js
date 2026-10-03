// ===== sw.js - Service Worker ستاره =====

var CACHE_VERSION = 'setareh-v2.0.0';
var CACHE_NAME = CACHE_VERSION;

var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/main.css',
  './css/themes.css',
  './css/animations.css',
  './css/profile.css',
  './css/settings.css',
  './css/menu.css',
  './css/rps.css',
  './css/guess.css',
  './css/ttt.css',
  './css/memory.css',
  './css/calc.css',
  './css/planner.css',
  './css/qa.css',
  './css/wheel.css',
  './css/missions.css',
  './js/i18n.js',
  './js/audio.js',
  './js/tick.js',
  './js/storage.js',
  './js/state.js',
  './js/router.js',
  './js/data/qa-history.js',
  './js/data/qa-geo.js',
  './js/data/qa-science.js',
  './js/data/qa-literature.js',
  './js/data/qa-religion.js',
  './js/data/qa-sport.js',
  './js/data/qa-entertainment.js',
  './js/data/qa-general.js',
  './assets/poems.json',
  './js/games/rps.js',
  './js/games/guess.js',
  './js/games/ttt.js',
  './js/games/memory.js',
  './js/tools/calc.js',
  './js/tools/planner.js',
  './js/tools/qa-ai.js',
  './js/tools/qa.js',
  './js/wheel.js',
  './js/missions.js',
  './js/shop.js',
  './js/settings.js',
  './js/profile.js',
  './js/app.js'
];

self.addEventListener('install', function(event) {
  console.log('📦 SW: installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(
        ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('⚠️ failed:', url);
          });
        })
      );
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(name) {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(function() {
      return new Response('', { status: 503 });
    }));
    return;
  }

  event.respondWith(
    caches.match(request).then(function(cached) {
      if (cached) return cached;

      return fetch(request).then(function(response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(function() {
        if (request.headers.get('accept') &&
            request.headers.get('accept').indexOf('text/html') >= 0) {
          return caches.match('./index.html');
        }
        return new Response('آفلاین هستی', { status: 503 });
      });
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
