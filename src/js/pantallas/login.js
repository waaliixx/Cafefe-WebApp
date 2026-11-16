import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import { api, iniciarSesion, router } from '../control/servicios.js';
import { permite } from '../control/reglas.js';

export class Login extends Vista {
    nombre = '';

    plantilla() {
        return html`
            <section class="panel">
                <h1>Ingreso de empleados</h1>
                <p>
                    Use su nombre y el identificador de empleado asignado.
                </p>

                ${this.mensajes()}

                <form>
                    <label>
                        Nombre
                        <input
                            id="nombre"
                            autocomplete="username"
                            value="${this.nombre}"
                            required>
                    </label>

                    <label>
                        Identificador de empleado
                        <input
                            id="uid"
                            type="password"
                            autocomplete="current-password"
                            required>
                    </label>

                    <button ${deshabilitado(this.ocupado)}>
                        Ingresar
                    </button>
                </form>

                <p>
                    <a href="#/orden">
                        Quiero hacer un pedido sin ingresar
                    </a>
                </p>
            </section>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('#nombre', 'input', evento => {
            this.nombre = evento.target.value;
        });

        this.escuchar('form', 'submit', evento => {
            evento.preventDefault();

            const uid = this.$('#uid').value;

            this.ejecutar(async () => {
                const usuario = await api.post('/login', {
                    nombre: this.nombre,
                    uid,
                });

                iniciarSesion(usuario);

                router.navegar(
                    permite(usuario, ['cajero'])
                        ? '/pago'
                        : permite(usuario, ['barista', 'cocinero'])
                            ? '/recepcion'
                            : '/orden'
                );
            });
        });
    }
}

customElements.define('cafe-pantalla-login', Login);