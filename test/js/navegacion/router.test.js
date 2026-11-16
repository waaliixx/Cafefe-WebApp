import { Router } from '../../src/js/router.js';

const RUTAS = [
    { path: '/', componente: 'pantalla-inicio' },
    { path: '/orden', componente: 'pantalla-orden' },
    { path: '/orden/:id', componente: 'pantalla-detalle' },
    { path: '*', componente: 'pantalla-404' },
];

/** Ventana mínima para probar sin navegador. */
function ventanaFalsa(hash = '') {
    const oyentes = {};
    return {
        location: { hash },
        addEventListener: (tipo, fn) => { (oyentes[tipo] ??= []).push(fn); },
        disparar(tipo) { (oyentes[tipo] ?? []).forEach((fn) => fn()); },
    };
}

describe('Router', () => {
    describe('normalizar', () => {
        it('quita # y agrega / inicial', () => {
            expect(Router.normalizar('#/orden')).to.equal('/orden');
            expect(Router.normalizar('orden')).to.equal('/orden');
        });

        it('vacío equivale a la raíz', () => {
            expect(Router.normalizar('')).to.equal('/');
            expect(Router.normalizar('#')).to.equal('/');
        });

        it('quita la barra final y la cadena de consulta', () => {
            expect(Router.normalizar('#/orden/')).to.equal('/orden');
            expect(Router.normalizar('#/orden?x=1')).to.equal('/orden');
        });
    });

    describe('resolver', () => {
        const router = new Router({ rutas: RUTAS, ventana: ventanaFalsa() });

        it('encuentra rutas exactas', () => {
            expect(router.resolver('/orden').ruta.componente).to.equal('pantalla-orden');
            expect(router.resolver('/').ruta.componente).to.equal('pantalla-inicio');
        });

        it('extrae parámetros', () => {
            const r = router.resolver('/orden/abc-123');
            expect(r.ruta.componente).to.equal('pantalla-detalle');
            expect(r.params).to.deep.equal({ id: 'abc-123' });
        });

        it('usa la ruta comodín cuando no hay coincidencia', () => {
            expect(router.resolver('/inexistente').ruta.componente).to.equal('pantalla-404');
        });

        it('devuelve null si no hay comodín', () => {
            const sinComodin = new Router({ rutas: RUTAS.slice(0, 2), ventana: ventanaFalsa() });
            expect(sinComodin.resolver('/x')).to.equal(null);
        });
    });

    describe('evaluar con guard', () => {
        it('permite cuando el guard devuelve true', () => {
            const router = new Router({ rutas: RUTAS, ventana: ventanaFalsa() });
            expect(router.evaluar('/orden').tipo).to.equal('ruta');
        });

        it('redirige cuando el guard devuelve una ruta', () => {
            const guard = (ruta) => (ruta.path === '/orden' ? '/login' : true);
            const router = new Router({ rutas: RUTAS, guard, ventana: ventanaFalsa() });
            expect(router.evaluar('/orden')).to.deep.equal({ tipo: 'redirigir', path: '/login' });
        });

        it('niega cuando el guard devuelve false', () => {
            const router = new Router({ rutas: RUTAS, guard: () => false, ventana: ventanaFalsa() });
            expect(router.evaluar('/orden').tipo).to.equal('prohibido');
        });
    });

    describe('iniciar', () => {
        it('procesa la ruta inicial y avisa a los suscriptores', () => {
            const ventana = ventanaFalsa('#/orden');
            const router = new Router({ rutas: RUTAS, ventana });
            const oyente = sinon.spy();
            router.subscribe(oyente);

            router.iniciar();

            expect(oyente.calledOnce).to.equal(true);
            expect(oyente.firstCall.args[0].ruta.componente).to.equal('pantalla-orden');
            expect(router.actual.path).to.equal('/orden');
        });

        it('reacciona a los cambios del hash', () => {
            const ventana = ventanaFalsa('#/');
            const router = new Router({ rutas: RUTAS, ventana });
            const oyente = sinon.spy();
            router.subscribe(oyente);
            router.iniciar();

            ventana.location.hash = '#/orden/7';
            ventana.disparar('hashchange');

            expect(oyente.calledTwice).to.equal(true);
            expect(oyente.secondCall.args[0].params).to.deep.equal({ id: '7' });
        });

        it('al redirigir cambia el hash y no muestra la ruta bloqueada', () => {
            const ventana = ventanaFalsa('#/orden');
            const guard = (ruta) => (ruta.path === '/orden' ? '/' : true);
            const router = new Router({ rutas: RUTAS, guard, ventana });
            const oyente = sinon.spy();
            router.subscribe(oyente);

            router.iniciar();

            expect(ventana.location.hash).to.equal('/');
            expect(oyente.called).to.equal(false);
        });

        it('permite darse de baja', () => {
            const ventana = ventanaFalsa('#/');
            const router = new Router({ rutas: RUTAS, ventana });
            const oyente = sinon.spy();
            const baja = router.subscribe(oyente);
            baja();

            router.iniciar();

            expect(oyente.called).to.equal(false);
        });
    });

    it('navegar escribe la ruta normalizada en el hash', () => {
        const ventana = ventanaFalsa();
        new Router({ rutas: RUTAS, ventana }).navegar('orden/');
        expect(ventana.location.hash).to.equal('/orden');
    });
});