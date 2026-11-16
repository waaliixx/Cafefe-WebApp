import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero, resumen } from '../control/reglas.js';

export class FormularioPago extends Vista {
    plantilla() {
        const {
            cajas = [],
            pagos = [],
            cliente = '',
            total = 0,
            ocupado,
        } = this.estado;

        const calculo = resumen(total, pagos);

        return html`
            <section class="panel">
                <h2>Registrar pago</h2>

                <label>
                    Caja
                    <select id="caja" ${deshabilitado(ocupado)}>
                        <option value="">Seleccione una caja</option>

                        ${cajas.map(caja => html`
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
                        value="${cliente}"
                        ${deshabilitado(ocupado)}>
                </label>

                <form id="agregar">
                    <label>
                        Forma de pago
                        <select id="tipo" ${deshabilitado(ocupado)}>
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
                            required
                            ${deshabilitado(ocupado)}>
                    </label>

                    <label>
                        Referencia, si corresponde
                        <input
                            id="referencia"
                            maxlength="200"
                            ${deshabilitado(ocupado)}>
                    </label>

                    <button ${deshabilitado(ocupado)}>
                        Agregar forma de pago
                    </button>
                </form>

                <ul>
                    ${pagos.map((pago, indice) => html`
                        <li class="fila">
                            <span>
                                ${pago.tipoPago}: ${dinero(pago.monto)}
                            </span>

                            <button
                                data-quitar="${indice}"
                                class="secundario"
                                aria-label="Quitar pago ${indice + 1}"
                                ${deshabilitado(ocupado)}>
                                Quitar
                            </button>
                        </li>
                    `)}
                </ul>

                <p role="status">
                    Recibido: ${dinero(calculo.recibido / 100)}
                    · Falta: ${dinero(calculo.saldo / 100)}
                    · Vuelto: ${dinero(calculo.vuelto / 100)}
                </p>

                ${calculo.exceso
                    ? html`
                        <p class="error">
                            Tarjeta y QR no pueden superar el total.
                        </p>
                    `
                    : ''}

                <button
                    id="cobrar"
                    ${deshabilitado(
                        ocupado
                        || !pagos.length
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
        `;
    }

    despuesDeRenderizar() {
        this.$('#caja').value = this.estado.idCaja || '';

        this.escuchar('#caja', 'change', evento => {
            this.emitir('cafefe:caja', evento.target.value);
        });

        this.escuchar('#cliente', 'input', evento => {
            this.emitir(
                'cafefe:cliente-factura',
                evento.target.value
            );
        });

        this.escuchar('#agregar', 'submit', evento => {
            evento.preventDefault();

            if (this.estado.ocupado) return;

            this.emitir('cafefe:agregar-pago', {
                tipoPago: this.$('#tipo').value,
                monto: this.$('#monto').value,
                referenciaExterna:
                    this.$('#referencia').value.trim(),
            });
        });

        this.shadowRoot
            .querySelectorAll('[data-quitar]')
            .forEach(boton => {
                boton.onclick = () => {
                    this.emitir(
                        'cafefe:quitar-pago',
                        Number(boton.dataset.quitar)
                    );
                };
            });

        this.escuchar('#cobrar', 'click', () => {
            if (!this.estado.ocupado) {
                this.emitir('cafefe:confirmar-cobro');
            }
        });
    }
}

customElements.define('cafe-formulario-pago', FormularioPago);