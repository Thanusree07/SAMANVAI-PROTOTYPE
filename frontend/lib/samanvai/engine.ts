import { KnowledgeItem, LanguageCode, getKnowledgeItem, knowledgeBase } from "./knowledge";

export type ProfileFacts = Record<string, string | number | boolean>;

export type ApplicationRecord = {
  referenceId: string;
  itemId: string;
  itemName: string;
  status: string;
  internalStatus: string;
  governmentSyncedStatus: string;
  createdAt: string;
  updatedAt: string;
  facts: ProfileFacts;
  statusHistory: Array<{ status: string; at: string; note: string }>;
  documents: Array<{ name: string; status: string; source: string; manualUpload: string }>;
};

export type ConversationResult = {
  intent: string;
  detectedLanguage: LanguageCode;
  item?: KnowledgeItem;
  facts: ProfileFacts;
  eligible?: boolean;
  nextQuestion?: KnowledgeItem["questions"][number];
  response: string;
  recommendations: string[];
  canApply: boolean;
};

const serviceDiscoveryResponse =
  "I can help with Income Certificate, Caste or Community Certificate, Food Security Card, PM-KISAN, PMFBY, PMAY-U 2.0, Indiramma Illu, Aarogyasri, Post-Matric Scholarship, Kalyana Lakshmi, PMEGP, Sukanya Samriddhi, and Aasara Disability Pension. Tell me your need in your own words, and I will collect only the required details.";

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    eligible: "Based on the verified rules, you appear eligible.",
    notEligible: "Based on the verified rules, you are not eligible.",
    ask: "I need one required detail to continue:",
    apply: "Say 'apply' to generate a SAMANVAI reference ID and submit this workflow.",
    noMatch: serviceDiscoveryResponse,
    documents: "Required documents",
    workflow: "Workflow",
    benefits: "Benefits",
    recommendations: "Verified recommendations after this request",
    statusMissing: "Please enter a valid SAMANVAI reference ID, for example SMV-PMKISAN-YYYYMMDD-XXXXXX.",
  },
  te: {
    eligible: "ధృవీకరించిన నియమాల ప్రకారం, మీరు అర్హులుగా కనిపిస్తున్నారు.",
    notEligible: "ధృవీకరించిన నియమాల ప్రకారం, మీరు అర్హులు కాదు.",
    ask: "కొనసాగడానికి ఒక అవసరమైన వివరాన్ని చెప్పండి:",
    apply: "SAMANVAI రిఫరెన్స్ ID సృష్టించి దరఖాస్తు సమర్పించడానికి 'apply' అని చెప్పండి.",
    noMatch: "ధృవీకరించిన ప్రోటోటైప్ నాలెడ్జ్ బేస్‌లో ఈ సమాచారం ప్రస్తుతం అందుబాటులో లేదు. దయచేసి అధికారిక Government Portal ద్వారా నిర్ధారించండి.",
    documents: "అవసరమైన పత్రాలు",
    workflow: "ప్రక్రియ",
    benefits: "ప్రయోజనాలు",
    recommendations: "ఈ అభ్యర్థన తర్వాత ధృవీకరించిన సిఫార్సులు",
    statusMissing: "దయచేసి సరైన SAMANVAI రిఫరెన్స్ ID ఇవ్వండి, ఉదాహరణకు SMV-PMKISAN-YYYYMMDD-XXXXXX.",
  },
  hi: {
    eligible: "सत्यापित नियमों के अनुसार, आप पात्र प्रतीत होते हैं।",
    notEligible: "सत्यापित नियमों के अनुसार, आप पात्र नहीं हैं।",
    ask: "आगे बढ़ने के लिए एक आवश्यक जानकारी चाहिए:",
    apply: "SAMANVAI Reference ID बनाकर आवेदन जमा करने के लिए 'apply' लिखें।",
    noMatch: "यह जानकारी सत्यापित प्रोटोटाइप नॉलेज बेस में अभी उपलब्ध नहीं है। कृपया आधिकारिक Government Portal से सत्यापित करें।",
    documents: "आवश्यक दस्तावेज",
    workflow: "प्रक्रिया",
    benefits: "लाभ",
    recommendations: "इस अनुरोध के बाद सत्यापित सिफारिशें",
    statusMissing: "कृपया सही SAMANVAI Reference ID दें, जैसे SMV-PMKISAN-YYYYMMDD-XXXXXX.",
  },
  kn: {
    eligible: "ಅಧಿಕಾರಿಕ ನಿಯಮಗಳ ಪ್ರಕಾರ, ನೀವು ಅರ್ಹರಾಗಿರುತ್ತೀರಿ.",
    notEligible: "ಅಧಿಕಾರಿಕ ನಿಯಮಗಳ ಪ್ರಕಾರ, ನೀವು ಅರ್ಹರಾಗಿರುವುದಿಲ್ಲ.",
    ask: "ಮುಂದುವರಿಯಲು ನನಗೆ ಒಂದು ಅಗತ್ಯ ಮಾಹಿತಿ ಬೇಕು:",
    apply: "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಲು 'apply' ಎಂದು ಬರೆಯಿರಿ.",
    noMatch: serviceDiscoveryResponse,
    documents: "ಅಗತ್ಯ ದಾಖಲೆಗಳು",
    workflow: "ಕಾರ್ಯವಿಧಾನ",
    benefits: "ಪ್ರಯೋಜನಗಳು",
    recommendations: "ಈ ವಿನಂತಿಯ ನಂತರದ ನವೀಕೃತ ಶಿಫಾರಸುಗಳು",
    statusMissing: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ SAMANVAI Reference ID ನಮೂದಿಸಿ, ಉದಾಹರಣೆಗೆ SMV-PMKISAN-YYYYMMDD-XXXXXX.",
  },
};

