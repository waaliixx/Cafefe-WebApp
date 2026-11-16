import { Vista, deshabilitado } from '../base/Vista.js';
import { html } from '../base/html.js';
import {
    api,
    iniciarSesion,
    router,
    leer,
    guardar
} from '../control/servicios.js';
import { permite } from '../control/reglas.js';

export class Login extends Vista {
    static estilos = Vista.estilos + `
        .login {
            min-height: 65vh;
            display: grid;
            place-items: center;
            padding: 2rem 0;
        }

        .tarjeta {
            width: 100%;
            max-width: 440px;
            padding: 2.5rem;
            background: var(--cafe-blanco, #fff);
            border: 1px solid var(--color-borde);
            border-radius: 1rem;
            box-shadow: 0 12px 36px #2a1a1f0d;
        }

        .encabezado {
            text-align: center;
            margin-bottom: 2rem;
        }

        .distintivo {
            display: grid;
            place-items: center;
            width: 56px;
            height: 56px;
            margin: 0 auto 1rem;
            border-radius: 50%;
            background: #f5e7d7;
            color: #7c3425;
        }

        .distintivo svg {
            width: 30px;
            height: 30px;
        }

        h1 {
            margin: 0 0 .5rem;
            font-size: 1.7rem;
            font-weight: 700;
            letter-spacing: .04em;
        }

        .bienvenida {
            margin: 0;
            color: #6b584b;
        }

        .etiqueta {
            display: block;
            font-weight: 600;
            margin: 1.2rem 0 .5rem;
        }

        .campo {
            display: flex;
            align-items: center;
            gap: .7rem;
            padding: 0 .85rem;
            border: 1px solid #aa9583;
            border-radius: .5rem;
            background: #fff;
        }

        .campo:focus-within {
            outline: 3px solid #356b8c;
            outline-offset: 2px;
        }

        .campo svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            color: #786657;
        }

        .campo input {
            min-width: 0;
            flex: 1;
            border: 0;
            background: transparent;
            padding: .85rem 0;
            outline: none;
            color: var(--cafe-grano);
        }

        .ayuda {
            margin: .5rem 0 0;
            color: #6b584b;
            font-size: .85rem;
            line-height: 1.5;
        }

        .acciones {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-top: 1.5rem;
            flex-wrap: wrap;
        }

        .recordar {
            display: flex;
            align-items: center;
            gap: .5rem;
            margin: 0;
            font-size: .9rem;
            font-weight: 400;
            cursor: pointer;
        }

        .recordar input {
            width: 18px;
            height: 18px;
            margin: 0;
            accent-color: #7c3425;
        }

        .ingresar {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: .6rem;
            min-height: 44px;
            font-weight: 600;
        }

        .ingresar:hover:not(:disabled) {
            background: #58251c;
        }

        .pie {
            margin-top: 1.75rem;
            padding-top: 1.25rem;
            text-align: center;
            border-top: 1px solid var(--color-borde);
        }

        .pie a {
            text-underline-offset: .2em;
            font-size: .9rem;
        }

        @media (max-width: 480px) {
            .login {
                min-height: auto;
                padding: 1rem 0;
            }

            .tarjeta {
                padding: 1.5rem;
            }

            h1 {
                font-size: 1.4rem;
            }

            .acciones {
                align-items: stretch;
                flex-direction: column;
            }

            .ingresar {
                width: 100%;
            }
        }
    `;

    nombre = leer('login.nombre', '');
    recordar = Boolean(this.nombre);

    plantilla() {
        return html`
            <div class="login">
                <section class="tarjeta" aria-labelledby="titulo-login">
                    <div class="encabezado">
                        <div class="distintivo" aria-hidden="true">
                            <svg
                                viewBox="0 0 32 32"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path
                                    d="M5 12h18v9a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6zM23 14h2a4 4 0 0 1 0 8h-2M10 7V3m7 4V3M3 30h23"
                                />
                            </svg>
                        </div>

                        <h1 id="titulo-login">INICIAR SESIÓN</h1>
                        <p class="bienvenida">Bienvenido a Cafefe</p>
                    </div>

                    ${this.mensajes()}

                    <form
                        aria-label="Ingreso de empleados"
                        aria-busy="${this.ocupado}"
                    >
                        <label class="etiqueta" for="nombre">
                            Usuario
                        </label>

                        <div class="campo">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="7" r="4"/>
                                <path d="M4 21v-2a8 8 0 0 1 16 0v2"/>
                            </svg>

                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                autocomplete="username"
                                placeholder="Tu nombre de empleado"
                                value="${this.nombre}"
                                required
                                ${deshabilitado(this.ocupado)}
                            >
                        </div>

                        <label class="etiqueta" for="uid">
                            Contraseña
                        </label>

                        <div class="campo">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                aria-hidden="true"
                            >
                                <rect
                                    x="5"
                                    y="10"
                                    width="14"
                                    height="11"
                                    rx="2"
                                />
                                <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>
                            </svg>

                            <input
                                id="uid"
                                name="uid"
                                type="password"
                                autocomplete="current-password"
                                placeholder="Tu identificador de empleado"
                                aria-describedby="ayuda-uid"
                                required
                                ${deshabilitado(this.ocupado)}
                            >
                        </div>

                        <p id="ayuda-uid" class="ayuda">
                            Tu contraseña es el identificador único de empleado.
                        </p>

                        <div class="acciones">
                            <label class="recordar" for="recordar">
                                <input
                                    id="recordar"
                                    type="checkbox"
                                    ${deshabilitado(this.ocupado)}
                                >
                                Recordar mi nombre
                            </label>

                            <button
                                class="ingresar"
                                type="submit"
                                ${deshabilitado(this.ocupado)}
                            >
                                ${this.ocupado ? 'Ingresando…' : 'Iniciar sesión'}
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </form>

                    <div class="pie">
                        <a href="#/orden">
                            Hacer un pedido sin iniciar sesión
                        </a>
                    </div>
                </section>
            </div>
        `;
    }

    despuesDeRenderizar() {
        this.$('#recordar').checked = this.recordar;

        this.escuchar('#nombre', 'input', evento => {
            this.nombre = evento.target.value;
        });

        this.escuchar('#recordar', 'change', evento => {
            this.recordar = evento.target.checked;

            if (!this.recordar) {
                guardar('login.nombre', '');
            }
        });

        this.escuchar('form', 'submit', evento => {
            evento.preventDefault();

            if (this.ocupado) return;

            const uid = this.$('#uid').value;
            const nombre = this.nombre.trim();

            this.ejecutar(async () => {
                const usuario = await api.post('/login', {
                    nombre,
                    uid
                });

                guardar(
                    'login.nombre',
                    this.recordar ? nombre : ''
                );

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