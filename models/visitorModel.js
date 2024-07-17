const connection = require('../config/db');

const Visitor = {
    add: ({name, phone, address, invited_by, secretary_id}, callback) => {
        const sql = 'INSERT INTO visitors (name, phone, address, invited_by, secretary_id) VALUES (?, ?, ?, ?, ?)';
        connection.query(sql, [name, phone, address, invited_by, secretary_id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, { id: results.insertId, name, phone, address, invited_by, secretary_id, success: true });
        });
    },

    get: (callback) => {
        const sql = 'SELECT v.name, v.phone, v.address, v.invited_by, s.`name` secretary_name, c.`name` church_name, (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id) visits_count, (SELECT GROUP_CONCAT(DATE_FORMAT(a.date_time, "%Y-%m-%d") SEPARATOR ",") FROM attendance a WHERE a.visitor_id = v.id) AS attendance_days FROM visitors v LEFT JOIN secretaries s ON v.secretary_id = s.id INNER JOIN churches c ON c.id = s.church_id';
        connection.query(sql, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    getVisitorsAbsentByChurch: (churchId, callback) => {
        const sql = 'SELECT v.* FROM visitors v LEFT JOIN secretaries s ON s.id = v.secretary_id WHERE s.church_id = ? AND v.id NOT IN (SELECT visitor_id FROM attendance WHERE DATE(date_time) = CURDATE())';
        connection.query(sql, [churchId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    getVisitById: (id, callback) => {
        const sql = 'SELECT v.* FROM visitors v WHERE id = ?';
        connection.query(sql, [id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    getVisitByDate: (date, callback) => {
        const sql = 'SELECT v.*, a.stood_up, a.id attendance_id, TIME(a.date_time) arrival_time, (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id) count FROM visitors v INNER JOIN attendance a ON a.visitor_id = v.id WHERE DATE(a.date_time) = DATE(?) ORDER BY TIME(a.date_time)';
        connection.query(sql, [date], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
};

module.exports = Visitor;
