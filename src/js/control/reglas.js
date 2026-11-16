export const normalizar = (texto = '') => String(texto)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase();

export const dinero = valor => new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
}).format(Number(valor));

export function centavos(valor) {
    const texto = String(valor).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
        throw new Error('Use un monto válido con hasta dos decimales.');
    }

    const [enteros, decimales = ''] = texto.split('.');
    const resultado = Number(enteros) * 100
        + Number(decimales.padEnd(2, '0'));

    if (!Number.isSafeInteger(resultado)) {
        throw new Error('Monto demasiado grande.');
    }

    return resultado;
}

export function resumen(total, pagos) {
    const recibido = pagos.reduce(
        (suma, pago) => suma + centavos(pago.monto), 0
    );

    const noEfectivo = pagos
        .filter(pago => pago.tipoPago !== 'Efectivo')
        .reduce((suma, pago) => suma + centavos(pago.monto), 0);

    const importe = centavos(total);

    return {
        recibido,
        saldo: Math.max(0, importe - recibido),
        vuelto: Math.max(0, recibido - importe),
        exceso: noEfectivo > importe,
    };
}

export function validarOrden(cliente, items) {
    if (
        !cliente.trim()
        || cliente.trim().length > 100
        || cliente.includes(' | ')
    ) {
        throw new Error(
            'Escriba un nombre de hasta 100 caracteres, sin el separador « | ».'
        );
    }

    if (!items.length || items.length > 50) {
        throw new Error('Seleccione entre 1 y 50 productos.');
    }

    if (items.some(item =>
        !Number.isInteger(item.cantidad)
        || item.cantidad < 1
        || item.cantidad > 20
    )) {
        throw new Error('Cada producto admite entre 1 y 20 unidades.');
    }

    return {
        cliente: cliente.trim(),
        items: items.map(item => ({
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            observaciones: item.observaciones || '',
        })),
    };
}

export function permite(usuario, roles) {
    return !roles || Boolean(
        usuario?.roles?.some(asignacion =>
            roles.includes(normalizar(asignacion.rol))
        )
    );
}

export function validarCobro(total, pagos) {
    if (
        !pagos.length
        || pagos.some(pago =>
            !['Efectivo', 'Tarjeta', 'QR'].includes(pago.tipoPago)
            || centavos(pago.monto) <= 0
            || (pago.referenciaExterna || '').length > 200
        )
    ) {
        throw new Error('Revise los tipos, montos y referencias de pago.');
    }

    const resultado = resumen(total, pagos);

    if (resultado.exceso) {
        throw new Error(
            'El pago con tarjeta o QR no puede superar el total.'
        );
    }

    if (resultado.saldo) {
        throw new Error('Todavía falta completar el total.');
    }

    return resultado;
}