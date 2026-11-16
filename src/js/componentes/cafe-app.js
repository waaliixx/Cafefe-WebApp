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
        background: var(--cafe-grano);
        color: var(--cafe-crema);
    }

    .barra {
        width: 100%;
        max-width: 1200px;
        margin: auto;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
    }

    .marca {
        display: inline-flex;
        align-items: center;
        gap: 1rem;
        color: var(--cafe-crema);
        text-decoration: none;
        flex-shrink: 0;
    }

    .logo {
        width: 78px;
        height: 78px;
        object-fit: contain;
        border-radius: .65rem;
        background: #f4ecdf;
    }

    .titulo {
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 800;
        letter-spacing: .025em;
        line-height: 1.1;
    }

    nav {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        text-align: right;
    }

    nav a {
        color: var(--cafe-crema);
        text-underline-offset: .25em;
    }

    .acceso {
        display: grid;
        gap: .35rem;
        margin: 0;
        line-height: 1.5;
    }

    .acceso a {
        color: var(--cafe-caramelo);
        font-weight: 700;
    }

    #salir {
        background: var(--cafe-crema);
        color: var(--cafe-grano);
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

    footer p {
        margin: .4rem 0;
    }

    #conexion {
        color: #66584d;
        font-size: .85rem;
    }

    #instalar {
        margin-top: .7rem;
    }

    @media (max-width: 520px) {
        .barra {
            padding: 1rem;
            gap: .8rem;
            flex-wrap: wrap;
        }

        .marca {
            gap: .65rem;
        }

        .logo {
            width: 60px;
            height: 60px;
        }

        nav {
            margin-left: auto;
            font-size: .9rem;
        }

        main {
            padding: 1rem;
        }
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
            <div class="barra">
                <a
                    class="marca"
                    href="#/orden"
                    aria-label="Cafefe, ir a pedidos">

                    <img
                        class="logo"
                        src="resources/imagenes/logo-cafefe.jpg"
                        alt=""
                        width="78"
                        height="78">

                    <span class="titulo">Cafefe</span>
                </a>

                <nav aria-label="Acceso de empleados"></nav>
            </div>
        </header>

        <main id="salida" tabindex="-1"></main>

        <footer>
            <p>Cafefe · PPI115 2026</p>

            <p id="conexion" role="status"></p>

            <button id="instalar" hidden>
                Instalar aplicación
            </button>
        </footer>
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
        ${usuario
            ? html`
                <span>${usuario.empleado.nombre}</span>

                ${permite(usuario, ['barista', 'cocinero'])
                    ? html`
                        <a href="#/recepcion">Recepción</a>
                    `
                    : ''}

                ${permite(usuario, ['cajero'])
                    ? html`
                        <a href="#/pago">Caja</a>
                    `
                    : ''}

                <button id="salir" type="button">
                    Salir
                </button>
            `
            : html`
                <p class="acceso">
                    <span>¿Quieres iniciar sesión?</span>

                    <a
                        href="#/login"
                        aria-label="Haz click aquí para iniciar sesión">
                        Haz click aquí
                    </a>
                </p>
            `}
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