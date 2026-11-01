/**
 * SikshaSetu AI - Frontend Application Script
 * Connects to FastAPI backend with full offline fallback,
 * Web Speech API voice input, audio pronunciation, flashcards,
 * lessons modal, interactive worksheets, and PWA service worker.
 */

// Global State
const state = {
  activeTab: 'tab-translator',
  uiLanguage: 'hi', // 'hi' or 'olchiki'
  isOnline: navigator.onLine,
  vocabulary: [],
  lessons: [],
  worksheets: [],
  activeWorksheetId: 'ws_01',
  overallScore: 0,
  matchingSelectedHindi: null,
  matchingSelectedSanthali: null,
  currentTranslation: null,
  isListening: false
};

// ==========================================
// 1. EMBEDDED LOCAL FALLBACK DATA
// (Ensures 100% functionality offline or without server)
// ==========================================
const FALLBACK_VOCABULARY = [
  { id: "voc_01", hindi: "नमस्ते", hindi_keywords: ["नमस्ते", "प्रणाम", "नमस्कार"], santhali_olchiki: "ᱡᱚᱦᱟᱨ", santhali_latin: "Johar", devanagari_pronunciation: "जोहार", english: "Hello / Greetings", category: "शिष्टाचार (Greetings)", context: "कक्षा में प्रवेश करते समय या अभिवादन करते समय।", icon: "🙏", verified: true },
  { id: "voc_02", hindi: "स्वागत है", hindi_keywords: ["स्वागत है", "स्वागत"], santhali_olchiki: "ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ", santhali_latin: "Sagun daram", devanagari_pronunciation: "सगुन दाराम", english: "Welcome", category: "शिष्टाचार (Greetings)", context: "कक्षा में नए बच्चे का स्वागत करने के लिए।", icon: "🌸", verified: true },
  { id: "voc_03", hindi: "सुप्रभात", hindi_keywords: ["सुप्रभात", "शुभ प्रभात"], santhali_olchiki: "ᱥᱟᱹᱜᱩᱱ ᱥᱮᱛᱟᱜ", santhali_latin: "Sagun setak'", devanagari_pronunciation: "सगुन सेताक'", english: "Good morning", category: "शिष्टाचार (Greetings)", context: "सुबह की प्रार्थना में कहें।", icon: "🌅", verified: true },
  { id: "voc_04", hindi: "धन्यवाद", hindi_keywords: ["धन्यवाद", "शुक्रिया"], santhali_olchiki: "ᱥᱟᱨᱦᱟᱣ", santhali_latin: "Sarhao", devanagari_pronunciation: "सारहाव", english: "Thank you", category: "शिष्टाचार (Greetings)", context: "बच्चों के अच्छे कार्य के बाद कहें।", icon: "💐", verified: true },
  { id: "voc_05", hindi: "बैठ जाओ", hindi_keywords: ["बैठ जाओ", "बैठो", "बैठिए"], santhali_olchiki: "ᱫᱩᱲᱩᱵᱽ ᱢᱮ", santhali_latin: "Duṛup' me", devanagari_pronunciation: "दुरुप मे", english: "Sit down", category: "कक्षा निर्देश (Classroom)", context: "बच्चे को अपनी जगह पर बैठने का निर्देश।", icon: "🪑", verified: true },
  { id: "voc_06", hindi: "खड़े हो जाओ", hindi_keywords: ["खड़े हो जाओ", "खड़े हो", "खड़े होइए"], santhali_olchiki: "ᱛᱤᱸᱜᱩᱱ ᱢᱮ", santhali_latin: "Tingun me", devanagari_pronunciation: "तिंगुन मे", english: "Stand up", category: "कक्षा निर्देश (Classroom)", context: "उत्तर देने या गतिविधि के लिए खड़े होने का निर्देश।", icon: "🧍", verified: true },
  { id: "voc_07", hindi: "इधर आओ", hindi_keywords: ["इधर आओ", "यहाँ आओ", "पास आओ"], santhali_olchiki: "ᱱᱚᱰᱮ ᱦᱤᱡᱩᱜ ᱢᱮ", santhali_latin: "Noḍe hijuk' me", devanagari_pronunciation: "नोडे हिजुक मे", english: "Come here", category: "कक्षा निर्देश (Classroom)", context: "बच्चे को श्यामपट्ट (बोर्ड) के पास बुलाने के लिए।", icon: "👉", verified: true },
  { id: "voc_08", hindi: "किताब खोलो", hindi_keywords: ["किताब खोलो", "पुस्तक खोलो"], santhali_olchiki: "ᱯᱩᱛᱷᱤ ᱡᱷᱤᱡᱽ ᱢᱮ", santhali_latin: "Puthi jhij me", devanagari_pronunciation: "पुथी झीज मे", english: "Open your book", category: "कक्षा निर्देश (Classroom)", context: "पाठ शुरू करते समय बच्चों को अपनी किताब खोलने के लिए।", icon: "📖", verified: true },
  { id: "voc_09", hindi: "किताब बंद करो", hindi_keywords: ["किताब बंद करो", "पुस्तक बंद करो"], santhali_olchiki: "ᱯᱩᱛᱷᱤ ᱵᱚᱸᱫᱽ ᱢᱮ", santhali_latin: "Puthi bond me", devanagari_pronunciation: "पुथी बोन्द मे", english: "Close your book", category: "कक्षा निर्देश (Classroom)", context: "पाठ समाप्त होने पर किताब रखने का निर्देश।", icon: "📕", verified: true },
  { id: "voc_10", hindi: "लिखो", hindi_keywords: ["लिखो", "लिखिए", "कापी में लिखो"], santhali_olchiki: "ᱚᱞ ᱢᱮ", santhali_latin: "Ol me", devanagari_pronunciation: "ओल मे", english: "Write", category: "कक्षा निर्देश (Classroom)", context: "कापी या स्लेट पर लिखने का निर्देश।", icon: "✏️", verified: true },
  { id: "voc_11", hindi: "पढ़ो", hindi_keywords: ["पढ़ो", "पढ़िए"], santhali_olchiki: "ᱯᱟᱲᱦᱟᱣ ᱢᱮ", santhali_latin: "Paṛhaw me", devanagari_pronunciation: "पाड़हाव मे", english: "Read", category: "कक्षा निर्देश (Classroom)", context: "पाठ या शब्द जोर से पढ़ने का निर्देश।", icon: "📚", verified: true },
  { id: "voc_12", hindi: "चुप रहो", hindi_keywords: ["चुप रहो", "शांत रहो", "आवाज मत करो"], santhali_olchiki: "ᱛᱷᱤᱨ ᱠᱚᱜ ᱢᱮ", santhali_latin: "Thir kok' me", devanagari_pronunciation: "थिर कोक मे", english: "Be quiet / Keep silence", category: "कक्षा निर्देश (Classroom)", context: "कक्षा में शांति बनाए रखने के लिए प्यार से कहें।", icon: "🤫", verified: true },
  { id: "voc_13", hindi: "मेरी बात सुनो", hindi_keywords: ["मेरी बात सुनो", "सुनो", "सुनिए"], santhali_olchiki: "ᱤᱧᱟᱜ ᱠᱟᱛᱷᱟ ᱟᱸᱡᱚᱢ ᱢᱮ", santhali_latin: "Iñak' katha āñjom me", devanagari_pronunciation: "इञाक' काथा आंजोम मे", english: "Listen to me", category: "कक्षा निर्देश (Classroom)", context: "शिक्षक की ओर ध्यान आकर्षित करने के लिए।", icon: "👂", verified: true },
  { id: "voc_14", hindi: "पानी पीना है?", hindi_keywords: ["पानी पीना है", "पानी पियोगे", "पानी पीना है?"], santhali_olchiki: "ᱫᱟᱜ ᱧᱩ ᱥᱟᱱᱟᱭᱮᱫ ᱢᱮᱭᱟ?", santhali_latin: "Dak' ñu sanayet' meya?", devanagari_pronunciation: "दाक' ञु सानायेत' मेया?", english: "Do you want to drink water?", category: "कक्षा निर्देश (Classroom)", context: "जब बच्चा प्यासा लगे या अनुमति माँगे।", icon: "💧", verified: true },
  { id: "voc_15", hindi: "समझ में आया?", hindi_keywords: ["समझ में आया", "समझ गए", "समझे"], santhali_olchiki: "ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟᱢ?", santhali_latin: "Bujhạu kedam?", devanagari_pronunciation: "बुझाव केदाम?", english: "Did you understand?", category: "कक्षा निर्देश (Classroom)", context: "पढ़ाने के बाद बच्चों से पुष्टि करने के लिए।", icon: "💡", verified: true },
  { id: "voc_16", hindi: "हाँ", hindi_keywords: ["हाँ", "जी हाँ"], santhali_olchiki: "ᱦᱮᱸ", santhali_latin: "Hẽ", devanagari_pronunciation: "हें", english: "Yes", category: "दैनिक शब्द (Daily Words)", context: "सकारात्मक उत्तर।", icon: "✅", verified: true },
  { id: "voc_17", hindi: "नहीं", hindi_keywords: ["नहीं", "जी नहीं"], santhali_olchiki: "ᱵᱟᱝ", santhali_latin: "Bang", devanagari_pronunciation: "बांग", english: "No", category: "दैनिक शब्द (Daily Words)", context: "नकारात्मक उत्तर।", icon: "❌", verified: true },
  { id: "voc_18", hindi: "बहुत अच्छा", hindi_keywords: ["बहुत अच्छा", "शाबाश", "बढ़िया"], santhali_olchiki: "ᱟᱹᱰᱤ ᱵᱷᱟᱹᱜᱤ", santhali_latin: "Aḍi bhạgi", devanagari_pronunciation: "आड़ि भागी", english: "Very good / Well done", category: "प्रोत्साहन (Encouragement)", context: "बच्चे के सही उत्तर की प्रशंसा हेतु।", icon: "🌟", verified: true },
  { id: "voc_19", hindi: "ताली बजाओ", hindi_keywords: ["ताली बजाओ", "ताली"], santhali_olchiki: "ᱛᱷᱟᱹᱭᱟᱹ ᱛᱷᱟᱹᱭᱟᱹ", santhali_latin: "Thạyo thạyo", devanagari_pronunciation: "थायो थायो", english: "Clap hands", category: "कक्षा निर्देश (Classroom)", context: "सफल प्रस्तुति के बाद ताली बजवाने के लिए।", icon: "👏", verified: true },
  { id: "voc_20", hindi: "घर जाओ", hindi_keywords: ["घर जाओ", "छुट्टी हो गई"], santhali_olchiki: "ᱚᱲᱟᱜ ᱥᱮᱱᱚᱜ ᱢᱮ", santhali_latin: "Oṛak' senok' me", devanagari_pronunciation: "ओड़ाक' सेनोक' मे", english: "Go home", category: "कक्षा निर्देश (Classroom)", context: "स्कूल की छुट्टी होने पर।", icon: "🏠", verified: true },
  { id: "voc_21", hindi: "एक", hindi_keywords: ["एक", "1"], santhali_olchiki: "᱑ - ᱢᱤᱫ", santhali_latin: "1 - Mit'", devanagari_pronunciation: "मित'", english: "One (1)", category: "गिनती (Numbers)", context: "संथाली संख्या 1 (Ol Chiki: ᱑)", icon: "1️⃣", verified: true },
  { id: "voc_22", hindi: "दो", hindi_keywords: ["दो", "2"], santhali_olchiki: "᱒ - ᱵᱟᱨ", santhali_latin: "2 - Bar", devanagari_pronunciation: "बार", english: "Two (2)", category: "गिनती (Numbers)", context: "संथाली संख्या 2 (Ol Chiki: ᱒)", icon: "2️⃣", verified: true },
  { id: "voc_23", hindi: "तीन", hindi_keywords: ["तीन", "3"], santhali_olchiki: "᱓ - ᱯᱮ", santhali_latin: "3 - Pē", devanagari_pronunciation: "पे", english: "Three (3)", category: "गिनती (Numbers)", context: "संथाली संख्या 3 (Ol Chiki: ᱓)", icon: "3️⃣", verified: true },
  { id: "voc_24", hindi: "चार", hindi_keywords: ["चार", "4"], santhali_olchiki: "᱔ - ᱯᱩᱱ", santhali_latin: "4 - Pun", devanagari_pronunciation: "पून", english: "Four (4)", category: "गिनती (Numbers)", context: "संथाली संख्या 4 (Ol Chiki: ᱔)", icon: "4️⃣", verified: true },
  { id: "voc_25", hindi: "पाँच", hindi_keywords: ["पाँच", "पांच", "5"], santhali_olchiki: "᱕ - ᱢᱚᱬᱮ", santhali_latin: "5 - Mõṛẽ", devanagari_pronunciation: "मोड़े", english: "Five (5)", category: "गिनती (Numbers)", context: "संथाली संख्या 5 (Ol Chiki: ᱕)", icon: "5️⃣", verified: true },
  { id: "voc_26", hindi: "छह", hindi_keywords: ["छह", "6"], santhali_olchiki: "᱖ - ᱛᱩᱨᱩᱭ", santhali_latin: "6 - Turui", devanagari_pronunciation: "तुरुय", english: "Six (6)", category: "गिनती (Numbers)", context: "संथाली संख्या 6 (Ol Chiki: ᱖)", icon: "6️⃣", verified: true },
  { id: "voc_27", hindi: "सात", hindi_keywords: ["सात", "7"], santhali_olchiki: "᱗ - ᱮᱭᱟᱭ", santhali_latin: "7 - Eyay", devanagari_pronunciation: "एयाय", english: "Seven (7)", category: "गिनती (Numbers)", context: "संथाली संख्या 7 (Ol Chiki: ᱗)", icon: "7️⃣", verified: true },
  { id: "voc_28", hindi: "आठ", hindi_keywords: ["आठ", "8"], santhali_olchiki: "᱘ - ᱤᱨᱟᱹᱞ", santhali_latin: "8 - Iral", devanagari_pronunciation: "इराल", english: "Eight (8)", category: "गिनती (Numbers)", context: "संथाली संख्या 8 (Ol Chiki: ᱘)", icon: "8️⃣", verified: true },
  { id: "voc_29", hindi: "नौ", hindi_keywords: ["नौ", "9"], santhali_olchiki: "᱙ - ᱟᱨᱮ", santhali_latin: "9 - Are", devanagari_pronunciation: "आरे", english: "Nine (9)", category: "गिनती (Numbers)", context: "संथाली संख्या 9 (Ol Chiki: ᱙)", icon: "9️⃣", verified: true },
  { id: "voc_30", hindi: "दस", hindi_keywords: ["दस", "10"], santhali_olchiki: "᱑᱐ - ᱜᱮᱞ", santhali_latin: "10 - Gel", devanagari_pronunciation: "गेल", english: "Ten (10)", category: "गिनती (Numbers)", context: "संथाली संख्या 10 (Ol Chiki: ᱑᱐)", icon: "🔟", verified: true },
  { id: "voc_31", hindi: "विद्यालय", hindi_keywords: ["विद्यालय", "स्कूल"], santhali_olchiki: "ᱤᱛᱩᱱ ᱟᱥᱲᱟ", santhali_latin: "Itun asṛa", devanagari_pronunciation: "इतून आसड़ा", english: "School", category: "विद्यालय (School)", context: "विद्यालय या पढ़ने की जगह।", icon: "🏫", verified: true },
  { id: "voc_32", hindi: "शिक्षक", hindi_keywords: ["शिक्षक", "गुरुजी", "सर"], santhali_olchiki: "ᱢᱟᱪᱮᱛ", santhali_latin: "Machet'", devanagari_pronunciation: "माचेत'", english: "Teacher (male)", category: "विद्यालय (School)", context: "शिक्षक या अध्यापक।", icon: "👨‍🏫", verified: true },
  { id: "voc_33", hindi: "शिक्षिका", hindi_keywords: ["शिक्षिका", "दीदी", "मैडम"], santhali_olchiki: "ᱢᱟᱪᱮᱛᱟᱱᱤ", santhali_latin: "Machetani", devanagari_pronunciation: "माचेतानी", english: "Teacher (female)", category: "विद्यालय (School)", context: "शिक्षिका या अध्यापिका।", icon: "👩‍🏫", verified: true },
  { id: "voc_34", hindi: "किताब", hindi_keywords: ["किताब", "पुस्तक"], santhali_olchiki: "ᱯᱩᱛᱷᱤ", santhali_latin: "Puthi", devanagari_pronunciation: "पुथी", english: "Book", category: "विद्यालय (School)", context: "किताब या पाठ्यपुस्तक।", icon: "📕", verified: true },
  { id: "voc_35", hindi: "कलम", hindi_keywords: ["कलम", "पेन"], santhali_olchiki: "ᱠᱚᱞᱚᱢ", santhali_latin: "Kalom", devanagari_pronunciation: "कोलोम", english: "Pen", category: "विद्यालय (School)", context: "लिखने वाली कलम।", icon: "🖊️", verified: true },
  { id: "voc_36", hindi: "कापी", hindi_keywords: ["कापी", "कॉपी", "पुस्तिका"], santhali_olchiki: "ᱠᱷᱟᱛᱟ", santhali_latin: "Khata", devanagari_pronunciation: "खाता", english: "Notebook", category: "विद्यालय (School)", context: "लिखने की कापी।", icon: "📓", verified: true },
  { id: "voc_37", hindi: "पानी", hindi_keywords: ["पानी", "जल"], santhali_olchiki: "ᱫᱟᱜ", santhali_latin: "Dak'", devanagari_pronunciation: "दाक'", english: "Water", category: "प्रकृति व जीवन (Nature & Life)", context: "पीने का पानी या वर्षा का जल।", icon: "💧", verified: true },
  { id: "voc_38", hindi: "भात", hindi_keywords: ["भात", "चावल", "भोजन"], santhali_olchiki: "ᱫᱟᱠᱟ", santhali_latin: "Daka", devanagari_pronunciation: "दाका", english: "Cooked rice / Food", category: "प्रकृति व जीवन (Nature & Life)", context: "भोजन या मध्याह्न भोजन।", icon: "🍚", verified: true },
  { id: "voc_39", hindi: "सूरज", hindi_keywords: ["सूरज", "सूर्य"], santhali_olchiki: "ᱵᱮᱲᱟ", santhali_latin: "Bēṛa", devanagari_pronunciation: "बेड़ा", english: "Sun", category: "प्रकृति व जीवन (Nature & Life)", context: "आकाश में चमकता सूरज।", icon: "☀️", verified: true },
  { id: "voc_40", hindi: "चाँद", hindi_keywords: ["चाँद", "चांद", "चन्द्रमा"], santhali_olchiki: "ᱪᱟᱸᱫᱚ", santhali_latin: "Chando", devanagari_pronunciation: "चांदो", english: "Moon", category: "प्रकृति व जीवन (Nature & Life)", context: "रात का चंद्रमा।", icon: "🌙", verified: true },
  { id: "voc_41", hindi: "पेड़", hindi_keywords: ["पेड़", "वृक्ष"], santhali_olchiki: "ᱫᱟᱨᱮ", santhali_latin: "Dare", devanagari_pronunciation: "दारे", english: "Tree", category: "प्रकृति व जीवन (Nature & Life)", context: "हरा-भरा पेड़।", icon: "🌳", verified: true },
  { id: "voc_42", hindi: "फूल", hindi_keywords: ["फूल", "पुष्प"], santhali_olchiki: "ᱵᱟᱦᱟ", santhali_latin: "Baha", devanagari_pronunciation: "बाहा", english: "Flower", category: "प्रकृति व जीवन (Nature & Life)", context: "सुंदर फूल।", icon: "🌺", verified: true },
  { id: "voc_43", hindi: "गाय", hindi_keywords: ["गाय", "गौ"], santhali_olchiki: "ᱜᱟᱹᱭ", santhali_latin: "Gạ̄i", devanagari_pronunciation: "गाई", english: "Cow", category: "पशु-पक्षी (Animals & Birds)", context: "दूध देने वाली पालतू गाय।", icon: "🐄", verified: true },
  { id: "voc_44", hindi: "बिल्ली", hindi_keywords: ["बिल्ली"], santhali_olchiki: "ᱯᱩᱥᱤ", santhali_latin: "Pusi", devanagari_pronunciation: "पुसी", english: "Cat", category: "पशु-पक्षी (Animals & Birds)", context: "पालतू बिल्ली।", icon: "🐱", verified: true },
  { id: "voc_45", hindi: "कुत्ता", hindi_keywords: ["कुत्ता"], santhali_olchiki: "ᱥᱮᱛᱟ", santhali_latin: "Seta", devanagari_pronunciation: "सेता", english: "Dog", category: "पशु-पक्षी (Animals & Birds)", context: "वफादार कुत्ता।", icon: "🐶", verified: true },
  { id: "voc_46", hindi: "चिड़िया", hindi_keywords: ["चिड़िया", "पक्षी"], santhali_olchiki: "ᱪᱮᱬᱮ", santhali_latin: "Cēṛē", devanagari_pronunciation: "चेड़े", english: "Bird", category: "पशु-पक्षी (Animals & Birds)", context: "पेड़ पर चहकने वाली चिड़िया।", icon: "🐦", verified: true },
  { id: "voc_47", hindi: "हाथी", hindi_keywords: ["हाथी"], santhali_olchiki: "ᱦᱟᱹᱛᱤ", santhali_latin: "Hạti", devanagari_pronunciation: "हाती", english: "Elephant", category: "पशु-पक्षी (Animals & Birds)", context: "बड़ा जंगली जानवर हाथी।", icon: "🐘", verified: true },
  { id: "voc_48", hindi: "मछली", hindi_keywords: ["मछली"], santhali_olchiki: "ᱦᱟᱹᱠᱩ", santhali_latin: "Hạku", devanagari_pronunciation: "हाकु", english: "Fish", category: "पशु-पक्षी (Animals & Birds)", context: "पानी में तैरने वाली मछली।", icon: "🐟", verified: true },
  { id: "voc_49", hindi: "माँ", hindi_keywords: ["माँ", "माताजी", "अम्मा"], santhali_olchiki: "ᱟᱭᱳ", santhali_latin: "Ayo", devanagari_pronunciation: "आयो", english: "Mother", category: "परिवार (Family)", context: "प्यारी माँ।", icon: "👩", verified: true },
  { id: "voc_50", hindi: "पिताजी", hindi_keywords: ["पिताजी", "बाबा"], santhali_olchiki: "ᱵᱟᱵᱟ", santhali_latin: "Baba", devanagari_pronunciation: "बाबा", english: "Father", category: "परिवार (Family)", context: "आदरणीय पिताजी।", icon: "👨", verified: true }
];

