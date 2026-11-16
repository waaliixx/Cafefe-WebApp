import { estilosOperativos } from '../../resources/estilos/estilos.js';
import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero } from '../control/reglas.js';

export class DetalleOrden extends Vista {
    static estilos = Vista.estilos + estilosOperativos;
    plantilla() {
        const { orden, cocina = false, ocupado = false } = this.estado;
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
                        ${cocina ? html`<span class="fila">
                            <small class="estado-etiqueta">${producto.estadoPreparacion || 'PENDIENTE'}</small>
                            ${producto.estadoPreparacion !== 'LISTO' ? html`
                                <button class="secundario" data-linea="${indice}" ${deshabilitado(ocupado)}>
                                    ${producto.estadoPreparacion === 'PREPARANDO' ? 'Marcar listo' : 'Empezar preparación'}
                                </button>` : html`
                                <button class="secundario" data-linea="${indice}" ${deshabilitado(ocupado)}>Volver a preparar</button>`}
                        </span>` : ''}
                    </li>`)}
                </ul>
                <p class="total fila"><span>Total</span><span>${dinero(orden.total)}</span></p>
                ${cocina ? html`<div class="fila">
                    <strong>Estado: ${orden.estadoPreparacion}</strong>
                    <button id="despachar" ${deshabilitado(ocupado || orden.estadoPreparacion !== 'LISTO')}>
                        Confirmar despacho
                    </button>
                </div>` : ''}
            </section>`;
    }
    despuesDeRenderizar() {
        this.shadowRoot.querySelectorAll('[data-linea]').forEach(boton => {
            boton.addEventListener('click', () => {
                const producto = this.estado.orden?.productos[Number(boton.dataset.linea)];
                if (!producto) return;
                const estado = producto.estadoPreparacion === 'PENDIENTE' ? 'PREPARANDO'
                    : producto.estadoPreparacion === 'PREPARANDO' ? 'LISTO' : 'PREPARANDO';
                this.emitir('cafefe:cambiar-estado', { idOrdenProducto: producto.idOrdenProducto, estado });
            });
        });
        this.escuchar('#despachar', 'click', () => this.emitir('cafefe:despachar-orden'));
    }
}
customElements.define('cafe-detalle-orden', DetalleOrden);
