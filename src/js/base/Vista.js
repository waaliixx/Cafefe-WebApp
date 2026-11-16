import { CafeElement } from './CafeElement.js';
import { html, crudo } from './html.js';
import { estilos } from '../../resources/estilos/estilos.js';

export const deshabilitado = condicion =>
    crudo(condicion ? 'disabled' : '');

export class Vista extends CafeElement {
    static estilos = estilos;

    ocupado = false;
    error = '';

    renderizar() {
        const foco = this.shadowRoot.activeElement;
        const id = foco?.id;
        const inicio = foco?.selectionStart;
        const fin = foco?.selectionEnd;

        super.renderizar();

        const nuevo = id
            ? this.shadowRoot.getElementById(id)
            : null;

        if (nuevo && !nuevo.disabled) {
            nuevo.focus();

            if (
                inicio != null
                && typeof nuevo.setSelectionRange === 'function'
            ) {
                nuevo.setSelectionRange(inicio, fin);
            }
        }
    }

    mensajes() {
        return html`
            ${this.error
                ? html`<p class="error" role="alert">${this.error}</p>`
                : ''}

            ${this.ocupado
                ? html`<p role="status">Procesando…</p>`
                : ''}
        `;
    }

    async ejecutar(accion) {
        if (this.ocupado) return;

        this.ocupado = true;
        this.error = '';
        this.renderizar();

        try {
            await accion();
        } catch (error) {
            this.error = error.message
                || 'No se pudo completar la operación.';
        } finally {
            this.ocupado = false;

            if (this.isConnected) {
                this.renderizar();
            }
        }
    }

    escuchar(selector, evento, accion) {
        this.$(selector)?.addEventListener(evento, accion);
    }
}