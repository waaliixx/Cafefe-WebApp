import { CONFIG } from './config.js';
import { ApiClient } from './api.js';
import { Router } from './router.js';
import { Store } from './base/Store.js';
import { rutas } from './rutas.js';

/** Instancias compartidas por toda la aplicación. */
export const sesion = new Store({ usuario: null });
export const api = new ApiClient({ baseUrl: CONFIG.API_URL });
export const router = new Router({ rutas });