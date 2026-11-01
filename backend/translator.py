"""
translator.py - SikshaSetu AI Translation Engine
Strictly delivers verified Santhali translations from the vocabulary dataset.
Handles single-line and multi-line inputs without false number detections.
"""

from typing import Dict, Any, List
from backend.database import find_vocabulary_item, get_all_vocabulary


def translate_single_line(line_text: str) -> Dict[str, Any]:
    """Translates a single line or sentence."""
    raw_query = line_text.strip()
    if not raw_query:
        return {
            "status": "empty",
            "is_verified": False,
            "source_text": "",
            "matched_phrase": None,
            "santhali_olchiki": "",
            "santhali_latin": "",
            "devanagari_pronunciation": "",
            "english": "",
            "category": "",
            "context": "",
            "icon": "ℹ️",
            "audio_file": None,
            "message": "कृपया अनुवाद के लिए कोई हिंदी शब्द या वाक्य दर्ज करें।"
        }

    match = find_vocabulary_item(raw_query)

    if match:
        return {
            "status": "verified",
            "is_verified": True,
            "source_text": raw_query,
            "matched_phrase": match.get("hindi"),
            "santhali_olchiki": match.get("santhali_olchiki", ""),
            "santhali_latin": match.get("santhali_latin", ""),
            "devanagari_pronunciation": match.get("devanagari_pronunciation", ""),
            "english": match.get("english", ""),
            "category": match.get("category", "सामान्य"),
            "context": match.get("context", ""),
            "icon": match.get("icon", "✨"),
            "audio_file": match.get("audio_file"),
            "message": "प्रमाणित संथाली अनुवाद उपलब्ध है।"
        }
    else:
        # STRICT REQUIREMENT: "Verified translation unavailable"
        return {
            "status": "unverified",
            "is_verified": False,
            "source_text": raw_query,
            "matched_phrase": None,
            "santhali_olchiki": "",
            "santhali_latin": "",
            "devanagari_pronunciation": "",
            "english": "",
            "category": "अपुष्ट / अज्ञात",
            "context": "यह प्रविष्टि वर्तमान में सत्यापित संथाली डेटाबेस में उपलब्ध नहीं है।",
            "icon": "⚠️",
            "audio_file": None,
            "message": "Verified translation unavailable"
        }


def translate_hindi_to_santhali(input_text: str) -> Dict[str, Any]:
    """
    Translates input Hindi text to Santhali (Ol Chiki + Roman pronunciation).
    Supports single-line and multi-line inputs.
    
    IMPORTANT TRANSLATION POLICY:
    - Never invent Santhali translations.
    - If unverified, strictly reports: 'Verified translation unavailable'.
    - Does not show default number cards when no matching vocabulary exists.
    """
    if not input_text or not input_text.strip():
        return {
            "status": "empty",
            "is_verified": False,
            "source_text": "",
            "matched_phrase": None,
            "santhali_olchiki": "",
            "santhali_latin": "",
            "message": "कृपया अनुवाद के लिए कोई हिंदी शब्द या वाक्य दर्ज करें।"
        }

    raw_text = input_text.strip()
    raw_lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    # If user provided multiple non-empty lines, translate each line separately
    if len(raw_lines) > 1:
        line_results = []
        for line in raw_lines:
            res = translate_single_line(line)
            line_results.append({
                "source_line": line,
                "is_verified": res["is_verified"],
                "santhali_olchiki": res["santhali_olchiki"],
                "santhali_latin": res["santhali_latin"],
                "devanagari_pronunciation": res["devanagari_pronunciation"],
                "matched_phrase": res["matched_phrase"],
                "english": res["english"],
                "icon": res.get("icon", "✨" if res["is_verified"] else "⚠️"),
                "message": res["message"]
            })

        has_any_verified = any(item["is_verified"] for item in line_results)
        all_verified = all(item["is_verified"] for item in line_results)

        return {
            "status": "multiline",
            "is_multiline": True,
            "source_text": raw_text,
            "lines_count": len(line_results),
            "lines": line_results,
            "is_verified": all_verified,
            "has_verified": has_any_verified,
            "message": "पंक्ति-वार अनुवाद परिणाम (Line-by-line translation results)"
        }
    else:
        # Single line translation
        single_line = raw_lines[0] if raw_lines else raw_text
        res = translate_single_line(single_line)
        res["is_multiline"] = False
        return res


def get_available_suggestions(limit: int = 6) -> List[Dict[str, str]]:
    """Return common verified classroom phrases to help teachers get started easily."""
    all_vocab = get_all_vocabulary()
    classroom_items = [
        {"hindi": v.get("hindi"), "santhali": v.get("santhali_olchiki"), "latin": v.get("santhali_latin")}
        for v in all_vocab if "कक्षा" in v.get("category", "")
    ]
    return classroom_items[:limit] if classroom_items else []
