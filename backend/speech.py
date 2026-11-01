"""
speech.py - SikshaSetu AI Audio and Speech Helper
Provides audio playback metadata and local audio file mappings.
Keeps speech capabilities transparent and honest without claiming unsupported models.
"""

import os
from typing import Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(BASE_DIR, "audio", "santhali")


def get_audio_status_for_word(filename: Optional[str]) -> Dict[str, Any]:
    """
    Checks if a verified native audio recording exists locally for the requested word.
    Does not pretend audio is present when it isn't.
    """
    if not filename:
        return {
            "has_audio_file": False,
            "audio_url": None,
            "speech_source": "phonetic_guide",
            "message": "स्थानीय संथाली ऑडियो रिकॉर्डिंग उपलब्ध नहीं है। कृपया देवनागरी एवं रोमन उच्चारण गाइड का उपयोग करें।"
        }

    file_path = os.path.join(AUDIO_DIR, filename)
    if os.path.exists(file_path):
        return {
            "has_audio_file": True,
            "audio_url": f"/audio/santhali/{filename}",
            "speech_source": "verified_native_recording",
            "message": "सत्यापित संथाली ऑडियो रिकॉर्डिंग उपलब्ध है।"
        }
    else:
        return {
            "has_audio_file": False,
            "audio_url": None,
            "speech_source": "phonetic_guide",
            "message": "स्थानीय संथाली ऑडियो फ़ाइल अभी रिकॉर्ड नहीं की गई है। उच्चारण सहायता के लिए फोनेटिक गाइड देखें।"
        }


def get_speech_capabilities() -> Dict[str, Any]:
    """
    Returns the supported speech and audio features of the SikshaSetu AI system.
    Maintains transparency: no external cloud paid APIs or huge models.
    """
    return {
        "voice_input": {
            "supported_on_client": True,
            "engine": "Browser Web Speech API (Client-side)",
            "supported_languages": ["hi-IN", "en-IN"],
            "requires_api_key": False
        },
        "audio_playback": {
            "local_audio_tracks": True,
            "client_synthesis": True,
            "phonetic_pronunciation_guide": True,
            "requires_api_key": False
        }
    }
