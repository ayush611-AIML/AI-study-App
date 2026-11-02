// API Service for Recapify Mobile & Web App
const BASE_URL = 'http://localhost:5000';

class ApiService {
  constructor() {
    this.token = null;
    this.currentUser = null;
    this.init();
  }

  init() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.token = localStorage.getItem('recapify_token');
        const user = localStorage.getItem('recapify_user');
        if (user) this.currentUser = JSON.parse(user);
      }
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  }

  setAuth(token, user) {
    this.token = token;
    this.currentUser = user;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (token) localStorage.setItem('recapify_token', token);
        if (user) localStorage.setItem('recapify_user', JSON.stringify(user));
      }
    } catch (e) {}
  }

  clearAuth() {
    this.token = null;
    this.currentUser = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('recapify_token');
        localStorage.removeItem('recapify_user');
      }
    } catch (e) {}
  }

  async request(endpoint, options = {}) {
    const headers = options.headers || {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }
      return data;
    } catch (err) {
      console.warn(`[API] Error on ${endpoint}: ${err.message}`);
      throw err;
    }
  }

  // Auth
  async signup(name, email, password) {
    const res = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  // Notes
  async uploadNote({ title, text, file, sourceType = 'text' }) {
    if (file) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      formData.append('sourceType', sourceType);
      return this.request('/notes', {
        method: 'POST',
        body: formData,
      });
    }

    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, text, sourceType }),
    });
  }

  // Decks
  async generateDeck(noteId, maxCards = 15) {
    return this.request('/decks/generate', {
      method: 'POST',
      body: JSON.stringify({ noteId, maxCards }),
    });
  }

  async getDecks() {
    return this.request('/decks');
  }

  async getDeckById(deckId) {
    return this.request(`/decks/${deckId}`);
  }

  // Reviews (SM-2)
  async getTodayReviews() {
    return this.request('/reviews/today');
  }

  async submitReviewRating(cardId, rating) {
    return this.request(`/reviews/${cardId}`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  // Quiz
  async submitQuizAttempt(deckId, answers) {
    return this.request(`/quizzes/${deckId}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // Stats / Dashboard
  async getStats() {
    return this.request('/stats');
  }

  // Pedagogical & Adaptive Tutoring Features
  async getAnalogy(concept, context, interest = 'minecraft') {
    return this.request('/tutoring/analogy', {
      method: 'POST',
      body: JSON.stringify({ concept, context, interest }),
    });
  }

  async getSocraticHint(question, correctAnswer, explanation, hintLevel = 1, studentAttempt = null) {
    return this.request('/tutoring/hint', {
      method: 'POST',
      body: JSON.stringify({ question, correctAnswer, explanation, hintLevel, studentAttempt }),
    });
  }

  async evaluateZPD(responseTimeMs, isCorrect, hesitationCount = 0, currentTier = 'core') {
    return this.request('/tutoring/adaptive-eval', {
      method: 'POST',
      body: JSON.stringify({ responseTimeMs, isCorrect, hesitationCount, currentTier }),
    });
  }

  // Multimodal & Accessibility Features
  async coachPronunciation(targetText, spokenText) {
    return this.request('/multimodal/pronounce', {
      method: 'POST',
      body: JSON.stringify({ targetText, spokenText }),
    });
  }

  async analyzeHandwritingSteps(problem, steps) {
    return this.request('/multimodal/analyze-handwriting', {
      method: 'POST',
      body: JSON.stringify({ problem, steps }),
    });
  }

  async generateStoryStep(theme, character, choiceHistory, currentChoice) {
    return this.request('/multimodal/story-step', {
      method: 'POST',
      body: JSON.stringify({ theme, character, choiceHistory, currentChoice }),
    });
  }

  // Age-Specific Features (Ages 4-7, 8-11, 12-15)
  async getEssayFeedback(title, text) {
    return this.request('/age-modes/essay-feedback', {
      method: 'POST',
      body: JSON.stringify({ title, text }),
    });
  }

  async getBattleQuest(stage = 1) {
    return this.request(`/age-modes/battle-quest?stage=${stage}`);
  }

  async getEarlyPuzzles() {
    return this.request('/age-modes/early-puzzles');
  }

  // Part 4: Engagement, Safety & Parent Visibility
  async checkSafety(text) {
    return this.request('/safety/check', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async teachTheBot(concept, explanation) {
    return this.request('/safety/teach-bot', {
      method: 'POST',
      body: JSON.stringify({ concept, explanation }),
    });
  }

  async getParentDashboard(studentName = 'Aarav', topicStats = []) {
    return this.request('/safety/parent-dashboard', {
      method: 'POST',
      body: JSON.stringify({ studentName, topicStats }),
    });
  }

  // Deep Dive: Early Learners (Ages 3-8) Literacy & Foundational Numeracy
  async getEarlyStorybooks() {
    return this.request('/early-learners/storybooks');
  }

  async coachEarlyWord(targetWord, spokenWord) {
    return this.request('/early-learners/coach-word', {
      method: 'POST',
      body: JSON.stringify({ targetWord, spokenWord }),
    });
  }

  async getDuolingoAbcSession(strugglingVowels = 'short_a,short_o') {
    return this.request(`/early-learners/duolingo-abc-session?strugglingVowels=${encodeURIComponent(strugglingVowels)}`);
  }

  // Deep Dive: Elementary School (Ages 6-11)
  async getSynthesisIntuition(conceptId = '') {
    return this.request(`/elem-sec/synthesis/intuition?conceptId=${conceptId}`);
  }

  async getProdigyRpgBattle(playerLevel = 1, currentPet = 'Flame Fox') {
    return this.request(`/elem-sec/prodigy/battle?playerLevel=${playerLevel}&currentPet=${encodeURIComponent(currentPet)}`);
  }

  // Deep Dive: Upper Elementary to High School (Ages 9-18)
  async askKhanmigoSocratic(problem, studentThought = '') {
    return this.request('/elem-sec/khanmigo/socratic-query', {
      method: 'POST',
      body: JSON.stringify({ problem, studentThought }),
    });
  }

  async chatHistoricalFigure(figure, query) {
    return this.request('/elem-sec/khanmigo/historical-chat', {
      method: 'POST',
      body: JSON.stringify({ figure, query }),
    });
  }

  async breakdownPhotomathEquation(equation) {
    return this.request('/elem-sec/photomath/breakdown', {
      method: 'POST',
      body: JSON.stringify({ equation }),
    });
  }
}

export const api = new ApiService();



