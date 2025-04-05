// attendanceRoutes.js

const express = require('express');
const router = express.Router();
const Attendance = require('../controllers/attendanceController');
const VisitorController = require('../controllers/visitorController');

// Obtener visitantes por iglesia
router.get('/visits', VisitorController.getVisitorsAbsentByChurch);

// Obtener asistencias de hoy por iglesia
router.get('/today', Attendance.getTodayAttendance);

// Confirmar asistencia
router.post('/confirm', Attendance.addAttendance);

// Eliminar asistencia
router.delete('/delete/:visitId', Attendance.deleteAttendance);

// Actualizar si se puso de pie
router.put('/:id/stood-up', Attendance.toggleStoodUp);

module.exports = router;
