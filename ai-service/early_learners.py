import os
import re
from typing import List, Dict, Any, Optional

# ---------------------------------------------------------------------------
# 1. Ello-Style Read-Aloud with Avatar Phonics Coach (Ages 3-8)
# ---------------------------------------------------------------------------

STORYBOOKS = [
    {
        "id": "story_bunny",
        "title": "The Brave Little Bunny",
        "readingLevel": "Grade 1 (Ages 5-7)",
        "coverEmoji": "🐰",
        "pages": [
            {
                "pageNumber": 1,
                "text": "The little bunny hops across the sunny green meadow.",
                "words": [
                    {"word": "The", "syllables": ["The"], "phonics": "/ðə/", "isSightWord": True},
                    {"word": "little", "syllables": ["lit", "tle"], "phonics": "/ˈlɪt.əl/", "isSightWord": True},
                    {"word": "bunny", "syllables": ["bun", "ny"], "phonics": "/ˈbʌn.i/", "focusVowel": "short_u"},
                    {"word": "hops", "syllables": ["hops"], "phonics": "/hɒps/", "focusVowel": "short_o"},
                    {"word": "across", "syllables": ["a", "cross"], "phonics": "/əˈkrɒs/", "isSightWord": False},
                    {"word": "the", "syllables": ["the"], "phonics": "/ðə/", "isSightWord": True},
                    {"word": "sunny", "syllables": ["sun", "ny"], "phonics": "/ˈsʌn.i/", "focusVowel": "short_u"},
                    {"word": "green", "syllables": ["green"], "phonics": "/ɡriːn/", "focusVowel": "long_e"},
                    {"word": "meadow", "syllables": ["mead", "ow"], "phonics": "/ˈmɛd.oʊ/", "focusVowel": "short_e"}
                ],
                "illustration": "🌸 🐰 🌼 🌿 ☀️"
            },
            {
                "pageNumber": 2,
                "text": "He sees a shiny red apple high on a tall branch.",
                "words": [
                    {"word": "He", "syllables": ["He"], "phonics": "/hiː/", "isSightWord": True},
                    {"word": "sees", "syllables": ["sees"], "phonics": "/siːz/", "focusVowel": "long_e"},
                    {"word": "a", "syllables": ["a"], "phonics": "/eɪ/", "isSightWord": True},
                    {"word": "shiny", "syllables": ["shi", "ny"], "phonics": "/ˈʃaɪ.ni/", "focusDigraph": "sh"},
                    {"word": "red", "syllables": ["red"], "phonics": "/rɛd/", "focusVowel": "short_e"},
                    {"word": "apple", "syllables": ["ap", "ple"], "phonics": "/ˈæp.əl/", "focusVowel": "short_a"},
                    {"word": "high", "syllables": ["high"], "phonics": "/haɪ/", "isSightWord": True},
                    {"word": "on", "syllables": ["on"], "phonics": "/ɒn/", "isSightWord": True},
                    {"word": "a", "syllables": ["a"], "phonics": "/eɪ/", "isSightWord": True},
                    {"word": "tall", "syllables": ["tall"], "phonics": "/tɔːl/", "isSightWord": True},
                    {"word": "branch", "syllables": ["branch"], "phonics": "/bræntʃ/", "focusDigraph": "ch"}
                ],
                "illustration": "🍎 🌳 🐰 ✨"
            }
        ]
    },
    {
        "id": "story_space_pup",
        "title": "Astro Pup's Moon Adventure",
        "readingLevel": "Kindergarten (Ages 4-6)",
        "coverEmoji": "🐶🚀",
        "pages": [
            {
                "pageNumber": 1,
                "text": "Pip the pup wears a big white space suit.",
                "words": [
                    {"word": "Pip", "syllables": ["Pip"], "phonics": "/pɪp/", "focusVowel": "short_i"},
                    {"word": "the", "syllables": ["the"], "phonics": "/ðə/", "isSightWord": True},
                    {"word": "pup", "syllables": ["pup"], "phonics": "/pʌp/", "focusVowel": "short_u"},
                    {"word": "wears", "syllables": ["wears"], "phonics": "/wɛərz/", "isSightWord": True},
                    {"word": "a", "syllables": ["a"], "phonics": "/eɪ/", "isSightWord": True},
                    {"word": "big", "syllables": ["big"], "phonics": "/bɪɡ/", "focusVowel": "short_i"},
                    {"word": "white", "syllables": ["white"], "phonics": "/waɪt/", "isSightWord": True},
                    {"word": "space", "syllables": ["space"], "phonics": "/speɪs/", "focusVowel": "long_a"},
                    {"word": "suit", "syllables": ["suit"], "phonics": "/suːt/", "focusVowel": "long_u"}
                ],
                "illustration": "🚀 🐶 🌕 ⭐"
            }
        ]
    }
]

