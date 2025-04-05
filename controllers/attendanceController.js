const Attendance = require('../models/attendanceModel');

exports.addAttendance = (req, res) => {
    console.log('Recibiendo solicitud de confirmación de asistencia:', req.body);
    
    const { visitor_id, user_id } = req.body;
    
    // Siempre usar la fecha y hora actuales
    const currentDateTime = new Date();
    
    // Validación de datos
    if (!visitor_id) {
        console.error('Error: No se proporcionó el ID del visitante');
        return res.status(400).json({ 
            error: 'Se requiere el ID del visitante', 
            success: false 
        });
    }
    
    if (!user_id) {
        console.error('Error: No se proporcionó el ID del usuario');
        return res.status(400).json({ 
            error: 'Se requiere el ID del usuario', 
            success: false 
        });
    }
    
    const newAttendance = {
        visitor_id: visitor_id,
        user_id: user_id,
        date_time: currentDateTime
    };
    
    console.log('Datos de asistencia a guardar:', newAttendance);
    
    // Verificación personalizada para la fecha actual
    const sqlDate = currentDateTime.toISOString().split('T')[0];
    const checkSql = 'SELECT * FROM attendance WHERE visitor_id = ? AND DATE(date_time) = ?';
    
    require('../config/db').query(checkSql, [visitor_id, sqlDate], (err, existingAttendance) => {
        if (err) {
            console.error('Error al verificar asistencia existente:', err);
            return res.status(500).json({ 
                error: 'Error al verificar asistencia existente', 
                details: err.message,
                success: false 
            });
        }
        
        if (existingAttendance && existingAttendance.length > 0) {
            console.log('Ya existe una asistencia para este visitante en esta fecha:', existingAttendance);
            return res.json({ 
                message: 'La asistencia ya ha sido registrada previamente', 
                id: existingAttendance[0].id,
                success: true 
            });
        }
        
        // Si no existe, registrar la nueva asistencia
        Attendance.add(newAttendance, (err, result) => {
            if (err) {
                console.error('Error al guardar la asistencia:', err);
                return res.status(500).json({ 
                    error: 'Error al guardar la asistencia', 
                    details: err.message,
                    success: false 
                });
            }
            
            console.log('Asistencia guardada exitosamente:', result);
            res.json({...result, success: true});
        });
    });
};

exports.deleteAttendance = (req, res) => {
    const { visitId } = req.params;
    
    if (!visitId) {
        return res.status(400).json({ 
            error: 'Se requiere el ID del visitante', 
            success: false 
        });
    }
    
    console.log(`Intentando eliminar asistencia para visitante ID: ${visitId}`);
    
    Attendance.delete(visitId, (err, result) => {
        if (err) {
            console.error('Error al eliminar asistencia:', err);
            return res.status(500).json({ 
                error: err.message, 
                success: false 
            });
        }
        
        if (result.affectedRows === 0) {
            // Si no se eliminó ninguna fila, informar que no se encontró la asistencia
            console.log(`No se encontró asistencia para el visitante ${visitId} en la fecha actual`);
            return res.status(404).json({
                message: 'No se encontró asistencia para eliminar',
                success: false
            });
        }
        
        console.log(`Asistencia eliminada correctamente para visitante ID: ${visitId}`);
        res.json({ 
            message: 'Asistencia eliminada correctamente',
            success: true 
        });
    });
};

exports.toggleStoodUp = (req, res) => {
    const { id } = req.params;
    const { stood_up } = req.body;
    
    Attendance.updateStoodUp(id, stood_up, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message, success: false });
        }
        res.json({ ...result, success: true });
    });
};

// Obtener todas las asistencias de hoy
exports.getTodayAttendance = (req, res) => {
    const { churchId } = req.query;
    
    if (!churchId) {
        return res.status(400).json({ error: 'Se requiere el ID de la iglesia', success: false });
    }
    
    Attendance.getTodayByChurch(churchId, (err, attendances) => {
        if (err) {
            return res.status(500).json({ error: err.message, success: false });
        }
        res.json(attendances);
    });
};