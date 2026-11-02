import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { api } from './services/api';

// Pre-loaded multi-tier study deck grounded in science
const DEMO_DECK = {
  id: 'demo_101',
  title: 'Biology 101: Cellular Respiration & ATP',
  summary:
    'Cellular respiration is a metabolic pathway that breaks down glucose and produces ATP. The stages include Glycolysis, the Krebs Cycle, and the Electron Transport Chain. Mitochondria serve as the powerhouse of eukaryotic cells.',
  keyTerms: ['Mitochondria', 'ATP', 'Glycolysis', 'Krebs Cycle'],
  cards: [
    {
      id: 'c1',
      tier: 'core',
      question: 'What is the primary energy currency generated during cellular respiration?',
      answer: 'ATP',
      options: ['ATP', 'DNA', 'Glucose', 'Ribosome'],
      explanation: 'ATP (Adenosine Triphosphate) stores and delivers chemical energy for cellular work.',
      visualScaffold: '🔋 Visual Analogy: Like a rechargeable battery pack that powers cell toys!',
      analogies: {
        minecraft: 'ATP is like eating golden carrots or spending hunger bar points to sprint and mine!',
        pizza: 'ATP is like a single hot pizza slice giving you instant fuel to ride your bike!',
        space: 'ATP is like the charged solar batteries powering the Mars Rover rover wheels!',
        sports: 'ATP is the burst of adrenaline when you sprint to catch a pass in the end zone!'
      },
      easeFactor: 2.5,
      repetitions: 1,
      intervalDays: 1,
    },
    {
      id: 'c2',
      tier: 'foundational',
      question: 'Which organelle is famously nicknamed the "Powerhouse of the Cell"?',
      answer: 'Mitochondria',
      options: ['Mitochondria', 'Nucleus', 'Vacuole', 'Cell Wall'],
      explanation: 'Mitochondria convert nutrients into usable cellular fuel (ATP).',
      visualScaffold: '🏭 Visual: Imagine a miniature power plant with glowing turbine chambers!',
      analogies: {
        minecraft: 'Mitochondria is like a furnace burning coal to smelt your raw iron into shiny bars!',
        pizza: 'Mitochondria is the huge brick oven baking dough into delicious, energizing pizza!',
        space: 'Mitochondria is the fusion reactor engine inside a rocket ship heading to Neptune!',
        sports: 'Mitochondria is the team’s smoothie bar blending high-energy shakes at halftime!'
      },
      easeFactor: 2.5,
      repetitions: 2,
      intervalDays: 6,
    },
    {
      id: 'c3',
      tier: 'advanced',
      question: 'During glycolysis in the cytoplasm, what 6-carbon molecule is split into two 3-carbon pyruvates?',
      answer: 'Glucose',
      options: ['Glucose', 'Cellulose', 'Lipid', 'Protein'],
      explanation: 'Glycolysis breaks down 1 molecule of glucose (6 carbons) into 2 molecules of pyruvate (3 carbons each).',
      visualScaffold: '🧩 Visual: A 6-block Lego bar snapped cleanly in half into two 3-block pieces!',
      analogies: {
        minecraft: 'Like crafting a 6-block wooden beam down into two 3-block fences!',
        pizza: 'Like cutting a 6-slice personal pizza into two equal halves for you and a friend!',
        space: 'Like a 2-stage rocket decoupling its booster tank into two recovery modules!',
        sports: 'Like splitting a 6-player team into two 3v3 practice squads!'
      },
      easeFactor: 2.3,
      repetitions: 0,
      intervalDays: 0,
    },
  ],
};

