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

export function findKnowledgeItem(input: string, preferredId?: string) {
  if (preferredId) return getKnowledgeItem(preferredId);
  const normalized = input.toLowerCase();
  return (
    knowledgeBase.find((item) => [item.name, ...item.aliases].some((alias) => normalized.includes(alias.toLowerCase()))) ||
    knowledgeBase.find((item) => normalized.includes(item.kind) || item.aliases.some((alias) => alias.split(" ").some((token) => token.length > 4 && normalized.includes(token.toLowerCase()))))
  );
}

export function extractFacts(input: string, item?: KnowledgeItem): ProfileFacts {
  const normalized = input.toLowerCase();
  const facts: ProfileFacts = {};

  if (/telangana/.test(normalized)) {
    facts.state = "Telangana";
    facts.is_ts_resident = true;
  }
  const districtMatch = normalized.match(/\b(hyderabad|warangal|karimnagar|nizamabad|khammam|nalgonda|medak|adilabad|mahabubnagar|siddipet|suryapet|jagtial|kamareddy|rangareddy)\b/i);
  if (districtMatch) facts.district = districtMatch[1].replace(/\b\w/g, (char) => char.toUpperCase());
  if (/aadhaar|aadhar|uidai|fetch my aadhaar|fetch my aadhar/.test(normalized)) {
    facts.aadhaar_consent = true;
    facts.name = "Verified Citizen";
    facts.date_of_birth = "1990-01-01";
    facts.gender = "Verified";
    facts.address = facts.district ? `${facts.district}, ${facts.state || "Telangana"}` : "Verified address on Aadhaar";
  }
  if (/income certificate|income proof|annual income/.test(normalized)) facts.requested_service = "Income Certificate";

  if (/\b(yes|yeah|true|have|own|resident|ఉంది|అవును|हां|हाँ)\b/i.test(input)) facts.__last_boolean = true;
  if (/\b(no|not|false|do not|dont|don't|లేదు|కాదు|नहीं)\b/i.test(input)) facts.__last_boolean = false;
  if (/tax/.test(normalized)) facts.paid_income_tax = !/\b(no|not|do not|don't|dont)\b/.test(normalized);
  if (/farmer|agriculture|cultivable|landholding|రైతు|किसान/.test(normalized)) facts.owns_cultivable_land = true;
  if (/telangana|hyderabad|warangal|karimnagar|nizamabad|తెలంగాణ/.test(normalized)) facts.is_ts_resident = true;
  if (/white ration|bpl|ration card|food security|fsc/.test(normalized)) {
    facts.has_bpl_card = true;
    facts.has_white_ration_card = true;
    facts.has_white_card = true;
  }
  if (/pucca|rcc/.test(normalized) && /\b(no|not|don't|dont|without)\b/.test(normalized)) facts.owns_pucca_house = false;

  const moneyMatch = normalized.match(/(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|crore|k)?/);
  if (moneyMatch) {
    let value = Number(moneyMatch[1]);
    if (moneyMatch[2] === "lakh" || moneyMatch[2] === "lac") value *= 100000;
    if (moneyMatch[2] === "crore") value *= 10000000;
    if (item?.questions.some((q) => q.key.includes("income"))) facts.family_income = value;
  }

  const ageMatch = normalized.match(/\b(\d{1,2})\s*(?:years|year|yrs|age)?\b/);
  if (ageMatch && item) {
    const age = Number(ageMatch[1]);
    const ageQuestion = item.questions.find((q) => q.key.includes("age"));
    if (ageQuestion) facts[ageQuestion.key] = age;
  }

  return facts;
}

export function mergeAnswerWithQuestion(facts: ProfileFacts, questionKey?: string, input?: string): ProfileFacts {
  if (!questionKey || !input) return facts;
  const next = { ...facts };
  const lowered = input.toLowerCase();
  if (/\b(yes|yeah|true|have|own|resident|అవును|ఉంది|हाँ|हां)\b/.test(lowered)) next[questionKey] = true;
  else if (/\b(no|not|false|do not|dont|don't|లేదు|नहीं)\b/.test(lowered)) next[questionKey] = false;
  else {
    const number = lowered.match(/\d+(?:\.\d+)?/);
    next[questionKey] = number ? Number(number[0]) : input.trim();
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
  if (item.id === "pmay-u-2" && Number(facts.family_income || 0) > 900000) return false;
  if (item.id === "post-matric-scholarship") {
    if (Number(facts.previous_marks_percentage || 100) < 50) return false;
    const category = String(facts.social_category || "").toLowerCase();
    const income = Number(facts.family_income || 0);
    if (category.includes("minority") && income > 200000) return false;
    if (["sc", "st", "obc"].includes(category) && income > 250000) return false;
  }
  if (item.id === "kalyana-lakshmi" && Number(facts.bride_age || 99) < 18) return false;
  if (item.id === "pmegp" && Number(facts.project_cost || 0) > 500000 && !/8|viii|class viii|10|12|graduate/i.test(String(facts.education_level || ""))) return false;
  if (item.id === "sukanya" && (Number(facts.girl_child_age || 0) >= 10 || Number(facts.existing_ssy_accounts || 0) >= 2)) return false;
  if (item.id === "aasara-disability" && Number(facts.disability_percentage || 100) < 40) return false;
  if (item.id === "ration-card" && (Number(facts.family_annual_income || 0) > 200000 || Number(facts.wet_land_acres || 0) >= 3.5 || Number(facts.dry_land_acres || 0) >= 7.5)) return false;
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
