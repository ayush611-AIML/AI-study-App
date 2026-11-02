import os
from typing import List, Dict, Any, Optional
import httpx

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

async def get_socratic_hint(
    question: str,
    correct_answer: str,
    explanation: str,
    hint_level: int = 1,
    student_attempt: Optional[str] = None
) -> Dict[str, Any]:
    """
    Socratic Tutoring Guardrails:
    Never blurts out the raw answer. Instead, provides progressive guided questioning
    to empower the student to reach the solution through their own reasoning.
    """
    if GROQ_API_KEY:
        prompt = f"""You are a gentle Socratic AI Tutor for young students.
The student is trying to answer this question:
Question: "{question}"
Correct Concept: "{correct_answer}"
Context: "{explanation}"
Student's Current Attempt / Thought: "{student_attempt or 'I am unsure'}"
Hint Level Requested: {hint_level} (1 = subtle conceptual nudge, 2 = guided leading question, 3 = pinpoint the specific step or clue)

Rules:
1. NEVER reveal the exact answer "{correct_answer}".
2. Ask one encouraging, focused question that prompts the student to think.
3. Keep it under 2 sentences.
"""
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                    }
                )
                if res.status_code == 200:
                    text = res.json()["choices"][0]["message"]["content"].strip()
                    return {
                        "hintLevel": hint_level,
                        "hint": text,
                        "type": "guided_question"
                    }
        except Exception:
            pass

    # Built-in deterministic Socratic progression
    if hint_level == 1:
        hint_text = f"💡 Let's think: what is the main goal or mechanism happening in this question? Can you spot the key action word?"
    elif hint_level == 2:
        hint_text = f"🔍 Notice how this connects to '{explanation.split('.')[0] if explanation else 'the core concept'}'. Which option directly performs that role?"
    else:
        first_letter = correct_answer[0].upper() if correct_answer else 'A'
        hint_text = f"🎯 Almost there! Look closely at the clue: it starts with the letter '{first_letter}' and has {len(correct_answer)} letters. What comes to mind?"

    return {
        "hintLevel": hint_level,
        "hint": hint_text,
        "type": "guided_question"
    }
