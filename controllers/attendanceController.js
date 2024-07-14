const Attendance = require('../models/attendanceModel');

exports.addAttendance = (req, res) => {
    const { secretary_id } = req.body;
    
    const visitId = req.params.id;
    const newAttendance = {
        visit_id: visitId,
        secretary_id: secretary_id, // Asegúrate de incluir el ID de la secretaria aquí
        date_time: new Date() // Puedes ajustar la fecha y hora según tus necesidades
    };
    Attendance.add(newAttendance, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};