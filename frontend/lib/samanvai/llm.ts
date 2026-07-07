import fs from "fs";
import path from "path";
import { KnowledgeItem, LanguageCode, getKnowledgeItem, knowledgeBase } from "./knowledge";
import { ProfileFacts, validateAndMapInput } from "./engine";

export type SamanvaiResponse = {
  response: string;
  extractedFacts: ProfileFacts;
  itemId?: string;
  detectedLanguage: LanguageCode;
  canApply: boolean;
  nextQuestion?: { key: string; question: string; type: string; choices?: string[] };
  suggestions?: string[];
};

// Base fields questions localized
const baseQuestions: Record<string, Record<LanguageCode, string>> = {
  state: {
    en: "Which state are you applying from?",
    te: "మీరు ఏ రాష్ట్రం నుండి దరఖాస్తు చేస్తున్నారు?",
    hi: "आप किस राज्य से आवेदन कर रहे हैं?",
    kn: "ನೀవు ಯಾವ ರಾಜ್ಯದಿಂದ ಅರ್ಜಿ ಸಲ್ಲಿಸುತ್ತಿದ್ದೀರಿ?",
  },
  district: {
    en: "Which district?",
    te: "ఏ జిల్లా?",
    hi: "कौन सा जिला?",
    kn: "ಯಾವ ಜಿಲ್ಲೆ?",
  },
  name: {
    en: "Could you please tell me your full name?",
    te: "దయచేసి మీ పూర్తి పేరు చెప్పగలరా?",
    hi: "क्या आप मुझे अपना पूरा नाम बता सकते हैं?",
    kn: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ತಿಳಿಸಬಹುದೇ?",
  },
  date_of_birth: {
    en: "What is your date of birth? (YYYY-MM-DD)",
    te: "మీ పుట్టిన తేదీ ఏమిటి? (YYYY-MM-DD)",
    hi: "आपकी जन्म तिथि क्या है? (YYYY-MM-DD)",
    kn: "ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕ ಯಾವುದು? (YYYY-MM-DD)",
  },
  gender: {
    en: "What is your gender?",
    te: "మీ జెండర్ (లింగము) ఏమిటి?",
    hi: "आपका लिंग (Gender) क्या है?",
    kn: "ನಿಮ್ಮ ಲಿಂಗ (Gender) ಯಾವುದು?",
  },
  address: {
    en: "What is your full address?",
    te: "మీ పూర్తి చిరునామా ఏమిటి?",
    hi: "आपका पूरा पता क्या है?",
    kn: "ನಿಮ್ಮ పೂರ್ಣ విళಾಸ యాವುದು?",
  },
};