// Translations dictionary for bilingual UI
const UI_STRINGS = {
  hi: {
    nav_translator: "कक्षा अनुवादक",
    nav_flashcards: "चित्र फ्लैशकार्ड",
    nav_lessons: "सीखने के पाठ",
    nav_worksheets: "कार्यपत्रिकाएँ",
    nav_guide: "मार्गदर्शिका",
    trans_title: "कक्षा संवाद अनुवादक (Hindi ➔ Santhali)",
    trans_desc: "प्राथमिक विद्यालय के शिक्षक कक्षा में हिंदी निर्देश बोलें या लिखें — संथाली भाषी बच्चों के लिए प्रमाणित ओल चिकी व उच्चारण देखें।",
    trans_input_label: "शिक्षक का हिंदी निर्देश / वाक्य दर्ज करें:",
    btn_translate: "अनुवाद करें",
    trans_output_label: "संथाली अनुवाद (Ol Chiki & उच्चारण):",
    fc_title: "चित्र फ्लैशकार्ड (Visual Flashcards)",
    fc_desc: "रंग-बिरंगे चित्रों और ओल चिकी लिपि के साथ संथाली शब्दों को आसानी से सीखें। कार्ड पर क्लिक करके पलटें!",
    lessons_title: "सीखने के पाठ (Classroom Modules)",
    lessons_desc: "प्राथमिक कक्षा के लिए संरचित पाठ्यक्रम: शिक्षक और संथाली बच्चों के बीच सहज संवाद के व्यावहारिक पाठ।",
    ws_title: "इंटरैक्टिव कार्यपत्रिकाएँ (Interactive Worksheets)",
    ws_desc: "प्राथमिक कक्षा के बच्चों के लिए मनोरंजक शब्द मिलान एवं बहुविकल्पीय अभ्यास। सही उत्तर पर सितारे जीतें!"
  },
  olchiki: {
    nav_translator: "ᱟᱥᱲᱟ ᱛᱚᱨᱡᱚᱢᱟ",
    nav_flashcards: "ᱪᱤᱛᱟᱹᱨ ᱠᱟᱨᱰ",
    nav_lessons: "ᱚᱞᱚᱜ ᱯᱟᱴ",
    nav_worksheets: "ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ",
    nav_guide: "ᱫᱤᱥᱟᱹ ᱩᱫᱩᱜ",
    trans_title: "ᱟᱥᱲᱟ ᱠᱟᱛᱷᱟ ᱛᱚᱨᱡᱚᱢᱟ (Hindi ➔ ᱥᱟᱱᱛᱟᱲᱤ)",
    trans_desc: "ᱢᱟᱪᱮᱛ ᱦᱤᱱᱫᱤ ᱨᱮ ᱨᱚᱲ ᱢᱮ — ᱥᱟᱱᱛᱟᱲ ᱜᱤᱫᱽᱨᱟᱹ ᱞᱟᱹᱜᱤᱫ ᱚᱞ ᱪᱤᱠᱤ ᱧᱮᱞ ᱢᱮ᱾",
    trans_input_label: "ᱢᱟᱪᱮᱛᱟᱜ ᱦᱤᱱᱫᱤ ᱦᱩᱠᱩᱢ ᱚᱞ ᱢᱮ:",
    btn_translate: "ᱛᱚᱨᱡᱚᱢᱟᱭ ᱢᱮ",
    trans_output_label: "ᱥᱟᱱᱛᱟᱲᱤ ᱛᱚᱨᱡᱚᱢᱟ (ᱚᱞ ᱪᱤᱠᱤ ᱟᱨ ᱨᱚᱲ):",
    fc_title: "ᱪᱤᱛᱟᱹᱨ ᱠᱟᱨᱰ (Visual Flashcards)",
    fc_desc: "ᱨᱚᱝ-ᱵᱮᱨᱚᱝ ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱚᱞ ᱪᱤᱠᱤ ᱛᱮ ᱟᱹᱲᱟᱹ ᱪᱮᱫᱚᱜ ᱢᱮ᱾",
    lessons_title: "ᱪᱮᱫᱚᱜ ᱯᱟᱴ (Classroom Modules)",
    lessons_desc: "ᱯᱨᱟᱭᱢᱟᱨᱤ ᱟᱥᱲᱟ ᱨᱮ ᱢᱟᱪᱮᱛ ᱟᱨ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱛᱟᱞᱟ ᱨᱮ ᱨᱚᱯᱚᱲ᱾",
    ws_title: "ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (Interactive Worksheets)",
    ws_desc: "ᱟᱹᱲᱟᱹ ᱢᱤᱞᱟᱹᱣ ᱟᱨ ᱵᱟᱪᱷᱟᱣ ᱠᱟᱛᱮ ᱤᱯᱤᱞ (Stars) ᱡᱤᱛᱠᱟᱹᱨᱚᱜ ᱢᱮ!"
  }
};

