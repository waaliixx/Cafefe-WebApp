import { html } from './html.js';

/**
 * Clase base de todos los Web Components de Cafefe.
 *
 * Hooks que las subclases pueden sobrescribir:
 *   plantilla()            -> devuelve el HTML (usar html`...` para escapar valores)
 *   alConectar()           -> después del primer renderizado; ideal para suscribirse y pedir datos
 *   alDesconectar()        -> limpieza adicional
 *   despuesDeRenderizar()  -> enlazar eventos del DOM recién creado
 */
export class CafeElement extends HTMLElement {
    static estilos = '';

    #estado = {};
    #bajas = [];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    get estado() {
        return this.#estado;
    }

    connectedCallback() {
        this.renderizar();
        this.alConectar();
    }

    disconnectedCallback() {
        this.#bajas.splice(0).forEach((baja) => baja());
        this.alDesconectar();
    }

    alConectar() {}

    alDesconectar() {}

    despuesDeRenderizar() {}

    plantilla() {
        return html``;
    }

    /** Cambia el estado y vuelve a dibujar el componente. */
    setEstado(parcial) {
        Object.assign(this.#estado, parcial);
        if (this.isConnected) this.renderizar();
    }

    /** Se suscribe a una fuente con subscribe(fn) y se da de baja al desconectarse. */
    suscribirse(fuente, funcion) {
        const baja = fuente.subscribe(funcion);
        this.#bajas.push(baja);
        return baja;
    }

    renderizar() {
        const estilos = this.constructor.estilos;
        this.shadowRoot.innerHTML = `<style>${estilos}</style>${this.plantilla()}`;
        this.despuesDeRenderizar();
    }

    emitir(nombre, detalle) {
        this.dispatchEvent(new CustomEvent(nombre, { detail: detalle, bubbles: true, composed: true }));
    }

    $(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}