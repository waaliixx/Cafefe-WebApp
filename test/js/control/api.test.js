import { ApiClient, ApiError } from '../../src/js/api.js';

function respuesta({ status = 200, cuerpo = null, statusText = '' } = {}) {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        json: async () => {
            if (cuerpo === null) throw new Error('sin cuerpo');
            return cuerpo;
        },
    };
}

describe('ApiClient', () => {
    it('GET arma la URL y devuelve el JSON', async () => {
        const fetchFn = sinon.stub().resolves(respuesta({ cuerpo: [{ id: 1 }] }));
        const api = new ApiClient({ baseUrl: 'http://x/api', fetchFn });

        const datos = await api.get('/categorias');

        expect(datos).to.deep.equal([{ id: 1 }]);
        expect(fetchFn.firstCall.args[0]).to.equal('http://x/api/categorias');
        expect(fetchFn.firstCall.args[1].method).to.equal('GET');
    });

    it('ignora la barra final de la URL base', async () => {
        const fetchFn = sinon.stub().resolves(respuesta({ cuerpo: {} }));
        await new ApiClient({ baseUrl: 'http://x/api///', fetchFn }).get('/a');
        expect(fetchFn.firstCall.args[0]).to.equal('http://x/api/a');
    });

    it('POST envía el cuerpo como JSON', async () => {
        const fetchFn = sinon.stub().resolves(respuesta({ status: 201, cuerpo: { id: 9 } }));
        const api = new ApiClient({ baseUrl: 'http://x/api', fetchFn });

        await api.post('/ordenes', { cliente: 'Ana' });

        const opciones = fetchFn.firstCall.args[1];
        expect(opciones.method).to.equal('POST');
        expect(opciones.headers['Content-Type']).to.equal('application/json');
        expect(JSON.parse(opciones.body)).to.deep.equal({ cliente: 'Ana' });
    });

    it('devuelve null en una respuesta 204', async () => {
        const fetchFn = sinon.stub().resolves(respuesta({ status: 204 }));
        const api = new ApiClient({ baseUrl: 'http://x/api', fetchFn });
        expect(await api.delete('/ordenes/1')).to.equal(null);
    });

    it('lanza ApiError con el mensaje que manda el servidor', async () => {
        const fetchFn = sinon.stub().resolves(respuesta({ status: 400, cuerpo: { mensaje: 'Rol en uso' } }));
        const api = new ApiClient({ baseUrl: 'http://x/api', fetchFn });

        try {
            await api.put('/roles/1', {});
            expect.fail('debía lanzar');
        } catch (error) {
            expect(error).to.be.instanceOf(ApiError);
            expect(error.status).to.equal(400);
            expect(error.message).to.equal('Rol en uso');
        }
    });

    it('usa el texto de estado cuando el error no trae JSON', async () => {
        const fetchFn = sinon.stub().resolves(respuesta({ status: 500, statusText: 'Internal Server Error' }));
        const api = new ApiClient({ baseUrl: 'http://x/api', fetchFn });

        try {
            await api.get('/x');
            expect.fail('debía lanzar');
        } catch (error) {
            expect(error.status).to.equal(500);
            expect(error.message).to.equal('Internal Server Error');
        }
    });

    it('lanza ApiError con status 0 si no hay conexión', async () => {
        const fetchFn = sinon.stub().rejects(new TypeError('Failed to fetch'));
        const api = new ApiClient({ baseUrl: 'http://x/api', fetchFn });

        try {
            await api.get('/x');
            expect.fail('debía lanzar');
        } catch (error) {
            expect(error).to.be.instanceOf(ApiError);
            expect(error.status).to.equal(0);
        }
    });
});