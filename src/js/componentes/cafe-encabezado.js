import { Vista } from '../base/Vista.js';
import { html } from '../base/html.js';
import { permite } from '../control/reglas.js';

export class Encabezado extends Vista {
    static estilos = Vista.estilos + `
        :host {
            display: block;
        }

        header {
            background: var(--cafe-grano);
            color: var(--cafe-crema);
        }

        .barra {
            width: 100%;
            max-width: 1200px;
            margin: auto;
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
        }

        .marca {
            display: inline-flex;
            align-items: center;
            gap: 1rem;
            color: var(--cafe-crema);
            text-decoration: none;
            flex-shrink: 0;
        }

        .logo {
            width: 78px;
            height: 78px;
            object-fit: contain;
            border-radius: .65rem;
            background: #f4ecdf;
        }

        .titulo {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            letter-spacing: .025em;
            line-height: 1.1;
        }

        nav {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            text-align: right;
        }

        .boton-navegacion,
        #salir {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: .75rem 1.2rem;
            border-radius: .55rem;
            font-size: 1rem;
            font-weight: 700;
            text-decoration: none;
        }

        .boton-navegacion {
            background: var(--cafe-caramelo);
            color: var(--cafe-grano);
        }

        #salir {
            border: 0;
            cursor: pointer;
            background: var(--cafe-crema);
            color: var(--cafe-grano);
        }

        .acceso {
            display: grid;
            gap: .35rem;
            margin: 0;
            line-height: 1.5;
        }

        .acceso a {
            color: var(--cafe-caramelo);
            font-weight: 700;
        }

        @media (max-width: 520px) {
            .barra {
                padding: 1rem;
                gap: .8rem;
                flex-wrap: wrap;
            }

            .marca {
                gap: .65rem;
            }

            .logo {
                width: 60px;
                height: 60px;
            }

            nav {
                margin-left: auto;
                font-size: .9rem;
            }
        }
    `;

    plantilla() {
        const { usuario } = this.estado;

        return html`
            <header>
                <div class="barra">
                    <a
                        class="marca"
                        href="#/orden"
                        aria-label="Cafefe, ir a pedidos"
                    >
                        <img
                            class="logo"
                            src="resources/imagenes/logo-cafefe.jpg"
                            alt=""
                            width="78"
                            height="78"
                        >

                        <span class="titulo">Cafefe</span>
                    </a>

                    <nav aria-label="Acceso de empleados">
                        ${usuario
                            ? html`
                                ${permite(usuario, ['barista', 'cocinero'])
                                    ? html`
                                        <a
                                            class="boton-navegacion"
                                            href="#/recepcion"
                                        >
                                            Recepción
                                        </a>
                                    `
                                    : ''
                                }

                                ${permite(usuario, ['cajero'])
                                    ? html`
                                        <a
                                            class="boton-navegacion"
                                            href="#/pago"
                                        >
                                            Caja
                                        </a>
                                    `
                                    : ''
                                }

                                <button id="salir" type="button">
                                    Salir
                                </button>
                            `
                            : html`
                                <p class="acceso">
                                    <span>¿Quieres iniciar sesión?</span>

                                    <a
                                        href="#/login"
                                        aria-label="Haz click aquí para iniciar sesión"
                                    >
                                        Haz click aquí
                                    </a>
                                </p>
                            `
                        }
                    </nav>
                </div>
            </header>
        `;
    }

    despuesDeRenderizar() {
        this.escuchar('#salir', 'click', () => {
            this.emitir('cafefe:salir');
        });
    }
}

customElements.define('cafe-encabezado', Encabezado);
