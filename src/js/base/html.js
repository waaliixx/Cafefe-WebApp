/**
 * Plantillas HTML seguras: todo valor interpolado se escapa, salvo que se
 * marque explícitamente como confiable con crudo(). Evita inyección de HTML
 * (por ejemplo, con el nombre que escribe un cliente).
 */
const MAPA = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export class HtmlSeguro {
    constructor(texto) {
        this.texto = texto;
    }

    toString() {
        return this.texto;
    }
}

export function escapar(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => MAPA[c]);
}

export function crudo(texto) {
    return new HtmlSeguro(String(texto));
}

function aTexto(valor) {
    if (valor instanceof HtmlSeguro) return valor.texto;
    if (Array.isArray(valor)) return valor.map(aTexto).join('');
    return escapar(valor);
}

export function html(cadenas, ...valores) {
    let resultado = '';
    cadenas.forEach((cadena, i) => {
        resultado += cadena;
        if (i < valores.length) resultado += aTexto(valores[i]);
    });
    return new HtmlSeguro(resultado);
}