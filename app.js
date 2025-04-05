const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendanceRoutes');
const secretaryRoutes = require('./routes/secretaryRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const visitsRoutes = require('./routes/visitsRoutes');
const authRoutes = require('./routes/authRoutes');
const churchRoutes = require('./routes/churchRoutes');
const userRoutes = require('./routes/userRoutes');
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');
require('dotenv').config();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000, // Incrementar timeout para evitar desconexiones
});

// Middlewares para parsear el cuerpo de las peticiones
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('public'));

// Redirección para página principal
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Configurar rutas de la API
app.use('/api/attendance', attendanceRoutes);
app.use('/api/secretaries', secretaryRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/churches', churchRoutes);
app.use('/api/users', userRoutes);

// Middleware para manejar rutas no definidas
app.use((req, res, next) => {
    // Si es una ruta de API, continuar al siguiente middleware
    if (req.path.startsWith('/api/')) {
        return next();
    }

    // Si es un archivo estático existente, continuar
    if (path.extname(req.path)) {
        return next();
    }

    // Para cualquier otra ruta que no sea login.html, attendance.html, consultation.html o users.html
    if (req.path !== '/login.html' && req.path !== '/attendance.html' && req.path !== '/consultation.html' && req.path !== '/users.html') {
        return res.redirect('/login.html');
    }

    next();
});

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Configurar Socket.io
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');
    
    // Emitir un evento de bienvenida al cliente que se conecta
    socket.emit('welcome', { message: 'Conexión establecida con el servidor' });

    // Eventos para escuchar
    socket.on('new_visit', (data) => {
        console.log('Evento new_visit recibido:', data);
        // Emitir a todos los clientes, incluido el remitente
        io.emit('new_visit', data);
    });

    socket.on('confirm_attendance', (data) => {
        console.log('Evento confirm_attendance recibido:', data);
        io.emit('attendance_confirmed', data);
    });
    
    socket.on('attendance_updated', (data) => {
        console.log('Evento attendance_updated recibido:', data);
        io.emit('attendance_updated', data);
    });
    
    socket.on('attendance_deleted', (data) => {
        console.log('Evento attendance_deleted recibido:', data);
        io.emit('attendance_deleted', data);
    });

    // Mantener el cliente activo con un ping cada 30 segundos
    const interval = setInterval(() => {
        socket.emit('ping', { time: new Date().getTime() });
    }, 30000);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado del servidor WebSocket.');
        clearInterval(interval);
    });
});