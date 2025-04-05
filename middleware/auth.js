const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verificar token en solicitudes
exports.verifyToken = (req, res, next) => {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'No autorizado',
            message: 'Token no proporcionado o formato incorrecto'
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adjuntar información del usuario decodificada a la solicitud
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            error: 'Token inválido',
            message: 'La sesión ha caducado o el token es inválido'
        });
    }
};

// Verificar si el usuario es administrador
exports.verifyAdmin = (req, res, next) => {
    // Este middleware debe ser usado después de verifyToken
    if (!req.user) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    
    // Verificar si el usuario es administrador
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    
    next();
}; 