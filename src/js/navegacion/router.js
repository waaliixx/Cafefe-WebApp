/**
 * Enrutador por hash (#/ruta) para la SPA.
 *
 * Una ruta es { path, componente, titulo?, ...datos }. path admite parámetros
 * (/orden/:id) y '*' sirve de ruta comodín. guard(ruta, params) devuelve
 * true para permitir, un texto con la ruta a la que redirigir, o false para negar.
 */
export class Router extends EventTarget {
    #rutas;
    #guard;
    #ventana;
    #actual = null;

    constructor({ rutas = [], guard = () => true, ventana = globalThis.window } = {}) {
        super();
        this.#rutas = rutas.map((ruta) => ({ ruta, patron: Router.compilar(ruta.path) }));
        this.#guard = guard;
        this.#ventana = ventana;
    }

    static normalizar(hash = '') {
        let path = String(hash).replace(/^#/, '').split('?')[0];
        if (!path.startsWith('/')) path = `/${path}`;
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        return path;
    }

    static compilar(path) {
        if (path === '*') return { regex: /^.*$/, nombres: [] };
        const nombres = [];
        const fuente = Router.normalizar(path)
            .split('/')
            .map((segmento) => {
                if (segmento.startsWith(':')) {
                    nombres.push(segmento.slice(1));
                    return '([^/]+)';
                }
                return segmento.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            })
            .join('/');
        return { regex: new RegExp(`^${fuente}$`), nombres };
    }

    get actual() {
        return this.#actual;
    }

    resolver(path) {
        const limpio = Router.normalizar(path);
        for (const { ruta, patron } of this.#rutas) {
            const coincidencia = patron.regex.exec(limpio);
            if (!coincidencia) continue;
            const params = {};
            patron.nombres.forEach((nombre, i) => {
                params[nombre] = decodeURIComponent(coincidencia[i + 1]);
            });
            return { ruta, params, path: limpio };
        }
        return null;
    }

    /** Decide qué hacer con un path, sin tocar el navegador. */
    evaluar(path) {
        const encontrada = this.resolver(path);
        if (!encontrada) return { tipo: 'no-encontrada', path: Router.normalizar(path) };
        const decision = this.#guard(encontrada.ruta, encontrada.params);
        if (decision === true || decision === undefined) return { tipo: 'ruta', ...encontrada };
        if (typeof decision === 'string') return { tipo: 'redirigir', path: Router.normalizar(decision) };
        return { tipo: 'prohibido', ...encontrada };
    }

    navegar(path) {
        this.#ventana.location.hash = Router.normalizar(path);
    }

    /** Escucha los cambios del hash y procesa la ruta inicial. */
    iniciar() {
        this.#ventana.addEventListener('hashchange', () => this.#procesar());
        this.#procesar();
    }

    /** Misma interfaz que Store.subscribe: devuelve la función para darse de baja. */
    subscribe(funcion) {
        const oyente = (evento) => funcion(evento.detail);
        this.addEventListener('ruta', oyente);
        return () => this.removeEventListener('ruta', oyente);
    }

    #procesar() {
        const resultado = this.evaluar(this.#ventana.location.hash);
        if (resultado.tipo === 'redirigir') {
            this.navegar(resultado.path);
            return;
        }
        this.#actual = resultado;
        this.dispatchEvent(new CustomEvent('ruta', { detail: resultado }));
    }
}