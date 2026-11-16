import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import './cafe-tarjeta-orden.js';

export class TableroRecepcion extends Vista {
    static estilos = Vista.estilos + `
        .barra {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
        }
        .barra p { margin: 0; }
        .pedidos { display: grid; gap: 1.25rem; }
        .vacio { padding: 2rem; text-align: center; }
    `;

    plantilla() {
        const { ordenes = [], ocupado, cargado } = this.estado;
        return html`
            <section aria-label="Órdenes pendientes de pago" aria-busy="${Boolean(ocupado)}">
                <div class="barra">
                    <p role="status">
                        ${cargado ? html`<strong>${ordenes.length}</strong> pedidos pendientes de pago` : 'Consulta las órdenes pendientes.'}
                    </p>
                    <button id="actualizar" type="button" ${deshabilitado(ocupado)}>
                        Actualizar órdenes
                    </button>
                </div>
                <div class="pedidos">
                    ${ordenes.map((orden, indice) => html`
                        <cafe-tarjeta-orden data-indice="${indice}"></cafe-tarjeta-orden>
                    `)}
                </div>
                ${cargado && !ocupado && !ordenes.length ? html`
                    <div class="panel vacio" role="status">
                        <h2>No hay órdenes pendientes</h2>
                        <p>Actualiza el listado para consultar nuevos pedidos.</p>
                    </div>
                ` : ''}
            </section>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('#actualizar', 'click', () => {
            if (!this.estado.ocupado) this.emitir('cafefe:actualizar-ordenes');
        });
        (this.estado.ordenes || []).forEach((orden, indice) => {
            this.configurarHijo(`[data-indice="${indice}"]`, {
                orden,
                detalle: this.estado.seleccion?.idOrden === orden.idOrden
                    ? this.estado.seleccion : null,
                ocupado: this.estado.ocupado
            });
        });
    }
}

customElements.define('cafe-tablero-recepcion', TableroRecepcion);
