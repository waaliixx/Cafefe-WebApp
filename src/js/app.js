import './login.js';
import './orden.js';
import './pendientes.js';
import './pago.js';
import './pantallas/cafe-pantalla-no-encontrada.js';
import './componentes/cafe-app.js';

import { router } from './servicios.js';

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