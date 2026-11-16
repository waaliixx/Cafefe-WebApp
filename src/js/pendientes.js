import { Vista, deshabilitado } from './vista.js';
import { html } from './base/html.js';
import { api } from './servicios.js';
import { dinero } from './reglas.js';

export class Pendientes extends Vista {
    ordenes = [];
    seleccion = null;
    titulo = 'Recepción de órdenes';

    alConectar() {
        this.cargar();
    }

    cargar() {
        return this.ejecutar(async () => {
            this.ordenes = await api.get('/orden/pendiente');
            this.seleccion = null;
        });
    }

    elegir(id) {
        return this.ejecutar(async () => {
            this.seleccion = null;

            const orden = await api.get(
                `/orden/pendiente/${encodeURIComponent(id)}`
            );

            if (!orden.productos.length) {
                throw new Error(
                    'La orden ya no tiene productos pendientes. '
                    + 'Actualice el listado.'
                );
            }

            this.seleccion = orden;
            this.alSeleccionar();
        });
    }

    alSeleccionar() {}

    lista() {
        return html`
            <section>
                <div class="fila">
                    <h1>${this.titulo}</h1>

                    <button
                        id="actualizar"
                        ${deshabilitado(this.ocupado)}>
                        Actualizar órdenes
                    </button>
                </div>

                <p>
                    Se muestran únicamente productos pendientes de pago.
                    Actualice para consultar los cambios.
                </p>

                <div class="grid">
                    ${this.ordenes.map(orden => html`
                        <button
                            class="categoria"
                            data-orden="${orden.idOrden}"
                            ${deshabilitado(this.ocupado)}>
                            <strong>
                                ${orden.cliente || 'Cliente del local'}
                            </strong>

                            <span>${orden.idOrden.slice(0, 8)}</span>

                            <span>
                                ${orden.fechaCreacion
                                    ? new Date(
                                        orden.fechaCreacion
                                    ).toLocaleString('es-SV')
                                    : ''}
                            </span>

                            <span>${dinero(orden.total)}</span>
                            <small>${orden.tomadaPor || ''}</small>
                        </button>
                    `)}
                </div>

                ${!this.ocupado && !this.ordenes.length
                    ? html`<p>No hay órdenes pendientes.</p>`
                    : ''}
            </section>
        `;
    }

    detalle() {
        const orden = this.seleccion;

        return orden
            ? html`
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
                                            Indicaciones:
                                            ${producto.nota}
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
            `
            : '';
    }

    plantilla() {
        return html`
            ${this.mensajes()}
            ${this.lista()}
            ${this.detalle()}
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('#actualizar', 'click', () => this.cargar());

        this.shadowRoot
            .querySelectorAll('[data-orden]')
            .forEach(elemento => {
                elemento.onclick = () =>
                    this.elegir(elemento.dataset.orden);
            });
    }
}

customElements.define('cafe-pantalla-pendientes', Pendientes);