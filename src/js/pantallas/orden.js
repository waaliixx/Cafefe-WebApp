import { Vista } from '../base/Vista.js';
import { html } from '../base/html.js';
import {
    api,
    consultarMenu,
    leer,
    guardar
} from '../control/servicios.js';
import {
    dinero,
    validarOrden
} from '../control/reglas.js';

import '../componentes/cafe-catalogo.js';
import '../componentes/cafe-carrito.js';

export class Orden extends Vista {
    static estilos = Vista.estilos + `
        .titulo-orden {
            font-size: clamp(1.2rem, 2.5vw, 1.5rem);
            font-weight: 600;
            line-height: 1.4;
            margin: 0 0 1.5rem;
        }

        .columnas {
            gap: 2.5rem;
            align-items: start;
        }

        @media (max-width: 760px) {
            .columnas {
                gap: 2rem;
            }
        }
    `;

    borrador = leer('borrador', {
        cliente: '',
        items: []
    });

    categorias = [];
    productos = [];
    categoria = null;
    busqueda = '';
    copia = false;
    aviso = '';
    confirmacion = null;
    actualizandoMenu = false;

    alConectar() {
        this.cargar();
    }

    async cargar(silencioso = false) {
        if (this.ocupado) return;

        this.actualizandoMenu = silencioso;

        try {
            await this.ejecutar(async () => {
                const respuesta = await consultarMenu('/tipo_producto');

                this.categorias = respuesta.datos;
                this.copia = respuesta.copia;
            });
        } finally {
            this.actualizandoMenu = false;
        }
    }

    mensajes() {
        if (!this.actualizandoMenu) {
            return super.mensajes();
        }

        return html`
            ${this.error
                ? html`
                    <p class="error" role="alert">
                        ${this.error}
                    </p>
                `
                : ''
            }
        `;
    }

    guardar() {
        if (!guardar('borrador', this.borrador)) {
            this.aviso =
                'El navegador no pudo guardar el borrador. ' +
                'No cierre esta pantalla.';
        }
    }

    async seleccionar(categoria) {
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

    cambiar(producto, delta) {
        if (this.ocupado || !producto) return;

        this.error = '';

        const items = this.borrador.items;

        const item = items.find(
            elemento => elemento.idProducto === producto.idProducto
        );

        const cantidad = (item?.cantidad || 0) + delta;

        if (cantidad > 20 || (!item && items.length >= 50)) {
            this.error =
                'Máximo 20 unidades por producto y 50 productos distintos.';
        } else if (cantidad <= 0) {
            this.borrador.items = items.filter(
                elemento => elemento !== item
            );
        } else if (item) {
            item.cantidad = cantidad;
        } else {
            items.push({
                ...producto,
                cantidad,
                observaciones: ''
            });
        }

        this.guardar();
        this.renderizar();
    }

    plantilla() {
        return html`
            <h1 class="titulo-orden">
                Selecciona tus productos y confirma tu pedido.
            </h1>

            ${this.mensajes()}

            ${this.aviso
                ? html`
                    <p role="status" class="aviso">
                        ${this.aviso}
                    </p>
                `
                : ''
            }

            ${this.copia
                ? html`
                    <p class="aviso">
                        Menú guardado. La disponibilidad y los precios
                        se verificarán al enviar.
                    </p>
                `
                : ''
            }

            ${this.confirmacion
                ? html`
                    <p class="panel" role="status">
                        Pedido registrado: ${this.confirmacion.idOrden}.
                        Total: ${dinero(this.confirmacion.total)}.
                    </p>
                `
                : ''
            }

            <div class="columnas" aria-busy="${this.ocupado}">
                <cafe-catalogo></cafe-catalogo>
                <cafe-carrito></cafe-carrito>
            </div>
        `;
    }

    despuesDeRenderizar() {
        this.configurarHijo(
            'cafe-catalogo',
            {
                categorias: this.categorias,
                productos: this.productos,
                categoria: this.categoria,
                busqueda: this.busqueda,
                ocupado: this.ocupado
            },
            {
                'cafefe:buscar': texto => {
                    this.busqueda = texto;
                    this.renderizar();
                },

                'cafefe:actualizar-menu': () => this.cargar(true),

                'cafefe:categoria': id => {
                    const categoria = this.categorias.find(
                        elemento => elemento.idTipoProducto === id
                    );

                    return this.seleccionar(categoria);
                },

                'cafefe:agregar-producto': id => {
                    const producto = this.productos.find(
                        elemento => elemento.idProducto === id
                    );

                    this.cambiar(producto, 1);
                }
            }
        );

        this.configurarHijo(
            'cafe-carrito',
            {
                borrador: this.borrador,
                ocupado: this.ocupado
            },
            {
                'cafefe:cliente': texto => {
                    this.borrador.cliente = texto;
                    this.guardar();
                },

                'cafefe:nota': dato => {
                    const item = this.borrador.items.find(
                        elemento => elemento.idProducto === dato.idProducto
                    );

                    if (item) {
                        item.observaciones = dato.observaciones;
                        this.guardar();
                    }
                },

                'cafefe:cantidad': dato => {
                    const item = this.borrador.items.find(
                        elemento => elemento.idProducto === dato.idProducto
                    );

                    this.cambiar(item, dato.delta);
                },

                'cafefe:confirmar-orden': () => this.enviar()
            }
        );
    }

    enviar() {
        return this.ejecutar(async () => {
            const cuerpo = validarOrden(
                this.borrador.cliente,
                this.borrador.items
            );

            if (!navigator.onLine) {
                throw new Error(
                    'Sin conexión. El borrador sigue guardado; ' +
                    'envíelo cuando recupere la conexión.'
                );
            }

            try {
                this.confirmacion = await api.post('/orden', cuerpo);
            } catch (error) {
                if (error.status === 0) {
                    throw new Error(
                        'No recibimos confirmación. Consulte en recepción ' +
                        'antes de reenviar para evitar duplicados. ' +
                        'El borrador se conserva.'
                    );
                }

                throw error;
            }

            this.borrador = {
                cliente: '',
                items: []
            };

            this.guardar();
        });
    }
}

customElements.define('cafe-pantalla-orden', Orden);