// Multilingual translation system for FloodSense AI
// Supports 12 Indian languages with key UI strings

export type LangCode = "en" | "hi" | "bn" | "te" | "ta" | "mr" | "gu" | "kn" | "ml" | "pa" | "as" | "or";

export const LANG_MAP: Record<string, LangCode> = {
    "English": "en", "हिन्दी": "hi", "বাংলা": "bn", "తెలుగు": "te",
    "தமிழ்": "ta", "मराठी": "mr", "ગુજરાતી": "gu", "ಕನ್ನಡ": "kn",
    "മലയാളം": "ml", "ਪੰਜਾਬੀ": "pa", "অসমীয়া": "as", "ଓଡ଼ିଆ": "or",
};

interface TranslationSet {
    // Auth & Nav
    citizen_portal: string;
    authority_portal: string;
    login: string;
    signup: string;
    logout: string;
    // Dashboard
    am_i_safe: string;
    you_are_safe: string;
    danger_alert: string;
    moderate_risk: string;
    flood_probability: string;
    quick_actions: string;
    evacuation_route: string;
    nearby_shelters: string;
    send_sos: string;
    alert_family: string;
    // Alerts
    active_alerts: string;
    high_risk: string;
    low_risk: string;
    no_alerts: string;
    // Evacuation
    safe_route: string;
    avoid_flooded: string;
    destination: string;
    distance: string;
    // SOS
    emergency_sos: string;
    sos_sent: string;
    rescue_eta: string;
    helplines: string;
    // Vulnerability
    vulnerable_areas: string;
    elderly: string;
    children: string;
    disabled: string;
    // Dam
    dam_monitoring: string;
    dam_danger: string;
    dam_overflow: string;
    // Citizen Report
    report_flood: string;
    report_submitted: string;
    waterlogging: string;
    // General
    back: string;
    refresh: string;
    loading: string;
    state_analysis: string;
    view_all: string;
    current_conditions: string;
    recommendation: string;
}

