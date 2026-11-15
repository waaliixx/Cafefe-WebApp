// Solo para el navegador (test/index.html): deja expect y sinon disponibles.
import './lib/chai/register-expect.js';
import sinon from './lib/sinon/sinon-esm.js';

globalThis.sinon = sinon;