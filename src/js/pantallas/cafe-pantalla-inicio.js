import { CafeElement } from '../base/CafeElement.js';
import { html } from '../base/html.js';

export class CafePantallaInicio extends CafeElement {
    static estilos = `
        :host { display: block; }
        h1 { margin-top: 0; color: var(--cafe-grano); }
        p { max-width: 60ch; line-height: 1.5; }
    `;

    plantilla() {
        return html`
            <h1>Bienvenido a Cafefe</h1>
            <p>Aquí aparecerán las pantallas de la aplicación a medida que las construyamos.</p>
        `;
    }
}

if (!customElements.get('cafe-pantalla-inicio')) customElements.define('cafe-pantalla-inicio', CafePantallaInicio);