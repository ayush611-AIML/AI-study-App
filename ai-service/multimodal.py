import os
import re
from typing import List, Dict, Any, Optional
import httpx

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# -------------------------------------------------------------
# 1. Voice-to-Voice & Pronunciation Coaching
# -------------------------------------------------------------
def analyze_phonics_and_pronunciation(target_text: str, spoken_text: str) -> Dict[str, Any]:
    """
    Compares the student's spoken audio transcript against the target reading text.
    Identifies mispronounced or missed words and generates gentle phonics hints.
    """
    target_words = re.findall(r'\b[A-Za-z]+\b', target_text.lower())
    spoken_words = re.findall(r'\b[A-Za-z]+\b', spoken_text.lower())

    results = []
    correct_count = 0

    for i, tw in enumerate(target_words):
        sw = spoken_words[i] if i < len(spoken_words) else None
        if sw == tw:
            results.append({
                "word": target_words[i],
                "status": "correct",
                "feedback": "Great pronunciation! 🌟"
            })
            correct_count += 1
        elif sw:
            # Simple phonetic breakdown
            phonics_tip = f"Try sounding out '{tw}': " + "-".join([tw[j:j+2] for j in range(0, len(tw), 2)])
            results.append({
                "word": target_words[i],
                "spoken": sw,
                "status": "mispronounced",
                "phonicsTip": phonics_tip,
                "feedback": f"Close! You said '{sw}'. Let's practice '{tw}' together!"
            })
        else:
            results.append({
                "word": target_words[i],
                "status": "omitted",
                "phonicsTip": f"Don't forget '{tw}'!",
                "feedback": f"Let's read '{tw}' aloud together!"
            })

    accuracy = round((correct_count / max(1, len(target_words))) * 100)

    encouragement = (
        "🏆 Flawless reading! You have clear pronunciation!"
        if accuracy >= 90
        else "👏 Wonderful effort! Review the highlighted phonics to sound like a champion!"
    )

    return {
        "accuracyScore": accuracy,
        "encouragement": encouragement,
        "wordBreakdown": results,
    }


# -------------------------------------------------------------
# 2. OCR & Handwriting Line-by-Line Math Inspector
# -------------------------------------------------------------
def analyze_handwritten_math_steps(problem: str, steps: List[str]) -> Dict[str, Any]:
    """
    Inspects each line of handwritten math working to pinpoint the exact line
    where an arithmetic or algebraic mistake occurred, rather than just marking the final answer wrong.
    """
    cleaned_steps = [s.strip() for s in steps if s.strip()]
    
    if not cleaned_steps:
        return {
            "hasMistake": False,
            "message": "No handwritten working steps detected. Please write out your steps!"
        }

    # Inspect typical multi-step patterns (e.g. 3x + 5 = 20)
    inspected_lines = []
    mistake_found = False
    mistake_line_number = None
    mistake_reason = None

    for idx, line in enumerate(cleaned_steps):
        line_num = idx + 1
        line_clean = line.replace(" ", "")

        # Sample equation pattern checks
        # Check simple arithmetic errors, e.g., 20 - 5 = 12
        arith_match = re.search(r'(\d+)\s*([\+\-\*\/])\s*(\d+)\s*=\s*(\d+)', line)
        if arith_match and not mistake_found:
            num1, op, num2, res = int(arith_match.group(1)), arith_match.group(2), int(arith_match.group(3)), int(arith_match.group(4))
            expected = 0
            if op == '+': expected = num1 + num2
            elif op == '-': expected = num1 - num2
            elif op == '*': expected = num1 * num2
            elif op == '/': expected = num1 // num2 if num2 != 0 else 0

            if expected != res:
                mistake_found = True
                mistake_line_number = line_num
                mistake_reason = f"Arithmetic slip on Line {line_num}: {num1} {op} {num2} is {expected}, but you wrote {res}."
                inspected_lines.append({
                    "lineNumber": line_num,
                    "text": line,
                    "status": "error",
                    "feedback": mistake_reason
                })
                continue

        # Common distribution check e.g. 2(x + 3) -> 2x + 3 instead of 2x + 6
        if ("(" in line or ")" in line) and idx + 1 < len(cleaned_steps):
            next_line = cleaned_steps[idx + 1].replace(" ", "")
            dist_match = re.search(r'(\d+)\(x\+(\d+)\)', line_clean)
            if dist_match and not mistake_found:
                factor = int(dist_match.group(1))
                constant = int(dist_match.group(2))
                correct_term = f"{factor * constant}"
                wrong_term = f"{constant}"
                if wrong_term in next_line and correct_term not in next_line:
                    mistake_found = True
                    mistake_line_number = line_num + 1
                    mistake_reason = f"Line {line_num + 1} forgot to distribute: {factor} × {constant} should be {factor * constant}!"
                    inspected_lines.append({
                        "lineNumber": line_num,
                        "text": line,
                        "status": "ok",
                        "feedback": "Correct step!"
                    })
                    continue

        inspected_lines.append({
            "lineNumber": line_num,
            "text": line,
            "status": "ok" if not mistake_found else "subsequent",
            "feedback": "Correct reasoning here!" if not mistake_found else "Calculated with previous line's number."
        })

    return {
        "problem": problem,
        "hasMistake": mistake_found,
        "mistakeLine": mistake_line_number,
        "feedback": mistake_reason or "🎉 Every step is mathematically sound! Outstanding scratch work!",
        "lines": inspected_lines
    }


