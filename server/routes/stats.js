const express = require('express');
const router = express.Router();
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const Card = require('../models/Card');
const Deck = require('../models/Deck');
const { authMiddleware } = require('../middleware/auth');

// GET /stats - Streaks, weak topics, and quiz score history
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    const userId = req.user.userId;

    // Recent Quiz attempts
    const attempts = await QuizAttempt.find({ userId })
      .sort({ takenAt: -1 })
      .limit(10)
      .populate('deckId', 'title');

    const scoreHistory = attempts.map(a => ({
      id: a._id,
      deckTitle: a.deckId?.title || 'Study Deck',
      score: a.score,
      total: a.total,
      percentage: a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
      takenAt: a.takenAt,
    }));

    // Find weak topics: cards with easeFactor < 2.0 or low quiz accuracy
    const userDecks = await Deck.find({ userId });
    const deckIds = userDecks.map(d => d._id);

    const weakCards = await Card.find({
      deckId: { $in: deckIds },
      easeFactor: { $lt: 2.1 },
    })
      .sort({ easeFactor: 1 })
      .limit(8)
      .populate('deckId', 'title');

    const weakTopics = weakCards.map(c => ({
      cardId: c._id,
      topic: c.deckId?.title || 'General',
      question: c.question,
      easeFactor: c.easeFactor,
      repetitions: c.repetitions,
    }));

    // Total stats
    const totalDecks = userDecks.length;
    const totalCards = await Card.countDocuments({ deckId: { $in: deckIds } });

    res.json({
      user: {
        name: user?.name,
        streak: user?.streak || 0,
        lastStudiedAt: user?.lastStudiedAt,
      },
      summary: {
        totalDecks,
        totalCards,
        totalQuizzesTaken: attempts.length,
      },
      scoreHistory,
      weakTopics,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
