import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { imagenCategoria } from '../control/imagen-categoria.js';

export class TarjetaCategoria extends Vista {
    static estilos = Vista.estilos + `
        .categoria {
            width: 100%;
            height: 100%;
        }
    `;

    plantilla() {
        const { categoria, ocupado } = this.estado;

        if (!categoria) {
            return html``;
        }

        return html`
            <button
                class="categoria"
                ${deshabilitado(ocupado || !categoria.activo)}
            >
                <img
                    src="${imagenCategoria(categoria.nombre)}"
                    alt="Ilustración de ${categoria.nombre}"
                >

                <strong>${categoria.nombre}</strong>

                <small>
                    ${categoria.activo
                        ? 'Ver productos'
                        : 'No disponible'}
                </small>
            </button>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('button', 'click', () => {
            const { categoria, ocupado } = this.estado;

            if (categoria?.activo && !ocupado) {
                this.emitir(
                    'cafefe:categoria',
                    categoria.idTipoProducto
                );
            }
        });
    }
}

customElements.define(
    'cafe-tarjeta-categoria',
    TarjetaCategoria
);