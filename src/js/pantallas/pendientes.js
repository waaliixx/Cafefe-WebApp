import { Vista } from '../base/Vista.js';
import { html } from '../base/html.js';
import { api } from '../control/servicios.js';

import '../componentes/cafe-lista-ordenes.js';
import '../componentes/cafe-detalle-orden.js';

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
        return html`
            ${this.mensajes()}
            ${this.lista()}
            ${this.detalle()}
        `;
    }

    despuesDeRenderizar() {
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