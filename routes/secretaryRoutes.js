const express = require('express');
const router = express.Router();
const secretaryController = require('../controllers/secretaryController');

router.get('/', secretaryController.getSecretariesByChurch);

module.exports = router;
