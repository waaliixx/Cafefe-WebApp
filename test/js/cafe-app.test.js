import '../../src/js/componentes/cafe-app.js';
import { CafeElement } from '../../src/js/base/CafeElement.js';
import { html } from '../../src/js/base/html.js';

class PruebaPantalla extends CafeElement {
    plantilla() {
        return html`<h1>Pantalla ${this.params?.id ?? 'sin id'}</h1>`;
    }
}
customElements.define('prueba-pantalla', PruebaPantalla);

class RouterFalso {
    actual = null;
    #oyentes = [];

    subscribe(fn) {
        this.#oyentes.push(fn);
        return () => { this.#oyentes = this.#oyentes.filter((o) => o !== fn); };
    }

    emitir(detalle) {
        this.actual = detalle;
        this.#oyentes.forEach((fn) => fn(detalle));
    }

    get oyentes() {
        return this.#oyentes.length;
    }
}

describe('cafe-app (contenedor de la SPA)', () => {
    let caja;
    let router;
    let app;

    beforeEach(() => {
        caja = document.createElement('div');
        document.body.append(caja);
        router = new RouterFalso();
        app = document.createElement('cafe-app');
        app.router = router;
        caja.append(app);
    });

    afterEach(() => caja.remove());

    it('dibuja cabecera, zona de contenido y pie', () => {
        expect(app.shadowRoot.querySelector('header')).to.not.equal(null);
        expect(app.shadowRoot.querySelector('main')).to.not.equal(null);
        expect(app.shadowRoot.querySelector('footer')).to.not.equal(null);
    });

    it('muestra la pantalla de la ruta activa y le pasa los parámetros', () => {
        router.emitir({
            tipo: 'ruta',
            ruta: { componente: 'prueba-pantalla', titulo: 'Detalle' },
            params: { id: '42' },
        });

        const pantalla = app.shadowRoot.querySelector('#salida prueba-pantalla');
        expect(pantalla).to.not.equal(null);
        expect(pantalla.shadowRoot.querySelector('h1').textContent).to.equal('Pantalla 42');
    });

    it('reemplaza la pantalla anterior al navegar', () => {
        router.emitir({ tipo: 'ruta', ruta: { componente: 'prueba-pantalla' }, params: { id: '1' } });
        router.emitir({ tipo: 'ruta', ruta: { componente: 'prueba-pantalla' }, params: { id: '2' } });

        const pantallas = app.shadowRoot.querySelectorAll('#salida prueba-pantalla');
        expect(pantallas.length).to.equal(1);
        expect(pantallas[0].shadowRoot.querySelector('h1').textContent).to.equal('Pantalla 2');
    });

    it('actualiza el título del documento', () => {
        router.emitir({ tipo: 'ruta', ruta: { componente: 'prueba-pantalla', titulo: 'Pedidos' }, params: {} });
        expect(document.title).to.equal('Pedidos · Cafefe');
    });

    it('muestra la pantalla de no encontrada si la ruta no es válida', () => {
        router.emitir({ tipo: 'prohibido', ruta: { componente: 'prueba-pantalla' }, params: {} });
        expect(app.shadowRoot.querySelector('#salida cafe-pantalla-no-encontrada')).to.not.equal(null);
    });

    it('muestra la ruta que ya estaba activa al conectarse', () => {
        const otroRouter = new RouterFalso();
        otroRouter.actual = { tipo: 'ruta', ruta: { componente: 'prueba-pantalla' }, params: { id: '9' } };
        const otra = document.createElement('cafe-app');
        otra.router = otroRouter;
        caja.append(otra);

        expect(otra.shadowRoot.querySelector('#salida prueba-pantalla')).to.not.equal(null);
    });

    it('deja de escuchar al router cuando se desconecta', () => {
        expect(router.oyentes).to.equal(1);
        app.remove();
        expect(router.oyentes).to.equal(0);
    });
});