// Scheme questions localized
const localizedQuestions: Record<string, Record<LanguageCode, string>> = {
  owns_cultivable_land: {
    en: "Do you or your family own cultivable agricultural land?",
    te: "మీకు లేదా మీ కుటుంబానికి సాగు భూమి ఉందా?",
    hi: "क्या आप या आपके परिवार के पास कृषि योग्य भूमि है?",
    kn: "ನಿಮಗೆ ಅಥವಾ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಕೃಷಿ ಯೋಗ್ಯ ಭೂಮಿ ಇದೆಯೇ?",
  },
  is_institutional_land: {
    en: "Is the land owned by an institution?",
    te: "ఈ భూమి ఏదైనా సంస్థకు చెందినదా?",
    hi: "क्या यह भूमि किसी संस्था के स्वामित्व में है?",
    kn: "ಈ భూಮಿ ಯಾವುದಾದರೂ ಸಂಸ್ಥೆಯ ಒಡೆತನದಲ್ಲಿದೆಯೆ?",
  },
  paid_income_tax: {
    en: "Did anyone in your family pay income tax in the previous year?",
    te: "గత సంవత్సరంలో మీ కుటుంబంలో ఎవరైనా ఆదాయపు పన్ను (Income Tax) చెల్లించారా?",
    hi: "क्या पिछले वर्ष आपके परिवार में किसी ने आयकर (Income Tax) भुगतान किया था?",
    kn: "ಕಳೆದ ವರ್ಷ ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಯಾರಾದರೂ ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿಸಿದ್ದಾರೆಯೇ?",
  },
  pension_over_10k: {
    en: "Does anyone in your family receive a government pension of Rs. 10,000 or more?",
    te: "మీకు లేదా మీ కుటుంబానికి రూ. 10,000 లేదా అంతకంటే ఎక్కువ ప్రభుత్వ పెన్షన్ పొందుతున్నారా?",
    hi: "क्या आपके परिवार में कोई रु. 10,000 या अधिक की सरकारी पेंशन प्राप्त करता है?",
    kn: "ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಯಾರಾದರೂ ರೂ. 10,000 ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಸರ್ಕಾರಿ పిಂಚಣಿ ಪಡೆಯುತ್ತಿದ್ದಾರೆಯೇ?",
  },
  is_registered_professional: {
    en: "Are you a registered Doctor, Engineer, Lawyer, CA, or Architect?",
    te: "మీరు రిజిస్టర్డ్ డాక్టర్, ఇంజనీర్, న్యాయవాది, సిఏ లేదా ఆర్కిటెక్ట్ ఆ?",
    hi: "क्या आप एक पंजीकृत डॉक्टर, इंजीनियर, वकील, सीए या आर्किटेक्ट हैं?",
    kn: "ನೀವು ನೋಂದಾಯಿತ ವೈದ್ಯರು, ಎಂಜಿನಿಯರ್, ವಕೀಲರು, ಸಿಎ ಅಥವಾ ವಾಸ್ತುಶಿಲ್ಪಿ ಆಗಿದ್ದೀರಾ?",
  },
  is_ts_resident: {
    en: "Are you a permanent resident of Telangana?",
    te: "మీరు తెలంగాణ శాశ్వత నివాసియేనా?",
    hi: "क्या आप तेलंगाना के स्थायी निवासी हैं?",
    kn: "ನೀವು ತೆಲಂಗಾಣದ ಖಾಯಂ ನಿವಾಸಿಯೇ?",
  },
  has_bpl_card: {
    en: "Do you have a BPL or White Ration Card?",
    te: "మీకు బిపిఎల్ (BPL) లేదా తెల్ల రేషన్ కార్డ్ ఉందా?",
    hi: "क्या आपके पास बीपीएल (BPL) या सफेद राशन कार्ड है?",
    kn: "ನಿಮ್ಮ ಬಳಿ ಬಿಪಿಎಲ್ ಅಥವಾ ಬಿಳಿ ರೇಷನ್ ಕಾರ್ಡ್ ಇದೆಯೇ?",
  },
  owns_pucca_house: {
    en: "Do you currently own a permanent RCC roof house?",
    te: "మీకు ప్రస్తుతం శాశ్వత పక్కా ఇల్లు (RCC Roof) ఉందా?",
    hi: "क्या आपके पास वर्तमान में एक स्थायी पक्का घर (आरसीसी छत) है?",
    kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಸ್ವಂತ ಖಾಯಂ ಪಕ್ಕಾ ಮನೆ (ಆರ್ಸಿಸಿ ಛಾವಣಿ) ಇದೆಯೇ?",
  },
  received_prior_housing: {
    en: "Have you received a government house after 1995?",
    te: "మీరు 1995 తర్వాత ఎప్పుడైనా ప్రభుత్వం నుండి ఇల్లు పొందారా?",
    hi: "क्या आपको 1995 के बाद कोई सरकारी घर मिला है?",
    kn: "ನೀವು 1995 ರ ನಂತರ ಯಾವುದೇ ಸರ್ಕಾರಿ ಮನೆಯನ್ನು ಪಡೆದಿದ್ದೀರಾ?",
  },
  owns_plot: {
    en: "Do you own a plot of land for construction?",
    te: "ఇల్లు నిర్మించడానికి మీకు సొంత స్థలం ఉందా?",
    hi: "क्या आपके पास निर्माण के लिए अपना भूखंड (Plot) है?",
    kn: "ಮನೆ ನಿರ್ಮಾಣಕ್ಕಾಗಿ ನಿಮ್ಮ ಸ್ವಂತ ನಿವೇಶನ (Plot) ಇದೆಯೇ?",
  },
  primary_income_source: {
    en: "What is your primary source of income? (Agriculture, Salary, Business, or Other)",
    te: "మీ ప్రధాన ఆదాయ వనరు ఏమిటి? (వ్యవసాయం, జీతం, వ్యాపారం, లేదా ఇతరాలు)",
    hi: "आपकी आय का मुख्य स्रोत क्या है? (कृषि, वेतन, व्यवसाय, या अन्य)",
    kn: "ನಿಮ್ಮ ಪ್ರಮುಖ ಆದಾಯದ ಮೂಲ ಯಾವುದು? (ಕೃಷಿ, ಸಂಬಳ, ವ್ಯವಹಾರ, ಅಥವಾ ಇತರೆ)",
  },
  has_income_proof: {
    en: "Do you have a current salary slip, IT return, or affidavit?",
    te: "మీ వద్ద ప్రస్తుత జీతం స్లిప్ (Salary Slip), ఐటి రిటర్న్ లేదా అఫిడవిట్ ఉందా?",
    hi: "क्या आपके पास वर्तमान वेतन पर्ची, आईटी रिटर्न या हलफनामा (Affidavit) है?",
    kn: "ನಿಮ್ಮ ಬಳಿ ಪ್ರಸ್ತುತ ಸಂಬಳದ ಚೀಟಿ (Salary Slip), ಐಟಿ ರಿಟರ್ನ್ ಅಥವಾ ಪ್ರಮಾಣಪತ್ರ ಇದೆಯೇ?",
  },
  family_income: {
    en: "What is your total annual household income?",
    te: "మీకు లేదా మీ కుటుంబ వార్షిక ఆదాయం ఎంత?",
    hi: "आपके परिवार की कुल वार्षिक आय कितनी है?",
    kn: "ನಿಮ್ಮ ಕುಟುಂಬದ ಒಟ್ಟು ವಾರ್ಷಿಕ ಆದಾಯ ಎಷ್ಟು?",
  },
  is_female_owner: {
    en: "Is the house being registered in the name of a female family member?",
    te: "ఇల్లు మీ కుటుంబంలోని మహిళా సభ్యురాలి పేరు మీద రిజిస్టర్ చేయబడుతుందా?",
    hi: "क्या घर परिवार की किसी महिला सदस्य के नाम पर पंजीकृत किया जा रहा है?",
    kn: "ಮನೆಯನ್ನು ನಿಮ್ಮ ಕುಟುಂಬದ ಮಹಿಳಾ ಸದಸ್ಯರ ಹೆಸರಿನಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆಯೇ?",
  },
  has_white_ration_card: {
    en: "Do you have a valid White Ration Card issued by Telangana?",
    te: "తెలంగాణ ప్రభుత్వం జారీ చేసిన తెల్ల రేషన్ కార్డ్ మీ వద్ద ఉందా?",
    hi: "क्या आपके पास तेलंगाना सरकार द्वारा जारी वैध सफेद राशन कार्ड है?",
    kn: "ತೆಲಂಗಾಣ ಸರ್ಕಾರದಿಂದ ನೀಡಲಾದ ಬಿಳಿ ರೇಷನ್ ಕಾರ್ಡ್ ನಿಮ್ಮ ಬಳಿ ಇದೆಯೇ?",
  },
  is_covered_procedure: {
    en: "Is the required medical procedure covered under Aarogyasri packages?",
    te: "మీకు కావలసిన వైద్య చికిత్స ఆరోగ్యశ్రీ ప్యాకేజీల క్రింద చేర్చబడిందా?",
    hi: "क्या आवश्यक चिकित्सा प्रक्रिया आरोग्यश्री पैकेजों के अंतर्गत आती है?",
    kn: "ನಿಮಗೆ ಬೇಕಾದ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ ಆರೋಗ್ಯಶ್ರೀ ಪ್ಯಾಕೇಜ್ ಅಡಿಯಲ್ಲಿ ಒಳಪಡುತ್ತದೆಯೇ?",
  },
  education_level: {
    en: "What is your current education level?",
    te: "మీ ప్రస్తుత విద్యార్హత ఏమిటి?",
    hi: "आपकी वर्तमान शिक्षा का स्तर क्या है?",
    kn: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಶಿಕ್ಷಣದ ಹಂತ ಯಾವುದು?",
  },
  previous_marks_percentage: {
    en: "What was your percentage in the previous academic year?",
    te: "గత విద్యా సంవత్సరంలో మీకు వచ్చిన మార్కుల శాతం ఎంత?",
    hi: "पिछले शैक्षणिक वर्ष में आपका प्रतिशत कितना था?",
    kn: "ಕಳೆದ ಶೈಕ್ಷಣಿಕ ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ಅಂಕಗಳ ಶೇಕಡಾವಾರು ಎಷ್ಟು?",
  },
  social_category: {
    en: "What is your social category? (SC, ST, BC, OBC, Minority, or General)",
    te: "మీ సామాజిక వర్గం ఏమిటి? (SC, ST, BC, OBC, Minority, లేదా General)",
    hi: "आपकी सामाजिक श्रेणी क्या है? (SC, ST, BC, OBC, Minority, या General)",
    kn: "ನಿಮ್ಮ ಸಾಮಾಜಿಕ ವರ್ಗ ಯಾವುದು? (SC, ST, BC, OBC, Minority, ಅಥವಾ General)",
  },
  admission_type: {
    en: "Was your admission through Convenor Quota (Regular) or Management Quota?",
    te: "మీ ప్రవేశం కన్వీనర్ కోటా ద్వారా జరిగిందా లేదా మేనేజ్‌మెంట్ కోటా ద్వారా జరిగిందా?",
    hi: "क्या आपका प्रवेश कन्वेनर कोटा या मैनेजमेंट कोटा के माध्यम से हुआ था?",
    kn: "ನಿಮ್ಮ ಪ್ರವೇಶ ಕನ್ವೀನರ್ ಕೋಟಾ ಅಥವಾ ಮ್ಯಾನೇಜ್ಮೆಂಟ್ ಕೋಟಾ ಮೂಲಕ ಆಗಿದೆಯೇ?",
  },
  attendance_above_75: {
    en: "Is your current college attendance above 75%?",
    te: "మీ ప్రస్తుత కాలేజీ హాజరు శాతం 75% కంటే ఎక్కువగా ఉందా?",
    hi: "क्या आपकी कॉलेज में उपस्थिति 75% से अधिक है?",
    kn: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಕಾಲೇಜು ಹಾಜರಾತಿ ಶೇಕಡಾ 75 ಕ್ಕಿಂತ ಹೆಚ್ಚಿದೆಯೇ?",
  },
  bride_age: {
    en: "What is the bride's exact age on the date of marriage?",
    te: "వివాహ తేదీ నాటికి వధువు వయస్సు ఎంత?",
    hi: "शादी की तारीख को दुल्हन की सही उम्र क्या है?",
    kn: "ಮದುವೆಯ ದಿನಾಂಕದಂದು ವಧುವಿನ ನಿಖರವಾದ ವಯಸ್ಸು ಎಷ್ಟು?",
  },
  parents_income: {
    en: "What is the total annual income of the bride's parents?",
    te: "వధువు తల్లిదండ్రుల మొత్తం వార్షిక ఆదాయం ఎంత?",
    hi: "दुह्लन के माता-पिता की कुल वार्षिक आय कितनी है?",
    kn: "ವಧುವಿನ ತಂದೆ ತಾಯಿಯ ಒಟ್ಟು ವಾರ್ಷಿಕ ಆದಾಯ ಎಷ್ಟು?",
  },
  has_govt_employee: {
    en: "Is anyone in your immediate family a government employee?",
    te: "మీకు లేదా మీ కుటుంబానికి ప్రభుత్వ ఉద్యోగిగా ఉన్నారా?",
    hi: "क्या आपके परिवार में कोई सरकारी कर्मचारी है?",
    kn: "ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಯಾರಾದರೂ ಸರ್ಕಾರಿ ನೌಕರರಾಗಿದ್ದಾರೆಯೇ?",
  },
  marriage_date: {
    en: "What was the date of the marriage? (YYYY-MM-DD)",
    te: "వివాహ తేదీ ఏమిటి? (YYYY-MM-DD)",
    hi: "शादी की तारीख क्या थी? (YYYY-MM-DD)",
    kn: "ಮದುವೆಯಾದ ದಿನಾಂಕ ಯಾವುದು? (YYYY-MM-DD)",
  },
  sector_type: {
    en: "What type of business are you starting? (Manufacturing or Service)",
    te: "మీరు ప్రారంభించబోయే వ్యాపారం ఏ రకానికి చెందినది? (Manufacturing లేదా Service)",
    hi: "आप किस प्रकार का व्यवसाय शुरू कर रहे हैं? (Manufacturing या Service)",
    kn: "ನೀವು ಯಾವ ರೀತಿಯ ವ್ಯವಹಾರವನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತಿದ್ದೀರಿ? (ತಯಾರಿಕೆ ಅಥವಾ ಸೇವೆ)",
  },
  project_cost: {
    en: "What is the total estimated project cost?",
    te: "మీ ప్రాజెక్ట్ అంచనా వ్యయం ఎంత?",
    hi: "परियोजना की कुल अनुमानित लागत कितनी है?",
    kn: "ಯೋಜನೆಯ ಒಟ್ಟು ಅಂದಾಜು ವೆಚ್ಚ ಎಷ್ಟು?",
  },
  has_family_caste_cert: {
    en: "Do any of your immediate family members already hold a digital caste certificate?",
    te: "మీకు లేదా మీ కుటుంబానికి ఎవరికైనా ఇప్పటికే డిజిటల్ కుల ధృవీకరణ పత్రం ఉందా?",
    hi: "क्या आपके परिवार के किसी सदस्य के पास पहले से ही डिजिटल जाति प्रमाण पत्र है?",
    kn: "ನಿಮ್ಮ ಕುಟುಂಬದ ಸದಸ್ಯರಲ್ಲಿ ಯಾರಿಗಾದರೂ ಈಗಾಗಲೇ ಡಿಜಿಟಲ್ ಜಾತಿ ಪ್ರಮಾಣ ಪತ್ರ ಇದೆಯೇ?",
  },
  is_notified_crop: {
    en: "Are you cultivating a crop notified by the state government for this season?",
    te: "ఈ సీజన్‌కు ప్రభుత్వం ప్రకటించిన పంటను మీరు సాగు చేస్తున్నారా?",
    hi: "क्या आप इस मौसम के लिए राज्य सरकार द्वारा अधिसूचित फसल की खेती कर रहे हैं?",
    kn: "ಈ ಹಂಗಾಮಿನಲ್ಲಿ ಸರ್ಕಾರ ಘೋಷಿಸಿದ ಬೆಳೆಯನ್ನು ನೀವು ಬೆಳೆಯುತ್ತಿದ್ದೀರಾ?",
  },
  is_loanee_farmer: {
    en: "Are you a loanee farmer (do you hold a Kisan Credit Card - KCC)?",
    te: "మీరు లోన్ తీసుకున్న రైతులా (KCC ఉందా)?",
    hi: "क्या आप एक ऋणी किसान हैं (क्या आपके पास KCC है)?",
    kn: "ನೀವು ಸಾಲ ಪಡೆದ ರೈತರೇ (ನಿಮ್ಮ ಬಳಿ KCC ಇದೆಯೇ)?",
  },
  has_sowing_proof: {
    en: "Do you have the sowing certificate or land record proof?",
    te: "మీ వద్ద విత్తన ధృవీకరణ పత్రం లేదా భూమి రికార్డుల పత్రాలు ఉన్నాయా?",
    hi: "क्या आपके पास बुवाई प्रमाण पत्र या भूमि रिकॉर्ड प्रमाण है?",
    kn: "ನಿಮ್ಮ ಬಳಿ ಬಿತ್ತನೆ ಪ್ರಮಾಣ ಪತ್ರ ಅಥವಾ ದಾಖಲೆಗಳ ಪುರಾವೆ ಇದೆಯೇ?",
  },
  girl_child_age: {
    en: "What is the age of the girl child?",
    te: "ఆడపిల్ల వయస్సు ఎంత?",
    hi: "बालिका की आयु कितनी है?",
    kn: "ಹೆಣ್ಣು मಗುವಿನ ವಯಸ್ಸು ಎಷ್ಟು?",
  },
  existing_ssy_accounts: {
    en: "How many SSY accounts already exist in your family?",
    te: "మీకు లేదా మీ కుటుంబానికి ఎన్ని సుకన్య సమృద్ధి ఖాతాలు ఉన్నాయి?",
    hi: "आपके परिवार में पहले से कितने सुकन्या समृद्धि खाते हैं?",
    kn: "ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಈಗಾಗಲೇ ಎಷ್ಟು ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಖಾತೆಗಳು ಇವೆ?",
  },
  has_sadarem_cert: {
    en: "Do you have a valid SADAREM Certificate?",
    te: "మీ వద్ద సదరమ్ (SADAREM) సర్టిఫికేట్ ఉందా?",
    hi: "क्या आपके पास एक वैध सदारम (SADAREM) प्रमाण पत्र है?",
    kn: "ನಿಮ್ಮ ಬಳಿ ಮಾನ್ಯ ಸದರಂ (SADAREM) ಪ್ರಮಾಣ ಪತ್ರ ಇದೆಯೇ?",
  },
  disability_percentage: {
    en: "What is the disability percentage mentioned on your certificate?",
    te: "మీ సర్టిఫికేట్‌లో పేర్కొన్న వైకల్యం శాతం ఎంత?",
    hi: "आपके प्रमाण पत्र में उल्लिखित विकलांगता का प्रतिशत क्या है?",
    kn: "ನಿಮ್ಮ ಪ್ರಮಾಣ ಪತ್ರದಲ್ಲಿ ನಮೂದಿಸಲಾದ ವಿಕಲಾಂಗತೆಯ ಶೇಕಡಾವಾರು ಎಷ್ಟು?",
  },
  has_white_card: {
    en: "Do you have a White Ration Card?",
    te: "మీకు తెల్ల రేషన్ కార్డ్ ఉందా?",
    hi: "क्या आपके पास सफेद राशन कार्ड है?",
    kn: "ನಿಮ್ಮ ಬಳಿ ಬಿಳಿ ರೇಷನ್ ಕಾರ್ಡ್ ಇದೆಯೇ?",
  },
  family_annual_income: {
    en: "What is your total annual family income?",
    te: "మీ కుటుంబ మొత్తం వార్షిక ఆదాయం ఎంత?",
    hi: "आपके परिवार की कुल वार्षिक आय कितनी है?",
    kn: "ನಿಮ್ಮ ಕುಟುಂಬದ ಒಟ್ಟು ವಾರ್ಷಿಕ ಆದಾಯ ಎಷ್ಟು?",
  },
  wet_land_acres: {
    en: "How many acres of wet land do you own?",
    te: "మీకు ఎన్ని ఎకరాల మాగాణి భూమి ఉంది?",
    hi: "आपके पास कितने एकड़ सिंचित भूमि है?",
    kn: "ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಎಕರೆ ನೀರಾವರಿ ಜಮೀನು ಇದೆ?",
  },
  dry_land_acres: {
    en: "How many acres of dry land do you own?",
    te: "మీకు ఎన్ని ఎకరాల మెట్ట భూమి ఉంది?",
    hi: "आपके पास कितने एकड़ असिंचित भूमि है?",
    kn: "ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಎಕರೆ ಒಣ ಬೇಸಾಯದ ಜಮೀನು ಇದೆ?",
  },
  owns_car_or_taxpayer: {
    en: "Does anyone in your family pay income tax or own a four-wheeler?",
    te: "మీ కుటుంబంలో ఎవరైనా ఆదాయపు పన్ను చెల్లిస్తున్నారా లేదా కారు కలిగి ఉన్నారా?",
    hi: "क्या आपके परिवार में कोई आयकर देता है या चौपहिया वाहन का मालिक है?",
    kn: "ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಯಾರಾದರೂ ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿಸುತ್ತಾರೆಯೇ ಅಥವಾ ನಾಲ್ಕು ಚಕ್ರದ ವಾಹನ ಹೊಂದಿದ್ದಾರೆಯೇ?",
  },
};

