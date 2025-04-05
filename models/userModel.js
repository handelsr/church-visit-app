const connection = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    getByUsername: (username, callback) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        connection.query(sql, [username], (err, results) => {
            if (err) {
                console.error('Error al buscar usuario:', err);
                return callback(err, null);
            }
            
            if (results.length > 0) {
                callback(null, results[0]);
            } else {
                callback(null, null);
            }
        });
    },
    
    getById: (id, callback) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        connection.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Error al buscar usuario por ID:', err);
                return callback(err, null);
            }
            
            if (results.length > 0) {
                callback(null, results[0]);
            } else {
                callback(null, null);
            }
        });
    },
    
    create: (userData, callback) => {
        // Encriptar la contraseña
        bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
            if (err) {
                return callback(err);
            }
            
            const sql = 'INSERT INTO users (username, password, name, role, church_id) VALUES (?, ?, ?, ?, ?)';
            connection.query(sql, [
                userData.username, 
                hashedPassword, 
                userData.name || userData.username, // Si no se proporciona un nombre, usar el nombre de usuario
                userData.role, 
                userData.church_id
            ], (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { 
                    id: results.insertId, 
                    username: userData.username,
                    name: userData.name || userData.username,
                    role: userData.role,
                    church_id: userData.church_id
                });
            });
        });
    },
    
    // Método para actualizar el church_id de un usuario
    updateChurchId: (userId, churchId, callback) => {
        const sql = 'UPDATE users SET church_id = ? WHERE id = ?';
        connection.query(sql, [churchId, userId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, { success: true, userId, churchId });
        });
    },
    
    // Nuevo método para actualizar el nombre de un usuario
    updateName: (userId, name, callback) => {
        const sql = 'UPDATE users SET name = ? WHERE id = ?';
        connection.query(sql, [name, userId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, { success: true, userId, name });
        });
    },
    
    validatePassword: (plainPassword, hashedPassword, callback) => {
        bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
            if (err) {
                return callback(err);
            }
            callback(null, isMatch);
        });
    }
};

module.exports = User; 