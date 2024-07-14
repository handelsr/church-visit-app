// visitsRoutes.js

const express = require('express');
const router = express.Router();
const Visit = require('../controllers/visitorController');

// GET /api/visits_by_day?date=:date
router.get('/:id', Visit.getVisitorById);


router.get('/', Visit.getVisitorByDate);



router.post('/', Visit.addVisitor);

module.exports = router;
