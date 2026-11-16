import { Vista } from '../base/Vista.js';
import { html } from '../base/html.js';
import { api, sesion, ticketUrl } from '../control/servicios.js';
import { dinero, centavos, normalizar, validarCobro } from '../control/reglas.js';

import '../componentes/cafe-tablero-caja.js';
import '../componentes/cafe-formulario-pago.js';

/** HU4: un cajero selecciona una orden, registra el pago y obtiene su ticket */
export class Pago extends Vista {
    titulo = 'Caja y pagos';
    cargado = false;
    ordenes = [];
    cajas = [];
    seleccion = null;
    pagos = [];
    idCaja = '';
    cliente = '';
    resultado = null;

    alConectar() {
        this.cargar();
    }

    cargar() {
        return this.ejecutar(async () => {
            const [ordenes, cajas] = await Promise.all([
                api.get('/orden/pendiente'),
                api.get('/caja'),
            ]);
            this.ordenes = ordenes;
            this.cajas = cajas;
            this.cargado = true;
            this.seleccion = null;
            this.pagos = [];
            this.resultado = null;

            if (!cajas.some(caja => caja.idCaja === this.idCaja)) {
                this.idCaja = '';
            }
        });
    }

    elegir(id) {
        return this.ejecutar(async () => {
            if (this.seleccion?.idOrden === id) {
                this.seleccion = null;
                this.pagos = [];
                this.renderizar();
                return;
            }

            const orden = await api.get(`/orden/pendiente/${encodeURIComponent(id)}`);
            if (!orden.productos?.length) {
                throw new Error('La orden ya no tiene productos pendientes. Actualice el listado.');
            }

            this.seleccion = orden;
            this.pagos = [];
            this.cliente = orden.cliente || '';
            this.resultado = null;
        });
    }

    agregarPago(pago) {
        if (this.ocupado) return;

        try {
            const monto = centavos(pago.monto);
            if (monto <= 0) throw new Error('El monto debe ser mayor que cero.');

            this.pagos.push({
                ...pago,
                monto: (monto / 100).toFixed(2),
            });
            this.error = '';
        } catch (error) {
            this.error = error.message;
        }
        this.renderizar();
    }

    cobrar() {
        return this.ejecutar(async () => {
            if (!this.seleccion) throw new Error('Seleccione una orden.');
            validarCobro(this.seleccion.total, this.pagos);

            if (!this.idCaja) throw new Error('Seleccione una caja.');
            if (!navigator.onLine) throw new Error('Sin conexión: no se registró el cobro.');

            const asignacion = sesion.get('usuario')?.roles.find(
                rol => normalizar(rol.rol) === 'cajero'
            );
            if (!asignacion) throw new Error('Debe ingresar como cajero.');

            const id = this.seleccion.idOrden;
            try {
                this.resultado = await api.post(
                    `/orden/${encodeURIComponent(id)}/cobro`,
                    {
                        idCaja: this.idCaja,
                        idEmpleadoRol: asignacion.idEmpleadoRol,
                        cliente: this.cliente.trim(),
                        pagos: this.pagos,
                    }
                );
            } catch (error) {
                if (error.status === 0) {
                    throw new Error('No recibimos confirmación. Actualice las órdenes antes de volver a cobrar.');
                }
                throw error;
            }

            this.ordenes = this.ordenes.filter(orden => orden.idOrden !== id);
            this.seleccion = null;
            this.pagos = [];
        });
    }

    plantilla() {
        const nombre = sesion.get('usuario')?.empleado?.nombre;
        return html`
            <h1>${nombre ? `Caja de ${nombre}` : 'Caja y pagos'}</h1>
            <p>Selecciona una orden pendiente, registra sus formas de pago y confirma el cobro.</p>
            ${this.mensajes()}

            ${this.resultado ? html`
                <section class="panel" role="status">
                    <h2>Cobro registrado</h2>
                    <p>Total: ${dinero(this.resultado.total)} · Vuelto: ${dinero(this.resultado.vuelto)}</p>
                    <a class="boton" href="${ticketUrl(this.resultado.idFactura)}" target="_blank" rel="noopener">Abrir ticket PDF para imprimir</a>
                </section>
            ` : ''}

            <div class="columnas">
                <cafe-tablero-caja></cafe-tablero-caja>
                ${this.seleccion ? html`
                    <cafe-formulario-pago></cafe-formulario-pago>
                ` : html`
                    <section class="panel" aria-live="polite">
                        <h2>Selecciona una orden</h2>
                        <p>Al elegirla podrás ver sus productos y registrar el cobro.</p>
                    </section>
                `}
            </div>
        `;
    }

    despuesDeRenderizar() {
        this.configurarHijo('cafe-tablero-caja', {
            ordenes: this.ordenes,
            seleccion: this.seleccion,
            ocupado: this.ocupado,
            cargado: this.cargado,
        }, {
            'cafefe:actualizar-ordenes': () => this.cargar(),
            'cafefe:seleccionar-orden': id => {
                if (!this.ocupado) this.elegir(id);
            },
        });

        if (!this.seleccion) return;
        this.configurarHijo('cafe-formulario-pago', {
            cajas: this.cajas,
            pagos: this.pagos,
            idCaja: this.idCaja,
            cliente: this.cliente,
            orden: this.seleccion,
            total: this.seleccion.total,
            ocupado: this.ocupado,
        }, {
            'cafefe:caja': id => { this.idCaja = id; },
            'cafefe:cliente-factura': nombre => { this.cliente = nombre; },
            'cafefe:agregar-pago': pago => this.agregarPago(pago),
            'cafefe:quitar-pago': indice => {
                if (this.ocupado) return;
                this.pagos.splice(indice, 1);
                this.renderizar();
            },
            'cafefe:confirmar-cobro': () => this.cobrar(),
        });
    }
}

customElements.define('cafe-pantalla-pago', Pago);
