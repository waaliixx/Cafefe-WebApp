const VERSION = 'cafefe-ui-v1';

const ARCHIVOS = [
    './',
    'index.html',
    'manifest.webmanifest',

    'resources/estilos/tokens.css',

    'js/app.js',
    'js/config.js',
    'js/api.js',
    'js/router.js',
    'js/rutas.js',
    'js/servicios.js',
    'js/reglas.js',
    'js/estilos.js',
    'js/vista.js',

    'js/login.js',
    'js/orden.js',
    'js/pendientes.js',
    'js/pago.js',

    'js/base/CafeElement.js',
    'js/base/Store.js',
    'js/base/html.js',

    'js/componentes/cafe-app.js',
    'js/pantallas/cafe-pantalla-no-encontrada.js',
];

const URLs = new Set(
    ARCHIVOS.map(archivo =>
        new URL(archivo, self.registration.scope).href
    )
);

self.addEventListener('install', evento => {
    evento.waitUntil(
        caches.open(VERSION)
            .then(cache => cache.addAll(ARCHIVOS))
    );
});

self.addEventListener('activate', evento => {
    evento.waitUntil(
        caches.keys()
            .then(claves => Promise.all(
                claves
                    .filter(clave =>
                        clave.startsWith('cafefe-ui-')
                        && clave !== VERSION
                    )
                    .map(clave => caches.delete(clave))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', evento => {
    const url = new URL(evento.request.url);
    url.search = '';

    if (
        evento.request.method !== 'GET'
        || !URLs.has(url.href)
    ) {
        return;
    }

    evento.respondWith(
        caches.match(url.href)
            .then(guardado =>
                guardado || fetch(evento.request)
            )
    );
});