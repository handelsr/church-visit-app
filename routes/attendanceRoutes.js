// attendanceRoutes.js

const express = require('express');
const router = express.Router();
const Attendance = require('../controllers/attendanceController');
const VisitorController = require('../controllers/visitorController');

// GET /api/secretary/visits
router.get('/visits', VisitorController.getVisitorsAbsentByChurch);

// POST /api/attendance/:id
router.post('/confirm', Attendance.addAttendance);


router.post('/stand_up/:id', Attendance.toggleStoodUp);


module.exports = router;
