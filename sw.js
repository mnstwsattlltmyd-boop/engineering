// Service Worker للمنصة الطلابية - يدعم العمل بدون إنترنت
const CACHE_NAME = 'student-platform-v3'; // تم تحديث الإصدار لتنشيط التعديلات فوراً
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-512x512.png', // إضافة الأيقونة المتاحة لديك للكاش
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
        console.log('تم فتح الـ Cache بنجاح');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('بعض الملفات لم تتمكن من التخزين:', err);
        });
      })
  );
  self.skipWaiting();
});

// تفعيل Service Worker وتحديث الملفات القديمة
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
