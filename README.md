# Recapify - AI Study App

Turn lecture notes, PDFs, and photos into structured summaries, active recall flashcards, and quizzes with **SuperMemo 2 (SM-2) Spaced Repetition**.

---

## 🏛️ Architecture Overview

```text
               +----------------------------------+
               |   React Native / Expo App (app/)  |
               +-----------------+----------------+
                                 | REST + JWT
                                 v
               +----------------------------------+
               |    Node.js Express API (server/)  | ---> MongoDB Atlas
               +-----------------+----------------+     (Users, Notes, Decks,
                                 |                      Cards, QuizAttempts)
                                 v
               +----------------------------------+
               | Python FastAPI Service (ai-service)|
               +----------------------------------+
                 • PDF & OCR Text Extraction (pypdf/tesseract)
                 • Chunking & Summarization (BART / T5 / LLM)
                 • Flashcard & Distractor Generation
                 • Quality Validation & Deduplication
```

---

## 📁 Repository Structure

```text
recapify/
├── app/                  # React Native / Expo Mobile & Web App
│   ├── App.js            # Home, Upload, Decks, SM-2 Flashcards, Quiz, Analytics
│   ├── services/api.js   # Client HTTP API & JWT Token storage
│   └── package.json
├── server/               # Express + MongoDB Backend Gateway
│   ├── server.js         # API Server entry point
│   ├── models/           # User, Note, Deck, Card, QuizAttempt
│   ├── routes/           # auth, notes, decks, reviews, quizzes, stats
│   ├── services/         # sm2.js, aiClient.js, storage.js
│   ├── middleware/       # auth.js, rateLimit.js, errorHandler.js
│   └── tests/            # SM-2 unit test suite
├── ai-service/           # FastAPI Machine Learning Microservice
│   ├── main.py           # FastAPI entry point & endpoints
│   ├── extract.py        # PDF and OCR text extraction with validation
│   ├── summarize.py      # ~500 word chunking & structured summary
│   ├── questions.py      # Q&A pairs + 3 distractors + strict validation
│   └── requirements.txt
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Backend Server (`server/`)
```bash
cd server
npm install
npm test            # Run SM-2 algorithm unit tests
npm start           # Starts Express on http://localhost:5000
```

### 2. AI Service (`ai-service/`)
```bash
cd ai-service
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Mobile / Web App (`app/`)
```bash
cd app
npm install
npm run web         # Runs web preview in browser (or 'npx expo start' for mobile)
```

---

## 🧠 Spaced Repetition (SM-2 Algorithm)
- Rating scale: **0 to 5**
- Ratings `< 3` (forget): resets repetitions to `0` and schedules review for tomorrow.
- Ratings `>= 3`:
  - 1st recall: **1 day**
  - 2nd recall: **6 days**
  - Next intervals: `previous_interval * EaseFactor`
  - Ease Factor update: `EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))` (Minimum: 1.3)
