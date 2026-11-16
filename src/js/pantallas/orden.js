import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import {
    api,
    consultarMenu,
    leer,
    guardar,
} from '../control/servicios.js';
import {
    normalizar,
    dinero,
    centavos,
    validarOrden,
} from '../control/reglas.js';

/** Ilustraciones propias; no requieren archivos ni servicios externos. */
export function imagenCategoria(nombre) {
    const categoria = normalizar(nombre);

    const dibujo = /postre|pastel|pan/.test(categoria)
        ? `
            <path d="
                M28 78h104v35H28z
                M28 78l52-40 52 40
                M45 89v13m27-13v13m27-13v13
            "/>
        `
        : /fria|jugo|refresco/.test(categoria)
            ? `
                <path d="
                    M55 40h50l-8 78H63z
                    M83 65l14-43h18
                    M56 66h47
                "/>
            `
            : `
                <path d="
                    M40 60h65v30a25 25 0 0 1-25 25H65
                    a25 25 0 0 1-25-25z
                    M105 65h10a15 15 0 0 1 0 30h-10
                    M57 45V30m25 15V30
                    M30 122h90
                "/>
            `;

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 150">
            <rect width="160" height="150" rx="18" fill="#fff3e6"/>
            <g
                fill="none"
                stroke="#7c3425"
                stroke-width="6"
                stroke-linecap="round"
                stroke-linejoin="round">
                ${dibujo}
            </g>
        </svg>
    `;

    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export class Orden extends Vista {
    borrador = leer('borrador', {
        cliente: '',
        items: [],
    });

    categorias = [];
    productos = [];
    categoria = null;
    busqueda = '';
    copia = false;
    aviso = '';
    confirmacion = null;

    alConectar() {
        this.cargar();
    }

    cargar() {
        return this.ejecutar(async () => {
            const respuesta = await consultarMenu('/tipo_producto');
            this.categorias = respuesta.datos;
            this.copia = respuesta.copia;
        });
    }

    guardar() {
        if (!guardar('borrador', this.borrador)) {
            this.aviso =
                'El navegador no pudo guardar el borrador. '
                + 'No cierre esta pantalla.';
        }
    }

    seleccionar(categoria) {
        return this.ejecutar(async () => {
            const id = encodeURIComponent(categoria.idTipoProducto);

            const respuesta = await consultarMenu(
                `/tipo_producto/${id}/producto`
            );

            this.categoria = categoria;
            this.productos = respuesta.datos;
            this.copia = respuesta.copia;
        });
    }

    cambiar(producto, diferencia) {
        this.error = '';

        const items = this.borrador.items;
        const item = items.find(
            existente => existente.idProducto === producto.idProducto
        );

        const cantidad = (item?.cantidad || 0) + diferencia;

        if (cantidad > 20 || (!item && items.length >= 50)) {
            this.error =
                'Máximo 20 unidades por producto '
                + 'y 50 productos distintos.';
        } else if (cantidad <= 0) {
            this.borrador.items = items.filter(
                existente => existente !== item
            );
        } else if (item) {
            item.cantidad = cantidad;
        } else {
            items.push({
                ...producto,
                cantidad,
                observaciones: '',
            });
        }

        this.guardar();
        this.renderizar();
    }

    plantilla() {
        const borrador = this.borrador;

        const total = borrador.items.reduce(
            (suma, item) =>
                suma + centavos(item.precio) * item.cantidad,
            0
        );

        const categorias = this.categorias.filter(categoria =>
            normalizar(categoria.nombre).includes(
                normalizar(this.busqueda)
            )
        );

        return html`
            <h1>Un café a tu gusto</h1>
            <p>Selecciona tus productos y confirma tu pedido.</p>

            ${this.mensajes()}

            ${this.aviso
                ? html`
                    <p role="status" class="aviso">${this.aviso}</p>
                `
                : ''}

            ${this.copia
                ? html`
                    <p class="aviso">
                        Menú guardado. La disponibilidad y los precios
                        se verificarán al enviar.
                    </p>
                `
                : ''}

            ${this.confirmacion
                ? html`
                    <p class="panel" role="status">
                        Pedido registrado:
                        ${this.confirmacion.idOrden}.
                        Total: ${dinero(this.confirmacion.total)}.
                    </p>
                `
                : ''}

            <div class="columnas">
                <section>
                    <form id="buscar" class="panel">
                        <label>
                            Buscar categoría
                            <input
                                id="busqueda"
                                type="search"
                                value="${this.busqueda}">
                        </label>

                        <button ${deshabilitado(this.ocupado)}>
                            Buscar
                        </button>

                        <button
                            id="actualizar"
                            type="button"
                            class="secundario"
                            ${deshabilitado(this.ocupado)}>
                            Actualizar menú
                        </button>
                    </form>

                    <div class="grid">
                        ${categorias.map(categoria => html`
                            <button
                                class="categoria"
                                data-categoria="${categoria.idTipoProducto}"
                                ${deshabilitado(
                                    this.ocupado || !categoria.activo
                                )}>
                                <img
                                    src="${imagenCategoria(categoria.nombre)}"
                                    alt="Ilustración de ${categoria.nombre}">

                                <strong>${categoria.nombre}</strong>

                                <small>
                                    ${categoria.activo
                                        ? 'Ver productos'
                                        : 'No disponible'}
                                </small>
                            </button>
                        `)}
                    </div>

                    ${!this.categorias.length && !this.ocupado
                        ? html`
                            <p>
                                No hay categorías disponibles.
                                Si está sin conexión, primero debe
                                consultar el menú con conexión.
                            </p>
                        `
                        : ''}

                    <h2>
                        ${this.categoria?.nombre || 'Elige una categoría'}
                    </h2>

                    <div class="grid">
                        ${this.productos.map(producto => html`
                            <article class="panel">
                                <h3>${producto.nombre}</h3>
                                <p>${dinero(producto.precio)}</p>

                                <button
                                    data-agregar="${producto.idProducto}"
                                    ${deshabilitado(
                                        this.ocupado
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

                    ${this.categoria && !this.productos.length
                        ? html`
                            <p>Esta categoría no tiene productos.</p>
                        `
                        : ''}
                </section>

                <aside class="panel">
                    <h2>Tu pedido</h2>

                    <form id="pedido">
                        <label>
                            Tu nombre
                            <input
                                id="cliente"
                                maxlength="100"
                                required
                                value="${borrador.cliente}">
                        </label>

                        <ul>
                            ${borrador.items.map((item, indice) => html`
                                <li>
                                    <strong>${item.nombre}</strong>
                                    <p>
                                        ${dinero(item.precio)} por unidad
                                    </p>

                                    <div class="fila">
                                        <button
                                            type="button"
                                            data-menos="${indice}"
                                            aria-label="Quitar una unidad de ${item.nombre}"
                                            ${deshabilitado(this.ocupado)}>
                                            −
                                        </button>

                                        <span>${item.cantidad}</span>

                                        <button
                                            type="button"
                                            data-mas="${indice}"
                                            aria-label="Agregar una unidad de ${item.nombre}"
                                            ${deshabilitado(this.ocupado)}>
                                            +
                                        </button>
                                    </div>

                                    <label>
                                        Indicaciones
                                        <textarea
                                            data-nota="${indice}"
                                            maxlength="500"
                                        >${item.observaciones}</textarea>
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
                                this.ocupado || !borrador.items.length
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
            </div>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('#buscar', 'submit', evento => {
            evento.preventDefault();
            this.busqueda = this.$('#busqueda').value;
            this.renderizar();
        });

        this.escuchar('#actualizar', 'click', () => this.cargar());

        this.shadowRoot
            .querySelectorAll('[data-categoria]')
            .forEach(elemento => {
                elemento.onclick = () => this.seleccionar(
                    this.categorias.find(categoria =>
                        categoria.idTipoProducto
                        === elemento.dataset.categoria
                    )
                );
            });

        this.shadowRoot
            .querySelectorAll('[data-agregar]')
            .forEach(elemento => {
                elemento.onclick = () => this.cambiar(
                    this.productos.find(producto =>
                        producto.idProducto
                        === elemento.dataset.agregar
                    ),
                    1
                );
            });

        for (const [atributo, diferencia] of [
            ['menos', -1],
            ['mas', 1],
        ]) {
            this.shadowRoot
                .querySelectorAll(`[data-${atributo}]`)
                .forEach(elemento => {
                    elemento.onclick = () => {
                        const indice = Number(
                            elemento.dataset[atributo]
                        );

                        this.cambiar(
                            this.borrador.items[indice],
                            diferencia
                        );
                    };
                });
        }

        this.escuchar('#cliente', 'input', evento => {
            this.borrador.cliente = evento.target.value;
            this.guardar();
        });

        this.shadowRoot
            .querySelectorAll('[data-nota]')
            .forEach(elemento => {
                elemento.oninput = () => {
                    const indice = Number(elemento.dataset.nota);

                    this.borrador.items[indice].observaciones =
                        elemento.value;

                    this.guardar();
                };
            });

        this.escuchar('#pedido', 'submit', evento => {
            evento.preventDefault();

            this.ejecutar(async () => {
                const cuerpo = validarOrden(
                    this.borrador.cliente,
                    this.borrador.items
                );

                if (!navigator.onLine) {
                    throw new Error(
                        'Sin conexión. El borrador sigue guardado; '
                        + 'envíelo cuando recupere la conexión.'
                    );
                }

                try {
                    this.confirmacion = await api.post(
                        '/orden',
                        cuerpo
                    );
                } catch (error) {
                    if (error.status === 0) {
                        throw new Error(
                            'No recibimos confirmación. Consulte en '
                            + 'recepción antes de reenviar para evitar '
                            + 'duplicados. El borrador se conserva.'
                        );
                    }

                    throw error;
                }

                this.borrador = {
                    cliente: '',
                    items: [],
                };

                this.guardar();
            });
        });
    }
}

customElements.define('cafe-pantalla-orden', Orden);