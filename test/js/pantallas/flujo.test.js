import {
    centavos,
    resumen,
    validarCobro,
    validarOrden,
    permite,
} from '../../../src/js/control/reglas.js';

import {
    api,
    sesion,
    router,
    consultarMenu,
} from '../../../src/js/control/servicios.js';

import '../../../src/js/pantallas/login.js';
import '../../../src/js/pantallas/orden.js';
import '../../../src/js/pantallas/pendientes.js';
import '../../../src/js/pantallas/pago.js';

describe('Reglas de pedidos, acceso y cobros', () => {
    it('calcula centavos sin sumar decimales binarios', () => {
        expect(centavos('0.29')).to.equal(29);
    });

    it('rechaza más de dos decimales', () => {
        expect(() => centavos('1.001')).to.throw();
    });

    it('rechaza montos negativos', () => {
        expect(() => centavos('-1')).to.throw();
    });

    it('deja el catálogo público', () => {
        expect(permite(null)).to.equal(true);
    });

    it('impide entrar en caja sin rol', () => {
        expect(permite(null, ['cajero'])).to.equal(false);
    });

    it('admite varios roles por empleado', () => {
        expect(permite({
            roles: [
                { rol: 'Barista' },
                { rol: 'Cajero' },
            ],
        }, ['cajero'])).to.equal(true);
    });

    it('rechaza cantidades mayores que veinte', () => {
        expect(() =>
            validarOrden('Ana', [{ cantidad: 21 }])
        ).to.throw();
    });

    it('rechaza cantidades fraccionarias', () => {
        expect(() =>
            validarOrden('Ana', [{ cantidad: 1.5 }])
        ).to.throw();
    });

    it('rechaza un pedido vacío', () => {
        expect(() => validarOrden('Ana', [])).to.throw();
    });

    it('evita el separador reservado del backend', () => {
        expect(() =>
            validarOrden('Ana | nota', [{ cantidad: 1 }])
        ).to.throw();
    });

    it('no envía precios proporcionados por el navegador', () => {
        const resultado = validarOrden(' Ana ', [{
            idProducto: 'p',
            cantidad: 2,
            precio: 0.01,
        }]);

        expect(resultado).to.deep.equal({
            cliente: 'Ana',
            items: [{
                idProducto: 'p',
                cantidad: 2,
                observaciones: '',
            }],
        });
    });

    it('calcula vuelto en pagos combinados', () => {
        const resultado = resumen('7', [
            { tipoPago: 'Tarjeta', monto: '2' },
            { tipoPago: 'Efectivo', monto: '10' },
        ]);

        expect(resultado.vuelto).to.equal(500);
    });

    it('rechaza cobros incompletos', () => {
        expect(() => validarCobro('7', [
            { tipoPago: 'Efectivo', monto: '6' },
        ])).to.throw();
    });

    it('rechaza exceso no efectivo', () => {
        expect(() => validarCobro('7', [
            { tipoPago: 'QR', monto: '8' },
        ])).to.throw();
    });

    it('rechaza tipos desconocidos', () => {
        expect(() => validarCobro('7', [
            { tipoPago: 'Otro', monto: '7' },
        ])).to.throw();
    });
});

