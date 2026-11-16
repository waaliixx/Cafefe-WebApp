/** Error de comunicación con el backend. status 0 significa sin conexión. */
export class ApiError extends Error {
    constructor(status, mensaje, detalle = null) {
        super(mensaje);
        this.name = 'ApiError';
        this.status = status;
        this.detalle = detalle;
    }
}

/** Cliente HTTP/JSON hacia la API REST de Cafefe. fetchFn se inyecta para poder probarlo. */
export class ApiClient {
    #base;
    #fetch;

    constructor({ baseUrl, fetchFn = (...args) => globalThis.fetch(...args) }) {
        this.#base = String(baseUrl).replace(/\/+$/, '');
        this.#fetch = fetchFn;
    }

    get(ruta) {
        return this.#peticion('GET', ruta);
    }

    post(ruta, cuerpo) {
        return this.#peticion('POST', ruta, cuerpo);
    }

    put(ruta, cuerpo) {
        return this.#peticion('PUT', ruta, cuerpo);
    }

    delete(ruta) {
        return this.#peticion('DELETE', ruta);
    }

    async #peticion(metodo, ruta, cuerpo) {
        const opciones = { method: metodo, headers: { Accept: 'application/json' } };
        if (cuerpo !== undefined) {
            opciones.headers['Content-Type'] = 'application/json';
            opciones.body = JSON.stringify(cuerpo);
        }

        let respuesta;
        try {
            respuesta = await this.#fetch(`${this.#base}${ruta}`, opciones);
        } catch (causa) {
            throw new ApiError(0, 'No hay conexión con el servidor', causa);
        }

        if (!respuesta.ok) {
            let detalle = null;
            try {
                detalle = await respuesta.json();
            } catch {
                // la respuesta de error no traía JSON
            }
            throw new ApiError(respuesta.status, detalle?.mensaje ?? respuesta.statusText, detalle);
        }
        if (respuesta.status === 204) return null;
        return respuesta.json();
    }
}