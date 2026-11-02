import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

from extract import extract_content
from summarize import summarize_notes
from questions import generate_and_validate_deck_cards
from analogies import get_concept_analogy, generate_analogy_llm
from socratic import get_socratic_hint
from multimodal import (
    analyze_phonics_and_pronunciation,
    analyze_handwritten_math_steps,
    generate_interactive_story_chapter
)
from age_modes import (
    analyze_essay_structure_and_grammar,
    generate_math_battle_quest,
    get_early_learner_puzzles
)
from safety_and_parents import (
    check_child_safety_and_injection,
    evaluate_teach_the_bot,
    generate_actionable_parent_report
)
from early_learners import (
    get_storybook_catalog,
    coach_child_read_aloud,
    generate_adaptive_duolingo_abc_session
)
from elementary_and_secondary import (
    get_synthesis_intuition,
    generate_prodigy_rpg_battle,
    get_khanmigo_socratic_response,
    chat_historical_figure,
    breakdown_photomath_equation
)



load_dotenv()

app = FastAPI(
    title="Recapify AI Service",
    description="Microservice for document extraction, smart summarization, Socratic tutoring, and analogy generation.",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalogyRequest(BaseModel):
    concept: str = Field(..., description="Concept to explain, e.g., 'Mitochondria'")
    context: Optional[str] = Field("", description="Surrounding definition or context")
    interest: Optional[str] = Field("minecraft", description="Student's interest: minecraft, pizza, space, sports")

class SocraticHintRequest(BaseModel):
    question: str = Field(..., description="Quiz or flashcard question")
    correctAnswer: str = Field(..., description="Target concept/answer")
    explanation: Optional[str] = Field("", description="Context/explanation")
    hintLevel: Optional[int] = Field(1, ge=1, le=3, description="Hint tier (1 to 3)")
    studentAttempt: Optional[str] = Field(None, description="What the student has tried or said")


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Raw text of the lecture or study note.")

class DeckGenerateRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Extracted note text.")
    title: Optional[str] = Field("Study Deck", description="Title of the deck or lecture.")
    maxCards: Optional[int] = Field(15, ge=1, le=50, description="Maximum cards to generate.")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Recapify AI Service",
        "version": "1.0.0"
    }

