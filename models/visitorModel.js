const connection = require('../config/db');

const Visitor = {
    add: ({name, phone, address, invited_by, church_id, user_id}, callback) => {
        const sql = 'INSERT INTO visitors (name, phone, address, invited_by, church_id, user_id) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [name, phone, address, invited_by, church_id, user_id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, { id: results.insertId, name, phone, address, invited_by, church_id, user_id, success: true });
        });
    },

    get: (callback) => {
        const sql = `
            SELECT 
                v.id, 
                v.name, 
                v.phone, 
                v.address, 
                v.invited_by, 
                u.name as secretary_name, 
                c.name as church_name, 
                (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id) as visits_count,
                (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id AND sa.stood_up = 1) as stood_up_count,
                IFNULL((SELECT GROUP_CONCAT(DATE_FORMAT(a.date_time, "%Y-%m-%d") SEPARATOR ",") FROM attendance a WHERE a.visitor_id = v.id),"") AS attendance_days 
            FROM 
                visitors v 
                LEFT JOIN users u ON v.user_id = u.id
                LEFT JOIN churches c ON c.id = u.church_id 
            ORDER BY v.name ASC`;
        connection.query(sql, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    
    getVisitorsByChurch: (churchId, callback) => {
        const sql = `
            SELECT 
                v.id, 
                v.name, 
                v.phone, 
                v.address, 
                v.invited_by, 
                u.name as secretary_name, 
                c.name as church_name, 
                (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id) as visits_count,
                (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id AND sa.stood_up = 1) as stood_up_count
            FROM 
                visitors v 
                LEFT JOIN users u ON v.user_id = u.id
                LEFT JOIN churches c ON c.id = u.church_id
            WHERE 
                c.id = ?
            ORDER BY v.name ASC`;
        connection.query(sql, [churchId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    
    getVisitorsAbsentByChurch: (churchId, callback) => {
        const sql = 'SELECT v.id, v.name, v.phone, v.address, v.invited_by FROM visitors v WHERE v.church_id = ?';
        connection.query(sql, [churchId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    
    getVisitById: (id, callback) => {
        const sql = `
            SELECT 
                v.id,
                v.name,
                v.phone,
                v.address,
                v.invited_by,
                v.user_id,
                u.name as secretary_name,
                c.name as church_name,
                c.id as church_id,
                (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id) as visits_count,
                (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id AND sa.stood_up = 1) as stood_up_count,
                IFNULL((SELECT GROUP_CONCAT(DATE_FORMAT(a.date_time, "%Y-%m-%d") SEPARATOR ",") FROM attendance a WHERE a.visitor_id = v.id),"") AS attendance_days
            FROM 
                visitors v
                LEFT JOIN users u ON v.user_id = u.id
                LEFT JOIN churches c ON c.id = u.church_id
            WHERE 
                v.id = ?`;
        connection.query(sql, [id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    
    getVisitByDate: (date, callback) => {
        const sql = `
            SELECT 
                v.id, 
                v.name, 
                v.phone, 
                v.address, 
                v.invited_by, 
                u.name as secretary_name, 
                c.name as church_name, 
                a.stood_up, 
                a.id as attendance_id, 
                TIME(a.date_time) as arrival_time, 
                (SELECT COUNT(sa.id) FROM attendance sa WHERE sa.visitor_id = v.id) as visits_count
            FROM 
                visitors v 
                INNER JOIN attendance a ON a.visitor_id = v.id 
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN churches c ON c.id = u.church_id
            WHERE 
                DATE(a.date_time) = DATE(?)
            ORDER BY 
                TIME(a.date_time) ASC`;
        connection.query(sql, [date], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
};

module.exports = Visitor;
