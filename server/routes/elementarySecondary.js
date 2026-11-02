const express = require('express');
const router = express.Router();
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// -------------------------------------------------------------
// Elementary School (Ages 6-11): Synthesis Tutor & Prodigy RPG
// -------------------------------------------------------------
router.get('/synthesis/intuition', async (req, res, next) => {
  try {
    const conceptId = req.query.conceptId || '';
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/synthesis/intuition?conceptId=${conceptId}`, { timeout: 10000 });
      return res.json(response.data);
    } catch (e) {
      return res.json({
        id: "fractions_number_line",
        concept: "Equivalent Fractions & Number Lines",
        level: "Grade 3-4 (Ages 8-10)",
        tutorSpokenDialogue: "Welcome! Today we aren't just memorizing formulas—we're seeing math! Two hops of 1/4 land halfway at 2/4, which is 1/2!",
        visualType: "number_line",
        numberLineData: {
          start: 0,
          end: 1,
          tickStep: 0.25,
          targetPoint: 0.5,
          labels: [
            { pos: 0, label: "0" },
            { pos: 0.25, label: "1/4" },
            { pos: 0.5, label: "2/4 (1/2)" },
            { pos: 0.75, label: "3/4" },
            { pos: 1.0, label: "1 Whole" }
          ],
          hops: [
            { from: 0, to: 0.25, color: "#38BDF8", label: "+1/4" },
            { from: 0.25, to: 0.5, color: "#10B981", label: "+1/4" }
          ]
        },
        intuitiveQuestion: "How many 1/4 hops does it take to reach 1 Whole?",
        options: ["2 hops", "4 hops", "8 hops", "1 hop"],
        answer: "4 hops",
        explanation: "Four 1/4 segments combine to make 4/4 = 1 complete whole!"
      });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/prodigy/battle', async (req, res, next) => {
  try {
    const playerLevel = req.query.playerLevel || 1;
    const currentPet = req.query.currentPet || 'Flame Fox';
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/prodigy/battle?playerLevel=${playerLevel}&currentPet=${encodeURIComponent(currentPet)}`, { timeout: 10000 });
      return res.json(response.data);
    } catch (e) {
      return res.json({
        playerLevel: Number(playerLevel),
        selectedPet: currentPet,
        petBonus: "+15% Focus Shield",
        monster: { name: "Glitch Golem", avatar: "👾", hp: 100, maxHp: 100, weakness: "Fractions" },
        spells: [
          {
            spellName: "❄️ Frost Spear",
            element: "Ice",
            damage: 45,
            prompt: "Cast Frost Spear! Find the common denominator for 1/3 + 1/4:",
            options: ["12", "7", "24", "6"],
            answer: "12",
            explanation: "The least common multiple of 3 and 4 is 3 × 4 = 12!"
          }
        ],
        backgroundPlacementDiagnostic: {
          cognitiveStatus: "On-Track for Grade 5 Standards",
          nextLevelUnlockedAt: 3,
          dynamicDifficulty: "Normal - Adapting real-time"
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// Secondary School (Ages 9-18): Khanmigo Socratic & Photomath
// -------------------------------------------------------------
router.post('/khanmigo/socratic-query', async (req, res, next) => {
  try {
    const { problem, studentThought } = req.body;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/khanmigo/socratic-query`, {
        problem: problem || '',
        studentThought: studentThought || ''
      }, { timeout: 15000 });
      return res.json(response.data);
    } catch (e) {
      return res.json({
        mode: "guided_inquiry",
        problem: problem || "Equation",
        tutorReply: `Let's look at this step-by-step: In '${problem}', what operation can we do to isolate the variable first?`,
        leadingHint: "Think of an equation like a balanced scale: whatever you do to one side, you must do to the other!",
        reflectionPrompt: "Try writing out the next line of working, and I'll verify if your logic holds true!"
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/khanmigo/historical-chat', async (req, res, next) => {
  try {
    const { figure, query } = req.body;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/khanmigo/historical-chat`, {
        figure: figure || 'einstein',
        query: query || ''
      }, { timeout: 15000 });
      return res.json(response.data);
    } catch (e) {
      return res.json({
        figure: { name: "Albert Einstein", avatar: "👴", tagline: "Theoretical Physicist (1879–1955)" },
        userQuery: query,
        roleplayResponse: "Albert Einstein strokes his mustache: 'Curious questions are the seeds of discovery! How can we explore this together?'"
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/photomath/breakdown', async (req, res, next) => {
  try {
    const { equation } = req.body;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/photomath/breakdown`, {
        equation: equation || '3x + 5 = 20'
      }, { timeout: 15000 });
      return res.json(response.data);
    } catch (e) {
      return res.json({
        originalEquation: equation || "3x + 5 = 20",
        curriculumStandard: "Common Core Grade 7/8: Linear Equations (CCSS.MATH.CONTENT.7.EE.B.4)",
        solution: "x = 5",
        sequentialSteps: [
          {
            stepNumber: 1,
            expression: "3x + 5 - 5 = 20 - 5",
            simplified: "3x = 15",
            ruleApplied: "Subtraction Property of Equality",
            explanation: "Subtract 5 from both sides to isolate the variable term '3x'."
          },
          {
            stepNumber: 2,
            expression: "(3x) / 3 = 15 / 3",
            simplified: "x = 5",
            ruleApplied: "Division Property of Equality",
            explanation: "Divide both sides by 3 to solve for a single 'x'."
          }
        ],
        animatedTip: "Notice how balancing both sides keeps the equation true, like maintaining level balance scales!"
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
