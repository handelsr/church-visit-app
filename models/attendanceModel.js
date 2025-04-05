const connection = require('../config/db');

const Attendance = {
    add: ({visitor_id, date_time, user_id}, callback) => {
        const sql = 'INSERT INTO attendance (visitor_id, date_time, user_id) VALUES (?, ?, ?)';
        connection.query(sql, [visitor_id, date_time, user_id], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            callback(null, { id: results.insertId, visitor_id, date_time, user_id, success: true });
        });
    },
    
    getByVisitorIdToday: (visitor_id, callback) => {
        const today = new Date().toISOString().split('T')[0];
        const sql = 'SELECT * FROM attendance WHERE visitor_id = ? AND DATE(date_time) = ?';
        connection.query(sql, [visitor_id, today], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            callback(null, results);
        });
    },
    
    delete: (visitor_id, callback) => {
        // Primero verificar si la asistencia existe
        const checkSql = 'SELECT id FROM attendance WHERE visitor_id = ?';
        connection.query(checkSql, [visitor_id], (err, checkResults) => {
            if (err) {
                return callback(err);
            }
            
            // Si no hay asistencia para eliminar, devolver un objeto con afectados = 0
            if (checkResults.length === 0) {
                console.log(`No se encontraron asistencias para eliminar del visitante ${visitor_id}`);
                return callback(null, { 
                    success: false, 
                    message: 'No se encontraron asistencias para eliminar',
                    affectedRows: 0
                });
            }
            
            // Si existe, proceder a eliminar
            const deleteSql = 'DELETE FROM attendance WHERE visitor_id = ?';
            connection.query(deleteSql, [visitor_id], (err, results) => {
                if (err) {
                    return callback(err);
                }
                
                console.log(`Eliminada asistencia del visitante ${visitor_id}. Filas afectadas: ${results.affectedRows}`);
                callback(null, { 
                    success: true, 
                    message: 'Asistencia eliminada correctamente',
                    affectedRows: results.affectedRows
                });
            });
        });
    },
    
    updateStoodUp: (id, stoodUp, callback) => {
        const sql = 'UPDATE attendance SET stood_up = ? WHERE id = ?';
        connection.query(sql, [stoodUp, id], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            // También devolver el visitor_id para actualizar la UI
            const getVisitorIdSql = 'SELECT visitor_id FROM attendance WHERE id = ?';
            connection.query(getVisitorIdSql, [id], (err, results) => {
                if (err) {
                    return callback(err);
                }
                
                const visitor_id = results.length > 0 ? results[0].visitor_id : null;
                callback(null, { id, visitor_id, stoodUp, success: true });
            });
        });
    },
    
    getTodayByChurch: (churchId, callback) => {
        const sql = `
            SELECT a.id, a.visitor_id, a.date_time, a.stood_up, v.name, v.phone, v.invited_by
            FROM attendance a 
            INNER JOIN visitors v ON a.visitor_id = v.id 
            INNER JOIN users u ON v.user_id = u.id
            WHERE u.church_id = ?
            ORDER BY a.date_time DESC`;
            
        connection.query(sql, [churchId], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            callback(null, results);
        });
    }
};

module.exports = Attendance;
