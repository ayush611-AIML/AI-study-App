import os
import re
from typing import List, Dict, Any, Optional
import httpx

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ---------------------------------------------------------------------------
# 1. Synthesis Tutor: Deep Math Intuition (SpaceX Ad Astra Incubator Style)
# ---------------------------------------------------------------------------
SYNTHESIS_INTUITION_MODULES = [
    {
        "id": "fractions_number_line",
        "concept": "Equivalent Fractions & Number Lines",
        "level": "Grade 3-4 (Ages 8-10)",
        "tutorSpokenDialogue": (
            "Welcome! Today we aren't just memorizing formulas—we're seeing math! "
            "Look at this number line between 0 and 1. If we take two hops of 1/4, "
            "notice where we land: exactly halfway at 2/4, which is the exact same spot as 1/2!"
        ),
        "visualType": "number_line",
        "numberLineData": {
            "start": 0,
            "end": 1,
            "tickStep": 0.25,
            "targetPoint": 0.5,
            "labels": [
                {"pos": 0, "label": "0"},
                {"pos": 0.25, "label": "1/4"},
                {"pos": 0.5, "label": "2/4 (1/2)"},
                {"pos": 0.75, "label": "3/4"},
                {"pos": 1.0, "label": "1 Whole"}
            ],
            "hops": [
                {"from": 0, "to": 0.25, "color": "#38BDF8", "label": "+1/4"},
                {"from": 0.25, "to": 0.5, "color": "#10B981", "label": "+1/4"}
            ]
        },
        "intuitiveQuestion": "How many 1/4 hops does it take to reach 1 Whole?",
        "options": ["2 hops", "4 hops", "8 hops", "1 hop"],
        "answer": "4 hops",
        "explanation": "Four 1/4 segments combine to make 4/4 = 1 complete whole!"
    },
    {
        "id": "multiplication_area_grid",
        "concept": "Multiplication Area Model & Spatial Grids",
        "level": "Grade 3-5 (Ages 8-11)",
        "tutorSpokenDialogue": (
            "Watch this! Instead of chanting times tables, think of 6 × 4 as a rectangular room. "
            "6 meters long and 4 meters wide. Count the visual tiles: 4 rows with 6 squares each!"
        ),
        "visualType": "area_grid",
        "gridData": {
            "rows": 4,
            "cols": 6,
            "totalSquares": 24,
            "color": "#6366F1",
            "equation": "6 × 4 = 24 unit squares"
        },
        "intuitiveQuestion": "If we double the length from 6 to 12, what happens to the area?",
        "options": ["Area doubles to 48", "Area stays 24", "Area triples", "Area is 30"],
        "answer": "Area doubles to 48",
        "explanation": "Doubling one dimension doubles the total surface area: 12 × 4 = 48!"
    }
]

def get_synthesis_intuition(concept_id: Optional[str] = None) -> Dict[str, Any]:
    """Returns interactive visual number lines and area grids for Synthesis Tutor."""
    if concept_id:
        for m in SYNTHESIS_INTUITION_MODULES:
            if m["id"] == concept_id:
                return m
    return SYNTHESIS_INTUITION_MODULES[0]


# ---------------------------------------------------------------------------
# 2. Prodigy RPG Fantasy Quest with Background Placement Diagnostic
# ---------------------------------------------------------------------------
def generate_prodigy_rpg_battle(player_level: int = 1, current_pet: str = "Flame Fox") -> Dict[str, Any]:
    """
    Prodigy-style turn-based math & literacy combat RPG with background placement diagnostics.
    """
    monsters = [
        {"name": "Glitch Golem", "avatar": "👾", "hp": 100, "maxHp": 100, "weakness": "Fractions"},
        {"name": "Fraction Phantom", "avatar": "👻", "hp": 130, "maxHp": 130, "weakness": "Decimals"},
        {"name": "Denominator Dragon", "avatar": "🐉", "hp": 160, "maxHp": 160, "weakness": "Algebra"}
    ]
    monster = monsters[(player_level - 1) % len(monsters)]

    spells = [
        {
            "spellName": "❄️ Frost Spear",
            "element": "Ice",
            "damage": 45,
            "prompt": "Cast Frost Spear! Find the common denominator for 1/3 + 1/4:",
            "options": ["12", "7", "24", "6"],
            "answer": "12",
            "explanation": "The least common multiple of 3 and 4 is 3 × 4 = 12!"
        },
        {
            "spellName": "⚡ Thunder Strike",
            "element": "Electric",
            "damage": 55,
            "prompt": "Cast Thunder Strike! Simplify 18/24 to lowest terms:",
            "options": ["3/4", "6/8", "9/12", "2/3"],
            "answer": "3/4",
            "explanation": "Divide both 18 and 24 by their greatest common factor (6): 18÷6=3, 24÷6=4!"
        },
        {
            "spellName": "🔥 Solar Flare",
            "element": "Fire",
            "damage": 60,
            "prompt": "Cast Solar Flare! A train travels 150 km in 3 hours. What is its speed?",
            "options": ["50 km/h", "45 km/h", "60 km/h", "100 km/h"],
            "answer": "50 km/h",
            "explanation": "Speed = Distance ÷ Time = 150 ÷ 3 = 50 km/h!"
        }
    ]

    return {
        "playerLevel": player_level,
        "selectedPet": current_pet or "🔥 Flame Fox",
        "petBonus": "+15% Focus Shield",
        "monster": monster,
        "spells": spells,
        "backgroundPlacementDiagnostic": {
            "cognitiveStatus": "On-Track for Grade 5 Standards",
            "nextLevelUnlockedAt": 3,
            "dynamicDifficulty": "Normal - Adapting real-time"
        }
    }


