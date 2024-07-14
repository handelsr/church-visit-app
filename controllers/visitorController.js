const Visitor = require('../models/visitorModel');
const Attendance = require('../models/attendanceModel');

exports.addVisitor = (req, res) => {
    const { name, phone, address, invited_by, secretary_id } = req.body;
    Visitor.add(name, phone, address, invited_by, secretary_id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

exports.getVisitors = (req, res) => {
    Visitor.get((err, visitors) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(visitors);
    });
};


exports.getVisitorsAbsentByChurch = (req, res) => {
    const { churchId } = req.query; // Obtiene el ID de la iglesia del query param
    Visitor.getVisitorsAbsentByChurch(churchId, (err, visitors) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(visitors);
    });
};


exports.getVisitorById = (req, res) => {
    const { id } = req.params; // Obtiene el ID del vistante
    Visitor.getVisitById(id, (err, visitors) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(visitors);
    });
};

exports.getVisitorByDate = (req, res) => {
    const { date } = req.query; // Obtiene el ID del vistante
    Visitor.getVisitByDate(date, (err, visitors) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(visitors);
    });
};

exports.addVisitor = (req, res) => {
    const { name, phone, address, invited_by, church_id, secretary_id } = req.body;
    
    const newVisitor = { 
        name, 
        phone, 
        address, 
        invited_by, 
        secretary_id
    };
    Visitor.add(newVisitor, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        Attendance.add({visit_id: result.id, date_time: new Date(), secretary_id},()=>{})
        res.json(result);
    });

};