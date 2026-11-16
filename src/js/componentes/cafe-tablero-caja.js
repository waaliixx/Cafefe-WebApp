import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import './cafe-tarjeta-cobro.js';

/** Lista de órdenes que esperan ser cobradas. :)) */
export class TableroCaja extends Vista {
    static estilos = Vista.estilos + `
        .barra { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .barra p { margin: 0; }
        .ordenes { display: grid; gap: 1rem; }
        .vacio { padding: 2rem; text-align: center; }
    `;

    plantilla() {
        const { ordenes = [], ocupado, cargado } = this.estado;
        return html`
            <section aria-label="Órdenes pendientes de cobro" aria-busy="${Boolean(ocupado)}">
                <div class="barra">
                    <p role="status">${cargado ? html`<strong>${ordenes.length}</strong> órdenes por cobrar` : 'Consulta las órdenes que esperan cobro.'}</p>
                    <button id="actualizar" type="button" ${deshabilitado(ocupado)}>Actualizar órdenes</button>
                </div>
                <div class="ordenes">
                    ${ordenes.map((orden, indice) => html`<cafe-tarjeta-cobro data-indice="${indice}"></cafe-tarjeta-cobro>`)}
                </div>
                ${cargado && !ocupado && !ordenes.length ? html`
                    <div class="panel vacio" role="status"><h2>No hay órdenes por cobrar</h2><p>Actualiza el listado para consultar nuevas órdenes.</p></div>
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
                seleccionada: this.estado.seleccion?.idOrden === orden.idOrden,
                ocupado: this.estado.ocupado,
            }, {
                'cafefe:seleccionar-orden': id => this.emitir('cafefe:seleccionar-orden', id),
            });
        });
    }
}

customElements.define('cafe-tablero-caja', TableroCaja);