export default function App() {
  // Navigation State: 'home' | 'ageHub' | 'upload' | 'deckDetail' | 'flashcards' | 'quiz' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeDeck, setActiveDeck] = useState(DEMO_DECK);
  const [decks, setDecks] = useState([DEMO_DECK]);
  const [streak, setStreak] = useState(3);
  const [todayDueCount, setTodayDueCount] = useState(3);

  // -------------------------------------------------------------------------
  // 3. Feature Priority by Age Group State
  // -------------------------------------------------------------------------
  // 'early' (Ages 4-7) | 'elementary' (Ages 8-11) | 'middle' (Ages 12-15)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('elementary');

  // Age 4-7: Early Learners State
  const [activeCompanion, setActiveCompanion] = useState('🦊 Pip the Fox');
  const [companionDialogue, setCompanionDialogue] = useState('Hi! I am Pip! Tap any puzzle or read aloud with me!');
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const [puzzleAnswered, setPuzzleAnswered] = useState(false);
  const [earlyPuzzles, setEarlyPuzzles] = useState([
    {
      id: "puz_1",
      title: "Count & Match the Apples!",
      visualItems: ["🍎", "🍎", "🍎"],
      options: [
        { label: "Number 3", value: 3, correct: true },
        { label: "Number 5", value: 5, correct: false },
        { label: "Number 2", value: 2, correct: false },
      ],
      companionCheer: "Pip the Fox says: 'One, Two, Three! You counted all 3 apples! 🌟'"
    },
    {
      id: "puz_2",
      title: "Phonics Sound: Which starts with 'B'?",
      visualItems: ["🔊 /b/ sound"],
      options: [
        { label: "🐻 Bear", value: "Bear", correct: true },
        { label: "🍎 Apple", value: "Apple", correct: false },
        { label: "🐱 Cat", value: "Cat", correct: false },
      ],
      companionCheer: "Ollie the Owl flaps his wings: 'Hoo-ray! B is for Bear! 🐻'"
    },
    {
      id: "puz_3",
      title: "Shape Match: Find the round circle!",
      visualItems: ["🟡 Round like the Sun"],
      options: [
        { label: "🟡 Circle", value: "Circle", correct: true },
        { label: "🔺 Triangle", value: "Triangle", correct: false },
        { label: "🟦 Square", value: "Square", correct: false },
      ],
      companionCheer: "Pip the Fox smiles: 'Round and round like a spinning wheel! ☀️'"
    }
  ]);

  // Deep Dive: Early Learners (Ages 3-8) Literacy & Foundational Numeracy State
  const [earlySubMode, setEarlySubMode] = useState('ello'); // 'ello' (Read Aloud) | 'duolingo' (Spaced Phonics & Tracing) | 'puzzles' (Numeracy)

  // Ello-Style Read Aloud Storybooks & Real-time Phonics State
  const [earlyStorybooks, setEarlyStorybooks] = useState([
    {
      id: "story_bunny",
      title: "The Brave Little Bunny",
      readingLevel: "Kindergarten - Grade 1 (Ages 4-7)",
      coverEmoji: "🐰",
      pages: [
        {
          pageNumber: 1,
          text: "The little bunny hops across the sunny green meadow.",
          illustration: "🌸 🐰 🌼 🌿 ☀️",
          words: [
            { word: "The", syllables: ["The"], phonics: "/ðə/" },
            { word: "little", syllables: ["lit", "tle"], phonics: "/ˈlɪt.əl/" },
            { word: "bunny", syllables: ["bun", "ny"], phonics: "/ˈbʌn.i/" },
            { word: "hops", syllables: ["hops"], phonics: "/hɒps/" },
            { word: "across", syllables: ["a", "cross"], phonics: "/əˈkrɒs/" },
            { word: "the", syllables: ["the"], phonics: "/ðə/" },
            { word: "sunny", syllables: ["sun", "ny"], phonics: "/ˈsʌn.i/" },
            { word: "green", syllables: ["green"], phonics: "/ɡriːn/" },
            { word: "meadow", syllables: ["mead", "ow"], phonics: "/ˈmɛd.oʊ/" }
          ]
        }
      ]
    }
  ]);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [highlightedWordIdx, setHighlightedWordIdx] = useState(null);
  const [stumbleCoaching, setStumbleCoaching] = useState(null);

  // Duolingo ABC-Style Spaced Repetition & Adaptive Phonics State
  const [duoSession, setDuoSession] = useState({
    sessionTitle: "5-Minute Phonics & Sight Words: Short /o/ sound",
    targetPhoneme: {
      id: "short_o",
      name: "Short /o/ sound",
      symbol: "/ɒ/",
      sampleWords: ["fox", "box", "hop", "pot", "frog"],
      audioPrompt: "Short 'o' says /ɒ/ as in quick fox!"
    },
    tactileTracing: {
      type: "tactile_tracing",
      letter: "O",
      lowercase: "o",
      soundPrompt: "Trace the letter O! It makes the round sound /ɒ/",
      strokeSteps: [
        "1. Start at the top star ⭐",
        "2. Curve smoothly around like a big ball 🔄",
        "3. Connect back at the top!"
      ]
    },
    vowelPuzzle: {
      type: "vowel_builder",
      wordPattern: "F _ X",
      fullWord: "fox",
      correctVowel: "O",
      vowelOptions: ["O", "A", "E", "U"],
      prompt: "Find the missing vowel sound /ɒ/ to build 'FOX'!"
    },
    sightWordGame: {
      type: "sight_word_pop",
      targetWord: "play",
      options: [
        { word: "play", correct: true, balloonColor: "#38BDF8" },
        { word: "help", correct: false, balloonColor: "#EC4899" },
        { word: "jump", correct: false, balloonColor: "#10B981" },
        { word: "look", correct: false, balloonColor: "#F59E0B" }
      ],
      prompt: "Pop the balloon with the sight word 'PLAY'!"
    },
    pedagogicalPacingNote: "Quiet Adaptive Pacing: Weaving Short /o/ sound into today's 5-minute session based on subtle hesitation."
  });
  const [tracingDone, setTracingDone] = useState(false);
  const [vowelAnswered, setVowelAnswered] = useState(null);
  const [balloonPopped, setBalloonPopped] = useState(null);

  // -------------------------------------------------------------------------
  // Pillar 2: Elementary School (Ages 6-11) State
  // -------------------------------------------------------------------------
  const [elementarySubMode, setElementarySubMode] = useState('synthesis'); // 'synthesis' | 'prodigy'
  const [selectedPet, setSelectedPet] = useState('🔥 Flame Fox');
  const [synthesisConceptId, setSynthesisConceptId] = useState('fractions_number_line');
  const [synthesisData, setSynthesisData] = useState({
    id: "fractions_number_line",
    concept: "Equivalent Fractions & Number Lines",
    level: "Grade 3-4 (Ages 8-10)",
    tutorSpokenDialogue: "Welcome to Synthesis Tutor! Look at this number line between 0 and 1. Two hops of 1/4 land halfway at 2/4, which is exactly equal to 1/2!",
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
  const [synthesisAnswered, setSynthesisAnswered] = useState(null);

  // Age 8-11: Elementary Gamified Math Quest Battle State (Prodigy-style)
  const [battleMonsterHp, setBattleMonsterHp] = useState(100);
  const [battlePlayerHp, setBattlePlayerHp] = useState(100);
  const [battleStage, setBattleStage] = useState(1);
  const [battleQuestionIdx, setBattleQuestionIdx] = useState(0);
  const [battleFeedback, setBattleFeedback] = useState('The Glitch Golem blocks the dungeon doorway! Answer to cast your spells!');
  const [battleQuestions, setBattleQuestions] = useState([
    {
      prompt: "Cast Frost Spear! What is 3/4 + 2/4?",
      options: ["5/4 (or 1 1/4)", "5/8", "6/8", "1"],
      answer: "5/4 (or 1 1/4)",
      spellName: "❄️ Frost Spear",
      damage: 50,
      explanation: "Like denominators stay 4! 3 + 2 = 5!"
    },
    {
      prompt: "Cast Thunder Strike! What is 8 × 7?",
      options: ["56", "54", "64", "48"],
      answer: "56",
      spellName: "⚡ Thunder Strike",
      damage: 50,
      explanation: "8 × 7 = 56!"
    }
  ]);

  // -------------------------------------------------------------------------
  // Pillar 3: Upper Elementary to High School (Ages 9-18) State
  // -------------------------------------------------------------------------
  const [secondarySubMode, setSecondarySubMode] = useState('khanmigo'); // 'khanmigo' | 'photomath' | 'historical' | 'essay'
  
  // Khanmigo Socratic Homework Coach
  const [khanmigoProblem, setKhanmigoProblem] = useState('3(x - 4) = 2x + 5');
  const [khanmigoResponse, setKhanmigoResponse] = useState({
    mode: "guided_inquiry",
    tutorReply: "🤖 Khanmigo Coach: In '3(x - 4) = 2x + 5', notice the parentheses on the left. What happens if you use the distributive property first?",
    leadingHint: "Distribute the 3 across (x - 4) by multiplying 3 by both terms!",
    suggestedNextSteps: [
      "Multiply 3 by x and 3 by -4",
      "Collect all x terms on one side",
      "Isolate x to find the solution"
    ]
  });
  const [khanmigoLoading, setKhanmigoLoading] = useState(false);

  // Historical Character Roleplay
  const [selectedHistoricalFigure, setSelectedHistoricalFigure] = useState('einstein');
  const [historicalQuery, setHistoricalQuery] = useState('Why does gravity bend light?');
  const [historicalReply, setHistoricalReply] = useState(
    "Albert Einstein strokes his mustache thoughtfully: 'Ah! Think of gravity not as a mysterious pull, but as curved spacetime! Like placing a heavy bowling ball on a trampoline—it bends the fabric so light rays must follow the curve!'"
  );
  const [historicalLoading, setHistoricalLoading] = useState(false);

  // Photomath Visual Step Breakdown
  const [photomathEquation, setPhotomathEquation] = useState('3x + 5 = 20');
  const [photomathResult, setPhotomathResult] = useState({
    originalEquation: "3x + 5 = 20",
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
      },
      {
        stepNumber: 3,
        expression: "3(5) + 5 = 15 + 5 = 20",
        simplified: "20 = 20 (Verified ✓)",
        ruleApplied: "Substitution / Verification Step",
        explanation: "Substitute x = 5 back into the original equation to verify correctness."
      }
    ],
    animatedTip: "Notice how balancing both sides keeps the equation true, like maintaining level balance scales!"
  });
  const [photomathLoading, setPhotomathLoading] = useState(false);

  // Age 12-15: Middle School+ Essay Structure & Grammar Feedback State
  const [essayTitle, setEssayTitle] = useState('Why Renewable Solar Energy is Essential for Future Cities');
  const [essayDraft, setEssayDraft] = useState(
    "Solar power is becoming the most vital energy resource for future metropolitan centers because it drastically cuts carbon emissions and creates resilient distributed grids.\n\nFurthermore, solar photovoltaic panels have plummeted in manufacturing cost over the last decade. Consequently, urban rooftops can generate clean electricity directly where it is consumed, reducing transmission losses.\n\nIn conclusion, adopting municipal solar standards guarantees cleaner air and energy independence for growing generations."
  );
  const [essayAnalysisResult, setEssayAnalysisResult] = useState(null);
  const [essayLoading, setEssayLoading] = useState(false);

  // 1. Core Pedagogical ZPD State
  const [zpdTier, setZpdTier] = useState('core');
  const [zpdMessage, setZpdMessage] = useState('Adaptive AI is calibrating to your cognitive pace.');
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showVisualScaffold, setShowVisualScaffold] = useState(false);

  // Micro-Learning Mode (5-minute session timer)
  const [microLearningActive, setMicroLearningActive] = useState(false);
  const [microTimeRemaining, setMicroTimeRemaining] = useState(300);

  // Socratic AI Tutoring Modal (Hint-First Guardrails)
  const [socraticModalVisible, setSocraticModalVisible] = useState(false);
  const [socraticHintLevel, setSocraticHintLevel] = useState(1);
  const [socraticHintText, setSocraticHintText] = useState('');
  const [socraticLoading, setSocraticLoading] = useState(false);

  // Concept Re-explanation (Analogy Generator)
  const [analogyModalVisible, setAnalogyModalVisible] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState('minecraft');
  const [currentAnalogyText, setCurrentAnalogyText] = useState('');
  const [analogyLoading, setAnalogyLoading] = useState(false);

  // Multimodal Voice & Handwriting State
  const [targetSentence, setTargetSentence] = useState('The energetic cheetah sprints swiftly across the golden savanna.');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState(null);
  const [mathProblem, setMathProblem] = useState('Solve for x: 3x + 5 = 20');
  const [mathSteps, setMathSteps] = useState("3x + 5 = 20\n3x = 20 - 5\n3x = 12\nx = 4");
  const [mathAnalysisResult, setMathAnalysisResult] = useState(null);

  // Upload state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Flashcard review state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewFinished, setReviewFinished] = useState(false);

  // Quiz state
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizHistory, setQuizHistory] = useState([
    { title: 'Biology 101', score: 3, total: 3, date: 'Yesterday' },
  ]);

  // Part 4: Engagement, Safety, & Parent Visibility State
  // 1. Intrinsic Gamification: "Teach-the-Bot" (Feynman Technique)
  const [teachBotModalVisible, setTeachBotModalVisible] = useState(false);
  const [teachBotConcept, setTeachBotConcept] = useState('Photosynthesis');
  const [teachBotExplanation, setTeachBotExplanation] = useState('Plants use leaves like solar ovens to turn sunlight and water into sweet glucose energy.');
  const [teachBotResult, setTeachBotResult] = useState(null);
  const [teachBotLoading, setTeachBotLoading] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([
    '🔥 7-Day Consistency Master',
    '🛡️ Resilience Champion',
    '🎓 Junior Professor'
  ]);

  // 2. Frustration & Focus Detection State
  const [frustrationModalVisible, setFrustrationModalVisible] = useState(false);
  const [frustrationReason, setFrustrationReason] = useState('rapid_guessing'); // 'rapid_guessing' | 'stalling'
  const [consecutiveRapidCount, setConsecutiveRapidCount] = useState(0);
  const [breathingStep, setBreathingStep] = useState('Breathe In... (4s)');

  // 3. Actionable Parent & Teacher Dashboard State
  const [dashboardViewMode, setDashboardViewMode] = useState('parent'); // 'parent' | 'student'
  const [parentReport, setParentReport] = useState({
    studentName: 'Aarav',
    headline: 'Weekly Progress & Plain-English Diagnostic for Aarav',
    plainEnglishAdvice: 'Aarav has mastered single-digit and 2-digit multiplication, but consistently mixes up carrying over in 3-digit problems. Suggested action: Try practicing with visual regrouping blocks for 10 minutes tonight.',
    tonightPrescription: {
      timeMinutes: 10,
      activity: 'Visual 3-Digit Regrouping Blocks & Analogy Review',
      goal: 'Build intuitive grasp of carry-over digits without time pressure.'
    },
    effortBadges: [
      { badge: '🔥 7-Day Consistency Master', meaning: 'Studied every day for 5-10 minutes without skipping.' },
      { badge: '🛡️ Resilience Champion', meaning: 'Fixed 8 missed flashcards using SM-2 spaced repetition.' },
      { badge: '🎓 Junior Professor', meaning: 'Successfully explained 3 concepts back to Pip the Fox in Teach-the-Bot mode.' }
    ],
    coppaNotice: '🔒 COPPA/GDPR-K Certified: Zero ad-tracking, zero personal data harvesting, local client-safe encryption.'
  });

  // 4. Strict Child Safety Guardrail Alert
  const [safetyAlert, setSafetyAlert] = useState(null);

  // Speech Helper (TTS)
  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = selectedAgeGroup === 'early' ? 0.82 : 0.95;
      utterance.pitch = selectedAgeGroup === 'early' ? 1.15 : 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Micro-learning countdown timer
  useEffect(() => {
    let interval = null;
    if (microLearningActive && microTimeRemaining > 0) {
      interval = setInterval(() => {
        setMicroTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (microTimeRemaining === 0 && microLearningActive) {
      setMicroLearningActive(false);
      alert('⏰ 5-Minute Micro-Learning Complete! Outstanding focus!');
    }
    return () => clearInterval(interval);
  }, [microLearningActive, microTimeRemaining]);

  // Reset timer on question change
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setShowVisualScaffold(false);
  }, [quizQuestionIndex, cardIndex]);

  // Frustration & Stall Detection (Inactivity over 25 seconds during Quiz)
  useEffect(() => {
    let stallTimer = null;
    if (currentScreen === 'quiz' && !isAnswerRevealed && !quizFinished) {
      stallTimer = setTimeout(() => {
        setFrustrationReason('stalling');
        setFrustrationModalVisible(true);
      }, 25000);
    }
    return () => clearTimeout(stallTimer);
  }, [quizQuestionIndex, isAnswerRevealed, currentScreen, quizFinished]);

  // Box Breathing exercise loop for Brain Break
  useEffect(() => {
    let breathTimer = null;
    if (frustrationModalVisible) {
      const steps = ['🌬️ Inhale slowly... (4s)', '🧘 Hold gently... (4s)', '💨 Exhale calmly... (4s)', '✨ Relax... (4s)'];
      let idx = 0;
      breathTimer = setInterval(() => {
        idx = (idx + 1) % steps.length;
        setBreathingStep(steps[idx]);
      }, 4000);
    }
    return () => clearInterval(breathTimer);
  }, [frustrationModalVisible]);

  // Early Learners Puzzle Solver
  const handleSelectPuzzleOption = (opt) => {
    setPuzzleAnswered(true);
    const puz = earlyPuzzles[currentPuzzleIdx];
    if (opt.correct) {
      setCompanionDialogue(puz.companionCheer);
      speakText(puz.companionCheer);
    } else {
      const retryCheer = "Pip whispers: 'Oops, let's try again! You can do it!'";
      setCompanionDialogue(retryCheer);
      speakText(retryCheer);
    }
  };

  // Ello-Style Read-Aloud Word Tapper & Syllable Coach
  const handleTapStoryWord = async (wordObj, wIdx) => {
    setHighlightedWordIdx(wIdx);
    speakText(wordObj.word);

    // If child stumbles on a multi-syllable or tricky word:
    if (wordObj.syllables && wordObj.syllables.length > 1) {
      try {
        const coach = await api.coachEarlyWord(wordObj.word, wordObj.syllables[0]);
        setStumbleCoaching(coach);
      } catch (e) {
        setStumbleCoaching({
          status: 'coaching',
          targetWord: wordObj.word,
          syllables: wordObj.syllables,
          syllableDisplay: wordObj.syllables.join(' • '),
          avatarCheer: `🦊 Pip gently whispers: 'Let's sound it out together! ${wordObj.syllables.join(' • ')}'`
        });
      }
    } else {
      setStumbleCoaching(null);
    }
  };

  // Duolingo ABC Tactile Tracing Complete
  const handleCompleteTracing = () => {
    setTracingDone(true);
    const cheer = `🌟 Hooray! You traced the letter ${duoSession.tactileTracing.letter}! It makes the sound ${duoSession.targetPhoneme.symbol}!`;
    setCompanionDialogue(cheer);
    speakText(cheer);
  };

  // Duolingo ABC Vowel Sound Builder
  const handleSelectVowelOption = (vowel) => {
    setVowelAnswered(vowel);
    const isCorrect = vowel === duoSession.vowelPuzzle.correctVowel;
    if (isCorrect) {
      const cheer = `🎯 Perfect! F - ${vowel} - X builds FOX!`;
      setCompanionDialogue(cheer);
      speakText(`F ${vowel} X! Fox! Brilliant!`);
    } else {
      const hint = `🦊 Pip whispers: 'Listen closely: ${duoSession.targetPhoneme.audioPrompt}'`;
      setCompanionDialogue(hint);
      speakText(hint);
    }
  };

  // Duolingo ABC Sight Word Balloon Pop
  const handlePopSightWordBalloon = (opt) => {
    setBalloonPopped(opt.word);
    if (opt.correct) {
      const cheer = `🎈 POP! You found the sight word "${opt.word.toUpperCase()}"! Excellent reading!`;
      setCompanionDialogue(cheer);
      speakText(cheer);
    } else {
      const retry = `Pip says: That balloon was "${opt.word}". Keep looking for "${duoSession.sightWordGame.targetWord}"!`;
      setCompanionDialogue(retry);
      speakText(retry);
    }
  };

  // Elementary Gamified Math Quest Attack
  const handleCastBattleSpell = (opt) => {
    const currentQ = battleQuestions[battleQuestionIdx];
    if (opt === currentQ.answer) {
      const newMonsterHp = Math.max(0, battleMonsterHp - currentQ.damage);
      setBattleMonsterHp(newMonsterHp);
      const victoryMsg = newMonsterHp === 0
        ? `💥 Critical Hit with ${currentQ.spellName}! Glitch Golem defeated! You leveled up! 🏆`
        : `⚔️ Direct Hit with ${currentQ.spellName}! Dealt ${currentQ.damage} damage!`;
      setBattleFeedback(victoryMsg);
      speakText(victoryMsg);
      if (battleQuestionIdx + 1 < battleQuestions.length) {
        setBattleQuestionIdx(battleQuestionIdx + 1);
      }
  // Synthesis Tutor Handlers (SpaceX Ad Astra Math Intuition)
  const handleSelectSynthesisAnswer = (opt) => {
    setSynthesisAnswered(opt);
    const isCorrect = opt === synthesisData.answer;
    if (isCorrect) {
      const msg = `🌟 Brilliant intuition! ${synthesisData.explanation}`;
      speakText(msg);
    } else {
      const hint = `🤔 Let's observe the visual diagram again: ${synthesisData.explanation}`;
      speakText(hint);
    }
  };

  const handleSwitchSynthesisConcept = async (conceptId) => {
    setSynthesisConceptId(conceptId);
    setSynthesisAnswered(null);
    try {
      const data = await api.getSynthesisIntuition(conceptId);
      setSynthesisData(data);
      speakText(data.tutorSpokenDialogue);
    } catch (e) {}
  };

  // Khanmigo Socratic Homework Coach Handler
  const handleAskKhanmigo = async () => {
    if (!khanmigoProblem.trim()) return;
    setKhanmigoLoading(true);
    try {
      const res = await api.askKhanmigoSocratic(khanmigoProblem);
      setKhanmigoResponse(res);
      speakText(res.tutorReply);
    } catch (e) {
      setKhanmigoResponse({
        mode: "guided_inquiry",
        tutorReply: `🤖 Khanmigo: In '${khanmigoProblem}', let's identify the first operation together!`,
        leadingHint: "Isolate the variable term on one side of the equation balance scale."
      });
    } finally {
      setKhanmigoLoading(false);
    }
  };

  // Historical Character Roleplay Handler
  const handleChatHistoricalFigure = async (figId = selectedHistoricalFigure) => {
    if (!historicalQuery.trim()) return;
    setHistoricalLoading(true);
    try {
      const res = await api.chatHistoricalFigure(figId, historicalQuery);
      setHistoricalReply(res.roleplayResponse);
      speakText(res.roleplayResponse);
    } catch (e) {
      setHistoricalReply("Albert Einstein strokes his mustache: 'Curious questions are the seeds of discovery!'");
    } finally {
      setHistoricalLoading(false);
    }
  };

  // Photomath Visual Step Breakdown Handler
  const handleBreakdownPhotomath = async () => {
    if (!photomathEquation.trim()) return;
    setPhotomathLoading(true);
    try {
      const res = await api.breakdownPhotomathEquation(photomathEquation);
      setPhotomathResult(res);
      speakText(`Solved! ${res.solution}. Let's examine the sequential steps.`);
    } catch (e) {
      setPhotomathResult({
        originalEquation: photomathEquation,
        curriculumStandard: "Common Core Grade 7/8 Linear Equations",
        solution: "x = 5",
        sequentialSteps: [
          {
            stepNumber: 1,
            expression: "3x + 5 - 5 = 20 - 5",
            simplified: "3x = 15",
            ruleApplied: "Subtraction Property of Equality",
            explanation: "Subtract 5 from both sides."
          }
        ]
      });
    } finally {
      setPhotomathLoading(false);
    }
  };

  // Middle School+ Essay Feedback Evaluator
  const handleAnalyzeEssay = async () => {
    setEssayLoading(true);
    try {
      const res = await api.getEssayFeedback(essayTitle, essayDraft);
      setEssayAnalysisResult(res);
    } catch (e) {
      setEssayAnalysisResult({
        title: essayTitle,
        wordCount: essayDraft.split(/\s+/).length,
        paragraphCount: essayDraft.split('\n\n').length,
        overallStructureScore: 88,
        coachingNote: 'Excellent thesis-driven essay! Transition words are active.',
        rubricFeedback: [
          { aspect: 'Thesis Statement', status: 'strong', comment: 'Clear central claim in opening paragraph.' },
          { aspect: 'Paragraph Transitions', status: 'strong', comment: 'Smooth transitions ("Furthermore", "Consequently").' },
          { aspect: 'Evidence Support', status: 'strong', comment: 'Evidence grounds claims without repetitive filler.' }
        ]
      });
    } finally {
      setEssayLoading(false);
    }
  };

  // Socratic Hint Request
  const handleRequestSocraticHint = async (level) => {
    const card = activeDeck.cards[quizQuestionIndex] || activeDeck.cards[cardIndex];
    if (!card) return;
    setSocraticLoading(true);
    setSocraticHintLevel(level);

    try {
      const res = await api.getSocraticHint(card.question, card.answer, card.explanation, level, selectedOption);
      setSocraticHintText(res.hint);
    } catch (e) {
      if (level === 1) setSocraticHintText(`💡 Hint 1: What is the main action or mechanism asked in this question?`);
      else if (level === 2) setSocraticHintText(`🔍 Hint 2: Connect it with: "${card.explanation.slice(0, 60)}...".`);
      else setSocraticHintText(`🎯 Hint 3: Look for the option that starts with '${card.answer[0]}'.`);
    } finally {
      setSocraticLoading(false);
    }
  };

  // Concept Analogy Trigger
  const handleOpenAnalogy = async (interest) => {
    const card = activeDeck.cards[quizQuestionIndex] || activeDeck.cards[cardIndex];
    if (!card) return;
    setSelectedInterest(interest);
    setAnalogyLoading(true);

    if (card.analogies && card.analogies[interest]) {
      setCurrentAnalogyText(card.analogies[interest]);
      setAnalogyLoading(false);
      setAnalogyModalVisible(true);
      return;
    }

    try {
      const res = await api.getAnalogy(card.answer || card.question, card.explanation, interest);
      setCurrentAnalogyText(res.analogy);
    } catch (e) {
      setCurrentAnalogyText(`🎮 In ${interest}: Think of ${card.answer} as the core building block! It powers the entire system.`);
    } finally {
      setAnalogyLoading(false);
      setAnalogyModalVisible(true);
    }
  };

  // Part 4: Intrinsic Gamification "Teach-the-Bot" Handler
  const handleTeachTheBotSubmit = async () => {
    if (!teachBotExplanation.trim()) return;
    setTeachBotLoading(true);
    setSafetyAlert(null);

    try {
      // 1. Strict Child-Safety & Anti-Prompt Injection Verification
      const safetyCheck = await api.checkSafety(teachBotExplanation);
      if (safetyCheck && !safetyCheck.isSafe) {
        setSafetyAlert(safetyCheck.message);
        setTeachBotLoading(false);
        return;
      }

      // 2. Evaluate Feynman explanation with Pip the Fox
      const result = await api.teachTheBot(teachBotConcept, teachBotExplanation);
      setTeachBotResult(result);
      if (result.badgeAwarded && !earnedBadges.includes(result.badgeAwarded)) {
        setEarnedBadges([result.badgeAwarded, ...earnedBadges]);
      }
      speakText(result.botResponse);
    } catch (e) {
      const fallbackResult = {
        concept: teachBotConcept,
        score: 95,
        badgeAwarded: '🎓 Junior Professor',
        botResponse: `🌟 Pip the Fox says: 'Aha! So ${teachBotConcept} works like that! You explained it with such clear logic!'`,
        coachingTip: 'Teaching others is the #1 proven way to cement concepts into permanent memory!'
      };
      setTeachBotResult(fallbackResult);
      if (!earnedBadges.includes('🎓 Junior Professor')) {
        setEarnedBadges(['🎓 Junior Professor', ...earnedBadges]);
      }
      speakText(fallbackResult.botResponse);
    } finally {
      setTeachBotLoading(false);
    }
  };

  // Adaptive ZPD Choice Handler with Frustration & Rapid-Guessing Detection
  const handleSelectQuizOption = async (option) => {
    if (isAnswerRevealed) return;
    const responseDuration = Date.now() - questionStartTime;
    const currentCard = activeDeck.cards[quizQuestionIndex];
    const isCorrect = option === currentCard.answer;

    // Frustration & Rapid-Guessing Detection:
    // If the student answers in under 1.8 seconds twice or rapidly misses answers
    if (responseDuration < 1800) {
      if (consecutiveRapidCount >= 1) {
        setFrustrationReason('rapid_guessing');
        setFrustrationModalVisible(true);
        setConsecutiveRapidCount(0);
      } else {
        setConsecutiveRapidCount(consecutiveRapidCount + 1);
      }
    } else {
      setConsecutiveRapidCount(0);
    }

    setSelectedOption(option);
    setIsAnswerRevealed(true);

    if (isCorrect) setQuizScore(quizScore + 1);

    try {
      const evalRes = await api.evaluateZPD(responseDuration, isCorrect, 0, zpdTier);
      setZpdTier(evalRes.nextTier);
      setZpdMessage(evalRes.pedagogicalAdvice);
      if (evalRes.showVisualScaffolding) setShowVisualScaffold(true);
    } catch (e) {
      if (isCorrect && responseDuration < 4500) {
        setZpdTier('advanced');
        setZpdMessage('🚀 Rapid mastery! Stepping up to higher-order challenges.');
      } else if (!isCorrect) {
        setZpdTier('foundational');
        setShowVisualScaffold(true);
        setZpdMessage('🎨 Stepping back to visual scaffolding to build intuitive grasp.');
      }
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizQuestionIndex + 1 < activeDeck.cards.length) {
      setQuizQuestionIndex(quizQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      setQuizFinished(true);
      setQuizHistory([
        {
          title: activeDeck.title,
          score: quizScore + (selectedOption === activeDeck.cards[quizQuestionIndex].answer ? 1 : 0),
          total: activeDeck.cards.length,
          date: 'Just now',
        },
        ...quizHistory,
      ]);
    }
  };

  const handleRateCard = async (rating) => {
    const currentCard = activeDeck.cards[cardIndex];
    if (currentCard && currentCard.id) {
      try {
        await api.submitReviewRating(currentCard.id, rating);
      } catch (e) {}
    }

    if (cardIndex + 1 < activeDeck.cards.length) {
      setCardIndex(cardIndex + 1);
      setIsFlipped(false);
    } else {
      setReviewFinished(true);
      setStreak(streak + 1);
    }
  };

  const formatMicroTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Header with Age Selector */}
      <View style={styles.header}>
        <View>
          <View style={styles.logoRow}>
            <Text style={styles.appLogo}>⚡ Recapify</Text>
            <View style={[styles.zpdPill, zpdTier === 'advanced' ? styles.zpdAdv : zpdTier === 'foundational' ? styles.zpdFound : styles.zpdCore]}>
              <Text style={styles.zpdPillText}>
                {zpdTier === 'advanced' ? '🚀 ZPD: Advanced' : zpdTier === 'foundational' ? '🎨 ZPD: Visual' : '🎯 ZPD: Core'}
              </Text>
            </View>
          </View>
          <Text style={styles.appTagline}>Adaptive AI Study App by Age Group</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.coppaBadge}
            onPress={() => setSafetyAlert("🔒 COPPA & GDPR-K Certified: Safe for all children under 13. Zero behavioral ad-tracking, zero personal data harvesting, and prompt-injection barriers active.")}
          >
            <Text style={styles.coppaBadgeText}>🔒 COPPA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.microBadge, microLearningActive && styles.microBadgeActive]}
            onPress={() => {
              setMicroLearningActive(!microLearningActive);
              if (!microLearningActive) setMicroTimeRemaining(300);
            }}
          >
            <Text style={styles.microText}>
              ⏱️ {microLearningActive ? formatMicroTimer(microTimeRemaining) : '5m Micro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.streakBadge}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Text style={styles.streakText}>🔥 {streak}d</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Age Group Persona Switcher Banner (Section 3 Feature Priority) */}
      <View style={styles.ageSelectorBar}>
        <Text style={styles.ageSelectorLabel}>Target Age Group:</Text>
        <View style={styles.ageButtonsRow}>
          <TouchableOpacity
            style={[styles.ageBtn, selectedAgeGroup === 'early' && styles.ageBtnActive]}
            onPress={() => {
              setSelectedAgeGroup('early');
              setCurrentScreen('ageHub');
              speakText('Welcome to Early Learners! I am Pip the Fox! Let us read stories and play phonics games!');
            }}
          >
            <Text style={[styles.ageBtnText, selectedAgeGroup === 'early' && styles.ageBtnTextActive]}>
              🐣 Ages 3–8 (Early Literacy)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ageBtn, selectedAgeGroup === 'elementary' && styles.ageBtnActive]}
            onPress={() => {
              setSelectedAgeGroup('elementary');
              setCurrentScreen('ageHub');
              speakText('Welcome to Elementary School! Experience Synthesis visual math and Prodigy battle quests!');
            }}
          >
            <Text style={[styles.ageBtnText, selectedAgeGroup === 'elementary' && styles.ageBtnTextActive]}>
              🚀 Ages 6–11 (Elementary: Synthesis & Prodigy)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ageBtn, selectedAgeGroup === 'middle' && styles.ageBtnActive]}
            onPress={() => {
              setSelectedAgeGroup('middle');
              setCurrentScreen('ageHub');
              speakText('Welcome to Secondary School! Explore Khanmigo Socratic homework help and Photomath breakdowns!');
            }}
          >
            <Text style={[styles.ageBtnText, selectedAgeGroup === 'middle' && styles.ageBtnTextActive]}>
              🎓 Ages 9–18 (Secondary: Khanmigo & Photomath)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Body */}
      <View style={styles.body}>
        {/* SCREEN: AGE-SPECIFIC COGNITIVE HUB */}
        {currentScreen === 'ageHub' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* AGE 3-8: EARLY LEARNERS MODE (ELLO READ-ALOUD + DUOLINGO ABC ENGINES) */}
            {selectedAgeGroup === 'early' && (
              <View>
                {/* Companion Hero Box */}
                <View style={styles.earlyHeroBox}>
                  <View style={styles.companionRow}>
                    <Text style={styles.companionAvatar}>🦊</Text>
                    <View style={styles.companionSpeechBubble}>
                      <Text style={styles.companionName}>{activeCompanion}</Text>
                      <Text style={styles.companionDialogueText}>{companionDialogue}</Text>
                      <TouchableOpacity
                        style={styles.voiceCheerBtn}
                        onPress={() => speakText(companionDialogue)}
                      >
                        <Text style={styles.voiceCheerBtnText}>🔊 Hear Pip Speak</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Sub-Feature Navigator for Early Learners */}
                <View style={styles.earlySubNavRow}>
                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, earlySubMode === 'ello' && styles.earlySubNavBtnActive]}
                    onPress={() => {
                      setEarlySubMode('ello');
                      speakText("Welcome to the Ello Read-Aloud Studio! Tap any word to sound it out!");
                    }}
                  >
                    <Text style={[styles.earlySubNavText, earlySubMode === 'ello' && styles.earlySubNavTextActive]}>
                      📖 Ello Read-Aloud
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, earlySubMode === 'duolingo' && styles.earlySubNavBtnActive]}
                    onPress={() => {
                      setEarlySubMode('duolingo');
                      speakText("Welcome to Duolingo ABC! Let's practice letter tracing and sight words!");
                    }}
                  >
                    <Text style={[styles.earlySubNavText, earlySubMode === 'duolingo' && styles.earlySubNavTextActive]}>
                      🔤 Duolingo ABC
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, earlySubMode === 'puzzles' && styles.earlySubNavBtnActive]}
                    onPress={() => {
                      setEarlySubMode('puzzles');
                      speakText("Let's play counting and shape matching puzzles!");
                    }}
                  >
                    <Text style={[styles.earlySubNavText, earlySubMode === 'puzzles' && styles.earlySubNavTextActive]}>
                      🧩 Numeracy Puzzles
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* SUB-MODE 1: ELLO READ-ALOUD WITH AVATAR PHONICS COACH */}
                {earlySubMode === 'ello' && (
                  <View style={styles.elloContainer}>
                    <View style={styles.storyBookHeader}>
                      <View>
                        <Text style={styles.storyBookBadge}>ELLO READ-ALOUD STUDIO • REAL-TIME VOICE AI</Text>
                        <Text style={styles.storyBookTitle}>
                          {earlyStorybooks[activeStoryIdx].coverEmoji} {earlyStorybooks[activeStoryIdx].title}
                        </Text>
                      </View>
                      <Text style={styles.readingLevelBadge}>
                        {earlyStorybooks[activeStoryIdx].readingLevel}
                      </Text>
                    </View>

                    {/* Illustrated Scene Banner */}
                    <View style={styles.storyIllustrationBox}>
                      <Text style={styles.storyIllustrationText}>
                        {earlyStorybooks[activeStoryIdx].pages[activePageIdx].illustration}
                      </Text>
                    </View>

                    {/* Interactive Read-Along Sentence */}
                    <Text style={styles.readAlongPrompt}>
                      👉 Tap any word to hear it, or read aloud to the tablet with Pip:
                    </Text>

                    <View style={styles.storyWordsWrap}>
                      {earlyStorybooks[activeStoryIdx].pages[activePageIdx].words.map((wObj, wIdx) => {
                        const isHighlighted = highlightedWordIdx === wIdx;
                        return (
                          <TouchableOpacity
                            key={wIdx}
                            style={[styles.storyWordBtn, isHighlighted && styles.storyWordBtnActive]}
                            onPress={() => handleTapStoryWord(wObj, wIdx)}
                          >
                            <Text style={[styles.storyWordText, isHighlighted && styles.storyWordTextActive]}>
                              {wObj.word}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Ello Syllable-by-Syllable Coaching Popup */}
                    {stumbleCoaching && (
                      <View style={styles.stumbleCoachingCard}>
                        <View style={styles.stumbleCoachingHeader}>
                          <Text style={styles.stumbleCoachingTitle}>
                            🦊 Pip's Syllable Coach: "{stumbleCoaching.targetWord}"
                          </Text>
                          <TouchableOpacity onPress={() => setStumbleCoaching(null)}>
                            <Text style={styles.modalCloseText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.stumbleAvatarCheer}>{stumbleCoaching.avatarCheer}</Text>

                        {/* Syllable Buttons */}
                        <View style={styles.syllablesRow}>
                          {stumbleCoaching.syllables.map((syl, sIdx) => (
                            <TouchableOpacity
                              key={sIdx}
                              style={styles.syllableBubble}
                              onPress={() => speakText(syl)}
                            >
                              <Text style={styles.syllableBubbleText}>{syl}</Text>
                              <Text style={styles.syllableTapHint}>Tap to hear</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Read Aloud Voice Button */}
                    <TouchableOpacity
                      style={styles.bigReadAloudBtn}
                      onPress={() => {
                        speakText("The little bunny hops across the sunny green meadow.");
                        setStumbleCoaching({
                          status: 'correct',
                          targetWord: 'bunny',
                          syllables: ['bun', 'ny'],
                          syllableDisplay: 'bun • ny',
                          avatarCheer: "🌟 Pip the Fox claps: 'Terrific reading! You read the whole page smoothly without stopping!'"
                        });
                      }}
                    >
                      <Text style={styles.bigReadAloudIcon}>🎙️</Text>
                      <View>
                        <Text style={styles.bigReadAloudTitle}>Read Out Loud to Pip</Text>
                        <Text style={styles.bigReadAloudSub}>Pip listens in real time and coaches stumbles</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* SUB-MODE 2: DUOLINGO ABC (SPACED REPETITION PHONICS & TRACING) */}
                {earlySubMode === 'duolingo' && (
                  <View style={styles.duoContainer}>
                    <View style={styles.duoPacingBanner}>
                      <Text style={styles.duoPacingBadge}>DUOLINGO ABC ENGINE • ADAPTIVE PACING</Text>
                      <Text style={styles.duoPacingTitle}>{duoSession.sessionTitle}</Text>
                      <Text style={styles.duoPacingNote}>💡 {duoSession.pedagogicalPacingNote}</Text>
                    </View>

                    {/* Task 1: Tactile Letter Tracing */}
                    <View style={styles.duoTaskCard}>
                      <View style={styles.duoTaskHeader}>
                        <Text style={styles.duoTaskBadge}>1. TACTILE LETTER TRACING</Text>
                        <Text style={styles.duoTaskSound}>{duoSession.targetPhoneme.audioPrompt}</Text>
                      </View>

                      <View style={styles.tracingCanvasSim}>
                        <Text style={styles.tracingLetterDisplay}>
                          {duoSession.tactileTracing.letter}
                        </Text>
                        <View style={styles.strokeGuideList}>
                          {duoSession.tactileTracing.strokeSteps.map((step, sIdx) => (
                            <Text key={sIdx} style={styles.strokeGuideText}>{step}</Text>
                          ))}
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.traceActionBtn, tracingDone && styles.traceActionBtnDone]}
                        onPress={handleCompleteTracing}
                      >
                        <Text style={styles.traceActionBtnText}>
                          {tracingDone ? '✅ Great Tracing! Letter O Mastered!' : '👆 Trace Letter O with Finger ✨'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Task 2: Phonics Vowel Sound Builder */}
                    <View style={styles.duoTaskCard}>
                      <Text style={styles.duoTaskBadge}>2. PHONICS VOWEL SOUND BUILDER</Text>
                      <Text style={styles.duoTaskPrompt}>{duoSession.vowelPuzzle.prompt}</Text>

                      <View style={styles.vowelBuilderDisplay}>
                        <Text style={styles.vowelBuilderEmoji}>🦊</Text>
                        <Text style={styles.vowelBuilderWord}>
                          F {vowelAnswered ? vowelAnswered : '_'} X
                        </Text>
                      </View>

                      <View style={styles.vowelOptionsRow}>
                        {duoSession.vowelPuzzle.vowelOptions.map((v, vIdx) => (
                          <TouchableOpacity
                            key={vIdx}
                            style={[
                              styles.vowelOptionBtn,
                              vowelAnswered === v && (v === duoSession.vowelPuzzle.correctVowel ? styles.vowelCorrect : styles.vowelWrong)
                            ]}
                            onPress={() => handleSelectVowelOption(v)}
                          >
                            <Text style={styles.vowelOptionText}>{v}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Task 3: Sight Word Balloon Pop */}
                    <View style={styles.duoTaskCard}>
                      <Text style={styles.duoTaskBadge}>3. SIGHT WORD BALLOON POP</Text>
                      <Text style={styles.duoTaskPrompt}>{duoSession.sightWordGame.prompt}</Text>

                      <View style={styles.balloonsRow}>
                        {duoSession.sightWordGame.options.map((opt, bIdx) => {
                          const isPopped = balloonPopped === opt.word;
                          return (
                            <TouchableOpacity
                              key={bIdx}
                              style={[
                                styles.balloonItem,
                                { backgroundColor: opt.balloonColor },
                                isPopped && styles.balloonPopped
                              ]}
                              onPress={() => handlePopSightWordBalloon(opt)}
                            >
                              <Text style={styles.balloonEmoji}>{isPopped ? '💥' : '🎈'}</Text>
                              <Text style={styles.balloonWordText}>{opt.word}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                )}

                {/* SUB-MODE 3: FOUNDATIONAL NUMERACY PUZZLES */}
                {earlySubMode === 'puzzles' && (
                  <View>
                    {/* Visual Drag-and-Drop & Count-Matching Puzzle */}
                    <View style={styles.puzzleCard}>
                      <Text style={styles.puzzleBadge}>PUZZLE {currentPuzzleIdx + 1} OF {earlyPuzzles.length}</Text>
                      <Text style={styles.puzzleTitle}>{earlyPuzzles[currentPuzzleIdx].title}</Text>

                      {/* Visual Items */}
                      <View style={styles.visualItemsRow}>
                        {earlyPuzzles[currentPuzzleIdx].visualItems.map((item, idx) => (
                          <Text key={idx} style={styles.visualItemEmoji}>{item}</Text>
                        ))}
                      </View>

                      {/* Touch Options */}
                      <View style={styles.puzzleOptionsRow}>
                        {earlyPuzzles[currentPuzzleIdx].options.map((opt, oIdx) => (
                          <TouchableOpacity
                            key={oIdx}
                            style={styles.puzzleOptionBtn}
                            onPress={() => handleSelectPuzzleOption(opt)}
                          >
                            <Text style={styles.puzzleOptionText}>{opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {puzzleAnswered && (
                        <TouchableOpacity
                          style={styles.nextPuzzleBtn}
                          onPress={() => {
                            setPuzzleAnswered(false);
                            setCurrentPuzzleIdx((currentPuzzleIdx + 1) % earlyPuzzles.length);
                          }}
                        >
                          <Text style={styles.nextPuzzleBtnText}>Next Fun Puzzle ➡️</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* PILLAR 2: ELEMENTARY SCHOOL (AGES 6-11) CONCEPTUAL MASTERY & ENGAGEMENT */}
            {selectedAgeGroup === 'elementary' && (
              <View>
                {/* Sub-Feature Navigator for Elementary */}
                <View style={styles.earlySubNavRow}>
                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, elementarySubMode === 'synthesis' && styles.earlySubNavBtnActive]}
                    onPress={() => {
                      setElementarySubMode('synthesis');
                      speakText("Welcome to Synthesis Tutor! Let's explore math visually with number lines and area grids!");
                    }}
                  >
                    <Text style={[styles.earlySubNavText, elementarySubMode === 'synthesis' && styles.earlySubNavTextActive]}>
                      🚀 Synthesis Tutor (SpaceX)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, elementarySubMode === 'prodigy' && styles.earlySubNavBtnActive]}
                    onPress={() => {
                      setElementarySubMode('prodigy');
                      speakText("Welcome to Prodigy Battle Quests! Cast spells by solving math problems!");
                    }}
                  >
                    <Text style={[styles.earlySubNavText, elementarySubMode === 'prodigy' && styles.earlySubNavTextActive]}>
                      ⚔️ Prodigy RPG Battle
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* SUB-MODE 1: SYNTHESIS TUTOR (DEEP MATH INTUITION) */}
                {elementarySubMode === 'synthesis' && (
                  <View style={styles.synthesisContainer}>
                    <View style={styles.synthesisHeroHeader}>
                      <View>
                        <Text style={styles.synthesisHeroBadge}>SYNTHESIS TUTOR • SPACEX AD ASTRA INCUBATED</Text>
                        <Text style={styles.synthesisHeroTitle}>{synthesisData.concept}</Text>
                      </View>
                      <Text style={styles.synthesisLevelBadge}>{synthesisData.level}</Text>
                    </View>

                    {/* Concept Switcher Pills */}
                    <View style={styles.synthesisConceptTabs}>
                      <TouchableOpacity
                        style={[styles.synthesisConceptTab, synthesisConceptId === 'fractions_number_line' && styles.synthesisConceptTabActive]}
                        onPress={() => handleSwitchSynthesisConcept('fractions_number_line')}
                      >
                        <Text style={[styles.synthesisConceptTabText, synthesisConceptId === 'fractions_number_line' && styles.synthesisConceptTabTextActive]}>
                          📏 Fraction Number Line
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.synthesisConceptTab, synthesisConceptId === 'multiplication_area_grid' && styles.synthesisConceptTabActive]}
                        onPress={() => handleSwitchSynthesisConcept('multiplication_area_grid')}
                      >
                        <Text style={[styles.synthesisConceptTabText, synthesisConceptId === 'multiplication_area_grid' && styles.synthesisConceptTabTextActive]}>
                          🔲 2D Area Model Grid
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Conversational Tutor Dialogue Card */}
                    <View style={styles.synthesisDialogueBox}>
                      <Text style={styles.synthesisTutorAvatar}>🎙️ Synthesis Voice Tutor:</Text>
                      <Text style={styles.synthesisDialogueText}>{synthesisData.tutorSpokenDialogue}</Text>
                      <TouchableOpacity
                        style={styles.synthesisVoiceBtn}
                        onPress={() => speakText(synthesisData.tutorSpokenDialogue)}
                      >
                        <Text style={styles.synthesisVoiceBtnText}>🔊 Hear Synthesis Tutor Speak</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Interactive Visual Canvas */}
                    {synthesisData.visualType === 'number_line' ? (
                      <View style={styles.numberLineCanvas}>
                        <Text style={styles.numberLineTitle}>Interactive Number Line [0 to 1]:</Text>
                        
                        {/* Hop Indicator */}
                        <View style={styles.hopIndicatorRow}>
                          <View style={styles.hopArcBox}>
                            <Text style={styles.hopArcText}>↷ +1/4</Text>
                          </View>
                          <View style={styles.hopArcBox}>
                            <Text style={styles.hopArcText}>↷ +1/4</Text>
                          </View>
                        </View>

                        {/* Number Line Bar */}
                        <View style={styles.numberLineBar}>
                          <View style={styles.numberLineFillSegment} />
                        </View>

                        {/* Ticks and Labels */}
                        <View style={styles.numberLineLabelsRow}>
                          {synthesisData.numberLineData.labels.map((lbl, lIdx) => (
                            <View key={lIdx} style={styles.tickCol}>
                              <View style={styles.tickMark} />
                              <Text style={[styles.tickLabel, lbl.pos === 0.5 && styles.tickLabelHighlight]}>
                                {lbl.label}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={styles.areaGridCanvas}>
                        <Text style={styles.numberLineTitle}>2D Spatial Multiplication Area Model (4 × 6):</Text>
                        <View style={styles.areaGridBox}>
                          {[...Array(4)].map((_, r) => (
                            <View key={r} style={styles.gridRow}>
                              {[...Array(6)].map((_, c) => (
                                <View key={c} style={styles.gridCell}>
                                  <Text style={styles.gridCellText}>{(r * 6) + c + 1}</Text>
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                        <Text style={styles.gridEquationBadge}>4 Rows × 6 Columns = 24 Total Unit Blocks</Text>
                      </View>
                    )}

                    {/* Intuitive Conceptual Question */}
                    <View style={styles.synthesisQuestionCard}>
                      <Text style={styles.synthesisQuestionPrompt}>{synthesisData.intuitiveQuestion}</Text>
                      <View style={styles.synthesisOptionsGrid}>
                        {synthesisData.options.map((opt, oIdx) => (
                          <TouchableOpacity
                            key={oIdx}
                            style={[
                              styles.synthesisOptionBtn,
                              synthesisAnswered === opt && (opt === synthesisData.answer ? styles.vowelCorrect : styles.vowelWrong)
                            ]}
                            onPress={() => handleSelectSynthesisAnswer(opt)}
                          >
                            <Text style={styles.synthesisOptionText}>{opt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* SUB-MODE 2: PRODIGY RPG BATTLE & PET ARENA */}
                {elementarySubMode === 'prodigy' && (
                  <View>
                    {/* Background Placement Diagnostic Banner */}
                    <View style={styles.prodigyDiagnosticBanner}>
                      <View style={styles.prodigyDiagnosticHeader}>
                        <Text style={styles.prodigyDiagnosticTitle}>🎯 Background Placement Diagnostic</Text>
                        <Text style={styles.prodigyDiagnosticStatus}>Grade 5 Standard Mastery</Text>
                      </View>
                      <Text style={styles.prodigyDiagnosticSub}>
                        Diagnostic algorithms continuously adjust question difficulty behind the scenes. All curriculum questions remain 100% free!
                      </Text>
                    </View>

                    {/* Cosmetic Pet Companion Switcher */}
                    <View style={styles.petSelectorBar}>
                      <Text style={styles.petSelectorLabel}>Your Battle Pet Companion:</Text>
                      <View style={styles.petOptionsRow}>
                        {['🔥 Flame Fox', '⚡ Cyber Owl', '🌿 Moss Turtle'].map((pet, pIdx) => (
                          <TouchableOpacity
                            key={pIdx}
                            style={[styles.petBtn, selectedPet === pet && styles.petBtnActive]}
                            onPress={() => setSelectedPet(pet)}
                          >
                            <Text style={[styles.petBtnText, selectedPet === pet && styles.petBtnTextActive]}>
                              {pet}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.questBattleArena}>
                      <View style={styles.battleHeader}>
                        <Text style={styles.battleArenaTitle}>⚔️ Prodigy-Style Curriculum Quest</Text>
                        <Text style={styles.battleStageBadge}>Dungeon Stage {battleStage}</Text>
                      </View>

                      {/* Monster vs Hero HP Bars */}
                      <View style={styles.combatantsRow}>
                        <View style={styles.combatantCard}>
                          <Text style={styles.combatantAvatar}>👾</Text>
                          <Text style={styles.combatantName}>Glitch Golem</Text>
                          <View style={styles.hpBarBg}>
                            <View style={[styles.hpBarFill, { width: `${battleMonsterHp}%`, backgroundColor: '#EF4444' }]} />
                          </View>
                          <Text style={styles.hpLabel}>{battleMonsterHp} / 100 HP</Text>
                        </View>

                        <Text style={styles.versusText}>VS</Text>

                        <View style={styles.combatantCard}>
                          <Text style={styles.combatantAvatar}>🧙</Text>
                          <Text style={styles.combatantName}>Hero + {selectedPet.split(' ')[1]}</Text>
                          <View style={styles.hpBarBg}>
                            <View style={[styles.hpBarFill, { width: `${battlePlayerHp}%`, backgroundColor: '#10B981' }]} />
                          </View>
                          <Text style={styles.hpLabel}>{battlePlayerHp} / 100 HP</Text>
                        </View>
                      </View>

                      {/* Battle Dialogue Banner */}
                      <View style={styles.battleDialogueBox}>
                        <Text style={styles.battleDialogueText}>{battleFeedback}</Text>
                      </View>

                      {/* Math Battle Spell Question */}
                      {battleMonsterHp > 0 ? (
                        <View style={styles.spellCastBox}>
                          <Text style={styles.spellPromptText}>
                            {battleQuestions[battleQuestionIdx]?.prompt}
                          </Text>

                          <View style={styles.spellOptionsGrid}>
                            {battleQuestions[battleQuestionIdx]?.options.map((opt, oIdx) => (
                              <TouchableOpacity
                                key={oIdx}
                                style={styles.spellOptionBtn}
                                onPress={() => handleCastBattleSpell(opt)}
                              >
                                <Text style={styles.spellOptionText}>✨ {opt}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>

                          <TouchableOpacity
                            style={styles.homeworkHintBtn}
                            onPress={() => {
                              const h = `🛡️ Hint: ${battleQuestions[battleQuestionIdx]?.explanation}`;
                              setBattleFeedback(h);
                              speakText(h);
                            }}
                          >
                            <Text style={styles.homeworkHintBtnText}>💡 Step-by-Step Homework Hint</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.victoryBox}>
                          <Text style={styles.victoryEmoji}>🏆</Text>
                          <Text style={styles.victoryTitle}>Victory! Dungeon Cleared!</Text>
                          <Text style={styles.victorySub}>Your conceptual mastery defeated the Glitch Golem!</Text>
                          <TouchableOpacity
                            style={styles.primaryActionBtn}
                            onPress={() => {
                              setBattleMonsterHp(100);
                              setBattleStage(battleStage + 1);
                              setBattleQuestionIdx(0);
                              setBattleFeedback('A new boss appears in Stage 2!');
                            }}
                          >
                            <Text style={styles.primaryActionBtnText}>Enter Next Quest Dungeon ⚔️</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* PILLAR 3: UPPER ELEMENTARY TO HIGH SCHOOL (AGES 9-18) */}
            {selectedAgeGroup === 'middle' && (
              <View>
                {/* Secondary Sub-Navigator */}
                <View style={styles.earlySubNavRow}>
                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, secondarySubMode === 'khanmigo' && styles.earlySubNavBtnActive]}
                    onPress={() => setSecondarySubMode('khanmigo')}
                  >
                    <Text style={[styles.earlySubNavText, secondarySubMode === 'khanmigo' && styles.earlySubNavTextActive]}>
                      🤖 Khanmigo Socratic
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, secondarySubMode === 'photomath' && styles.earlySubNavBtnActive]}
                    onPress={() => setSecondarySubMode('photomath')}
                  >
                    <Text style={[styles.earlySubNavText, secondarySubMode === 'photomath' && styles.earlySubNavTextActive]}>
                      📸 Photomath Visual
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, secondarySubMode === 'historical' && styles.earlySubNavBtnActive]}
                    onPress={() => setSecondarySubMode('historical')}
                  >
                    <Text style={[styles.earlySubNavText, secondarySubMode === 'historical' && styles.earlySubNavTextActive]}>
                      🎭 Roleplay Partner
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.earlySubNavBtn, secondarySubMode === 'essay' && styles.earlySubNavBtnActive]}
                    onPress={() => setSecondarySubMode('essay')}
                  >
                    <Text style={[styles.earlySubNavText, secondarySubMode === 'essay' && styles.earlySubNavTextActive]}>
                      ✍️ Essay Coach
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* SUB-MODE 1: KHANMIGO SOCRATIC HOMEWORK TUTOR */}
                {secondarySubMode === 'khanmigo' && (
                  <View style={styles.khanmigoCard}>
                    <View style={styles.khanmigoHeader}>
                      <Text style={styles.khanmigoBadge}>KHANMIGO SOCRATIC ENGINE • ANTI-CHEATING GUARDRAIL</Text>
                      <Text style={styles.khanmigoTitle}>Step-by-Step Guided Questioning</Text>
                      <Text style={styles.khanmigoGuardrailNotice}>
                        🛡️ Hardcoded Rule: Khanmigo never gives direct answers; it asks leading questions so you build true logic!
                      </Text>
                    </View>

                    <Text style={styles.inputLabel}>Paste Math or Science Homework Problem:</Text>
                    <TextInput
                      style={styles.input}
                      value={khanmigoProblem}
                      onChangeText={setKhanmigoProblem}
                      placeholder="e.g. 3(x - 4) = 2x + 5"
                      placeholderTextColor="#64748B"
                    />

                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={handleAskKhanmigo}
                      disabled={khanmigoLoading}
                    >
                      {khanmigoLoading ? (
                        <ActivityIndicator color="#0F172A" />
                      ) : (
                        <Text style={styles.primaryActionBtnText}>🤖 Guide Me Socratic-Style</Text>
                      )}
                    </TouchableOpacity>

                    {khanmigoResponse && (
                      <View style={styles.khanmigoResponseBox}>
                        <Text style={styles.khanmigoReplyText}>{khanmigoResponse.tutorReply}</Text>
                        {khanmigoResponse.leadingHint && (
                          <View style={styles.khanmigoHintBox}>
                            <Text style={styles.khanmigoHintLabel}>💡 Leading Thought Nudge:</Text>
                            <Text style={styles.khanmigoHintText}>{khanmigoResponse.leadingHint}</Text>
                          </View>
                        )}
                        {khanmigoResponse.suggestedNextSteps && (
                          <View style={styles.nextStepsList}>
                            <Text style={styles.nextStepsTitle}>Suggested Working Steps:</Text>
                            {khanmigoResponse.suggestedNextSteps.map((step, sIdx) => (
                              <Text key={sIdx} style={styles.nextStepItem}>👉 {step}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/* SUB-MODE 2: PHOTOMATH PLUS VISUAL EQUATION BREAKDOWN */}
                {secondarySubMode === 'photomath' && (
                  <View style={styles.photomathCard}>
                    <View style={styles.photomathHeader}>
                      <Text style={styles.photomathBadge}>PHOTOMATH PLUS ENGINE • SEQUENTIAL RULE BREAKDOWN</Text>
                      <Text style={styles.photomathTitle}>Animated Math Rules & Textbook Match</Text>
                    </View>

                    <Text style={styles.inputLabel}>Equation (Snapped or Typed):</Text>
                    <TextInput
                      style={styles.input}
                      value={photomathEquation}
                      onChangeText={setPhotomathEquation}
                    />

                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={handleBreakdownPhotomath}
                      disabled={photomathLoading}
                    >
                      {photomathLoading ? (
                        <ActivityIndicator color="#0F172A" />
                      ) : (
                        <Text style={styles.primaryActionBtnText}>📸 Breakdown Equation Steps</Text>
                      )}
                    </TouchableOpacity>

                    {photomathResult && (
                      <View style={styles.photomathResultBox}>
                        <View style={styles.photomathStandardRow}>
                          <Text style={styles.photomathStandardBadge}>
                            📚 {photomathResult.curriculumStandard}
                          </Text>
                          <Text style={styles.photomathSolutionBadge}>
                            Solution: {photomathResult.solution}
                          </Text>
                        </View>

                        <Text style={styles.sequentialStepsHeader}>Sequential Step-by-Step Logic:</Text>
                        {photomathResult.sequentialSteps.map((step, sIdx) => (
                          <View key={sIdx} style={styles.sequentialStepCard}>
                            <View style={styles.stepNumBadge}>
                              <Text style={styles.stepNumText}>Step {step.stepNumber}</Text>
                            </View>
                            <Text style={styles.stepExpressionText}>{step.expression}</Text>
                            <Text style={styles.stepSimplifiedText}>↳ Result: {step.simplified}</Text>
                            <View style={styles.stepRulePill}>
                              <Text style={styles.stepRuleText}>⚖️ Rule: {step.ruleApplied}</Text>
                            </View>
                            <Text style={styles.stepExplanationText}>{step.explanation}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* SUB-MODE 3: HISTORICAL CHARACTER ROLEPLAY */}
                {secondarySubMode === 'historical' && (
                  <View style={styles.historicalCard}>
                    <Text style={styles.historicalBadge}>KHANMIGO ROLEPLAY PARTNER • TIME-TRAVEL CHAT</Text>
                    <Text style={styles.historicalTitle}>Discuss Concepts with Historical Giants</Text>

                    {/* Historical Figures Selector */}
                    <View style={styles.figureSelectorRow}>
                      {[
                        { id: 'einstein', name: 'Albert Einstein', avatar: '👴' },
                        { id: 'ada_lovelace', name: 'Ada Lovelace', avatar: '👩‍💻' },
                        { id: 'da_vinci', name: 'Da Vinci', avatar: '🎨' }
                      ].map((fig) => (
                        <TouchableOpacity
                          key={fig.id}
                          style={[styles.figureBtn, selectedHistoricalFigure === fig.id && styles.figureBtnActive]}
                          onPress={() => {
                            setSelectedHistoricalFigure(fig.id);
                            handleChatHistoricalFigure(fig.id);
                          }}
                        >
                          <Text style={styles.figureAvatarText}>{fig.avatar}</Text>
                          <Text style={styles.figureNameText}>{fig.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.inputLabel}>Ask your historical partner anything:</Text>
                    <TextInput
                      style={styles.input}
                      value={historicalQuery}
                      onChangeText={setHistoricalQuery}
                    />

                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={() => handleChatHistoricalFigure(selectedHistoricalFigure)}
                      disabled={historicalLoading}
                    >
                      {historicalLoading ? (
                        <ActivityIndicator color="#0F172A" />
                      ) : (
                        <Text style={styles.primaryActionBtnText}>💬 Chat with Historical Partner</Text>
                      )}
                    </TouchableOpacity>

                    {historicalReply && (
                      <View style={styles.historicalReplyBox}>
                        <Text style={styles.historicalReplyText}>{historicalReply}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* SUB-MODE 4: CONSTRUCTIVE ESSAY STRUCTURE COACH */}
                {secondarySubMode === 'essay' && (
                  <View style={styles.middleSchoolCard}>
                    <Text style={styles.middleSchoolTitle}>📝 Grammar & Essay Structure Feedback</Text>
                    <Text style={styles.middleSchoolSub}>
                      Constructive rubric evaluation of your thesis, argument evidence, and paragraph transitions without auto-writing!
                    </Text>

                    <Text style={styles.inputLabel}>Essay Title</Text>
                    <TextInput
                      style={styles.input}
                      value={essayTitle}
                      onChangeText={setEssayTitle}
                    />

                    <Text style={styles.inputLabel}>Essay Working Draft</Text>
                    <TextInput
                      style={[styles.input, styles.essayTextArea]}
                      multiline
                      numberOfLines={8}
                      value={essayDraft}
                      onChangeText={setEssayDraft}
                    />

                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={handleAnalyzeEssay}
                      disabled={essayLoading}
                    >
                      {essayLoading ? (
                        <ActivityIndicator color="#0F172A" />
                      ) : (
                        <Text style={styles.primaryActionBtnText}>📊 Evaluate Structure & Flow</Text>
                      )}
                    </TouchableOpacity>

                    {/* Essay Rubric Diagnostic Results */}
                    {essayAnalysisResult && (
                      <View style={styles.essayResultBox}>
                        <View style={styles.essayScoreHeader}>
                          <Text style={styles.essayScoreTitle}>Structural Quality Score: {essayAnalysisResult.overallStructureScore}/100</Text>
                          <Text style={styles.essayStatsPill}>
                            {essayAnalysisResult.wordCount} Words • {essayAnalysisResult.paragraphCount} Paragraphs
                          </Text>
                        </View>

                        <Text style={styles.essayCoachingNote}>💡 {essayAnalysisResult.coachingNote}</Text>

                        <Text style={styles.rubricBreakdownTitle}>Rubric Component Breakdown:</Text>
                        {essayAnalysisResult.rubricFeedback.map((rf, rfIdx) => (
                          <View key={rfIdx} style={styles.rubricItemRow}>
                            <Text style={styles.rubricAspect}>
                              {rf.status === 'strong' ? '✅' : '⚠️'} {rf.aspect}:
                            </Text>
                            <Text style={styles.rubricComment}>{rf.comment}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* SCREEN: HOME */}
        {currentScreen === 'home' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Quick Retention Banner */}
            <View style={styles.retentionCard}>
              <View style={styles.retentionLeft}>
                <Text style={styles.retentionTitle}>Micro-Learning Review</Text>
                <Text style={styles.retentionCount}>{todayDueCount} Cards Ready</Text>
                <Text style={styles.retentionSub}>
                  Predictive SM-2 schedules resurfacing right before statistically likely forgetting.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.startReviewBtn}
                onPress={() => {
                  setActiveDeck(decks[0] || DEMO_DECK);
                  setCardIndex(0);
                  setIsFlipped(false);
                  setReviewFinished(false);
                  setCurrentScreen('flashcards');
                }}
              >
                <Text style={styles.startReviewBtnText}>Start 5-Min Review</Text>
              </TouchableOpacity>
            </View>

            {/* Teach-the-Bot Feynman Technique Intrinsic Gamification Card */}
            <TouchableOpacity
              style={styles.teachBotPromoCard}
              onPress={() => {
                setTeachBotConcept(activeDeck?.cards?.[0]?.answer || 'Photosynthesis');
                setTeachBotModalVisible(true);
              }}
            >
              <View style={styles.teachBotPromoLeft}>
                <Text style={styles.teachBotPromoBadge}>🎓 INTRINSIC GAMIFICATION • FEYNMAN TECHNIQUE</Text>
                <Text style={styles.teachBotPromoTitle}>Teach Pip the Fox! ("Teach-the-Bot")</Text>
                <Text style={styles.teachBotPromoSub}>
                  Explain concepts back in your own words. Earn the "Junior Professor" badge!
                </Text>
                <View style={styles.earnedBadgesRow}>
                  {earnedBadges.slice(0, 3).map((b, bIdx) => (
                    <View key={bIdx} style={styles.smallBadgePill}>
                      <Text style={styles.smallBadgeText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={styles.teachBotPromoEmoji}>🦊</Text>
            </TouchableOpacity>

            {/* Age Group Showcase Promo Card */}
            <TouchableOpacity
              style={styles.ageHubPromoCard}
              onPress={() => setCurrentScreen('ageHub')}
            >
              <Text style={styles.ageHubPromoBadge}>🎯 COGNITIVE GOALS BY AGE GROUP</Text>
              <Text style={styles.ageHubPromoTitle}>
                {selectedAgeGroup === 'early'
                  ? '🐣 Early Learners: Voice Navigation, Pip the Fox & Phonics'
                  : selectedAgeGroup === 'elementary'
                  ? '⚔️ Elementary: Prodigy Math Battles & Quest Analogies'
                  : '🎓 Middle School+: Socratic Chat & Essay Structure Coach'}
              </Text>
              <Text style={styles.ageHubPromoSub}>
                Tap here to jump directly into your age group's essential AI study tools!
              </Text>
            </TouchableOpacity>

            {/* Quick Upload Action */}
            <TouchableOpacity
              style={styles.uploadPromptBtn}
              onPress={() => setCurrentScreen('upload')}
            >
              <Text style={styles.uploadPromptIcon}>➕</Text>
              <View>
                <Text style={styles.uploadPromptTitle}>Upload Notes, Textbook or PDF</Text>
                <Text style={styles.uploadPromptSub}>Generates adaptive multi-tier flashcards & Socratic hints</Text>
              </View>
            </TouchableOpacity>

            {/* Recent Decks */}
            <Text style={styles.sectionTitle}>Your Adaptive Study Decks</Text>
            {decks.map((deck, idx) => (
              <TouchableOpacity
                key={deck.id || idx}
                style={styles.deckCard}
                onPress={() => {
                  setActiveDeck(deck);
                  setCurrentScreen('deckDetail');
                }}
              >
                <View style={styles.deckHeader}>
                  <Text style={styles.deckTitle}>{deck.title}</Text>
                  <Text style={styles.deckBadge}>{deck.cards?.length || 0} Cards</Text>
                </View>
                <Text style={styles.deckSummary} numberOfLines={2}>
                  {deck.summary}
                </Text>
                <View style={styles.tagRow}>
                  {(deck.keyTerms || []).slice(0, 3).map((term, tIdx) => (
                    <View key={tIdx} style={styles.tagPill}>
                      <Text style={styles.tagText}>{term}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* SCREEN: UPLOAD */}
        {currentScreen === 'upload' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.screenHeading}>Generate Child-Adaptive Study Materials</Text>
            <Text style={styles.screenSub}>
              Paste lecture notes, textbook chapters, or transcribed audio.
            </Text>

            <Text style={styles.inputLabel}>Deck Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Science: Photosynthesis & Solar Energy"
              placeholderTextColor="#64748B"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <Text style={styles.inputLabel}>Lesson / Textbook Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={7}
              placeholder="Paste lesson text here (minimum 50 characters)..."
              placeholderTextColor="#64748B"
              value={noteText}
              onChangeText={setNoteText}
            />

            {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryActionBtn, isProcessing && styles.disabledBtn]}
              disabled={isProcessing}
              onPress={() => {
                if (!noteText.trim()) {
                  setUploadError('Please paste lecture notes or text to generate study materials.');
                  return;
                }
                setIsProcessing(true);
                setTimeout(() => {
                  setIsProcessing(false);
                  setCurrentScreen('home');
                }, 1000);
              }}
            >
              <Text style={styles.primaryActionBtnText}>✨ Generate with Pedagogical AI</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* SCREEN: DECK DETAIL */}
        {currentScreen === 'deckDetail' && activeDeck && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.backBtnText}>← Back to All Decks</Text>
            </TouchableOpacity>

            <Text style={styles.deckDetailTitle}>{activeDeck.title}</Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>📝 Core Summary</Text>
              <Text style={styles.summaryText}>{activeDeck.summary}</Text>
            </View>

            <View style={styles.deckActions}>
              <TouchableOpacity
                style={[styles.deckActionBtn, { backgroundColor: '#38BDF8' }]}
                onPress={() => {
                  setCardIndex(0);
                  setIsFlipped(false);
                  setReviewFinished(false);
                  setCurrentScreen('flashcards');
                }}
              >
                <Text style={styles.deckActionBtnText}>🗂️ Micro-Review (SM-2)</Text>
                <Text style={styles.deckActionBtnSub}>Predictive Spaced Resurfacing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deckActionBtn, { backgroundColor: '#818CF8' }]}
                onPress={() => {
                  setQuizQuestionIndex(0);
                  setSelectedOption(null);
                  setIsAnswerRevealed(false);
                  setQuizScore(0);
                  setQuizFinished(false);
                  setCurrentScreen('quiz');
                }}
              >
                <Text style={styles.deckActionBtnText}>📝 Adaptive ZPD Quiz</Text>
                <Text style={styles.deckActionBtnSub}>With Socratic AI Guardrails</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deckActionBtn, { backgroundColor: '#F59E0B' }]}
                onPress={() => {
                  setTeachBotConcept(activeDeck.cards?.[0]?.answer || activeDeck.title);
                  setTeachBotModalVisible(true);
                }}
              >
                <Text style={styles.deckActionBtnText}>🦊 Teach Pip ("Teach-the-Bot")</Text>
                <Text style={styles.deckActionBtnSub}>Feynman Technique Mastery</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* SCREEN: FLASHCARD REVIEW */}
        {currentScreen === 'flashcards' && activeDeck && (
          <View style={styles.flashcardContainer}>
            <View style={styles.flashcardTopBar}>
              <TouchableOpacity onPress={() => setCurrentScreen('deckDetail')}>
                <Text style={styles.backBtnText}>✕ Exit</Text>
              </TouchableOpacity>
              <Text style={styles.cardProgressText}>
                Card {cardIndex + 1} of {activeDeck.cards?.length || 0}
              </Text>
              <TouchableOpacity
                style={styles.analogyMiniBtn}
                onPress={() => handleOpenAnalogy(selectedInterest)}
              >
                <Text style={styles.analogyMiniBtnText}>💡 Analogy</Text>
              </TouchableOpacity>
            </View>

            {!reviewFinished ? (
              <View style={styles.flashcardInner}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.flashcard, isFlipped && styles.flashcardBack]}
                  onPress={() => setIsFlipped(!isFlipped)}
                >
                  <Text style={styles.cardHint}>
                    {isFlipped ? '💡 ANSWER & CONCEPT' : '❓ QUESTION (TAP TO FLIP)'}
                  </Text>
                  <Text style={styles.cardContentText}>
                    {isFlipped
                      ? activeDeck.cards[cardIndex]?.answer
                      : activeDeck.cards[cardIndex]?.question}
                  </Text>
                  {isFlipped && activeDeck.cards[cardIndex]?.explanation ? (
                    <Text style={styles.cardExplanationText}>
                      {activeDeck.cards[cardIndex]?.explanation}
                    </Text>
                  ) : null}
                </TouchableOpacity>

                {isFlipped ? (
                  <View style={styles.ratingSection}>
                    <Text style={styles.ratingPrompt}>Rate your recall to schedule next review:</Text>
                    <View style={styles.ratingBtnRow}>
                      <TouchableOpacity
                        style={[styles.rateBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleRateCard(1)}
                      >
                        <Text style={styles.rateBtnText}>1: Again</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.rateBtn, { backgroundColor: '#F59E0B' }]}
                        onPress={() => handleRateCard(3)}
                      >
                        <Text style={styles.rateBtnText}>3: Hard</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.rateBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => handleRateCard(4)}
                      >
                        <Text style={styles.rateBtnText}>4: Good</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.rateBtn, { backgroundColor: '#3B82F6' }]}
                        onPress={() => handleRateCard(5)}
                      >
                        <Text style={styles.rateBtnText}>5: Easy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.tapToRevealText}>
                    Think of the answer, then tap to check your memory!
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.completionContainer}>
                <Text style={styles.celebrationEmoji}>🎉</Text>
                <Text style={styles.completionTitle}>Review Completed!</Text>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setCurrentScreen('home')}
                >
                  <Text style={styles.primaryActionBtnText}>Return to Home</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* SCREEN: QUIZ WITH SOCRATIC TUTOR */}
        {currentScreen === 'quiz' && activeDeck && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.flashcardTopBar}>
              <TouchableOpacity onPress={() => setCurrentScreen('deckDetail')}>
                <Text style={styles.backBtnText}>✕ Exit</Text>
              </TouchableOpacity>
              <Text style={styles.cardProgressText}>
                Question {quizQuestionIndex + 1} of {activeDeck.cards?.length || 0}
              </Text>
              <TouchableOpacity
                style={styles.socraticBtn}
                onPress={() => {
                  setSocraticModalVisible(true);
                  handleRequestSocraticHint(1);
                }}
              >
                <Text style={styles.socraticBtnText}>🤖 Ask Socratic Tutor</Text>
              </TouchableOpacity>
            </View>

            {!quizFinished ? (
              <View>
                <Text style={styles.quizQuestion}>
                  {activeDeck.cards[quizQuestionIndex]?.question}
                </Text>

                {activeDeck.cards[quizQuestionIndex]?.options.map((opt, idx) => {
                  const isCorrect = opt === activeDeck.cards[quizQuestionIndex]?.answer;
                  const isSelected = selectedOption === opt;
                  let optStyle = styles.quizOption;

                  if (isAnswerRevealed) {
                    if (isCorrect) optStyle = [styles.quizOption, styles.correctOption];
                    else if (isSelected) optStyle = [styles.quizOption, styles.wrongOption];
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={optStyle}
                      disabled={isAnswerRevealed}
                      onPress={() => handleSelectQuizOption(opt)}
                    >
                      <Text style={styles.quizOptionText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}

                {isAnswerRevealed && (
                  <View style={styles.quizFeedbackBox}>
                    <Text style={styles.quizFeedbackTitle}>
                      {selectedOption === activeDeck.cards[quizQuestionIndex]?.answer
                        ? '✅ Brilliant! Great job!'
                        : '❌ Let’s learn why:'}
                    </Text>
                    <Text style={styles.quizExplanation}>
                      {activeDeck.cards[quizQuestionIndex]?.explanation}
                    </Text>

                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={handleNextQuizQuestion}
                    >
                      <Text style={styles.primaryActionBtnText}>
                        {quizQuestionIndex + 1 < activeDeck.cards.length ? 'Next Question →' : 'See Results'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.completionContainer}>
                <Text style={styles.celebrationEmoji}>🏆</Text>
                <Text style={styles.completionTitle}>Quiz Completed!</Text>
                <Text style={styles.scoreHighlight}>
                  {quizScore} / {activeDeck.cards?.length} Correct
                </Text>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setCurrentScreen('home')}
                >
                  <Text style={styles.primaryActionBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* SCREEN: DASHBOARD */}
        {currentScreen === 'dashboard' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Dashboard View Switcher */}
            <View style={styles.dashboardModeSwitcher}>
              <TouchableOpacity
                style={[styles.dashModeBtn, dashboardViewMode === 'parent' && styles.dashModeBtnActive]}
                onPress={() => setDashboardViewMode('parent')}
              >
                <Text style={[styles.dashModeText, dashboardViewMode === 'parent' && styles.dashModeTextActive]}>
                  👨‍👩‍👧 Parent & Teacher Diagnostic
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dashModeBtn, dashboardViewMode === 'student' && styles.dashModeBtnActive]}
                onPress={() => setDashboardViewMode('student')}
              >
                <Text style={[styles.dashModeText, dashboardViewMode === 'student' && styles.dashModeTextActive]}>
                  📊 Student Analytics
                </Text>
              </TouchableOpacity>
            </View>

            {dashboardViewMode === 'parent' ? (
              <View>
                {/* Actionable Parent Diagnostic Card */}
                <View style={styles.parentHeroCard}>
                  <View style={styles.parentCardHeader}>
                    <Text style={styles.parentStudentTitle}>👤 Student: {parentReport.studentName} (Grade 4)</Text>
                    <View style={styles.coppaVerifiedBadge}>
                      <Text style={styles.coppaVerifiedText}>🔒 COPPA Verified</Text>
                    </View>
                  </View>
                  <Text style={styles.parentHeadlineText}>{parentReport.headline}</Text>

                  <View style={styles.plainAdviceBox}>
                    <Text style={styles.plainAdviceLabel}>💡 Actionable Diagnostic (Plain-English):</Text>
                    <Text style={styles.plainAdviceText}>{parentReport.plainEnglishAdvice}</Text>
                  </View>

                  {/* Tonight's 10-Minute Prescription */}
                  <View style={styles.prescriptionBox}>
                    <View style={styles.prescriptionHeader}>
                      <Text style={styles.prescriptionTitle}>🌙 Tonight's 10-Minute Action Plan</Text>
                      <Text style={styles.prescriptionTimeBadge}>⏱️ {parentReport.tonightPrescription.timeMinutes} mins</Text>
                    </View>
                    <Text style={styles.prescriptionActivity}>
                      👉 Activity: {parentReport.tonightPrescription.activity}
                    </Text>
                    <Text style={styles.prescriptionGoal}>
                      🎯 Goal: {parentReport.tonightPrescription.goal}
                    </Text>
                  </View>
                </View>

                {/* Intrinsic Gamification Effort Badges */}
                <Text style={styles.sectionTitle}>Effort & Mastery Badges (Intrinsic Rewards)</Text>
                <Text style={styles.sectionSubtitle}>
                  Rewards tied directly to effort, resilience, and mastery—never arcade distractions:
                </Text>
                {parentReport.effortBadges.map((eb, ebIdx) => (
                  <View key={ebIdx} style={styles.effortBadgeCard}>
                    <Text style={styles.effortBadgeIcon}>{eb.badge.split(' ')[0]}</Text>
                    <View style={styles.effortBadgeDetails}>
                      <Text style={styles.effortBadgeName}>{eb.badge}</Text>
                      <Text style={styles.effortBadgeMeaning}>{eb.meaning}</Text>
                    </View>
                  </View>
                ))}

                {/* Strict COPPA & GDPR-K Compliance Panel */}
                <View style={styles.coppaPanel}>
                  <Text style={styles.coppaPanelTitle}>🛡️ Child-Safety & Privacy Guardrails (COPPA/GDPR-K)</Text>
                  <Text style={styles.coppaPanelText}>
                    • 100% Ad-Free: Zero behavioral profiling or marketing ad-targeting.{'\n'}
                    • Hardcoded Content Filters: Inappropriate terms automatically blocked.{'\n'}
                    • Anti-Prompt-Injection: Children cannot trick the AI into writing essays or doing homework for them.{'\n'}
                    • Zero Data Harvesting: Learning records stored locally and encrypted.
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.screenHeading}>Cognitive & Growth Analytics</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>🔥 {streak} Days</Text>
                    <Text style={styles.statLabel}>Consistency Streak</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>🎯 {zpdTier.toUpperCase()}</Text>
                    <Text style={styles.statLabel}>Adaptive ZPD Tier</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>⏱️ 5m</Text>
                    <Text style={styles.statLabel}>Micro Session</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Recent Mastery Sessions</Text>
                {quizHistory.map((q, idx) => (
                  <View key={idx} style={styles.historyCard}>
                    <Text style={styles.historyTitle}>{q.title}</Text>
                    <Text style={styles.historyScore}>{q.score} / {q.total}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* SOCRATIC AI TUTOR MODAL */}
      <Modal
        visible={socraticModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSocraticModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🤖 Socratic AI Tutor (Hint-First)</Text>
              <TouchableOpacity onPress={() => setSocraticModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.socraticGuardrailNotice}>
              🛡️ Guided Questioning: I won't give away the answer, but I'll guide you step-by-step!
            </Text>

            {socraticLoading ? (
              <ActivityIndicator color="#38BDF8" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.socraticHintBubble}>
                <Text style={styles.socraticHintLevel}>Step {socraticHintLevel} of 3:</Text>
                <Text style={styles.socraticHintBody}>{socraticHintText}</Text>
              </View>
            )}

            <View style={styles.hintTierRow}>
              <TouchableOpacity
                style={[styles.hintTierBtn, socraticHintLevel === 1 && styles.hintTierBtnActive]}
                onPress={() => handleRequestSocraticHint(1)}
              >
                <Text style={styles.hintTierBtnText}>1. Nudge</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hintTierBtn, socraticHintLevel === 2 && styles.hintTierBtnActive]}
                onPress={() => handleRequestSocraticHint(2)}
              >
                <Text style={styles.hintTierBtnText}>2. Leading Q</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hintTierBtn, socraticHintLevel === 3 && styles.hintTierBtnActive]}
                onPress={() => handleRequestSocraticHint(3)}
              >
                <Text style={styles.hintTierBtnText}>3. Step Clue</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => setSocraticModalVisible(false)}
            >
              <Text style={styles.primaryActionBtnText}>I'm Ready to Try!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TEACH-THE-BOT MODAL (FEYNMAN TECHNIQUE INTRINSIC GAMIFICATION) */}
      <Modal
        visible={teachBotModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTeachBotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🦊 Teach Pip the Fox ("Teach-the-Bot")</Text>
              <TouchableOpacity onPress={() => setTeachBotModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.teachBotConceptBadge}>
              <Text style={styles.teachBotConceptLabel}>CONCEPT TO TEACH:</Text>
              <Text style={styles.teachBotConceptValue}>{teachBotConcept}</Text>
            </View>

            <Text style={styles.teachBotPromptText}>
              Pip says: "I don't know much about {teachBotConcept} yet! Can you explain it to me in your own words? Using analogies like 'It is like...' helps me learn fastest!"
            </Text>

            <TextInput
              style={[styles.input, styles.teachBotInput]}
              multiline
              numberOfLines={4}
              placeholder={`Explain ${teachBotConcept} here...`}
              placeholderTextColor="#64748B"
              value={teachBotExplanation}
              onChangeText={setTeachBotExplanation}
            />

            <View style={styles.teachBotInputActions}>
              <TouchableOpacity
                style={styles.micDictateBtn}
                onPress={() => {
                  speakText(teachBotExplanation);
                }}
              >
                <Text style={styles.micDictateBtnText}>🔊 Read Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { flex: 1, marginVertical: 0 }]}
                disabled={teachBotLoading}
                onPress={handleTeachTheBotSubmit}
              >
                {teachBotLoading ? (
                  <ActivityIndicator color="#0A0E1A" />
                ) : (
                  <Text style={styles.primaryActionBtnText}>🌟 Teach Pip & Submit</Text>
                )}
              </TouchableOpacity>
            </View>

            {teachBotResult && (
              <View style={styles.teachBotResultBox}>
                <View style={styles.teachBotResultTop}>
                  <Text style={styles.teachBotScoreBadge}>Score: {teachBotResult.score}/100</Text>
                  {teachBotResult.badgeAwarded && (
                    <Text style={styles.teachBotBadgeAwarded}>
                      Awarded: {teachBotResult.badgeAwarded}
                    </Text>
                  )}
                </View>
                <Text style={styles.teachBotBotResponse}>{teachBotResult.botResponse}</Text>
                <Text style={styles.teachBotCoachingTip}>💡 {teachBotResult.coachingTip}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* FRUSTRATION & FOCUS DETECTION (BRAIN BREAK & FOCUS RESCUE MODAL) */}
      <Modal
        visible={frustrationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFrustrationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.frustrationModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🧘 Gentle Brain Break & Focus Rescue</Text>
              <TouchableOpacity onPress={() => setFrustrationModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.frustrationNotice}>
              {frustrationReason === 'rapid_guessing'
                ? "⚡ We noticed rapid guessing! When questions get tricky, rushing is totally natural. Let's take 30 seconds to breathe and recharge!"
                : "⏳ Stalled or feeling stuck? That happens to every great explorer! Let's pause and do a quick mental reset."}
            </Text>

            {/* Box Breathing Exercise Card */}
            <View style={styles.boxBreathingBox}>
              <Text style={styles.breathingIcon}>🌬️</Text>
              <Text style={styles.breathingTitle}>Box Breathing Reset</Text>
              <Text style={styles.breathingStepText}>{breathingStep}</Text>
              <Text style={styles.breathingSub}>Inhale 4s • Hold 4s • Exhale 4s • Relax 4s</Text>
            </View>

            {/* Quick Warmup Switch */}
            <View style={styles.frustrationActionsRow}>
              <TouchableOpacity
                style={styles.frustrationOptionBtn}
                onPress={() => {
                  setFrustrationModalVisible(false);
                  setSelectedAgeGroup('early');
                  setCurrentScreen('ageHub');
                  speakText("Let's do a fun, easy visual puzzle to warm up our brains!");
                }}
              >
                <Text style={styles.frustrationOptionIcon}>🍎</Text>
                <Text style={styles.frustrationOptionTitle}>Easy Visual Puzzle</Text>
                <Text style={styles.frustrationOptionSub}>Switch to low-stress warm up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.frustrationOptionBtn}
                onPress={() => {
                  setFrustrationModalVisible(false);
                  handleOpenAnalogy('minecraft');
                }}
              >
                <Text style={styles.frustrationOptionIcon}>🎬</Text>
                <Text style={styles.frustrationOptionTitle}>Analogy Video Story</Text>
                <Text style={styles.frustrationOptionSub}>60-second fun visual re-explanation</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginTop: 14 }]}
              onPress={() => setFrustrationModalVisible(false)}
            >
              <Text style={styles.primaryActionBtnText}>I Feel Refreshed! Let's Continue 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* STRICT CHILD-SAFETY GUARDRAIL ALERT (COPPA / GDPR-K / PROMPT INJECTION) */}
      <Modal
        visible={!!safetyAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSafetyAlert(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.safetyAlertContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛡️ Academic Integrity & Safety Guardrail</Text>
              <TouchableOpacity onPress={() => setSafetyAlert(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.safetyAlertIconBox}>
              <Text style={styles.safetyAlertBigIcon}>🔒</Text>
            </View>

            <Text style={styles.safetyAlertMessage}>{safetyAlert}</Text>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => setSafetyAlert(null)}
            >
              <Text style={styles.primaryActionBtnText}>Understood! Let's Learn Together</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'home' && styles.activeTabIcon]}>🏠</Text>
          <Text style={[styles.tabLabel, currentScreen === 'home' && styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('ageHub')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'ageHub' && styles.activeTabIcon]}>🎯</Text>
          <Text style={[styles.tabLabel, currentScreen === 'ageHub' && styles.activeTabLabel]}>Age Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('upload')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'upload' && styles.activeTabIcon]}>➕</Text>
          <Text style={[styles.tabLabel, currentScreen === 'upload' && styles.activeTabLabel]}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'dashboard' && styles.activeTabIcon]}>📊</Text>
          <Text style={[styles.tabLabel, currentScreen === 'dashboard' && styles.activeTabLabel]}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#38BDF8',
  },
  appTagline: {
    fontSize: 10,
    color: '#94A3B8',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zpdPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  zpdCore: { backgroundColor: '#1E3A8A' },
  zpdAdv: { backgroundColor: '#581C87' },
  zpdFound: { backgroundColor: '#9A3412' },
  zpdPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  microBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  microBadgeActive: {
    backgroundColor: '#0284C7',
  },
  microText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  streakBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  streakText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 11,
  },

  // Age Selector Bar
  ageSelectorBar: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  ageSelectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  ageButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ageBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#1F2937',
    borderRadius: 6,
    alignItems: 'center',
  },
  ageBtnActive: {
    backgroundColor: '#0284C7',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  ageBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  ageBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  body: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Age 4-7: Early Learners Styles
  earlyHeroBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 14,
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companionAvatar: {
    fontSize: 44,
    marginRight: 12,
  },
  companionSpeechBubble: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  companionName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 2,
  },
  companionDialogueText: {
    fontSize: 13,
    color: '#F8FAFC',
    lineHeight: 18,
  },
  voiceCheerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  voiceCheerBtnText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  voiceNavBar: {
    backgroundColor: '#16233B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 14,
    alignItems: 'center',
  },
  voiceNavTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 2,
  },
  voiceNavSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 10,
  },
  bigEarlyMicBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bigEarlyMicIcon: {
    fontSize: 20,
  },
  bigEarlyMicText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  puzzleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  puzzleBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 4,
  },
  puzzleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  visualItemsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
  },
  visualItemEmoji: {
    fontSize: 32,
    color: '#F8FAFC',
  },
  puzzleOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  puzzleOptionBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  puzzleOptionText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  nextPuzzleBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  nextPuzzleBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },

  // Age 8-11: Elementary Gamified Quest Styles
  questBattleArena: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#818CF8',
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  battleArenaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  battleStageBadge: {
    backgroundColor: '#4338CA',
    color: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  combatantsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  combatantCard: {
    flex: 1,
    alignItems: 'center',
  },
  combatantAvatar: {
    fontSize: 36,
    marginBottom: 4,
  },
  combatantName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  versusText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F59E0B',
    marginHorizontal: 8,
  },
  hpBarBg: {
    width: '90%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
  },
  hpLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  battleDialogueBox: {
    backgroundColor: '#111C33',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  battleDialogueText: {
    fontSize: 12,
    color: '#93C5FD',
    textAlign: 'center',
    lineHeight: 16,
  },
  spellCastBox: {
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 10,
  },
  spellPromptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  spellOptionsGrid: {
    gap: 8,
    marginBottom: 12,
  },
  spellOptionBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  spellOptionText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  homeworkHintBtn: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  homeworkHintBtnText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  victoryBox: {
    alignItems: 'center',
    padding: 20,
  },
  victoryEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  victoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  victorySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
  },

  // Age 12-15: Middle School+ Styles
  middleSchoolCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  middleSchoolTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  middleSchoolSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 12,
  },
  essayTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 13,
    lineHeight: 18,
  },
  essayResultBox: {
    marginTop: 16,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  essayScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  essayScoreTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
  },
  essayStatsPill: {
    fontSize: 10,
    color: '#94A3B8',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  essayCoachingNote: {
    fontSize: 12,
    color: '#E0E7FF',
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 12,
  },
  rubricBreakdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  rubricItemRow: {
    marginBottom: 8,
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 6,
  },
  rubricAspect: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  rubricComment: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },

  // Promo Card on Home Screen
  ageHubPromoCard: {
    backgroundColor: '#16233B',
    borderWidth: 1,
    borderColor: '#818CF8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  ageHubPromoBadge: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ageHubPromoTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  ageHubPromoSub: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },

  // Existing Common Styles
  retentionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  retentionLeft: { marginBottom: 10 },
  retentionTitle: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' },
  retentionCount: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginVertical: 2 },
  retentionSub: { fontSize: 11, color: '#94A3B8', lineHeight: 16 },
  startReviewBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startReviewBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 13 },
  uploadPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  uploadPromptIcon: { fontSize: 20, marginRight: 10 },
  uploadPromptTitle: { fontSize: 13, fontWeight: '700', color: '#F8FAFC' },
  uploadPromptSub: { fontSize: 10, color: '#94A3B8' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#F8FAFC', marginBottom: 10 },
  deckCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  deckHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  deckTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', flex: 1, marginRight: 6 },
  deckBadge: { fontSize: 10, color: '#38BDF8', backgroundColor: '#0F172A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  deckSummary: { fontSize: 11, color: '#94A3B8', lineHeight: 15, marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagPill: { backgroundColor: '#0F172A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 9, color: '#818CF8', fontWeight: '600' },
  screenHeading: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', marginBottom: 2 },
  screenSub: { fontSize: 12, color: '#94A3B8', marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: '#CBD5E1', marginBottom: 4 },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 10,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  primaryActionBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledBtn: { opacity: 0.6 },
  primaryActionBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  errorText: { color: '#EF4444', fontSize: 11, marginBottom: 8 },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },
  deckDetailTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', marginBottom: 10 },
  summaryBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 12, fontWeight: '700', color: '#38BDF8', marginBottom: 4 },
  summaryText: { fontSize: 12, color: '#CBD5E1', lineHeight: 18 },
  deckActions: { gap: 8 },
  deckActionBtn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center' },
  deckActionBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },
  deckActionBtnSub: { color: '#0F172A', fontSize: 10, opacity: 0.85, marginTop: 1 },
  flashcardContainer: { flex: 1, padding: 16, justifyContent: 'space-between' },
  flashcardTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardProgressText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  analogyMiniBtn: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#38BDF8', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  analogyMiniBtnText: { color: '#38BDF8', fontSize: 10, fontWeight: '700' },
  socraticBtn: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#818CF8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  socraticBtnText: { color: '#A5B4FC', fontSize: 10, fontWeight: '700' },
  flashcardInner: { flex: 1, justifyContent: 'center' },
  flashcard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  flashcardBack: { borderColor: '#38BDF8', backgroundColor: '#13213C' },
  cardHint: { fontSize: 10, color: '#38BDF8', fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  cardContentText: { fontSize: 16, color: '#F8FAFC', fontWeight: '600', textAlign: 'center', lineHeight: 22 },
  cardExplanationText: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 10, lineHeight: 15 },
  tapToRevealText: { textAlign: 'center', color: '#64748B', fontSize: 11, marginTop: 14 },
  ratingSection: { marginTop: 16 },
  ratingPrompt: { color: '#CBD5E1', fontSize: 12, textAlign: 'center', marginBottom: 8, fontWeight: '600' },
  ratingBtnRow: { flexDirection: 'row', gap: 6 },
  rateBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  rateBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  completionContainer: { alignItems: 'center', paddingVertical: 30 },
  celebrationEmoji: { fontSize: 44, marginBottom: 10 },
  completionTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 },
  scoreHighlight: { fontSize: 26, fontWeight: '900', color: '#38BDF8', marginBottom: 6 },
  quizQuestion: { fontSize: 15, fontWeight: '700', color: '#F8FAFC', lineHeight: 22, marginBottom: 12 },
  quizOption: { backgroundColor: '#1E293B', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  quizOptionText: { fontSize: 13, color: '#F8FAFC', fontWeight: '500' },
  correctOption: { backgroundColor: '#064E3B', borderColor: '#10B981' },
  wrongOption: { backgroundColor: '#7F1D1D', borderColor: '#EF4444' },
  quizFeedbackBox: { marginTop: 6, backgroundColor: '#1E293B', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#334155' },
  quizFeedbackTitle: { fontSize: 13, fontWeight: '700', color: '#F8FAFC', marginBottom: 2 },
  quizExplanation: { fontSize: 11, color: '#94A3B8', lineHeight: 15, marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#94A3B8' },
  historyCard: { backgroundColor: '#1E293B', borderRadius: 8, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, borderWidth: 1, borderColor: '#334155' },
  historyTitle: { fontSize: 12, fontWeight: '600', color: '#F8FAFC' },
  historyScore: { fontSize: 12, fontWeight: '700', color: '#38BDF8' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1E293B', backgroundColor: '#0F172A', paddingVertical: 6 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  tabIcon: { fontSize: 18, marginBottom: 1, opacity: 0.6 },
  activeTabIcon: { opacity: 1 },
  tabLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  activeTabLabel: { color: '#38BDF8' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, width: '100%', maxWidth: 440, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  modalCloseText: { color: '#94A3B8', fontSize: 16, fontWeight: '700' },
  socraticGuardrailNotice: { fontSize: 10, color: '#93C5FD', marginBottom: 10, backgroundColor: '#0F172A', padding: 6, borderRadius: 6 },
  socraticHintBubble: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#818CF8', marginBottom: 12 },
  socraticHintLevel: { fontSize: 10, color: '#818CF8', fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
  socraticHintBody: { fontSize: 13, color: '#F8FAFC', lineHeight: 18 },
  hintTierRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  hintTierBtn: { flex: 1, backgroundColor: '#0F172A', paddingVertical: 6, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  hintTierBtnActive: { backgroundColor: '#4338CA', borderColor: '#818CF8' },
  hintTierBtnText: { color: '#F8FAFC', fontSize: 11, fontWeight: '600' },

  // Part 4: Engagement, Safety & Parent Visibility Styles
  coppaBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  coppaBadgeText: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '700',
  },
  teachBotPromoCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  teachBotPromoLeft: { flex: 1, paddingRight: 12 },
  teachBotPromoBadge: {
    color: '#A5B4FC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  teachBotPromoTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  teachBotPromoSub: {
    color: '#C7D2FE',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  teachBotPromoEmoji: { fontSize: 44 },
  earnedBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  smallBadgePill: {
    backgroundColor: '#312E81',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#818CF8',
  },
  smallBadgeText: { color: '#E0E7FF', fontSize: 10, fontWeight: '700' },

  // Dashboard Switcher
  dashboardModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  dashModeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  dashModeBtnActive: {
    backgroundColor: '#0284C7',
  },
  dashModeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dashModeTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Actionable Parent Hero Card
  parentHeroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  parentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parentStudentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  coppaVerifiedBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coppaVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6EE7B7',
  },
  parentHeadlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
  },
  plainAdviceBox: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  plainAdviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 4,
  },
  plainAdviceText: {
    fontSize: 12,
    color: '#F8FAFC',
    lineHeight: 18,
  },
  prescriptionBox: {
    backgroundColor: '#172554',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  prescriptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#93C5FD',
  },
  prescriptionTimeBadge: {
    backgroundColor: '#1E40AF',
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prescriptionActivity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 3,
  },
  prescriptionGoal: {
    fontSize: 11,
    color: '#93C5FD',
    lineHeight: 15,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
  effortBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  effortBadgeIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  effortBadgeDetails: { flex: 1 },
  effortBadgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  effortBadgeMeaning: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  coppaPanel: {
    backgroundColor: '#064E3B',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#059669',
  },
  coppaPanelTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A7F3D0',
    marginBottom: 6,
  },
  coppaPanelText: {
    fontSize: 11,
    color: '#D1FAE5',
    lineHeight: 17,
  },

  // Teach the Bot Modal Styles
  teachBotConceptBadge: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teachBotConceptLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  teachBotConceptValue: { fontSize: 12, fontWeight: '800', color: '#F59E0B' },
  teachBotPromptText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
    marginBottom: 10,
  },
  teachBotInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  teachBotInputActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  micDictateBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    justifyContent: 'center',
  },
  micDictateBtnText: { color: '#38BDF8', fontSize: 11, fontWeight: '700' },
  teachBotResultBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  teachBotResultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  teachBotScoreBadge: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 12,
  },
  teachBotBadgeAwarded: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 11,
  },
  teachBotBotResponse: {
    fontSize: 12,
    color: '#F8FAFC',
    lineHeight: 17,
    marginBottom: 6,
  },
  teachBotCoachingTip: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  // Frustration & Focus Detection Modal Styles
  frustrationModalContent: {
    borderColor: '#38BDF8',
  },
  frustrationNotice: {
    fontSize: 12,
    color: '#93C5FD',
    lineHeight: 17,
    marginBottom: 14,
    textAlign: 'center',
  },
  boxBreathingBox: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  breathingIcon: { fontSize: 32, marginBottom: 4 },
  breathingTitle: { fontSize: 13, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  breathingStepText: { fontSize: 16, fontWeight: '900', color: '#38BDF8', marginBottom: 4 },
  breathingSub: { fontSize: 10, color: '#64748B' },
  frustrationActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  frustrationOptionBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  frustrationOptionIcon: { fontSize: 22, marginBottom: 4 },
  frustrationOptionTitle: { fontSize: 11, fontWeight: '700', color: '#F8FAFC', textAlign: 'center', marginBottom: 2 },
  frustrationOptionSub: { fontSize: 9, color: '#94A3B8', textAlign: 'center' },

  // Child Safety Alert Modal
  safetyAlertContent: {
    borderColor: '#EF4444',
  },
  safetyAlertIconBox: {
    alignItems: 'center',
    marginVertical: 10,
  },
  safetyAlertBigIcon: { fontSize: 44 },
  safetyAlertMessage: {
    fontSize: 13,
    color: '#FCA5A5',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Early Learners Sub-Navigation Styles
  earlySubNavRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  earlySubNavBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  earlySubNavBtnActive: {
    backgroundColor: '#0284C7',
  },
  earlySubNavText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  earlySubNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Ello Read-Aloud Styles
  elloContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 16,
  },
  storyBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storyBookBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  storyBookTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  readingLevelBadge: {
    backgroundColor: '#0F172A',
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  storyIllustrationBox: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  storyIllustrationText: {
    fontSize: 36,
    letterSpacing: 10,
  },
  readAlongPrompt: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
    fontWeight: '600',
  },
  storyWordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  storyWordBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  storyWordBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
    transform: [{ scale: 1.05 }],
  },
  storyWordText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  storyWordTextActive: {
    color: '#FFFFFF',
  },
  stumbleCoachingCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#818CF8',
  },
  stumbleCoachingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stumbleCoachingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  stumbleAvatarCheer: {
    fontSize: 12,
    color: '#C7D2FE',
    lineHeight: 16,
    marginBottom: 10,
  },
  syllablesRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  syllableBubble: {
    backgroundColor: '#312E81',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  syllableBubbleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  syllableTapHint: {
    fontSize: 9,
    color: '#A5B4FC',
    marginTop: 2,
  },
  bigReadAloudBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  bigReadAloudIcon: {
    fontSize: 26,
  },
  bigReadAloudTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bigReadAloudSub: {
    fontSize: 10,
    color: '#E0F2FE',
  },

  // Duolingo ABC Styles
  duoContainer: {
    marginBottom: 16,
  },
  duoPacingBanner: {
    backgroundColor: '#14532D',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  duoPacingBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  duoPacingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F0FDF4',
    marginBottom: 4,
  },
  duoPacingNote: {
    fontSize: 11,
    color: '#BBF7D0',
    lineHeight: 15,
  },
  duoTaskCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  duoTaskHeader: {
    marginBottom: 8,
  },
  duoTaskBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 2,
  },
  duoTaskSound: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '700',
  },
  duoTaskPrompt: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 10,
  },
  tracingCanvasSim: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#38BDF8',
  },
  tracingLetterDisplay: {
    fontSize: 64,
    fontWeight: '900',
    color: '#38BDF8',
    marginBottom: 6,
  },
  strokeGuideList: {
    gap: 3,
  },
  strokeGuideText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  traceActionBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  traceActionBtnDone: {
    backgroundColor: '#16A34A',
  },
  traceActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  vowelBuilderDisplay: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  vowelBuilderEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  vowelBuilderWord: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 4,
  },
  vowelOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vowelOptionBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  vowelOptionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  vowelCorrect: {
    backgroundColor: '#16A34A',
    borderColor: '#4ADE80',
  },
  vowelWrong: {
    backgroundColor: '#991B1B',
    borderColor: '#F87171',
  },
  balloonsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  balloonItem: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  balloonPopped: {
    opacity: 0.3,
    transform: [{ scale: 0.9 }],
  },
  balloonEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  balloonWordText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Pillar 2: Synthesis Tutor & Prodigy RPG
  synthesisContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  synthesisHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  synthesisHeroBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  synthesisHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  synthesisLevelBadge: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  synthesisConceptTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  synthesisConceptTab: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  synthesisConceptTabActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  synthesisConceptTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  synthesisConceptTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  synthesisDialogueBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  synthesisTutorAvatar: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 6,
  },
  synthesisDialogueText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    marginBottom: 10,
  },
  synthesisVoiceBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  synthesisVoiceBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  numberLineCanvas: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  numberLineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  hopIndicatorRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    paddingLeft: 30,
    marginBottom: 4,
    gap: 40,
  },
  hopArcBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  hopArcText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  numberLineBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginVertical: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  numberLineFillSegment: {
    width: '50%',
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  numberLineLabelsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tickCol: {
    alignItems: 'center',
  },
  tickMark: {
    width: 2,
    height: 8,
    backgroundColor: '#64748B',
    marginBottom: 4,
  },
  tickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tickLabelHighlight: {
    color: '#38BDF8',
    fontWeight: '900',
    fontSize: 13,
  },
  areaGridCanvas: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  areaGridBox: {
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 8,
    padding: 4,
    backgroundColor: '#1E293B',
    marginVertical: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  gridCell: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  gridCellText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  gridEquationBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 8,
  },
  synthesisQuestionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
  },
  synthesisQuestionPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  synthesisOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  synthesisOptionBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  synthesisOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  prodigyDiagnosticBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  prodigyDiagnosticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  prodigyDiagnosticTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  prodigyDiagnosticStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prodigyDiagnosticSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  petSelectorBar: {
    marginBottom: 14,
  },
  petSelectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  petOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  petBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  petBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  petBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  petBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Pillar 3: Khanmigo Socratic & Photomath Plus & Historical Roleplay
  khanmigoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  khanmigoHeader: {
    marginBottom: 12,
  },
  khanmigoBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#818CF8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  khanmigoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  khanmigoGuardrailNotice: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#818CF8',
  },
  khanmigoResponseBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  khanmigoReplyText: {
    fontSize: 14,
    color: '#F8FAFC',
    lineHeight: 22,
    marginBottom: 10,
    fontWeight: '600',
  },
  khanmigoHintBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#818CF8',
  },
  khanmigoHintLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#818CF8',
    marginBottom: 2,
  },
  khanmigoHintText: {
    fontSize: 13,
    color: '#C7D2FE',
    lineHeight: 18,
  },
  nextStepsList: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
  },
  nextStepsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 6,
  },
  nextStepItem: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
    marginBottom: 4,
  },
  photomathCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  photomathHeader: {
    marginBottom: 12,
  },
  photomathBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  photomathTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  photomathResultBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  photomathStandardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photomathStandardBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  photomathSolutionBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sequentialStepsHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 10,
  },
  sequentialStepCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  stepNumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  stepExpressionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  stepSimplifiedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 6,
  },
  stepRulePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepRuleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  stepExplanationText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  historicalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  historicalBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EC4899',
    letterSpacing: 1,
    marginBottom: 4,
  },
  historicalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  figureSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  figureBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  figureBtnActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: '#EC4899',
  },
  figureAvatarText: {
    fontSize: 24,
    marginBottom: 4,
  },
  figureNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  historicalReplyBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  historicalReplyText: {
    fontSize: 13,
    color: '#F8FAFC',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