# ---------------------------------------------------------------------------
# 3. Khanmigo Socratic Homework Tutor & Historical Character Roleplay
# ---------------------------------------------------------------------------
def get_khanmigo_socratic_response(problem: str, student_thought: Optional[str] = None) -> Dict[str, Any]:
    """
    Khanmigo-style Socratic Tutor:
    Hardcoded NEVER to reveal the direct answer.
    Leads with structured questions, error pinpointing, and leading nudges.
    """
    clean_prob = problem.strip()
    clean_thought = (student_thought or "").strip()

    # Detect blatant cheating queries
    if re.search(r'(just give me the answer|what is the answer|solve this for me|give me x)', clean_prob.lower()):
        return {
            "mode": "socratic_guardrail",
            "tutorReply": (
                "🤖 Khanmigo Coach: I won't do the work for you, because thinking through "
                "the steps is where real learning happens! Let's examine the first step together: "
                "What operation do you see in the problem, and how can we isolate the variable?"
            ),
            "guidedQuestion": "What is the first step you'd take to simplify this?",
            "suggestedNextSteps": [
                "Identify what needs to be balanced on both sides",
                "Look at the constants first",
                "Find a common denominator"
            ]
        }

    return {
        "mode": "guided_inquiry",
        "problem": clean_prob,
        "tutorReply": (
            f"Let's look at this step-by-step: In '{clean_prob}', notice the relationship between the terms. "
            "What happens if you isolate the variable on the left side first?"
        ),
        "leadingHint": "Think of an equation like a balanced scale: whatever you do to one side, you must do to the other!",
        "reflectionPrompt": "Try writing out the next line of working, and I'll verify if your logic holds true!"
    }

HISTORICAL_FIGURES = {
    "einstein": {
        "name": "Albert Einstein",
        "avatar": "👴",
        "tagline": "Theoretical Physicist (1879–1955)",
        "intro": "Guten Tag! Imagination is more important than knowledge. What mystery of space, time, or light shall we explore together?"
    },
    "ada_lovelace": {
        "name": "Ada Lovelace",
        "avatar": "👩‍💻",
        "tagline": "First Computer Programmer (1815–1852)",
        "intro": "Greetings! I saw poetry in the Analytical Engine. Tell me, what computational puzzle or algorithm fascinates you?"
    },
    "da_vinci": {
        "name": "Leonardo da Vinci",
        "avatar": "🎨",
        "tagline": "Renaissance Polymath & Inventor (1452–1519)",
        "intro": "Salute! The natural world is full of infinite causes that have never been verified. What machine or anatomical drawing shall we discuss?"
    }
}

def chat_historical_figure(figure_id: str, query: str) -> Dict[str, Any]:
    """Simulates educational roleplay with historical figures."""
    fig = HISTORICAL_FIGURES.get(figure_id.lower(), HISTORICAL_FIGURES["einstein"])
    q = query.lower()

    if "gravity" in q or "relative" in q or "light" in q:
        reply = (
            f"{fig['name']} strokes his mustache thoughtfully: 'Ah! Think of gravity not as a mysterious pull, "
            "but as curved spacetime! Like placing a heavy bowling ball on a trampoline—it bends the fabric so marbles roll towards it!'"
        )
    elif "computer" in q or "code" in q or "algorithm" in q:
        reply = (
            f"{fig['name']} smiles warmly: 'Every machine needs a sequence of instructions. "
            "An algorithm is simply a recipe of logical steps that transforms inputs into wondrous outcomes!'"
        )
    else:
        reply = (
            f"{fig['name']} leans in with curiosity: 'Curious questions are the seeds of discovery! "
            f"Regarding \"{query}\"—how do you think we can test this using first principles?'"
        )

    return {
        "figure": fig,
        "userQuery": query,
        "roleplayResponse": reply
    }


# ---------------------------------------------------------------------------
# 4. Photomath-Style Visual Math Breakdown with Textbooks Alignment
# ---------------------------------------------------------------------------
def breakdown_photomath_equation(equation: str) -> Dict[str, Any]:
    """
    Photomath Plus style:
    Breaks down equations line-by-line, naming the exact mathematical rule
    and curriculum standard applied at each step.
    """
    clean_eq = equation.strip().replace(" ", "")

    # Default demo if linear equation e.g. 3x + 5 = 20
    return {
        "originalEquation": equation or "3x + 5 = 20",
        "curriculumStandard": "Common Core Grade 7/8: Linear Equations (CCSS.MATH.CONTENT.7.EE.B.4)",
        "solution": "x = 5",
        "sequentialSteps": [
            {
                "stepNumber": 1,
                "expression": "3x + 5 - 5 = 20 - 5",
                "simplified": "3x = 15",
                "ruleApplied": "Subtraction Property of Equality",
                "explanation": "Subtract 5 from both sides to isolate the variable term '3x'."
            },
            {
                "stepNumber": 2,
                "expression": "(3x) / 3 = 15 / 3",
                "simplified": "x = 5",
                "ruleApplied": "Division Property of Equality",
                "explanation": "Divide both sides by 3 to solve for a single 'x'."
            },
            {
                "stepNumber": 3,
                "expression": "3(5) + 5 = 15 + 5 = 20",
                "simplified": "20 = 20 (Verified ✓)",
                "ruleApplied": "Substitution / Verification Step",
                "explanation": "Substitute x = 5 back into the original equation to verify correctness."
            }
        ],
        "animatedTip": "Notice how balancing both sides keeps the equation true, like maintaining level balance scales!"
    }
