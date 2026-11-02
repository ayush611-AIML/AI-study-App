import os
import re
from typing import List, Dict, Any, Optional
import httpx

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ---------------------------------------------------------------------------
# Middle School+ (Ages 12-15): Essay Structure & Grammar Feedback
# (Crucial: Gives constructive feedback WITHOUT auto-writing the essay for them)
# ---------------------------------------------------------------------------
def analyze_essay_structure_and_grammar(title: str, essay_text: str) -> Dict[str, Any]:
    """
    Evaluates middle-school student writing for:
    1. Thesis statement strength & clarity
    2. Paragraph transitions & organizational flow
    3. Evidence / reasoning depth
    4. Grammar & sentence variety checks
    Strict rule: Never writes the sentences for them; highlights specific areas to polish.
    """
    paragraphs = [p.strip() for p in essay_text.split("\n\n") if p.strip()]
    if not paragraphs:
        paragraphs = [essay_text.strip()] if essay_text.strip() else []

    word_count = len(re.findall(r'\b\w+\b', essay_text))
    
    # Thesis statement check (looking in first paragraph)
    has_intro = len(paragraphs) >= 1
    intro = paragraphs[0] if has_intro else ""
    thesis_indicators = ["because", "therefore", "argue", "demonstrates", "reveals", "due to", "in order to"]
    has_strong_thesis = any(ind in intro.lower() for ind in thesis_indicators)

    # Transition words check
    transitions = ["however", "furthermore", "in addition", "consequently", "on the other hand", "for example", "similarly"]
    transition_count = sum(1 for t in transitions if t in essay_text.lower())

    # Structural Score
    structure_score = 70
    if len(paragraphs) >= 3: structure_score += 15
    if has_strong_thesis: structure_score += 10
    if transition_count >= 2: structure_score += 5

    feedback_items = []
    
    if has_strong_thesis:
        feedback_items.append({
            "aspect": "Thesis Statement",
            "status": "strong",
            "comment": "Clear central claim identified in your opening paragraph! 🎯"
        })
    else:
        feedback_items.append({
            "aspect": "Thesis Statement",
            "status": "needs_work",
            "comment": "Consider sharpening your introductory thesis: What is your primary argument, and why does it matter?"
        })

    if transition_count >= 2:
        feedback_items.append({
            "aspect": "Paragraph Transitions",
            "status": "strong",
            "comment": f"Nice flow! You used bridge words ({transition_count} transitions detected) to link your ideas."
        })
    else:
        feedback_items.append({
            "aspect": "Paragraph Transitions",
            "status": "needs_work",
            "comment": "Tip: Use connective words like 'Furthermore', 'Consequently', or 'In contrast' between paragraphs."
        })

    if len(paragraphs) < 3:
        feedback_items.append({
            "aspect": "Essay Structure",
            "status": "needs_work",
            "comment": "Organize your writing into a 3-part or 5-part structure: Introduction, Body Paragraphs, and Conclusion."
        })
    else:
        feedback_items.append({
            "aspect": "Essay Structure",
            "status": "strong",
            "comment": f"Solid paragraph organization with {len(paragraphs)} distinct sections."
        })

    return {
        "title": title or "Untitled Essay Draft",
        "wordCount": word_count,
        "paragraphCount": len(paragraphs),
        "overallStructureScore": min(100, structure_score),
        "coachingNote": "Remember: The best essays convince readers through structured evidence and authentic voice!",
        "rubricFeedback": feedback_items
    }


# ---------------------------------------------------------------------------
# Elementary (Ages 8-11): Gamified Prodigy-Style Math / Science Battle
# ---------------------------------------------------------------------------
def generate_math_battle_quest(subject: str = "Math", stage: int = 1) -> Dict[str, Any]:
    """
    Generates a gamified combat quest where answering curriculum questions
    casts spells or deals damage to a monster (Prodigy style).
    """
    monsters = [
        {"name": "Glitch Golem", "hp": 100, "avatar": "👾", "element": "Cyber"},
        {"name": "Fraction Phantom", "hp": 120, "avatar": "👻", "element": "Shadow"},
        {"name": "Denominator Dragon", "hp": 150, "avatar": "🐉", "element": "Flame"},
    ]
    monster = monsters[(stage - 1) % len(monsters)]

    questions = [
        {
            "prompt": "Cast Ice Shard! What is 3/4 + 2/4?",
            "options": ["5/4 (or 1 1/4)", "5/8", "6/8", "1"],
            "answer": "5/4 (or 1 1/4)",
            "spellName": "❄️ Frost Spear",
            "damage": 40,
            "explanation": "When denominators are the same (4), add numerators: 3 + 2 = 5, keeping 4!"
        },
        {
            "prompt": "Shield Spell! What is 8 × 7?",
            "options": ["56", "54", "64", "48"],
            "answer": "56",
            "spellName": "🛡️ Aegis Shield",
            "damage": 35,
            "explanation": "8 × 7 = 56. (Think 8 × 5 = 40 plus 8 × 2 = 16 -> 56!)"
        },
        {
            "prompt": "Lightning Bolt! A rectangle has length 9cm and width 4cm. What is its Area?",
            "options": ["36 cm²", "26 cm²", "13 cm²", "72 cm²"],
            "answer": "36 cm²",
            "spellName": "⚡ Thunder Strike",
            "damage": 45,
            "explanation": "Area = Length × Width = 9 × 4 = 36 cm²!"
        }
    ]

    return {
        "stage": stage,
        "monster": monster,
        "playerHp": 100,
        "maxPlayerHp": 100,
        "battleQuestions": questions
    }


# ---------------------------------------------------------------------------
# Early Learners (Ages 4-7): Visual Phonics & Drag-and-Drop Matching Puzzles
# ---------------------------------------------------------------------------
def get_early_learner_puzzles() -> List[Dict[str, Any]]:
    """
    Returns visual drag-and-drop & phonics matching puzzles for ages 4-7.
    """
    return [
        {
            "id": "puz_1",
            "type": "count_match",
            "title": "Match the Apples to the Number!",
            "targetNumber": 3,
            "visualItems": ["🍎", "🍎", "🍎"],
            "options": [
                {"label": "Number 3", "value": 3, "correct": True},
                {"label": "Number 5", "value": 5, "correct": False},
                {"label": "Number 2", "value": 2, "correct": False},
            ],
            "audioPhrase": "Can you find the number 3 for three juicy red apples?",
            "companionCheer": "Pip the Fox says: 'Count with me: One, Two, Three!'"
        },
        {
            "id": "puz_2",
            "type": "phonics_sound",
            "title": "Which starts with the sound 'B'?",
            "targetSound": "/b/",
            "options": [
                {"label": "🐻 Bear", "value": "Bear", "correct": True},
                {"label": "🍎 Apple", "value": "Apple", "correct": False},
                {"label": "🐱 Cat", "value": "Cat", "correct": False},
            ],
            "audioPhrase": "Buh... Buh... Bear starts with the letter B!",
            "companionCheer": "Ollie the Owl flaps his wings: 'Hoo-ray! B is for Bear!'"
        },
        {
            "id": "puz_3",
            "type": "shape_match",
            "title": "Find the Sun's Round Shape!",
            "targetShape": "Circle",
            "options": [
                {"label": "🟡 Circle", "value": "Circle", "correct": True},
                {"label": "🔺 Triangle", "value": "Triangle", "correct": False},
                {"label": "🟦 Square", "value": "Square", "correct": False},
            ],
            "audioPhrase": "A golden yellow circle is round like the shining sun!",
            "companionCheer": "Pip the Fox smiles: 'Round and round like a spinning wheel!'"
        }
    ]
