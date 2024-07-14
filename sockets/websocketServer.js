// websocketServer.js

const WebSocket = require('ws');
const { Pool } = require('pg');
const dbConfig = require('./config/db'); // Importar la configuración de la base de datos

const pool = new Pool(dbConfig); // Utilizar la configuración de conexión a la base de datos

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Cliente conectado al servidor WebSocket.');

    // Escuchar cambios en la base de datos y enviar actualizaciones a los clientes
    const query = 'LISTEN visitas_actualizadas';
    pool.query(query);

    const ha = async (msg) => {
        if (msg.channel === 'visitas_actualizadas') {
            console.log('Actualización recibida desde la base de datos.');
            const visits = await getVisitsFromDatabase(); // Obtener las visitas actualizadas desde la base de datos
            ws.send(JSON.stringify({ type: 'update_visits', visits }));
        }
    };

    pool.on('notification', notificationListener);

    ws.on('close', () => {
        console.log('Cliente desconectado del servidor WebSocket.');
        pool.removeListener('notification', notificationListener);
    });
});

async function getVisitsFromDatabase() {
    const query = `
        SELECT id, name, phone, address, invited_by, secretary_id, church_id
        FROM visitors;
    `;

    const { rows } = await pool.query(query);
    return rows;
}
