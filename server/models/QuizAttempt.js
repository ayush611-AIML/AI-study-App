const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  answers: [{
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
    question: String,
    selectedOption: String,
    correctOption: String,
    isCorrect: Boolean,
  }],
  takenAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