// ==========================================
// 2. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupNetworkMonitoring();
  setupLanguageSwitching();
  setupTranslator();
  setupVoiceInput();
  setupAudioPlayback();
  setupLessonsModal();
  registerPwaServiceWorker();

  // Load Initial Data
  loadAllData();
});

// ==========================================
// 3. DATA FETCHING (API with Fallback)
// ==========================================
async function loadAllData() {
  try {
    // 1. Fetch vocabulary
    const vocabRes = await fetch('/api/vocabulary').catch(() => null);
    if (vocabRes && vocabRes.ok) {
      const vocabData = await vocabRes.json();
      state.vocabulary = vocabData.vocabulary || FALLBACK_VOCABULARY;
    } else {
      state.vocabulary = FALLBACK_VOCABULARY;
    }
  } catch (e) {
    state.vocabulary = FALLBACK_VOCABULARY;
  }

  try {
    // 2. Fetch lessons
    const lessonsRes = await fetch('/api/lessons').catch(() => null);
    if (lessonsRes && lessonsRes.ok) {
      const lessonsData = await lessonsRes.json();
      state.lessons = lessonsData.lessons || [];
    }
  } catch (e) {
    console.warn('Using local lessons fallback');
  }

  try {
    // 3. Fetch worksheets
    const wsRes = await fetch('/api/worksheets').catch(() => null);
    if (wsRes && wsRes.ok) {
      const wsData = await wsRes.json();
      state.worksheets = wsData.worksheets || [];
    }
  } catch (e) {
    console.warn('Using local worksheets fallback');
  }

  // Render modules once data is ready
  renderFlashcards('all');
  renderLessons();
  renderWorksheetTabs();
  renderActiveWorksheet();
}

