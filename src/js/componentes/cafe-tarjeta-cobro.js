import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero } from '../control/reglas.js';

/** Una orden pendiente dentro del tablero de caja. :b */
export class TarjetaCobro extends Vista {
    static estilos = Vista.estilos + `
        :host { display: block; min-width: 0; }
        article { background: white; border: 1px solid var(--color-borde, #dbcbbd); border-radius: .85rem; overflow: hidden; }
        article.seleccionada { border: 2px solid #7c3425; }
        .cabecera { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; padding: 1rem 1.1rem; border-radius: 0; background: #f4ece3; color: var(--cafe-grano, #2a1a1f); text-align: left; }
        .identidad { display: grid; gap: .25rem; min-width: 0; }
        .identidad strong { overflow-wrap: anywhere; }
        .estado { display: inline-block; padding: .3rem .65rem; border-radius: 1rem; background: #fff0ce; color: #684715; font-size: .8rem; white-space: nowrap; }
        .cuerpo { padding: 1rem 1.1rem; }
        .resumen { display: flex; flex-wrap: wrap; gap: .5rem 1rem; }
        .resumen p { margin: 0; }
        .total { margin: .8rem 0 0; font-size: 1.15rem; font-weight: 800; }
        .ayuda { margin: .8rem 0 0; color: #66584d; font-size: .9rem; }
    `;

    plantilla() {
        const { orden, seleccionada, ocupado } = this.estado;
        if (!orden) return html``;
        const fecha = orden.fechaCreacion ? new Date(orden.fechaCreacion) : null;
        const hora = fecha && !Number.isNaN(fecha.getTime())
            ? fecha.toLocaleString('es-SV', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            : 'Hora no disponible';

        return html`
            <article class="${seleccionada ? 'seleccionada' : ''}">
                <button class="cabecera" type="button" aria-pressed="${Boolean(seleccionada)}" title="Cobrar orden ${orden.idOrden}" ${deshabilitado(ocupado)}>
                    <span class="identidad">
                        <small>ORDEN #${String(orden.idOrden).slice(0, 8)}</small>
                        <strong>${orden.cliente || 'Cliente del local'}</strong>
                    </span>
                    <span class="estado">Por cobrar</span>
                </button>
                <div class="cuerpo">
                    <div class="resumen"><p>${hora}</p><p>${orden.tomadaPor || 'Orden registrada'}</p></div>
                    <p class="total">${dinero(orden.total)}</p>
                    <p class="ayuda">${seleccionada ? 'Esta orden está lista para registrar el pago.' : 'Selecciona la orden para realizar el cobro.'}</p>
                </div>
            </article>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('.cabecera', 'click', () => {
            if (!this.estado.ocupado) this.emitir('cafefe:seleccionar-orden', this.estado.orden.idOrden);
        });
    }
}

customElements.define('cafe-tarjeta-cobro', TarjetaCobro);