# -------------------------------------------------------------
# 3. Interactive Story & Visual Co-Creation
# -------------------------------------------------------------
async def generate_interactive_story_chapter(
    theme: str,
    character: str,
    choice_history: List[str],
    current_choice: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates the next chapter of an interactive branching story for children.
    Includes plot choices, vocabulary highlights with phonics definitions,
    and a vivid illustration description.
    """
    if GROQ_API_KEY:
        history_str = " -> ".join(choice_history + ([current_choice] if current_choice else []))
        prompt = f"""You are a magical children's author writing an interactive 'Choose Your Own Adventure' story.
Hero: {character}
Theme: {theme}
Plot Path So Far: {history_str}
Latest Action: {current_choice or 'Beginning the quest'}

Write the next 3-sentence exciting chapter suitable for reading comprehension.
Include:
1. Two vocabulary words with kid-friendly definitions.
2. Two exciting branching choices for the child to pick next.
3. A description for a story illustration.

Return valid JSON format:
{{
  "storyText": "3 engaging sentences...",
  "illustrationPrompt": "Vivid cartoon visual description...",
  "vocabulary": [
    {{"word": "Resplendent", "definition": "Shining brightly like polished gold."}},
    {{"word": "Perilous", "definition": "Full of danger or adventure."}}
  ],
  "choices": ["Explore the glowing cave", "Build a wooden bridge across the river"],
  "comprehensionQuestion": {{"question": "Why did the hero pause?", "options": ["They saw tracks", "It was dark", "They were tired"], "answer": "They saw tracks"}}
}}
"""
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.5,
                        "response_format": {"type": "json_object"}
                    }
                )
                if res.status_code == 200:
                    import json
                    return json.loads(res.json()["choices"][0]["message"]["content"])
        except Exception:
            pass

    # Built-in branching templates
    step_num = len(choice_history) + 1
    if step_num == 1:
        return {
            "storyText": f"{character} stood at the edge of the Whispering Forest, gripping their enchanted compass. Sunlight filtered through emerald canopies, revealing two ancient trails mossy with mystery. In the distance, a friendly crystal bird sang a melodious warning.",
            "illustration": "🌲 Emerald woodland with sunbeams and a curious child holding a glowing golden compass.",
            "vocabulary": [
                {"word": "Enchanted", "definition": "Infused with delightful magic or wonder."},
                {"word": "Melodious", "definition": "Sweet-sounding, musical and pleasing to hear."}
            ],
            "choices": ["Follow the sparkling crystal river", "Climb the giant elder oak tree"],
            "comprehensionQuestion": {
                "question": "What special object was the hero holding?",
                "options": ["An enchanted compass", "A silver sword", "A telescope", "A lantern"],
                "answer": "An enchanted compass"
            }
        }
    elif "river" in (current_choice or "").lower():
        return {
            "storyText": f"{character} skipped along the sparkling riverbank, where glowing water-lilies danced in the gentle current. Suddenly, an amiable river-otter popped up wearing a tiny pirate captain hat! The otter held out a floating treasure map sealed with a purple seashell.",
            "illustration": "🦦 Cheerful otter wearing a tricorn hat offering a rolled treasure map in clear bubbling stream.",
            "vocabulary": [
                {"word": "Amiable", "definition": "Friendly, pleasant, and warm-hearted."},
                {"word": "Current", "definition": "The steady, flowing movement of water in a river."}
            ],
            "choices": ["Open the purple seashell map", "Offer the otter some crunchy berries"],
            "comprehensionQuestion": {
                "question": "What made the river otter look unique and surprising?",
                "options": ["It wore a tiny pirate hat", "It had bright blue fur", "It was flying", "It was singing opera"],
                "answer": "It wore a tiny pirate hat"
            }
        }
    else:
        return {
            "storyText": f"{character} climbed high into the ancient tree canopy, discovering a hidden treehouse built from starry driftwood. Inside, miniature mechanical gears spun harmoniously, powering a telescope that looked directly into a constellation of glowing fireflies.",
            "illustration": "✨ Magical treehouse in the clouds with brass gears, starry driftwood and glowing fireflies.",
            "vocabulary": [
                {"word": "Harmonious", "definition": "Working smoothly together in balanced peace."},
                {"word": "Constellation", "definition": "A pattern or group of stars (or glowing creatures) in the sky."}
            ],
            "choices": ["Look through the star telescope", "Turn the golden clockwork gear"],
            "comprehensionQuestion": {
                "question": "What was powering the telescope in the treehouse?",
                "options": ["Miniature spinning gears", "A thunderbolt", "Windmills", "Solar crystals"],
                "answer": "Miniature spinning gears"
            }
        }