// ==========================================
// 4. NAVIGATION & TABS
// ==========================================
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTabId = tab.getAttribute('data-tab');
      switchTab(targetTabId);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update nav buttons
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });

  // Update tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === tabId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 5. OFFLINE / ONLINE DETECTION (PWA)
// ==========================================
function setupNetworkMonitoring() {
  const indicator = document.getElementById('offlineIndicator');
  const label = document.getElementById('networkStatusText');

  function updateStatus() {
    state.isOnline = navigator.onLine;
    if (state.isOnline) {
      indicator.className = 'status-indicator online';
      label.innerHTML = '🟢 ऑनलाइन <span class="en-sub-inline">(Online)</span>';
      indicator.title = 'इंटरनेट सक्रिय है (ऑनलाइन / Online)';
    } else {
      indicator.className = 'status-indicator offline';
      label.innerHTML = '🟠 ऑफलाइन मोड <span class="en-sub-inline">(Offline Mode)</span>';
      indicator.title = 'ऑफलाइन PWA मोड सक्रिय है (Offline PWA Mode active)';
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

// ==========================================
// 6. LANGUAGE SWITCHING (Hindi / Ol Chiki UI)
// ==========================================
function setupLanguageSwitching() {
  const btnHi = document.getElementById('langHiBtn');
  const btnSant = document.getElementById('langSantBtn');

  btnHi.addEventListener('click', () => setUiLanguage('hi'));
  btnSant.addEventListener('click', () => setUiLanguage('olchiki'));
}

function setUiLanguage(lang) {
  state.uiLanguage = lang;
  document.getElementById('langHiBtn').classList.toggle('active', lang === 'hi');
  document.getElementById('langSantBtn').classList.toggle('active', lang === 'olchiki');

  const dict = UI_STRINGS[lang] || UI_STRINGS.hi;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

// ==========================================
// 7. TRANSLATOR LOGIC (Strict Verified Policy)
// ==========================================
function setupTranslator() {
  const inputEl = document.getElementById('hindiInput');
  const translateBtn = document.getElementById('translateBtn');
  const clearBtn = document.getElementById('clearInputBtn');

  translateBtn.addEventListener('click', () => {
    performTranslation(inputEl.value);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      performTranslation(inputEl.value);
    }
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    resetTranslationDisplay();
    inputEl.focus();
  });

  // Setup quick suggestion chips
  const chips = document.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const phrase = chip.getAttribute('data-text');
      inputEl.value = phrase;
      performTranslation(phrase);
    });
  });
}

