import { normalizar } from './reglas.js';

export function imagenCategoria(nombre) {
    const categoria = normalizar(nombre);
    let dibujo;

    if (/merch|ropa|souvenir/.test(categoria)) {
        dibujo = `
            <path d="
                M58 32
                L34 43
                18 70
                39 82
                49 66
                V121
                H111
                V66
                L121 82
                142 70
                126 43
                102 32
            "/>

            <path d="
                M58 32
                C60 58 100 58 102 32
                M58 32H102
            "/>
        `;
    } else if (/comida|almuerzo|cena/.test(categoria)) {
        dibujo = `
            <path d="
                M25 88
                C25 61 48 43 80 43
                S135 61 135 88
                V101
                C135 110 128 117 119 117
                H41
                C32 117 25 110 25 101
                Z
            "/>

            <path d="
                M53 62L45 81
                M82 57L74 78
                M110 63L102 82
            "/>
        `;
    } else if (/postre|merienda/.test(categoria)) {
        dibujo = `
            <path d="
                M28 78h104v35H28z
                M28 78l52-40 52 40
                M45 89v13
                m27-13v13
                m27-13v13
            "/>
        `;
    } else if (/bebida|refresco/.test(categoria)) {
        dibujo = `
            <path d="
                M55 40h50l-8 78H63z
                M83 65l14-43h18
                M56 66h47
            "/>
        `;
    } else {
        dibujo = `
            <path d="
                M40 60h65v30
                a25 25 0 0 1-25 25H65
                a25 25 0 0 1-25-25z
                M105 65h10
                a15 15 0 0 1 0 30h-10
                M57 45V30
                m25 15V30
                M30 122h90
            "/>
        `;
    }

    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 160 150"
        >
            <rect
                width="160"
                height="150"
                rx="18"
                fill="#fff3e6"
            />

            <g
                fill="none"
                stroke="#7c3425"
                stroke-width="6"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                ${dibujo}
            </g>
        </svg>
    `;

    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}