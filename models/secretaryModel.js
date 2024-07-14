// secretaryModel.js

const db = require('../config/db'); // Importa la conexión a la base de datos MySQL

// Modelo para manejar las operaciones relacionadas con las secretarias
const Secretary = {};

// Método para obtener las secretarias de una iglesia específica
Secretary.getSecretariesByChurch = (church_id, callback) => {
  const sql = 'SELECT * FROM secretaries WHERE church_id = ?';

  db.query(sql, [church_id], (err, results) => {
    if (err) {
      console.error('Error al obtener las secretarias:', err);
      return callback(err, null);
    }

    callback(null, results);
  });
};

module.exports = Secretary;
