const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorDataController');

// ESP32 posts sensor readings
router.post('/sensor-data', sensorController.postSensorData);

// Get latest reading for a sensor
router.get('/sensor-data/latest/:sensor_id', sensorController.getLatestSensorData);

// Get all readings for a sensor
router.get('/sensor-data/:sensor_id', sensorController.getSensorData);

module.exports = router;
