const axios = require('axios');
const pool = require('../config/database');

// ============================================
// Get weekly weather + AI carbon prediction
// ============================================
const getWeeklyPrediction = async (req, res) => {
  const { barangay_id } = req.params;

  try {
    // 1️⃣ Get barangay coordinates
    const [rows] = await pool.query(
      `SELECT name, latitude, longitude FROM barangays WHERE barangay_id = ?`,
      [barangay_id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Barangay not found' });
    }

    const { name, latitude, longitude } = rows[0];

    // 2️⃣ Call Open-Meteo (7-day DAILY forecast)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=13.636789&longitude=123.200758&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSingapore&temporal_resolution=native`;

    const { data } = await axios.get(url);
    const daily = data.daily;

    // 3️⃣ AI rule-based carbon prediction
    const forecast = daily.time.map((date, i) => {
      const tempMax = daily.temperature_2m_max[i];
      const rainProb = daily.precipitation_probability_max[i];
      const windSpeed = daily.wind_speed_10m_max[i];

      let carbon_level = 'NORMAL';

      if (tempMax >= 35 && rainProb < 20 && windSpeed < 3) {
        carbon_level = 'VERY HIGH';
      } else if (tempMax >= 32 && rainProb < 40) {
        carbon_level = 'HIGH';
      } else if (rainProb >= 60 || windSpeed >= 6) {
        carbon_level = 'LOW';
      }

      return {
        date,
        temperature_max: tempMax,
        temperature_min: daily.temperature_2m_min[i],
        rain_probability: rainProb,
        wind_speed: windSpeed,
        predicted_carbon_level: carbon_level
      };
    });

    // 4️⃣ Response
    res.status(200).json({
      barangay_id,
      barangay_name: name,
      forecast_days: forecast.length,
      forecast
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      error: 'Weather prediction failed',
      details: error.message
    });
  }
};

module.exports = {
  getWeeklyPrediction
};
