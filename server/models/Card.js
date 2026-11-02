const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  explanation: {
    type: String,
    default: '',
  },
  easeFactor: {
    type: Number,
    default: 2.5,
  },
  repetitions: {
    type: Number,
    default: 0,
  },
  intervalDays: {
    type: Number,
    default: 0,
  },
  nextReviewDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Card', cardSchema);
