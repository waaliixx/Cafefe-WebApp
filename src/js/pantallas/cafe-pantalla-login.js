import { CafeElement } from '../base/CafeElement.js';

export class CafePantallaLogin extends CafeElement {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.render();
        this.setupListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f5f6fa;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .login-card {
                    background: #ffffff;
                    padding: 2.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    width: 100%;
                    max-width: 380px;
                }
                h2 {
                    margin-bottom: 1.5rem;
                    color: #2f3640;
                    text-align: center;
                    font-size: 1.5rem;
                }
                .form-group {
                    margin-bottom: 1.25rem;
                }
                label {
                    display: block;
                    margin-bottom: 0.5srem;
                    color: #57606f;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #dcdde1;
                    border-radius: 6px;
                    font-size: 1rem;
                    box-sizing: border-box;
                    outline: none;
                    transition: border-color 0.2s;
                }
                input:focus {
                    border-color: #e1b12c;
                }
                button {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: #2f3640;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    margin-top: 0.5rem;
                }
                button:hover {
                    background-color: #353b48;
                }
                .error-message {
                    color: #e84118;
                    font-size: 0.875rem;
                    text-align: center;
                    margin-top: 1rem;
                    min-height: 1.2rem;
                }
            </style>
            <div class="login-card">
                <h2>Cafefe - Acceso</h2>
                <form id="form-login">
                    <div class="form-group">
                        <label for="usuario">Usuario</label>
                        <input type="text" id="usuario" name="usuario" required autocomplete="username" />
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" name="password" required autocomplete="current-password" />
                    </div>
                    <button type="submit">Iniciar Sesión</button>
                    <div class="error-message" id="error-msg"></div>
                </form>
            </div>
        `;
    }

    setupListeners() {
        const form = this.shadowRoot.getElementById('form-login');
        const errorMsg = this.shadowRoot.getElementById('error-msg');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.textContent = '';

            const usuario = this.shadowRoot.getElementById('usuario').value.trim();
            const password = this.shadowRoot.getElementById('password').value.trim();

            try {
                // Aquí invocas tu servicio API conectado al LoginResource del backend
                // Ejemplo: const response = await api.post('/login', { usuario, password });
                
                console.log('Intentando iniciar sesión con:', usuario);
                
                // *Verificación de éxito temporal:* Redirección simulada o almacenamiento en store
                // Store.dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
                
            } catch (error) {
                errorMsg.textContent = 'Credenciales inválidas o error de conexión.';
                console.error('Error en login:', error);
            }
        });
    }
}

customElements.define('cafe-pantalla-login', CafePantallaLogin);