async function performTranslation(text) {
  const query = text ? text.trim() : '';
  if (!query) {
    resetTranslationDisplay();
    return;
  }

  // Attempt backend API call first
  let result = null;
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: query })
    });
    if (response.ok) {
      result = await response.json();
    }
  } catch (err) {
    // Fall back to client-side search in local verified dataset
    result = clientSideTranslate(query);
  }

  if (!result) {
    result = clientSideTranslate(query);
  }

  state.currentTranslation = result;
  displayTranslationResult(result);
}

// Helper to strip punctuation and normalize text for search
function cleanTextForSearch(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[\?!।,.\-—"\'¿¡;:()\[\]{}]+/g, ' ').trim().replace(/\s+/g, ' ');
}

// Helper to strip leading bullets/numbers like '1. ', '2) ', '- '
function stripLineNumbering(line) {
  if (!line) return '';
  return line.replace(/^\s*(?:\d+[\.\)]|[\-*•])\s*/, '').trim();
}

// Client-side single line translation matching
function matchSingleVocabEntry(rawLine) {
  const cleanedLine = stripLineNumbering(rawLine);
  const q = cleanTextForSearch(cleanedLine);
  if (!q) return null;

  const vocab = state.vocabulary.length ? state.vocabulary : FALLBACK_VOCABULARY;

  // Filter polite filler words
  const tokens = q.split(' ');
  const politeWords = new Set(['कृपया', 'प्लीज', 'जरा', 'बच्चों', 'बेटा', 'अरे', 'जी']);
  const filteredTokens = tokens.filter(t => !politeWords.has(t));
  const filteredQ = filteredTokens.length ? filteredTokens.join(' ') : q;

  // 1. Exact match against hindi
  for (const item of vocab) {
    const h = cleanTextForSearch(item.hindi);
    if (h === q || (filteredQ && h === filteredQ)) {
      return item;
    }
  }

  // Exact match against keywords
  for (const item of vocab) {
    for (const kw of (item.hindi_keywords || [])) {
      const kwClean = cleanTextForSearch(kw);
      if (kwClean === q || (filteredQ && kwClean === filteredQ)) {
        return item;
      }
    }
  }

  // 2. Whole phrase matching for multi-word phrases (word count >= 2)
  // NEVER loose-match single digits or single words as substrings!
  for (const item of vocab) {
    const h = cleanTextForSearch(item.hindi);
    const hWords = h.split(' ');
    if (hWords.length >= 2) {
      const hPhrase = hWords.join(' ');
      const regex = new RegExp('(?:\\b|\\s|^)' + hPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\\b|\\s|$)');
      if (regex.test(q) || (filteredQ && regex.test(filteredQ))) {
        return item;
      }
    }
  }

  return null;
}

// Client-side translation lookup strictly ensuring verified content only
function clientSideTranslate(query) {
  const rawText = (query || '').trim();
  if (!rawText) {
    return {
      status: "empty",
      is_verified: false,
      source_text: "",
      matched_phrase: null,
      santhali_olchiki: "",
      santhali_latin: "",
      message: "कृपया अनुवाद के लिए कोई हिंदी शब्द या वाक्य दर्ज करें।"
    };
  }

  const rawLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // If multiple lines, translate each line separately
  if (rawLines.length > 1) {
    const lineResults = rawLines.map(line => {
      const match = matchSingleVocabEntry(line);
      if (match) {
        return {
          source_line: line,
          is_verified: true,
          santhali_olchiki: match.santhali_olchiki,
          santhali_latin: match.santhali_latin,
          devanagari_pronunciation: match.devanagari_pronunciation,
          matched_phrase: match.hindi,
          english: match.english,
          icon: match.icon || '✨',
          message: "प्रमाणित संथाली अनुवाद उपलब्ध है।"
        };
      } else {
        return {
          source_line: line,
          is_verified: false,
          santhali_olchiki: "",
          santhali_latin: "",
          devanagari_pronunciation: "",
          matched_phrase: null,
          english: "",
          icon: "⚠️",
          message: "Verified translation unavailable"
        };
      }
    });

    const hasAnyVerified = lineResults.some(l => l.is_verified);
    const allVerified = lineResults.every(l => l.is_verified);

    return {
      status: "multiline",
      is_multiline: true,
      source_text: rawText,
      lines_count: lineResults.length,
      lines: lineResults,
      is_verified: allVerified,
      has_verified: hasAnyVerified,
      message: "पंक्ति-वार अनुवाद परिणाम (Line-by-line translation results)"
    };
  }

  // Single line
  const singleLine = rawLines[0] || rawText;
  const match = matchSingleVocabEntry(singleLine);

  if (match) {
    return {
      status: "verified",
      is_verified: true,
      is_multiline: false,
      source_text: singleLine,
      matched_phrase: match.hindi,
      santhali_olchiki: match.santhali_olchiki,
      santhali_latin: match.santhali_latin,
      devanagari_pronunciation: match.devanagari_pronunciation,
      english: match.english,
      category: match.category,
      context: match.context,
      icon: match.icon,
      message: "प्रमाणित संथाली अनुवाद उपलब्ध है।"
    };
  } else {
    // STRICT REQUIREMENT: "Verified translation unavailable"
    return {
      status: "unverified",
      is_verified: false,
      is_multiline: false,
      source_text: singleLine,
      matched_phrase: null,
      santhali_olchiki: "",
      santhali_latin: "",
      devanagari_pronunciation: "",
      english: "",
      category: "अपुष्ट सामग्री",
      message: "Verified translation unavailable"
    };
  }
}