describe('Pantallas conectadas al contrato del API', () => {
    let pantalla;
    let get;
    let post;
    let navegar;
    let usuarioAnterior;
    let borradorAnterior;
    let sesionAnterior;

    const esperar = () =>
        new Promise(resolve => setTimeout(resolve, 0));

    const usuario = {
        empleado: { nombre: 'Ana' },
        roles: [{
            rol: 'Cajero',
            idEmpleadoRol: 'cajero-1',
        }],
    };

    const orden = {
        idOrden: 'orden-1',
        cliente: 'Luis',
        total: 7,
        productos: [{
            idOrdenProducto: 'linea-1',
            producto: 'Café',
            precio: 7,
            nota: 'Sin azúcar',
        }],
    };

    beforeEach(() => {
        usuarioAnterior = sesion.get('usuario');
        borradorAnterior = localStorage.getItem('cafefe.borrador');
        sesionAnterior = sessionStorage.getItem('cafefe.sesion');

        localStorage.removeItem('cafefe.borrador');
        sesion.set({ usuario });

        get = sinon.stub(api, 'get').callsFake(async ruta => {
            if (ruta === '/orden/pendiente') {
                return [orden];
            }

            if (ruta === '/orden/pendiente/orden-1') {
                return orden;
            }

            if (ruta === '/caja') {
                return [{
                    idCaja: 'caja-1',
                    nombre: 'Principal',
                }];
            }

            return [];
        });

        post = sinon.stub(api, 'post');
        navegar = sinon.stub(router, 'navegar');
    });

    afterEach(() => {
        pantalla?.remove();
        sinon.restore();
        sesion.set({ usuario: usuarioAnterior });

        for (const [almacen, clave, valor] of [
            [localStorage, 'cafefe.borrador', borradorAnterior],
            [sessionStorage, 'cafefe.sesion', sesionAnterior],
        ]) {
            if (valor === null) {
                almacen.removeItem(clave);
            } else {
                almacen.setItem(clave, valor);
            }
        }
    });

    async function montar(nombre) {
        pantalla = document.createElement(nombre);
        document.body.append(pantalla);
        await esperar();
    }

    it('envía nombre y uid y navega según el rol', async () => {
        post.resolves(usuario);

        await montar('cafe-pantalla-login');

        pantalla.nombre = 'Ana';
        pantalla.$('#uid').value = 'uuid-de-prueba';

        pantalla.$('form').dispatchEvent(
            new Event('submit', { cancelable: true })
        );

        await esperar();

        expect(post.firstCall.args).to.deep.equal([
            '/login',
            {
                nombre: 'Ana',
                uid: 'uuid-de-prueba',
            },
        ]);

        expect(navegar.calledWith('/pago')).to.equal(true);
    });

    it('muestra el error del login sin navegar', async () => {
        post.rejects(new Error('Credenciales inválidas.'));

        await montar('cafe-pantalla-login');

        pantalla.$('form').dispatchEvent(
            new Event('submit', { cancelable: true })
        );

        await esperar();

        expect(pantalla.shadowRoot.textContent)
            .to.include('Credenciales inválidas.');

        expect(navegar.called).to.equal(false);
    });

    it('permite construir y conservar el borrador', async () => {
        await montar('cafe-pantalla-orden');

        pantalla.cambiar({
            idProducto: 'p',
            nombre: 'Café',
            precio: 2,
        }, 1);

        pantalla.cambiar({ idProducto: 'p' }, 1);

        const guardado = JSON.parse(
            localStorage.getItem('cafefe.borrador')
        );

        expect(guardado.items[0].cantidad).to.equal(2);
    });

    it('quita el producto al reducir su cantidad a cero', async () => {
        await montar('cafe-pantalla-orden');

        pantalla.cambiar({
            idProducto: 'p',
            nombre: 'Café',
            precio: 2,
        }, 1);

        pantalla.cambiar({ idProducto: 'p' }, -1);

        expect(pantalla.borrador.items).to.have.length(0);
    });

    it('consulta el detalle de una orden pendiente', async () => {
        await montar('cafe-pantalla-pendientes');
        await pantalla.elegir('orden-1');

        expect(
            get.calledWith('/orden/pendiente/orden-1')
        ).to.equal(true);

        expect(pantalla.shadowRoot.textContent)
            .to.include('Sin azúcar');
    });

    it('no permite seleccionar una orden ya pagada', async () => {
        get.withArgs('/orden/pendiente/orden-1').resolves({
            ...orden,
            productos: [],
        });

        await montar('cafe-pantalla-pendientes');
        await pantalla.elegir('orden-1');

        expect(pantalla.seleccion).to.equal(null);
        expect(pantalla.error).to.include('pendientes');
    });

    it('conserva la selección si se rechaza el cobro', async () => {
        post.rejects(new Error('Caja inactiva.'));

        await montar('cafe-pantalla-pago');
        await pantalla.elegir('orden-1');

        pantalla.idCaja = 'caja-1';
        pantalla.pagos = [{
            tipoPago: 'Efectivo',
            monto: '7.00',
        }];

        pantalla.renderizar();
        pantalla.$('#cobrar').click();

        await esperar();

        expect(pantalla.seleccion.idOrden).to.equal('orden-1');
        expect(pantalla.error).to.equal('Caja inactiva.');
    });

    it('registra el cobro y enlaza el PDF confirmado', async () => {
        post.resolves({
            idFactura: 'factura-1',
            total: 7,
            vuelto: 3,
        });

        await montar('cafe-pantalla-pago');
        await pantalla.elegir('orden-1');

        pantalla.idCaja = 'caja-1';
        pantalla.pagos = [{
            tipoPago: 'Efectivo',
            monto: '10.00',
        }];

        pantalla.renderizar();
        pantalla.$('#cobrar').click();

        await esperar();

        expect(post.firstCall.args[0])
            .to.equal('/orden/orden-1/cobro');

        expect(post.firstCall.args[1].idEmpleadoRol)
            .to.equal('cajero-1');

        expect(pantalla.seleccion).to.equal(null);

        expect(pantalla.$('a[target="_blank"]').href)
            .to.include('/factura/factura-1/ticket');
    });

    it('usa el catálogo guardado solo ante falta de conexión', async () => {
        const ruta = '/prueba-cache-unitaria';

        try {
            get.withArgs(ruta).resolves([{ nombre: 'Café' }]);
            await consultarMenu(ruta);

            get.withArgs(ruta).rejects({ status: 0 });

            expect((await consultarMenu(ruta)).copia)
                .to.equal(true);

            get.withArgs(ruta).rejects({ status: 500 });

            let fallo = false;

            try {
                await consultarMenu(ruta);
            } catch {
                fallo = true;
            }

            expect(fallo).to.equal(true);
        } finally {
            localStorage.removeItem(`cafefe.menu.${ruta}`);
        }
    });
});