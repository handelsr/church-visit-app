// attendanceRoutes.js

const express = require('express');
const router = express.Router();
const Visit = require('../models/visitModel');
const Attendance = require('../controllers/attendanceController');
const VisitorController = require('../controllers/visitorController');

// GET /api/secretary/visits
router.get('/visits', VisitorController.getVisitorsAbsentByChurch);

// GET /api/visits/:id
router.get('/visits/:id', async (req, res) => {
    try {
        const visitId = req.params.id;
        const visit = await Visit.getVisitById(visitId);
        if (!visit) {
            return res.status(404).json({ message: 'Visita no encontrada.' });
        }
        res.json(visit);
    } catch (err) {
        console.error('Error al obtener los detalles de la visita:', err);
        res.status(500).json({ message: 'Error al obtener los detalles de la visita.' });
    }
});

// POST /api/attendance/:id
router.post('/:id', Attendance.addAttendance);

// POST /api/visits
router.post('/visits', async (req, res) => {
    try {
        const newVisit = {
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            invited_by: req.body.invited_by,
            church_id: req.body.church_id, // Asegúrate de incluir el ID de la iglesia aquí
            secretary_id: req.body.secretary_id // Asegúrate de incluir el ID de la secretaria aquí
        };

        const visit = await Visit.createVisit(newVisit);
        res.json(visit);
    } catch (err) {
        console.error('Error al registrar la nueva visita:', err);
        res.status(500).json({ message: 'Error al registrar la nueva visita.' });
    }
});

module.exports = router;