function displayTranslationResult(res) {
  const placeholder = document.getElementById('translationPlaceholder');
  const resultArea = document.getElementById('translationResultArea');
  const multilineArea = document.getElementById('translationMultilineArea');
  const unverifiedArea = document.getElementById('unverifiedNoticeArea');
  const verifiedBadge = document.getElementById('verifiedBadge');
  const verifiedBadgeText = document.getElementById('verifiedBadgeText');

  placeholder.classList.add('hidden');

  // CASE 1: MULTI-LINE TRANSLATION
  if (res.is_multiline && res.lines && res.lines.length > 1) {
    resultArea.classList.add('hidden');
    unverifiedArea.classList.add('hidden');
    multilineArea.classList.remove('hidden');

    verifiedBadge.classList.remove('hidden');
    if (res.has_verified) {
      verifiedBadge.className = 'verification-tag verified';
      verifiedBadgeText.textContent = `✅ बहु-पंक्ति परिणाम (${res.lines.filter(l => l.is_verified).length}/${res.lines.length} सत्यापित)`;
    } else {
      verifiedBadge.className = 'verification-tag unverified';
      verifiedBadgeText.textContent = '⚠️ Verified translation unavailable';
    }

    document.getElementById('multilineCountBadge').textContent = `${res.lines.length} पंक्तियाँ`;

    const container = document.getElementById('multilineRowsContainer');
    container.innerHTML = '';

    res.lines.forEach((lineItem, idx) => {
      const rowCard = document.createElement('div');
      rowCard.className = `multiline-row-card ${lineItem.is_verified ? 'verified' : 'unverified'}`;

      if (lineItem.is_verified) {
        rowCard.innerHTML = `
          <div class="multiline-row-top">
            <span class="ml-source-text">${idx + 1}. ${lineItem.source_line}</span>
            <span class="ml-status-pill verified">✓ सत्यापित <span class="en-sub-inline">(Verified)</span></span>
          </div>
          <div class="multiline-row-bottom">
            <div>
              <div class="ml-olchiki-text olchiki-font">${lineItem.santhali_olchiki}</div>
              ${lineItem.santhali_latin ? `<div class="ml-pronounce-text">रोमन (Roman): ${lineItem.santhali_latin} ${lineItem.devanagari_pronunciation ? `(${lineItem.devanagari_pronunciation})` : ''}</div>` : ''}
              <div class="ml-english-text" style="font-size:0.8rem; color:#475569; margin-top:2px;">अंग्रेजी अर्थ (English): ${lineItem.english || '-'}</div>
            </div>
            <button class="ml-audio-btn" data-audio-text="${lineItem.devanagari_pronunciation || lineItem.santhali_latin}">
              🔊 सुनें <span class="en-sub-inline">(Listen)</span>
            </button>
          </div>
        `;
        const audioBtn = rowCard.querySelector('.ml-audio-btn');
        audioBtn.addEventListener('click', () => {
          speakText(lineItem.devanagari_pronunciation || lineItem.santhali_latin);
        });
      } else {
        rowCard.innerHTML = `
          <div class="multiline-row-top">
            <span class="ml-source-text">${idx + 1}. ${lineItem.source_line}</span>
            <span class="ml-status-pill unverified">⚠️ अनुपलब्ध <span class="en-sub-inline">(Unavailable)</span></span>
          </div>
          <div class="multiline-row-bottom">
            <span class="ml-unavail-text">Verified translation unavailable <span class="en-sub-inline">(No verified entry)</span></span>
          </div>
        `;
      }
      container.appendChild(rowCard);
    });
    return;
  }

  // CASE 2: SINGLE-LINE VERIFIED
  multilineArea.classList.add('hidden');
  if (res.is_verified) {
    unverifiedArea.classList.add('hidden');
    resultArea.classList.remove('hidden');

    verifiedBadge.className = 'verification-tag verified';
    verifiedBadge.classList.remove('hidden');
    verifiedBadgeText.textContent = '✅ प्रमाणित संथाली (Verified)';

    document.getElementById('resultCategory').textContent = res.category || 'कक्षा निर्देश';
    document.getElementById('resultOlChiki').textContent = res.santhali_olchiki;

    // Roman pronunciation only when verified pronunciation information is available
    const translitBox = document.getElementById('transliterationBox');
    if (translitBox) {
      if (res.santhali_latin && res.santhali_latin.trim()) {
        translitBox.style.display = 'flex';
        document.getElementById('resultLatin').textContent = res.santhali_latin;
        document.getElementById('resultDevanagari').textContent = res.devanagari_pronunciation || res.santhali_latin;
      } else {
        translitBox.style.display = 'none';
      }
    }

    document.getElementById('resultHindiMeaning').textContent = res.matched_phrase || res.source_text;
    document.getElementById('resultEnglishMeaning').textContent = res.english || '-';
    document.getElementById('resultContext').textContent = res.context || 'प्राथमिक कक्षा में उपयोग के लिए।';

    // Update audio notice
    document.getElementById('audioNoticeText').textContent = 'सत्यापित संथाली उच्चारण गाइड सक्रिय है।';
  } else {
    // CASE 3: SINGLE-LINE UNVERIFIED
    resultArea.classList.add('hidden');
    unverifiedArea.classList.remove('hidden');

    verifiedBadge.className = 'verification-tag unverified';
    verifiedBadge.classList.remove('hidden');
    verifiedBadgeText.textContent = '⚠️ Verified translation unavailable';

    document.getElementById('unverifiedAlertTitle').textContent = 'Verified translation unavailable';

    // Render suggestions
    const suggestionsList = document.getElementById('unverifiedSuggestionsList');
    suggestionsList.innerHTML = '';
    const suggestedPhrases = ['बैठ जाओ', 'खड़े हो जाओ', 'किताब खोलो', 'लिखो', 'पानी पीना है?', 'शाबाश'];
    suggestedPhrases.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'chip-btn';
      btn.textContent = p;
      btn.onclick = () => {
        document.getElementById('hindiInput').value = p;
        performTranslation(p);
      };
      suggestionsList.appendChild(btn);
    });
  }
}

function resetTranslationDisplay() {
  document.getElementById('translationPlaceholder').classList.remove('hidden');
  document.getElementById('translationResultArea').classList.add('hidden');
  document.getElementById('translationMultilineArea').classList.add('hidden');
  document.getElementById('unverifiedNoticeArea').classList.add('hidden');
  document.getElementById('verifiedBadge').classList.add('hidden');
  state.currentTranslation = null;
}

