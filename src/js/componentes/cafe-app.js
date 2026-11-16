import { CafeElement } from '../base/CafeElement.js';
import { html } from '../base/html.js';
import { estilos } from '../../resources/estilos/estilos.js';

import {
    router as routerGlobal,
    sesion,
    iniciarSesion
} from '../control/servicios.js';

import './cafe-encabezado.js';

export class CafeApp extends CafeElement {
    static estilos = estilos + `
        :host {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
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
            main {
                padding: 1rem;
            }
        }
    `;

    _router = null;
    instalacion = null;
    esIOS = false;

    get router() {
        return this._router || routerGlobal;
    }

    set router(valor) {
        this._router = valor;
    }

    plantilla() {
        return html`
            <cafe-encabezado></cafe-encabezado>

            <main id="salida" tabindex="-1"></main>

            <footer>
                <p>Cafefe · PPI115 2026</p>

                <p id="conexion" role="status"></p>

                <button id="instalar" type="button" hidden>
                    Instalar aplicación
                </button>
                <p id="ayuda-instalacion" hidden role="status"></p>
            </footer>
        `;
    }

    alConectar() {
        this.$('cafe-encabezado').addEventListener(
            'cafefe:salir',
            () => {
                iniciarSesion(null);
                this.router.navegar('/login');
            }
        );

        this.suscribirse(
            this.router,
            detalle => this.mostrar(detalle)
        );

        this.suscribirse(
            sesion,
            () => this.menu()
        );

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
            this.$('#ayuda-instalacion').hidden = true;
        };

        this.yaInstalada = () => {
            this.instalacion = null;
            this.$('#instalar').hidden = true;
            this.$('#ayuda-instalacion').hidden = true;
        };

        const agente = navigator.userAgent || '';
        this.esIOS = /iPad|iPhone|iPod/.test(agente)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const instalada = window.matchMedia('(display-mode: standalone)').matches
            || navigator.standalone === true;
        if (this.esIOS && !instalada) {
            this.$('#instalar').hidden = false;
        }

        window.addEventListener(
            'online',
            this.actualizarConexion
        );

        window.addEventListener(
            'offline',
            this.actualizarConexion
        );

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
            const boton = this.$('#instalar');
            const ayuda = this.$('#ayuda-instalacion');
            if (this.esIOS && !this.instalacion) {
                ayuda.textContent = 'En Safari: tocá Compartir y elegí “Agregar a pantalla de inicio”.';
                ayuda.hidden = false;
                return;
            }

            const evento = this.instalacion;
            if (!evento) return;
            boton.disabled = true;
            this.instalacion = null;
            try {
                await evento.prompt();
                const resultado = await evento.userChoice;
                boton.hidden = true;
                if (resultado.outcome !== 'accepted') {
                    ayuda.textContent = 'También podés instalar Cafefe desde el menú de tu navegador.';
                    ayuda.hidden = false;
                }
            } catch {
                ayuda.textContent = 'Abrí el menú del navegador y seleccioná “Instalar aplicación”.';
                ayuda.hidden = false;
            } finally {
                boton.disabled = false;
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
        this.$('cafe-encabezado').setEstado({
            usuario: sesion.get('usuario')
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