export function detectUserLanguage(input: string): LanguageCode {
  const teRegex = /[ఁ-౿]/;
  const hiRegex = /[ऀ-ॿ]/;
  const knRegex = /[ಀ-೿]/;

  if (teRegex.test(input)) return "te";
  if (hiRegex.test(input)) return "hi";
  if (knRegex.test(input)) return "kn";

  const lower = input.toLowerCase();
  if (/\b(undhi|undha|avu|avunu|ledhu|ledu|kadh|kadhu|raithu|rythu|panta|illu|epass|aarogyasri|sada|sadarem)\b/.test(lower)) {
    return "te";
  }
  if (/\b(hai|haan|nahi|nahin|kisan|ghar|awas|yojana|paise|shadi|shaadi|mubarak|sarkari|naukri)\b/.test(lower)) {
    return "hi";
  }
  if (/\b(ide|illa|kannada|mane|raitha|krishi|hudugi|maduve|illave|ivattu|namaskara)\b/.test(lower)) {
    return "kn";
  }

  return "en";
}

export function detectLanguageSwitchRequest(input: string): LanguageCode | null {
  const lower = input.toLowerCase();
  if (/\b(speak in english|talk in english|english please|use english)\b/.test(lower)) {
    return "en";
  }
  if (/\b(speak in telugu|talk in telugu|telugu please|telugulo matladu|తెలుగులో|తెలుగు)\b/.test(lower)) {
    return "te";
  }
  if (/\b(speak in hindi|talk in hindi|hindi please|hindi mein|हिंदी में|हिंदी)\b/.test(lower)) {
    return "hi";
  }
  if (/\b(speak in kannada|talk in kannada|kannada please|kannadadalli|ಕನ್ನಡದಲ್ಲಿ|ಕನ್ನಡ)\b/.test(lower)) {
    return "kn";
  }
  return null;
}

const casualResponders: Record<string, Record<LanguageCode, string[]>> = {
  greeting_hi: {
    en: ["Hey! 👋 How are you doing today?", "Hi! How is your day going?", "Hello! How can I help you today?"],
    te: ["నమస్కారం! 👋 ఈ రోజు మీరెలా ఉన్నారు?", "హలో! ఈ రోజు మీకు ఏ సమాచారం కావాలి?"],
    hi: ["नमस्ते! 👋 आज आप कैसे हैं?", "हेलो! आज आपके लिए क्या करूँ?"],
    kn: ["ನಮಸ್ಕಾರ! 👋 ಇಂದು ನೀವು ಹೇಗಿದ್ದೀರಾ?", "ಹಲೋ! ಇಂದು ನಿಮಗೆ ಹೇಗೆ ನೆರವಾಗಲಿ?"]
  },
  greeting_hello: {
    en: ["Hi! I'm here to help with government services. What would you like to do?", "Hello! What can I check for you today?"],
    te: ["హలో! నేను మీకు ప్రభుత్వ సేవలతో సహాయం చేయడానికి ఇక్కడ ఉన్నాను.", "నమస్కారం! ఈ రోజు మీ అవసరమేమిటి?"],
    hi: ["हाय! मैं सरकारी सेवाओं में आपकी मदद के लिए यहाँ हूँ।", "नमस्ते! आज क्या करना चाहेंगे?"],
    kn: ["ಹಲೋ! ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಪಡೆಯಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.", "ನಮಸ್ಕಾರ! ಇಂದು ಯಾವ ಮಾಹಿತಿ ಬೇಕು?"]
  },
  greeting_general: {
    en: ["Namaste! 👋 I am here to help you discover and apply for schemes. How can I assist you?"],
    te: ["నమస్కారం! 👋 పథకాలను కనుగొనడంలో నేను మీకు సహాయం చేస్తాను. ఎలా సహాయపడగలను?"],
    hi: ["नमस्ते! 👋 मैं सरकारी योजनाओं को खोजने में आपकी मदद के लिए हूँ। आज क्या सेवा करूँ?"],
    kn: ["ನಮಸ್ಕಾರ! 👋 ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"]
  },
  know_schemes: {
    en: ["Sure! 😊 I cover education, healthcare, housing, farming, and pension schemes. What are you looking for?"],
    te: ["తప్పకుండా! 😊 విద్య, ఆరోగ్యం, ఇల్లు, వ్యవసాయం మరియు పింఛన్ పథకాలు ఉన్నాయి. మీకు ఏది కావాలి?"],
    hi: ["बिल्कुल! 😊 शिक्षा, स्वास्थ्य, आवास, खेती और पेंशन योजनाएं हैं। आप क्या जानना चाहते हैं?"],
    kn: ["ಖಂಡಿತ! 😊 ಶಿಕ್ಷಣ, ವಸತಿ, ಕೃಷಿ ಮತ್ತು ಪಿಂಚಣಿ ಯೋಜನೆಗಳಿವೆ. ನಿಮಗೆ ಯಾವುದು ಬೇಕು?"]
  },
  how_it_works: {
    en: ["It's simple. You tell me what you need, I ask key questions, check eligibility, and help you apply. One question at a time!"],
    te: ["ఇది చాలా సులభం. మీకు కావాల్సింది చెప్పండి, నేను కొన్ని ప్రశ్నలు అడిగి, అర్హత చూసి దరఖాస్తు చేస్తాను."],
    hi: ["यह बहुत आसान है। आप जरूरत बताएं, मैं कुछ सवाल पूछूंगा, पात्रता जांचूंगा और आवेदन करवाऊंगा।"],
    kn: ["ತುಂಬಾ ಸರಳ. ಅಗತ್ಯ ತಿಳಿಸಿ, ಪ್ರಶ್ನೆ ಕೇಳಿ ಅರ್ಹತೆ ನೋಡಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನೆರವಾಗುವೆ."]
  },
  exploring: {
    en: ["No problem! 😊 Ask about any service or tell me your situation to find matching schemes."],
    te: ["పర్వాలేదు! 😊 ఏ సేవ గురించి అయినా అడగండి లేదా మీ పరిస్థితి చెప్పండి."],
    hi: ["कोई बात नहीं! 😊 किसी भी सेवा के बारे में पूछें या अपनी स्थिति बताएं।"],
    kn: ["ತೊಂದರೆಯಿಲ್ಲ! 😊 ಯಾವುದೇ ಸೌಲಭ್ಯದ ಬಗ್ಗೆ ಕೇಳಿ ಅಥವಾ ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿ ತಿಳಿಸಿ."]
  },
  how_are_you: {
    en: ["I'm doing great, thanks! Ready to help you with government benefits or just have a chat."],
    te: ["నేను బాగున్నాను, ధన్యవాదాలు! ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?"],
    hi: ["मैं बहुत अच्छा हूँ, धन्यवाद! आज क्या सहायता करूँ?"],
    kn: ["ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು! ಇಂದು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"]
  },
  who_are_you: {
    en: ["I am SamanvAI, your AI companion. I help you discover and apply for government schemes easily."],
    te: ["నేను SamanvAI, మీ AI భాగస్వామిని. పథకాల సమాచారం మరియు దరఖాస్తులలో సహాయపడతాను."],
    hi: ["मैं SamanvAI हूँ, आपका AI साथी। मैं सरकारी योजनाओं के आवेदन में मदद करता हूँ।"],
    kn: ["ನಾನು SamanvAI, ನಿಮ್ಮ AI ಗೆಳೆಯ. ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಮತ್ತು ದರಖಾಸ್ತು ಮಾಡಲು ನೆರವಾಗುವೆ."]
  },
  joke: {
    en: ["Why don't scientists trust atoms? Because they make up everything! 😄 What scheme details shall we check?"],
    te: ["కంప్యూటర్కు జ్వరం వస్తే ఎక్కడికి తీసుకెళ్తారు? యాంటీవైరస్ దగ్గరికి! 😄 ఏ పథకం చూద్దాం?"],
    hi: ["तकनीक से आप चुटकुले पढ़ते हैं, और विज्ञान से कंप्यूटर चलता है! 😄 सरकारी योजना देखें?"],
    kn: ["ಕಂಪ್ಯೂಟರ್ ವೈದ್ಯರ ಬಳಿ ಏಕೆ ಹೋಯಿತು? ಅದಕ್ಕೆ ವೈರಸ್ ತಗುಲಿತ್ತು! 😄 ಯಾವುದೇ ಯೋಜನೆ ನೋಡೋಣವೇ?"]
  },
  thanks: {
    en: ["You're welcome! I'm happy to help. Let me know if you need anything else."],
    te: ["ధన్యవాదాలు! సహాయపడటం నాకెంతో సంతోషం. ఇంకేమైనా కావాలా?"],
    hi: ["आपका स्वागत है! मुझे मदद करके खुशी हुई। क्या कुछ और चाहिए?"],
    kn: ["ಧನ್ಯವಾದಗಳು! ಸಹಾಯ ಮಾಡಲು ಸಂತೋಷವಾಗಿದೆ. ಬೇರೇನಾದರೂ ಬೇಕೆ?"]
  },
  positive_feedback: {
    en: ["Awesome! Glad to hear that. What should we look at next?"],
    te: ["చాలా మంచిది! తదుపరి ఏ అంశం చూద్దాం?"],
    hi: ["बहुत बढ़िया! अब आगे क्या करना चाहेंगे?"],
    kn: ["ಅತ್ಯುತ್ತಮ! ಮುಂದೆ ಏನು ಮಾಡೋಣ?"]
  },
  empathy: {
    en: ["I am deeply sorry for your loss. Please stay strong. I can help find welfare benefits and pensions (like Aasara Pension) for your family."],
    te: ["మీ నష్టానికి విచారిస్తున్నాను. ధైర్యంగా ఉండండి. మీ కుటుంబానికి ఆసరా పింఛను వంటి పథకాలు చూద్దాం."],
    hi: ["दुख हुआ सुनकर, हिम्मत रखें। मैं आपके परिवार के लिए आसरा पेंशन जैसी योजनाएं ढूंढ सकता हूँ।"],
    kn: ["ತೀವ್ರ ಸಂತಾಪಗಳು, ಧೈರ್ಯವಾಗಿರಿ. ಆಸರಾ ಪಿಂಚಣಿಯಂತಹ ಸೌಲಭ್ಯಗಳ ಮಾಹಿತಿ ಒದಗಿಸುವೆ."]
  },
  unknown: {
    en: ["I can help with PM-KISAN, PMAY, Ayushman Bharat, Aarogyasri, Rythu Bharosa, Amma Vodi, Vidya Deevena, YSR Cheyutha, EBC Nestham, and Ujjwala. How can I assist you with these?"],
    te: ["నేను PM-KISAN, PMAY, ఆయుష్మాన్ భారత్, ఆరోగ్యశ్రీ, రైతు భరోసా, అమ్మ ఒడి, విద్యా దీవెన, YSR చేయూత, EBC నేస్తం మరియు ఉజ్వల పథకాలకు సహాయం చేయగలను. నేను మీకు ఎలా సహాయపడగలను?"],
    hi: ["मैं पीएम-किसान, पीएमएवाई, आयुष्मान भारत, आरोग्यश्री, रायथू भरोसा, अम्मा वोडी, विद्या दीवेना, वाईएसआर चेयुथा, ईबीसी नेस्तम और उज्ज्वला योजनाओं में मदद कर सकता हूँ। मैं आपकी कैसे मदद करूँ?"],
    kn: ["ನಾನು ಪಿಎಂ-ಕಿಸಾನ್, ಪಿಎಂಎವೈ, ಆಯುಷ್ಮಾನ್ ಭಾರತ್, ಆರೋಗ್ಯಶ್ರೀ, ರೈತ ಭರೋಸಾ, ಅಮ್ಮ ವೋಡಿ, ವಿದ್ಯಾ ದೀವೆನಾ, ವೈಎಸ್ಆರ್ ಚೇಯುತಾ, ಇಬಿಸಿ ನೇಸ್ತಮ್ ಮತ್ತು ಉಜ್ವಲ ಯೋಜನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"]
  },
};

