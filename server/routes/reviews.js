const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const Deck = require('../models/Deck');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { calculateSM2 } = require('../services/sm2');

// GET /reviews/today - Get cards due for review today
router.get('/today', authMiddleware, async (req, res, next) => {
  try {
    // Find all decks belonging to this user
    const userDecks = await Deck.find({ userId: req.user.userId }, '_id');
    const deckIds = userDecks.map(d => d._id);

    // Cards where nextReviewDate <= end of today
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueCards = await Card.find({
      deckId: { $in: deckIds },
      nextReviewDate: { $lte: endOfToday },
    }).populate('deckId', 'title');

    res.json({
      count: dueCards.length,
      cards: dueCards,
    });
  } catch (err) {
    next(err);
  }
});

// POST /reviews/:cardId - Submit user recall rating (0 to 5)
router.post('/:cardId', authMiddleware, async (req, res, next) => {
  try {
    const { rating } = req.body;
    const { cardId } = req.params;

    if (rating === undefined || rating === null) {
      return res.status(400).json({ error: 'Rating (0-5) is required.' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    // Verify ownership of the card's deck
    const deck = await Deck.findOne({ _id: card.deckId, userId: req.user.userId });
    if (!deck) {
      return res.status(403).json({ error: 'Unauthorized to review this card.' });
    }

    // Calculate next SM-2 interval
    const sm2Result = calculateSM2({
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
      intervalDays: card.intervalDays,
      rating: Number(rating),
    });

    card.easeFactor = sm2Result.easeFactor;
    card.repetitions = sm2Result.repetitions;
    card.intervalDays = sm2Result.intervalDays;
    card.nextReviewDate = sm2Result.nextReviewDate;

    await card.save();

    // Update user streak if applicable
    const user = await User.findById(req.user.userId);
    if (user) {
      const now = new Date();
      const lastStudied = user.lastStudiedAt ? new Date(user.lastStudiedAt) : null;
      
      if (!lastStudied) {
        user.streak = 1;
        user.lastStudiedAt = now;
      } else {
        const msPerDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.floor((now.setHours(0,0,0,0) - new Date(lastStudied).setHours(0,0,0,0)) / msPerDay);
        
        if (diffDays === 1) {
          user.streak += 1;
          user.lastStudiedAt = new Date();
        } else if (diffDays > 1) {
          user.streak = 1;
          user.lastStudiedAt = new Date();
        } else if (diffDays === 0) {
          // Studied again today, streak stays maintained
          user.lastStudiedAt = new Date();
        }
      }
      await user.save();
    }

    res.json({
      message: 'Card schedule updated successfully.',
      card: {
        id: card._id,
        easeFactor: card.easeFactor,
        repetitions: card.repetitions,
        intervalDays: card.intervalDays,
        nextReviewDate: card.nextReviewDate,
      },
      userStreak: user ? user.streak : 1,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
