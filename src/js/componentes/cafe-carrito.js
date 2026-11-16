import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { dinero, centavos } from '../control/reglas.js';

export class Carrito extends Vista {
    plantilla() {
        const {
            borrador = { cliente: '', items: [] },
            ocupado,
        } = this.estado;

        const total = borrador.items.reduce(
            (suma, item) =>
                suma + centavos(item.precio) * item.cantidad,
            0
        );

        return html`
            <aside class="panel">
                <h2>Tu pedido</h2>

                <form>
                    <label>
                        Tu nombre
                        <input
                            id="cliente"
                            maxlength="100"
                            required
                            value="${borrador.cliente}"
                            ${deshabilitado(ocupado)}>
                    </label>

                    <ul>
                        ${borrador.items.map((item, indice) => html`
                            <li>
                                <strong>${item.nombre}</strong>
                                <p>${dinero(item.precio)} por unidad</p>

                                <div class="fila">
                                    <button
                                        type="button"
                                        data-indice="${indice}"
                                        data-delta="-1"
                                        aria-label="Quitar una unidad de ${item.nombre}"
                                        ${deshabilitado(ocupado)}>
                                        −
                                    </button>

                                    <span>${item.cantidad}</span>

                                    <button
                                        type="button"
                                        data-indice="${indice}"
                                        data-delta="1"
                                        aria-label="Agregar una unidad de ${item.nombre}"
                                        ${deshabilitado(
                                            ocupado || item.cantidad >= 20
                                        )}>
                                        +
                                    </button>
                                </div>

                                <label>
                                    Indicaciones
                                    <textarea
                                        data-nota="${indice}"
                                        maxlength="500"
                                        ${deshabilitado(ocupado)}
                                    >${item.observaciones || ''}</textarea>
                                </label>
                            </li>
                        `)}
                    </ul>

                    ${!borrador.items.length
                        ? html`<p>Tu pedido está vacío.</p>`
                        : ''}

                    <p class="total">
                        Total estimado: ${dinero(total / 100)}
                    </p>

                    <button
                        ${deshabilitado(
                            ocupado || !borrador.items.length
                        )}>
                        Confirmar pedido
                    </button>

                    <p class="muted">
                        El borrador se conserva en este navegador.
                        El pedido solo queda registrado cuando
                        el servidor lo confirma.
                    </p>
                </form>
            </aside>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('#cliente', 'input', evento => {
            this.emitir('cafefe:cliente', evento.target.value);
        });

        this.shadowRoot
            .querySelectorAll('[data-delta]')
            .forEach(boton => {
                boton.onclick = () => {
                    if (this.estado.ocupado) return;

                    const item = this.estado.borrador.items[
                        Number(boton.dataset.indice)
                    ];

                    this.emitir('cafefe:cantidad', {
                        idProducto: item.idProducto,
                        delta: Number(boton.dataset.delta),
                    });
                };
            });

        this.shadowRoot
            .querySelectorAll('[data-nota]')
            .forEach(campo => {
                campo.oninput = () => {
                    const item = this.estado.borrador.items[
                        Number(campo.dataset.nota)
                    ];

                    this.emitir('cafefe:nota', {
                        idProducto: item.idProducto,
                        observaciones: campo.value,
                    });
                };
            });

        this.escuchar('form', 'submit', evento => {
            evento.preventDefault();

            if (!this.estado.ocupado) {
                this.emitir('cafefe:confirmar-orden');
            }
        });
    }
}

customElements.define('cafe-carrito', Carrito);