const stopIfFalse: Record<string, string[]> = {
  owns_cultivable_land: ["pmkisan"],
  is_ts_resident: ["indiramma-illu", "aarogyasri"],
  has_bpl_card: ["indiramma-illu"],
  has_white_ration_card: ["aarogyasri"],
  is_covered_procedure: ["aarogyasri"],
  has_sadarem_cert: ["aasara-disability"],
  has_white_card: ["aasara-disability"],
  is_notified_crop: ["pmfby"],
  has_sowing_proof: ["pmfby"],
};

const stopIfTrue: Record<string, string[]> = {
  is_institutional_land: ["pmkisan"],
  paid_income_tax: ["pmkisan"],
  pension_over_10k: ["pmkisan"],
  is_registered_professional: ["pmkisan"],
  owns_pucca_house: ["indiramma-illu", "pmay-u-2"],
  received_prior_housing: ["indiramma-illu", "pmay-u-2"],
  has_govt_employee: ["kalyana-lakshmi"],
  owns_car_or_taxpayer: ["ration-card"],
};

export function detectLanguage(input: string): LanguageCode {
  if (/[ఁ-౿]/.test(input)) return "te";
  if (/[ऀ-ॿ]/.test(input)) return "hi";
  return "en";
}

export type UserIntent = "greeting" | "casual_chat" | "scheme_discovery" | "application_workflow" | "status_tracking";

