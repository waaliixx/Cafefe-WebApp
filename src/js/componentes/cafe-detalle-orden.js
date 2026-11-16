import { estilosOperativos } from '../../resources/estilos/estilos.js';
import { Vista } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero } from '../control/reglas.js';

export class DetalleOrden extends Vista {
    static estilos = Vista.estilos + estilosOperativos;
    plantilla() {
        const { orden } = this.estado;
        if (!orden) return html`<section class="panel detalle-vacio"><h2>Detalle del pedido</h2><p class="muted">Seleccioná una orden para ver sus productos y observaciones.</p></section>`;
        return html`
            <section class="panel detalle-orden">
                <p class="eyebrow">PEDIDO #${String(orden.idOrden).slice(0, 8)}</p>
                <h2>${orden.cliente || 'Cliente del local'}</h2>
                <p class="muted">${orden.productos.length} ${orden.productos.length === 1 ? 'producto pendiente' : 'productos pendientes'} · ${orden.tomadaPor || 'Orden recibida'}</p>
                <ul>${orden.productos.map((producto, indice) => html`
                    <li class="producto-detalle"><span class="numero-producto">${indice + 1}</span>
                        <span><strong>${producto.producto || 'Producto'}</strong>
                        ${producto.nota ? html`<small class="muted">Indicaciones: ${producto.nota}</small>` : ''}</span>
                        <strong>${dinero(producto.precio)}</strong>
                    </li>`)}
                </ul>
                <p class="total fila"><span>Total pendiente</span><span>${dinero(orden.total)}</span></p>
            </section>`;
    }
}
customElements.define('cafe-detalle-orden', DetalleOrden);