const translations: Record<LangCode, TranslationSet> = {
    en: {
        citizen_portal: "Citizen Portal", authority_portal: "NDRF / Authority Portal",
        login: "Login", signup: "Sign Up", logout: "Logout",
        am_i_safe: "Am I Safe?", you_are_safe: "You are safe. No immediate flood risk.",
        danger_alert: "⚠️ DANGER — Move to higher ground immediately!",
        moderate_risk: "Elevated risk. Stay alert and prepare emergency kit.",
        flood_probability: "Flood probability", quick_actions: "Quick Actions",
        evacuation_route: "Evacuation Route", nearby_shelters: "Nearby Shelters",
        send_sos: "Send SOS", alert_family: "Alert Family",
        active_alerts: "Active Alerts", high_risk: "HIGH RISK", low_risk: "LOW RISK",
        no_alerts: "No active alerts. All parameters within safe range.",
        safe_route: "Nearest Safe Route", avoid_flooded: "Avoid flooded roads",
        destination: "Destination", distance: "Distance",
        emergency_sos: "Emergency SOS", sos_sent: "SOS Alert Sent ✓",
        rescue_eta: "Rescue team ETA: ~15 minutes", helplines: "Direct Helplines",
        vulnerable_areas: "Vulnerable Areas", elderly: "Elderly", children: "Children", disabled: "Disabled",
        dam_monitoring: "Dam & Reservoir Status", dam_danger: "DANGER", dam_overflow: "OVERFLOW",
        report_flood: "Report Flood/Waterlogging", report_submitted: "Report Submitted ✓",
        waterlogging: "Waterlogging Detected",
        back: "Back", refresh: "Refresh", loading: "Loading...",
        state_analysis: "State-wise Analysis", view_all: "View All",
        current_conditions: "Current Conditions", recommendation: "Recommendation",
    },
    hi: {
        citizen_portal: "नागरिक पोर्टल", authority_portal: "NDRF / प्राधिकरण पोर्टल",
        login: "लॉगिन", signup: "साइन अप", logout: "लॉग आउट",
        am_i_safe: "क्या मैं सुरक्षित हूँ?", you_are_safe: "आप सुरक्षित हैं। बाढ़ का कोई तत्काल खतरा नहीं।",
        danger_alert: "⚠️ खतरा — तुरंत ऊंचाई पर जाएं!",
        moderate_risk: "मध्यम खतरा। सतर्क रहें और इमरजेंसी किट तैयार रखें।",
        flood_probability: "बाढ़ की संभावना", quick_actions: "त्वरित कार्रवाई",
        evacuation_route: "निकासी मार्ग", nearby_shelters: "निकटतम आश्रय",
        send_sos: "SOS भेजें", alert_family: "परिवार को सचेत करें",
        active_alerts: "सक्रिय अलर्ट", high_risk: "उच्च जोखिम", low_risk: "कम जोखिम",
        no_alerts: "कोई सक्रिय अलर्ट नहीं। सभी मापदंड सुरक्षित सीमा में।",
        safe_route: "निकटतम सुरक्षित मार्ग", avoid_flooded: "जलमग्न सड़कों से बचें",
        destination: "गंतव्य", distance: "दूरी",
        emergency_sos: "आपातकालीन SOS", sos_sent: "SOS अलर्ट भेजा गया ✓",
        rescue_eta: "बचाव दल ETA: ~15 मिनट", helplines: "सीधी हेल्पलाइन",
        vulnerable_areas: "संवेदनशील क्षेत्र", elderly: "बुजुर्ग", children: "बच्चे", disabled: "विकलांग",
        dam_monitoring: "बांध और जलाशय स्थिति", dam_danger: "खतरा", dam_overflow: "ओवरफ्लो",
        report_flood: "बाढ़/जलभराव की रिपोर्ट", report_submitted: "रिपोर्ट जमा ✓",
        waterlogging: "जलभराव का पता चला",
        back: "वापस", refresh: "रिफ्रेश", loading: "लोड हो रहा है...",
        state_analysis: "राज्यवार विश्लेषण", view_all: "सभी देखें",
        current_conditions: "वर्तमान स्थिति", recommendation: "सिफारिश",
    },
    bn: {
        citizen_portal: "নাগরিক পোর্টাল", authority_portal: "NDRF / কর্তৃপক্ষ পোর্টাল",
        login: "লগইন", signup: "সাইন আপ", logout: "লগ আউট",
        am_i_safe: "আমি কি নিরাপদ?", you_are_safe: "আপনি নিরাপদ। বন্যার তাৎক্ষণিক ঝুঁকি নেই।",
        danger_alert: "⚠️ বিপদ — এখনই উঁচু জায়গায় যান!",
        moderate_risk: "মাঝারি ঝুঁকি। সতর্ক থাকুন।",
        flood_probability: "বন্যার সম্ভাবনা", quick_actions: "দ্রুত পদক্ষেপ",
        evacuation_route: "নিষ্কাশন পথ", nearby_shelters: "নিকটতম আশ্রয়",
        send_sos: "SOS পাঠান", alert_family: "পরিবারকে সতর্ক করুন",
        active_alerts: "সক্রিয় সতর্কতা", high_risk: "উচ্চ ঝুঁকি", low_risk: "কম ঝুঁকি",
        no_alerts: "কোনো সক্রিয় সতর্কতা নেই।",
        safe_route: "নিকটতম নিরাপদ পথ", avoid_flooded: "প্লাবিত রাস্তা এড়িয়ে চলুন",
        destination: "গন্তব্য", distance: "দূরত্ব",
        emergency_sos: "জরুরি SOS", sos_sent: "SOS সতর্কতা পাঠানো হয়েছে ✓",
        rescue_eta: "উদ্ধার দল ETA: ~১৫ মিনিট", helplines: "সরাসরি হেল্পলাইন",
        vulnerable_areas: "ঝুঁকিপূর্ণ এলাকা", elderly: "বয়স্ক", children: "শিশু", disabled: "প্রতিবন্ধী",
        dam_monitoring: "বাঁধ ও জলাধার অবস্থা", dam_danger: "বিপদ", dam_overflow: "ওভারফ্লো",
        report_flood: "বন্যা/জলাবদ্ধতা রিপোর্ট", report_submitted: "রিপোর্ট জমা ✓",
        waterlogging: "জলাবদ্ধতা শনাক্ত",
        back: "ফিরে যান", refresh: "রিফ্রেশ", loading: "লোড হচ্ছে...",
        state_analysis: "রাজ্যভিত্তিক বিশ্লেষণ", view_all: "সব দেখুন",
        current_conditions: "বর্তমান পরিস্থিতি", recommendation: "সুপারিশ",
    },
    ta: {
        citizen_portal: "குடிமக்கள் போர்டல்", authority_portal: "NDRF / அதிகாரி போர்டல்",
        login: "உள்நுழை", signup: "பதிவு செய்", logout: "வெளியேறு",
        am_i_safe: "நான் பாதுகாப்பாக இருக்கிறேனா?", you_are_safe: "நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்.",
        danger_alert: "⚠️ ஆபத்து — உடனடியாக உயரமான இடத்திற்கு செல்லுங்கள்!",
        moderate_risk: "மிதமான ஆபத்து. விழிப்புடன் இருங்கள்.",
        flood_probability: "வெள்ள நிகழ்தகவு", quick_actions: "விரைவு நடவடிக்கைகள்",
        evacuation_route: "வெளியேற்ற பாதை", nearby_shelters: "அருகிலுள்ள தங்குமிடங்கள்",
        send_sos: "SOS அனுப்பு", alert_family: "குடும்பத்தை எச்சரி",
        active_alerts: "செயலில் உள்ள எச்சரிக்கைகள்", high_risk: "அதிக ஆபத்து", low_risk: "குறைந்த ஆபத்து",
        no_alerts: "செயலில் எச்சரிக்கைகள் இல்லை.",
        safe_route: "அருகிலுள்ள பாதுகாப்பான பாதை", avoid_flooded: "வெள்ளத்தில் மூழ்கிய சாலைகளை தவிர்க்கவும்",
        destination: "சேருமிடம்", distance: "தூரம்",
        emergency_sos: "அவசர SOS", sos_sent: "SOS எச்சரிக்கை அனுப்பப்பட்டது ✓",
        rescue_eta: "மீட்புக் குழு ETA: ~15 நிமிடங்கள்", helplines: "நேரடி உதவி எண்கள்",
        vulnerable_areas: "பாதிக்கப்படக்கூடிய பகுதிகள்", elderly: "முதியோர்", children: "குழந்தைகள்", disabled: "ஊனமுற்றோர்",
        dam_monitoring: "அணை & நீர்த்தேக்க நிலை", dam_danger: "ஆபத்து", dam_overflow: "வழிந்தோடுதல்",
        report_flood: "வெள்ளம்/நீர்தேக்கம் புகார்", report_submitted: "புகார் சமர்ப்பிக்கப்பட்டது ✓",
        waterlogging: "நீர்தேக்கம் கண்டறியப்பட்டது",
        back: "பின்செல்", refresh: "புதுப்பி", loading: "ஏற்றுகிறது...",
        state_analysis: "மாநில வாரியான பகுப்பாய்வு", view_all: "அனைத்தையும் காட்டு",
        current_conditions: "தற்போதைய நிலைமைகள்", recommendation: "பரிந்துரை",
    },
    te: {
        citizen_portal: "పౌర పోర్టల్", authority_portal: "NDRF / అధికార పోర్టల్",
        login: "లాగిన్", signup: "సైన్ అప్", logout: "లాగ్ అవుట్",
        am_i_safe: "నేను సురక్షితంగా ఉన్నానా?", you_are_safe: "మీరు సురక్షితంగా ఉన్నారు.",
        danger_alert: "⚠️ ప్రమాదం — వెంటనే ఎత్తైన ప్రాంతానికి వెళ్ళండి!",
        moderate_risk: "మధ్యస్థ ప్రమాదం. అప్రమత్తంగా ఉండండి.",
        flood_probability: "వరద సంభావ్యత", quick_actions: "శీఘ్ర చర్యలు",
        evacuation_route: "తరలింపు మార్గం", nearby_shelters: "సమీపంలోని ఆశ్రయాలు",
        send_sos: "SOS పంపండి", alert_family: "కుటుంబాన్ని హెచ్చరించండి",
        active_alerts: "క్రియాశీల హెచ్చరికలు", high_risk: "అధిక ప్రమాదం", low_risk: "తక్కువ ప్రమాదం",
        no_alerts: "క్రియాశీల హెచ్చరికలు లేవు.",
        safe_route: "సమీపంలోని సురక్షిత మార్గం", avoid_flooded: "వరద నీటిలో మునిగిన రోడ్లను నివారించండి",
        destination: "గమ్యం", distance: "దూరం",
        emergency_sos: "అత్యవసర SOS", sos_sent: "SOS హెచ్చరిక పంపబడింది ✓",
        rescue_eta: "రెస్క్యూ టీమ్ ETA: ~15 నిమిషాలు", helplines: "ప్రత్యక్ష హెల్ప్‌లైన్లు",
        vulnerable_areas: "బాధ్యతాత్మక ప్రాంతాలు", elderly: "వృద్ధులు", children: "పిల్లలు", disabled: "వికలాంగులు",
        dam_monitoring: "ఆనకట్ట & రిజర్వాయర్ స్థితి", dam_danger: "ప్రమాదం", dam_overflow: "ఓవర్‌ఫ్లో",
        report_flood: "వరద/నీటి నిల్వ నివేదన", report_submitted: "నివేదన సమర్పించబడింది ✓",
        waterlogging: "నీటి నిల్వ గుర్తించబడింది",
        back: "వెనుకకు", refresh: "రిఫ్రెష్", loading: "లోడ్ అవుతోంది...",
        state_analysis: "రాష్ట్రవారీ విశ్లేషణ", view_all: "అన్నీ చూడండి",
        current_conditions: "ప్రస్తుత పరిస్థితులు", recommendation: "సిఫారసు",
    },
    mr: {
        citizen_portal: "नागरिक पोर्टल", authority_portal: "NDRF / प्राधिकरण पोर्टल",
        login: "लॉगिन", signup: "साइन अप", logout: "लॉग आउट",
        am_i_safe: "मी सुरक्षित आहे का?", you_are_safe: "तुम्ही सुरक्षित आहात.",
        danger_alert: "⚠️ धोका — लगेच उंच ठिकाणी जा!",
        moderate_risk: "मध्यम धोका. सतर्क राहा.",
        flood_probability: "पूर संभाव्यता", quick_actions: "जलद कृती",
        evacuation_route: "निर्वासन मार्ग", nearby_shelters: "जवळचे निवारे",
        send_sos: "SOS पाठवा", alert_family: "कुटुंबाला सूचित करा",
        active_alerts: "सक्रिय सूचना", high_risk: "उच्च धोका", low_risk: "कमी धोका",
        no_alerts: "सक्रिय सूचना नाहीत.",
        safe_route: "जवळचा सुरक्षित मार्ग", avoid_flooded: "पूरग्रस्त रस्ते टाळा",
        destination: "गंतव्य", distance: "अंतर",
        emergency_sos: "आणीबाणी SOS", sos_sent: "SOS सूचना पाठवली ✓",
        rescue_eta: "बचाव पथक ETA: ~15 मिनिटे", helplines: "थेट हेल्पलाइन",
        vulnerable_areas: "संवेदनशील क्षेत्रे", elderly: "ज्येष्ठ", children: "मुले", disabled: "अपंग",
        dam_monitoring: "धरण व जलाशय स्थिती", dam_danger: "धोका", dam_overflow: "ओव्हरफ्लो",
        report_flood: "पूर/जलभराव अहवाल", report_submitted: "अहवाल सादर ✓",
        waterlogging: "जलभराव आढळला",
        back: "मागे", refresh: "रिफ्रेश", loading: "लोड होत आहे...",
        state_analysis: "राज्यनिहाय विश्लेषण", view_all: "सर्व पहा",
        current_conditions: "सध्याची परिस्थिती", recommendation: "शिफारस",
    },
    gu: {
        citizen_portal: "નાગરિક પોર્ટલ", authority_portal: "NDRF / સત્તામંડળ પોર્ટલ",
        login: "લૉગિન", signup: "સાઇન અપ", logout: "લૉગ આઉટ",
        am_i_safe: "હું સુરક્ષિત છું?", you_are_safe: "તમે સુરક્ષિત છો.",
        danger_alert: "⚠️ જોખમ — તાત્કાલિક ઊંચાઈ પર જાઓ!",
        moderate_risk: "મધ્યમ જોખમ. સતર્ક રહો.",
        flood_probability: "પૂરની સંભાવના", quick_actions: "ઝડપી ક્રિયાઓ",
        evacuation_route: "ખાલી કરાવવાનો માર્ગ", nearby_shelters: "નજીકના આશ્રયસ્થાનો",
        send_sos: "SOS મોકલો", alert_family: "કુટુંબને ચેતવો",
        active_alerts: "સક્રિય ચેતવણીઓ", high_risk: "ઉચ્ચ જોખમ", low_risk: "ઓછું જોખમ",
        no_alerts: "કોઈ સક્રિય ચેતવણીઓ નથી.",
        safe_route: "નજીકનો સુરક્ષિત માર્ગ", avoid_flooded: "પૂરગ્રસ્ત રસ્તાઓ ટાળો",
        destination: "ગંતવ્ય", distance: "અંતર",
        emergency_sos: "કટોકટી SOS", sos_sent: "SOS ચેતવણી મોકલાઈ ✓",
        rescue_eta: "બચાવ ટીમ ETA: ~15 મિનિટ", helplines: "સીધી હેલ્પલાઈન",
        vulnerable_areas: "સંવેદનશીલ વિસ્તારો", elderly: "વૃદ્ધ", children: "બાળકો", disabled: "વિકલાંગ",
        dam_monitoring: "બંધ અને જળાશય સ્થિતિ", dam_danger: "જોખમ", dam_overflow: "ઓવરફ્લો",
        report_flood: "પૂર/જળભરાવ રિપોર્ટ", report_submitted: "રિપોર્ટ સબમિટ ✓",
        waterlogging: "જળભરાવ શોધાયેલ",
        back: "પાછા", refresh: "રિફ્રેશ", loading: "લોડ થઈ રહ્યું...",
        state_analysis: "રાજ્ય મુજબ વિશ્લેષણ", view_all: "બધું જુઓ",
        current_conditions: "વર્તમાન પરિસ્થિતિ", recommendation: "ભલામણ",
    },
    kn: {
        citizen_portal: "ನಾಗರಿಕ ಪೋರ್ಟಲ್", authority_portal: "NDRF / ಅಧಿಕಾರಿ ಪೋರ್ಟಲ್",
        login: "ಲಾಗಿನ್", signup: "ಸೈನ್ ಅಪ್", logout: "ಲಾಗ್ ಔಟ್",
        am_i_safe: "ನಾನು ಸುರಕ್ಷಿತವಾಗಿದ್ದೇನೆಯೇ?", you_are_safe: "ನೀವು ಸುರಕ್ಷಿತ.",
        danger_alert: "⚠️ ಅಪಾಯ — ತಕ್ಷಣ ಎತ್ತರದ ಸ್ಥಳಕ್ಕೆ ಹೋಗಿ!",
        moderate_risk: "ಮಧ್ಯಮ ಅಪಾಯ. ಎಚ್ಚರವಾಗಿರಿ.",
        flood_probability: "ಪ್ರವಾಹ ಸಂಭಾವ್ಯತೆ", quick_actions: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
        evacuation_route: "ಸ್ಥಳಾಂತರ ಮಾರ್ಗ", nearby_shelters: "ಹತ್ತಿರದ ಆಶ್ರಯಗಳು",
        send_sos: "SOS ಕಳುಹಿಸಿ", alert_family: "ಕುಟುಂಬಕ್ಕೆ ಎಚ್ಚರಿಸಿ",
        active_alerts: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು", high_risk: "ಹೆಚ್ಚಿನ ಅಪಾಯ", low_risk: "ಕಡಿಮೆ ಅಪಾಯ",
        no_alerts: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು ಇಲ್ಲ.",
        safe_route: "ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಮಾರ್ಗ", avoid_flooded: "ಪ್ರವಾಹಿತ ರಸ್ತೆಗಳನ್ನು ತಪ್ಪಿಸಿ",
        destination: "ಗಮ್ಯಸ್ಥಾನ", distance: "ದೂರ",
        emergency_sos: "ತುರ್ತು SOS", sos_sent: "SOS ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ ✓",
        rescue_eta: "ರಕ್ಷಣಾ ತಂಡ ETA: ~15 ನಿಮಿಷ", helplines: "ನೇರ ಸಹಾಯವಾಣಿ",
        vulnerable_areas: "ದುರ್ಬಲ ಪ್ರದೇಶಗಳು", elderly: "ವೃದ್ಧರು", children: "ಮಕ್ಕಳು", disabled: "ವಿಕಲಚೇತನರು",
        dam_monitoring: "ಅಣೆಕಟ್ಟು ಸ್ಥಿತಿ", dam_danger: "ಅಪಾಯ", dam_overflow: "ಓವರ್‌ಫ್ಲೋ",
        report_flood: "ಪ್ರವಾಹ ವರದಿ", report_submitted: "ವರದಿ ಸಲ್ಲಿಸಲಾಗಿದೆ ✓",
        waterlogging: "ಜಲನಿಲುಗಡೆ ಪತ್ತೆಯಾಗಿದೆ",
        back: "ಹಿಂದೆ", refresh: "ರಿಫ್ರೆಶ್", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        state_analysis: "ರಾಜ್ಯವಾರು ವಿಶ್ಲೇಷಣೆ", view_all: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
        current_conditions: "ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಗಳು", recommendation: "ಶಿಫಾರಸು",
    },
    ml: {
        citizen_portal: "പൗര പോർട്ടൽ", authority_portal: "NDRF / അധികാരി പോർട്ടൽ",
        login: "ലോഗിൻ", signup: "സൈൻ അപ്പ്", logout: "ലോഗ് ഔട്ട്",
        am_i_safe: "ഞാൻ സുരക്ഷിതനാണോ?", you_are_safe: "നിങ്ങൾ സുരക്ഷിതരാണ്.",
        danger_alert: "⚠️ അപകടം — ഉടൻ ഉയർന്ന പ്രദേശത്തേക്ക് മാറുക!",
        moderate_risk: "മധ്യ അപകടം. ജാഗ്രത പാലിക്കുക.",
        flood_probability: "വെള്ളപ്പൊക്ക സാധ്യത", quick_actions: "ദ്രുത നടപടികൾ",
        evacuation_route: "ഒഴിപ്പിക്കൽ പാത", nearby_shelters: "അടുത്തുള്ള ഷെൽട്ടറുകൾ",
        send_sos: "SOS അയയ്ക്കുക", alert_family: "കുടുംബത്തെ അറിയിക്കുക",
        active_alerts: "സജീവ മുന്നറിയിപ്പുകൾ", high_risk: "ഉയർന്ന അപകടം", low_risk: "കുറഞ്ഞ അപകടം",
        no_alerts: "സജീവ മുന്നറിയിപ്പുകൾ ഇല്ല.",
        safe_route: "അടുത്തുള്ള സുരക്ഷിത പാത", avoid_flooded: "വെള്ളം കയറിയ റോഡുകൾ ഒഴിവാക്കുക",
        destination: "ലക്ഷ്യം", distance: "ദൂരം",
        emergency_sos: "അടിയന്തര SOS", sos_sent: "SOS മുന്നറിയിപ്പ് അയച്ചു ✓",
        rescue_eta: "രക്ഷാ ടീം ETA: ~15 മിനിറ്റ്", helplines: "നേരിട്ട് ഹെൽപ്‌ലൈൻ",
        vulnerable_areas: "ദുർബല പ്രദേശങ്ങൾ", elderly: "വൃദ്ധർ", children: "കുട്ടികൾ", disabled: "വികലാംഗർ",
        dam_monitoring: "ഡാം & റിസർവോയർ സ്ഥിതി", dam_danger: "അപകടം", dam_overflow: "ഓവർഫ്ലോ",
        report_flood: "വെള്ളപ്പൊക്ക റിപ്പോർട്ട്", report_submitted: "റിപ്പോർട്ട് സമർപ്പിച്ചു ✓",
        waterlogging: "ജലസ്തംഭനം കണ്ടെത്തി",
        back: "മടങ്ങുക", refresh: "പുതുക്കുക", loading: "ലോഡ് ചെയ്യുന്നു...",
        state_analysis: "സംസ്ഥാന വിശകലനം", view_all: "എല്ലാം കാണുക",
        current_conditions: "നിലവിലെ സാഹചര്യങ്ങൾ", recommendation: "ശിഫാർശ",
    },
    pa: {
        citizen_portal: "ਨਾਗਰਿਕ ਪੋਰਟਲ", authority_portal: "NDRF / ਅਥਾਰਟੀ ਪੋਰਟਲ",
        login: "ਲੌਗਇਨ", signup: "ਸਾਈਨ ਅੱਪ", logout: "ਲੌਗ ਆਊਟ",
        am_i_safe: "ਕੀ ਮੈਂ ਸੁਰੱਖਿਅਤ ਹਾਂ?", you_are_safe: "ਤੁਸੀਂ ਸੁਰੱਖਿਅਤ ਹੋ.",
        danger_alert: "⚠️ ਖ਼ਤਰਾ — ਤੁਰੰਤ ਉੱਚੀ ਥਾਂ ਤੇ ਜਾਓ!",
        moderate_risk: "ਦਰਮਿਆਨਾ ਖ਼ਤਰਾ. ਸੁਚੇਤ ਰਹੋ.",
        flood_probability: "ਹੜ੍ਹ ਦੀ ਸੰਭਾਵਨਾ", quick_actions: "ਤੁਰੰਤ ਕਾਰਵਾਈ",
        evacuation_route: "ਨਿਕਾਸੀ ਰਸਤਾ", nearby_shelters: "ਨੇੜੇ ਦੇ ਆਸਰੇ",
        send_sos: "SOS ਭੇਜੋ", alert_family: "ਪਰਿਵਾਰ ਨੂੰ ਚੇਤਾਵਨੀ",
        active_alerts: "ਸਰਗਰਮ ਚੇਤਾਵਨੀਆਂ", high_risk: "ਉੱਚ ਖ਼ਤਰਾ", low_risk: "ਘੱਟ ਖ਼ਤਰਾ",
        no_alerts: "ਕੋਈ ਸਰਗਰਮ ਚੇਤਾਵਨੀ ਨਹੀਂ.",
        safe_route: "ਨੇੜੇ ਸੁਰੱਖਿਅਤ ਰਸਤਾ", avoid_flooded: "ਪਾਣੀ ਨਾਲ ਭਰੀਆਂ ਸੜਕਾਂ ਤੋਂ ਬਚੋ",
        destination: "ਮੰਜ਼ਿਲ", distance: "ਦੂਰੀ",
        emergency_sos: "ਐਮਰਜੈਂਸੀ SOS", sos_sent: "SOS ਚੇਤਾਵਨੀ ਭੇਜੀ ✓",
        rescue_eta: "ਬਚਾਅ ਟੀਮ ETA: ~15 ਮਿੰਟ", helplines: "ਸਿੱਧੀ ਹੈਲਪਲਾਈਨ",
        vulnerable_areas: "ਸੰਵੇਦਨਸ਼ੀਲ ਖੇਤਰ", elderly: "ਬਜ਼ੁਰਗ", children: "ਬੱਚੇ", disabled: "ਅਪਾਹਜ",
        dam_monitoring: "ਡੈਮ ਅਤੇ ਜਲਾਸ਼ਯ ਸਥਿਤੀ", dam_danger: "ਖ਼ਤਰਾ", dam_overflow: "ਓਵਰਫਲੋ",
        report_flood: "ਹੜ੍ਹ/ਪਾਣੀ ਭਰਨ ਦੀ ਰਿਪੋਰਟ", report_submitted: "ਰਿਪੋਰਟ ਜਮ੍ਹਾ ✓",
        waterlogging: "ਪਾਣੀ ਭਰਨ ਦਾ ਪਤਾ ਲੱਗਿਆ",
        back: "ਪਿੱਛੇ", refresh: "ਤਾਜ਼ਾ ਕਰੋ", loading: "ਲੋਡ ਹੋ ਰਿਹਾ...",
        state_analysis: "ਰਾਜ ਅਨੁਸਾਰ ਵਿਸ਼ਲੇਸ਼ਣ", view_all: "ਸਭ ਵੇਖੋ",
        current_conditions: "ਮੌਜੂਦਾ ਸਥਿਤੀ", recommendation: "ਸਿਫਾਰਿਸ਼",
    },
    as: {
        citizen_portal: "নাগৰিক পৰ্টেল", authority_portal: "NDRF / কৰ্তৃপক্ষ পৰ্টেল",
        login: "লগইন", signup: "চাইন আপ", logout: "লগ আউট",
        am_i_safe: "মই সুৰক্ষিত নে?", you_are_safe: "আপুনি সুৰক্ষিত।",
        danger_alert: "⚠️ বিপদ — তৎক্ষণাত ওপৰলৈ যাওক!",
        moderate_risk: "মধ্যমীয়া বিপদ। সতৰ্ক থাকক।",
        flood_probability: "বানপানীৰ সম্ভাৱনা", quick_actions: "দ্ৰুত পদক্ষেপ",
        evacuation_route: "নিষ্কাশন পথ", nearby_shelters: "ওচৰৰ আশ্ৰয়",
        send_sos: "SOS পঠাওক", alert_family: "পৰিয়ালক সতৰ্ক কৰক",
        active_alerts: "সক্ৰিয় সতৰ্কবাণী", high_risk: "উচ্চ বিপদ", low_risk: "কম বিপদ",
        no_alerts: "কোনো সতৰ্কবাণী নাই।",
        safe_route: "ওচৰৰ সুৰক্ষিত পথ", avoid_flooded: "পানীত বুৰি যোৱা ৰাস্তা এৰক",
        destination: "গন্তব্য", distance: "দূৰত্ব",
        emergency_sos: "জৰুৰীকালীন SOS", sos_sent: "SOS পঠোৱা হৈছে ✓",
        rescue_eta: "উদ্ধাৰ দল ETA: ~১৫ মিনিট", helplines: "পোনপটীয়া হেল্পলাইন",
        vulnerable_areas: "দুৰ্বল অঞ্চল", elderly: "বৃদ্ধ", children: "শিশু", disabled: "বিকলাঙ্গ",
        dam_monitoring: "বান্ধ আৰু জলাশয়ৰ অৱস্থা", dam_danger: "বিপদ", dam_overflow: "ওভাৰফ্লো",
        report_flood: "বানপানী ৰিপোৰ্ট", report_submitted: "ৰিপোৰ্ট দাখিল ✓",
        waterlogging: "জলাবদ্ধতা ধৰা পৰিছে",
        back: "উভতি যাওক", refresh: "ৰিফ্ৰেছ", loading: "ল'ড হৈ আছে...",
        state_analysis: "ৰাজ্যভিত্তিক বিশ্লেষণ", view_all: "সকলো চাওক",
        current_conditions: "বৰ্তমান অৱস্থা", recommendation: "পৰামৰ্শ",
    },
    or: {
        citizen_portal: "ନାଗରିକ ପୋର୍ଟାଲ", authority_portal: "NDRF / ଅଧିକାରୀ ପୋର୍ଟାଲ",
        login: "ଲଗଇନ", signup: "ସାଇନ ଅପ", logout: "ଲଗ ଆଉଟ",
        am_i_safe: "ମୁଁ ସୁରକ୍ଷିତ କି?", you_are_safe: "ଆପଣ ସୁରକ୍ଷିତ ଅଛନ୍ତି।",
        danger_alert: "⚠️ ବିପଦ — ତୁରନ୍ତ ଉଚ୍ଚ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ!",
        moderate_risk: "ମଧ୍ୟମ ବିପଦ। ସତର୍କ ରୁହନ୍ତୁ।",
        flood_probability: "ବନ୍ୟା ସମ୍ଭାବନା", quick_actions: "ଦ୍ରୁତ ପଦକ୍ଷେପ",
        evacuation_route: "ନିଷ୍କାସନ ପଥ", nearby_shelters: "ନିକଟବର୍ତ୍ତୀ ଆଶ୍ରୟ",
        send_sos: "SOS ପଠାନ୍ତୁ", alert_family: "ପରିବାରକୁ ସତର୍କ କରନ୍ତୁ",
        active_alerts: "ସକ୍ରିୟ ସତର୍କତା", high_risk: "ଅଧିକ ବିପଦ", low_risk: "କମ୍ ବିପଦ",
        no_alerts: "କୌଣସି ସକ୍ରିୟ ସତର୍କତା ନାହିଁ।",
        safe_route: "ନିକଟତମ ସୁରକ୍ଷିତ ପଥ", avoid_flooded: "ବନ୍ୟାପ୍ଲାବିତ ରାସ୍ତା ଏଡ଼ାନ୍ତୁ",
        destination: "ଗନ୍ତବ୍ୟ", distance: "ଦୂରତା",
        emergency_sos: "ଜରୁରୀ SOS", sos_sent: "SOS ପଠାଗଲା ✓",
        rescue_eta: "ଉଦ୍ଧାର ଦଳ ETA: ~15 ମିନିଟ", helplines: "ସିଧା ହେଲ୍ପଲାଇନ",
        vulnerable_areas: "ସଂବେଦନଶୀଳ ଅଞ୍ଚଳ", elderly: "ବୃଦ୍ଧ", children: "ଶିଶୁ", disabled: "ବିକଳାଙ୍ଗ",
        dam_monitoring: "ବନ୍ଧ ଓ ଜଳାଶୟ ସ୍ଥିତି", dam_danger: "ବିପଦ", dam_overflow: "ଓଭରଫ୍ଲୋ",
        report_flood: "ବନ୍ୟା/ଜଳାବଦ୍ଧତା ରିପୋର୍ଟ", report_submitted: "ରିପୋର୍ଟ ଦାଖଲ ✓",
        waterlogging: "ଜଳାବଦ୍ଧତା ଚିହ୍ନଟ",
        back: "ପଛକୁ", refresh: "ରିଫ୍ରେଶ", loading: "ଲୋଡ ହେଉଛି...",
        state_analysis: "ରାଜ୍ୟ ଅନୁଯାୟୀ ବିଶ୍ଳେଷଣ", view_all: "ସବୁ ଦେଖନ୍ତୁ",
        current_conditions: "ବର୍ତ୍ତମାନ ସ୍ଥିତି", recommendation: "ସୁପାରିଶ",
    },
};

export function t(lang: string, key: keyof TranslationSet): string {
    const code = LANG_MAP[lang] || "en";
    return translations[code]?.[key] || translations.en[key] || key;
}

export function speak(text: string, lang: string = "English"): void {
    if(typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
        "English": "en-IN", "हिन्दी": "hi-IN", "বাংলা": "bn-IN", "తెలుగు": "te-IN",
        "தமிழ்": "ta-IN", "मराठी": "mr-IN", "ગુજરાતી": "gu-IN", "ಕನ್ನಡ": "kn-IN",
        "മലയാളം": "ml-IN", "ਪੰਜਾਬੀ": "pa-IN", "অসমীয়া": "as-IN", "ଓଡ଼ିଆ": "or-IN",
    };
    u.lang = langMap[lang] || "en-IN";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
}