export function classifyIntent(message: string, activeItemId?: string, lastQuestionKey?: string): UserIntent {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // 1. Status tracking check
  const hasRefId = /SMV-[A-Z0-9]+-\d{8}-[A-Z0-9]+/i.test(trimmed);
  if (hasRefId || /\b(check status|my status|application status|track status|track application)\b/i.test(lower)) {
    return "status_tracking";
  }

  // 2. Greeting check
  const greetings = /^(hi|hello|hey|yo|namaste|namaskaram|namaskara|hello there|హాయ్|హలో|నమస్కారం|नमस्ते|हेलो|ನಮಸ್ಕಾರ|ಹಲೋ)$/i;
  if (greetings.test(trimmed)) {
    return "greeting";
  }

  // 3. Casual chat / ask about assistant / humor check
  const casualWords = /\b(how\s+are\s+you|how\s+is\s+it\s+going|how\s+are\s+you\s+doing|how\s+r\s+u|how\s+ru|how\s+are\s+u|how\s+ru\s+dng|how\s+r\s+u\s+dng|who\s+are\s+you|your\s+name|what\s+is\s+samanvai|what\s+are\s+you|joke|jokes|make\s+me\s+laugh|thank\s+you|thanks|good|fine|great|awesome|ok|okay|cool|samanvai\s+ante|సమన్వయ్|సరే|బాగుంది|समनवय|अच्छा|ನಮಸ್ಕಾರ|ಸರಿ|ಹೇಗಿದ್ದೀರಾ)\b/i;
  if (casualWords.test(lower)) {
    return "casual_chat";
  }

  // 4. Scheme Discovery check (general questions about schemes)
  const discoveryPatterns = /\b(what schemes|list of schemes|show schemes|any schemes|available schemes|schemes for|help for|is there any|information about|tell me about)\b/i;
  const isExplicitApply = /\b(apply|register|start application|enroll|submit|sign up|need to apply|want to apply|i need|కావాలి|ಬೇಕು)\b/i.test(lower);

  if (discoveryPatterns.test(lower) && !isExplicitApply) {
    return "scheme_discovery";
  }

  // 5. Explicit workflow activation
  if (isExplicitApply) {
    return "application_workflow";
  }

  // 6. If we are currently in an active workflow
  if (activeItemId && lastQuestionKey) {
    return "application_workflow";
  }

  // Default to discovery if a scheme keyword matches, otherwise casual
  return "scheme_discovery";
}

export function findKnowledgeItem(input: string, preferredId?: string) {
  if (preferredId) return getKnowledgeItem(preferredId);
  const normalized = input.toLowerCase();
  
  // Only auto-trigger matching schemes if the user is explicitly requesting application/registration
  const isApplyRequest = /\b(apply|register|enroll|submit|want to|need to|need|i need|kaavali|కావాలి|ಬೇಕು)\b/i.test(normalized);
  if (!isApplyRequest) return undefined;

  return (
    knowledgeBase.find((item) => [item.name, ...item.aliases].some((alias) => normalized.includes(alias.toLowerCase()))) ||
    knowledgeBase.find((item) => normalized.includes(item.kind) || item.aliases.some((alias) => alias.split(" ").some((token) => token.length > 4 && normalized.includes(token.toLowerCase()))))
  );
}

