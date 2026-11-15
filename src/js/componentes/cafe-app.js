import { CafeElement } from '../base/CafeElement.js';
import { html } from '../base/html.js';
import { router as routerGlobal } from '../servicios.js';

/** Contenedor principal: cabecera, zona donde se muestra la pantalla activa y pie. */
export class CafeApp extends CafeElement {
    static estilos = `
        :host { display: flex; flex-direction: column; min-height: 100vh; }
        header {
            display: flex; align-items: center; gap: var(--espacio-3);
            padding: var(--espacio-3) var(--espacio-4);
            background: var(--cafe-grano); color: var(--cafe-crema);
        }
        .marca {
            color: var(--cafe-caramelo); font-weight: 700; font-size: 1.5rem;
            letter-spacing: 0.08em; text-decoration: none;
        }
        main { flex: 1; padding: var(--espacio-4); outline: none; }
        footer {
            padding: var(--espacio-3); text-align: center; font-size: 0.85rem;
            background: var(--cafe-crema); border-top: 1px solid var(--color-borde);
        }
        @media (max-width: 600px) {
            header { padding: var(--espacio-2) var(--espacio-3); }
            main { padding: var(--espacio-3); }
        }
    `;

    #router = null;

    get router() {
        return this.#router ?? routerGlobal;
    }

    set router(valor) {
        this.#router = valor;
    }

    plantilla() {
        return html`
            <header>
                <a class="marca" href="#/" aria-label="Cafefe, ir al inicio">CAFEFE</a>
            </header>
            <main id="salida" tabindex="-1"></main>
            <footer>Cafefe · PPI115 2026</footer>
        `;
    }

    alConectar() {
        this.suscribirse(this.router, (detalle) => this.#mostrar(detalle));
        if (this.router.actual) this.#mostrar(this.router.actual);
    }

    #mostrar(detalle) {
        const salida = this.$('#salida');
        if (!salida) return;
        const etiqueta = detalle.tipo === 'ruta' ? detalle.ruta.componente : 'cafe-pantalla-no-encontrada';
        const pantalla = document.createElement(etiqueta);
        pantalla.params = detalle.params ?? {};
        salida.replaceChildren(pantalla);
        document.title = `${detalle.ruta?.titulo ?? 'Cafefe'} · Cafefe`;
        salida.focus();
    }
}

if (!customElements.get('cafe-app')) customElements.define('cafe-app', CafeApp);