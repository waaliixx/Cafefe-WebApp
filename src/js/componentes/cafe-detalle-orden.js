import { Vista } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero } from '../control/reglas.js';

export class DetalleOrden extends Vista {
    plantilla() {
        const { orden } = this.estado;

        if (!orden) return html``;

        return html`
            <section class="panel">
                <h2>${orden.cliente || 'Detalle de orden'}</h2>
                <p>Orden: ${orden.idOrden}</p>

                <ul>
                    ${orden.productos.map(producto => html`
                        <li>
                            <strong>${producto.producto}</strong>
                            · ${dinero(producto.precio)}

                            ${producto.nota
                                ? html`
                                    <small>
                                        Indicaciones: ${producto.nota}
                                    </small>
                                `
                                : ''}
                        </li>
                    `)}
                </ul>

                <p class="total">
                    Total: ${dinero(orden.total)}
                </p>
            </section>
        `;
    }
}

customElements.define('cafe-detalle-orden', DetalleOrden);