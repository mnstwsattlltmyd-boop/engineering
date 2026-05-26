// Service Worker للمنصة الطلابية - يدعم العمل بدون إنترنت
const CACHE_NAME = 'student-platform-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الـ Cache');
        // محاولة تخزين الملفات الأساسية فقط
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]).catch(err => {
          console.log('بعض الملفات لم تتمكن من التخزين:', err);
        });
      })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الـ Cache القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// اعتراض الطلبات والاستجابة من الـ Cache أو الإنترنت
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير الـ GET
  if (event.request.method !== 'GET') {
    return;
  }

  // استراتيجية Cache First للملفات الثابتة
  if (event.request.url.includes('cdnjs.cloudflare.com') || 
      event.request.url.includes('cdn.jsdelivr.net') ||
      event.request.url.includes('fonts')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
        })
        .catch(() => {
          // إرجاع صفحة بديلة عند فشل الاتصال
          return caches.match('/index.html');
        })
    );
    return;
  }

  // استراتيجية Network First للصفحات الديناميكية
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            return response || caches.match('/index.html');
          });
      })
  );
});

// معالج الرسائل من الصفحة الرئيسية
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// إرسال إشعار عند التحديث
self.addEventListener('controllerchange', () => {
  console.log('تم تحديث Service Worker');
});
