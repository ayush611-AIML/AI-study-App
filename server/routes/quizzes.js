const express = require('express');
const router = express.Router();
const QuizAttempt = require('../models/QuizAttempt');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// POST /quizzes/:deckId/attempt - Submit quiz answers and calculate results
router.post('/:deckId/attempt', authMiddleware, async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const { answers } = req.body; // array of { cardId, selectedOption }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be provided as an array.' });
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    const cards = await Card.find({ deckId });
    const cardMap = new Map(cards.map(c => [c._id.toString(), c]));

    let score = 0;
    const processedAnswers = [];

    answers.forEach((ans) => {
      const card = cardMap.get(ans.cardId?.toString());
      if (card) {
        const isCorrect = card.answer.trim().toLowerCase() === (ans.selectedOption || '').trim().toLowerCase();
        if (isCorrect) {
          score += 1;
        }
        processedAnswers.push({
          cardId: card._id,
          question: card.question,
          selectedOption: ans.selectedOption,
          correctOption: card.answer,
          explanation: card.explanation,
          isCorrect,
        });
      }
    });

    const quizAttempt = new QuizAttempt({
      userId: req.user.userId,
      deckId: deck._id,
      score,
      total: processedAnswers.length,
      answers: processedAnswers,
      takenAt: new Date(),
    });

    await quizAttempt.save();

    // Update user streak if quiz was completed
    await User.findByIdAndUpdate(req.user.userId, {
      lastStudiedAt: new Date(),
    });

    res.json({
      attemptId: quizAttempt._id,
      deckId: deck._id,
      score,
      total: processedAnswers.length,
      percentage: processedAnswers.length > 0 ? Math.round((score / processedAnswers.length) * 100) : 0,
      breakdown: processedAnswers,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
