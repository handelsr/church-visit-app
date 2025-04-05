const Visitor = require('../models/visitorModel');
const Attendance = require('../models/attendanceModel');

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
    const { name, phone, address, invited_by, church_id, user_id } = req.body;
    
    const newVisitor = { 
        name, 
        phone, 
        address, 
        invited_by, 
        church_id,
        user_id 
    };
    
    Visitor.add(newVisitor, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json(result);
    });
};

// Método para obtener visitantes por iglesia
exports.getVisitorsByChurch = (req, res) => {
    const { churchId } = req.query;
    
    if (!churchId) {
        return res.status(400).json({ error: 'Se requiere el ID de la iglesia' });
    }
    
    Visitor.getVisitorsByChurch(churchId, (err, visitors) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(visitors);
    });
};