def get_storybook_catalog() -> List[Dict[str, Any]]:
    """Returns list of interactive read-along books designed for early learners."""
    return STORYBOOKS

def coach_child_read_aloud(target_word: str, spoken_word: str) -> Dict[str, Any]:
    """
    Ello-style real-time child speech listener.
    When a child stumbles, omits, or mispronounces a word, the avatar
    steps in to coach them syllable by syllable.
    """
    clean_target = re.sub(r'[^\w\s]', '', target_word.strip().lower())
    clean_spoken = re.sub(r'[^\w\s]', '', spoken_word.strip().lower())

    # Common syllable dictionary for early readers
    syllable_map = {
        "bunny": ["bun", "ny"],
        "meadow": ["mead", "ow"],
        "little": ["lit", "tle"],
        "across": ["a", "cross"],
        "shiny": ["shi", "ny"],
        "apple": ["ap", "ple"],
        "branch": ["branch"],
        "space": ["space"],
        "sunny": ["sun", "ny"],
        "elephant": ["el", "e", "phant"],
        "butterfly": ["but", "ter", "fly"]
    }

    syllables = syllable_map.get(clean_target, [clean_target])

    is_exact_match = (clean_target == clean_spoken)
    # Check close match / phonetic similarity
    similarity = 1.0 if is_exact_match else (0.5 if clean_target in clean_spoken or clean_spoken in clean_target else 0.0)

    if is_exact_match:
        return {
            "status": "correct",
            "targetWord": target_word,
            "spokenWord": spoken_word,
            "avatarCheer": f"🌟 Pip the Fox cheers: 'Spot on! You read \"{target_word}\" beautifully!'",
            "syllables": syllables,
            "needsCoaching": False
        }
    else:
        syllable_display = " • ".join(syllables)
        return {
            "status": "coaching",
            "targetWord": target_word,
            "spokenWord": spoken_word,
            "avatarCheer": f"🦊 Pip gently whispers: 'Let's sound it out together! {syllable_display}'",
            "syllables": syllables,
            "syllableDisplay": syllable_display,
            "coachingAudioPrompt": f"Let's break it down: {' ... '.join(syllables)}. Say it with me: {target_word}!",
            "needsCoaching": True
        }


# ---------------------------------------------------------------------------
# 2. Duolingo ABC-Style Spaced Repetition & Adaptive Phonics Engine
# ---------------------------------------------------------------------------

PHONEME_TARGETS = [
    {
        "id": "short_a",
        "name": "Short /a/ sound",
        "symbol": "/æ/",
        "sampleWords": ["cat", "hat", "apple", "bag", "jam"],
        "audioPrompt": "Short 'a' says /æ/ as in cat!",
        "exampleSentence": "The fat cat sat on the mat."
    },
    {
        "id": "short_e",
        "name": "Short /e/ sound",
        "symbol": "/ɛ/",
        "sampleWords": ["bed", "red", "hen", "pen", "leg"],
        "audioPrompt": "Short 'e' says /ɛ/ as in red bed!",
        "exampleSentence": "The red hen pecked ten seeds."
    },
    {
        "id": "short_i",
        "name": "Short /i/ sound",
        "symbol": "/ɪ/",
        "sampleWords": ["pig", "sit", "pin", "fish", "big"],
        "audioPrompt": "Short 'i' says /ɪ/ as in happy pig!",
        "exampleSentence": "A big pig did a quick jig."
    },
    {
        "id": "short_o",
        "name": "Short /o/ sound",
        "symbol": "/ɒ/",
        "sampleWords": ["fox", "box", "hop", "pot", "frog"],
        "audioPrompt": "Short 'o' says /ɒ/ as in quick fox!",
        "exampleSentence": "The frog hops on top of the log."
    },
    {
        "id": "short_u",
        "name": "Short /u/ sound",
        "symbol": "/ʌ/",
        "sampleWords": ["sun", "cup", "bus", "mud", "bug"],
        "audioPrompt": "Short 'u' says /ʌ/ as in sunny day!",
        "exampleSentence": "A bug in the mud drinks from a cup."
    },
    {
        "id": "digraph_sh",
        "name": "Digraph 'sh'",
        "symbol": "/ʃ/",
        "sampleWords": ["ship", "fish", "shell", "shoe", "shine"],
        "audioPrompt": "S and H together say /ʃ/ like 'shh'!",
        "exampleSentence": "A shiny shell washes by the ship."
    }
]

