import { NextRequest, NextResponse } from "next/server";
import { answerMessage, createApplication, summarizeStatus, classifyIntent, mergeAnswerWithQuestion, findKnowledgeItem, ProfileFacts } from "@/lib/samanvai/engine";
import { getKnowledgeItem, knowledgeBase } from "@/lib/samanvai/knowledge";
import { readDb, writeDb } from "@/lib/samanvai/store";
import { getSamanvaiResponse } from "@/lib/samanvai/llm";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({
    user: db.users[0],
    preferences: db.preferences["citizen-001"],
    knowledgeBase,
    applications: db.applications,
    documents: db.applications.flatMap((app) => app.documents.map((doc) => ({ ...doc, referenceId: app.referenceId, itemName: app.itemName }))),
    notifications: db.notifications,
    history: db.history,
    profileFacts: db.profileFacts,
  });
}

const schemeInfo: Record<string, {
  emoji: string;
  description: string;
  faqs: {
    benefits: string;
    amount: string;
    eligibility: string;
    documents: string;
    lastDate: string;
    apply: string;
    status: string;
  }
}> = {
  "PM-KISAN": {
    emoji: "🌾",
    description: "PM-KISAN provides financial assistance to eligible farmer families to support agricultural activities.",
    faqs: {
      benefits: "Provides direct income support to buy seeds, fertilizers, and meet agriculture expenses.",
      amount: "Rs. 6,000 per year, paid in three equal installments of Rs. 2,000 every four months.",
      eligibility: "Landholding farmer families with cultivable landholding in their names.",
      documents: "Aadhaar Card, Land ownership documents (Patta/Chitta), Bank Account details.",
      lastDate: "Applications are open year-round; no fixed last date.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "Rythu Bharosa": {
    emoji: "🌱",
    description: "Rythu Bharosa provides financial investment support to farmer families, including tenant farmers, for agricultural needs.",
    faqs: {
      benefits: "Provides investment support for crop cultivation, including tenant farmers and landless SC/ST/BC/Minority farmers.",
      amount: "Rs. 13,500 per year, which includes Rs. 7,500 from the state government and Rs. 6,000 from PM-KISAN.",
      eligibility: "All landowning farmer families and eligible tenant farmers belonging to SC, ST, BC, and Minority categories.",
      documents: "Aadhaar Card, Land Passbook, Tenant Agreement copy (for tenants), Bank Passbook copy.",
      lastDate: "Usually open before the start of the crop cultivation season.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "PM Fasal Bima Yojana": {
    emoji: "🌾",
    description: "PM Fasal Bima Yojana offers insurance coverage and financial support to farmers in the event of failure of any of the notified crops.",
    faqs: {
      benefits: "Provides insurance cover against crop loss due to natural calamities, pests, and diseases.",
      amount: "Payout is calculated based on the crop loss percentage and the sum insured for the crop.",
      eligibility: "All farmers growing notified crops in notified areas, including tenant farmers.",
      documents: "Aadhaar Card, Land Record documents, Sowing Certificate, Bank Account details.",
      lastDate: "Deadline varies by crop season (Kharif/Rabi); check local agriculture department notices.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "Indiramma Illu": {
    emoji: "🏠",
    description: "Indiramma Illu provides financial assistance to eligible low-income families for building houses or completing construction.",
    faqs: {
      benefits: "Provides financial aid to build a permanent house or finish construction of an ongoing house.",
      amount: "Financial assistance up to Rs. 5 Lakhs for house construction.",
      eligibility: "Low-income families who do not own a permanent house and possess an eligible plot.",
      documents: "Aadhaar Card, White Ration Card (Food Security Card), Plot ownership documents, Income Certificate.",
      lastDate: "Announced periodically by the state housing department.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "PMAY": {
    emoji: "🏠",
    description: "Pradhan Mantri Awas Yojana (PMAY) aims to provide affordable housing with basic amenities to eligible urban and rural families.",
    faqs: {
      benefits: "Provides pucca houses with water, sanitation, and electricity connections.",
      amount: "Financial assistance ranging from Rs. 1.2 Lakhs to Rs. 2.67 Lakhs depending on the category and location.",
      eligibility: "Economically Weaker Section (EWS), LIG, and MIG families who do not own a pucca house in India.",
      documents: "Aadhaar Card, PAN Card, Income Proof, Bank Account statement, Affidavit of not owning a pucca house.",
      lastDate: "Varies by specific scheme phase and urban/rural components; check the PMAY portal.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "Aarogyasri": {
    emoji: "🏥",
    description: "Aarogyasri provides comprehensive health insurance and medical coverage for tertiary care treatments to low-income families.",
    faqs: {
      benefits: "Cashless treatment for identified corporate surgeries and therapies in empanelled hospitals.",
      amount: "Coverage up to Rs. 5 Lakhs (or up to Rs. 10 Lakhs in specific states) per family per year.",
      eligibility: "Families possessing valid White Ration Cards or Food Security Cards.",
      documents: "White Ration Card, Aadhaar Card, Medical reports and referral letters.",
      lastDate: "Continuous registration; enrollment happens automatically with the White Ration Card.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "Ayushman Bharat": {
    emoji: "❤️",
    description: "Ayushman Bharat (PM-JAY) provides free health cover up to Rs. 5 Lakhs per family per year for secondary and tertiary care hospitalization.",
    faqs: {
      benefits: "Cashless secondary and tertiary hospitalization treatment at all public and empanelled private hospitals.",
      amount: "Health cover up to Rs. 5 Lakhs per family per year.",
      eligibility: "Families listed in the Socio-Economic Caste Census (SECC) database or matching state food security categories.",
      documents: "Aadhaar Card, Ayushman Card (PM-JAY Gold Card), Ration Card.",
      lastDate: "No deadline; continuous eligibility check and card distribution.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "Jagananna Vidya Deevena": {
    emoji: "🎓",
    description: "Jagananna Vidya Deevena offers full fee reimbursement to eligible students pursuing higher education.",
    faqs: {
      benefits: "Reimbursement of tuition and college fees directly to the mother's bank account.",
      amount: "Full fee reimbursement of actual college tuition fees.",
      eligibility: "Students pursuing ITI, Polytechnic, Degree, Engineering, Medicine, and PG courses whose family income is below Rs. 2.5 Lakhs per year.",
      documents: "Aadhaar Card, College Admission details, Fee Structure Certificate, Income Certificate, Caste Certificate.",
      lastDate: "Varies by academic year admission schedules.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "National Scholarship Schemes": {
    emoji: "📚",
    description: "National Scholarship Schemes provide financial support to deserving students at various educational levels to encourage higher studies.",
    faqs: {
      benefits: "Direct bank transfer of scholarship amounts to support school, college, and university education.",
      amount: "Varies from Rs. 1,000 to Rs. 50,000 per year depending on the specific scholarship scheme.",
      eligibility: "Meritorious students belonging to minority, SC, ST, OBC, or economically weaker sections matching specific criteria.",
      documents: "Aadhaar Card, Previous Year Marksheet, Bank Passbook, Fee Receipt, Income Certificate.",
      lastDate: "Usually between October and December of the academic year; check National Scholarship Portal (NSP).",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "YSR Cheyutha": {
    emoji: "👩",
    description: "YSR Cheyutha provides financial assistance to women belonging to SC, ST, BC, and minority communities to support their livelihood activities.",
    faqs: {
      benefits: "Empowers women by providing financial aid to set up small businesses or improve livelihood.",
      amount: "Rs. 75,000 over four years (Rs. 18,750 per year).",
      eligibility: "Women aged between 45 to 60 years belonging to SC, ST, BC, and Minority communities.",
      documents: "Aadhaar Card, Caste Certificate, Age Proof, Bank Account details.",
      lastDate: "Announced annually by the welfare department.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  },
  "PM Mudra Yojana": {
    emoji: "💼",
    description: "PM Mudra Yojana provides loans up to Rs. 10 Lakhs to non-corporate, non-farm small/micro enterprises for business creation and expansion.",
    faqs: {
      benefits: "Access to bank loans without collateral for business startups and business expansion.",
      amount: "Up to Rs. 50,000 (Shishu), Rs. 50,000 to Rs. 5 Lakhs (Kishore), and Rs. 5 Lakhs to Rs. 10 Lakhs (Tarun).",
      eligibility: "Any Indian citizen owning a non-farm business enterprise with business plans for income generation.",
      documents: "Aadhaar Card, Proof of Identity, Business Address Proof, Quotations for equipment, Business registration.",
      lastDate: "Applications are open year-round at commercial banks and financial institutions.",
      apply: "You can apply for this scheme directly through SamNav AI.\n\nThe next steps are:\n1. Eligibility Check\n2. Application Preparation\n3. Document Verification\n4. Application Submission",
      status: "You can check your application status directly through SamNav AI.\n\nAfter your application is submitted, SamNav AI will display the latest status and guide you through any further steps if required.\n\nIf you haven't applied yet, complete the eligibility check first."
    }
  }
};

function processPhase1(message: string, currentFacts: any): {
  response: string;
  suggestions: string[];
  facts: any;
  intent: string;
} | null {
  const normalized = message.trim().toLowerCase();

  // If they have already selected a scheme, stop Phase 1 and handle Phase 2 FAQ / Restart gates
  if (currentFacts.selectedScheme) {
    // If they have already moved to Phase 3 eligibility checking, skip FAQ checks
    if (currentFacts.checking_eligibility) {
      return null;
    }

    const schemeToIdMap: Record<string, string> = {
      "PM-KISAN": "pmkisan",
      "Rythu Bharosa": "rythu-bharosa",
      "PM Fasal Bima Yojana": "pmfby",
      "Indiramma Illu": "indiramma-illu",
      "PMAY": "pmay-u-2",
      "Aarogyasri": "aarogyasri",
      "Ayushman Bharat": "ayushman-bharat",
      "Jagananna Vidya Deevena": "vidya-deevena",
      "National Scholarship Schemes": "post-matric-scholarship",
      "YSR Cheyutha": "ysr-cheyutha",
      "PM Mudra Yojana": "pmegp"
    };

    // Check if they want to restart / search for a new scheme (from restart rule)
    const isRestart = normalized.includes("search for a new scheme") || normalized.includes("restart") || normalized.includes("search");
    if (isRestart) {
      const updatedFacts = { ...currentFacts };
      delete updatedFacts.selectedScheme;
      delete updatedFacts.selectedSituation;
      delete updatedFacts.phase1_completed;
      
      return {
        response: `Got it! Let's search again. What can I help you find today?`,
        suggestions: [
          "Farmer Schemes",
          "Housing Schemes",
          "Healthcare Schemes",
          "Education Schemes",
          "Women & Self Employment Schemes"
        ],
        facts: updatedFacts,
        intent: "restart_search"
      };
    }

    // Check if they say "Yes" or "No" to check eligibility
    const isYes = normalized === "yes" || normalized.includes("yes, check eligibility") || normalized.includes("check eligibility");
    const isNo = normalized === "no" || normalized.includes("no, stay here") || normalized.includes("continue exploring");
    
    if (isYes) {
      const schemeId = schemeToIdMap[currentFacts.selectedScheme] || "pmkisan";
      const updatedFacts = {
        ...currentFacts,
        checking_eligibility: true,
        active_scheme_id: schemeId
      };
      
      return {
        response: `Understood. Let's verify your eligibility for ${currentFacts.selectedScheme}.\n\nState`,
        suggestions: ["Telangana", "Andhra Pradesh", "Karnataka"],
        facts: updatedFacts,
        intent: "start_eligibility"
      };
    } else if (isNo) {
      return {
        response: `Understood. We will continue exploring this scheme. What else would you like to know?`,
        suggestions: ["Benefits", "Amount", "Eligibility", "Documents", "Last Date", "Apply", "Status", "Check Eligibility"],
        facts: currentFacts,
        intent: "stay_in_faq"
      };
    }

    // Standard FAQ Matching
    const currentScheme = currentFacts.selectedScheme;
    const info = schemeInfo[currentScheme];
    
    if (info) {
      let faqKey: keyof typeof info.faqs | null = null;
      
      if (/\bbenefits?\b/i.test(normalized) || /\badvantages?\b/i.test(normalized)) {
        faqKey = "benefits";
      } else if (/\bamounts?\b/i.test(normalized) || /\bmoney\b/i.test(normalized) || /\breceive\b/i.test(normalized) || /\bfinancial assistance\b/i.test(normalized)) {
        faqKey = "amount";
      } else if (/\beligibility\b/i.test(normalized) || /\beligible\b/i.test(normalized) || /\bwho can apply\b/i.test(normalized)) {
        faqKey = "eligibility";
      } else if (/\bdocuments?\b/i.test(normalized) || /\bneeded\b/i.test(normalized)) {
        faqKey = "documents";
      } else if (/\blast date\b/i.test(normalized) || /\bdeadline\b/i.test(normalized)) {
        faqKey = "lastDate";
      } else if (/\bapply\b/i.test(normalized) || /\bprocess\b/i.test(normalized)) {
        faqKey = "apply";
      } else if (/\bstatus\b/i.test(normalized) || /\btrack\b/i.test(normalized)) {
        faqKey = "status";
      }
      
      if (faqKey) {
        const answer = info.faqs[faqKey];
        return {
          response: answer,
          suggestions: ["Benefits", "Amount", "Eligibility", "Documents", "Last Date", "Apply", "Status", "Check Eligibility"],
          facts: currentFacts,
          intent: "faq_answered"
        };
      }
    }

    // Check if the user asks about ANOTHER scheme while in Phase 2
    const otherSchemes = [
      "PM-KISAN", "Rythu Bharosa", "PM Fasal Bima Yojana",
      "Indiramma Illu", "PMAY", "Aarogyasri", "Ayushman Bharat",
      "Jagananna Vidya Deevena", "National Scholarship Schemes",
      "YSR Cheyutha", "PM Mudra Yojana"
    ];
    
    let isOtherSchemeMentioned = false;
    for (const scheme of otherSchemes) {
      if (scheme !== currentScheme) {
        const regex = new RegExp(`\\b${scheme.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(normalized)) {
          isOtherSchemeMentioned = true;
          break;
        }
      }
    }
    
    if (isOtherSchemeMentioned) {
      return {
        response: `You are currently exploring ${currentScheme}.\n\nWould you like to continue with this scheme or search for a new scheme?`,
        suggestions: [
          `Continue exploring ${currentScheme}`,
          "Search for a new scheme"
        ],
        facts: currentFacts,
        intent: "other_scheme_conflict"
      };
    }

    // Unsupported FAQ question fallback
    return {
      response: `I currently support only the common FAQs for this scheme.\n\nYou can ask about:\n\nBenefits\nAmount\nEligibility\nDocuments\nLast Date\nApplication Process\nApplication Status`,
      suggestions: [
        "Benefits",
        "Amount",
        "Eligibility",
        "Documents",
        "Last Date",
        "Apply",
        "Status",
        "Check Eligibility"
      ],
      facts: currentFacts,
      intent: "unsupported_question"
    };
  }

  // 1. Direct Scheme Search (Highest Priority)
  const directSchemeMapping: Record<string, { scheme: string; situation: string }> = {
    "pm-kisan": { scheme: "PM-KISAN", situation: "Farmer / Agriculture" },
    "pm kisan": { scheme: "PM-KISAN", situation: "Farmer / Agriculture" },
    "pmkisan": { scheme: "PM-KISAN", situation: "Farmer / Agriculture" },
    "kisan": { scheme: "PM-KISAN", situation: "Farmer / Agriculture" },
    
    "rythu bharosa": { scheme: "Rythu Bharosa", situation: "Farmer / Agriculture" },
    "rythubharosa": { scheme: "Rythu Bharosa", situation: "Farmer / Agriculture" },
    "bharosa": { scheme: "Rythu Bharosa", situation: "Farmer / Agriculture" },
    
    "pm fasal bima yojana": { scheme: "PM Fasal Bima Yojana", situation: "Farmer / Agriculture" },
    "pmfby": { scheme: "PM Fasal Bima Yojana", situation: "Farmer / Agriculture" },
    "fasal bima": { scheme: "PM Fasal Bima Yojana", situation: "Farmer / Agriculture" },
    
    "indiramma illu": { scheme: "Indiramma Illu", situation: "Housing" },
    "indiramma": { scheme: "Indiramma Illu", situation: "Housing" },
    "indlu": { scheme: "Indiramma Illu", situation: "Housing" },
    
    "pmay": { scheme: "PMAY", situation: "Housing" },
    "pm awas": { scheme: "PMAY", situation: "Housing" },
    "awas yojana": { scheme: "PMAY", situation: "Housing" },
    
    "aarogyasri": { scheme: "Aarogyasri", situation: "Healthcare" },
    "arogyasri": { scheme: "Aarogyasri", situation: "Healthcare" },
    
    "ayushman bharat": { scheme: "Ayushman Bharat", situation: "Healthcare" },
    "ayushman": { scheme: "Ayushman Bharat", situation: "Healthcare" },
    "ab-pmjay": { scheme: "Ayushman Bharat", situation: "Healthcare" },
    
    "jagananna vidya deevena": { scheme: "Jagananna Vidya Deevena", situation: "Education" },
    "vidya deevena": { scheme: "Jagananna Vidya Deevena", situation: "Education" },
    
    "national scholarship schemes": { scheme: "National Scholarship Schemes", situation: "Education" },
    "national scholarship": { scheme: "National Scholarship Schemes", situation: "Education" },
    "scholarship schemes": { scheme: "National Scholarship Schemes", situation: "Education" },
    
    "ysr cheyutha": { scheme: "YSR Cheyutha", situation: "Women / Self Employment" },
    "cheyutha": { scheme: "YSR Cheyutha", situation: "Women / Self Employment" },
    
    "pm mudra yojana": { scheme: "PM Mudra Yojana", situation: "Women / Self Employment" },
    "mudra loan": { scheme: "PM Mudra Yojana", situation: "Women / Self Employment" },
    "mudra": { scheme: "PM Mudra Yojana", situation: "Women / Self Employment" }
  };

  // Find direct match by checking for word boundary substring presence
  for (const key in directSchemeMapping) {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
    if (regex.test(normalized)) {
      const match = directSchemeMapping[key];
      const updatedFacts = {
        ...currentFacts,
        selectedScheme: match.scheme,
        selectedSituation: match.situation,
        phase1_completed: true
      };
      const desc = schemeInfo[match.scheme]?.description || "";
      return {
        response: `${match.scheme}\n\n${desc}\n\nWhat would you like to know about this scheme?`,
        suggestions: [
          "Benefits",
          "Amount",
          "Eligibility",
          "Documents",
          "Last Date",
          "Apply",
          "Status",
          "Check Eligibility"
        ],
        facts: updatedFacts,
        intent: "scheme_selected"
      };
    }
  }

  // 2. Direct Category Search (Second Priority, after Direct Scheme Search)
  const categoryMapping: Record<string, { name: string; label: string; schemes: string[] }> = {
    "farmer schemes": { name: "agriculture", label: "agriculture", schemes: ["🌾 PM-KISAN", "🌱 Rythu Bharosa", "🌾 PM Fasal Bima Yojana"] },
    "agriculture schemes": { name: "agriculture", label: "agriculture", schemes: ["🌾 PM-KISAN", "🌱 Rythu Bharosa", "🌾 PM Fasal Bima Yojana"] },
    "housing schemes": { name: "housing", label: "housing", schemes: ["🏠 Indiramma Illu", "🏠 PMAY"] },
    "healthcare schemes": { name: "healthcare", label: "healthcare", schemes: ["🏥 Aarogyasri", "❤️ Ayushman Bharat"] },
    "medical schemes": { name: "healthcare", label: "healthcare", schemes: ["🏥 Aarogyasri", "❤️ Ayushman Bharat"] },
    "education schemes": { name: "education", label: "education", schemes: ["🎓 Jagananna Vidya Deevena", "📚 National Scholarship Schemes"] },
    "student schemes": { name: "education", label: "education", schemes: ["🎓 Jagananna Vidya Deevena", "📚 National Scholarship Schemes"] },
    "women schemes": { name: "women & self employment", label: "women & self employment", schemes: ["👩 YSR Cheyutha", "💼 PM Mudra Yojana"] },
    "women & self employment schemes": { name: "women & self employment", label: "women & self employment", schemes: ["👩 YSR Cheyutha", "💼 PM Mudra Yojana"] },
    "women and self employment schemes": { name: "women & self employment", label: "women & self employment", schemes: ["👩 YSR Cheyutha", "💼 PM Mudra Yojana"] }
  };

  for (const catKey in categoryMapping) {
    if (normalized === catKey) {
      const match = categoryMapping[catKey];
      return {
        response: `Here are the ${match.label} schemes currently supported:\n\n` + match.schemes.join("\n") + `\n\nWhich scheme would you like to explore?`,
        suggestions: match.schemes,
        facts: currentFacts,
        intent: "category_searched"
      };
    }
  }

  // 3. Situation Detection
  const situations = [
    {
      name: "Farmer / Agriculture",
      patterns: [
        /\bi am a farmer\b/i,
        /\bi'm a farmer\b/i,
        /\bi do farming\b/i,
        /\bi work in agriculture\b/i,
        /\bfarmer schemes\b/i,
        /\bagriculture support\b/i,
        /\bcrop support\b/i,
        /\bcrop insurance\b/i,
        /\bseed subsidy\b/i,
        /\bfertilizer subsidy\b/i,
        /\bagriculture loan\b/i,
        /\bfarmer loan\b/i,
        /\bnew schemes for farmers\b/i,
        /\bfinancial support for farmers\b/i,
        /\bmy crops? (failed|damaged|destroyed|lost)\b/i,
        /\bcrop (failure|loss|damage)\b/i,
        /\bi lost my crop\b/i,
        /\bi need farmer\b/i,
        /\bagriculture\b/i,
      ],
      schemes: ["🌾 PM-KISAN", "🌱 Rythu Bharosa", "🌾 PM Fasal Bima Yojana"],
      response: `Based on your situation, these schemes may be suitable for you.\n\n🌾 PM-KISAN\n🌱 Rythu Bharosa\n🌾 PM Fasal Bima Yojana\n\nWhich scheme would you like to explore?`
    },
    {
      name: "Housing",
      patterns: [
        /\bi need a house\b/i,
        /\bi don't own a house\b/i,
        /\bhousing schemes?\b/i,
        /\bgovernment house\b/i,
        /\bhome assistance\b/i,
        /\bhouse construction support\b/i,
        /\baffordable housing\b/i,
        /\bhouse loan support\b/i,
        /\bi want to build a house\b/i,
        /\bpucca house\b/i,
        /\bi have no house\b/i,
      ],
      schemes: ["🏠 Indiramma Illu", "🏠 PMAY"],
      response: `Based on your situation, these housing schemes may be suitable.\n\n🏠 Indiramma Illu\n🏠 PMAY\n\nWhich scheme would you like to explore?`
    },
    {
      name: "Healthcare",
      patterns: [
        /\bi need medical help\b/i,
        /\bi need treatment\b/i,
        /\bhospital expenses\b/i,
        /\bsurgery support\b/i,
        /\btreatment support\b/i,
        /\bhealth insurance\b/i,
        /\bmedical assistance\b/i,
        /\bhospital bills\b/i,
        /\bhealthcare schemes?\b/i,
        /\bcancer treatment\b/i,
        /\bheart surgery\b/i,
        /\bkidney (dialysis|treatment)\b/i,
        /\bfree treatment\b/i,
      ],
      schemes: ["🏥 Aarogyasri", "❤️ Ayushman Bharat"],
      response: `Based on your situation, these healthcare schemes may be suitable.\n\n🏥 Aarogyasri\n❤️ Ayushman Bharat\n\nWhich scheme would you like to explore?`
    },
    {
      name: "Education",
      patterns: [
        /\bi'm a student\b/i,
        /\bi am a student\b/i,
        /\bscholarship\b/i,
        /\bcollege fees\b/i,
        /\beducation support\b/i,
        /\btuition fee\b/i,
        /\bdegree student\b/i,
        /\bfinancial support for education\b/i,
        /\beducation schemes?\b/i,
        /\bstudent scheme\b/i,
        /\bi need a scholarship\b/i,
        /\bmy (daughter|son|child) (joined|is in) college\b/i,
        /\bmy child (joined|is in) school\b/i,
        /\bhigher studies\b/i,
      ],
      schemes: ["🎓 Jagananna Vidya Deevena", "📚 National Scholarship Schemes"],
      response: `Based on your situation, these education schemes may be suitable.\n\n🎓 Jagananna Vidya Deevena\n📚 National Scholarship Schemes\n\nWhich scheme would you like to explore?`
    },
    {
      name: "Women / Self Employment",
      patterns: [
        /\bwomen schemes\b/i,
        /\bself employment\b/i,
        /\bi want to start a business\b/i,
        /\bsmall business loan\b/i,
        /\bbusiness support\b/i,
        /\bwomen financial assistance\b/i,
        /\bshg support\b/i,
        /\bentrepreneurship support\b/i,
        /\bwomen (&|and) self employment schemes\b/i,
        /\bmy husband (passed away|died|is no more)\b/i,
        /\bi am a widow\b/i,
        /\bwidow (support|pension|scheme)\b/i,
        /\bi need pension\b/i,
        /\bi need help\b/i,
        /\bi have no income\b/i,
      ],
      schemes: ["👩 YSR Cheyutha", "💼 PM Mudra Yojana"],
      response: `Based on your situation, these schemes may be suitable.\n\n👩 YSR Cheyutha\n💼 PM Mudra Yojana\n\nWhich scheme would you like to explore?`
    }
  ];

  for (const sit of situations) {
    for (const pat of sit.patterns) {
      if (pat.test(normalized)) {
        return {
          response: sit.response,
          suggestions: sit.schemes,
          facts: currentFacts,
          intent: "situation_detected"
        };
      }
    }
  }

  // 3. Fallback matching for partial strings with emoji/text (like suggestion chip selections)
  const cleanSchemes = [
    { text: "pm-kisan", scheme: "PM-KISAN", situation: "Farmer / Agriculture" },
    { text: "rythu bharosa", scheme: "Rythu Bharosa", situation: "Farmer / Agriculture" },
    { text: "pm fasal bima yojana", scheme: "PM Fasal Bima Yojana", situation: "Farmer / Agriculture" },
    { text: "indiramma illu", scheme: "Indiramma Illu", situation: "Housing" },
    { text: "pmay", scheme: "PMAY", situation: "Housing" },
    { text: "aarogyasri", scheme: "Aarogyasri", situation: "Healthcare" },
    { text: "ayushman bharat", scheme: "Ayushman Bharat", situation: "Healthcare" },
    { text: "jagananna vidya deevena", scheme: "Jagananna Vidya Deevena", situation: "Education" },
    { text: "national scholarship schemes", scheme: "National Scholarship Schemes", situation: "Education" },
    { text: "ysr cheyutha", scheme: "YSR Cheyutha", situation: "Women / Self Employment" },
    { text: "pm mudra yojana", scheme: "PM Mudra Yojana", situation: "Women / Self Employment" }
  ];

  for (const cs of cleanSchemes) {
    if (normalized.includes(cs.text)) {
      const updatedFacts = {
        ...currentFacts,
        selectedScheme: cs.scheme,
        selectedSituation: cs.situation,
        phase1_completed: true
      };
      const desc = schemeInfo[cs.scheme]?.description || "";
      return {
        response: `${cs.scheme}\n\n${desc}\n\nWhat would you like to know about this scheme?`,
        suggestions: [
          "Benefits",
          "Amount",
          "Eligibility",
          "Documents",
          "Last Date",
          "Apply",
          "Status",
          "Check Eligibility"
        ],
        facts: updatedFacts,
        intent: "scheme_selected"
      };
    }
  }

  // 4. Fallback (Unsupported Input)
  return {
    response: `This demo currently supports only the selected government schemes.\n\nI can help you with:\n\nFarmer Schemes\nHousing Schemes\nHealthcare Schemes\nEducation Schemes\nWomen & Self Employment Schemes\n\nPlease describe your situation, or pick a category to explore.`,
    suggestions: [
      "Farmer Schemes",
      "Housing Schemes",
      "Healthcare Schemes",
      "Education Schemes",
      "Women & Self Employment Schemes"
    ],
    facts: currentFacts,
    intent: "fallback"
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = await readDb();
  const language = body.language === "te" || body.language === "hi" || body.language === "kn" ? body.language : "en";

  const userMsg = String(body.message || "").trim().toLowerCase();

  // "Track Application" → return status of most recent application
  if (userMsg === "track application" || userMsg === "track my application" || userMsg === "check status") {
    const app = db.applications[0];
    if (!app) {
      const noApps = "You have no submitted applications yet. Please complete an application first.";
      db.history.unshift({ id: crypto.randomUUID(), input: String(body.message || ""), response: noApps, at: new Date().toISOString() });
      await writeDb(db);
      return NextResponse.json({
        intent: "status_tracking",
        detectedLanguage: language,
        facts: db.profileFacts,
        response: noApps,
        suggestions: ["Search Another Scheme"],
        canApply: false,
      });
    }
    const responseText = `📄 Latest Application\n\n${summarizeStatus(app, language)}\n\nProgress:\n\n${app.statusHistory.map((s) => `• ${s.status} — ${new Date(s.at).toLocaleString()}\n  ${s.note}`).join("\n")}`;
    db.history.unshift({ id: crypto.randomUUID(), input: String(body.message || ""), response: responseText, at: new Date().toISOString() });
    await writeDb(db);
    return NextResponse.json({
      intent: "status_tracking",
      detectedLanguage: language,
      facts: db.profileFacts,
      application: app,
      response: responseText,
      suggestions: ["Search Another Scheme"],
      canApply: false,
    });
  }

  // "Cancel" click after eligibility → abort workflow gracefully
  if (userMsg === "cancel" && db.profileFacts.eligibility_confirmed === true && !db.profileFacts.application_mode) {
    db.profileFacts.eligibility_confirmed = false;
    db.profileFacts.checking_eligibility = false;
    db.profileFacts.agreed_to_apply = false;
    db.profileFacts.application_mode_prompted = false;
    const responseText = "Application cancelled. Let me know if you want to explore other schemes.";
    db.history.unshift({ id: crypto.randomUUID(), input: "Cancel", response: responseText, at: new Date().toISOString() });
    await writeDb(db);
    return NextResponse.json({
      intent: "workflow_cancelled",
      detectedLanguage: language,
      facts: db.profileFacts,
      response: responseText,
      suggestions: ["Search Another Scheme"],
      canApply: false,
    });
  }

  // Phase 5 Gate — "Apply Now" click after eligibility passed → ask Fetch vs Manual
  if (userMsg === "apply now" && !db.profileFacts.application_mode &&
      (db.profileFacts.checking_eligibility === true || String(db.profileFacts.checking_eligibility) === "true") &&
      db.profileFacts.eligibility_confirmed === true) {
    db.profileFacts.application_mode_prompted = true;
    db.history.unshift({
      id: crypto.randomUUID(),
      input: "Apply Now",
      response: "Would you like to fetch documents from linked Government systems?",
      at: new Date().toISOString(),
    });
    await writeDb(db);
    return NextResponse.json({
      intent: "application_mode_prompt",
      detectedLanguage: language,
      facts: db.profileFacts,
      response: "Great — let's begin your application.\n\nWould you like to fetch documents from linked Government systems, or provide them manually?",
      suggestions: ["Fetch Automatically", "Manual Entry"],
      canApply: false,
    });
  }

  // Phase 5 — "Fetch Automatically" → auto-fill application fields from persona seeds + demo defaults → go straight to Review
  if (userMsg === "fetch automatically" && db.profileFacts.eligibility_confirmed === true) {
    const activeItemId = String(db.profileFacts.active_scheme_id || "");
    const activeItem = activeItemId ? getKnowledgeItem(activeItemId) : undefined;
    if (activeItem) {
      const demoDefaults: Record<string, string | number | boolean> = {
        aadhaar_number: "999900001234",
        mobile_number: "9000000000",
        bank_account_number: "SBIN0009876543",
        ifsc_code: "SBIN0001234",
        village: "—",
        mandal: "—",
        land_ownership_details: "Verified via demo integration",
        land_survey_number: "SY 000/0",
        ekyc: true,
      };
      const filled: ProfileFacts = { ...db.profileFacts };
      const fetchedItems: string[] = [];
      const missingItems: string[] = [];
      for (const q of activeItem.applicationQuestions || []) {
        if (filled[q.key] === undefined || filled[q.key] === "") {
          if (demoDefaults[q.key] !== undefined) {
            filled[q.key] = demoDefaults[q.key];
            fetchedItems.push(q.question.replace(/Please enter your\s+/i, "").replace(/\?$/, ""));
          } else {
            missingItems.push(q.question.replace(/Please enter your\s+/i, "").replace(/\?$/, ""));
          }
        } else {
          fetchedItems.push(q.question.replace(/Please enter your\s+/i, "").replace(/\?$/, ""));
        }
      }
      filled.agreed_to_apply = true;
      filled.application_mode = "fetch";
      filled.application_ready = true;
      db.profileFacts = filled;

      const lines: string[] = [];
      lines.push("Documents auto-fetched from linked Government systems (Aadhaar, Bank NPCI, Land Records, etc.).");
      lines.push("");
      lines.push("Fetched:");
      fetchedItems.forEach((n) => lines.push(`✔ ${n}`));
      if (missingItems.length > 0) {
        lines.push("");
        lines.push("Pending (please review):");
        missingItems.forEach((n) => lines.push(`☐ ${n}`));
      }
      lines.push("");
      lines.push("Please review the details and confirm to submit.");

      const response = lines.join("\n");
      db.history.unshift({ id: crypto.randomUUID(), input: "Fetch Automatically", response, at: new Date().toISOString() });
      await writeDb(db);
      return NextResponse.json({
        intent: "application_ready",
        detectedLanguage: language,
        item: activeItem,
        facts: filled,
        response,
        suggestions: ["Confirm & Submit", "Edit"],
        canApply: true,
      });
    }
  }

  // Phase 5 — "Manual Entry" → set mode & proceed with one-at-a-time question flow
  if (userMsg === "manual entry" && db.profileFacts.eligibility_confirmed === true) {
    db.profileFacts.application_mode = "manual";
    db.profileFacts.agreed_to_apply = true;
    await writeDb(db);
    // fall through to standard engine flow — it will pick up next unanswered applicationQuestion
  }

  // Phase 6 — "Confirm & Submit" click → trigger apply
  if (userMsg === "confirm & submit" || userMsg === "confirm and submit" || userMsg === "confirm submit") {
    const activeItemId = String(db.profileFacts.active_scheme_id || "");
    const item = activeItemId ? getKnowledgeItem(activeItemId) : undefined;
    if (item) {
      const app = createApplication(item, db.profileFacts);
      db.applications.unshift(app);
      db.notifications.unshift({
        id: crypto.randomUUID(),
        title: "Reference ID generated",
        body: `${app.referenceId} created for ${app.itemName}.`,
        at: new Date().toISOString(),
        read: false,
      });
      db.auditLogs.unshift({ id: crypto.randomUUID(), action: "application_submitted", at: new Date().toISOString(), metadata: { referenceId: app.referenceId } });
      // Reset workflow flags so citizen can start a new one
      db.profileFacts.eligibility_confirmed = false;
      db.profileFacts.checking_eligibility = false;
      db.profileFacts.agreed_to_apply = false;
      db.profileFacts.application_mode = "";
      db.profileFacts.application_mode_prompted = false;
      db.profileFacts.application_ready = false;
      db.profileFacts.active_scheme_id = "";
      db.profileFacts.selectedScheme = "";
      db.profileFacts.phase1_completed = false;
      const responseText = `✔ Application submitted successfully.\n\nSAMANVAI Reference ID: ${app.referenceId}\n\nStatus: ${app.status}\n\nYou can track this application anytime by asking "Track my application" or entering the Reference ID.`;
      db.history.unshift({ id: crypto.randomUUID(), input: "Confirm & Submit", response: responseText, at: new Date().toISOString() });
      await writeDb(db);
      return NextResponse.json({
        intent: "application_submitted",
        detectedLanguage: language,
        item,
        facts: db.profileFacts,
        application: app,
        response: responseText,
        suggestions: ["Track Application", "Search Another Scheme"],
        canApply: false,
      });
    }
  }

  if (userMsg === "continue application") {
    db.profileFacts.agreed_to_apply = true;
    await writeDb(db);
  } else if (userMsg === "search another scheme") {
    const baseKeys = ["state", "district", "name", "date_of_birth", "gender", "address"];
    const cleanFacts: Record<string, any> = {};
    for (const key of baseKeys) {
      if (db.profileFacts[key] !== undefined) {
        cleanFacts[key] = db.profileFacts[key];
      }
    }
    db.profileFacts = cleanFacts;
    db.history.unshift({
      id: crypto.randomUUID(),
      input: "Search Another Scheme",
      response: "Got it! Let's search again. What can I help you find today?",
      at: new Date().toISOString()
    });
    await writeDb(db);
    return NextResponse.json({
      intent: "restart_search",
      detectedLanguage: language,
      facts: cleanFacts,
      response: "Got it! Let's search again. What can I help you find today?",
      suggestions: [
        "Farmer Schemes",
        "Housing Schemes",
        "Healthcare Schemes",
        "Education Schemes",
        "Women & Self Employment Schemes"
      ],
      canApply: false
    });
  }

  if (body.type === "reset") {
    // Preserve ALL persona seed / identity / eligibility / application data.
    // Only clear transient workflow state so the citizen starts a fresh conversation.
    const clearKeys = [
      "checking_eligibility", "agreed_to_apply", "eligibility_confirmed",
      "application_mode", "application_mode_prompted", "application_ready",
      "active_scheme_id", "selectedScheme", "selectedSituation",
      "phase1_completed", "attempted_eligibility",
    ];
    const preserved: ProfileFacts = { ...db.profileFacts };
    for (const k of clearKeys) delete preserved[k];
    db.profileFacts = preserved;
    db.history = [];
    await writeDb(db);
    return NextResponse.json({ ok: true });
  }

  if (body.type === "profile") {
    const profile = String(body.profile || "live");
    const personaSeeds: Record<string, ProfileFacts> = {
      lakshmi: {
        __persona: "Lakshmi",
        __persona_role: "Homemaker (Widow) — Guided Demo",
        __persona_scripted: true,
        name: "Lakshmi Devi",
        gender: "Female",
        date_of_birth: "1968-06-12",
        state: "Telangana",
        district: "Hyderabad",
        address: "H.No. 12-4-32, Malakpet, Hyderabad",
        village: "Malakpet",
        mandal: "Amberpet",
        has_white_ration_card: true,
        has_white_card: true,
        has_bpl_card: true,
        is_female: true,
        social_category: "BC",
        family_income: 90000,
        aadhaar_number: "999912345678",
        mobile_number: "9876500011",
        bank_account_number: "SBIN0001234567",
        ifsc_code: "SBIN0002345",
        has_sadarem_cert: true,
        disability_percentage: 45,
      },
      suresh: {
        __persona: "Suresh",
        __persona_role: "Farmer — Guided Demo",
        __persona_scripted: true,
        name: "Suresh Reddy",
        gender: "Male",
        date_of_birth: "1978-03-22",
        state: "Andhra Pradesh",
        district: "Guntur",
        address: "D.No. 3-45, Chebrolu Village, Guntur",
        village: "Chebrolu",
        mandal: "Chebrolu",
        owns_cultivable_land: true,
        is_farmer: true,
        owns_or_cultivates_land: true,
        has_pattadar_passbook: true,
        cultivated_crops: true,
        is_notified_crop: true,
        primary_income_source: "Agriculture",
        social_category: "BC",
        family_income: 120000,
        aadhaar_number: "999987654321",
        mobile_number: "9988776655",
        bank_account_number: "APGB0000123456",
        ifsc_code: "APGB0004567",
        land_ownership_details: "Own — Pattadar Passbook No. GNT-2018-4521",
        land_survey_number: "SY 214/2A",
        paid_income_tax: false,
        is_govt_employee: false,
        is_institutional_land: false,
        ekyc: true,
      },
      ramana: {
        __persona: "Ramana",
        __persona_role: "CSC Operator — Guided Demo",
        __persona_scripted: true,
        name: "Ramana Kumar",
        gender: "Male",
        date_of_birth: "1990-11-05",
        state: "Andhra Pradesh",
        district: "Krishna",
        address: "CSC Centre, Main Road, Vijayawada",
        village: "Vijayawada",
        mandal: "Vijayawada Urban",
        __role: "csc_operator",
        social_category: "OC",
        aadhaar_number: "999955443322",
        mobile_number: "9000012345",
        bank_account_number: "HDFC0006789012",
        ifsc_code: "HDFC0001122",
        family_income: 180000,
      },
      live: {
        __persona: "Live Citizen",
        __persona_role: "Natural Conversation",
        __persona_scripted: false,
      },
    };

    // Save the outgoing profile's data into its bucket
    const outgoing = db.currentProfile || "live";
    if (outgoing) {
      db.profilesData[outgoing] = {
        facts: db.profileFacts,
        applications: db.applications,
        history: db.history,
      };
    }
    // Load incoming profile's bucket, or initialize with persona seeds if new
    const incoming = db.profilesData[profile];
    const seed = personaSeeds[profile] || personaSeeds.live;
    if (incoming && Object.keys(incoming.facts).filter((k) => !k.startsWith("__")).length > 0) {
      // Bucket has real data — restore it, but ensure persona metadata is present
      db.profileFacts = {
        __persona: seed.__persona,
        __persona_role: seed.__persona_role,
        __persona_scripted: seed.__persona_scripted,
        ...incoming.facts,
      };
      db.applications = incoming.applications;
      db.history = incoming.history;
    } else {
      // Empty/uninitialized bucket — apply full persona seeds
      db.profileFacts = seed;
      db.applications = incoming?.applications || [];
      db.history = incoming?.history || [];
    }
    db.currentProfile = profile;
    await writeDb(db);
    return NextResponse.json({ ok: true, profile, facts: db.profileFacts, applications: db.applications, history: db.history });
  }

  if (body.type === "preference") {
    db.preferences["citizen-001"] = { ...db.preferences["citizen-001"], samanvaiLanguage: language, consent: true };
    await writeDb(db);
    return NextResponse.json({ ok: true, preferences: db.preferences["citizen-001"] });
  }

  if (body.type === "apply") {
    const item = getKnowledgeItem(body.itemId);
    if (!item) return NextResponse.json({ error: "Knowledge item not found" }, { status: 404 });
    const app = createApplication(item, { ...db.profileFacts, ...(body.facts || {}) });
    db.applications.unshift(app);
    db.notifications.unshift({
      id: crypto.randomUUID(),
      title: "Reference ID generated",
      body: `${app.referenceId} created for ${app.itemName}.`,
      at: new Date().toISOString(),
      read: false,
    });
    db.auditLogs.unshift({ id: crypto.randomUUID(), action: "application_submitted", at: new Date().toISOString(), metadata: { referenceId: app.referenceId } });
    await writeDb(db);
    return NextResponse.json({ application: app, response: `Your SAMANVAI Reference ID is ${app.referenceId}.\n\n${summarizeStatus(app, language)}` });
  }

  if (body.type === "status") {
    const referenceId = String(body.referenceId || body.message || "").match(/SMV-[A-Z0-9]+-\d{8}-[A-Z0-9]+/i)?.[0]?.toUpperCase();
    const app = db.applications.find((record) => record.referenceId === referenceId);
    return NextResponse.json({ response: summarizeStatus(app, language), application: app });
  }

  if (body.type === "upload") {
    const referenceId = body.referenceId;
    const documentName = body.documentName;
    const app = db.applications.find((record) => record.referenceId === referenceId);
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    const doc = app.documents.find((d) => d.name === documentName);
    if (doc) {
      doc.status = "Uploaded & Verified";
      app.updatedAt = new Date().toISOString();
      app.statusHistory.push({
        status: app.status,
        at: new Date().toISOString(),
        note: `Document '${documentName}' uploaded manually and verified successfully.`
      });
      await writeDb(db);
      return NextResponse.json({ ok: true, application: app });
    }
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Merge database facts with incoming client facts
  let activeFacts = { ...db.profileFacts, ...(body.facts || {}) };

  // Phase 1 - Situation Detection & Scheme Recommendation
  if (body.message || body.type === "message") {
    const phase1Result = processPhase1(String(body.message || ""), activeFacts);
    if (phase1Result) {
      db.profileFacts = phase1Result.facts;
      db.history.unshift({
        id: crypto.randomUUID(),
        input: String(body.message || ""),
        response: phase1Result.response,
        at: new Date().toISOString()
      });
      await writeDb(db);
      return NextResponse.json({
        intent: phase1Result.intent,
        detectedLanguage: language,
        facts: phase1Result.facts,
        response: phase1Result.response,
        suggestions: phase1Result.suggestions,
        canApply: false,
      });
    }
  }

  let activeItemId = body.itemId || activeFacts.active_scheme_id;

  // 1. Detect user intent
  const intent = classifyIntent(String(body.message || ""), activeItemId, body.lastQuestionKey);

  if (intent === "greeting") {
    const greetingText: Record<string, string> = {
      en: "Namaste! How can I assist you today?",
      te: "నమస్కారం! నేను మీకు ఈ రోజు ఏ విధంగా సహాయపడగలను?",
      hi: "नमस्ते! आज मैं आपकी क्या मदद कर सकता हूँ?",
      kn: "ನಮಸ್ಕಾರ! ಇವತ್ತು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
    };
    const responseText = greetingText[language] || greetingText.en;
    
    return NextResponse.json({
      intent: "greeting",
      detectedLanguage: language,
      facts: activeFacts,
      eligible: undefined,
      nextQuestion: undefined,
      response: responseText,
      recommendations: [],
      canApply: false,
      suggestions: ["PM-KISAN", "Aarogyasri", "Vidya Deevena", "Rythu Bharosa"],
    });
  }

  // 2. Workflow selection & Form Mapping (ONLY for application_workflow)
  const explicitItem = findKnowledgeItem(String(body.message || ""));
  const isNewWorkflowStart = explicitItem && (!activeItemId || explicitItem.id !== activeItemId);
  
  if (isNewWorkflowStart) {
    activeItemId = explicitItem.id;
    // Topic changed! Reset context but keep base keys:
    const baseKeys = ["state", "district", "name", "date_of_birth", "gender", "address"];
    const cleanFacts: ProfileFacts = {};
    for (const key of baseKeys) {
      if (activeFacts[key] !== undefined) {
        cleanFacts[key] = activeFacts[key];
      }
    }
    cleanFacts.active_scheme_id = activeItemId;
    activeFacts = cleanFacts;
    db.profileFacts = cleanFacts;
  }

  // Clear fields on Check Eligibility action to start fresh
  const isCheckingStart = /\b(check eligibility|eligibility|qualify|am i eligible|check eligibility details)\b/i.test(String(body.message || ""));
  const matchedId = explicitItem?.id || activeItemId;
  const matchedScheme = matchedId ? getKnowledgeItem(matchedId) : undefined;

  if (isCheckingStart && matchedScheme) {
    const baseKeys = ["state", "district", "name", "date_of_birth", "gender", "address"];
    const cleanFacts: ProfileFacts = {};
    for (const key of baseKeys) {
      if (activeFacts[key] !== undefined) {
        cleanFacts[key] = activeFacts[key];
      }
    }
    cleanFacts.active_scheme_id = matchedId;
    cleanFacts.checking_eligibility = true;
    activeFacts = cleanFacts;
    db.profileFacts = cleanFacts;
  }

  if (intent === "application_workflow" || activeItemId) {
    // If answering a question, validate and map it to the active facts
    if (body.lastQuestionKey) {
      activeFacts = mergeAnswerWithQuestion(activeFacts, body.lastQuestionKey, String(body.message || ""));
    }
  }

  // 3. Evaluate rule engine state based on clean pipeline inputs
  const ruleResult = answerMessage(
    String(body.message || ""),
    language,
    activeFacts,
    activeItemId,
    body.lastQuestionKey
  );

  // Format chat history
  const formattedHistory: Array<{ role: "citizen" | "assistant"; text: string }> = [];
  for (const h of db.history.slice(0, 10).reverse()) {
    formattedHistory.push({ role: "citizen", text: h.input });
    formattedHistory.push({ role: "assistant", text: h.response });
  }

  // Get natural response (integrates LLM & local fallback)
  const naturalResponse = await getSamanvaiResponse(
    String(body.message || ""),
    formattedHistory,
    ruleResult.facts,
    {
      item: ruleResult.item,
      eligible: ruleResult.eligible,
      nextQuestion: ruleResult.nextQuestion,
      canApply: ruleResult.canApply,
    },
    language
  );

  // Merge facts and re-evaluate rules to synchronize
  let finalFacts = { ...ruleResult.facts };
  if (intent === "application_workflow" || activeItemId) {
    const extracted = { ...(naturalResponse.extractedFacts || {}) };
    if (body.lastQuestionKey !== "agreed_to_apply") {
      delete extracted.agreed_to_apply;
    }
    finalFacts = { ...finalFacts, ...extracted };
  }
  
  if (matchedId) {
    finalFacts.active_scheme_id = matchedId;
  }

  const finalRuleResult = answerMessage(
    String(body.message || ""),
    language,
    finalFacts,
    matchedId,
    body.lastQuestionKey
  );

  const hasCheckingOrApply = Boolean(
    matchedId &&
    (finalRuleResult.facts.checking_eligibility === true ||
     String(finalRuleResult.facts.checking_eligibility) === "true" ||
     finalRuleResult.facts.agreed_to_apply === true ||
     String(finalRuleResult.facts.agreed_to_apply) === "true")
  );

  const responseText = hasCheckingOrApply ? finalRuleResult.response : naturalResponse.response;

  // Form is created ONLY after user chooses a scheme and confirms they want to apply
  const hasStartedWorkflow = Boolean(
    matchedId &&
    (finalRuleResult.facts.agreed_to_apply === true || String(finalRuleResult.facts.agreed_to_apply) === "true")
  );

  // Save updated facts and history
  db.profileFacts = { ...db.profileFacts, ...finalRuleResult.facts };

  // Phase 4 Gate — Eligibility passed → prepend Prerequisites Checklist to the response
  let phase4Response = responseText;
  let phase4Suggestions: string[] | undefined = undefined;
  if (hasCheckingOrApply && finalRuleResult.eligible === true &&
      !db.profileFacts.application_mode && !db.profileFacts.application_mode_prompted) {
    db.profileFacts.eligibility_confirmed = true;
    const item = finalRuleResult.item;
    if (item) {
      const checklistLines: string[] = [];
      checklistLines.push("✅ Eligible");
      checklistLines.push("");
      checklistLines.push(`Congratulations! You are eligible for ${item.name}.`);
      checklistLines.push("");
      checklistLines.push("Prerequisites Checklist:");
      for (const doc of item.documents) {
        checklistLines.push(`☐ ${doc.name}`);
      }
      checklistLines.push("");
      checklistLines.push("Click Apply Now to begin the application.");
      phase4Response = checklistLines.join("\n");
      phase4Suggestions = ["Apply Now", "Cancel"];
    }
  }

  db.history.unshift({ id: crypto.randomUUID(), input: String(body.message || ""), response: phase4Response, at: new Date().toISOString() });
  db.auditLogs.unshift({ id: crypto.randomUUID(), action: "assistant_message", at: new Date().toISOString(), metadata: { intent: finalRuleResult.intent, itemId: matchedId || "unknown" } });
  await writeDb(db);

  const returnItem = hasCheckingOrApply ? finalRuleResult.item : undefined;
  const returnFacts = finalRuleResult.facts;
  const returnEligible = hasCheckingOrApply ? finalRuleResult.eligible : undefined;
  
  let returnNextQ = naturalResponse.nextQuestion || finalRuleResult.nextQuestion;

  // Strict check: Only move to the next question after storing the current answer!
  if (body.lastQuestionKey && (finalFacts[body.lastQuestionKey] === undefined || finalFacts[body.lastQuestionKey] === "")) {
    const activeItem = getKnowledgeItem(matchedId || "");
    if (activeItem) {
      const q = activeItem.questions.find((question) => question.key === body.lastQuestionKey) ||
                [
                  { key: "state", question: "State", type: "text" as const },
                  { key: "district", question: "District", type: "text" as const },
                  { key: "agreed_to_apply", question: "Would you like to apply for this scheme?", type: "text" as const },
                  { key: "name", question: "Name", type: "text" as const },
                  { key: "date_of_birth", question: "Date of Birth", type: "date" as const },
                  { key: "gender", question: "Gender", type: "text" as const },
                  { key: "address", question: "Address", type: "text" as const }
                ].find((uq) => uq.key === body.lastQuestionKey);
      if (q) {
        returnNextQ = q;
        const isResponseAsking = naturalResponse.response.includes(q.question);
        if (!isResponseAsking) {
          const warningPrefix: Record<string, string> = {
            en: "I didn't catch that. Please answer the question: ",
            te: "నాకు అర్థం కాలేదు. దయచేసి ఈ ప్రశ్నకి సమాధానం ఇవ్వండి: ",
            hi: "मुझे समझ नहीं आया। कृपया इस प्रश्न का उत्तर दें: ",
            kn: "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಈ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಿ: "
          };
          const resolvedPrefix = warningPrefix[language] || warningPrefix.en;
          
          naturalResponse.response = `${resolvedPrefix}\n\n${q.question}`;
        }
      }
    }
  }

  const returnCanApply = hasStartedWorkflow ? (naturalResponse.canApply || finalRuleResult.canApply) : false;

  let returnSuggestions = naturalResponse.suggestions || [];
  
  if (returnEligible !== undefined) {
    if (returnEligible === true) {
      returnSuggestions = ["Continue Application"];
    } else {
      returnSuggestions = ["Search Another Scheme"];
    }
  } else if (returnNextQ) {
    if (returnNextQ.choices && returnNextQ.choices.length > 0) {
      returnSuggestions = returnNextQ.choices;
    } else {
      const key = returnNextQ.key;
      const booleanKeys = [
        "owns_cultivable_land", "is_institutional_land", "paid_income_tax",
        "pension_over_10k", "is_registered_professional", "is_ts_resident",
        "has_bpl_card", "owns_pucca_house", "received_prior_housing",
        "owns_plot", "has_income_proof", "is_female_owner",
        "has_white_ration_card", "is_covered_procedure", "attendance_above_75",
        "has_govt_employee", "has_family_caste_cert", "is_notified_crop",
        "is_loanee_farmer", "has_sowing_proof", "has_sadarem_cert",
        "has_white_card", "owns_car_or_taxpayer", "agreed_to_apply",
        "is_ap_resident", "listed_in_secc", "is_govt_employee",
        "child_attendance_above_75", "is_female", "owns_four_wheeler",
        "has_lpg_connection", "is_eligible_farmer", "is_exclusion_category",
        "is_farmer", "owns_or_cultivates_land", "is_registered_beneficiary",
        "cultivated_crops", "crop_covered", "owns_permanent_house",
        "has_ration_card", "covered_other_health", "has_required_id",
        "covered_other_applicable", "is_student", "enrolled_eligible_inst",
        "satisfy_criteria", "owns_or_starts_business", "meet_business_reqs",
        "eligible_category"
      ];
      if (returnNextQ.type === "boolean" || booleanKeys.includes(key)) {
        returnSuggestions = ["Yes", "No"];
      } else if (key === "gender") {
        returnSuggestions = ["Male", "Female", "Other"];
      } else if (key === "state") {
        returnSuggestions = ["Andhra Pradesh", "Telangana", "Karnataka"];
      } else if (key === "district") {
        returnSuggestions = ["Hyderabad", "Ranga Reddy", "Medchal", "Guntur", "Krishna"];
      } else if (key === "primary_income_source") {
        returnSuggestions = ["Agriculture", "Salary", "Business", "Other"];
      } else if (key === "social_category") {
        returnSuggestions = ["SC", "ST", "BC", "OBC", "Minority", "General", "OC", "EBC"];
      } else if (key === "admission_type") {
        returnSuggestions = ["Convenor Quota", "Management Quota"];
      } else if (key === "sector_type") {
        returnSuggestions = ["Manufacturing", "Service"];
      }
    }
  }

  return NextResponse.json({
    intent: intent,
    detectedLanguage: naturalResponse.detectedLanguage,
    item: returnItem,
    facts: returnFacts,
    eligible: returnEligible,
    nextQuestion: returnNextQ,
    response: phase4Response,
    recommendations: finalRuleResult.recommendations,
    canApply: returnCanApply,
    suggestions: phase4Suggestions || returnSuggestions,
  });
}
