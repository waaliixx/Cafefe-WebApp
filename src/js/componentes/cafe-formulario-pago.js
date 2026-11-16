import { estilosOperativos } from '../../resources/estilos/estilos.js';
import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero, resumen } from '../control/reglas.js';

export class FormularioPago extends Vista {
    static estilos = Vista.estilos + estilosOperativos;
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

                <div class="pago-resumen" aria-live="polite">
                    <div class="fila"><span>Total de la orden</span><strong>${dinero(total)}</strong></div>
                    <div class="fila"><span>Abonado</span><strong>${dinero(calculo.recibido / 100)}</strong></div>
                    <div class="fila"><span>Saldo pendiente</span><strong>${dinero(calculo.saldo / 100)}</strong></div>
                    ${calculo.vuelto ? html`<div class="fila"><span>Vuelto en efectivo</span><strong>${dinero(calculo.vuelto / 100)}</strong></div>` : ''}
                </div>

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

                    <div class="fila">
                        <button type="button" id="completar" class="secundario"
                            ${deshabilitado(ocupado || calculo.saldo === 0)}>
                            Usar saldo restante
                        </button>
                        <button ${deshabilitado(ocupado)}>Agregar pago</button>
                    </div>
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
                        || !this.estado.idCaja
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

        this.escuchar('#completar', 'click', () => {
            const { saldo } = resumen(this.estado.total, this.estado.pagos);
            if (saldo > 0) this.$('#monto').value = (saldo / 100).toFixed(2);
            this.$('#monto').focus();
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