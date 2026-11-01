"""
database.py - SikshaSetu AI Data Access Layer
Loads and caches verified vocabulary, lessons, and worksheets from the data directory.
Provides accurate phrase matching without loose single-digit or single-letter false matches.
"""

import json
import os
import re
from typing import List, Dict, Any, Optional

# Resolve paths safely relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

VOCABULARY_FILE = os.path.join(DATA_DIR, "vocabulary.json")
LESSONS_FILE = os.path.join(DATA_DIR, "lessons.json")
WORKSHEETS_FILE = os.path.join(DATA_DIR, "worksheets.json")

# In-memory caches
_vocabulary_cache: Optional[List[Dict[str, Any]]] = None
_lessons_cache: Optional[List[Dict[str, Any]]] = None
_worksheets_cache: Optional[List[Dict[str, Any]]] = None


def _load_json_file(file_path: str, default: Any = None) -> Any:
    """Helper to safely read JSON files with UTF-8 encoding."""
    if not os.path.exists(file_path):
        return default if default is not None else []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return default if default is not None else []
            return json.loads(content)
    except Exception as exc:
        print(f"[Database Error] Could not read {file_path}: {exc}")
        return default if default is not None else []


def get_all_vocabulary(reload: bool = False) -> List[Dict[str, Any]]:
    """Retrieve all verified vocabulary items."""
    global _vocabulary_cache
    if _vocabulary_cache is None or reload:
        _vocabulary_cache = _load_json_file(VOCABULARY_FILE, [])
    return _vocabulary_cache


def get_all_lessons(reload: bool = False) -> List[Dict[str, Any]]:
    """Retrieve all structured lessons."""
    global _lessons_cache
    if _lessons_cache is None or reload:
        _lessons_cache = _load_json_file(LESSONS_FILE, [])
    return _lessons_cache


def get_all_worksheets(reload: bool = False) -> List[Dict[str, Any]]:
    """Retrieve all interactive worksheets."""
    global _worksheets_cache
    if _worksheets_cache is None or reload:
        _worksheets_cache = _load_json_file(WORKSHEETS_FILE, [])
    return _worksheets_cache


def clean_text_for_search(text: str) -> str:
    """
    Strips punctuation, normalizes spacing, and lowercases text.
    Preserves Devanagari and Latin letters and numerals.
    """
    if not text:
        return ""
    # Remove common Hindi and English punctuation
    cleaned = re.sub(r'[\?!।,.\-—"\'¿¡;:()\[\]{}]+', ' ', text)
    return ' '.join(cleaned.split()).lower()


def strip_line_numbering_prefix(line: str) -> str:
    """
    Strips leading list bullets like '1. ', '2) ', '- ', '• ' so that
    bulleted sentences like '1. बैठ जाओ' do not falsely trigger number 1 matching.
    """
    return re.sub(r'^\s*(?:\d+[\.\)]|[\-*•])\s*', '', line).strip()


def find_vocabulary_item(raw_query: str) -> Optional[Dict[str, Any]]:
    """
    Search the verified vocabulary dataset for an exact or accurate phrase match.
    
    IMPORTANT RULES:
    1. NEVER match single digits or single characters as loose substrings inside other words/numbers.
       For instance, '123456789' MUST NOT match '1 / एक'.
    2. Number keywords (like '1', '2', '१', '२') must ONLY match if the query is strictly that number.
    3. Handles polite classroom prefixes (e.g. 'कृपया बैठ जाओ' -> matches 'बैठ जाओ').
    4. Multi-word phrases match only if the full phrase appears as whole words.
    5. Returns None if no matching verified entry exists (No false defaults!).
    """
    if not raw_query or not raw_query.strip():
        return None

    cleaned_input = strip_line_numbering_prefix(raw_query)
    q = clean_text_for_search(cleaned_input)
    if not q:
        return None

    vocab_list = get_all_vocabulary()

    # Filter out common polite Hindi classroom fillers
    tokens = q.split()
    polite_words = {'कृपया', 'प्लीज', 'जरा', 'बच्चों', 'बेटा', 'अरे', 'जी'}
    filtered_tokens = [tok for tok in tokens if tok not in polite_words]
    filtered_q = ' '.join(filtered_tokens) if filtered_tokens else q

    # ----------------- PHASE 1: EXACT MATCH -----------------
    # Check exact match against primary Hindi word
    for item in vocab_list:
        h = clean_text_for_search(item.get("hindi", ""))
        if h == q or (filtered_q and h == filtered_q):
            return item

    # Check exact match against keywords
    for item in vocab_list:
        for kw in item.get("hindi_keywords", []):
            kw_clean = clean_text_for_search(kw)
            if kw_clean == q or (filtered_q and kw_clean == filtered_q):
                return item

    # ----------------- PHASE 2: WHOLE-PHRASE MATCHING -----------------
    # Only for multi-word phrases (>= 2 words).
    # NEVER loose substring match single words or single digits!
    for item in vocab_list:
        h = clean_text_for_search(item.get("hindi", ""))
        h_words = h.split()
        if len(h_words) >= 2:
            h_phrase = ' '.join(h_words)
            pattern = r'(?:\b|\s|^)' + re.escape(h_phrase) + r'(?:\b|\s|$)'
            if re.search(pattern, q) or (filtered_q and re.search(pattern, filtered_q)):
                return item

    # Check multi-word keywords
    for item in vocab_list:
        for kw in item.get("hindi_keywords", []):
            kw_clean = clean_text_for_search(kw)
            kw_words = kw_clean.split()
            if len(kw_words) >= 2:
                kw_phrase = ' '.join(kw_words)
                pattern = r'(?:\b|\s|^)' + re.escape(kw_phrase) + r'(?:\b|\s|$)'
                if re.search(pattern, q) or (filtered_q and re.search(pattern, filtered_q)):
                    return item

    # No verified match found
    return None
