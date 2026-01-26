const pool = require('../config/database');

// Set your threshold values here
const CO2_THRESHOLD = 900;       // ppm
const TEMP_THRESHOLD = 35;       // °C

// ============================================
// Receive sensor data from ESP32
// ============================================
const postSensorData = async (req, res) => {
  const { sensor_id, co2_ppm, temperature } = req.body;

  if (!sensor_id || co2_ppm === undefined || temperature === undefined) {
    return res.status(400).json({ error: 'sensor_id, co2_ppm, and temperature are required' });
  }

  try {
    // 1. Insert sensor data
    const [result] = await pool.query(
      `INSERT INTO sensor_data (sensor_id, co2_ppm, temperature) VALUES (?, ?, ?)`,
      [sensor_id, co2_ppm, temperature]
    );

    // 2. Generate alerts if thresholds exceeded
    if (co2_ppm > CO2_THRESHOLD) {
      await pool.query(
        `INSERT INTO alerts (sensor_id, type, value) VALUES (?, ?, ?)`,
        [sensor_id, 'High CO₂', co2_ppm]
      );
    }

    if (temperature > TEMP_THRESHOLD) {
      await pool.query(
        `INSERT INTO alerts (sensor_id, type, value) VALUES (?, ?, ?)`,
        [sensor_id, 'High Temp', temperature]
      );
    }

    res.status(201).json({ message: 'Sensor data saved successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// ============================================
// Get latest sensor data by sensor_id
// ============================================
const getLatestSensorData = async (req, res) => {
  const { sensor_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM sensor_data WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [sensor_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data found for this sensor' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// ============================================
// Get all sensor data for a sensor
// ============================================
const getSensorData = async (req, res) => {
  const { sensor_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM sensor_data WHERE sensor_id = ? ORDER BY timestamp DESC`,
      [sensor_id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

module.exports = {
  postSensorData,
  getLatestSensorData,
  getSensorData
};
