// secretaryModel.js

const db = require('../config/db'); // Importa la conexión a la base de datos MySQL

// Modelo para manejar las operaciones relacionadas con las secretarias
const Secretary = {};

// Método para obtener las secretarias de una iglesia específica
Secretary.getSecretariesByChurch = (church_id, callback) => {
  const sql = `
    SELECT s.*, u.name as user_name, u.username, u.role 
    FROM secretaries s 
    LEFT JOIN users u ON s.user_id = u.id 
    WHERE s.church_id = ?
  `;

  db.query(sql, [church_id], (err, results) => {
    if (err) {
      console.error('Error al obtener las secretarias:', err);
      return callback(err, null);
    }

    // Si el usuario tiene un nombre, usar ese como nombre de la secretaria
    const processedResults = results.map(secretary => {
      if (secretary.user_name) {
        secretary.name = secretary.user_name;
      }
      return secretary;
    });

    callback(null, processedResults);
  });
};

// Método para obtener una secretaria por su ID
Secretary.getSecretaryById = (id, callback) => {
  const sql = `
    SELECT s.*, u.name as user_name, u.username, u.role, c.name as church_name 
    FROM secretaries s 
    LEFT JOIN users u ON s.user_id = u.id 
    LEFT JOIN churches c ON s.church_id = c.id 
    WHERE s.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener la secretaria:', err);
      return callback(err, null);
    }

    if (results.length > 0) {
      // Si el usuario tiene un nombre, usar ese como nombre de la secretaria
      if (results[0].user_name) {
        results[0].name = results[0].user_name;
      }
      callback(null, results[0]);
    } else {
      callback(null, null);
    }
  });
};

// Método para crear o actualizar una secretaria
Secretary.createOrUpdate = (secretaryData, callback) => {
  // Primero verificamos si ya existe una secretaria para este usuario
  const checkSql = 'SELECT * FROM secretaries WHERE user_id = ?';
  
  db.query(checkSql, [secretaryData.user_id], (err, results) => {
    if (err) {
      console.error('Error al verificar si existe la secretaria:', err);
      return callback(err, null);
    }
    
    if (results.length > 0) {
      // Ya existe, actualizamos
      const updateSql = 'UPDATE secretaries SET name = ?, church_id = ? WHERE user_id = ?';
      
      db.query(updateSql, [secretaryData.name, secretaryData.church_id, secretaryData.user_id], (err, updateResult) => {
        if (err) {
          console.error('Error al actualizar la secretaria:', err);
          return callback(err, null);
        }
        
        callback(null, { id: results[0].id, ...secretaryData, updated: true });
      });
    } else {
      // No existe, la creamos
      const insertSql = 'INSERT INTO secretaries (name, church_id, user_id) VALUES (?, ?, ?)';
      
      db.query(insertSql, [secretaryData.name, secretaryData.church_id, secretaryData.user_id], (err, insertResult) => {
        if (err) {
          console.error('Error al crear la secretaria:', err);
          return callback(err, null);
        }
        
        callback(null, { id: insertResult.insertId, ...secretaryData, created: true });
      });
    }
  });
};

module.exports = Secretary;
