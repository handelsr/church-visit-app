// secretaryController.js

const Secretary = require('../models/secretaryModel'); // Importa el modelo de secretarias

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
