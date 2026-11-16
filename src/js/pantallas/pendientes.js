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
        this.actualizarAlRegresar = () => this.cargar();
        window.addEventListener('focus', this.actualizarAlRegresar);
    }

    alDesconectar() {
        window.removeEventListener('focus', this.actualizarAlRegresar);
    }

    cargar() {
        return this.ejecutar(async () => {
            this.ordenes = await api.get('/orden/preparacion');
            this.seleccion = null;
        });
    }

    elegir(id) {
        return this.ejecutar(async () => {
            this.seleccion = null;

            const orden = await api.get(
                `/orden/${encodeURIComponent(id)}/preparacion`
            );

            if (!orden.productos.length) {
                throw new Error(
                    'La orden ya no tiene productos. ' +
                    'Actualice el listado.'
                );
            }

            this.seleccion = orden;
            this.alSeleccionar();
        });
    }

    cambiarEstado({ idOrdenProducto, estado }) {
        if (!this.seleccion || !idOrdenProducto) return;
        return this.ejecutar(async () => {
            const id = this.seleccion.idOrden;
            this.seleccion = await api.put(
                `/orden/${encodeURIComponent(id)}/producto/${encodeURIComponent(idOrdenProducto)}/preparacion`,
                { estado }
            );
            this.ordenes = await api.get('/orden/preparacion');
        });
    }

    despachar() {
        if (!this.seleccion) return;
        return this.ejecutar(async () => {
            await api.put(`/orden/${encodeURIComponent(this.seleccion.idOrden)}/despacho`);
            this.ordenes = await api.get('/orden/preparacion');
            this.seleccion = null;
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
                ocupado: this.ocupado,
                seleccionado: this.seleccion?.idOrden ?? null
            },
            {
                'cafefe:actualizar-ordenes': () => this.cargar(),
                'cafefe:seleccionar-orden': id => this.elegir(id)
            }
        );

        this.configurarHijo(
            'cafe-detalle-orden',
            {
                orden: this.seleccion,
                ocupado: this.ocupado,
                cocina: this.titulo === 'Recepción de órdenes'
            }, {
                'cafefe:cambiar-estado': dato => this.cambiarEstado(dato),
                'cafefe:despachar-orden': () => this.despachar()
            }
        );
    }
}

customElements.define('cafe-pantalla-pendientes', Pendientes);