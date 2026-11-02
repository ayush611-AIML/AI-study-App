const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const Note = require('../models/Note');
const { authMiddleware } = require('../middleware/auth');
const { generationLimiter } = require('../middleware/rateLimit');
const { generateDeck } = require('../services/aiClient');

// POST /decks/generate - Generate summary, flashcards & quiz from note
router.post('/generate', authMiddleware, generationLimiter, async (req, res, next) => {
  try {
    const { noteId, maxCards = 15 } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: 'noteId is required to generate a deck.' });
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found or unauthorized.' });
    }

    // Call AI Service
    const aiResult = await generateDeck({
      text: note.extractedText,
      title: note.title,
      maxCards: Number(maxCards) || 15,
    });

    // Save Deck
    const deck = new Deck({
      userId: req.user.userId,
      noteId: note._id,
      title: note.title,
      summary: aiResult.summary,
      keyTerms: aiResult.keyTerms || [],
      cardCount: aiResult.cards?.length || 0,
      createdAt: new Date(),
    });

    await deck.save();

    // Save Cards
    const cardDocs = (aiResult.cards || []).map((c) => ({
      deckId: deck._id,
      question: c.question,
      answer: c.answer,
      options: c.options || [c.answer],
      explanation: c.explanation || '',
      easeFactor: 2.5,
      repetitions: 0,
      intervalDays: 0,
      nextReviewDate: new Date(), // Due immediately
    }));

    const insertedCards = await Card.insertMany(cardDocs);

    res.status(201).json({
      deckId: deck._id,
      title: deck.title,
      summary: deck.summary,
      keyTerms: deck.keyTerms,
      cardCount: insertedCards.length,
      cards: insertedCards,
    });
  } catch (err) {
    next(err);
  }
});

// GET /decks - list all decks for current user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const decks = await Deck.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (err) {
    next(err);
  }
});

// GET /decks/:id - get deck details with cards
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    const cards = await Card.find({ deckId: deck._id });

    res.json({
      deck,
      cards,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /decks/:id
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const deck = await Deck.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }
    await Card.deleteMany({ deckId: deck._id });
    res.json({ message: 'Deck and associated cards deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
