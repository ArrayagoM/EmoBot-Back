const express = require('express');
const cors = require('cors');
const emotionRoutes = require('./routes/emotionRoutes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', emotionRoutes);

module.exports = app;
