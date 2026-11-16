import { CafeElement } from '../base/CafeElement.js';
import { html } from '../base/html.js';

export class CafePantallaNoEncontrada extends CafeElement {
    static estilos = `
        :host { display: block; }
        h1 { margin-top: 0; }
        a { color: var(--color-primario); font-weight: 600; }
    `;

    plantilla() {
        return html`
            <h1>Página no encontrada</h1>
            <p>La dirección que buscas no existe o no tienes acceso a ella.</p>
            <a href="#/">Volver al inicio</a>
        `;
    }
}

if (!customElements.get('cafe-pantalla-no-encontrada')) {
    customElements.define('cafe-pantalla-no-encontrada', CafePantallaNoEncontrada);
}