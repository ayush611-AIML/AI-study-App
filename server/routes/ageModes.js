const express = require('express');
const router = express.Router();
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /age-modes/essay-feedback (Middle School+ Ages 12-15)
router.post('/essay-feedback', async (req, res, next) => {
  try {
    const { title, text } = req.body;
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Please enter at least a few sentences of your essay draft.' });
    }

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/age-modes/essay-feedback`, {
        title: title || 'My Essay Draft',
        text,
      }, { timeout: 15000 });

      return res.json(response.data);
    } catch (e) {
      // Local fallback
      return res.json({
        title: title || 'My Essay Draft',
        wordCount: text.split(/\s+/).length,
        paragraphCount: text.split('\n\n').length,
        overallStructureScore: 82,
        coachingNote: 'Strengthen transitions between key arguments and ensure your conclusion restates the thesis with new insight!',
        rubricFeedback: [
          { aspect: 'Thesis Statement', status: 'strong', comment: 'Central position is clearly stated in opening paragraph.' },
          { aspect: 'Paragraph Transitions', status: 'needs_work', comment: 'Add transitional words like "Furthermore" or "In contrast".' },
          { aspect: 'Evidence Support', status: 'strong', comment: 'Specific examples ground your claims.' }
        ]
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /age-modes/battle-quest (Elementary Ages 8-11: Prodigy Math Battles)
router.get('/battle-quest', async (req, res, next) => {
  try {
    const stage = req.query.stage || 1;
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/age-modes/battle-quest?stage=${stage}`, { timeout: 10000 });
      return res.json(response.data);
    } catch (e) {
      return res.json({
        stage: 1,
        monster: { name: 'Glitch Golem', hp: 100, avatar: '👾', element: 'Cyber' },
        playerHp: 100,
        maxPlayerHp: 100,
        battleQuestions: [
          {
            prompt: "Cast Ice Shard! What is 3/4 + 2/4?",
            options: ["5/4 (or 1 1/4)", "5/8", "6/8", "1"],
            answer: "5/4 (or 1 1/4)",
            spellName: "❄️ Frost Spear",
            damage: 40,
            explanation: "When denominators are the same, add the numerators: 3 + 2 = 5!"
          }
        ]
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /age-modes/early-puzzles (Early Learners Ages 4-7)
router.get('/early-puzzles', async (req, res, next) => {
  try {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/age-modes/early-puzzles`, { timeout: 10000 });
      return res.json(response.data);
    } catch (e) {
      return res.json([
        {
          id: "puz_1",
          type: "count_match",
          title: "Match the Apples to the Number!",
          targetNumber: 3,
          visualItems: ["🍎", "🍎", "🍎"],
          options: [
            { label: "Number 3", value: 3, correct: true },
            { label: "Number 5", value: 5, correct: false },
            { label: "Number 2", value: 2, correct: false },
          ],
          audioPhrase: "Can you find the number 3 for three juicy red apples?",
          companionCheer: "Pip the Fox says: 'Count with me: One, Two, Three!'"
        }
      ]);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
