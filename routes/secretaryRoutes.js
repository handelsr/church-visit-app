const express = require('express');
const router = express.Router();
const secretaryController = require('../controllers/secretaryController');
const authController = require('../controllers/authController');

// Ruta para obtener secretarias por iglesia
router.get('/church/:churchId', secretaryController.getSecretariesByChurch);

// Ruta para obtener una secretaria por ID
router.get('/:id', secretaryController.getSecretaryById);

// Ruta para obtener todas las secretarias
router.get('/', secretaryController.getAllSecretaries);

// Ruta para crear o actualizar una secretaria
router.post('/', secretaryController.createOrUpdateSecretary);

// Ruta para crear secretarias faltantes (para desarrollo)
router.post('/create-missing', secretaryController.createMissingSecretaries);

module.exports = router;