export function validateAndMapInput(key: string, input: string): { valid: boolean; value?: any } {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  const booleanKeys = [
    "owns_cultivable_land", "is_institutional_land", "paid_income_tax",
    "pension_over_10k", "is_registered_professional", "is_ts_resident",
    "has_bpl_card", "owns_pucca_house", "received_prior_housing",
    "owns_plot", "has_income_proof", "is_female_owner",
    "has_white_ration_card", "is_covered_procedure", "attendance_above_75",
    "has_govt_employee", "has_family_caste_cert", "is_notified_crop",
    "is_loanee_farmer", "has_sowing_proof", "has_sadarem_cert",
    "has_white_card", "owns_car_or_taxpayer", "agreed_to_apply"
  ];
  if (booleanKeys.includes(key)) {
    const positive = /\b(yes|yeah|true|have|own|resident|avu|avunu|undhi|undha|haan|yes sir|correct|ಹೌದು|ಇದೆ|हाँ|हां|हाँजी|जी)\b/i;
    const negative = /\b(no|not|false|dont|don't|ledu|ledhu|kadh|kadhu|nahi|nahin|alla|illa|ಇಲ್ಲ|नहीं|जी नहीं)\b/i;
    if (positive.test(trimmed)) return { valid: true, value: true };
    if (negative.test(trimmed)) return { valid: true, value: false };
    return { valid: false };
  }

  const numberKeys = [
    "family_income", "previous_marks_percentage", "bride_age",
    "parents_income", "project_cost", "girl_child_age",
    "existing_ssy_accounts", "disability_percentage", "family_annual_income",
    "wet_land_acres", "dry_land_acres"
  ];
  if (numberKeys.includes(key)) {
    const moneyMatch = trimmed.match(/(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|crore|k)?/i);
    const numMatch = trimmed.match(/\b(\d+(?:\.\d+)?)\b/);
    if (moneyMatch) {
      let val = Number(moneyMatch[1]);
      if (moneyMatch[2]?.toLowerCase() === "lakh" || moneyMatch[2]?.toLowerCase() === "lac") val *= 100000;
      if (moneyMatch[2]?.toLowerCase() === "crore") val *= 10000000;
      return { valid: true, value: val };
    } else if (numMatch) {
      return { valid: true, value: Number(numMatch[1]) };
    }
    return { valid: false };
  }

  if (key === "primary_income_source") {
    const choices = ["Agriculture", "Salary", "Business", "Other"];
    const match = choices.find((c) => lower.includes(c.toLowerCase()));
    if (match) return { valid: true, value: match };
    return { valid: false };
  }
  if (key === "social_category") {
    const choices = ["SC", "ST", "BC", "OBC", "Minority", "General", "OC", "EBC"];
    const match = choices.find((c) => lower.includes(c.toLowerCase()));
    if (match) return { valid: true, value: match };
    return { valid: false };
  }
  if (key === "admission_type") {
    const choices = ["Convenor Quota", "Management Quota"];
    const match = choices.find((c) => lower.includes(c.toLowerCase()));
    if (match) return { valid: true, value: match };
    return { valid: false };
  }
  if (key === "sector_type") {
    const choices = ["Manufacturing", "Service"];
    const match = choices.find((c) => lower.includes(c.toLowerCase()));
    if (match) return { valid: true, value: match };
    return { valid: false };
  }

  if (key === "date_of_birth" || key === "marriage_date") {
    const dateMatch = trimmed.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (dateMatch) {
      const formatted = `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;
      return { valid: true, value: formatted };
    }
    const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const parsed = Date.parse(trimmed);
      if (!isNaN(parsed)) {
        return { valid: true, value: new Date(parsed).toISOString().slice(0, 10) };
      }
    }
    return { valid: false };
  }

  if (trimmed.length >= 2) {
    let cleanVal = trimmed;
    if (key === "state" || key === "district" || key === "name") {
      cleanVal = trimmed.replace(/\b(my state is|my district is|my name is|i am applying from|i live in|i am|state|district|name)\b/gi, "").trim();
    }
    return { valid: true, value: cleanVal };
  }

  return { valid: false };
}

export function extractFacts(input: string, item?: KnowledgeItem): ProfileFacts {
  const normalized = input.toLowerCase();
  const facts: ProfileFacts = {};
  if (/income certificate|income proof|annual income/.test(normalized)) {
    facts.requested_service = "Income Certificate";
  }
  return facts;
}

export function mergeAnswerWithQuestion(facts: ProfileFacts, questionKey?: string, input?: string): ProfileFacts {
  if (!questionKey || !input) return facts;
  const next = { ...facts };
  const validation = validateAndMapInput(questionKey, input);
  if (validation.valid) {
    next[questionKey] = validation.value;
  }
  return next;
}

export function evaluateEligibility(item: KnowledgeItem, facts: ProfileFacts) {
  for (const [key, ids] of Object.entries(stopIfFalse)) {
    if (ids.includes(item.id) && facts[key] === false) return false;
  }
  for (const [key, ids] of Object.entries(stopIfTrue)) {
    if (ids.includes(item.id) && facts[key] === true) return false;
  }
  if (item.id === "pmay-u-2") {
    const income = Number(facts.family_income || 0);
    if (income > 900000) return false;
    // Female ownership mandatory for EWS and LIG (income <= 6 Lakhs)
    if (income <= 600000 && facts.is_female_owner === false) return false;
  }
  if (item.id === "post-matric-scholarship") {
    if (Number(facts.previous_marks_percentage || 100) < 50) return false;
    const category = String(facts.social_category || "").toLowerCase();
    const income = Number(facts.family_income || 0);
    // Must belong to SC, ST, OBC, or Minority
    if (!["sc", "st", "obc", "minority"].some((c) => category.includes(c))) return false;
    if (category.includes("minority") && income > 200000) return false;
    if (["sc", "st", "obc"].some((c) => category.includes(c)) && income > 250000) return false;
  }
  if (item.id === "telangana-epass") {
    if (facts.attendance_above_75 === false) return false;
    if (String(facts.admission_type || "").toLowerCase().includes("management")) return false;
    const category = String(facts.social_category || "").toLowerCase();
    const income = Number(facts.family_income || 0);
    const age = Number(facts.age || 0);
    // Target communities only
    if (!["sc", "st", "bc", "ebc", "minority", "physically challenged"].some((c) => category.includes(c))) return false;
    if (["sc", "st", "minority"].some((c) => category.includes(c)) && income > 200000) return false;
    if (["bc", "ebc"].some((c) => category.includes(c))) {
      const isUrban = String(facts.district || "").toLowerCase() === "hyderabad";
      const limit = isUrban ? 200000 : 150000;
      if (income > limit) return false;
    }
    if (age > 0) {
      const maxAge = (category.includes("oc") || category.includes("general")) ? 25 : 29;
      if (age > maxAge) return false;
    }
  }
  if (item.id === "kalyana-lakshmi") {
    if (Number(facts.bride_age || 0) > 0 && Number(facts.bride_age || 0) < 18) return false;
    if (Number(facts.groom_age || 0) > 0 && Number(facts.groom_age || 0) < 21) return false;
    if (facts.has_govt_employee === true) return false;
    const category = String(facts.social_category || "").toLowerCase();
    const income = Number(facts.parents_income || facts.family_income || 0);
    if (!["sc", "st", "bc", "ebc", "minority"].some((c) => category.includes(c))) return false;
    if (["sc", "st", "minority"].some((c) => category.includes(c)) && income > 200000) return false;
    if (["bc", "ebc"].some((c) => category.includes(c))) {
      const isUrban = String(facts.district || "").toLowerCase() === "hyderabad";
      const limit = isUrban ? 200000 : 150000;
      if (income > limit) return false;
    }
  }
  if (item.id === "pmegp") {
    if (Number(facts.age || 0) > 0 && Number(facts.age || 0) < 18) return false;
    if (Number(facts.project_cost || 0) > 500000 && !/8|viii|class viii|10|12|graduate/i.test(String(facts.education_level || ""))) return false;
  }
  if (item.id === "sukanya") {
    if (Number(facts.girl_child_age || 0) >= 10 || Number(facts.existing_ssy_accounts || 0) >= 2) return false;
  }
  if (item.id === "aasara-disability") {
    if (facts.has_sadarem_cert === false) return false;
    if (facts.has_white_card === false || facts.has_white_ration_card === false) return false;
    if (Number(facts.disability_percentage || 0) > 0 && Number(facts.disability_percentage || 0) < 40) return false;
  }
  if (item.id === "ration-card") {
    if (facts.owns_car_or_taxpayer === true) return false;
    const income = Number(facts.family_annual_income || facts.family_income || 0);
    const isUrban = String(facts.district || "").toLowerCase() === "hyderabad";
    const incomeLimit = isUrban ? 200000 : 150000;
    if (income > incomeLimit) return false;
    if (Number(facts.wet_land_acres || 0) >= 3.5 || Number(facts.dry_land_acres || 0) >= 7.5) return false;
  }
  return undefined;
}

export function answerMessage(input: string, language: LanguageCode, facts: ProfileFacts = {}, itemId?: string, lastQuestionKey?: string): ConversationResult {
  const detectedLanguage = detectLanguage(input);
  const item = findKnowledgeItem(input, itemId);
  const ui = translations[language];
  if (!item) {
    return { intent: "service_discovery", detectedLanguage, facts, response: serviceDiscoveryResponse, recommendations: knowledgeBase.slice(0, 6).map((record) => record.name), canApply: false };
  }

  const mergedFacts = { ...facts, ...extractFacts(input, item) };
  const answeredFacts = mergeAnswerWithQuestion(mergedFacts, lastQuestionKey, input);
  const eligibility = evaluateEligibility(item, answeredFacts);
  const nextQuestion = eligibility === undefined ? item.questions.find((question) => answeredFacts[question.key] === undefined) : undefined;

  const sections = [`Sure. I'll help you with your ${item.name} application.`, item.objective];

  if (eligibility !== undefined) {
    sections.push(eligibility ? ui.eligible : ui.notEligible);
  } else if (nextQuestion) {
    sections.push(`${ui.ask} ${nextQuestion.question}`);
  }

  if (!nextQuestion && eligibility !== false) {
    sections.push("I have enough information to show the review screen. Please check the visible form and submit when everything is correct.");
  }

  const recommendations = !nextQuestion && eligibility !== false ? item.recommendations.flatMap((rule) => rule.recommend) : [];
  if (recommendations.length) sections.push(`${ui.recommendations}: ${recommendations.join(", ")}.`);

  return {
    intent: item.kind,
    detectedLanguage,
    item,
    facts: answeredFacts,
    eligible: eligibility,
    nextQuestion,
    response: sections.join("\n\n"),
    recommendations,
    canApply: !nextQuestion && eligibility !== false,
  };
}

export function generateReferenceId(itemId: string, now = new Date()) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const code = itemId.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SMV-${code}-${date}-${random}`;
}

export function createApplication(item: KnowledgeItem, facts: ProfileFacts): ApplicationRecord {
  const now = new Date().toISOString();
  return {
    referenceId: generateReferenceId(item.id),
    itemId: item.id,
    itemName: item.name,
    status: item.statusFlow[1] || "Submitted",
    internalStatus: "Submitted",
    governmentSyncedStatus: item.statusFlow[1] || "Submitted",
    createdAt: now,
    updatedAt: now,
    facts: maskSensitiveFacts(facts),
    statusHistory: [
      { status: "Draft", at: now, note: "SAMANVAI draft created after citizen confirmation." },
      { status: item.statusFlow[1] || "Submitted", at: now, note: "Submitted through SAMANVAI after citizen review." },
    ],
    documents: item.documents.map((doc) => ({
      name: doc.name,
      status: doc.manualUpload.toLowerCase().startsWith("no") ? "API verification ready" : "Manual upload fallback ready",
      source: doc.source,
      manualUpload: doc.manualUpload,
    })),
  };
}

export function maskSensitiveFacts(facts: ProfileFacts): ProfileFacts {
  const masked: ProfileFacts = {};
  for (const [key, value] of Object.entries(facts)) {
    if (/aadhaar|pan|bank/i.test(key)) masked[key] = "masked";
    else masked[key] = value;
  }
  return masked;
}

export function summarizeStatus(app?: ApplicationRecord, language: LanguageCode = "en") {
  if (!app) return translations[language].statusMissing;
  return `Reference ID: ${app.referenceId}\nService: ${app.itemName}\nSAMANVAI Internal Status: ${app.internalStatus}\nGovernment Synced Status: ${app.governmentSyncedStatus}\nLatest update: ${app.statusHistory.at(-1)?.note || app.status}`;
}
