import { estilosOperativos } from '../../resources/estilos/estilos.js';
import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero } from '../control/reglas.js';

export class ListaOrdenes extends Vista {
    static estilos = Vista.estilos + estilosOperativos;
    plantilla() {
        const { ordenes = [], titulo = 'Órdenes pendientes', ocupado, seleccionado = null } = this.estado;
        return html`
            <section class="panel ordenes">
                <div class="fila encabezado-ordenes">
                    <div><p class="eyebrow">CAFEFE · PANEL OPERATIVO</p><h1>${titulo}</h1>
                        <p class="muted">${ordenes.length} ${ordenes.length === 1 ? 'orden pendiente' : 'órdenes pendientes'} ${titulo === 'Caja y pagos' ? 'de pago' : 'en cocina'}</p></div>
                    <button id="actualizar" class="secundario" ${deshabilitado(ocupado)}>↻ Actualizar</button>
                </div>
                <div class="grid ordenes-grid">
                    ${ordenes.map((orden, indice) => html`
                        <button class="tarjeta-orden ${seleccionado === orden.idOrden ? 'elegida' : ''}"
                            data-indice="${indice}" aria-pressed="${seleccionado === orden.idOrden}"
                            ${deshabilitado(ocupado)}>
                            <span class="fila"><strong>Pedido #${String(orden.idOrden).slice(0, 8)}</strong><span class="estado-etiqueta">${orden.estadoPreparacion || 'Pendiente'}</span></span>
                            <span class="cliente-orden">${orden.cliente || 'Cliente del local'}</span>
                            <span class="muted">${orden.fechaCreacion ? new Date(orden.fechaCreacion).toLocaleString('es-SV') : 'Sin fecha registrada'}</span>
                            <span class="fila"><strong class="precio-orden">${dinero(orden.total)}</strong><small>${(orden.productos || []).length} productos</small></span>
                            ${orden.tomadaPor ? html`<small class="muted">Atendió: ${orden.tomadaPor}</small>` : ''}
                            <span class="ver-detalle">Ver detalle →</span>
                        </button>
                    `)}
                </div>
                ${!ocupado && !ordenes.length ? html`<p class="aviso" role="status">No hay órdenes pendientes. Podés actualizar para consultar nuevas órdenes.</p>` : ''}
            </section>
        `;
    }
    despuesDeRenderizar() {
        this.escuchar('#actualizar', 'click', () => this.emitir('cafefe:actualizar-ordenes'));
        this.shadowRoot.querySelectorAll('[data-indice]').forEach(boton => {
            boton.onclick = () => {
                if (this.estado.ocupado) return;
                const orden = this.estado.ordenes[Number(boton.dataset.indice)];
                this.emitir('cafefe:seleccionar-orden', orden.idOrden);
            };
        });
    }
}
customElements.define('cafe-lista-ordenes', ListaOrdenes);
