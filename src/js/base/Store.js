/**
 * Almacén de estado reactivo. Quien se suscribe recibe una notificación
 * cada vez que cambia algún valor.
 */

export class Store extends EventTarget {
    #estado;

    constructor(inicial = {}) {
        super();
        this.#estado = { ...inicial };
    }

    get estado() {
        return { ...this.#estado };
    }

    get(clave) {
        return this.#estado[clave];
    }

    /** Aplica los cambios y notifica solo si algo cambió de verdad. */
    set(parcial) {
        const cambios = {};
        for (const [clave, valor] of Object.entries(parcial)) {
            if (!Object.is(this.#estado[clave], valor)) cambios[clave] = valor;
        }
        if (Object.keys(cambios).length === 0) return false;
        Object.assign(this.#estado, cambios);
        this.dispatchEvent(new CustomEvent('cambio', { detail: { cambios, estado: this.estado } }));
        return true;
    }

    /** Devuelve una función para cancelar la suscripción. */
    subscribe(funcion) {
        const oyente = (evento) => funcion(evento.detail);
        this.addEventListener('cambio', oyente);
        return () => this.removeEventListener('cambio', oyente);
    }
}