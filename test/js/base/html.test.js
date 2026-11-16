import { escapar, html, crudo } from '../../../src/js/base/html.js';

describe('html (plantillas seguras)', () => {
    it('escapa los caracteres peligrosos', () => {
        expect(escapar('<b>"Ana" & \'Luis\'</b>')).to.equal('&lt;b&gt;&quot;Ana&quot; &amp; &#39;Luis&#39;&lt;/b&gt;');
    });

    it('trata null y undefined como texto vacío', () => {
        expect(escapar(null)).to.equal('');
        expect(escapar(undefined)).to.equal('');
    });

    it('escapa los valores interpolados en html``', () => {
        const nombre = '<img src=x onerror=alert(1)>';
        expect(String(html`<p>${nombre}</p>`)).to.equal('<p>&lt;img src=x onerror=alert(1)&gt;</p>');
    });

    it('no vuelve a escapar un html`` anidado', () => {
        const interior = html`<b>hola</b>`;
        expect(String(html`<p>${interior}</p>`)).to.equal('<p><b>hola</b></p>');
    });

    it('une los elementos de un arreglo', () => {
        const items = ['a', 'b'].map((x) => html`<li>${x}</li>`);
        expect(String(html`<ul>${items}</ul>`)).to.equal('<ul><li>a</li><li>b</li></ul>');
    });

    it('crudo() permite HTML confiable', () => {
        expect(String(html`<p>${crudo('<i>ok</i>')}</p>`)).to.equal('<p><i>ok</i></p>');
    });
});