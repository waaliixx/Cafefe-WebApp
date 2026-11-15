import { Store } from '../../src/js/base/Store.js';

describe('Store (estado reactivo)', () => {
    it('guarda el estado inicial', () => {
        const store = new Store({ usuario: null, total: 0 });
        expect(store.get('total')).to.equal(0);
        expect(store.estado).to.deep.equal({ usuario: null, total: 0 });
    });

    it('notifica a los suscriptores solo con lo que cambió', () => {
        const store = new Store({ a: 1, b: 2 });
        const oyente = sinon.spy();
        store.subscribe(oyente);

        store.set({ a: 1, b: 3 });

        expect(oyente.calledOnce).to.equal(true);
        expect(oyente.firstCall.args[0].cambios).to.deep.equal({ b: 3 });
        expect(oyente.firstCall.args[0].estado).to.deep.equal({ a: 1, b: 3 });
    });

    it('no notifica si no hay cambios', () => {
        const store = new Store({ a: 1 });
        const oyente = sinon.spy();
        store.subscribe(oyente);

        expect(store.set({ a: 1 })).to.equal(false);
        expect(oyente.called).to.equal(false);
    });

    it('permite darse de baja', () => {
        const store = new Store({ a: 1 });
        const oyente = sinon.spy();
        const baja = store.subscribe(oyente);

        baja();
        store.set({ a: 2 });

        expect(oyente.called).to.equal(false);
    });

    it('no deja modificar el estado desde afuera', () => {
        const store = new Store({ a: 1 });
        store.estado.a = 99;
        expect(store.get('a')).to.equal(1);
    });
});