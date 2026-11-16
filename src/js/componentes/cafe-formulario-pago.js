import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero, resumen } from '../control/reglas.js';

/** Detalle de la orden y formulario para registrar sus formas de pago. */
export class FormularioPago extends Vista {
    static estilos = Vista.estilos + `
        :host { display: block; }
        .encabezado { margin-bottom: 1rem; }
        .encabezado h2, .encabezado p { margin: 0; }
        .encabezado p { margin-top: .35rem; color: #66584d; }
        .productos { margin: 1rem 0; }
        .productos li { display: flex; justify-content: space-between; gap: 1rem; }
        .productos li span:last-child { white-space: nowrap; }
        .total-orden { display: flex; justify-content: space-between; gap: 1rem; padding: .9rem 0; border-top: 2px solid var(--color-borde); font-size: 1.2rem; font-weight: 800; }
        fieldset { border: 0; margin: 1.25rem 0 0; padding: 0; }
        legend { font-weight: 800; font-size: 1.1rem; }
        .pagos { margin: 1rem 0; }
        .pagos li { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
        .importe { display: grid; gap: .2rem; }
        .resumen { background: #f4ece3; border-radius: .6rem; padding: .9rem; display: grid; gap: .4rem; }
        .resumen p { margin: 0; display: flex; justify-content: space-between; gap: 1rem; }
        .vuelto { color: #356b42; font-weight: 800; }
        .acciones { display: grid; gap: .8rem; margin-top: 1.25rem; }
    `;

    productosAgrupados(productos = []) {
        const grupos = new Map();
        for (const producto of productos) {
            const clave = JSON.stringify([producto.producto, producto.precio, producto.nota || '']);
            if (!grupos.has(clave)) grupos.set(clave, { ...producto, cantidad: 0 });
            grupos.get(clave).cantidad += 1;
        }
        return [...grupos.values()];
    }

    plantilla() {
        const { cajas = [], pagos = [], cliente = '', orden, total = 0, ocupado } = this.estado;
        const calculo = resumen(total, pagos);
        const productos = this.productosAgrupados(orden?.productos);

        return html`
            <section class="panel" aria-label="Cobro de orden">
                <div class="encabezado">
                    <h2>Registrar cobro</h2>
                    <p>Orden #${String(orden?.idOrden || '').slice(0, 8)} · ${orden?.cliente || 'Cliente del local'}</p>
                </div>
                <ul class="productos" aria-label="Productos de la orden">
                    ${productos.map(producto => html`
                        <li>
                            <span><strong>${producto.cantidad}× ${producto.producto || 'Producto'}</strong>${producto.nota ? html`<small>Nota: ${producto.nota}</small>` : ''}</span>
                            <span>${dinero(Number(producto.precio) * producto.cantidad)}</span>
                        </li>
                    `)}
                </ul>
                <div class="total-orden"><span>Total de la orden</span><span>${dinero(total)}</span></div>

                <label>
                    Caja
                    <select id="caja" ${deshabilitado(ocupado)}>
                        <option value="">Selecciona una caja</option>
                        ${cajas.map(caja => html`<option value="${caja.idCaja}">${caja.nombre}</option>`)}
                    </select>
                </label>
                <label>
                    Nombre para factura
                    <input id="cliente" maxlength="155" value="${cliente}" ${deshabilitado(ocupado)}>
                </label>

                <form id="agregar">
                    <fieldset ${deshabilitado(ocupado)}>
                        <legend>Agregar forma de pago</legend>
                        <label>
                            Forma de pago
                            <select id="tipo"><option>Efectivo</option><option>Tarjeta</option><option>QR</option></select>
                        </label>
                        <label>
                            Monto
                            <input id="monto" type="number" min="0.01" step="0.01" required>
                        </label>
                        <label>
                            Referencia, si corresponde
                            <input id="referencia" maxlength="200">
                        </label>
                        <button type="submit">Agregar pago</button>
                    </fieldset>
                </form>

                ${pagos.length ? html`
                    <ul class="pagos" aria-label="Pagos agregados">
                        ${pagos.map((pago, indice) => html`
                            <li>
                                <span class="importe"><strong>${pago.tipoPago}: ${dinero(pago.monto)}</strong>${pago.referenciaExterna ? html`<small>${pago.referenciaExterna}</small>` : ''}</span>
                                <button data-quitar="${indice}" type="button" class="secundario" aria-label="Quitar pago ${indice + 1}" ${deshabilitado(ocupado)}>Quitar</button>
                            </li>
                        `)}
                    </ul>
                ` : ''}

                <div class="resumen" role="status">
                    <p><span>Recibido</span><strong>${dinero(calculo.recibido / 100)}</strong></p>
                    <p><span>Falta</span><strong>${dinero(calculo.saldo / 100)}</strong></p>
                    <p class="vuelto"><span>Vuelto</span><strong>${dinero(calculo.vuelto / 100)}</strong></p>
                </div>
                ${calculo.exceso ? html`<p class="error">Tarjeta y QR no pueden superar el total de la orden.</p>` : ''}
                <div class="acciones">
                    <button id="cobrar" type="button" ${deshabilitado(ocupado || !pagos.length || calculo.saldo > 0 || calculo.exceso)}>Confirmar cobro</button>
                    <small class="muted">El cobro se registra únicamente cuando el servidor lo confirma.</small>
                </div>
            </section>
        `;
    }

    despuesDeRenderizar() {
        this.$('#caja').value = this.estado.idCaja || '';
        this.escuchar('#caja', 'change', evento => this.emitir('cafefe:caja', evento.target.value));
        this.escuchar('#cliente', 'input', evento => this.emitir('cafefe:cliente-factura', evento.target.value));
        this.escuchar('#agregar', 'submit', evento => {
            evento.preventDefault();
            if (this.estado.ocupado) return;
            this.emitir('cafefe:agregar-pago', {
                tipoPago: this.$('#tipo').value,
                monto: this.$('#monto').value,
                referenciaExterna: this.$('#referencia').value.trim(),
            });
        });
        this.shadowRoot.querySelectorAll('[data-quitar]').forEach(boton => {
            boton.onclick = () => this.emitir('cafefe:quitar-pago', Number(boton.dataset.quitar));
        });
        this.escuchar('#cobrar', 'click', () => {
            if (!this.estado.ocupado) this.emitir('cafefe:confirmar-cobro');
        });
    }
}

customElements.define('cafe-formulario-pago', FormularioPago);
