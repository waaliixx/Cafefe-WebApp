import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';

export class TarjetaOrden extends Vista {
    static estilos = Vista.estilos + `
        :host { display: block; min-width: 0; }
        article {
            background: white;
            border: 1px solid var(--color-borde, #dbcbbd);
            border-radius: .85rem;
            overflow: hidden;
        }
        article.abierta { border-color: #7c3425; }
        .cabecera {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            width: 100%;
            border-radius: 0;
            background: #f4ece3;
            color: var(--cafe-grano, #2a1a1f);
            text-align: left;
            padding: 1rem 1.2rem;
        }
        .cabecera:focus-visible { outline-offset: -4px; }
        .identidad { min-width: 0; display: grid; gap: .3rem; }
        .identidad strong { overflow-wrap: anywhere; }
        .estado {
            display: inline-block;
            padding: .3rem .65rem;
            border-radius: 1rem;
            background: #fff0ce;
            color: #684715;
            font-size: .8rem;
        }
        .cuerpo { padding: 1rem 1.2rem; }
        .resumen { display: flex; flex-wrap: wrap; gap: .7rem 1.5rem; }
        .resumen p { margin: 0; }
        ul { margin: 1rem 0 0; }
        li { display: flex; align-items: start; gap: .8rem; }
        .cantidad {
            background: #f4ece3;
            border-radius: .4rem;
            padding: .3rem .5rem;
            font-weight: 700;
            white-space: nowrap;
        }
        .producto { min-width: 0; overflow-wrap: anywhere; }
        .nota { margin: .35rem 0 0; color: #7c3425; white-space: pre-wrap; }
        .ayuda { margin: .8rem 0 0; color: #66584d; font-size: .9rem; }
    `;

    agrupar(productos = []) {
        const grupos = new Map();
        for (const producto of productos) {
            const clave = JSON.stringify([
                producto.idProducto,
                producto.producto,
                producto.nota || ''
            ]);
            if (!grupos.has(clave)) {
                grupos.set(clave, { ...producto, cantidad: 0 });
            }
            grupos.get(clave).cantidad += 1;
        }
        return [...grupos.values()];
    }

    plantilla() {
        const { orden, detalle, ocupado } = this.estado;
        if (!orden) return html``;
        const abierta = Boolean(detalle);
        const fecha = orden.fechaCreacion ? new Date(orden.fechaCreacion) : null;
        const hora = fecha && !Number.isNaN(fecha.getTime())
            ? fecha.toLocaleString('es-SV', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            }) : 'Hora no disponible';

        return html`
            <article class="${abierta ? 'abierta' : ''}">
                <button class="cabecera" type="button"
                    aria-expanded="${abierta}" aria-controls="contenido"
                    title="Orden ${orden.idOrden}"
                    ${deshabilitado(ocupado)}>
                    <span class="identidad">
                        <small>PEDIDO #${String(orden.idOrden).slice(0, 8)}</small>
                        <strong>${orden.cliente || 'Cliente del local'}</strong>
                    </span>
                    <span aria-hidden="true">${abierta ? '−' : '+'}</span>
                </button>
                <div class="cuerpo">
                    <div class="resumen">
                        <p>${hora}</p>
                        <span class="estado">Pendiente de pago</span>
                    </div>
                    <div id="contenido">
                        ${abierta ? html`
                            <ul aria-label="Productos del pedido">
                                ${this.agrupar(detalle.productos).map(producto => html`
                                    <li>
                                        <span class="cantidad">${producto.cantidad}×</span>
                                        <div class="producto">
                                            <strong>${producto.producto || 'Producto'}</strong>
                                            ${producto.nota ? html`
                                                <p class="nota">${producto.nota}</p>
                                            ` : ''}
                                        </div>
                                    </li>
                                `)}
                            </ul>
                        ` : html`<p class="ayuda">Selecciona el pedido para ver sus productos.</p>`}
                    </div>
                </div>
            </article>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('.cabecera', 'click', () => {
            if (this.estado.ocupado) return;
            this.emitir('cafefe:seleccionar-orden', this.estado.orden.idOrden);
        });
    }
}

customElements.define('cafe-tarjeta-orden', TarjetaOrden);
