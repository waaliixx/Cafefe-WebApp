export const rutas = [
    {
        path: '/',
        componente: 'cafe-pantalla-orden',
        titulo: 'Ordenar',
    },
    {
        path: '/orden',
        componente: 'cafe-pantalla-orden',
        titulo: 'Ordenar',
    },
    {
        path: '/login',
        componente: 'cafe-pantalla-login',
        titulo: 'Ingresar',
    },
    {
        path: '/recepcion',
        componente: 'cafe-pantalla-pendientes',
        titulo: 'Recepción',
        roles: ['barista', 'cocinero'],
    },
    {
        path: '/pago',
        componente: 'cafe-pantalla-pago',
        titulo: 'Cobrar',
        roles: ['cajero'],
    },
    {
        path: '*',
        componente: 'cafe-pantalla-no-encontrada',
        titulo: 'No encontrada',
    },
];