SIGHT_WORDS_CATALOG = [
    {"word": "the", "difficulty": 1, "emoji": "📖"},
    {"word": "and", "difficulty": 1, "emoji": "🤝"},
    {"word": "you", "difficulty": 1, "emoji": "👉"},
    {"word": "see", "difficulty": 1, "emoji": "👀"},
    {"word": "play", "difficulty": 2, "emoji": "⚽"},
    {"word": "little", "difficulty": 2, "emoji": "🐥"},
    {"word": "because", "difficulty": 3, "emoji": "💡"},
    {"word": "friend", "difficulty": 3, "emoji": "👫"}
]

def generate_adaptive_duolingo_abc_session(struggling_vowels: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Duolingo ABC Adaptive Pacing Engine:
    If a child struggles with a specific vowel sound (e.g., short /o/ or short /u/),
    the algorithm quietly prioritizes that phoneme into upcoming 5-minute sessions.
    """
    if not struggling_vowels:
        struggling_vowels = ["short_a", "short_o"]

    # Select target phoneme based on struggling history
    chosen_phoneme = None
    for p in PHONEME_TARGETS:
        if p["id"] in struggling_vowels:
            chosen_phoneme = p
            break
    if not chosen_phoneme:
        chosen_phoneme = PHONEME_TARGETS[0]

    # Generate tactile letter tracing challenge
    letter_to_trace = chosen_phoneme["sampleWords"][0][0].upper()
    tracing_activity = {
        "type": "tactile_tracing",
        "letter": letter_to_trace,
        "lowercase": letter_to_trace.lower(),
        "soundPrompt": f"Trace the letter {letter_to_trace}! It makes the sound {chosen_phoneme['symbol']}",
        "strokeSteps": [
            "1. Start at the top star ⭐",
            "2. Slide down to the bottom left ↙️",
            "3. Slide down to the bottom right ↘️",
            "4. Bridge across the middle ➡️"
        ]
    }

    # Generate vowel-fill puzzle (touch-based)
    sample_word = chosen_phoneme["sampleWords"][0] # e.g. "cat" or "fox"
    vowel_char = sample_word[1] if len(sample_word) >= 3 else "a"
    vowel_puzzle = {
        "type": "vowel_builder",
        "wordPattern": f"{sample_word[0].upper()} _ {sample_word[2:].upper()}",
        "fullWord": sample_word,
        "correctVowel": vowel_char.upper(),
        "vowelOptions": [vowel_char.upper(), "E", "I", "U"],
        "prompt": f"Find the missing vowel sound {chosen_phoneme['symbol']} to build '{sample_word.upper()}'!"
    }

    # Generate sight-word match balloon game
    sight_word_game = {
        "type": "sight_word_pop",
        "targetWord": "play",
        "options": [
            {"word": "play", "correct": True, "balloonColor": "#38BDF8"},
            {"word": "help", "correct": False, "balloonColor": "#EC4899"},
            {"word": "jump", "correct": False, "balloonColor": "#10B981"},
            {"word": "look", "correct": False, "balloonColor": "#F59E0B"}
        ],
        "prompt": "Pop the balloon with the sight word 'PLAY'!"
    }

    return {
        "sessionTitle": f"5-Minute Phonics & Sight Words: {chosen_phoneme['name']}",
        "targetPhoneme": chosen_phoneme,
        "tactileTracing": tracing_activity,
        "vowelPuzzle": vowel_puzzle,
        "sightWordGame": sight_word_game,
        "pedagogicalPacingNote": (
            f"Quiet Adaptive Pacing: Prioritizing {chosen_phoneme['name']} because "
            "subtle hesitation was observed in previous read-aloud sessions."
        )
    }
