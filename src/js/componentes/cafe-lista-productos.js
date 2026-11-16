import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero } from '../control/reglas.js';

export class ListaProductos extends Vista {
    plantilla() {
        const {
            productos = [],
            categoria,
            ocupado,
        } = this.estado;

        return html`
            <section>
                <h2>${categoria?.nombre || 'Elige una categoría'}</h2>

                <div class="grid">
                    ${productos.map((producto, indice) => html`
                        <article class="panel">
                            <h3>${producto.nombre}</h3>
                            <p>${dinero(producto.precio)}</p>

                            <button
                                data-indice="${indice}"
                                ${deshabilitado(
                                    ocupado
                                    || !producto.activo
                                    || producto.precio == null
                                    || Number(producto.precio) <= 0
                                )}>
                                ${producto.activo
                                    ? 'Agregar'
                                    : 'No disponible'}
                            </button>
                        </article>
                    `)}
                </div>

                ${categoria && !productos.length && !ocupado
                    ? html`<p>Esta categoría no tiene productos.</p>`
                    : ''}
            </section>
        `;
    }

    despuesDeRenderizar() {
        this.shadowRoot
            .querySelectorAll('[data-indice]')
            .forEach(boton => {
                boton.onclick = () => {
                    if (this.estado.ocupado) return;

                    const producto = this.estado.productos[
                        Number(boton.dataset.indice)
                    ];

                    this.emitir(
                        'cafefe:agregar-producto',
                        producto.idProducto
                    );
                };
            });
    }
}

customElements.define('cafe-lista-productos', ListaProductos);