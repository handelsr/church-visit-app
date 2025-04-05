const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

// Obtener todos los visitantes
router.get('/', visitorController.getVisitors);

// Obtener visitantes por fecha
router.get('/date', visitorController.getVisitorByDate);

// Obtener visitantes por iglesia
router.get('/church', visitorController.getVisitorsByChurch);

// Agregar un nuevo visitante
router.post('/', visitorController.addVisitor);

// Obtener visitante por ID
router.get('/:id', visitorController.getVisitorById);

module.exports = router;