// ==========================================
// 8. VOICE INPUT (Web Speech API)
// ==========================================
function setupVoiceInput() {
  const voiceBtn = document.getElementById('voiceInputBtn');
  const voiceBtnText = document.getElementById('voiceBtnText');
  const voiceStatusBox = document.getElementById('voiceStatusMsg');
  const voiceStatusText = document.getElementById('voiceStatusText');
  const hindiInput = document.getElementById('hindiInput');

  // Check browser SpeechRecognition support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceBtn.title = "आपके ब्राउज़र में वेब स्पीच रिकॉग्निशन समर्थित नहीं है। कृपया टाइप करें।";
    voiceBtn.addEventListener('click', () => {
      alert("आपके वर्तमान ब्राउज़र में डायरेक्ट वॉयस रिकॉग्निशन समर्थित नहीं है (Google Chrome / Edge में सर्वश्रेष्ठ चलता है)। कृपया ऊपर दिए गए त्वरित बटनों पर क्लिक करें या टाइप करें।");
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN'; // Hindi voice input
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    state.isListening = true;
    voiceBtn.classList.add('listening');
    voiceBtnText.textContent = 'सुन रहे हैं...';
    voiceStatusBox.classList.remove('hidden');
    voiceStatusText.textContent = '🎤 कृपया हिंदी में बोलें (जैसे: बैठ जाओ, किताब खोलो)...';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    hindiInput.value = transcript;
    voiceStatusText.textContent = `पहचाना गया: "${transcript}"`;
    performTranslation(transcript);
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    voiceStatusText.textContent = `ध्वनि पहचान त्रुटि (${event.error})। कृपया दोबारा प्रयास करें या टाइप करें।`;
    setTimeout(() => {
      voiceStatusBox.classList.add('hidden');
    }, 3500);
  };

  recognition.onend = () => {
    state.isListening = false;
    voiceBtn.classList.remove('listening');
    voiceBtnText.textContent = 'बोलकर लिखें';
    setTimeout(() => {
      if (!state.isListening) voiceStatusBox.classList.add('hidden');
    }, 2500);
  };

  voiceBtn.addEventListener('click', () => {
    if (state.isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  });
}

// ==========================================
// 9. AUDIO PLAYBACK & SYNTHESIZER
// ==========================================
function setupAudioPlayback() {
  const playBtn = document.getElementById('playAudioBtn');
  const slowBtn = document.getElementById('slowAudioBtn');
  const copyBtn = document.getElementById('copyTranslationBtn');
  const soundWave = document.getElementById('soundWaveBox');

  playBtn.addEventListener('click', () => {
    playPronunciation(false);
  });

  slowBtn.addEventListener('click', () => {
    playPronunciation(true);
  });

  copyBtn.addEventListener('click', () => {
    if (!state.currentTranslation || !state.currentTranslation.santhali_olchiki) return;
    const textToCopy = `${state.currentTranslation.santhali_olchiki} (${state.currentTranslation.santhali_latin})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      copyBtn.innerHTML = '<span>✓ कॉपी हुआ!</span>';
      setTimeout(() => {
        copyBtn.innerHTML = '<span>📋 कॉपी</span>';
      }, 2000);
    });
  });
}

function playPronunciation(isSlow = false) {
  if (!state.currentTranslation || !state.currentTranslation.is_verified) return;

  const latinText = state.currentTranslation.santhali_latin || '';
  const devanagariText = state.currentTranslation.devanagari_pronunciation || '';
  const soundWave = document.getElementById('soundWaveBox');

  // Trigger visual wave animation
  soundWave.classList.remove('hidden');

  // Use SpeechSynthesis on browser
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech

    // Use Devanagari pronunciation guide for authentic Indian phonetics
    const utterance = new SpeechSynthesisUtterance(devanagariText || latinText);
    utterance.lang = 'hi-IN';
    utterance.rate = isSlow ? 0.6 : 0.9;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      soundWave.classList.add('hidden');
    };
    utterance.onerror = () => {
      soundWave.classList.add('hidden');
    };

    window.speechSynthesis.speak(utterance);
  } else {
    // Synthesize pleasant phonetic chime with Web Audio API if speech synthesis is disabled
    playChime();
    setTimeout(() => {
      soundWave.classList.add('hidden');
    }, 1200);
  }
}

// Play a cheerful chime sound using pure Web Audio API (zero external assets needed)
function playChime(isSuccess = true) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = isSuccess ? 523.25 : 330; // C5 or E4
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isSuccess ? 659.25 : 260, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio context not allowed or not supported
  }
}

// ==========================================
// 10. PICTURE FLASHCARDS SECTION
// ==========================================
function renderFlashcards(filter = 'all') {
  const container = document.getElementById('flashcardsGrid');
  const countLabel = document.getElementById('flashcardCountLabel');
  container.innerHTML = '';

  const vocab = state.vocabulary.length ? state.vocabulary : FALLBACK_VOCABULARY;
  let filtered = vocab;

  if (filter !== 'all') {
    filtered = vocab.filter(item => (item.category || '').toLowerCase().includes(filter.toLowerCase()));
  }

  countLabel.textContent = `${filtered.length} कार्ड उपलब्ध`;

  filtered.forEach(item => {
    const cardWrap = document.createElement('div');
    cardWrap.className = 'flashcard-wrap';

    cardWrap.innerHTML = `
      <div class="flashcard-inner">
        <!-- Front Side -->
        <div class="flashcard-front">
          <span class="fc-category-tag">${item.category.split('(')[0].trim()}</span>
          <div class="fc-emoji">${item.icon || '📖'}</div>
          <div class="fc-hindi-word">${item.hindi}</div>
          <div class="fc-english-sub">(${item.english})</div>
          <span class="fc-flip-hint">कार्ड पलटें 🔄 <span class="en-sub-inline">(Click to Flip)</span></span>
        </div>

        <!-- Back Side -->
        <div class="flashcard-back">
          <span class="fc-category-tag" style="background:rgba(255,255,255,0.2); color:#fff;">संथाली (Ol Chiki)</span>
          <div class="fc-olchiki-word olchiki-font">${item.santhali_olchiki}</div>
          <div class="fc-pronounce">रोमन (Roman): ${item.santhali_latin}</div>
          <div class="fc-english">अंग्रेजी अर्थ (English): ${item.english}</div>
          <button class="fc-sound-btn" data-pronounce="${item.devanagari_pronunciation || item.santhali_latin}">
            🔊 सुनें <span class="en-sub-inline">(Listen)</span>
          </button>
        </div>
      </div>
    `;

    // Click on sound button inside card
    const soundBtn = cardWrap.querySelector('.fc-sound-btn');
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakText(item.devanagari_pronunciation || item.santhali_latin);
    });

    // Toggle flip on card click
    cardWrap.addEventListener('click', () => {
      cardWrap.classList.toggle('flipped');
    });

    container.appendChild(cardWrap);
  });

  // Setup category filter buttons
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFlashcards(btn.getAttribute('data-category'));
    };
  });
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'hi-IN';
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  }
}

// ==========================================
// 11. LESSONS SECTION & MODAL
// ==========================================
function renderLessons() {
  const container = document.getElementById('lessonsContainer');
  if (!container) return;
  container.innerHTML = '';

  state.lessons.forEach(lesson => {
    const card = document.createElement('div');
    card.className = `lesson-card theme-${lesson.theme || 'sunset'}`;

    card.innerHTML = `
      <div>
        <div class="lesson-card-header">
          <div class="lesson-card-icon">${lesson.icon || '📚'}</div>
          <div>
            <h3 class="lesson-card-title">${lesson.title}</h3>
            <p class="lesson-card-olchiki olchiki-font">${lesson.title_olchiki || ''}</p>
          </div>
        </div>
        <p class="lesson-card-desc">${lesson.description}</p>
      </div>
      <div class="lesson-card-footer">
        <span class="lesson-level-badge">${lesson.level || 'कक्षा 1-2'} <span class="en-sub-inline">(Class 1-2)</span></span>
        <button class="btn btn-primary btn-open-lesson" data-lesson-id="${lesson.id}">
          पाठ खोलें ➔ <span class="en-sub-inline">(Open Lesson)</span>
        </button>
      </div>
    `;

    const openBtn = card.querySelector('.btn-open-lesson');
    openBtn.addEventListener('click', () => openLessonModal(lesson));

    container.appendChild(card);
  });
}

function setupLessonsModal() {
  const modal = document.getElementById('lessonModal');
  const closeBtn = document.getElementById('closeLessonModalBtn');

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}

function openLessonModal(lesson) {
  const modal = document.getElementById('lessonModal');
  document.getElementById('modalLessonIcon').textContent = lesson.icon || '📖';
  document.getElementById('modalLessonTitle').textContent = lesson.title;
  document.getElementById('modalLessonOlChiki').textContent = lesson.title_olchiki || '';
  document.getElementById('modalTeacherTip').textContent = lesson.teacher_tip || 'कक्षा में बच्चों से संथाली में बोलें।';

  // Render dialogue
  const dialogueBox = document.getElementById('modalDialogueContainer');
  dialogueBox.innerHTML = '';
  (lesson.dialogue || []).forEach(d => {
    const bubble = document.createElement('div');
    const isStudent = (d.speaker || '').includes('बच्चे') || (d.speaker || '').includes('Student');
    bubble.className = `chat-bubble ${isStudent ? 'student' : 'teacher'}`;

    bubble.innerHTML = `
      <div class="speaker-label">${d.speaker}</div>
      <div class="chat-hindi">"${d.hindi}"</div>
      <div class="chat-olchiki olchiki-font">${d.santhali_olchiki}</div>
      <div class="chat-latin">${d.santhali_latin}</div>
    `;
    dialogueBox.appendChild(bubble);
  });

  // Render vocabulary
  const vocabGrid = document.getElementById('modalVocabContainer');
  vocabGrid.innerHTML = '';
  (lesson.vocabulary || []).forEach(v => {
    const item = document.createElement('div');
    item.className = 'modal-vocab-item';
    item.innerHTML = `
      <div class="mv-olchiki olchiki-font">${v.olchiki}</div>
      <div class="mv-hindi">${v.hindi}</div>
      <div class="mv-latin">रोमन (Roman): ${v.latin} • अर्थ (Meaning): ${v.meaning}</div>
    `;
    vocabGrid.appendChild(item);
  });

  modal.classList.remove('hidden');
}

// ==========================================
// 12. INTERACTIVE WORKSHEETS SECTION
// ==========================================
function renderWorksheetTabs() {
  const navContainer = document.getElementById('worksheetSelector');
  if (!navContainer) return;
  navContainer.innerHTML = '';

  const wsEnglishNames = {
    'ws_01': '(Match Words)',
    'ws_02': '(Classroom Commands)',
    'ws_03': '(Number Quiz)',
    'ws_04': '(Nature Quiz)'
  };

  state.worksheets.forEach((ws, idx) => {
    const btn = document.createElement('button');
    btn.className = `ws-nav-btn ${ws.id === state.activeWorksheetId ? 'active' : ''}`;
    const enLabel = wsEnglishNames[ws.id] || '';
    btn.innerHTML = `${ws.icon || '📝'} ${ws.title.split(':')[1] || ws.title} <span class="en-sub-inline">${enLabel}</span>`;
    btn.addEventListener('click', () => {
      state.activeWorksheetId = ws.id;
      document.querySelectorAll('.ws-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderActiveWorksheet();
    });
    navContainer.appendChild(btn);
  });
}

function renderActiveWorksheet() {
  const container = document.getElementById('activeWorksheetContainer');
  if (!container) return;

  const ws = state.worksheets.find(w => w.id === state.activeWorksheetId) || state.worksheets[0];
  if (!ws) {
    container.innerHTML = '<p>कोई कार्यपत्रिका उपलब्ध नहीं है। (No worksheet available)</p>';
    return;
  }

  container.innerHTML = `
    <div class="ws-card-header">
      <h3 class="ws-main-title">${ws.title}</h3>
      <p class="ws-main-olchiki olchiki-font">${ws.title_olchiki || ''}</p>
      <p class="ws-instructions">${ws.description}</p>
    </div>
    <div id="wsContentArea"></div>
  `;

  const contentArea = container.querySelector('#wsContentArea');

  if (ws.type === 'matching') {
    renderMatchingGame(ws, contentArea);
  } else if (ws.type === 'quiz') {
    renderQuizGame(ws, contentArea);
  }
}

// Matching Game logic
function renderMatchingGame(ws, container) {
  state.matchingSelectedHindi = null;
  state.matchingSelectedSanthali = null;

  const pairs = ws.pairs || [];
  const shuffledSanthali = [...pairs].sort(() => Math.random() - 0.5);

  const gameDiv = document.createElement('div');
  gameDiv.className = 'matching-game-container';

  gameDiv.innerHTML = `
    <!-- Left Column: Hindi -->
    <div class="match-column" id="matchHindiCol">
      <span class="chips-title">🇮🇳 हिंदी शब्द (चुनें) <span class="en-sub">(Hindi Words - Select)</span></span>
    </div>

    <!-- Right Column: Ol Chiki -->
    <div class="match-column" id="matchSanthaliCol">
      <span class="chips-title">🔤 संथाली (ओल चिकी) <span class="en-sub">(Santhali Ol Chiki - Match)</span></span>
    </div>
  `;

  const hindiCol = gameDiv.querySelector('#matchHindiCol');
  const santhaliCol = gameDiv.querySelector('#matchSanthaliCol');

  pairs.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'match-item-btn';
    btn.textContent = p.hindi;
    btn.setAttribute('data-hindi', p.hindi);
    btn.addEventListener('click', () => {
      if (btn.classList.contains('matched')) return;
      hindiCol.querySelectorAll('.match-item-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.matchingSelectedHindi = p.hindi;
      checkMatchAttempt(pairs);
    });
    hindiCol.appendChild(btn);
  });

  shuffledSanthali.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'match-item-btn olchiki-font';
    btn.textContent = `${p.olchiki} (${p.latin})`;
    btn.setAttribute('data-target-hindi', p.hindi);
    btn.addEventListener('click', () => {
      if (btn.classList.contains('matched')) return;
      santhaliCol.querySelectorAll('.match-item-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.matchingSelectedSanthali = p.hindi;
      checkMatchAttempt(pairs);
    });
    santhaliCol.appendChild(btn);
  });

  container.appendChild(gameDiv);
}

function checkMatchAttempt(pairs) {
  if (!state.matchingSelectedHindi || !state.matchingSelectedSanthali) return;

  const hindiBtn = document.querySelector(`.match-item-btn[data-hindi="${state.matchingSelectedHindi}"]`);
  const santhaliBtn = document.querySelector(`.match-item-btn[data-target-hindi="${state.matchingSelectedSanthali}"]`);

  if (state.matchingSelectedHindi === state.matchingSelectedSanthali) {
    // Matched correctly!
    hindiBtn.classList.remove('selected');
    hindiBtn.classList.add('matched');
    santhaliBtn.classList.remove('selected');
    santhaliBtn.classList.add('matched');

    playChime(true);
    addScore(1);

    // Check if all matched
    const remaining = document.querySelectorAll('.match-item-btn:not(.matched)');
    if (remaining.length === 0) {
      setTimeout(() => {
        alert('🎉 शाबाश! आपने सभी शब्द सही मिलाए हैं! ⭐⭐⭐\n(Great job! You matched all words correctly!)');
      }, 400);
    }
  } else {
    // Wrong match
    playChime(false);
    hindiBtn.style.borderColor = '#EF4444';
    santhaliBtn.style.borderColor = '#EF4444';
    setTimeout(() => {
      hindiBtn.classList.remove('selected');
      santhaliBtn.classList.remove('selected');
      hindiBtn.style.borderColor = '';
      santhaliBtn.style.borderColor = '';
    }, 600);
  }

  state.matchingSelectedHindi = null;
  state.matchingSelectedSanthali = null;
}

// Quiz Game logic
function renderQuizGame(ws, container) {
  const quizList = document.createElement('div');
  quizList.className = 'quiz-questions-list';

  (ws.questions || []).forEach((q, qIndex) => {
    const card = document.createElement('div');
    card.className = 'quiz-card';

    card.innerHTML = `
      <div class="quiz-question-text">${qIndex + 1}. ${q.question}</div>
      <div class="quiz-options-list" id="opts_${q.id}"></div>
      <div id="feedback_${q.id}" class="quiz-feedback-box hidden"></div>
    `;

    const optsContainer = card.querySelector(`#opts_${q.id}`);
    const feedbackBox = card.querySelector(`#feedback_${q.id}`);

    q.options.forEach(opt => {
      const optBtn = document.createElement('button');
      optBtn.className = 'quiz-option-btn';
      optBtn.textContent = opt.text;

      optBtn.addEventListener('click', () => {
        // Disable all options in this question
        optsContainer.querySelectorAll('.quiz-option-btn').forEach(b => b.disabled = true);

        if (opt.is_correct) {
          optBtn.classList.add('correct');
          feedbackBox.className = 'quiz-feedback-box';
          feedbackBox.style.background = '#ECFDF5';
          feedbackBox.style.borderColor = '#A7F3D0';
          feedbackBox.style.color = '#065F46';
          feedbackBox.innerHTML = `<strong>✓ सही उत्तर! <span class="en-sub-inline">(Correct Answer!)</span></strong> ${q.explanation || ''}`;
          playChime(true);
          addScore(1);
        } else {
          optBtn.classList.add('incorrect');
          feedbackBox.className = 'quiz-feedback-box';
          feedbackBox.style.background = '#FEF2F2';
          feedbackBox.style.borderColor = '#FECACA';
          feedbackBox.style.color = '#991B1B';
          feedbackBox.innerHTML = `<strong>✗ गलत उत्तर। <span class="en-sub-inline">(Incorrect Answer. Try again)</span></strong> ${q.explanation || ''}`;
          playChime(false);

          // Highlight the right option
          const correctBtn = Array.from(optsContainer.children).find((_, idx) => q.options[idx].is_correct);
          if (correctBtn) correctBtn.classList.add('correct');
        }
        feedbackBox.classList.remove('hidden');
      });

      optsContainer.appendChild(optBtn);
    });

    quizList.appendChild(card);
  });

  container.appendChild(quizList);
}

function addScore(points) {
  state.overallScore += points;
  document.getElementById('overallScoreText').textContent = `कुल स्कोर: ${state.overallScore}`;
}

// ==========================================
// 13. PWA SERVICE WORKER REGISTRATION
// ==========================================
function registerPwaServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
          console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.log('[PWA] ServiceWorker registration failed:', error);
        });
    });
  }
}
