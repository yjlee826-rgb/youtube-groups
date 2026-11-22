// 안드로이드 크롬이 다락을 '설치된 앱'으로 인식하게 하는 최소한의 서비스 워커.
// 아무것도 저장(캐시)하지 않음 → 새 버전이 늦게 보이는 문제가 생기지 않음
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => { if (e.request.mode === 'navigate') e.respondWith(fetch(e.request)); });
