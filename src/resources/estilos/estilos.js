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