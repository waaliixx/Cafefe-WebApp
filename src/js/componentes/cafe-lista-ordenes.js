import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero } from '../control/reglas.js';

export class ListaOrdenes extends Vista {
    plantilla() {
        const {
            ordenes = [],
            titulo = 'Órdenes pendientes',
            ocupado,
        } = this.estado;

        return html`
            <section>
                <div class="fila">
                    <h1>${titulo}</h1>

                    <button
                        id="actualizar"
                        ${deshabilitado(ocupado)}>
                        Actualizar órdenes
                    </button>
                </div>

                <p>
                    Se muestran productos pendientes de pago.
                    Actualice para consultar los cambios.
                </p>

                <div class="grid">
                    ${ordenes.map((orden, indice) => html`
                        <button
                            class="categoria"
                            data-indice="${indice}"
                            ${deshabilitado(ocupado)}>
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

                ${!ocupado && !ordenes.length
                    ? html`<p>No hay órdenes pendientes.</p>`
                    : ''}
            </section>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('#actualizar', 'click', () => {
            this.emitir('cafefe:actualizar-ordenes');
        });

        this.shadowRoot
            .querySelectorAll('[data-indice]')
            .forEach(boton => {
                boton.onclick = () => {
                    if (this.estado.ocupado) return;

                    const orden = this.estado.ordenes[
                        Number(boton.dataset.indice)
                    ];

                    this.emitir(
                        'cafefe:seleccionar-orden',
                        orden.idOrden
                    );
                };
            });
    }
}

customElements.define('cafe-lista-ordenes', ListaOrdenes);