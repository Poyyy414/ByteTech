const pool = require('../config/database'); // Make sure you have your MySQL pool set up

// Get all establishments
const getAllEstablishments = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM establishments');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

// Get a single establishment by ID
const getEstablishmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM establishments WHERE establishment_id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Establishment not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

// Create a new establishment
const createEstablishment = async (req, res) => {
    const { name, type, barangay_id, latitude, longitude } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO establishments (name, type, barangay_id, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
            [name, type, barangay_id, latitude, longitude]
        );
        res.status(201).json({ message: 'Establishment created', establishment_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

// Update an establishment
const updateEstablishment = async (req, res) => {
    const { id } = req.params;
    const { name, type, barangay_id, latitude, longitude } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE establishments 
             SET name = ?, type = ?, barangay_id = ?, latitude = ?, longitude = ?
             WHERE establishment_id = ?`,
            [name, type, barangay_id, latitude, longitude, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Establishment not found' });
        res.status(200).json({ message: 'Establishment updated' });
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

// Delete an establishment
const deleteEstablishment = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM establishments WHERE establishment_id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Establishment not found' });
        res.status(200).json({ message: 'Establishment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

module.exports = {
    getAllEstablishments,
    getEstablishmentById,
    createEstablishment,
    updateEstablishment,
    deleteEstablishment
};
