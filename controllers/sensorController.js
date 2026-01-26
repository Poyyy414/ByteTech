const pool = require('../config/database');

// ============================================
// Create a new sensor
// ============================================
const createSensor = async (req, res) => {
  const { sensor_name, barangay_id, establishment_id, latitude, longitude } = req.body;

  if (!sensor_name || !latitude || !longitude) {
    return res.status(400).json({ error: 'sensor_name, latitude, and longitude are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO sensors (sensor_name, barangay_id, establishment_id, latitude, longitude)
       VALUES (?, ?, ?, ?, ?)`,
      [sensor_name, barangay_id || null, establishment_id || null, latitude, longitude]
    );

    res.status(201).json({
      message: 'Sensor created successfully',
      sensor_id: result.insertId
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// ============================================
// Get all sensors
// ============================================
const getAllSensors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.sensor_id, s.sensor_name, s.barangay_id, s.establishment_id, 
              s.latitude, s.longitude, s.installed_on, s.created_at, s.updated_at,
              b.name AS barangay_name
       FROM sensors s
       LEFT JOIN barangays b ON s.barangay_id = b.barangay_id
       ORDER BY s.sensor_id ASC`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// ============================================
// Get a single sensor by ID
// ============================================
const getSensorById = async (req, res) => {
  const { sensor_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT s.sensor_id, s.sensor_name, s.barangay_id, s.establishment_id, 
              s.latitude, s.longitude, s.installed_on, s.created_at, s.updated_at,
              b.name AS barangay_name
       FROM sensors s
       LEFT JOIN barangays b ON s.barangay_id = b.barangay_id
       WHERE s.sensor_id = ?`,
      [sensor_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// ============================================
// Update a sensor (optional)
// ============================================
const updateSensor = async (req, res) => {
  const { sensor_id } = req.params;
  const { sensor_name, barangay_id, establishment_id, latitude, longitude } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE sensors
       SET sensor_name = ?, barangay_id = ?, establishment_id = ?, latitude = ?, longitude = ?
       WHERE sensor_id = ?`,
      [sensor_name, barangay_id || null, establishment_id || null, latitude, longitude, sensor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sensor not found or no changes made' });
    }

    res.status(200).json({ message: 'Sensor updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

module.exports = {
  createSensor,
  getAllSensors,
  getSensorById,
  updateSensor
};
