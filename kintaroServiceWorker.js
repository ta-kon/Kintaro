'use strict';

// 作成日: 2018/07/22
const CashVersion = '201807282350';

const CashFiles = [
    // CDN
    'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.1.1/superhero/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-datetimepicker/2.7.1/css/bootstrap-material-datetimepicker.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-datetimepicker/2.7.1/js/bootstrap-material-datetimepicker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/push.js/1.0.5/push.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/decimal.js/10.0.1/decimal.min.js',

    // github.io
    'https://pages-themes.github.io/slate/assets/images/blacktocat.png',

    // Site Source
    './js/kintaroCommonFunc.js',
    './js/kintaroModel.js',
    './js/kintaroCalc.js',
    './js/kintaroView.js',
    './js/kintaroNotify.js',
    './css/kintaro.css',
    './img/kintaro-icon.png',
    './',
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CashVersion).then(function (cache) {
            return cache.addAll(CashFiles).then(function () {
                self.skipWaiting();
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('Service Worker activate');
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // キャッシュがあったなら、そのレスポンスを返す
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
            )
    );
});