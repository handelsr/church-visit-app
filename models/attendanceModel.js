const connection = require('../config/db');

const Attendance = {
    add: ({visit_id, date_time, secretary_id}, callback) => {
        const sql = 'INSERT INTO attendance (visitor_id, date_time, secretary_id) VALUES (?, ?, ?)';
        connection.query(sql, [visit_id, date_time, secretary_id], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            callback(null, { id: results.insertId, visit_id, date_time, secretary_id });
        });
    },
    updateStoodUp : (id, stoodUp, callback) => {
        const sql = 'UPDATE attendance SET stood_up = ? WHERE id = ?';
        connection.query(sql, [stoodUp, id], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            callback(null, { id: results.insertId, id, stoodUp, success: true });
        })
    }
}

module.exports = Attendance;
