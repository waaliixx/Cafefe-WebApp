import './pantallas/login.js';
import './pantallas/orden.js';
import './pantallas/pendientes.js';
import './pantallas/pago.js';
import './pantallas/pantalla-no-encontrada.js';
import './componentes/cafe-app.js';

import { router } from './control/servicios.js';

router.iniciar();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register(new URL('../sw.js', import.meta.url))
        .catch(() => {
            const aviso = document.createElement('p');

            aviso.setAttribute('role', 'alert');
            aviso.textContent =
                'No se pudo activar el modo offline. '
                + 'Revise que la aplicación se sirva '
                + 'por HTTPS o localhost.';

            document.querySelector('cafe-app')
                ?.shadowRoot
                .querySelector('footer')
                .append(aviso);
        });
}