const applyQuestion: Record<LanguageCode, string> = {
  en: "Would you like to apply for this scheme?",
  te: "మీరు ఈ పథకం కొరకు దరఖాస్తు చేయాలనుకుంటున్నారా?",
  hi: "क्या आप इस योजना के लिए आवेदन करना चाहते हैं?",
  kn: "ನೀವು ಈ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುವಿರಾ?",
};

export function formatKnownSchemeDetails(item: KnowledgeItem, language: LanguageCode): string {
  const sections: string[] = [];

  const headers: Record<string, Record<LanguageCode, string>> = {
    overview: { en: "**Scheme Overview:**", te: "**పథకం అవలోకనం:**", hi: "**योजना का अवलोकन:**", kn: "**ಯೋಜನೆಯ ಅವಲೋಕನ:**" },
    benefits: { en: "**Benefits:**", te: "**పథకం ప్రయోజనాలు:**", hi: "**योजना के लाभ:**", kn: "**ಯೋಜನೆಯ ಪ್ರಯೋಜನಗಳು:**" },
    eligibility: { en: "**Eligibility Criteria:**", te: "**అర్హత ప్రమాణాలు:**", hi: "**पात्रता मानदंड:**", kn: "**ಅರ್ಹತಾ ನಿಯಮಗಳು:**" },
    documents: { en: "**Required Documents:**", te: "**కావలసిన పత్రాలు:**", hi: "**आवश्यक दस्तावेज:**", kn: "**ಅಗತ್ಯ ದಾಖಲೆಗಳು:**" },
    process: { en: "**Application Process:**", te: "**దరఖాస్తు విధానం:**", hi: "**आवेदन प्रक्रिया:**", kn: "**ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ:**" },
    faqs: { en: "**FAQs & Rejection Reasons:**", te: "**FAQs & తిరస్కరణకు కారణాలు:**", hi: "**पूछे जाने वाले प्रश्न और अस्वीकृति के कारण:**", kn: "**ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ತಿರಸ್ಕಾರದ ಕಾರಣಗಳು:**" },
  };

  const intro = `${headers.overview[language] || headers.overview.en}\n- **Name:** ${item.name}\n- **Department:** ${item.department}\n- **Objective:** ${item.objective}\n- **Target Beneficiaries:** ${item.targetBeneficiaries}`;
  sections.push(intro);

  sections.push(`${headers.benefits[language] || headers.benefits.en}\n` + item.benefits.map((b) => `- ${b}`).join("\n"));
  sections.push(`${headers.eligibility[language] || headers.eligibility.en}\n` + item.eligibility.map((e) => `- ${e}`).join("\n"));
  sections.push(`${headers.documents[language] || headers.documents.en}\n` + item.documents.map((d) => `- ${d.name} (${d.requirement})`).join("\n"));
  sections.push(`${headers.process[language] || headers.process.en}\n` + item.workflow.map((w) => `- ${w}`).join("\n"));
  
  const faqsText = `${headers.faqs[language] || headers.faqs.en}\n- **Common Rejection Reasons:** ${item.rejectionReasons.join(" / ")}\n- **Grievance Redressal:** ${item.grievance}`;
  sections.push(faqsText);

  const promptApply: Record<LanguageCode, string> = {
    en: "\nWould you like to check your eligibility or apply now?",
    te: "\nమీరు మీ అర్హతను సరిచూసుకోవాలా లేదా ఇప్పుడే దరఖాస్తు చేసుకోవాలనుకుంటున్నారా?",
    hi: "\nक्या आप अपनी पात्रता की जांच करना चाहते हैं या अभी आवेदन करना चाहते हैं?",
    kn: "\nನೀವು ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುವಿರಾ ಅಥವಾ ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುವಿರಾ?",
  };
  sections.push(promptApply[language] || promptApply.en);

  return sections.join("\n\n");
}

// Gets the next missing question dynamically split by eligibility & application stages
export function getNextConversationalQuestion(item: KnowledgeItem, facts: ProfileFacts, language: LanguageCode) {
  const isChecking = facts.checking_eligibility === true || String(facts.checking_eligibility) === "true";
  const isApplying = facts.agreed_to_apply === true || String(facts.agreed_to_apply) === "true";

  if (!isChecking && !isApplying) {
    return undefined; // Do not ask any conversational questions yet
  }

  // 1. Regional eligibility fields first
  if (facts.state === undefined || facts.state === "") {
    return {
      key: "state",
      question: baseQuestions.state[language],
      type: "text" as const,
    };
  }
  if (facts.district === undefined || facts.district === "") {
    return {
      key: "district",
      question: baseQuestions.district[language],
      type: "text" as const,
    };
  }

  // 2. Scheme-specific eligibility questions (only if checking or applying)
  const schemeQ = item.questions.find((q) => facts[q.key] === undefined);
  if (schemeQ) {
    return {
      key: schemeQ.key,
      question: localizedQuestions[schemeQ.key]?.[language] || schemeQ.question,
      type: schemeQ.type,
      choices: schemeQ.choices,
    };
  }

  // 3. Agreement step: ask if they want to apply (only if they checked eligibility and passed, but haven't agreed to apply yet)
  if (isChecking && !isApplying) {
    if (facts.agreed_to_apply === undefined || facts.agreed_to_apply === "") {
      return {
        key: "agreed_to_apply",
        question: applyQuestion[language],
        type: "text" as const,
        choices: ["Yes", "No"],
      };
    }
  }

  // 4. Personal details collection (only after agreement)
  if (isApplying) {
    const personalKeys = ["name", "date_of_birth", "gender", "address"];
    for (const key of personalKeys) {
      if (facts[key] === undefined || facts[key] === "") {
        return {
          key,
          question: baseQuestions[key][language],
          type: key === "date_of_birth" ? ("date" as const) : ("text" as const),
        };
      }
    }
  }

  return undefined;
}

