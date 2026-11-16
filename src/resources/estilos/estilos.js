export const estilos = `
    :host {
        display: block;
        color: var(--cafe-grano);
        font-family: var(--fuente);
    }

    * { box-sizing: border-box; }

    h1, h2, h3 { line-height: 1.2; }
    h1 { margin-top: 0; }

    button, input, select, textarea { font: inherit; }

    button, a, input, select, textarea {
        touch-action: manipulation;
    }

    button, .boton {
        border: 0;
        border-radius: .5rem;
        padding: .75rem 1rem;
        background: #7c3425;
        color: white;
        cursor: pointer;
    }

    a { color: #7c3425; }

    button:disabled {
        opacity: .55;
        cursor: not-allowed;
    }

    :focus-visible {
        outline: 3px solid #356b8c;
        outline-offset: 3px;
    }

    label {
        display: grid;
        gap: .4rem;
        margin: .8rem 0;
    }

    input, select, textarea {
        width: 100%;
        padding: .7rem;
        border: 1px solid #9b8574;
        border-radius: .4rem;
        background: white;
    }

    textarea { min-height: 4rem; }
    form { margin: 0; }

    .fila {
        display: flex;
        gap: .7rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
    }

    .columnas {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
        gap: 1.5rem;
    }

    .panel {
        background: white;
        border: 1px solid var(--color-borde);
        border-radius: 1rem;
        padding: 1.2rem;
        margin-bottom: 1rem;
    }

    .error {
        background: #ffeded;
        color: #8c2020;
        padding: 1rem;
        border-radius: .5rem;
    }

    .aviso {
        background: #fff0ce;
        padding: 1rem;
        border-radius: .5rem;
    }

    .muted { color: #66584d; }

    .categoria {
        display: grid;
        gap: .7rem;
        background: white;
        color: var(--cafe-grano);
        border: 1px solid var(--color-borde);
        text-align: left;
    }

    img { max-width: 100%; }

    .categoria img {
        height: 100px;
        width: 100%;
        object-fit: contain;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        padding: .7rem 0;
        border-bottom: 1px solid var(--color-borde);
    }

    .total {
        font-size: 1.3rem;
        font-weight: 700;
    }

    small { display: block; }

    .secundario {
        background: #ede2d6;
        color: #33221c;
    }

    @media (max-width: 760px) {
        .columnas { grid-template-columns: 1fr; }

        .grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }
    }
`;
// Estilos de HU3 y HU4, definidos por la aplicación (sin dependencias externas).
export const estilosOperativos = `
    .eyebrow { color: #a45838; font-size: .72rem; font-weight: 800; letter-spacing: .13em; margin: 0 0 .45rem; }
    .encabezado-ordenes { justify-content: space-between; align-items: flex-start; }
    .encabezado-ordenes h1 { margin: 0; }
    .encabezado-ordenes p { margin-bottom: 0; }
    .ordenes-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); margin-top: 1.25rem; }
    .tarjeta-orden { display: grid; gap: .7rem; text-align: left; background: #fffaf6; color: var(--cafe-grano); border: 1px solid #e9d9cc; border-radius: .8rem; box-shadow: 0 5px 20px #4c28130a; }
    .tarjeta-orden:hover, .tarjeta-orden.elegida { border-color: #a54c2e; box-shadow: 0 0 0 2px #a54c2e22; }
    .tarjeta-orden .fila { justify-content: space-between; }
    .estado-etiqueta { color: #874b13; background: #fff0d1; padding: .25rem .5rem; border-radius: 2rem; font-size: .72rem; }
    .cliente-orden { font-size: 1.15rem; font-weight: 700; }
    .precio-orden { font-size: 1.3rem; }
    .ver-detalle { color: #a34b2b; font-weight: 700; }
    .producto-detalle { display: grid; grid-template-columns: 2rem 1fr auto; align-items: center; gap: .6rem; }
    .numero-producto { display: grid; place-items: center; background: #f4e7db; border-radius: .5rem; width: 2rem; height: 2rem; }
    .detalle-orden .total { justify-content: space-between; border-top: 2px solid #eadbd0; padding-top: 1rem; }
    .detalle-vacio { border-style: dashed; }
    .pago-resumen { padding: 1rem; background: #fcf6ee; border-radius: .75rem; }
    .pago-resumen .fila { justify-content: space-between; }
    .pago-resumen strong { font-size: 1.2rem; }
    .comprobante { border-left: 4px solid #34815e; }
    @media (max-width: 520px) { .encabezado-ordenes { align-items: stretch; } .encabezado-ordenes button { width: 100%; } }
`;
