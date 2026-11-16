import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { normalizar } from '../control/reglas.js';

import './cafe-tarjeta-categoria.js';
import './cafe-lista-productos.js';

export class Catalogo extends Vista {
    filtradas() {
        return (this.estado.categorias || []).filter(categoria =>
            normalizar(categoria.nombre).includes(
                normalizar(this.estado.busqueda)
            )
        );
    }

    plantilla() {
        const { ocupado, busqueda = '' } = this.estado;

        return html`
            <section>
                <form class="panel">
                    <label>
                        Buscar categoría
                        <input
                            id="busqueda"
                            type="search"
                            value="${busqueda}"
                            ${deshabilitado(ocupado)}>
                    </label>

                    <button ${deshabilitado(ocupado)}>
                        Buscar
                    </button>

                    <button
                        id="actualizar"
                        type="button"
                        class="secundario"
                        ${deshabilitado(ocupado)}>
                        Actualizar menú
                    </button>
                </form>

                <div class="grid">
                    ${this.filtradas().map((categoria, indice) => html`
                        <cafe-tarjeta-categoria
                            data-indice="${indice}">
                        </cafe-tarjeta-categoria>
                    `)}
                </div>

                ${!this.filtradas().length && !ocupado
                    ? html`
                        <p>
                            No hay categorías para mostrar.
                            Pruebe otra búsqueda o actualice
                            el menú con conexión.
                        </p>
                    `
                    : ''}

                <cafe-lista-productos></cafe-lista-productos>
            </section>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('form', 'submit', evento => {
            evento.preventDefault();

            if (!this.estado.ocupado) {
                this.emitir(
                    'cafefe:buscar',
                    this.$('#busqueda').value
                );
            }
        });

        this.escuchar('#actualizar', 'click', () => {
            this.emitir('cafefe:actualizar-menu');
        });

        this.filtradas().forEach((categoria, indice) => {
            this.configurarHijo(
                `[data-indice="${indice}"]`,
                {
                    categoria,
                    ocupado: this.estado.ocupado,
                }
            );
        });

        this.configurarHijo(
            'cafe-lista-productos',
            this.estado
        );

        // Los eventos de los hijos atraviesan el Shadow DOM.
        // No los reemitimos para evitar acciones duplicadas.
    }
}

customElements.define('cafe-catalogo', Catalogo);