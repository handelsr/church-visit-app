// secretaryController.js

const Secretary = require('../models/secretaryModel'); // Importa el modelo de secretarias
const db = require('../config/db');

// Controlador para obtener las secretarias de una iglesia específica
exports.getSecretariesByChurch = (req, res) => {
  const { church_id } = req.query; // Obtiene el ID de la iglesia del query param
  Secretary.getSecretariesByChurch(church_id, (err, secretaries) => {
    if (err) {
      console.error('Error al obtener las secretarias:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }

    res.json(secretaries);
  });
};

// Controlador para obtener una secretaria por su ID
exports.getSecretaryById = (req, res) => {
  const { id } = req.params; // Obtiene el ID de la secretaria del parámetro de la ruta
  
  if (!id) {
    return res.status(400).json({ error: 'Se requiere el ID de la secretaria' });
  }
  
  Secretary.getSecretaryById(id, (err, secretary) => {
    if (err) {
      console.error('Error al obtener la secretaria:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    
    if (!secretary) {
      return res.status(404).json({ error: 'Secretaria no encontrada' });
    }
    
    res.json(secretary);
  });
};

// Obtener todas las secretarias
exports.getAllSecretaries = (req, res) => {
    const sql = `
        SELECT s.*, u.username, u.name as user_name, u.role, c.name as church_name 
        FROM secretaries s 
        LEFT JOIN users u ON s.user_id = u.id 
        LEFT JOIN churches c ON s.church_id = c.id
    `;
    
    db.query(sql, [], (err, results) => {
        if (err) {
            console.error('Error al obtener secretarias:', err);
            return res.status(500).json({ message: 'Error en el servidor', error: err.message });
        }
        
        // Usar el nombre del usuario si está disponible
        const secretaries = results.map(secretary => {
            // Si el usuario tiene un nombre, usarlo para la secretaria
            if (secretary.user_name) {
                secretary.name = secretary.user_name;
            }
            return secretary;
        });
        
        res.json({ secretaries });
    });
};

// Crear o actualizar una secretaria
exports.createOrUpdateSecretary = (req, res) => {
    const { name, church_id, user_id } = req.body;
    
    // Validar datos
    if (!church_id || !user_id) {
        return res.status(400).json({ message: 'Faltan datos requeridos: iglesia y usuario son obligatorios' });
    }
    
    // Primero obtenemos el usuario para usar su nombre si está disponible
    const getUserSql = 'SELECT name FROM users WHERE id = ?';
    db.query(getUserSql, [user_id], (err, userResults) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor', error: err.message });
        }
        
        // Usar el nombre del usuario si está disponible, sino usar el nombre proporcionado
        const userName = userResults.length > 0 && userResults[0].name ? userResults[0].name : name;
        
        // Crear o actualizar la secretaria con el nombre correspondiente
        Secretary.createOrUpdate({ name: userName, church_id, user_id }, (err, result) => {
            if (err) {
                console.error('Error al crear/actualizar secretaria:', err);
                return res.status(500).json({ message: 'Error en el servidor', error: err.message });
            }
            
            res.status(result.created ? 201 : 200).json({
                message: result.created ? 'Secretaria creada con éxito' : 'Secretaria actualizada con éxito',
                secretary: result
            });
        });
    });
};

// Crear secretarias faltantes para los usuarios existentes
exports.createMissingSecretaries = (req, res) => {
    // Primero buscamos usuarios de tipo 'secretary' que no tengan secretaria asignada
    const sql = `
        SELECT u.id, u.username, u.name, u.church_id 
        FROM users u 
        LEFT JOIN secretaries s ON u.id = s.user_id 
        WHERE u.role = 'secretary' AND s.id IS NULL
    `;
    
    db.query(sql, [], (err, users) => {
        if (err) {
            console.error('Error al buscar usuarios sin secretaria:', err);
            return res.status(500).json({ message: 'Error en el servidor', error: err.message });
        }
        
        if (users.length === 0) {
            return res.json({ message: 'No hay usuarios de secretaria sin asignar' });
        }
        
        // Array para almacenar los resultados
        const results = [];
        let completed = 0;
        
        // Para cada usuario, creamos una secretaria
        users.forEach(user => {
            // Usar el nombre del usuario si está disponible, sino generar uno
            const secretaryName = user.name || `Secretaria ${user.username.replace('secretaria', '')}`;
            
            Secretary.createOrUpdate({
                name: secretaryName,
                church_id: user.church_id,
                user_id: user.id
            }, (err, result) => {
                completed++;
                
                if (err) {
                    results.push({ 
                        user_id: user.id, 
                        username: user.username, 
                        success: false, 
                        error: err.message 
                    });
                } else {
                    results.push({ 
                        user_id: user.id, 
                        username: user.username, 
                        success: true, 
                        secretary_id: result.id 
                    });
                }
                
                // Si ya procesamos todos, devolvemos la respuesta
                if (completed === users.length) {
                    res.json({
                        message: `Procesados ${users.length} usuarios`,
                        results: results
                    });
                }
            });
        });
    });
};
