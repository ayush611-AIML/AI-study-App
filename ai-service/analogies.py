import os
import re
import json
import random
from typing import List, Dict, Any, Optional
import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Built-in rich analogy templates for instant response when offline
BUILTIN_ANALOGIES = {
    "minecraft": {
        "mitochondria": "Think of mitochondria like a Furnace or Redstone Generator in Minecraft. Just like furnaces turn coal into heat and smelt ores, mitochondria take glucose food and transform it into ATP power cells so your character can run and jump!",
        "atp": "ATP is like your character's hunger bar and energy potions in Minecraft. Whenever you sprint, mine obsidian, or fight a Creeper, you spend ATP units of energy!",
        "glycolysis": "Glycolysis is like harvesting raw wood logs in Minecraft and crafting them into wooden planks before you can build a house. It takes big sugar molecules and cuts them down into manageable pieces!",
        "gravity": "Gravity in Minecraft is why sand, gravel, and anvils fall straight down when there are no blocks beneath them! The earth pulls matter down toward bedrock.",
        "fraction": "Fractions in Minecraft are like breaking a 64-item stack of iron ingots! Half a stack is 32/64 (1/2), and a quarter stack is 16/64 (1/4).",
        "default": "In Minecraft, everything is built from small modular blocks. This concept works the same way: small building blocks link together to create a powerful system!"
    },
    "pizza": {
        "mitochondria": "Mitochondria is like the industrial pizza oven at your favorite pizzeria. It bakes raw dough and cheese into delicious, warm slices that give everyone energy to play!",
        "atp": "ATP is like single slices of hot pepperoni pizza. Whenever you're hungry to run around, your body grabs a fresh slice of ATP to fuel up!",
        "fraction": "Imagine a giant cheesy pizza sliced into 8 equal slices. If you and your best friend eat 4 slices, you've eaten 4/8, which is exactly half (1/2) the pizza!",
        "default": "Imagine a big party pizza! Each piece represents a portion of the recipe working together so everyone gets a fair share."
    },
    "space": {
        "mitochondria": "Mitochondria is like the antimatter reactor core inside a starship cruising to Mars. It burns rocket fuel to generate warp power!",
        "atp": "ATP is like the charged battery cells inside an astronaut's spacesuit, powering oxygen scrubbers and jet thrusters.",
        "gravity": "Gravity is the invisible cosmic tractor beam that stars and planets use to keep moons in orbit without drifting into deep space.",
        "default": "Picture a cosmic space mission where every instrument has a vital telemetry role to reach the next galaxy."
    },
    "sports": {
        "mitochondria": "Mitochondria is like the team's strength & conditioning coach and halftime snack table combined, recharging players with energy drinks!",
        "atp": "ATP is the burst of speed a striker uses to sprint past defenders and score the winning goal in stoppage time!",
        "default": "Think of a championship football team where offense, defense, and coaching work in synchronized harmony."
    }
}

async def generate_analogy_llm(concept: str, context: str, interest: str) -> Optional[str]:
    """Generates a custom interest-based analogy using LLM API"""
    prompt = f"""You are an enthusiastic Socratic educator. Explain the scientific or academic concept below to a young student using an analogy based strictly on their favorite interest: '{interest}'.
Keep it between 2 to 3 sentences, vivid, fun, and easy to grasp.

Concept: {concept}
Context / Definition: {context}
Child's Interest: {interest}
"""
    if GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.4,
                    }
                )
                if res.status_code == 200:
                    return res.json()["choices"][0]["message"]["content"].strip()
        except Exception:
            pass

    return None

def get_concept_analogy(concept: str, context: str, interest: str = "minecraft") -> str:
    """Returns an analogy for a concept based on interest theme"""
    interest_key = interest.lower()
    if interest_key not in BUILTIN_ANALOGIES:
        interest_key = "minecraft"

    theme_dict = BUILTIN_ANALOGIES[interest_key]
    concept_lower = concept.lower()

    for key, analogy in theme_dict.items():
        if key in concept_lower or concept_lower in key:
            return analogy

    return f"Think of {concept} through {interest}: {theme_dict.get('default', 'It works just like a cooperative system where every element has an important job!')} Specifically: {context[:120]}..."
