import { CONFIG } from './config.js';
import { ApiClient } from './api.js';
import { Store } from './base/Store.js';
import { Router } from './router.js';
import { rutas } from './rutas.js';
import { permite } from './reglas.js';

export function leer(clave, defecto, tipo = 'localStorage') {
    try {
        const texto = globalThis[tipo].getItem(`cafefe.${clave}`);
        return JSON.parse(texto) ?? defecto;
    } catch {
        return defecto;
    }
}

export function guardar(clave, valor, tipo = 'localStorage') {
    try {
        globalThis[tipo].setItem(
            `cafefe.${clave}`,
            JSON.stringify(valor)
        );
        return true;
    } catch {
        return false;
    }
}

export const api = new ApiClient({
    baseUrl: CONFIG.API_URL,
});

export const sesion = new Store({
    usuario: leer('sesion', null, 'sessionStorage'),
});

export function iniciarSesion(usuario) {
    guardar('sesion', usuario, 'sessionStorage');
    sesion.set({ usuario });
}

export const router = new Router({
    rutas,
    guard: ruta =>
        permite(sesion.get('usuario'), ruta.roles) || '/login',
});

/**
 * El catálogo consultado queda disponible sin conexión.
 * Un error de servidor no se oculta usando datos anteriores.
 */
export async function consultarMenu(ruta) {
    try {
        const datos = await api.get(ruta);
        guardar(`menu.${ruta}`, datos);

        return { datos, copia: false };
    } catch (error) {
        const datos = leer(`menu.${ruta}`, null);

        if (error.status !== 0 || !datos) {
            throw error;
        }

        return { datos, copia: true };
    }
}

export const ticketUrl = id =>
    `${CONFIG.API_URL}/factura/${encodeURIComponent(id)}/ticket`;