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
    eligible: "✅ Eligible",
    notEligible: "❌ Not Eligible",
    ask: "I need one required detail to continue:",
    apply: "Say 'apply' to generate a SAMANVAI reference ID and submit this workflow.",
    noMatch: serviceDiscoveryResponse,
    documents: "Required Documents",
    workflow: "Workflow",
    benefits: "Benefits",
    recommendations: "Recommendations",
    statusMissing: "Please provide a valid reference ID like SMV-PMKISAN-YYYYMMDD-XXXXXX.",
  },
  te: {
    eligible: "✅ Eligible",
    notEligible: "❌ Not Eligible",
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
    eligible: "✅ Eligible",
    notEligible: "❌ Not Eligible",
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
    eligible: "✅ Eligible",
    notEligible: "❌ Not Eligible",
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
  owns_cultivable_land: ["pmkisan", "rythu-bharosa"],
  is_ts_resident: ["indiramma-illu", "aarogyasri"],
  is_ap_resident: ["rythu-bharosa", "amma-vodi", "vidya-deevena", "ysr-cheyutha", "ebc-nestham"],
  has_bpl_card: ["indiramma-illu", "ujjwala"],
  has_white_ration_card: ["aarogyasri", "amma-vodi"],
  is_covered_procedure: ["aarogyasri"],
  has_sadarem_cert: ["aasara-disability"],
  has_white_card: ["aasara-disability"],
  is_notified_crop: ["pmfby"],
  has_sowing_proof: ["pmfby"],
  listed_in_secc: ["ayushman-bharat"],
  child_attendance_above_75: ["amma-vodi"],
  is_female: ["ysr-cheyutha", "ebc-nestham", "ujjwala"],
};

