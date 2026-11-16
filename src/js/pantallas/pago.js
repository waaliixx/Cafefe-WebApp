import { Pendientes } from './pendientes.js';
import { html } from '../base/html.js';
import {
    api,
    sesion,
    ticketUrl
} from '../control/servicios.js';
import {
    dinero,
    centavos,
    validarCobro,
    normalizar
} from '../control/reglas.js';

import '../componentes/cafe-formulario-pago.js';

export class Pago extends Pendientes {
    titulo = 'Caja y pagos';
    cajas = [];
    pagos = [];
    idCaja = '';
    cliente = '';
    resultado = null;

    cargar() {
        return this.ejecutar(async () => {
            const [ordenes, cajas] = await Promise.all([
                api.get('/orden/pendiente'),
                api.get('/caja')
            ]);

            this.ordenes = ordenes;
            this.cajas = cajas;

            if (!cajas.some(caja => caja.idCaja === this.idCaja)) {
                this.idCaja = '';
            }

            this.seleccion = null;
            this.pagos = [];
        });
    }

    elegir(id) {
        return this.ejecutar(async () => {
            this.seleccion = null;
            const orden = await api.get(`/orden/pendiente/${encodeURIComponent(id)}`);
            if (!orden.productos?.length) {
                throw new Error('Esta orden ya no tiene productos pendientes de pago.');
            }
            this.seleccion = orden;
            this.alSeleccionar();
        });
    }

    alSeleccionar() {
        this.pagos = [];
        this.cliente = this.seleccion.cliente || '';
        this.resultado = null;
    }

    plantilla() {
        return html`
            ${this.mensajes()}

            ${this.resultado
                ? html`
                    <section class="panel comprobante" role="status">
                        <h2>Cobro registrado</h2>

                        <p>
                            Total: ${dinero(this.resultado.total)}
                            · Vuelto: ${dinero(this.resultado.vuelto)}
                        </p>

                        <a
                            class="boton"
                            href="${ticketUrl(this.resultado.idFactura)}"
                            target="_blank"
                            rel="noopener"
                        >
                            Abrir ticket PDF para imprimir
                        </a>

                        <p>La transacción fue confirmada por Cafefe. Abrí el PDF para imprimirlo.</p>
                    </section>
                `
                : ''
            }

            ${this.lista()}

            <div class="columnas">
                ${this.detalle()}

                ${this.seleccion
                    ? html`
                        <cafe-formulario-pago></cafe-formulario-pago>
                    `
                    : ''
                }
            </div>
        `;
    }

    despuesDeRenderizar() {
        super.despuesDeRenderizar();

        if (!this.seleccion) return;

        this.configurarHijo(
            'cafe-formulario-pago',
            {
                cajas: this.cajas,
                pagos: this.pagos,
                idCaja: this.idCaja,
                cliente: this.cliente,
                total: this.seleccion.total,
                ocupado: this.ocupado
            },
            {
                'cafefe:caja': id => {
                    this.idCaja = id;
                    this.renderizar();
                },

                'cafefe:cliente-factura': nombre => {
                    this.cliente = nombre;
                },

                'cafefe:agregar-pago': pago => this.agregarPago(pago),

                'cafefe:quitar-pago': indice => {
                    if (this.ocupado) return;

                    this.pagos.splice(indice, 1);
                    this.renderizar();
                },

                'cafefe:confirmar-cobro': () => this.cobrar()
            }
        );
    }

    agregarPago(pago) {
        if (this.ocupado) return;

        try {
            const monto = centavos(pago.monto);

            if (monto <= 0) {
                throw new Error('El monto debe ser mayor que cero.');
            }

            this.pagos.push({
                ...pago,
                monto: (monto / 100).toFixed(2)
            });

            this.error = '';
        } catch (error) {
            this.error = error.message;
        }

        this.renderizar();
    }

    cobrar() {
        return this.ejecutar(async () => {
            validarCobro(this.seleccion.total, this.pagos);

            if (this.cliente.trim().length > 155) {
                throw new Error('El nombre del cliente no puede superar los 155 caracteres.');
            }

            if (!this.idCaja) {
                throw new Error('Seleccione una caja.');
            }

            if (!navigator.onLine) {
                throw new Error(
                    'Sin conexión: no se registró el cobro.'
                );
            }

            const rol = sesion.get('usuario')?.roles.find(
                elemento => normalizar(elemento.rol) === 'cajero'
            );

            if (!rol) {
                throw new Error('Debe ingresar como cajero.');
            }

            const id = this.seleccion.idOrden;

            try {
                this.resultado = await api.post(
                    `/orden/${encodeURIComponent(id)}/cobro`,
                    {
                        idCaja: this.idCaja,
                        idEmpleadoRol: rol.idEmpleadoRol,
                        cliente: this.cliente.trim(),
                        pagos: this.pagos
                    }
                );
            } catch (error) {
                if (error.status === 0) {
                    throw new Error(
                        'No recibimos confirmación. Actualice las órdenes ' +
                        'y verifique el cobro antes de volver a cobrar.'
                    );
                }

                throw error;
            }

            this.ordenes = this.ordenes.filter(
                orden => orden.idOrden !== id
            );

            this.seleccion = null;
            this.pagos = [];
        });
    }
}

customElements.define('cafe-pantalla-pago', Pago);