const express = require('express');
const cors = require('cors');
const authProxy = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

module.exports = app;