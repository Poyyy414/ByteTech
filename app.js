const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorDataRoutes');


const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

app.get('/', function(req, res) {
    res.send('Welcome to the ByteTech API!');
});

// Enpoint for authentication routes
app.use('/auth', authRoutes);
app.use('/api', sensorRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 