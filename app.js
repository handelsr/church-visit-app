const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendanceRoutes');
const secretaryRoutes = require('./routes/secretaryRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const visitsRoutes = require('./routes/visitsRoutes');
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/attendance', attendanceRoutes);
app.use('/api/secretaries', secretaryRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/visits', visitsRoutes);

app.use(express.static('public'));

const PORT =  3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    socket.on('new_visit', () => {
        io.emit('new_visit');
    });

    socket.on('confirm_attendance', () => {
        io.emit('confirm_attendance');
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado del servidor WebSocket.');
    });
});