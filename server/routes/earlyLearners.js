const express = require('express');
const router = express.Router();
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// GET /early-learners/storybooks (Ello-Style Read-Along Books Catalog)
router.get('/storybooks', async (req, res, next) => {
  try {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/early-learners/storybooks`, { timeout: 10000 });
      return res.json(response.data);
    } catch (e) {
      // Local fallback
      return res.json([
        {
          id: 'story_bunny',
          title: 'The Brave Little Bunny',
          readingLevel: 'Grade 1 (Ages 5-7)',
          coverEmoji: '🐰',
          pages: [
            {
              pageNumber: 1,
              text: 'The little bunny hops across the sunny green meadow.',
              words: [
                { word: 'The', syllables: ['The'], phonics: '/ðə/' },
                { word: 'little', syllables: ['lit', 'tle'], phonics: '/ˈlɪt.əl/' },
                { word: 'bunny', syllables: ['bun', 'ny'], phonics: '/ˈbʌn.i/' },
                { word: 'hops', syllables: ['hops'], phonics: '/hɒps/' },
                { word: 'across', syllables: ['a', 'cross'], phonics: '/əˈkrɒs/' },
                { word: 'the', syllables: ['the'], phonics: '/ðə/' },
                { word: 'sunny', syllables: ['sun', 'ny'], phonics: '/ˈsʌn.i/' },
                { word: 'green', syllables: ['green'], phonics: '/ɡriːn/' },
                { word: 'meadow', syllables: ['mead', 'ow'], phonics: '/ˈmɛd.oʊ/' }
              ],
              illustration: '🌸 🐰 🌼 🌿 ☀️'
            }
          ]
        }
      ]);
    }
  } catch (err) {
    next(err);
  }
});

// POST /early-learners/coach-word (Ello-Style Syllable-by-Syllable Phonics Listener)
router.post('/coach-word', async (req, res, next) => {
  try {
    const { targetWord, spokenWord } = req.body;
    if (!targetWord) {
      return res.status(400).json({ error: 'targetWord is required.' });
    }

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/early-learners/coach-word`, {
        targetWord,
        spokenWord: spokenWord || ''
      }, { timeout: 10000 });
      return res.json(response.data);
    } catch (e) {
      const target = (targetWord || '').toLowerCase().trim();
      const spoken = (spokenWord || '').toLowerCase().trim();
      const match = target === spoken;
      const syllables = target === 'bunny' ? ['bun', 'ny'] : target === 'little' ? ['lit', 'tle'] : [target];
      return res.json({
        status: match ? 'correct' : 'coaching',
        targetWord,
        spokenWord,
        avatarCheer: match
          ? `🌟 Pip the Fox cheers: 'Spot on! You read "${targetWord}" wonderfully!'`
          : `🦊 Pip gently whispers: 'Let's sound it out together! ${syllables.join(' • ')}'`,
        syllables,
        syllableDisplay: syllables.join(' • '),
        needsCoaching: !match
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /early-learners/duolingo-abc-session (Duolingo ABC Adaptive Phonics & Sight Words Engine)
router.get('/duolingo-abc-session', async (req, res, next) => {
  try {
    const strugglingVowels = req.query.strugglingVowels || 'short_a,short_o';
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/early-learners/duolingo-abc-session?strugglingVowels=${encodeURIComponent(strugglingVowels)}`,
        { timeout: 10000 }
      );
      return res.json(response.data);
    } catch (e) {
      return res.json({
        sessionTitle: '5-Minute Phonics & Sight Words: Short /a/ sound',
        targetPhoneme: {
          id: 'short_a',
          name: 'Short /a/ sound',
          symbol: '/æ/',
          sampleWords: ['cat', 'hat', 'apple', 'bag', 'jam'],
          audioPrompt: "Short 'a' says /æ/ as in cat!",
          exampleSentence: 'The fat cat sat on the mat.'
        },
        tactileTracing: {
          type: 'tactile_tracing',
          letter: 'A',
          lowercase: 'a',
          soundPrompt: "Trace the letter A! It makes the sound /æ/",
          strokeSteps: ['1. Start at star ⭐', '2. Slide down left ↙️', '3. Slide down right ↘️', '4. Bridge middle ➡️']
        },
        vowelPuzzle: {
          type: 'vowel_builder',
          wordPattern: 'C _ T',
          fullWord: 'cat',
          correctVowel: 'A',
          vowelOptions: ['A', 'E', 'I', 'U'],
          prompt: "Find the missing vowel sound /æ/ to build 'CAT'!"
        },
        sightWordGame: {
          type: 'sight_word_pop',
          targetWord: 'play',
          options: [
            { word: 'play', correct: true, balloonColor: '#38BDF8' },
            { word: 'help', correct: false, balloonColor: '#EC4899' },
            { word: 'jump', correct: false, balloonColor: '#10B981' },
            { word: 'look', correct: false, balloonColor: '#F59E0B' }
          ],
          prompt: "Pop the balloon with the sight word 'PLAY'!"
        },
        pedagogicalPacingNote: 'Quiet Adaptive Pacing: Prioritizing Short /a/ sound based on subtle hesitation in previous sessions.'
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
