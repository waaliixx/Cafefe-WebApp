import { CafeElement } from '../base/CafeElement.js';
import { html } from '../base/html.js';
import { estilos } from '../../resources/estilos/estilos.js';
import {
    router as routerGlobal,
    sesion,
    iniciarSesion,
} from '../control/servicios.js';
import { permite } from '../control/reglas.js';

export class CafeApp extends CafeElement {
    static estilos = estilos + `
        :host {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        header {
            padding: 1rem 1.5rem;
            background: var(--cafe-grano);
            color: white;
        }

        header a { color: var(--cafe-crema); }

        .marca {
            font-weight: 800;
            letter-spacing: .12em;
        }

        nav {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
            margin-top: 1rem;
        }

        main {
            width: 100%;
            max-width: 1200px;
            margin: auto;
            padding: 1.5rem;
            flex: 1;
        }

        footer {
            padding: 1rem;
            text-align: center;
            border-top: 1px solid var(--color-borde);
        }
    `;

    _router = null;
    instalacion = null;

    get router() {
        return this._router || routerGlobal;
    }

    set router(valor) {
        this._router = valor;
    }

    plantilla() {
        return html`
            <header>
                <a class="marca" href="#/orden">CAFEFE</a>

                <nav aria-label="Navegación principal"></nav>

                <p id="conexion" role="status"></p>

                <button id="instalar" hidden>
                    Instalar aplicación
                </button>
            </header>

            <main id="salida" tabindex="-1"></main>

            <footer>Cafefe · PPI115 2026</footer>
        `;
    }

    alConectar() {
        this.suscribirse(
            this.router,
            detalle => this.mostrar(detalle)
        );

        this.suscribirse(sesion, () => this.menu());

        this.menu();

        if (this.router.actual) {
            this.mostrar(this.router.actual);
        }

        this.actualizarConexion = () => {
            this.$('#conexion').textContent = navigator.onLine
                ? 'Con conexión a la red'
                : 'Sin conexión · puede consultar el menú guardado '
                    + 'y preparar su pedido';
        };

        this.antesDeInstalar = evento => {
            evento.preventDefault();
            this.instalacion = evento;
            this.$('#instalar').hidden = false;
        };

        this.yaInstalada = () => {
            this.instalacion = null;
            this.$('#instalar').hidden = true;
        };

        window.addEventListener('online', this.actualizarConexion);
        window.addEventListener('offline', this.actualizarConexion);

        window.addEventListener(
            'beforeinstallprompt',
            this.antesDeInstalar
        );

        window.addEventListener(
            'appinstalled',
            this.yaInstalada
        );

        this.actualizarConexion();

        this.$('#instalar').onclick = async () => {
            const evento = this.instalacion;

            if (!evento) return;

            this.$('#instalar').disabled = true;

            try {
                await evento.prompt();
                await evento.userChoice;
            } catch {
                this.$('#conexion').textContent =
                    'No se pudo abrir la instalación. '
                    + 'Use el menú del navegador.';
            } finally {
                this.yaInstalada();
                this.$('#instalar').disabled = false;
            }
        };
    }

    alDesconectar() {
        window.removeEventListener(
            'online',
            this.actualizarConexion
        );

        window.removeEventListener(
            'offline',
            this.actualizarConexion
        );

        window.removeEventListener(
            'beforeinstallprompt',
            this.antesDeInstalar
        );

        window.removeEventListener(
            'appinstalled',
            this.yaInstalada
        );
    }

    menu() {
        const usuario = sesion.get('usuario');

        this.$('nav').innerHTML = String(html`
            <a href="#/orden">Ordenar</a>

            ${permite(usuario, ['barista', 'cocinero'])
                ? html`<a href="#/recepcion">Recepción</a>`
                : ''}

            ${permite(usuario, ['cajero'])
                ? html`<a href="#/pago">Caja</a>`
                : ''}

            ${usuario
                ? html`
                    <span>${usuario.empleado.nombre}</span>
                    <button id="salir">Salir</button>
                `
                : html`<a href="#/login">Empleados</a>`}
        `);

        this.$('#salir')?.addEventListener('click', () => {
            iniciarSesion(null);
            this.router.navegar('/login');
        });
    }

    mostrar(detalle) {
        const etiqueta = detalle.tipo === 'ruta'
            ? detalle.ruta.componente
            : 'cafe-pantalla-no-encontrada';

        const pantalla = document.createElement(etiqueta);
        pantalla.params = detalle.params || {};

        this.$('#salida').replaceChildren(pantalla);

        document.title =
            `${detalle.ruta?.titulo || 'Cafefe'} · Cafefe`;

        this.$('#salida').focus();
    }
}

customElements.define('cafe-app', CafeApp);