const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

router.post('/add', visitorController.addVisitor);
router.get('/', visitorController.getVisitors);

module.exports = router;
