import { Vista } from '../base/Vista.js';
import { html } from '../base/html.js';
import { api, sesion } from '../control/servicios.js';

import '../componentes/cafe-lista-ordenes.js';
import '../componentes/cafe-detalle-orden.js';
import '../componentes/cafe-tablero-recepcion.js';

export class Pendientes extends Vista {
    cargado = false;
    ordenes = [];
    seleccion = null;
    titulo = 'Recepción de órdenes';

    alConectar() {
        this.cargar();
    }

    cargar() {
        return this.ejecutar(async () => {
            this.ordenes = await api.get('/orden/pendiente');
            this.cargado = true;
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
                    'La orden ya no tiene productos pendientes. ' +
                    'Actualice el listado.'
                );
            }

            this.seleccion = orden;
            this.alSeleccionar();
        });
    }

    alSeleccionar() {
        // La pantalla de pago agrega aquí su comportamiento.
    }

    lista() {
        return html`
            <cafe-lista-ordenes></cafe-lista-ordenes>
        `;
    }

    detalle() {
        return html`
            <cafe-detalle-orden></cafe-detalle-orden>
        `;
    }

    plantilla() {
        const nombre = sesion.get('usuario')?.empleado?.nombre;
        return html`
            <h1>${nombre ? `¡Hola, ${nombre}!` : 'Recepción de órdenes'}</h1>
            <p>Selecciona un pedido para consultar sus productos e indicaciones.</p>
            ${this.mensajes()}
            <cafe-tablero-recepcion></cafe-tablero-recepcion>
        `;
    }

    despuesDeRenderizar() {
        this.configurarHijo('cafe-tablero-recepcion', {
            ordenes: this.ordenes,
            seleccion: this.seleccion,
            ocupado: this.ocupado,
            cargado: this.cargado
        }, {
            'cafefe:actualizar-ordenes': () => this.cargar(),
            'cafefe:seleccionar-orden': id => {
                if (this.ocupado) return;
                if (this.seleccion?.idOrden === id) {
                    this.seleccion = null;
                    this.renderizar();
                } else {
                    this.elegir(id);
                }
            }
        });

        this.configurarHijo(
            'cafe-lista-ordenes',
            {
                ordenes: this.ordenes,
                titulo: this.titulo,
                ocupado: this.ocupado
            },
            {
                'cafefe:actualizar-ordenes': () => this.cargar(),
                'cafefe:seleccionar-orden': id => this.elegir(id)
            }
        );

        this.configurarHijo(
            'cafe-detalle-orden',
            {
                orden: this.seleccion
            }
        );
    }
}

customElements.define('cafe-pantalla-pendientes', Pendientes);