const stopIfTrue: Record<string, string[]> = {
  is_institutional_land: ["pmkisan"],
  paid_income_tax: ["pmkisan"],
  pension_over_10k: ["pmkisan"],
  is_registered_professional: ["pmkisan"],
  owns_pucca_house: ["indiramma-illu", "pmay-u-2"],
  received_prior_housing: ["indiramma-illu", "pmay-u-2"],
  has_govt_employee: ["kalyana-lakshmi", "ayushman-bharat"],
  is_govt_employee: ["ayushman-bharat"],
  owns_car_or_taxpayer: ["ration-card"],
  owns_four_wheeler: ["vidya-deevena"],
  has_lpg_connection: ["ujjwala"],
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
  const normalized = input.toLowerCase();

  // 1. Direct name or alias match check (highest priority, always active)
  const directMatch = knowledgeBase.find((item) =>
    [item.name, ...item.aliases].some((alias) => {
      const lowerAlias = alias.toLowerCase();
      return normalized === lowerAlias ||
             new RegExp(`\\b${lowerAlias.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i").test(normalized) ||
             (lowerAlias.length > 4 && normalized.includes(lowerAlias));
    })
  );
  if (directMatch) return directMatch;

  // 2. Fallback matching only for explicit apply request
  const isApplyRequest = /\b(apply|register|enroll|submit|want to|need to|need|i need|kaavali|కావాలి|ಬೇಕು)\b/i.test(normalized);
  if (isApplyRequest) {
    const fuzzyMatch = knowledgeBase.find((item) =>
      normalized.includes(item.kind) ||
      item.aliases.some((alias) =>
        alias.split(" ").some((token) => token.length > 4 && normalized.includes(token.toLowerCase()))
      )
    );
    if (fuzzyMatch) return fuzzyMatch;
  }

  // 3. Fallback to preferredId if provided and no active override
  if (preferredId) return getKnowledgeItem(preferredId);

  return undefined;
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
    "has_white_card", "owns_car_or_taxpayer", "agreed_to_apply",
    "is_ap_resident", "is_govt_employee",
    "child_attendance_above_75", "is_female", "owns_four_wheeler",
    "has_lpg_connection", "checking_eligibility",
    // New Scheme-Specific factual keys
    "is_farmer", "owns_or_cultivates_land", "has_pattadar_passbook",
    "cultivated_crops", "owns_permanent_house", "has_ration_card", 
    "covered_other_health", "has_required_id", "covered_other_applicable", 
    "is_student", "enrolled_eligible_inst", "previous_marks_percentage",
    "owns_or_starts_business", "has_credit_default"
  ];
  if (booleanKeys.includes(key)) {
    const positive = /\b(yes|yeah|true|have|own|resident|avu|avunu|undhi|undha|haan|yes sir|correct|హౌದು|ఇದೆ|हाँ|हां|हाँजी|जी|apply|apply now|continue)\b/i;
    const negative = /\b(no|not|false|dont|don't|ledu|ledhu|kadh|kadhu|nahi|nahin|alla|illa|ಇಲ್ಲ|नहीं|जी नहीं|cancel|stop)\b/i;
    if (positive.test(trimmed)) return { valid: true, value: true };
    if (negative.test(trimmed)) return { valid: true, value: false };
    return { valid: false };
  }

  if (key === "aadhaar_number") {
    const clean = trimmed.replace(/\s/g, "");
    if (/^\d{12}$/.test(clean)) return { valid: true, value: clean };
    return { valid: false };
  }
  if (key === "mobile_number") {
    const clean = trimmed.replace(/[^0-9]/g, "");
    if (clean.length === 10) return { valid: true, value: clean };
    return { valid: false };
  }
  if (key === "ifsc_code") {
    const clean = trimmed.toUpperCase().replace(/\s/g, "");
    if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean)) return { valid: true, value: clean };
    return { valid: false };
  }
  if (key === "bank_account_number") {
    const clean = trimmed.replace(/\s/g, "");
    if (/^\d{9,18}$/.test(clean)) return { valid: true, value: clean };
    return { valid: false };
  }

  const numberKeys = [
    "family_income", "previous_marks_percentage", "bride_age",
    "parents_income", "project_cost", "girl_child_age",
    "existing_ssy_accounts", "disability_percentage", "family_annual_income",
    "wet_land_acres", "dry_land_acres", "age"
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
  if (key === "income_category") {
    const choices = ["EWS", "LIG", "MIG"];
    const match = choices.find((c) => lower.includes(c.toLowerCase()));
    if (match) return { valid: true, value: match };
    return { valid: false };
  }
  if (key === "eligible_category") {
    const choices = ["SC", "ST", "BC", "Minority", "Other"];
    const match = choices.find((c) => lower.includes(c.toLowerCase()));
    if (match) return { valid: true, value: match };
    return { valid: false };
  }
  if (key === "mudra_category") {
    const choices = ["Shishu", "Kishore", "Tarun"];
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

function isTrue(val: any): boolean {
  return val === true || String(val).toLowerCase() === "true" || String(val).toLowerCase() === "yes";
}

function isFalse(val: any): boolean {
  return val === false || String(val).toLowerCase() === "false" || String(val).toLowerCase() === "no";
}

function cleanString(val: any): string {
  return String(val || "").trim().toLowerCase();
}

export function evaluateEligibility(item: KnowledgeItem, facts: ProfileFacts) {
  const allAnswered = item.questions.every((q) => facts[q.key] !== undefined && facts[q.key] !== "");
  if (!allAnswered) return undefined;

  console.log("selectedScheme:\n" + item.id);
  console.log("collectedAnswers:\n" + JSON.stringify(facts, null, 2));
  console.log("loadedEligibilityRules:\n" + item.name);

  const runRules = (): boolean => {
    // New Scheme-Specific rules
    if (item.id === "pmkisan") {
      console.log("evaluationSteps:\n- Checking PM-KISAN rules");
      if (isFalse(facts.owns_cultivable_land)) {
        console.log("Land Check = FAIL");
        return false;
      }
      console.log("Land Check = PASS");
      if (isTrue(facts.paid_income_tax)) {
        console.log("Income Tax Check = FAIL");
        return false;
      }
      console.log("Income Tax Check = PASS");
      if (isTrue(facts.is_govt_employee)) {
        console.log("Govt Employee Check = FAIL");
        return false;
      }
      console.log("Govt Employee Check = PASS");
      return true;
    }
    if (item.id === "rythu-bharosa") {
      console.log("evaluationSteps:\n- Checking Rythu Bharosa rules");
      if (cleanString(facts.state) !== "andhra pradesh") {
        console.log("State Check = FAIL");
        return false;
      }
      console.log("State Check = PASS");
      if (isFalse(facts.is_farmer)) {
        console.log("Farmer Check = FAIL");
        return false;
      }
      console.log("Farmer Check = PASS");
      if (isFalse(facts.owns_or_cultivates_land)) {
        console.log("Land Ownership Check = FAIL");
        return false;
      }
      console.log("Land Ownership Check = PASS");
      if (isFalse(facts.has_pattadar_passbook)) {
        console.log("Pattadar Passbook Check = FAIL");
        return false;
      }
      console.log("Pattadar Passbook Check = PASS");
      return true;
    }
    if (item.id === "pmfby") {
      console.log("evaluationSteps:\n- Checking PM Fasal Bima Yojana rules");
      if (isFalse(facts.is_farmer)) {
        console.log("Farmer Check = FAIL");
        return false;
      }
      console.log("Farmer Check = PASS");
      if (isFalse(facts.cultivated_crops)) {
        console.log("Crops Check = FAIL");
        return false;
      }
      console.log("Crops Check = PASS");
      if (isFalse(facts.is_notified_crop)) {
        console.log("Notified Crop Check = FAIL");
        return false;
      }
      console.log("Notified Crop Check = PASS");
      return true;
    }
    if (item.id === "indiramma-illu") {
      console.log("evaluationSteps:\n- Checking Indiramma Illu rules");
      if (cleanString(facts.state) !== "telangana") {
        console.log("State Check = FAIL");
        return false;
      }
      console.log("State Check = PASS");
      if (isTrue(facts.owns_permanent_house)) {
        console.log("House Check = FAIL");
        return false;
      }
      console.log("House Check = PASS");
      const incomeStr = cleanString(facts.family_income);
      const incomeNum = Number(facts.family_income);
      if (incomeStr.includes("above") || (!isNaN(incomeNum) && incomeNum > 250000)) {
        console.log("Income Check = FAIL");
        return false;
      }
      console.log("Income Check = PASS");
      if (isTrue(facts.received_prior_housing)) {
        console.log("Prior Housing Check = FAIL");
        return false;
      }
      console.log("Prior Housing Check = PASS");
      return true;
    }
    if (item.id === "pmay-u-2") {
      console.log("evaluationSteps:\n- Checking PMAY rules");
      if (isTrue(facts.owns_pucca_house)) {
        console.log("Pucca House Check = FAIL");
        return false;
      }
      console.log("Pucca House Check = PASS");
      if (isTrue(facts.received_prior_housing)) {
        console.log("Prior Housing Check = FAIL");
        return false;
      }
      console.log("Prior Housing Check = PASS");
      const incomeNum = Number(facts.family_income);
      if (!isNaN(incomeNum) && incomeNum > 1800000) {
        console.log("Income Check = FAIL");
        return false;
      }
      console.log("Income Check = PASS");
      return true;
    }
    if (item.id === "aarogyasri") {
      console.log("evaluationSteps:\n- Checking Aarogyasri rules");
      if (cleanString(facts.state) !== "andhra pradesh") {
        console.log("State Check = FAIL");
        return false;
      }
      console.log("State Check = PASS");
      const incomeStr = cleanString(facts.family_income);
      const incomeNum = Number(facts.family_income);
      if (incomeStr.includes("above") || (!isNaN(incomeNum) && incomeNum > 500000)) {
        console.log("Income Check = FAIL");
        return false;
      }
      console.log("Income Check = PASS");
      if (isFalse(facts.has_ration_card)) {
        console.log("Ration Card Check = FAIL");
        return false;
      }
      console.log("Ration Card Check = PASS");
      if (isTrue(facts.covered_other_health)) {
        console.log("Other Health Check = FAIL");
        return false;
      }
      console.log("Other Health Check = PASS");
      return true;
    }
    if (item.id === "ayushman-bharat") {
      console.log("evaluationSteps:\n- Checking Ayushman Bharat rules");
      if (isFalse(facts.has_bpl_card)) {
        console.log("BPL Card Check = FAIL");
        return false;
      }
      console.log("BPL Card Check = PASS");
      if (isFalse(facts.has_required_id)) {
        console.log("Required ID Check = FAIL");
        return false;
      }
      console.log("Required ID Check = PASS");
      if (isTrue(facts.covered_other_applicable)) {
        console.log("Other Coverage Check = FAIL");
        return false;
      }
      console.log("Other Coverage Check = PASS");
      return true;
    }
    if (item.id === "vidya-deevena") {
      console.log("evaluationSteps:\n- Checking JVD rules");
      if (cleanString(facts.state) !== "andhra pradesh") {
        console.log("State Check = FAIL");
        return false;
      }
      console.log("State Check = PASS");
      if (isFalse(facts.is_student)) {
        console.log("Student Check = FAIL");
        return false;
      }
      console.log("Student Check = PASS");
      if (cleanString(facts.course_studying) === "other") {
        console.log("Course Check = FAIL");
        return false;
      }
      console.log("Course Check = PASS");
      const incomeStr = cleanString(facts.family_income);
      const incomeNum = Number(facts.family_income);
      if (incomeStr.includes("above") || (!isNaN(incomeNum) && incomeNum > 250000)) {
        console.log("Income Check = FAIL");
        return false;
      }
      console.log("Income Check = PASS");
      if (isFalse(facts.enrolled_eligible_inst)) {
        console.log("Institution Check = FAIL");
        return false;
      }
      console.log("Institution Check = PASS");
      return true;
    }
    if (item.id === "post-matric-scholarship") {
      console.log("evaluationSteps:\n- Checking Scholarship rules");
      if (isFalse(facts.is_student)) {
        console.log("Student Check = FAIL");
        return false;
      }
      console.log("Student Check = PASS");
      const incomeStr = cleanString(facts.family_income);
      const incomeNum = Number(facts.family_income);
      if (incomeStr.includes("above") || (!isNaN(incomeNum) && incomeNum > 250000)) {
        console.log("Income Check = FAIL");
        return false;
      }
      console.log("Income Check = PASS");
      if (isFalse(facts.previous_marks_percentage)) {
        console.log("Marks Percentage Check = FAIL");
        return false;
      }
      console.log("Marks Percentage Check = PASS");
      return true;
    }
    if (item.id === "ysr-cheyutha") {
      console.log("evaluationSteps:\n- Checking YSR Cheyutha rules");
      if (cleanString(facts.state) !== "andhra pradesh") {
        console.log("State Check = FAIL");
        return false;
      }
      console.log("State Check = PASS");
      if (isFalse(facts.is_female)) {
        console.log("Gender Check = FAIL");
        return false;
      }
      console.log("Gender Check = PASS");
      const ageStr = cleanString(facts.age_group);
      if (ageStr !== "45–60 years" && ageStr !== "45-60 years" && !ageStr.includes("45")) {
        console.log("Age Group Check = FAIL");
        return false;
      }
      console.log("Age Group Check = PASS");
      const incomeStr = cleanString(facts.family_income);
      const incomeNum = Number(facts.family_income);
      if (incomeStr.includes("above") || (!isNaN(incomeNum) && incomeNum > 250000)) {
        console.log("Income Check = FAIL");
        return false;
      }
      console.log("Income Check = PASS");
      if (cleanString(facts.social_category) === "other") {
        console.log("Category Check = FAIL");
        return false;
      }
      console.log("Category Check = PASS");
      return true;
    }
    if (item.id === "pmegp") {
      console.log("evaluationSteps:\n- Checking Mudra rules");
      if (isFalse(facts.owns_or_starts_business)) {
        console.log("Business Check = FAIL");
        return false;
      }
      console.log("Business Check = PASS");
      if (isTrue(facts.has_credit_default)) {
        console.log("Credit Default Check = FAIL");
        return false;
      }
      console.log("Credit Default Check = PASS");
      return true;
    }

    // Original fallback checks for other items
    for (const [key, ids] of Object.entries(stopIfFalse)) {
      if (ids.includes(item.id) && facts[key] === false) return false;
    }
    for (const [key, ids] of Object.entries(stopIfTrue)) {
      if (ids.includes(item.id) && facts[key] === true) return false;
    }
    if (item.id === "telangana-epass") {
      if (facts.attendance_above_75 === false) return false;
      if (String(facts.admission_type || "").toLowerCase().includes("management")) return false;
      const category = String(facts.social_category || "").toLowerCase();
      const income = Number(facts.family_income || 0);
      const age = Number(facts.age || 0);
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

    return true;
  };

  const finalResult = runRules();
  console.log("finalEligibilityResult:\n" + (finalResult ? "Eligible" : "Not Eligible"));
  return finalResult;
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

  const isChecking = answeredFacts.checking_eligibility === true || String(answeredFacts.checking_eligibility) === "true";
  const isApplying = answeredFacts.agreed_to_apply === true || String(answeredFacts.agreed_to_apply) === "true";

  let nextQuestion = undefined;
  if (isChecking || isApplying) {
    if (isApplying && (answeredFacts.state === undefined || answeredFacts.state === "")) {
      nextQuestion = { key: "state", question: "State", type: "text" as const };
    } else if (isApplying && (answeredFacts.district === undefined || answeredFacts.district === "")) {
      nextQuestion = { key: "district", question: "District", type: "text" as const };
    } else {
      const schemeQ = item.questions.find((q) => answeredFacts[q.key] === undefined);
      if (schemeQ) {
        nextQuestion = schemeQ;
      } else if (isChecking && !isApplying && eligibility === true) {
        if (answeredFacts.agreed_to_apply === undefined || answeredFacts.agreed_to_apply === "") {
          nextQuestion = { key: "agreed_to_apply", question: "Would you like to continue with the application?", type: "text" as const, choices: ["Apply Now", "Cancel"] };
        }
      } else if (isApplying) {
        const appQ = (item.applicationQuestions || []).find((q) => answeredFacts[q.key] === undefined || answeredFacts[q.key] === "");
        if (appQ) {
          nextQuestion = appQ;
        }
      }
    }
  }

  let validationMessage = "";
  if (lastQuestionKey) {
    const validation = validateAndMapInput(lastQuestionKey, input);
    if (!validation.valid) {
      if (lastQuestionKey === "aadhaar_number") {
        validationMessage = "Invalid Aadhaar Number. Please enter a 12-digit numeric Aadhaar.";
      } else if (lastQuestionKey === "mobile_number") {
        validationMessage = "Invalid Mobile Number. Please enter a 10-digit mobile number.";
      } else if (lastQuestionKey === "ifsc_code") {
        validationMessage = "Invalid IFSC Code. Please enter a valid 11-character IFSC code (e.g. UTIB0000289).";
      } else if (lastQuestionKey === "bank_account_number") {
        validationMessage = "Invalid Bank Account Number. Please enter a numeric account number.";
      } else {
        validationMessage = "Invalid input. Please enter a valid value.";
      }
    }
  }

  const sections: string[] = [];
  if (validationMessage) {
    sections.push(validationMessage);
  }

  if (answeredFacts.agreed_to_apply === false || String(answeredFacts.agreed_to_apply) === "false") {
    sections.push("Application cancelled. Let me know if you want to explore other schemes.");
    return {
      intent: item.kind,
      detectedLanguage,
      item,
      facts: answeredFacts,
      eligible: eligibility,
      nextQuestion: undefined,
      response: sections.join("\n\n"),
      recommendations: ["Search Another Scheme"],
      canApply: false,
    };
  }

  if (isApplying && !nextQuestion) {
    sections.push("✔ Application details completed successfully.\n\nNext Step:\nDocument Verification & Auto Fetch.");
  } else if (isApplying && nextQuestion) {
    const checklistLines = ["Application Progress:"];
    (item.applicationQuestions || []).forEach((q) => {
      const answered = answeredFacts[q.key] !== undefined && answeredFacts[q.key] !== "";
      checklistLines.push(`${answered ? "✔" : "☐"} ${q.question.replace(/\?$/, "").replace(/Please enter your\s+/i, "").replace(/Enter your\s+/i, "")}`);
    });
    sections.push(checklistLines.join("\n"));
    sections.push(`${ui.ask} ${nextQuestion.question}`);
  } else {
    if (eligibility !== undefined) {
      if (eligibility) {
        sections.push(ui.eligible);
        sections.push("Congratulations! You are eligible for this scheme.\n\nWould you like to continue with the application?");
      } else {
        sections.push(ui.notEligible);
        sections.push("Unfortunately, based on the information provided, you are not eligible for this scheme.");
      }
    } else {
      sections.push(`Sure. I'll help you with your ${item.name} application.`);
      sections.push(item.objective);
      if (nextQuestion) {
        sections.push(`${ui.ask} ${nextQuestion.question}`);
      }
    }
  }

  let recommendations: string[] = [];
  if (eligibility !== undefined) {
    if (eligibility) {
      recommendations = ["Apply Now", "Cancel"];
    } else {
      recommendations = ["Search Another Scheme"];
    }
  } else if (isApplying && !nextQuestion) {
    recommendations = ["Continue"];
  } else if (nextQuestion?.key === "agreed_to_apply") {
    recommendations = ["Apply Now", "Cancel"];
  } else if (nextQuestion?.choices) {
    recommendations = nextQuestion.choices;
  }

  return {
    intent: item.kind,
    detectedLanguage,
    item,
    facts: answeredFacts,
    eligible: eligibility,
    nextQuestion,
    response: sections.join("\n\n"),
    recommendations,
    canApply: isApplying && !nextQuestion,
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
