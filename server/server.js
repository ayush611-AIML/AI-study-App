require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const deckRoutes = require('./routes/decks');
const reviewRoutes = require('./routes/reviews');
const quizRoutes = require('./routes/quizzes');
const statsRoutes = require('./routes/stats');
const tutoringRoutes = require('./routes/tutoring');
const multimodalRoutes = require('./routes/multimodal');
const ageModeRoutes = require('./routes/ageModes');
const safetyRoutes = require('./routes/safety');
const earlyLearnerRoutes = require('./routes/earlyLearners');
const elemSecRoutes = require('./routes/elementarySecondary');

const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recapify';

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General API rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Recapify API Gateway',
    timestamp: new Date().toISOString(),
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Mount Routes
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);
app.use('/decks', deckRoutes);
app.use('/reviews', reviewRoutes);
app.use('/quizzes', quizRoutes);
app.use('/stats', statsRoutes);
app.use('/tutoring', tutoringRoutes);
app.use('/multimodal', multimodalRoutes);
app.use('/age-modes', ageModeRoutes);
app.use('/safety', safetyRoutes);
app.use('/early-learners', earlyLearnerRoutes);
app.use('/elem-sec', elemSecRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server and Database Connection
async function startServer() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('✅ Connected to MongoDB Atlas/Database successfully.');
  } catch (err) {
    console.warn(`⚠️ MongoDB connection warning: ${err.message}`);
    console.warn('ℹ️ Please ensure MongoDB is running locally or specify a valid MONGO_URI in server/.env');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Recapify API Server running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
  });
}

startServer();

module.exports = app;
