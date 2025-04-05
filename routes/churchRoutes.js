const express = require('express');
const router = express.Router();
const churchController = require('../controllers/churchController');

// Ruta para obtener todas las iglesias
router.get('/', churchController.getAllChurches);

// Ruta para obtener una iglesia por ID
router.get('/:id', churchController.getChurchById);

module.exports = router; 