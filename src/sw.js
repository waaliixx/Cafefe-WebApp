const VERSION = 'cafefe-ui-v12';

const ARCHIVOS = [
    'index.html',
    'manifest.webmanifest',
    'resources/imagenes/icono.svg',
    'resources/estilos/tokens.css',
    'resources/estilos/estilos.js',
    'resources/imagenes/logo-cafefe.jpg',
    'js/app.js',
    'js/base/CafeElement.js',
    'js/base/Store.js',
    'js/base/Vista.js',
    'js/base/html.js',
    'js/componentes/cafe-app.js',
    'js/componentes/cafe-tablero-recepcion.js',
    'js/componentes/cafe-tarjeta-orden.js',
    'js/componentes/cafe-carrito.js',
    'js/componentes/cafe-catalogo.js',
    'js/componentes/cafe-detalle-orden.js',
    'js/componentes/cafe-encabezado.js',
    'js/componentes/cafe-formulario-pago.js',
    'js/componentes/cafe-lista-ordenes.js',
    'js/componentes/cafe-lista-productos.js',
    'js/componentes/cafe-tarjeta-categoria.js',
    'js/config.js',
    'js/control/api.js',
    'js/control/imagen-categoria.js',
    'js/control/reglas.js',
    'js/control/servicios.js',
    'js/navegacion/router.js',
    'js/navegacion/rutas.js',
    'js/pantallas/login.js',
    'js/pantallas/orden.js',
    'js/pantallas/pago.js',
    'js/pantallas/pantalla-no-encontrada.js',
    'js/pantallas/pendientes.js',
];

const URLs = new Set(
    ARCHIVOS.map(archivo => new URL(archivo, self.registration.scope).href)
);

self.addEventListener('install', evento => {
    evento.waitUntil(
        caches.open(VERSION).then(cache => cache.addAll([...URLs]))
    );
});

self.addEventListener('activate', evento => {
    evento.waitUntil((async () => {
        const claves = await caches.keys();
        await Promise.all(
            claves.filter(clave => clave.startsWith('cafefe-ui-') && clave !== VERSION)
                .map(clave => caches.delete(clave))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', evento => {
    if (evento.request.method !== 'GET') return;

    const url = new URL(evento.request.url);
    url.search = '';
    url.hash = '';

    if (evento.request.mode === 'navigate'
        && url.href === self.registration.scope) {
        url.pathname += 'index.html';
    }

    if (!URLs.has(url.href)) return;

    evento.respondWith((async () => {
        const cache = await caches.open(VERSION);
        const guardado = await cache.match(url.href);
        if (guardado) return guardado;

        try {
            return await fetch(evento.request);
        } catch {
            return new Response('Recurso no disponible sin conexión.', {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }
    })());
});
