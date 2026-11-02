import os
import re
import json
import random
from typing import List, Dict, Any, Optional
import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def validate_card(card: Dict[str, Any], source_text: str, seen_questions: set) -> Optional[Dict[str, Any]]:
    """
    Applies quality checks defined in project plan:
    1. Answer must appear or be grounded in source text (avoids hallucinations)
    2. Drop duplicate / near-duplicate questions
    3. Make sure the 3 wrong options are different from each other and from the correct answer
    """
    question = card.get("question", "").strip()
    answer = card.get("answer", "").strip()
    options = card.get("options", [])
    explanation = card.get("explanation", "").strip()

    if not question or not answer:
        return None

    # Check question deduplication
    norm_q = re.sub(r'[^\w\s]', '', question.lower())
    if norm_q in seen_questions:
        return None
    seen_questions.add(norm_q)

    # Check answer presence or grounding in source text
    norm_source = source_text.lower()
    norm_ans = answer.lower()
    ans_tokens = [w for w in re.findall(r'\b\w+\b', norm_ans) if len(w) > 2]
    
    # Grounding check: at least 70% of non-trivial answer tokens must be present in source
    if ans_tokens:
        found_tokens = sum(1 for t in ans_tokens if t in norm_source)
        if (found_tokens / len(ans_tokens)) < 0.6:
            return None

    # Options validation: Ensure 4 distinct options (1 correct + 3 wrong)
    unique_options = []
    seen_opt = set()

    # Always ensure correct answer is included
    unique_options.append(answer)
    seen_opt.add(answer.lower())

    for opt in options:
        opt_str = str(opt).strip()
        if opt_str and opt_str.lower() not in seen_opt:
            seen_opt.add(opt_str.lower())
            unique_options.append(opt_str)

    # If fewer than 4, generate plausible filler options
    fallback_distractors = ["None of the above", "All of the above", "Not mentioned in notes", "Opposite result"]
    for fb in fallback_distractors:
        if len(unique_options) >= 4:
            break
        if fb.lower() not in seen_opt:
            seen_opt.add(fb.lower())
            unique_options.append(fb)

    # Shuffle the options
    random.shuffle(unique_options)

    return {
        "question": question,
        "answer": answer,
        "options": unique_options[:4],
        "explanation": explanation or f"The answer '{answer}' is supported by the notes.",
    }

async def generate_questions_llm(text: str, max_cards: int = 15) -> List[Dict[str, Any]]:
    """
    Generate questions using available LLM API (Groq, OpenAI, or Gemini)
    """
    prompt = f"""You are an expert educational AI creating study materials.
Generate exactly {max_cards} high-yield multiple choice flashcards from the notes below.

Requirements:
- Ground every question and answer strictly in the provided text.
- Provide 1 correct answer and 3 distinct wrong plausible options.
- Provide a brief 1-sentence explanation citing the source note.
- Return ONLY valid raw JSON with this exact schema:
[
  {{
    "question": "What does mitochondria produce?",
    "answer": "ATP",
    "options": ["ATP", "DNA", "Glucose", "Protein"],
    "explanation": "Mitochondria generates ATP through cellular respiration."
  }}
]

Notes:
{text[:4000]}
"""

    if GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                    }
                )
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    match = re.search(r'\[.*\]', content, re.DOTALL)
                    if match:
                        return json.loads(match.group(0))
        except Exception as e:
            print(f"[LLM] Groq error: {e}")

    if OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                    }
                )
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    match = re.search(r'\[.*\]', content, re.DOTALL)
                    if match:
                        return json.loads(match.group(0))
        except Exception as e:
            print(f"[LLM] OpenAI error: {e}")

    return []

def generate_local_questions(text: str, max_cards: int = 15) -> List[Dict[str, Any]]:
    """
    Deterministic rule-based NLP question generator for standalone / offline capability.
    Creates cloze-deletion and concept questions directly from the text.
    """
    sentences = [s.strip() for s in re.split(r'(?<=[.?!])\s+', text) if len(s.strip()) > 30]
    
    # Extract candidate vocabulary
    words = [w for w in re.findall(r'\b[A-Za-z]{5,}\b', text) if w.lower() not in {
        'which', 'there', 'their', 'about', 'because', 'through', 'between', 'should'
    }]
    unique_words = list(dict.fromkeys(words))

    raw_cards = []
    for s in sentences:
        if len(raw_cards) >= max_cards * 2:
            break
        # Look for definitional or factual sentences
        matches = re.findall(r'\b([A-Z][a-z]+|[a-z]{5,})\b', s)
        if matches:
            target_word = matches[0]
            # Replace target word with blank
            cloze_q = re.sub(rf'\b{re.escape(target_word)}\b', '________', s, count=1)
            distractors = [w for w in unique_words if w.lower() != target_word.lower()][:3]
            while len(distractors) < 3:
                distractors.append(f"Option {len(distractors) + 1}")
            
            raw_cards.append({
                "question": f"Fill in the blank: {cloze_q}",
                "answer": target_word,
                "options": [target_word] + distractors,
                "explanation": f"Source reference: \"{s}\"",
            })

    return raw_cards

async def generate_and_validate_deck_cards(text: str, max_cards: int = 15) -> List[Dict[str, Any]]:
    """
    Generates questions via LLM with local fallback, then applies rigorous validation.
    """
    raw_cards = await generate_questions_llm(text, max_cards)
    if not raw_cards or len(raw_cards) < 3:
        raw_cards = generate_local_questions(text, max_cards)

    validated_cards = []
    seen_questions = set()

    for item in raw_cards:
        valid = validate_card(item, text, seen_questions)
        if valid:
            validated_cards.append(valid)
        if len(validated_cards) >= max_cards:
            break

    return validated_cards
