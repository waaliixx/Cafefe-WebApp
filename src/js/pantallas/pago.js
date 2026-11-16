import { Pendientes } from './pendientes.js';
import { deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { api, sesion, ticketUrl } from '../control/servicios.js';
import {
    dinero,
    centavos,
    resumen,
    validarCobro,
    normalizar,
} from '../control/reglas.js';

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
                api.get('/caja'),
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

    alSeleccionar() {
        this.pagos = [];
        this.cliente = this.seleccion.cliente || '';
        this.resultado = null;
    }

    plantilla() {
        const calculo = resumen(
            this.seleccion?.total || 0,
            this.pagos
        );

        return html`
            ${this.mensajes()}

            ${this.resultado
                ? html`
                    <section class="panel" role="status">
                        <h2>Cobro registrado</h2>

                        <p>
                            Total: ${dinero(this.resultado.total)}
                            · Vuelto: ${dinero(this.resultado.vuelto)}
                        </p>

                        <a
                            class="boton"
                            href="${ticketUrl(this.resultado.idFactura)}"
                            target="_blank"
                            rel="noopener">
                            Abrir ticket PDF para imprimir
                        </a>

                        <p>
                            Puede seleccionar otra orden
                            para realizar un nuevo cobro.
                        </p>
                    </section>
                `
                : ''}

            ${this.lista()}

            <div class="columnas">
                ${this.detalle()}

                ${this.seleccion
                    ? html`
                        <section class="panel">
                            <h2>Registrar pago</h2>

                            <label>
                                Caja
                                <select
                                    id="caja"
                                    ${deshabilitado(this.ocupado)}>
                                    <option value="">
                                        Seleccione una caja
                                    </option>

                                    ${this.cajas.map(caja => html`
                                        <option value="${caja.idCaja}">
                                            ${caja.nombre}
                                        </option>
                                    `)}
                                </select>
                            </label>

                            <label>
                                Cliente
                                <input
                                    id="cliente"
                                    maxlength="155"
                                    value="${this.cliente}"
                                    ${deshabilitado(this.ocupado)}>
                            </label>

                            <form id="agregar">
                                <label>
                                    Forma de pago
                                    <select id="tipo">
                                        <option>Efectivo</option>
                                        <option>Tarjeta</option>
                                        <option>QR</option>
                                    </select>
                                </label>

                                <label>
                                    Monto
                                    <input
                                        id="monto"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        required>
                                </label>

                                <label>
                                    Referencia, si corresponde
                                    <input
                                        id="referencia"
                                        maxlength="200">
                                </label>

                                <button
                                    ${deshabilitado(this.ocupado)}>
                                    Agregar forma de pago
                                </button>
                            </form>

                            <ul>
                                ${this.pagos.map((pago, indice) => html`
                                    <li class="fila">
                                        <span>
                                            ${pago.tipoPago}:
                                            ${dinero(pago.monto)}
                                        </span>

                                        <button
                                            data-quitar="${indice}"
                                            class="secundario"
                                            aria-label="Quitar pago ${indice + 1}"
                                            ${deshabilitado(this.ocupado)}>
                                            Quitar
                                        </button>
                                    </li>
                                `)}
                            </ul>

                            <p role="status">
                                Recibido:
                                ${dinero(calculo.recibido / 100)}
                                · Falta:
                                ${dinero(calculo.saldo / 100)}
                                · Vuelto:
                                ${dinero(calculo.vuelto / 100)}
                            </p>

                            ${calculo.exceso
                                ? html`
                                    <p class="error">
                                        Tarjeta y QR no pueden
                                        superar el total.
                                    </p>
                                `
                                : ''}

                            <button
                                id="cobrar"
                                ${deshabilitado(
                                    this.ocupado
                                    || !this.pagos.length
                                    || calculo.saldo > 0
                                    || calculo.exceso
                                )}>
                                Confirmar cobro
                            </button>

                            <p class="muted">
                                El cobro requiere conexión
                                y confirmación del servidor.
                            </p>
                        </section>
                    `
                    : ''}
            </div>
        `;
    }

    despuesDeRenderizar() {
        super.despuesDeRenderizar();

        if (!this.seleccion) return;

        this.$('#caja').value = this.idCaja;

        this.escuchar('#caja', 'change', evento => {
            this.idCaja = evento.target.value;
        });

        this.escuchar('#cliente', 'input', evento => {
            this.cliente = evento.target.value;
        });

        this.escuchar('#agregar', 'submit', evento => {
            evento.preventDefault();

            if (this.ocupado) return;

            try {
                const monto = centavos(this.$('#monto').value);

                if (monto <= 0) {
                    throw new Error(
                        'El monto debe ser mayor que cero.'
                    );
                }

                this.pagos.push({
                    tipoPago: this.$('#tipo').value,
                    monto: (monto / 100).toFixed(2),
                    referenciaExterna:
                        this.$('#referencia').value.trim(),
                });

                this.error = '';
            } catch (error) {
                this.error = error.message;
            }

            this.renderizar();
        });

        this.shadowRoot
            .querySelectorAll('[data-quitar]')
            .forEach(elemento => {
                elemento.onclick = () => {
                    this.pagos.splice(
                        Number(elemento.dataset.quitar),
                        1
                    );

                    this.renderizar();
                };
            });

        this.escuchar('#cobrar', 'click', () => {
            this.ejecutar(async () => {
                validarCobro(this.seleccion.total, this.pagos);

                if (!this.idCaja) {
                    throw new Error('Seleccione una caja.');
                }

                if (!navigator.onLine) {
                    throw new Error(
                        'Sin conexión: no se registró el cobro.'
                    );
                }

                const rol = sesion.get('usuario')?.roles.find(
                    asignacion =>
                        normalizar(asignacion.rol) === 'cajero'
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
                            pagos: this.pagos,
                        }
                    );
                } catch (error) {
                    if (error.status === 0) {
                        throw new Error(
                            'No recibimos confirmación. '
                            + 'Actualice las órdenes y verifique '
                            + 'el cobro antes de volver a cobrar.'
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
        });
    }
}

customElements.define('cafe-pantalla-pago', Pago);