const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {

    ws.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'new_visit' || data.type === 'confirm_attendance') {
            // Notificar a todos los clientes conectados
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: data.type }));
                }
            });

            ws.on('close', () => {
                console.log('Cliente desconectado del servidor WebSocket.');
            });
        }
    });
});
