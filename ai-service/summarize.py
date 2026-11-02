import os
import re
from typing import List, Dict, Any, Tuple
import httpx

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
HF_SUMMARY_MODEL = os.getenv("HF_SUMMARY_MODEL", "facebook/bart-large-cnn")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    """
    Cleans and splits text into chunks of approximately 500 words,
    respecting sentence boundaries.
    """
    cleaned_text = re.sub(r'\s+', ' ', text).strip()
    sentences = re.split(r'(?<=[.?!])\s+', cleaned_text)
    
    chunks = []
    current_chunk = []
    current_word_count = 0

    for s in sentences:
        words = s.split()
        if not words:
            continue
        if current_word_count + len(words) > chunk_size and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [s]
            current_word_count = len(words)
        else:
            current_chunk.append(s)
            current_word_count += len(words)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks if chunks else [text]

def extract_key_terms(text: str, top_k: int = 6) -> List[str]:
    """
    Extracts high-importance key study terms and concepts.
    """
    stopwords = {
        'about', 'above', 'after', 'again', 'against', 'all', 'and', 'any', 'are', 'because',
        'been', 'before', 'being', 'below', 'between', 'both', 'but', 'can', 'cannot', 'could',
        'did', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
        'had', 'has', 'have', 'having', 'her', 'here', 'hers', 'herself', 'him', 'himself',
        'his', 'how', 'into', 'is', 'its', 'itself', 'more', 'most', 'not', 'only', 'other',
        'our', 'ours', 'out', 'over', 'same', 'should', 'some', 'such', 'than', 'that', 'the',
        'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
        'those', 'through', 'under', 'until', 'very', 'was', 'were', 'what', 'when', 'where',
        'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
    }
    words = re.findall(r'\b[A-Za-z][A-Za-z0-9_-]{3,}\b', text)
    freq: Dict[str, int] = {}
    for w in words:
        wl = w.lower()
        if wl not in stopwords and len(wl) >= 4:
            cap_word = w.capitalize()
            freq[cap_word] = freq.get(cap_word, 0) + 1

    sorted_terms = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)
    return sorted_terms[:top_k]

async def summarize_chunk_hf(chunk: str) -> Optional[str]:
    """
    Summarize a chunk using Hugging Face Inference API.
    """
    if not HUGGINGFACE_API_KEY:
        return None
    url = f"https://api-inference.huggingface.co/models/{HF_SUMMARY_MODEL}"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    payload = {
        "inputs": chunk,
        "parameters": {"max_length": 150, "min_length": 40, "do_sample": False}
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(url, json=payload, headers=headers)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and len(data) > 0:
                return data[0].get("summary_text")
    return None

def extractive_summary(text: str, max_sentences: int = 4) -> str:
    """
    Robust local extractive summarizer when external APIs are offline.
    Uses sentence frequency scoring.
    """
    sentences = re.split(r'(?<=[.?!])\s+', text.strip())
    if len(sentences) <= max_sentences:
        return text.strip()

    words = re.findall(r'\b\w+\b', text.lower())
    word_freq: Dict[str, int] = {}
    for w in words:
        if len(w) > 3:
            word_freq[w] = word_freq.get(w, 0) + 1

    scored = []
    for s in sentences:
        s_words = re.findall(r'\b\w+\b', s.lower())
        score = sum(word_freq.get(w, 0) for w in s_words) / (len(s_words) + 1)
        scored.append((score, s))

    # Pick highest scoring sentences and preserve original order
    top_sentences = sorted(scored, key=lambda x: x[0], reverse=True)[:max_sentences]
    ordered = sorted(top_sentences, key=lambda x: sentences.index(x[1]))
    return " ".join([s[1] for s in ordered])

async def summarize_notes(text: str) -> Tuple[str, List[str]]:
    """
    Main summarization pipeline:
    1. Chunk long notes into ~500 word blocks
    2. Summarize each chunk
    3. Merge summaries into a unified, structured summary
    4. Extract key study terms
    """
    chunks = chunk_text(text, chunk_size=500)
    summaries = []

    for c in chunks:
        hf_summary = await summarize_chunk_hf(c)
        if hf_summary:
            summaries.append(hf_summary)
        else:
            summaries.append(extractive_summary(c, max_sentences=3))

    merged_summary = " ".join(summaries)
    if len(chunks) > 1 and len(merged_summary.split()) > 300:
        merged_summary = extractive_summary(merged_summary, max_sentences=5)

    key_terms = extract_key_terms(text, top_k=6)
    return merged_summary, key_terms
