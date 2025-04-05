const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

// Obtener todos los usuarios (solo admin)
exports.getAllUsers = [authMiddleware.verifyAdmin, (req, res) => {
    // Ejecutar una consulta SQL que también traiga el nombre de la iglesia
    const sql = `
        SELECT u.*, c.name as church_name 
        FROM users u 
        LEFT JOIN churches c ON u.church_id = c.id
        ORDER BY u.username
    `;
    
    // Usar conexión directa a la base de datos para una consulta personalizada
    const connection = require('../config/db');
    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // No enviar las contraseñas en la respuesta
        const users = results.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        
        res.json(users);
    });
}];

// Obtener un usuario por ID (solo admin)
exports.getUserById = [authMiddleware.verifyAdmin, (req, res) => {
    const { id } = req.params;
    
    const sql = `
        SELECT u.*, c.name as church_name 
        FROM users u 
        LEFT JOIN churches c ON u.church_id = c.id
        WHERE u.id = ?
    `;
    
    const connection = require('../config/db');
    connection.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // No enviar la contraseña en la respuesta
        const { password, ...userWithoutPassword } = results[0];
        
        res.json(userWithoutPassword);
    });
}];

// Crear un nuevo usuario (solo admin)
exports.createUser = [authMiddleware.verifyAdmin, (req, res) => {
    const { username, password, name, role, church_id } = req.body;
    
    // Validar campos requeridos
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Los campos username, password y role son requeridos' });
    }
    
    // Verificar que el username no exista ya
    User.getByUsername(username, (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (existingUser) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }
        
        // Crear el nuevo usuario
        User.create({
            username,
            password,
            name: name || username,
            role,
            church_id: church_id || null
        }, (err, newUser) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.status(201).json({
                message: 'Usuario creado correctamente',
                user: newUser
            });
        });
    });
}];

// Actualizar un usuario (solo admin)
exports.updateUser = [authMiddleware.verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { username, password, name, role, church_id } = req.body;
    
    // Validar campos requeridos
    if (!username || !role) {
        return res.status(400).json({ error: 'Los campos username y role son requeridos' });
    }
    
    // Verificar que el usuario existe
    User.getById(id, (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!existingUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Verificar que el username no está en uso por otro usuario
        if (username !== existingUser.username) {
            User.getByUsername(username, (err, userWithSameUsername) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                if (userWithSameUsername && userWithSameUsername.id !== parseInt(id)) {
                    return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
                }
                
                continueUpdate();
            });
        } else {
            continueUpdate();
        }
        
        function continueUpdate() {
            // Construir actualización del usuario
            const connection = require('../config/db');
            let sql = 'UPDATE users SET username = ?, name = ?, role = ?, church_id = ?';
            let params = [username, name || username, role, church_id || null];
            
            // Si se proporciona contraseña, actualizarla también
            if (password) {
                const bcrypt = require('bcryptjs');
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error al encriptar la contraseña' });
                    }
                    
                    sql += ', password = ?';
                    params.push(hashedPassword);
                    
                    // Añadir la condición WHERE y ejecutar
                    sql += ' WHERE id = ?';
                    params.push(id);
                    
                    connection.query(sql, params, (err, results) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        
                        res.json({
                            message: 'Usuario actualizado correctamente',
                            user: {
                                id: parseInt(id),
                                username,
                                name: name || username,
                                role,
                                church_id: church_id || null
                            }
                        });
                    });
                });
            } else {
                // Si no hay contraseña nueva, ejecutar la actualización sin cambiar la contraseña
                sql += ' WHERE id = ?';
                params.push(id);
                
                connection.query(sql, params, (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    
                    res.json({
                        message: 'Usuario actualizado correctamente',
                        user: {
                            id: parseInt(id),
                            username,
                            name: name || username,
                            role,
                            church_id: church_id || null
                        }
                    });
                });
            }
        }
    });
}];

// Eliminar un usuario (solo admin)
exports.deleteUser = [authMiddleware.verifyAdmin, (req, res) => {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    User.getById(id, (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!existingUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Evitar que se elimine a sí mismo
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }
        
        // Eliminar el usuario
        const connection = require('../config/db');
        connection.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({
                message: 'Usuario eliminado correctamente',
                success: true
            });
        });
    });
}]; 