@app.post("/extract")
async def extract_endpoint(file: UploadFile = File(...)):
    """
    Extracts plain text from uploaded PDF or image notes with quality check.
    """
    try:
        file_bytes = await file.read()
        extracted_text = extract_content(file_bytes, file.filename)
        return {
            "filename": file.filename,
            "text": extracted_text,
            "charCount": len(extracted_text),
            "wordCount": len(extracted_text.split()),
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected extraction error: {str(e)}")

@app.post("/summarize")
async def summarize_endpoint(req: SummarizeRequest):
    """
    Splits text into chunks, summarizes each, merges them, and extracts key terms.
    """
    try:
        summary, key_terms = await summarize_notes(req.text)
        return {
            "summary": summary,
            "keyTerms": key_terms,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@app.post("/generate-deck")
async def generate_deck_endpoint(req: DeckGenerateRequest):
    """
    End-to-end pipeline:
    1. Summarize notes & extract key terms
    2. Generate Q&A flashcards with 3 distractors
    3. Validate and filter out low-quality/duplicate questions
    """
    try:
        summary, key_terms = await summarize_notes(req.text)
        cards = await generate_and_validate_deck_cards(req.text, max_cards=req.maxCards or 15)

        return {
            "title": req.title,
            "summary": summary,
            "keyTerms": key_terms,
            "cards": cards,
            "cardCount": len(cards),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deck generation failed: {str(e)}")

@app.post("/explain-analogy")
async def explain_analogy_endpoint(req: AnalogyRequest):
    """
    Concept Re-explanation (Analogy Generator):
    Explains academic concepts using a child's favorite interest themes (Minecraft, Pizza, Space, etc.)
    """
    llm_analogy = await generate_analogy_llm(req.concept, req.context or "", req.interest or "minecraft")
    if llm_analogy:
        return {
            "concept": req.concept,
            "interest": req.interest,
            "analogy": llm_analogy,
            "source": "ai_generated"
        }
    
    fallback = get_concept_analogy(req.concept, req.context or "", req.interest or "minecraft")
    return {
        "concept": req.concept,
        "interest": req.interest,
        "analogy": fallback,
        "source": "curated_template"
    }

@app.post("/socratic-hint")
async def socratic_hint_endpoint(req: SocraticHintRequest):
    """
    Socratic AI Tutoring with Hint-First Guardrails:
    Guides the student step-by-step through questions rather than revealing the answer.
    """
    hint_data = await get_socratic_hint(
        question=req.question,
        correct_answer=req.correctAnswer,
        explanation=req.explanation or "",
        hint_level=req.hintLevel or 1,
        student_attempt=req.studentAttempt
    )
    return hint_data

# -------------------------------------------------------------
# Multimodal & Accessibility Endpoints
# -------------------------------------------------------------
class PronunciationRequest(BaseModel):
    targetText: str = Field(..., description="Target sentence or passage to read aloud")
    spokenText: str = Field(..., description="Speech-to-text transcript spoken by the child")

class HandwritingMathRequest(BaseModel):
    problem: str = Field(..., description="Math problem prompt or equation")
    steps: List[str] = Field(..., description="Handwritten working steps captured line-by-line")

class StoryChapterRequest(BaseModel):
    theme: Optional[str] = Field("Magic Forest", description="Story theme")
    character: Optional[str] = Field("Explorer Sam", description="Child protagonist")
    choiceHistory: Optional[List[str]] = Field(default_factory=list, description="List of previous plot choices")
    currentChoice: Optional[str] = Field(None, description="The latest choice made by child")

@app.post("/multimodal/pronunciation-coach")
def pronunciation_coach_endpoint(req: PronunciationRequest):
    """
    Real-time speech analysis that listens to reading aloud,
    identifies mispronounced phonics on the spot, and provides encouraging coaching.
    """
    return analyze_phonics_and_pronunciation(req.targetText, req.spokenText)

@app.post("/multimodal/analyze-handwriting")
def handwriting_analysis_endpoint(req: HandwritingMathRequest):
    """
    Inspects handwritten math equations line-by-line and pinpoints
    the EXACT line containing the arithmetic/algebraic mistake.
    """
    return analyze_handwritten_math_steps(req.problem, req.steps)

@app.post("/multimodal/generate-story-step")
async def story_step_endpoint(req: StoryChapterRequest):
    """
    Interactive story co-creation: branching story generation where
    the child chooses the plot, generating vocabulary quizzes and illustrations.
    """
    return await generate_interactive_story_chapter(
        theme=req.theme or "Magic Forest",
        character=req.character or "Explorer Sam",
        choice_history=req.choiceHistory or [],
        current_choice=req.currentChoice
    )

# -------------------------------------------------------------
# Age-Specific Feature Priority Endpoints
# -------------------------------------------------------------
class EssayFeedbackRequest(BaseModel):
    title: Optional[str] = Field("My Essay", description="Title of the essay")
    text: str = Field(..., description="Student's handwritten or typed essay draft")

@app.post("/age-modes/essay-feedback")
def essay_feedback_endpoint(req: EssayFeedbackRequest):
    """
    Middle School+ (Ages 12-15):
    Grammar and essay structure feedback without auto-writing.
    """
    return analyze_essay_structure_and_grammar(req.title or "My Essay", req.text)

@app.get("/age-modes/battle-quest")
def battle_quest_endpoint(stage: int = 1):
    """
    Elementary (Ages 8-11):
    Gamified adaptive quest / Prodigy-style math battles.
    """
    return generate_math_battle_quest(stage=stage)

@app.get("/age-modes/early-puzzles")
def early_puzzles_endpoint():
    """
    Early Learners (Ages 4-7):
    Visual phonics & drag-and-drop numeracy matching puzzles.
    """
    return get_early_learner_puzzles()

# -------------------------------------------------------------
# Part 4: Engagement, Safety, & Parent Visibility Endpoints
# -------------------------------------------------------------
class SafetyCheckRequest(BaseModel):
    text: str = Field(..., description="Student input text to validate against COPPA filters and injection guards")

class TeachBotRequest(BaseModel):
    concept: str = Field(..., description="Academic concept the child is explaining")
    explanation: str = Field(..., description="Child's own words explaining the concept to the bot")

class ParentReportRequest(BaseModel):
    studentName: Optional[str] = Field("Aarav", description="Child's display name")
    topicStats: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Performance data")

@app.post("/safety/check")
def safety_check_endpoint(req: SafetyCheckRequest):
    """
    COPPA/GDPR-K Child-Safety filter and Prompt-Injection defense.
    Blocks inappropriate terms and prevents homework bypasses.
    """
    return check_child_safety_and_injection(req.text)

@app.post("/safety/teach-bot")
def teach_bot_endpoint(req: TeachBotRequest):
    """
    Intrinsic Gamification: Feynman Technique 'Teach-the-Bot' mode.
    Evaluates child's explanation and awards Junior Professor badges.
    """
    return evaluate_teach_the_bot(req.concept, req.explanation)

@app.post("/safety/parent-dashboard")
def parent_dashboard_endpoint(req: ParentReportRequest):
    """
    Translates raw metrics into plain-English advice and tonight's 10-minute action plan.
    """
# -------------------------------------------------------------
# Deep Dive: Early Learners (Ages 3-8) Literacy & Foundational Numeracy
# -------------------------------------------------------------
class CoachWordRequest(BaseModel):
    targetWord: str = Field(..., description="Target word from the storybook")
    spokenWord: str = Field(..., description="Child spoken transcript captured by voice recognition")

@app.get("/early-learners/storybooks")
def early_storybooks_endpoint():
    """Ello-Style: Returns interactive read-along storybooks for ages 3-8."""
    return get_storybook_catalog()

@app.post("/early-learners/coach-word")
def coach_word_endpoint(req: CoachWordRequest):
    """Ello-Style: Listens to read-aloud and coaches syllable-by-syllable phonics on stumble."""
    return coach_child_read_aloud(req.targetWord, req.spokenWord)

@app.get("/early-learners/duolingo-abc-session")
def duolingo_abc_session_endpoint(strugglingVowels: Optional[str] = None):
    """
    Duolingo ABC: Adaptive spaced repetition and pacing engine that quietly weaves
    struggling vowel sounds and sight words into 5-minute sessions.
    """
    vowels_list = strugglingVowels.split(",") if strugglingVowels else ["short_a", "short_o"]
# -------------------------------------------------------------
# Elementary (Ages 6-11): Synthesis Tutor & Prodigy RPG Endpoints
# -------------------------------------------------------------
@app.get("/synthesis/intuition")
def synthesis_intuition_endpoint(conceptId: Optional[str] = None):
    """Synthesis Tutor (SpaceX Ad Astra): Visual number lines and spatial area grids."""
    return get_synthesis_intuition(conceptId)

@app.get("/prodigy/battle")
def prodigy_battle_endpoint(playerLevel: int = 1, currentPet: Optional[str] = "Flame Fox"):
    """Prodigy RPG: Turn-based curriculum battle with cosmetic pets and placement diagnostics."""
    return generate_prodigy_rpg_battle(player_level=playerLevel, current_pet=currentPet or "Flame Fox")

# -------------------------------------------------------------
# Secondary (Ages 9-18): Khanmigo Socratic & Photomath Endpoints
# -------------------------------------------------------------
class KhanmigoQueryRequest(BaseModel):
    problem: str = Field(..., description="Problem prompt or homework question")
    studentThought: Optional[str] = Field(None, description="Student's own attempt or line of thought")

class HistoricalChatRequest(BaseModel):
    figure: str = Field(..., description="einstein, ada_lovelace, or da_vinci")
    query: str = Field(..., description="Student's question for the historical figure")

class PhotomathRequest(BaseModel):
    equation: str = Field(..., description="Math equation string to break down sequentially")

@app.post("/khanmigo/socratic-query")
def khanmigo_socratic_endpoint(req: KhanmigoQueryRequest):
    """Khanmigo Socratic Tutor: Hardcoded never to give direct answers; guides step-by-step."""
    return get_khanmigo_socratic_response(req.problem, req.studentThought)

@app.post("/khanmigo/historical-chat")
def khanmigo_historical_chat_endpoint(req: HistoricalChatRequest):
    """Khanmigo Roleplay: Chat with historical figures (Einstein, Ada Lovelace, Da Vinci)."""
    return chat_historical_figure(req.figure, req.query)

@app.post("/photomath/breakdown")
def photomath_breakdown_endpoint(req: PhotomathRequest):
    """Photomath Plus: Line-by-line sequential breakdown with exact math rules and textbook alignment."""
    return breakdown_photomath_equation(req.equation)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)




