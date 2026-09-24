"""
Regional Language Voice Report Readout
--------------------------------------
Converts the structured clinical report into spoken summaries for low-literacy field technicians
and rural patients across English, Hindi (हिंदी), and Gujarati (ગુજરાતી).

If native TTS is offline, gracefully degrades to the formatted regional script transcript.
Never makes medical claims independent from the clinical report.
"""

import io
import wave
import math
import struct
import base64

REGIONAL_TEMPLATES = {
    "en": {
        0: "Retinal scan is normal. No diabetic retinopathy detected. Continue routine annual screening.",
        1: "Mild diabetic retinopathy detected with early microaneurysms. Maintain glycemic control and routine follow-up.",
        2: "Moderate diabetic retinopathy detected. Ophthalmologist clinical review recommended.",
        3: "Severe diabetic retinopathy detected with significant hemorrhages. Urgent specialist referral required.",
        4: "Advanced proliferative retinopathy detected. Immediate tertiary vitreoretinal hospital care required."
    },
    "hi": {
        0: "आँखों की जाँच सामान्य है। कोई डायबिटिक रेटिनोपैथी के लक्षण नहीं मिले हैं। नियमित वार्षिक जाँच जारी रखें।",
        1: "हल्की डायबिटिक रेटिनोपैथी के शुरुआती लक्षण मिले हैं। नियमित शुगर नियंत्रण रखें।",
        2: "मध्यम डायबिटिक रेटिनोपैथी पाई गई है। नेत्र विशेषज्ञ (आई डॉक्टर) से जाँच की सलाह दी जाती है।",
        3: "गंभीर डायबिटिक रेटिनोपैथी के लक्षण हैं। तुरंत नेत्र अस्पताल में दिखाना आवश्यक है।",
        4: "अत्यधिक गंभीर रेटिनोपैथी है। दृष्टि बचाने हेतु तत्काल रेटिना विशेषज्ञ से संपर्क करें।"
    },
    "gu": {
        0: "આંખની તપાસ સામાન્ય છે. કોઈ ડાયાબિટીક રેટિનોપેથીના ચિહ્નો મળ્યા નથી. નિયમિત વાર્ષિક તપાસ કરાવો.",
        1: "હળવી ડાયાબિટીક રેટિનોપેથીના પ્રારંભિક ચિહ્નો મળ્યા છે. બ્લડ શુગર નિયંત્રણમાં રાખો.",
        2: "મધ્યમ ડાયાબિટીક રેટિનોપેથી જોવા મળી છે. આંખના નિષ્ણાત ડૉક્ટર પાસે તપાસ કરાવવી જરૂરી છે.",
        3: "ગંભીર ડાયાબિટીક રેટિનોપેથી જણાય છે. આંખની વિશેષ હોસ્પિટલમાં તાત્કાલિક સારવાર લો.",
        4: "અત્યંત ગંભીર સ્થિતિ છે. તાત્કાલિક રેટિના નિષ્ણાત ડૉક્ટરનો સંપર્ક કરો."
    }
}

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "gu": "Gujarati (ગુજરાતી)"
}

def _generate_synthetic_chime_wav(frequency=440, duration_sec=0.5):
    """
    Generates a pure sinusoidal audio chime in WAV format (pure python wave).
    Used as an offline audio preview cue.
    """
    sample_rate = 16000
    num_samples = int(sample_rate * duration_sec)
    buffer = io.BytesIO()
    
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            t = float(i) / sample_rate
            decay = math.exp(-3.0 * t)
            value = int(32767.0 * 0.5 * decay * math.sin(2.0 * math.pi * frequency * t))
            data = struct.pack('<h', value)
            wav_file.writeframesraw(data)
            
    buffer.seek(0)
    b64_audio = base64.b64encode(buffer.read()).decode('ascii')
    return f"data:audio/wav;base64,{b64_audio}"

def get_spoken_text_for_grade(grade, lang="en"):
    """Fetches localized clinical readout text."""
    lang_dict = REGIONAL_TEMPLATES.get(lang, REGIONAL_TEMPLATES["en"])
    return lang_dict.get(int(grade), lang_dict[0])

def generate_voice_report(normalized_case, lang="en"):
    """
    Generates a multilingual speech synthesis payload for the case.
    """
    grade = int(normalized_case.get("grade", 0))
    patient_name = normalized_case.get("patient_name", "Patient")
    
    # Supported languages payload
    transcripts = {}
    for l_code, l_dict in REGIONAL_TEMPLATES.items():
        base_sentence = l_dict.get(grade, l_dict[0])
        transcripts[l_code] = {
            "language_name": LANGUAGE_NAMES.get(l_code, l_code),
            "text": base_sentence
        }
        
    active_text = transcripts.get(lang, transcripts["en"])["text"]
    
    # Audio cue frequency: Higher chime for referable cases, calming chord for normal
    freq = 587 if grade >= 2 else 440
    audio_data_uri = _generate_synthetic_chime_wav(frequency=freq, duration_sec=0.6)
    
    return {
        "status": "READY",
        "active_language": lang,
        "active_language_name": LANGUAGE_NAMES.get(lang, "English"),
        "spoken_text": active_text,
        "transcripts": transcripts,
        "audio_chime_url": audio_data_uri,
        "browser_tts_supported": True,
        "speech_synth_config": {
            "lang": "hi-IN" if lang == "hi" else ("gu-IN" if lang == "gu" else "en-US"),
            "rate": 0.95,
            "pitch": 1.0
        },
        "disclaimer": "Voice report is an assistive readout of the clinical findings."
    }
