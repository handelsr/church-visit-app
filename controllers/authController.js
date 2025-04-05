const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = (req, res) => {
    console.log('Recibida solicitud de login');
    
    const { username, password } = req.body;
    
    // Verificar que se proporcionen username y password
    if (!username || !password) {
        return res.status(400).json({ error: 'Se requiere nombre de usuario y contraseña' });
    }
    
    // Buscar al usuario por nombre de usuario
    User.getByUsername(username, (err, user) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        // Si no se encuentra el usuario
        if (!user) {
            console.log('Usuario no encontrado:', username);
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        
        // Verificar la contraseña
        User.validatePassword(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error al validar contraseña:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            // Si la contraseña no coincide
            if (!isMatch) {
                console.log('Contraseña incorrecta para usuario:', username);
                return res.status(401).json({ error: 'Credenciales incorrectas' });
            }
            
            // Generar token JWT
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username, 
                    role: user.role,
                    church_id: user.church_id
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            console.log('Login exitoso para usuario:', username);
            
            // Respuesta exitosa
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    church_id: user.church_id
                }
            });
        });
    });
};

// Función para crear usuario (solo para desarrollo)
exports.createUser = (req, res) => {
    console.log('Recibida solicitud para crear usuario');
    
    const { username, password, name, role, church_id } = req.body;
    
    // Validar entrada
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Se requieren todos los campos' });
    }
    
    // Verificar si el usuario ya existe
    User.getByUsername(username, (err, existingUser) => {
        if (err) {
            console.error('Error al buscar usuario existente:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        
        if (existingUser) {
            console.log('El usuario ya existe:', username);
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }
        
        // Crear usuario
        User.create({ username, password, name, role, church_id }, (err, newUser) => {
            if (err) {
                console.error('Error al crear usuario:', err);
                return res.status(500).json({ message: 'Error al crear el usuario' });
            }
            
            console.log('Usuario creado exitosamente:', username);
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    name: newUser.name,
                    role: newUser.role,
                    church_id: newUser.church_id
                }
            });
        });
    });
};

exports.verifyToken = (req, res, next) => {
    // Obtener token del encabezado
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }
    
    // Verificar token
    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
        
        // Añadir datos del usuario al request
        req.userId = decoded.id;
        req.username = decoded.username;
        req.userRole = decoded.role;
        
        next(); // Continuar con la siguiente función
    });
};

// Middleware para verificar roles
exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(403).json({ message: 'No autorizado' });
        }
        
        if (roles.includes(req.userRole)) {
            next();
        } else {
            res.status(403).json({ message: 'No tienes permiso para acceder a este recurso' });
        }
    };
};

// Función para obtener todos los usuarios (solo para propósitos de desarrollo)
exports.getAllUsers = (req, res) => {
    const sql = 'SELECT u.id, u.username, u.name, u.role, u.church_id, s.id as secretary_id FROM users u LEFT JOIN secretaries s ON u.id = s.user_id';
    
    require('../config/db').query(sql, [], (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        
        res.json({ users: results });
    });
};

// Función para verificar la contraseña de un usuario (solo para desarrollo)
exports.verifyUserPassword = (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Se requieren nombre de usuario y contraseña' });
    }
    
    // Obtener el usuario
    User.getByUsername(username, (err, user) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Verificar la contraseña
        User.validatePassword(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error al validar contraseña:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }
            
            res.json({
                username: user.username,
                passwordMatch: isMatch,
                storedHash: user.password
            });
        });
    });
};

// Función para actualizar la contraseña de un usuario (solo para desarrollo)
exports.updateUserPassword = (req, res) => {
    const { username, newPassword } = req.body;
    
    if (!username || !newPassword) {
        return res.status(400).json({ message: 'Se requieren nombre de usuario y nueva contraseña' });
    }
    
    // Obtener el usuario
    User.getByUsername(username, (err, user) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Encriptar la nueva contraseña
        const bcrypt = require('bcryptjs');
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error al encriptar contraseña:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }
            
            // Actualizar la contraseña
            const sql = 'UPDATE users SET password = ? WHERE id = ?';
            require('../config/db').query(sql, [hashedPassword, user.id], (err, result) => {
                if (err) {
                    console.error('Error al actualizar contraseña:', err);
                    return res.status(500).json({ message: 'Error en el servidor' });
                }
                
                res.json({
                    username: user.username,
                    message: 'Contraseña actualizada exitosamente',
                    affected: result.affectedRows
                });
            });
        });
    });
}; 