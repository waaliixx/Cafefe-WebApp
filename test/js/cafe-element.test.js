import { CafeElement } from '../../src/js/base/CafeElement.js';
import { Store } from '../../src/js/base/Store.js';
import { html } from '../../src/js/base/html.js';

class PruebaSaludo extends CafeElement {
    static estilos = 'p { color: red; }';

    constructor() {
        super();
        this.estado.nombre = 'mundo';
    }

    plantilla() {
        return html`<p>Hola ${this.estado.nombre}</p>`;
    }
}
customElements.define('prueba-saludo', PruebaSaludo);

class PruebaSuscrita extends CafeElement {
    fuente = null;

    alConectar() {
        this.suscribirse(this.fuente, () => this.setEstado({ veces: (this.estado.veces ?? 0) + 1 }));
    }

    plantilla() {
        return html`<span>${this.estado.veces ?? 0}</span>`;
    }
}
customElements.define('prueba-suscrita', PruebaSuscrita);

describe('CafeElement', () => {
    let caja;

    beforeEach(() => {
        caja = document.createElement('div');
        document.body.append(caja);
    });

    afterEach(() => caja.remove());

    it('dibuja la plantilla y los estilos en el shadow root', () => {
        const el = document.createElement('prueba-saludo');
        caja.append(el);

        expect(el.shadowRoot.querySelector('p').textContent).to.equal('Hola mundo');
        expect(el.shadowRoot.querySelector('style').textContent).to.contain('color: red');
    });

    it('escapa los valores para evitar inyección de HTML', () => {
        const el = document.createElement('prueba-saludo');
        el.estado.nombre = '<img src=x>';
        caja.append(el);

        expect(el.shadowRoot.querySelector('img')).to.equal(null);
        expect(el.shadowRoot.querySelector('p').textContent).to.equal('Hola <img src=x>');
    });

    it('setEstado vuelve a dibujar el componente', () => {
        const el = document.createElement('prueba-saludo');
        caja.append(el);

        el.setEstado({ nombre: 'Ana' });

        expect(el.shadowRoot.querySelector('p').textContent).to.equal('Hola Ana');
    });

    it('emitir lanza un evento que atraviesa el shadow DOM', () => {
        const el = document.createElement('prueba-saludo');
        caja.append(el);
        const oyente = sinon.spy();
        document.addEventListener('prueba-evento', oyente);

        el.emitir('prueba-evento', { x: 1 });
        document.removeEventListener('prueba-evento', oyente);

        expect(oyente.calledOnce).to.equal(true);
        expect(oyente.firstCall.args[0].detail).to.deep.equal({ x: 1 });
    });

    it('reacciona a su fuente de datos mientras está conectado', () => {
        const fuente = new Store({ a: 0 });
        const el = document.createElement('prueba-suscrita');
        el.fuente = fuente;
        caja.append(el);

        fuente.set({ a: 1 });

        expect(el.shadowRoot.querySelector('span').textContent).to.equal('1');
    });

    it('se da de baja de su fuente al desconectarse', () => {
        const fuente = new Store({ a: 0 });
        const el = document.createElement('prueba-suscrita');
        el.fuente = fuente;
        caja.append(el);

        el.remove();
        fuente.set({ a: 1 });

        expect(el.estado.veces).to.equal(undefined);
    });
});