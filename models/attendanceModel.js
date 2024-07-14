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
    }
};

module.exports = Attendance;
