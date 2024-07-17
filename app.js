const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendanceRoutes');
const secretaryRoutes = require('./routes/secretaryRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const visitsRoutes = require('./routes/visitsRoutes');
const WebSocket = require('ws');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/attendance', attendanceRoutes);
app.use('/api/secretaries', secretaryRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/visits', visitsRoutes);

app.use(express.static('public'));

const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



//websocket server

const wss = new WebSocket.Server({ port: 443 });

wss.on('connection', (ws) => {
    console.log('websocket connected')
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
