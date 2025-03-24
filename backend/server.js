const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Import routes
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api', apiRoutes);

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check for load balancer
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', server: process.env.SERVER_NAME || 'unknown' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});