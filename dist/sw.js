// Service Worker désactivé en dev - utiliser sur production seulement
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
