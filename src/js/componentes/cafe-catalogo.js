import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { normalizar } from '../control/reglas.js';

import './cafe-tarjeta-categoria.js';
import './cafe-lista-productos.js';

export class Catalogo extends Vista {
    static estilos = Vista.estilos + `
        .acciones-busqueda {
            display: flex;
            align-items: center;
            gap: .75rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }

        #actualizar {
            margin-left: auto;
        }
    `;

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
                    <input
                        id="busqueda"
                        type="search"
                        aria-label="Buscar categoría"
                        value="${busqueda}"
                        ${deshabilitado(ocupado)}
                    >

                    <div class="acciones-busqueda">
                        <button
                            type="submit"
                            ${deshabilitado(ocupado)}
                        >
                            Buscar categoría
                        </button>

                        <button
                            id="actualizar"
                            type="button"
                            class="secundario"
                            ${deshabilitado(ocupado)}
                        >
                            Actualizar menú
                        </button>
                    </div>
                </form>

                <div class="grid">
                    ${this.filtradas().map((categoria, indice) => html`
                        <cafe-tarjeta-categoria
                            data-indice="${indice}"
                        >
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
                    : ''
                }

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
                    ocupado: this.estado.ocupado
                }
            );
        });

        this.configurarHijo(
            'cafe-lista-productos',
            this.estado
        );
    }
}

customElements.define('cafe-catalogo', Catalogo);