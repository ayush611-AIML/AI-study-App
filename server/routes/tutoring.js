const express = require('express');
const router = express.Router();
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /tutoring/analogy - Concept Re-explanation via interest analogy
router.post('/analogy', async (req, res, next) => {
  try {
    const { concept, context, interest = 'minecraft' } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Concept name is required.' });
    }

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/explain-analogy`, {
        concept,
        context: context || '',
        interest: interest.toLowerCase(),
      }, { timeout: 15000 });

      return res.json(response.data);
    } catch (e) {
      // Local fallback analogy if AI service is offline
      const fallbackAnalogy = `🎮 Imagine ${concept} in ${interest}: It works like a specialized system where every component has an important mission. ${context ? context.slice(0, 150) : ''}`;
      return res.json({
        concept,
        interest,
        analogy: fallbackAnalogy,
        source: 'local_fallback',
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /tutoring/hint - Socratic AI Tutoring with Hint-First Guardrails
router.post('/hint', async (req, res, next) => {
  try {
    const { question, correctAnswer, explanation, hintLevel = 1, studentAttempt } = req.body;

    if (!question || !correctAnswer) {
      return res.status(400).json({ error: 'Question and correctAnswer are required.' });
    }

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/socratic-hint`, {
        question,
        correctAnswer,
        explanation: explanation || '',
        hintLevel: Number(hintLevel) || 1,
        studentAttempt,
      }, { timeout: 15000 });

      return res.json(response.data);
    } catch (e) {
      // Built-in fallback Socratic hints
      let hint = "💡 Focus on the core mechanism: which word in the choices is directly responsible?";
      if (hintLevel === 2) {
        hint = `🔍 Clue: Recall that ${explanation || 'the concept'} performs this key function.`;
      } else if (hintLevel >= 3) {
        hint = `🎯 Almost there! Look for the answer starting with '${correctAnswer[0]}'.`;
      }

      return res.json({
        hintLevel,
        hint,
        type: 'guided_question',
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /tutoring/adaptive-eval - Dynamic Difficulty Adjustment (ZPD)
router.post('/adaptive-eval', (req, res) => {
  const { responseTimeMs, isCorrect, hesitationCount = 0, currentTier = 'core' } = req.body;

  // Criteria:
  // - Fast & Correct (< 4.5s, no hesitation) -> Step up to 'advanced'
  // - Struggling or slow (> 12s, or incorrect, or hesitated > 2 times) -> Step back to 'foundational' with visual representations
  // - Balanced (4.5s - 12s and correct) -> Maintain 'core'
  let nextTier = currentTier;
  let pedagogicalAdvice = '';
  let showVisualScaffolding = false;

  if (isCorrect) {
    if (responseTimeMs < 4500 && hesitationCount === 0) {
      nextTier = currentTier === 'foundational' ? 'core' : 'advanced';
      pedagogicalAdvice = '🚀 Excellent fluency! Advancing you into higher-order challenge questions.';
    } else {
      nextTier = currentTier === 'foundational' ? 'core' : currentTier;
      pedagogicalAdvice = '✅ Solid comprehension. Keeping you in your optimal Zone of Proximal Development.';
    }
  } else {
    // Incorrect or high hesitation
    nextTier = 'foundational';
    showVisualScaffolding = true;
    pedagogicalAdvice = '🎨 Stepping back to visual concept breakdowns to prevent frustration and build intuition.';
  }

  res.json({
    currentTier,
    nextTier,
    showVisualScaffolding,
    pedagogicalAdvice,
    responseLatencySeconds: Math.round((responseTimeMs / 1000) * 10) / 10,
  });
});

module.exports = router;
