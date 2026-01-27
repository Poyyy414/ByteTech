const pool = require('../config/database');

// ============================================
// Receive sensor data from ESP32
// ============================================
const postSensorData = async (req, res) => {
  const {
    sensor_id,
    mq2_analog,
    methane_ppm,
    co2_density,
    carbon_level,
    humidity,
    temperature_c,
    temperature_f,
    heat_index_c,
    heat_index_f
  } = req.body;

  // Basic validation
  if (
    !sensor_id ||
    mq2_analog === undefined ||
    temperature_c === undefined ||
    humidity === undefined
  ) {
    return res.status(400).json({
      error: 'sensor_id, mq2_analog, temperature_c, and humidity are required'
    });
  }

  try {
    // 1️⃣ Insert sensor data
    await pool.query(
      `INSERT INTO sensor_data (
        sensor_id,
        mq2_analog,
        methane_ppm,
        co2_density,
        carbon_level,
        humidity,
        temperature_c,
        temperature_f,
        heat_index_c,
        heat_index_f
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sensor_id,
        mq2_analog,
        methane_ppm,
        co2_density,
        carbon_level,
        humidity,
        temperature_c,
        temperature_f,
        heat_index_c,
        heat_index_f
      ]
    );

    // 2️⃣ Auto-generate alerts
    if (carbon_level === 'HIGH' || carbon_level === 'VERY HIGH') {
      await pool.query(
        `INSERT INTO alerts (sensor_id, type, value)
         VALUES (?, ?, ?)`,
        [sensor_id, 'Carbon Level', carbon_level]
      );
    }

    if (temperature_c >= 35) {
      await pool.query(
        `INSERT INTO alerts (sensor_id, type, value)
         VALUES (?, ?, ?)`,
        [sensor_id, 'High Temperature', temperature_c]
      );
    }

    res.status(201).json({ message: 'Sensor data saved successfully' });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
};

// ============================================
// Get latest sensor data by sensor_id
// ============================================
const getLatestSensorData = async (req, res) => {
  const { sensor_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM sensor_data
       WHERE sensor_id = ?
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [sensor_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'No data found for this sensor'
      });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
};

// ============================================
// Get all sensor data for a sensor
// ============================================
const getSensorData = async (req, res) => {
  const { sensor_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM sensor_data
       WHERE sensor_id = ?
       ORDER BY recorded_at DESC`,
      [sensor_id]
    );

    res.status(200).json(rows);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
};

module.exports = {
  postSensorData,
  getLatestSensorData,
  getSensorData
};
