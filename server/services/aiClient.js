const axios = require('axios');
const fs = require('fs');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Request extraction from FastAPI AI Service
 */
async function extractText({ filePath, mimeType, text }) {
  if (text && text.trim().length > 0) {
    return text.trim();
  }

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Valid file or text input is required for extraction.');
  }

  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(`${AI_SERVICE_URL}/extract`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    if (response.data && response.data.text) {
      return response.data.text;
    }
    throw new Error('No text returned from AI extraction service.');
  } catch (error) {
    console.warn(`[AIClient] Direct extraction error: ${error.message}. Checking fallback.`);
    // Fallback: If it's a basic text or PDF, provide informative extraction or re-throw
    throw new Error(`AI Extraction failed: ${error.response?.data?.detail || error.message}`);
  }
}

/**
 * Generate Deck (Summary + Key Terms + Cards with Distractors & Explanations)
 */
async function generateDeck({ text, title, maxCards = 15 }) {
  if (!text || text.trim().length < 50) {
    throw new Error('Text must be at least 50 characters long to generate high-quality study materials.');
  }

  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/generate-deck`,
      {
        text,
        title: title || 'Untitled Study Deck',
        maxCards,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      }
    );

    if (response.data && response.data.summary && Array.isArray(response.data.cards)) {
      return response.data;
    }
  } catch (error) {
    console.warn(`[AIClient] FastApi service unreachable (${error.message}). Using built-in generator.`);
  }

  // Built-in intelligent NLP fallback when AI service is warming up or during local standalone mode
  return generateLocalDeckFallback({ text, title, maxCards });
}

function generateLocalDeckFallback({ text, title, maxCards = 15 }) {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 250);

  // Extract key terms
  const words = text
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 5 && !['however', 'because', 'therefore', 'should', 'between', 'through'].includes(w.toLowerCase()));
  
  const wordFreq = {};
  words.forEach(w => {
    const norm = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    wordFreq[norm] = (wordFreq[norm] || 0) + 1;
  });

  const sortedTerms = Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]);
  const keyTerms = sortedTerms.slice(0, 6);

  // Structured summary
  const summarySentences = sentences.slice(0, Math.min(5, sentences.length));
  const summary = summarySentences.join(' ') || text.slice(0, 400) + '...';

  // Generate cards
  const cards = [];
  const cardCount = Math.min(maxCards, Math.max(3, sentences.length));

  for (let i = 0; i < cardCount && i < sentences.length; i++) {
    const sentence = sentences[i];
    // Find candidate answer word
    const match = sentence.match(/\b([A-Z][a-z]+|[a-z]{6,})\b/);
    const answer = match ? match[0] : (keyTerms[i % keyTerms.length] || 'Key Concept');
    
    // Create distractor options
    const distractors = keyTerms.filter(t => t.toLowerCase() !== answer.toLowerCase()).slice(0, 3);
    while (distractors.length < 3) {
      distractors.push(`Alternative ${distractors.length + 1}`);
    }

    const options = [answer, ...distractors].sort(() => 0.5 - Math.random());

    cards.push({
      question: `Regarding ${title || 'this topic'}: What key element is described in "${sentence.slice(0, 80)}..."?`,
      answer: answer,
      options: options,
      explanation: `From note text: "${sentence}"`,
    });
  }

  return {
    summary,
    keyTerms,
    cards,
  };
}

module.exports = {
  extractText,
  generateDeck,
};
