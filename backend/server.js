require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (with mock DB fallback if connection fails)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Base Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server started running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
