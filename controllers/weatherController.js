const axios = require('axios');
const pool = require('../config/database');

// ============================================
// Get weekly weather + carbon prediction
// ============================================
const getWeeklyPrediction = async (req, res) => {
  const { barangay_id } = req.params;

  try {
    // 1. Get barangay location
    const [barangayRows] = await pool.query(
      `SELECT latitude, longitude, name FROM barangays WHERE barangay_id = ?`,
      [barangay_id]
    );

    if (!barangayRows.length) {
      return res.status(404).json({ error: 'Barangay not found' });
    }

    const { latitude, longitude, name } = barangayRows[0];

    // 2. Call Open-Meteo API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=13.636789&longitude=123.200758&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,cloud_cover&timezone=Asia%2FSingapore&past_days=7`;

    const response = await axios.get(url);
    const daily = response.data.daily;

    // 3. Simple AI Rule-Based Prediction
    const predictions = daily.time.map((date, index) => {
      const temp = daily.temperature_2m_max[index];
      const rain = daily.precipitation_probability_max[index];
      const wind = daily.wind_speed_10m_max[index];

      let carbon_level = 'NORMAL';

      if (temp >= 34 && wind <= 5 && rain < 30) {
        carbon_level = 'VERY HIGH';
      } else if (temp >= 32 && wind <= 8) {
        carbon_level = 'HIGH';
      } else if (rain >= 60) {
        carbon_level = 'LOW';
      }

      return {
        date,
        max_temp: temp,
        rain_probability: rain,
        wind_speed: wind,
        carbon_level
      };
    });

    res.status(200).json({
      barangay: name,
      forecast: predictions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Weather prediction failed',
      details: error.message
    });
  }
};

module.exports = {
  getWeeklyPrediction
};
