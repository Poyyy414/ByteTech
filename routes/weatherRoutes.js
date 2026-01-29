const express = require('express');
const router = express.Router();
const { getWeeklyPrediction } = require('../controllers/weatherController');

// Weekly forecast for ONE barangay
router.get('/weekly/:barangay_id', getWeeklyPrediction);

module.exports = router;