function loadEnvLocal() {
  if (!process.env.GEMINI_API_KEY) {
    try {
      // Check .env.local in common directory levels
      const envPaths = [
        path.join(/*turbopackIgnore: true*/ process.cwd(), ".env.local"),
        path.join(/*turbopackIgnore: true*/ process.cwd(), "..", ".env.local"),
        path.join(/*turbopackIgnore: true*/ process.cwd(), "frontend", ".env.local"),
      ];
      for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf-8");
          const match = content.match(/GEMINI_API_KEY\s*=\s*(.+)/);
          if (match) {
            process.env.GEMINI_API_KEY = match[1].trim();
            console.log("Successfully loaded GEMINI_API_KEY from filesystem:", envPath);
            break;
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load .env.local from filesystem:", e);
    }
  }
}

export async function getSamanvaiResponse(
  message: string,
  history: Array<{ role: "citizen" | "assistant"; text: string }>,
  facts: ProfileFacts,
  ruleResult: {
    item?: KnowledgeItem;
    eligible?: boolean;
    nextQuestion?: KnowledgeItem["questions"][number];
    canApply: boolean;
  },
  language: LanguageCode
): Promise<SamanvaiResponse> {
  const trimmed = message.trim();
  const lowerMessage = trimmed.toLowerCase();

  // Load environment variables dynamically in case server was started without env loaded
  loadEnvLocal();

  // 1. Maintain same language or switch on explicit switch request
  let activeLanguage = (facts.active_conv_lang as LanguageCode) || language;
  const switchLanguage = detectLanguageSwitchRequest(trimmed);
  const updatedFacts = { ...facts };

  if (switchLanguage) {
    activeLanguage = switchLanguage;
    updatedFacts.active_conv_lang = switchLanguage;
  } else if (!facts.active_conv_lang) {
    const detected = detectUserLanguage(trimmed);
    activeLanguage = detected;
    updatedFacts.active_conv_lang = detected;
  }

  // 2. Empathetic checks for personal loss
  const lossKeywords = /\b(passed away|died|death|husband died|widow|chanipoyaru|chanipoyadu|maran|mar gaye|expired)\b/i;
  const isLossQuery = lossKeywords.test(lowerMessage);

  // 3. Greeting & Casual conversation checks
  const isHi = /^(hi|hey|yo|hello there|హాయ్|హలో|నమస్కారం|नमस्ते|हेलो|ನಮಸ್ಕಾರ|ಹಲೋ)$/i.test(trimmed);
  const isHello = /^(hello|hola|హలో|हेलो|ಹಲೋ)$/i.test(trimmed);
  const isGeneralGreeting = /^(namaste|namaskaram|namaskara|నమస్కారం|नमस्ते|ನಮಸ್ಕಾರ)$/i.test(trimmed);
  const isGreeting = isHi || isHello || isGeneralGreeting;

  let matchedItem = ruleResult.item;

  // Mode 1: Explicit Mention of Scheme
  const isExplicitSchemeMention = !updatedFacts.agreed_to_apply && (
    /\b(pm kisan|pm-kisan|aarogyasri|arogyasri|indiramma|indiramma illu|epass|telangana epass|kalyana lakshmi|pmegp|pmfby|sukanya|aasara|income certificate|caste certificate|ration card)\b/i.test(lowerMessage)
  );

  // If the citizen wants to discuss a scheme, discover it based on keywords or situations
  if (!matchedItem) {
    // 1. Crop insurance (PMFBY)
    if (/\b(insurance|crop loss|crop damage|weather|damage|rain|drought|flood|destroyed|bima|nastam|హాని|फ़सल बीमा|नुकसान)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("pmfby");
    }
    // 2. Aarogyasri (Healthcare)
    else if (/\b(medical|surgery|hospital|treatment|illness|disease|operation|aarogyasri|arogyasri|వైద్యం|ఆపరేషన్|ఆరోగ్యశ్రీ|ఆరోగ్యశ్రీ|इलाज|अस्पताल|ऑपरेशन)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("aarogyasri");
    }
    // 3. Kalyana Lakshmi (Marriage)
    else if (/\b(marriage|wedding|bride|groom|kalyana|shaadi|mubarak|పెళ్లి|మదువె|शादी|कन्यादान)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("kalyana-lakshmi");
    }
    // 4. Sukanya Samriddhi (Girl Savings)
    else if (/\b(girl child|daughter|saving|sukanya|ssy|ఆడపిల్ల|మగు|ಹೆಣ್ಣు|सुकನ್ಯ)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("sukanya");
    }
    // 5. Aasara Disability Pension (Handicapped)
    else if (/\b(disabled|disability|handicapped|blind|deaf|sadarem|pension|వికలాంగుల|అಂಗವಿಕಲ|विकलांग)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("aasara-disability");
    }
    // 6. Food Security Card / Ration Card
    else if (/\b(ration|cheap rice|ration shop|food card|fsc|బియ్యం|రేషన్|ರೇಷన్|ರಾಶನ್|ರಾಷನ್|राशन)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("ration-card");
    }
    // 7. Indiramma Illu (State housing) vs PMAY-U 2.0 (Central housing)
    else if (/\b(house|home|pucca|building|indiramma|indlu|pmay|awas|ఇల్లు|మనే|घर)\b/i.test(lowerMessage) || /\b(homeless|no house|build house|need a home|poor housing)\b/i.test(lowerMessage)) {
      if (lowerMessage.includes("telangana") || lowerMessage.includes("state") || lowerMessage.includes("indiramma") || lowerMessage.includes("indlu") || lowerMessage.includes("village")) {
        matchedItem = getKnowledgeItem("indiramma-illu");
      } else {
        matchedItem = getKnowledgeItem("pmay-u-2");
      }
    }
    // 8. PM-KISAN (Farmers)
    else if (/\b(farm|farmer|agri|pm kisan|land|pmkisan|fertilizer|seed|crops|రైతు|వ్యవసాయం|ರైత|ಕೃషి|किसान|खेती)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("pmkisan");
    }
    // 9. ePASS (TS scholarship) vs Post-Matric (Central scholarship)
    else if (/\b(scholarship|post matric|epass|reimbursement|sc schol|st schol|degree|college fees|study after 10th|fees|ವಿದ್ಯಾರ್ಥిವೇತನ|ಚುಟುಕು|ಚುಟುಕು|छात्रवृत्ति)\b/i.test(lowerMessage)) {
      if (lowerMessage.includes("telangana") || lowerMessage.includes("epass") || lowerMessage.includes("ts")) {
        matchedItem = getKnowledgeItem("telangana-epass");
      } else {
        matchedItem = getKnowledgeItem("post-matric-scholarship");
      }
    }
    // 10. PMEGP (Business Loans)
    else if (/\b(business|loan|startup|pmegp|self employ|shop|open shop|entrepreneur|పరిశ్రమ|ಉದ್ಯೋಗ|ಲೋನ್|लोन)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("pmegp");
    }
    // 11. Income Certificate
    else if (/\b(income cert|income proof|family income|ఆదాయ|ఆదాయ|वार्षिक आय)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("income-certificate");
    }
    // 12. Caste Certificate
    else if (/\b(caste|community|sc cert|st cert|bc cert|కుల|జాతి|जाति)\b/i.test(lowerMessage)) {
      matchedItem = getKnowledgeItem("caste-certificate");
    }
  }

  // Mode 3: Category Based Query
  const isCategoryQuery = !matchedItem && (
    /\b(student|scholarship|study|education|ವಿದ್ಯಾರ್ಥಿ|छात्र)\b/i.test(lowerMessage) ||
    /\b(farmer|agriculture|farming|crop|land|ರೈತ|किसान)\b/i.test(lowerMessage) ||
    /\b(housing|house|home|building|pucca|ಮನೆ|घर)\b/i.test(lowerMessage) ||
    /\b(women|girl|female|daughter|marriage|wedding|ಮಹಿಳೆ|महिला)\b/i.test(lowerMessage) ||
    /\b(pension|disabled|disability|old age|widow|ಪಿಂಚಣಿ|पेंशन)\b/i.test(lowerMessage) ||
    /\b(view schemes|explore schemes|schemes)\b/i.test(lowerMessage)
  );

  let nextQ = matchedItem ? getNextConversationalQuestion(matchedItem, updatedFacts, activeLanguage) : undefined;
  let canApply = matchedItem ? nextQ === undefined && ruleResult.eligible !== false && (updatedFacts.agreed_to_apply === true || String(updatedFacts.agreed_to_apply) === "true") : false;

  // Progressive details request matching
  const isDetailsRequest = matchedItem && /\b(details|view details|about|explain|objective|department)\b/i.test(lowerMessage);
  const isDocsRequest = matchedItem && /\b(documents|required documents|proof|papers)\b/i.test(lowerMessage);
  const isCheckEligibilityRequest = matchedItem && /\b(check eligibility|eligibility|qualify|am i eligible|check eligibility details)\b/i.test(lowerMessage);
  const isBenefitsRequest = matchedItem && /\b(benefits|what do i get|incentives|amount|money)\b/i.test(lowerMessage);
  const isTrackRequest = matchedItem && /\b(track|track application|status)\b/i.test(lowerMessage);
  const isApplyRequest = matchedItem && /\b(apply|apply now|start application|submit)\b/i.test(lowerMessage);

  let apiStatusText = "";

  const isChecking = updatedFacts.checking_eligibility === true || String(updatedFacts.checking_eligibility) === "true";
  const isApplying = updatedFacts.agreed_to_apply === true || String(updatedFacts.agreed_to_apply) === "true";

  // Live LLM query (if Gemini API key is configured)
  if (process.env.GEMINI_API_KEY && !isChecking && !isApplying) {
    try {
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are the SAMANVAI AI Assistant, a friendly and professional government citizen service representative helping the citizen at an assistance counter.
Your tone must be warm, helpful, short, and professional.

CRITICAL CONVERSATIONAL & UX DIRECTIVES:
1. Respond naturally and conversationally. Do NOT behave like a rigid questionnaire. Keep your answers brief (under 2-3 sentences).
2. Acknowledge the user's previous answer warmly and conversationally (e.g., "Understood, thank you.", "Got it, thanks for confirming.") before asking the next question.
3. Ask exactly ONE question at a time. Never ask multiple questions.
4. ONLY ask the single next relevant question: "${nextQ ? nextQ.question : "None"}". Do NOT ask questions that have already been answered in the Current Facts.
5. Do NOT dump detailed scheme information (benefits, required documents, workflows) unless the user explicitly asks for it.
6. Understand natural language variations instead of expecting exact keywords (e.g., if a user replies "yes, I do" or "no, I don't own any land", map them correctly).
7. If suggestion chips or buttons are present, do NOT repeat their options in your text response.
8. Speak in the active language: ${activeLanguage}. If the citizen uses mixed language (Hinglish, Telglish, Kanglish), speak in that style naturally.

You must support three distinct interaction modes:
1. Mode 1 – Known Scheme: If the user explicitly mentions a scheme name (e.g. PM-KISAN, Aarogyasri, Indiramma Illu), display a concise summary first (under 2 lines) and do NOT overwhelm them with details. Suggest action options: ["Check Eligibility", "View Details", "Required Documents", "Apply Now"]. Do NOT start the application automatically (set agreed_to_apply to undefined).
2. Mode 2 – Situation Based: If the user describes their situation, collect ONLY the eligibility information, recommend matching schemes, and ask if they want to apply. Do NOT ask for Name, DOB, Address, Aadhaar until they say yes.
3. Mode 3 – Category Based: If the user asks about a category (e.g. student, farmer, housing, women, pensions), ask only the minimum questions needed (like State), filter and recommend relevant schemes, and ask if they want to explore or apply. Do NOT start the application automatically.

Rules of progressive disclosure:
- Keep responses short, easy to scan, bulleted, and mobile-friendly.
- Do not print all details, documents, and workflows at once unless the user clicks "View Details" or "Required Documents".
- Offer relevant suggestions in your JSON array: ["Check Eligibility", "View Details", "Required Documents", "Apply Now"].
- Speak in the active language: ${activeLanguage}. If the citizen uses mixed language, speak in that exact mixed style (Telglish, Hinglish, Kanglish) naturally.
- ONLY extract the fact corresponding to the current active question (Next Required Question: ${nextQ ? nextQ.question : "None"}). Never auto-fill other fields or infer details.

You MUST return a JSON object with this EXACT structure (no markdown wrappers like \`\`\`json, just raw JSON):
{
  "response": "Your short, 2-line acknowledgment and next question",
  "extractedFacts": {
    // Map of any newly declared facts you detected in this message (e.g., state: "Telangana")
  },
  "suggestions": [
    // Array of 2-4 strings representing next actions for suggestion chips
  ]
}`,
              },
              {
                text: `History: ${JSON.stringify(history.slice(-8))}
Current Facts: ${JSON.stringify(updatedFacts)}
Citizen's Latest Message: "${message}"`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = JSON.parse(text);
        if (parsed.response) {
          const cleanExtracted: ProfileFacts = {};
          if (nextQ && parsed.extractedFacts && parsed.extractedFacts[nextQ.key] !== undefined) {
            const validation = validateAndMapInput(nextQ.key, String(parsed.extractedFacts[nextQ.key]));
            if (validation.valid) {
              cleanExtracted[nextQ.key] = validation.value;
            }
          }
          const finalFacts = { ...updatedFacts, ...cleanExtracted };
          return {
            response: parsed.response,
            extractedFacts: finalFacts,
            itemId: matchedItem?.id,
            detectedLanguage: activeLanguage,
            canApply,
            nextQuestion: nextQ,
            suggestions: parsed.suggestions || [],
          };
        }
      } else {
        const errText = await res.text();
        let errMsg = "";
        try {
          errMsg = JSON.parse(errText).error?.message || "";
        } catch {}
        
        if (res.status === 429) {
          apiStatusText = `Your Gemini API key is configured and loaded successfully! 👍 However, the Google AI free tier rate limit was exceeded (Error 429: Too Many Requests).\n\n${errMsg || "Please wait a moment before trying again."}\n\nIn the meantime, my local engine is active to help you with government schemes!`;
        } else if (res.status === 400 || res.status === 403) {
          apiStatusText = `Your Gemini API key is configured, but Google returned an authentication error (Error ${res.status}: Invalid Key).\n\n${errMsg || "Please verify the key in your .env.local file."}`;
        } else {
          apiStatusText = `Gemini API call failed with status ${res.status}.\n\n${errMsg || "Falling back to local conversation engine."}`;
        }

        fs.writeFileSync(
          path.join(process.cwd(), "scratch", "debug_api_error.json"),
          JSON.stringify({ status: res.status, statusText: res.statusText, response: errText, key: process.env.GEMINI_API_KEY?.substring(0, 10) + "..." }, null, 2)
        );
      }
    } catch (e: any) {
      apiStatusText = `Failed to connect to the Gemini API due to a network error.\n\n${e.message || String(e)}`;
      fs.writeFileSync(
        path.join(process.cwd(), "scratch", "debug_api_error.json"),
        JSON.stringify({ error: e.message || String(e), stack: e.stack }, null, 2)
      );
      console.warn("Gemini API call failed, falling back to local conversation engine:", e);
    }
  }

  // --- LOCAL CONVERSATIONAL ENGINE FALLBACK ---
  const localExtractedFacts: ProfileFacts = {};

  // Apply inputs to active next question ONLY if it is asked and validated
  if (nextQ && !isDetailsRequest && !isDocsRequest && !isExplicitSchemeMention && !isCategoryQuery) {
    const key = nextQ.key;
    const validation = validateAndMapInput(key, message);
    if (validation.valid) {
      localExtractedFacts[key] = validation.value;
    }
  }

  const finalFacts = { ...updatedFacts, ...localExtractedFacts };

  if (isCheckEligibilityRequest) {
    finalFacts.checking_eligibility = true;
  }
  if (isApplyRequest) {
    finalFacts.agreed_to_apply = true;
  }

  // Re-evaluate next missing question with updated facts
  nextQ = matchedItem ? getNextConversationalQuestion(matchedItem, finalFacts, activeLanguage) : undefined;
  canApply = matchedItem ? nextQ === undefined && ruleResult.eligible !== false && (finalFacts.agreed_to_apply === true || String(finalFacts.agreed_to_apply) === "true") : false;

  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  let conversationText = "";
  let finalSuggestions: string[] = [];

  if (isChecking || isApplying) {
    if (ruleResult.eligible === false) {
      conversationText = `❌ Not Eligible\n\nUnfortunately, based on the information provided, you are not eligible for this scheme.`;
      finalSuggestions = ["Search Another Scheme"];
    } else if (canApply) {
      const reviewMsgs: Record<string, string> = {
        en: "Excellent! I have collected all details. Please review the live application form on the right and click submit to proceed.",
        te: "వివరాలన్నీ సేకరించబడ్డాయి. కుడి వైపున దరఖాస్తును తనిఖీ చేసి, సబ్మిట్ బటన్ నొక్కండి.",
        hi: "सभी विवरण एकत्र कर लिए गए हैं। कृपया दाईं ओर आवेदन पत्र की समीक्षा करें और सबमिट करें।",
        kn: "ಎಲ್ಲಾ ವಿವರ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ. ಬಲಭಾಗದಲ್ಲಿ ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಸಬ್ಮಿಟ್ ಮಾಡಿ.",
      };
      conversationText = reviewMsgs[activeLanguage] || reviewMsgs.en;
      finalSuggestions = [];
    } else if (nextQ) {
      if (nextQ.key === "agreed_to_apply") {
        conversationText = `✅ Eligible\n\nCongratulations! You are eligible for this scheme.\n\nWould you like to continue with the application?`;
        finalSuggestions = ["Apply Now", "Cancel"];
      } else {
        if (isCheckEligibilityRequest) {
          const schemeName = matchedItem?.name || "";
          const startMsgs: Record<LanguageCode, string> = {
            en: `Let's check your eligibility for **${schemeName}**. I'll ask you a few questions.\n\n${nextQ.question}`,
            te: `నేను **${schemeName}** కోసం మీ అర్హతను పరిశీలిస్తాను. కొన్ని ప్రశ్నలు అడుగుతాను.\n\n${nextQ.question}`,
            hi: `आइए **${schemeName}** के लिए आपकी पात्रता की जांच करें। मैं आपसे कुछ प्रश्न पूछूँगा।\n\n${nextQ.question}`,
            kn: `ನಿಮ್ಮ **${schemeName}** ಅರ್ಹತೆ ಪರಿಶೀಲಿಸೋಣ. ಕೆಲವು ಪ್ರಶ್ನೆ ಕೇಳುವೆ.\n\n${nextQ.question}`,
          };
          conversationText = startMsgs[activeLanguage] || startMsgs.en;
        } else {
          conversationText = nextQ.question;
        }
        finalSuggestions = nextQ.choices && nextQ.choices.length > 0 ? nextQ.choices : [];
      }
    }

    return {
      response: conversationText,
      extractedFacts: finalFacts,
      itemId: matchedItem?.id,
      detectedLanguage: activeLanguage,
      canApply,
      nextQuestion: nextQ,
      suggestions: finalSuggestions,
    };
  }

  // Fallback matching logic for casual chat
  let responseKey = "";
  if (isLossQuery) {
    responseKey = "empathy";
    if (!matchedItem) matchedItem = getKnowledgeItem("aasara-disability");
  } else if (isGreeting) {
    if (isHi) responseKey = "greeting_hi";
    else if (isHello) responseKey = "greeting_hello";
    else responseKey = "greeting_general";
  } else if (/\b(just to know about schemes|know about schemes|about schemes|any schemes|schemes available|available schemes)\b/i.test(lowerMessage)) {
    responseKey = "know_schemes";
  } else if (/\b(how do you work|how you work|how does this work|work details|how does it work)\b/i.test(lowerMessage)) {
    responseKey = "how_it_works";
  } else if (/\b(just exploring|just browsing|exploring|only exploring|i'm just exploring|im just exploring)\b/i.test(lowerMessage)) {
    responseKey = "exploring";
  } else if (/\b(how\s+are\s+you|how\s+is\s+it\s+going|how\s+are\s+you\s+doing|how\s+r\s+u|how\s+ru|how\s+are\s+u|how\s+ru\s+dng|how\s+r\s+u\s+dng|ela\s+unnavu|ela\s+unnar|kaise\s+ho|hegiddira)\b/i.test(lowerMessage)) {
    responseKey = "how_are_you";
  } else if (/\b(who are you|your name|what is samanvai|what are you|samanvai ante|సమన్వయ్|समनवय)\b/i.test(lowerMessage)) {
    responseKey = "who_are_you";
  } else if (/\b(joke|jokes|make me laugh|chutkula|kavitha|kavithalu|hasya|ಹಾಸ್ಯ|ಚುಟುಕು)\b/i.test(lowerMessage)) {
    responseKey = "joke";
  } else if (/\b(thank you|thanks|dhanyavad|shukriya|dhanyavadalu|dhanyavada)\b/i.test(lowerMessage)) {
    responseKey = "thanks";
  } else if (/\b(good|fine|great|awesome|ok|okay|cool|bagundi|sare|acha|theek|sari|ಚೆನ್ನಾಗಿದೆ|ಸರಿ)\b/i.test(lowerMessage)) {
    responseKey = "positive_feedback";
  }

  if (responseKey) {
    conversationText = getRandomElement(casualResponders[responseKey][activeLanguage] || casualResponders[responseKey]["en"]);
  }

  // MODE 1: Explicit Mention of Scheme
  if (matchedItem && isExplicitSchemeMention) {
    conversationText = {
      en: `**${matchedItem.name}** is managed by the ${matchedItem.department}.\n\nWhat would you like to do next?`,
      te: `**${matchedItem.name}** పథకం ${matchedItem.department} ద్వారా లభిస్తుంది.\n\nతదుపరి మీ ఉద్దేశం ఏమిటి?`,
      hi: `**${matchedItem.name}** योजना ${matchedItem.department} द्वारा संचालित है।\n\nआगे आप क्या करना चाहते हैं?`,
      kn: `**${matchedItem.name}** ಯೋಜನೆಯನ್ನು ${matchedItem.department} ಒದಗಿಸುತ್ತದೆ.\n\nಮುಂದೆ ನೀವು ಏನು ಮಾಡಲು ಬಯಸುವಿರಾ?`,
    }[activeLanguage] || "";
    
    finalSuggestions = ["Check Eligibility", "Apply", "Benefits", "Required Documents", "Track Application"];
  }
  // User selected "Check Eligibility" action
  else if (matchedItem && isCheckEligibilityRequest) {
    if (nextQ) {
      const startMsgs: Record<LanguageCode, string> = {
        en: `Let's check your eligibility for **${matchedItem.name}**. I'll ask you a few questions.\n\n${nextQ.question}`,
        te: `నేను **${matchedItem.name}** కోసం మీ అర్హతను పరిశీలిస్తాను. కొన్ని ప్రశ్నలు అడుగుతాను.\n\n${nextQ.question}`,
        hi: `आइए **${matchedItem.name}** के लिए आपकी पात्रता की जांच करें। मैं आपसे कुछ प्रश्न पूछूँगा।\n\n${nextQ.question}`,
        kn: `ನಿಮ್ಮ **${matchedItem.name}** ಅರ್ಹತೆ ಪರಿಶೀಲಿಸೋಣ. ಕೆಲವು ಪ್ರಶ್ನೆ ಕೇಳುವೆ.\n\n${nextQ.question}`,
      };
      conversationText = startMsgs[activeLanguage] || startMsgs.en;
    }
  }
  // User selected "View Details" or "Benefits" action
  else if (matchedItem && (isDetailsRequest || isBenefitsRequest)) {
    const detailsHeader: Record<LanguageCode, string> = {
      en: `**Objective:** ${matchedItem.objective}\n- **Benefits:**\n` + matchedItem.benefits.map(b => `  * ${b}`).join("\n"),
      te: `**లక్ష్యం:** ${matchedItem.objective}\n- **ప్రయోజనాలు:**\n` + matchedItem.benefits.map(b => `  * ${b}`).join("\n"),
      hi: `**उद्देश्य:** ${matchedItem.objective}\n- **लाभ:**\n` + matchedItem.benefits.map(b => `  * ${b}`).join("\n"),
      kn: `**ಉದ್ದೇಶ:** ${matchedItem.objective}\n- **ಪ್ರಯೋಜನಗಳು:**\n` + matchedItem.benefits.map(b => `  * ${b}`).join("\n"),
    };
    conversationText = detailsHeader[activeLanguage] || detailsHeader.en;
    finalSuggestions = ["Check Eligibility", "Apply", "Required Documents", "Track Application"];
  }
  // User selected "Required Documents" action
  else if (matchedItem && isDocsRequest) {
    const docsHeader: Record<LanguageCode, string> = {
      en: `**Required Documents for ${matchedItem.name}:**\n` + matchedItem.documents.map(d => `- ${d.name} (${d.requirement})`).join("\n"),
      te: `**${matchedItem.name} కొరకు కావలసిన పత్రాలు:**\n` + matchedItem.documents.map(d => `- ${d.name} (${d.requirement})`).join("\n"),
      hi: `**${matchedItem.name} के लिए आवश्यक दस्तावेज:**\n` + matchedItem.documents.map(d => `- ${d.name} (${d.requirement})`).join("\n"),
      kn: `**${matchedItem.name} ಗಾಗಿ ಅಗತ್ಯ ದಾಖಲೆಗಳು:**\n` + matchedItem.documents.map(d => `- ${d.name} (${d.requirement})`).join("\n"),
    };
    conversationText = docsHeader[activeLanguage] || docsHeader.en;
    finalSuggestions = ["Check Eligibility", "Apply", "Benefits", "Track Application"];
  }
  // User selected "Track Application" action
  else if (matchedItem && isTrackRequest) {
    const trackHeader: Record<LanguageCode, string> = {
      en: `To track your application, please enter your SAMANVAI Reference ID (e.g. SMV-${matchedItem.id.toUpperCase()}-YYYYMMDD-XXXXXX) in the chat.`,
      te: `మీ దరఖాస్తును ట్రాక్ చేయడానికి, చాట్‌లో మీ SAMANVAI రిఫరెన్స్ ID ని నమోదు చేయండి.`,
      hi: `अपने आवेदन को ट्रैक करने के लिए, कृपया चैट में अपना SAMANVAI संदर्भ आईडी दर्ज करें।`,
      kn: `ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ಚಾಟ್‌ನಲ್ಲಿ ನಿಮ್ಮ SAMANVAI ರೆಫರೆನ್ಸ್ ಐಡಿಯನ್ನು ನಮೂದಿಸಿ.`,
    };
    conversationText = trackHeader[activeLanguage] || trackHeader.en;
    finalSuggestions = ["Check Eligibility", "Apply", "Benefits", "Required Documents"];
  }
  // MODE 3: Category Based Query
  else if (isCategoryQuery) {
    let isStudent = /\b(student|scholarship|study|education|ವಿದ್ಯಾರ್ಥಿ|छात्र)\b/i.test(lowerMessage);
    let isFarmer = /\b(farmer|agriculture|farming|crop|land|ರೈత|किसान|view schemes)\b/i.test(lowerMessage);
    let isHousing = /\b(housing|house|home|building|pucca|ಮನೆ|घर)\b/i.test(lowerMessage);
    let isWomen = /\b(women|girl|female|daughter|marriage|wedding|ಮಹಿಳೆ|महिला)\b/i.test(lowerMessage);
    
    if (lowerMessage.includes("view schemes") || lowerMessage.includes("schemes")) {
      const historyStr = JSON.stringify(history).toLowerCase();
      if (historyStr.includes("farm") || historyStr.includes("agri") || historyStr.includes("kisan") || historyStr.includes("rythu") || historyStr.includes("crop")) {
        isFarmer = true;
      }
    }

    if (!finalFacts.state) {
      nextQ = { key: "state", question: baseQuestions.state[activeLanguage], type: "text" };
      const askState: Record<LanguageCode, string> = {
        en: "To suggest schemes, which state do you reside in?",
        te: "పథకాలను సూచించడానికి, మీరు ఏ రాష్ట్రంలో నివసిస్తున్నారు?",
        hi: "योजनाओं का सुझाव देने के लिए, आप किस राज्य में रहते हैं?",
        kn: "ಯೋಜನೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಲು, ನೀವು ಯಾವ ರಾಜ್ಯದಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದೀರಿ?",
      };
      conversationText = askState[activeLanguage] || askState.en;
    } else {
      const isTS = String(finalFacts.state).toLowerCase().includes("telangana") || String(finalFacts.state).toLowerCase().includes("ts");
      if (isStudent) {
        if (isTS) {
          conversationText = {
            en: "Student schemes in Telangana:\n- Post-Matric Scholarship (Central)\n- Telangana ePASS (State)\n\nWhich one would you like to explore?",
            te: "తెలంగాణలోని విద్యార్థి పథకాలు:\n- పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ (సెంట్రల్)\n- తెలంగాణ ఈపాస్ (స్టేట్)\n\nమీరు ఏది చూడాలనుకుంటున్నారు?",
            hi: "तेलंगाना में छात्र योजनाएं:\n- पोस्ट-मैट्रिक छात्रवृत्ति (केंद्रीय)\n- तेलंगाना ईपास (राज्य)\n\nआप कौन सी देखना चाहते हैं?",
            kn: "ತೆಲಂಗಾಣದಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿ ಯೋಜನೆಗಳು:\n- ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ (ಕೇಂದ್ರ)\n- ತೆಲಂಗಾಣ ಇ-ಪಾಸ್ (ರಾಜ್ಯ)\n\nಯಾವುದನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುವಿರಾ?",
          }[activeLanguage] || "";
          finalSuggestions = ["Post-Matric Scholarship", "Telangana ePASS"];
        } else {
          conversationText = {
            en: "Student scheme available:\n- Pradhan Mantri Post-Matric Scholarship (Central)\n\nWould you like to explore this?",
            te: "అందుబాటులో ఉన్న విద్యార్థి పథకం:\n- ప్రధాన్ మంత్రి పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ (సెంట్రల్)\n\nదీని గురించి తెలుసుకోవాలనుకుంటున్నారా?",
            hi: "उपलब्ध छात्र योजना इस प्रकार है:\n- प्रधानमंत्री पोस्ट-मैट्रिक छात्रवृत्ति (केंद्रीय)\n\nक्या आप इसकी जानकारी चाहते हैं?",
            kn: "ಲಭ್ಯವಿರುವ ವಿದ್ಯಾರ್ಥಿ ಯೋಜನೆ ಇಲ್ಲಿದೆ:\n- ಪ್ರಧಾನ ಮಂತ್ರಿ ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ (ಕೇಂದ್ರ)\n\nಇದನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುವಿರಾ?",
          }[activeLanguage] || "";
          finalSuggestions = ["Post-Matric Scholarship"];
        }
      } else if (isFarmer) {
        conversationText = {
          en: "Agricultural schemes available:\n- PM-KISAN (Farmer Income Support)\n- PMFBY (Crop Damage Insurance)\n\nWhich of these would you like to explore?",
          te: "లభించే వ్యవసాయ పథకాలు:\n- PM-KISAN (ఆదాయ సహాయం)\n- PMFBY (పంట నష్ట బీమా)\n\nమీరు దేని గురించి తెలుసుకోవాలనుకుంటున్నారు?",
          hi: "उपलब्ध कृषि योजनाएं:\n- पीएम-किसान (किसान सहायता)\n- पीएमएफबीवाई (फसल बीमा)\n\nआप किसके बारे में जानकारी चाहते हैं?",
          kn: "ಲಭ್ಯವಿರುವ ಕೃಷಿ ಯೋಜನೆಗಳು:\n- ಪಿಎಂ-ಕಿಸಾನ್ (ಕೃಷಿ ಸಹಾಯ)\n- ಪಿಎಂಎಫ್‌ಬಿವೈ (ಬೆಳೆ ವಿಮೆ)\n\nಯಾವುದರ ವಿವರ ಪಡೆಯಲು ಬಯಸುವಿರಾ?",
        }[activeLanguage] || "";
        finalSuggestions = ["PM-KISAN", "PMFBY"];
      } else if (isHousing) {
        if (isTS) {
          conversationText = {
            en: "Housing schemes in Telangana:\n- Indiramma Illu (State Free Housing)\n- PMAY-U 2.0 (Central Urban Housing subsidy)\n\nWhich one would you like to check?",
            te: "తెలంగాణలోని గృహనిర్మాణ పథకాలు:\n- ఇందిరమ్మ ఇల్లు (ఉచిత గృహ నిర్మాణం)\n- PMAY-U 2.0 (అర్బన్ హౌసింగ్ సబ్సిడీ)\n\nమీరు దేనిని పరిశీలించాలనుకుంటున్నారు?",
            hi: "तेलंगाना में आवास योजनाएं:\n- इंदिराम्मा इल्लु (निःशुल्क आवास)\n- पीएमएवाई-यू 2.0 (शहरी आवास सब्सिडी)\n\nआप किसकी जांच करना चाहते हैं?",
            kn: "ತೆಲಂಗಾಣದಲ್ಲಿ ವಸತಿ ಯೋಜನೆಗಳು:\n- ಇಂದಿರಮ್ಮ ಇಲ್ಲು (ರಾಜ್ಯ)\n- PMAY-U 2.0 (ನಗರ ವಸತಿ)\n\nಯಾವುದನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುವಿರಾ?",
          }[activeLanguage] || "";
          finalSuggestions = ["Indiramma Illu", "PMAY-U 2.0"];
        } else {
          conversationText = {
            en: "Housing scheme available:\n- Pradhan Mantri Awas Yojana Urban (PMAY-U 2.0)\n\nWould you like to explore this?",
            te: "అందుబాటులో ఉన్న గృహనిర్మాణ పథకం:\n- ప్రధాన మంత్రి ఆవాస్ యోజన అర్బన్ (PMAY-U 2.0)\n\nదీని గురించి తెలుసుకోవాలనుకుంటున్నారా?",
            hi: "उपलब्ध आवास योजना:\n- प्रधानमंत्री आवास योजना शहरी (पीएमएवाई-यू 2.0)\n\nक्या आप इसकी जानकारी चाहते हैं?",
            kn: "ಲಭ್ಯವಿರುವ ವಸತಿ ಯೋಜನೆ ಇಲ್ಲಿದೆ:\n- ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ ನಗರ (PMAY-U 2.0)\n\nಇದನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುವಿರಾ?",
          }[activeLanguage] || "";
          finalSuggestions = ["PMAY-U 2.0"];
        }
      } else if (isWomen) {
        conversationText = {
          en: "Schemes for women and girl children:\n- Kalyana Lakshmi / Shaadi Mubarak (Marriage Help)\n- Sukanya Samriddhi Yojana (SSY) (Savings scheme)\n\nWhich one do you choose?",
          te: "మహిళలు మరియు ఆడపిల్లల పథకాలు:\n- కళ్యాణ లక్ష్మి / షాదీ ముబారక్ (వివాహ సహాయం)\n- సుకన్య సమృద్ధి యోజన (పొదుపు పథకం)\n\nదేనిని ఎంచుకుంటారు?",
          hi: "महिलाओं और बालिकाओं के लिए योजनाएं:\n- कल्याण लक्ष्मी / शादी मुबारक (शादी के लिए सहायता)\n- सुकन्या समृद्धि योजना (एसएसवाई) (बचत योजना)\n\nआप किसे चुनते हैं?",
          kn: "ಮಹಿಳೆಯರು ಮತ್ತು ಹೆಣ್ಣು ಮಕ್ಕಳ ಯೋಜನೆಗಳು:\n- ಕಲ್ಯಾಣ ಲಕ್ಷ್ಮಿ / ಶಾದಿ ಮುಬಾರಕ್ (ಮದುವೆ ಸಹಾಯ)\n- ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ (ಉಳಿತಾಯ ಯೋಜನೆ)\n\nಯಾವುದನ್ನು ಆರಿಸಿಕೊಳ್ಳುವಿರಿ?",
        }[activeLanguage] || "";
        finalSuggestions = ["Kalyana Lakshmi", "Sukanya Samriddhi Yojana"];
      }
    }
  }
  // MODE 2: Situation Based Query or Active Workflow
  else if (matchedItem) {
    if (ruleResult.eligible === false) {
      const rejectMsgs: Record<string, string> = {
        en: "Based on rules, you do not qualify for this scheme.",
        te: "నిబంధనల ప్రకారం, మీరు ఈ పథకానికి అర్హులు కారు.",
        hi: "नियमों के अनुसार, आप इस योजना के लिए पात्र नहीं हैं।",
        kn: "ಅರ್ಹತಾ ನಿಯಮಗಳ ಪ್ರಕಾರ, ನೀವು ಈ ಯೋಜನೆಗೆ ಅರ್ಹರಾಗಿಲ್ಲ.",
      };
      conversationText += (conversationText ? "" : rejectMsgs[activeLanguage]) + "\n\n" + (matchedItem.rejectionReasons?.join("\n") || "");
    } else if (canApply) {
      const reviewMsgs: Record<string, string> = {
        en: "Excellent! I have collected all details. Please review the live application form on the right and click submit to proceed.",
        te: "వివరాలన్నీ సేకరించబడ్డాయి. కుడి వైపున దరఖాస్తును తనిఖీ చేసి, సబ్మిట్ బటన్ నొక్కండి.",
        hi: "सभी विवरण एकत्र कर लिए गए हैं। कृपया दाईं ओर आवेदन पत्र की समीक्षा करें और सबमिट करें।",
        kn: "ಎಲ್ಲಾ ವಿವರ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ. ಬಲಭಾಗದಲ್ಲಿ ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಸಬ್ಮಿಟ್ ಮಾಡಿ.",
      };
      conversationText += conversationText ? reviewMsgs[activeLanguage] : reviewMsgs[activeLanguage];
    } else if (nextQ) {
      if (nextQ.key === "agreed_to_apply") {
        const qualifyMsgs: Record<string, string> = {
          en: `Good news! You qualify for **${matchedItem.name}**. Would you like to apply?`,
          te: `మంచి వార్త! మీరు **${matchedItem.name}** కి అర్హులు. దరఖాస్తు చేయాలనుకుంటున్నారా?`,
          hi: `बड़ी खुशखबरी! आप **${matchedItem.name}** के लिए पात्र हैं। क्या आप आवेदन करना चाहते हैं?`,
          kn: `ಉತ್ತಮ ಸುದ್ದಿ! ನೀವು **${matchedItem.name}** ಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ. ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುವಿರಾ?`,
        };
        conversationText += qualifyMsgs[activeLanguage];
        finalSuggestions = ["🚀 Yes, Apply Now", "❌ No, Maybe Later"];
      } else {
        const acks: Record<string, string[]> = {
          en: [
            "Got it, thank you! Let's proceed to the next step.",
            "Understood, thanks for the detail. Next question:",
            "Perfect, that is noted. Moving forward:",
            "Thank you! Here is the next detail I need:"
          ],
          te: [
            "అర్థమైంది, ధన్యవాదాలు! తదుపరి సమాచారం చెప్పండి.",
            "సరే, గమనిಂಚాను. తర్వాత ప్రశ్న:",
            "చాలా మంచిది, ధన్యవాదాలు. ముందుకు వెళ్దాం:"
          ],
          hi: [
            "ठीक है, धन्यवाद! आइए अगले चरण पर चलें।",
            "समझ गया, जानकारी के लिए धन्यवाद। अगला प्रश्न:",
            "बहुत बढ़िया, नोट कर लिया गया है। आगे बढ़ते हैं:"
          ],
          kn: [
            "ತಿಳಿಯಿತು, ಧನ್ಯವಾದಗಳು! ಮುಂದಿನ ಹಂತಕ್ಕೆ ಹೋಗೋಣ.",
            "ಸರಿ, ಮಾಹಿತಿ ನೀಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು. ಮುಂದಿನ ಪ್ರಶ್ನೆ:",
            "ಉತ್ತಮ, ಗುರುತಿಸಲಾಗಿದೆ. ಮುಂದೆ ಹೋಗೋಣ:"
          ],
        };
        const randomAck = getRandomElement(acks[activeLanguage] || acks.en);
        const isFirstQuestion = history.length <= 1;

        if (isFirstQuestion) {
          conversationText += nextQ.question;
        } else {
          conversationText += `${randomAck}\n\n${nextQ.question}`;
        }
      }
    } else {
      conversationText += `${matchedItem.name}.\n\n${matchedItem.objective}`;
    }
  }

  if (!conversationText) {
    if (apiStatusText) {
      conversationText = apiStatusText;
    } else {
      conversationText = getRandomElement(casualResponders.unknown[activeLanguage] || casualResponders.unknown["en"]);
    }
  }

  return {
    response: conversationText,
    extractedFacts: finalFacts,
    itemId: matchedItem?.id,
    detectedLanguage: activeLanguage,
    canApply,
    nextQuestion: nextQ,
    suggestions: finalSuggestions,
  };
}
