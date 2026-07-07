export type LanguageCode = "en" | "te" | "hi" | "kn";

export type KnowledgeItem = {
  id: string;
  kind: "scheme" | "service";
  name: string;
  aliases: string[];
  type: string;
  department: string;
  objective: string;
  targetBeneficiaries: string;
  eligibility: string[];
  questions: Array<{
    key: string;
    question: string;
    type: "boolean" | "number" | "text" | "choice" | "date";
    choices?: string[];
  }>;
  applicationQuestions?: Array<{
    key: string;
    question: string;
    type: "boolean" | "number" | "text" | "choice" | "date";
    choices?: string[];
  }>;
  benefits: string[];
  documents: Array<{
    name: string;
    requirement: "Mandatory" | "Conditional" | "Situational" | "Resulting Doc";
    source: string;
    manualUpload: string;
  }>;
  workflow: string[];
  fees: string;
  processingTime: string;
  statusFlow: string[];
  rejectionReasons: string[];
  grievance: string;
  recommendations: Array<{ when: string; recommend: string[] }>;
};

export const knowledgeBase: KnowledgeItem[] = [
  {
    id: "pmkisan",
    kind: "scheme",
    name: "PM-KISAN",
    aliases: ["pm kisan", "farmer pension", "farmer support", "kisan samman", "agriculture support"],
    type: "Central Government",
    department: "Ministry of Agriculture & Farmers Welfare",
    objective: "Income support to landholding farmers for agricultural inputs and related needs.",
    targetBeneficiaries: "All landholding farmer families across India.",
    eligibility: [
      "Applicant family must own cultivable agricultural land.",
      "Institutional landholders are excluded.",
      "Income taxpayers, most government employees, high pensioners, constitutional post holders, and registered professionals are excluded.",
    ],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana", "Karnataka"] },
      { key: "owns_cultivable_land", question: "Do you own cultivable agricultural land?", type: "boolean" },
      { key: "paid_income_tax", question: "Did anyone in your family pay income tax in the previous year?", type: "boolean" },
      { key: "is_govt_employee", question: "Is any member of your family a government employee?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "ifsc_code", question: "Please enter your IFSC Code.", type: "text" },
      { key: "land_ownership_details", question: "Please enter your Land Ownership Details.", type: "text" },
      { key: "land_survey_number", question: "Please enter your Land Survey Number.", type: "text" },
      { key: "village", question: "Please enter your Village.", type: "text" },
      { key: "mandal", question: "Please enter your Mandal.", type: "text" },
      { key: "district", question: "Please enter your District.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Rs. 6,000 per year per family.", "Paid in three DBT installments of Rs. 2,000 every four months."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "eKYC / UIDAI verification", manualUpload: "No" },
      { name: "Landholding Papers (Khasra/Khatauni)", requirement: "Mandatory", source: "State Land Records", manualUpload: "Yes, if API fails" },
      { name: "Aadhaar-linked Bank Account", requirement: "Mandatory", source: "NPCI Mapper", manualUpload: "No" },
    ],
    workflow: ["Application through CSC or self-registration portal.", "State/UT verifies land ownership and Aadhaar.", "Data uploaded to PM-KISAN portal.", "DBT installment credited."],
    fees: "Self-registration and OTP eKYC are free. CSC biometric authentication costs Rs. 15 to Rs. 50.",
    processingTime: "Varies by State Government field verification schedule.",
    statusFlow: ["Draft", "Submitted", "Pending State Verification", "Aadhaar Authenticated", "NPCI Mapped", "Approved for Payment", "Installment Credited"],
    rejectionReasons: ["e-KYC not completed.", "Aadhaar mismatch or bank not linked.", "Land record mismatch or pending verification.", "Applicant falls under an exclusion category."],
    grievance: "District Level Grievance Redressal Monitoring Committee, PM-KISAN helpdesk, and Farmers' Corner.",
    recommendations: [{ when: "owns_cultivable_land is true and PM-KISAN is approved", recommend: ["Pradhan Mantri Fasal Bima Yojana (PMFBY)", "Kisan Credit Card (KCC)"] }],
  },
  {
    id: "indiramma-illu",
    kind: "scheme",
    name: "Indiramma Illu",
    aliases: ["indiramma", "indlu", "house scheme", "housing telangana", "i want house"],
    type: "State Government",
    department: "Telangana State Housing Department",
    objective: "Financial assistance and land support for pucca houses for economically weaker sections.",
    targetBeneficiaries: "Homeless, landless citizens, and EWS/BPL families in Telangana.",
    eligibility: ["Permanent Telangana resident.", "BPL or EWS household.", "Must not already own a pucca house.", "Must not have received housing under any government scheme after 1995."],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana"] },
      { key: "owns_permanent_house", question: "Do you own a permanent house?", type: "boolean" },
      { key: "family_income", question: "What is your annual family income?", type: "choice", choices: ["Below ₹2.5 Lakhs", "Above ₹2.5 Lakhs"] },
      { key: "owns_plot", question: "Do you own a house site?", type: "boolean" },
      { key: "received_prior_housing", question: "Have you already received a government housing benefit?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "address", question: "Please enter your Address.", type: "text" },
      { key: "district", question: "Please enter your District.", type: "text" },
      { key: "mandal", question: "Please enter your Mandal.", type: "text" },
      { key: "village", question: "Please enter your Village.", type: "text" },
      { key: "family_income", question: "What is your annual family income?", type: "choice", choices: ["Below ₹2.5 Lakhs", "Above ₹2.5 Lakhs"] },
      { key: "house_site_details", question: "Please enter your House Site Details.", type: "text" },
      { key: "existing_house_details", question: "Please enter your Existing House Details.", type: "text" },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" },
      { key: "photo", question: "Please upload your Photo.", type: "text" }
    ],
    benefits: ["Rs. 5,00,000 assistance for general category applicants.", "Rs. 6,00,000 assistance for SC/ST applicants.", "Free plot for eligible landless beneficiaries.", "Stage-wise DBT release."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "eKYC / UIDAI", manualUpload: "No" },
      { name: "BPL / Ration Card", requirement: "Mandatory", source: "State Civil Supplies API", manualUpload: "No" },
      { name: "Income & Caste Certificate", requirement: "Mandatory", source: "MeeSeva / e-District", manualUpload: "No" },
      { name: "Land Ownership Proof", requirement: "Situational", source: "Dharani Portal", manualUpload: "Yes, if API fails" },
    ],
    workflow: ["Apply online or at Gram Panchayat/Municipal Office.", "Revenue records and documents verified.", "Field survey of housing and land condition.", "Shortlisting and stage-wise fund release after inspections."],
    fees: "Application is free.",
    processingTime: "Depends on government survey phases and budget allocation.",
    statusFlow: ["Application Submitted", "Survey Pending", "Field Inspection Completed", "Approved/Waitlisted", "Stage 1 Sanctioned", "Stage 1 Paid", "Completed"],
    rejectionReasons: ["Income exceeds BPL limit.", "Not a Telangana resident.", "Already owns a permanent pucca house.", "Prior housing benefit after 1995."],
    grievance: "Escalate through Gram Sabha, official portal login, municipal officers, or local Tahsildar.",
    recommendations: [{ when: "Telangana resident with BPL card and age over 57", recommend: ["Aasara Pension checks"] }],
  },
  {
    id: "income-certificate",
    kind: "service",
    name: "Income Certificate",
    aliases: ["income certificate", "income proof", "annual income certificate"],
    type: "Government Service",
    department: "State Revenue Department",
    objective: "Certifies annual family income for educational and welfare purposes.",
    targetBeneficiaries: "Any citizen requiring verified family income certification.",
    eligibility: ["Any citizen can apply.", "Declared income must reflect true household earnings."],
    questions: [
      { key: "primary_income_source", question: "What is your primary source of income?", type: "choice", choices: ["Agriculture", "Salary", "Business", "Other"] },
      { key: "has_income_proof", question: "Do you have a current salary slip, IT return, or affidavit?", type: "boolean" },
    ],
    applicationQuestions: [],
    benefits: ["Foundational certificate for Fee Reimbursement, Housing, scholarships, and other welfare schemes."],
    documents: [
      { name: "Aadhaar", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Ration Card / EPIC", requirement: "Mandatory", source: "Civil Supplies / Election data", manualUpload: "No" },
      { name: "Salary Certificate / IT Returns / Affidavit", requirement: "Mandatory", source: "Applicant", manualUpload: "Yes" },
    ],
    workflow: ["Apply via MeeSeva/e-District.", "Forwarded to VRO/RI.", "Physical enquiry if required.", "Tahsildar approval.", "Digital certificate issued."],
    fees: "Typically Rs. 35 to Rs. 50 MeeSeva service charge.",
    processingTime: "Usually 7 to 15 working days.",
    statusFlow: ["Submitted", "Assigned to VRO", "VRO Approved", "Assigned to Tahsildar", "Digitally Signed & Issued"],
    rejectionReasons: ["Incomplete documents.", "Mismatch between declared income and field inquiry.", "Fake affidavits."],
    grievance: "Use the MeeSeva/e-District grievance channel or contact the Revenue office.",
    recommendations: [{ when: "Income Certificate issued below Rs. 2,00,000", recommend: ["Education Scholarships", "Health Schemes"] }],
  },
  {
    id: "pmay-u-2",
    kind: "scheme",
    name: "PMAY",
    aliases: ["pmay", "awas yojana", "urban housing", "central housing"],
    type: "Central Government",
    department: "Ministry of Housing and Urban Affairs",
    objective: "Ensure every eligible urban household has a pucca house with basic amenities.",
    targetBeneficiaries: "EWS, LIG, and MIG urban households.",
    eligibility: ["EWS income up to Rs. 3 lakh, LIG Rs. 3-6 lakh, MIG Rs. 6-9 lakh.", "Family must not own a pucca house anywhere in India.", "Female ownership or joint ownership is mandatory for EWS/LIG.", "No housing benefit in the last 20 years."],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana", "Karnataka"] },
      { key: "owns_pucca_house", question: "Do you own a pucca house?", type: "boolean" },
      { key: "family_income", question: "What is your annual family income?", type: "choice", choices: ["EWS", "LIG", "MIG-I", "MIG-II"] },
      { key: "received_prior_housing", question: "Have you previously received housing assistance?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "address", question: "Please enter your Address.", type: "text" },
      { key: "income_category", question: "Which income category do you belong to?", type: "choice", choices: ["EWS", "LIG", "MIG-I", "MIG-II"] },
      { key: "family_income", question: "What is your annual family income?", type: "choice", choices: ["EWS", "LIG", "MIG-I", "MIG-II"] },
      { key: "existing_house_details", question: "Please enter your Existing House Details.", type: "text" },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "ifsc_code", question: "Please enter your IFSC Code.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" },
      { key: "photo", question: "Please upload your Photo.", type: "text" }
    ],
    benefits: ["Central assistance up to Rs. 2.5 lakh for EWS and up to Rs. 1.5 lakh for LIG.", "Housing loan up to Rs. 25 lakh in non-metro centers."],
    documents: [
      { name: "Aadhaar Card for all adults", requirement: "Mandatory", source: "eKYC / UIDAI", manualUpload: "No" },
      { name: "Current Income Certificate", requirement: "Mandatory", source: "Tehsildar / e-District", manualUpload: "Yes, if API fails" },
      { name: "Self-Declaration of no pucca house", requirement: "Mandatory", source: "Affidavit", manualUpload: "Yes" },
      { name: "Land/Property Documents", requirement: "Conditional", source: "State Land Records", manualUpload: "Yes" },
    ],
    workflow: ["Register demand through pmaymis.gov.in.", "ULB verification within 30-60 days.", "Property geo-tagging.", "Approval and subsidy credit to home loan account."],
    fees: "Online application is free.",
    processingTime: "Typically 3 to 6 months for bank technical sanction and ULB approval.",
    statusFlow: ["Application Submitted", "ULB Verification Pending", "Geo-tagging Initiated", "Bank Technical Sanction", "Approved", "Subsidy Credited"],
    rejectionReasons: ["Income exceeds category limit.", "Income certificate older than 1 year.", "Applicant already owns a pucca house."],
    grievance: "National toll-free helpline 1800-11-6163 and PG Portal.",
    recommendations: [{ when: "income category is EWS", recommend: ["PM Ujjwala Yojana", "Ayushman Bharat checks"] }],
  },
  {
    id: "aarogyasri",
    kind: "scheme",
    name: "Aarogyasri",
    aliases: ["aarogyasri", "cheyutha", "health scheme", "hospital", "surgery"],
    type: "State Government",
    department: "Rajiv Aarogyasri Health Care Trust, Telangana Health Department",
    objective: "Financial protection and cashless corporate medical treatment for economically backward sections.",
    targetBeneficiaries: "BPL families in Telangana.",
    eligibility: ["Resident of Telangana.", "Valid White Ration Card / Food Security Card.", "Procedure must be covered under the listed packages."],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana"] },
      { key: "family_income", question: "What is your annual household income?", type: "choice", choices: ["Below ₹5 Lakhs", "Above ₹5 Lakhs"] },
      { key: "has_ration_card", question: "Do you have a valid ration card?", type: "boolean" },
      { key: "covered_other_health", question: "Are you already covered under another government health insurance scheme?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "ration_card_number", question: "Please enter your Ration Card Number.", type: "text" },
      { key: "family_income", question: "What is your annual household income?", type: "choice", choices: ["Below ₹5 Lakhs", "Above ₹5 Lakhs"] },
      { key: "address", question: "Please enter your Address.", type: "text" },
      { key: "district", question: "Please enter your District.", type: "text" },
      { key: "hospital_preference", question: "Please enter your Hospital Preference (optional).", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Coverage up to Rs. 10 lakh per family per year.", "Cashless treatment at government and empanelled private hospitals.", "Covers major surgeries, hospitalizations, organ transplants, and post-treatment care."],
    documents: [
      { name: "White Ration Card", requirement: "Mandatory", source: "State Civil Supplies API", manualUpload: "No" },
      { name: "Aadhaar Card", requirement: "Mandatory", source: "eKYC / UIDAI", manualUpload: "No" },
      { name: "Aarogyasri Card", requirement: "Resulting Doc", source: "Aarogyasri Trust", manualUpload: "N/A" },
    ],
    workflow: ["Beneficiary reaches empanelled hospital or PHC.", "Aarogya Mithra verifies White Ration Card and Aadhaar.", "Hospital seeks pre-authorization.", "Patient receives cashless treatment."],
    fees: "Free enrollment and treatment.",
    processingTime: "Pre-authorization is usually quick for immediate treatment.",
    statusFlow: ["Admitted", "Eligibility Verified", "Pre-Authorization Requested", "Treatment Approved", "Discharged", "Claim Settled to Hospital"],
    rejectionReasons: ["No White Ration Card.", "Procedure is cosmetic, elective, or OPD-only without hospitalization."],
    grievance: "Aarogya Mithras at hospitals, Aarogyasri portal, or helpline.",
    recommendations: [{ when: "White Ration Card is true and expenses exceed Rs. 10 lakh", recommend: ["Rashtriya Arogya Nidhi"] }],
  },
  {
    id: "post-matric-scholarship",
    kind: "scheme",
    name: "National Scholarship Schemes",
    aliases: ["scholarship", "post matric", "student scholarship", "daughter scholarship", "education help", "nsp scholarship"],
    type: "Central Government",
    department: "Ministry of Minority Affairs / Ministry of Social Justice & Empowerment",
    objective: "Scholarships for students from economically weaker minority and marginalized communities from class 11 to Ph.D.",
    targetBeneficiaries: "SC, ST, OBC, or Minority students in recognized institutions.",
    eligibility: ["At least 50% marks in the previous final examination.", "Income limit: Rs. 2.5 lakh for SC/ST/OBC or Rs. 2 lakh for Minorities.", "Valid caste/community certificate required."],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana", "Karnataka"] },
      { key: "is_student", question: "Are you currently studying?", type: "boolean" },
      { key: "education_level", question: "Education level?", type: "choice", choices: ["School", "Intermediate", "Diploma", "Degree", "Post Graduation"] },
      { key: "family_income", question: "Annual family income?", type: "choice", choices: ["Below ₹2.5 Lakhs", "Above ₹2.5 Lakhs"] },
      { key: "previous_marks_percentage", question: "Did you score 50% or above in your previous final exam?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "student_name", question: "Please enter your Student Name.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "college_name", question: "Please enter your School or College Name.", type: "text" },
      { key: "course", question: "Please enter your Course.", type: "text" },
      { key: "education_level", question: "Please enter your Education Level.", type: "choice", choices: ["School", "Intermediate", "Diploma", "Degree", "Post Graduation"] },
      { key: "family_income", question: "Annual family income?", type: "choice", choices: ["Below ₹2.5 Lakhs", "Above ₹2.5 Lakhs"] },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "ifsc_code", question: "Please enter your IFSC Code.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Admission fees, tuition fees, and monthly maintenance allowance credited through DBT."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "eKYC / UIDAI", manualUpload: "No" },
      { name: "Income Certificate", requirement: "Mandatory", source: "e-District", manualUpload: "Yes if API unavailable" },
      { name: "Caste Certificate", requirement: "Mandatory", source: "e-District", manualUpload: "Yes if API unavailable" },
      { name: "Previous Year Marksheet", requirement: "Mandatory", source: "DigiLocker / Board APIs", manualUpload: "Yes, if API fails" },
      { name: "Fee Receipt", requirement: "Mandatory", source: "Institute", manualUpload: "Yes" },
    ],
    workflow: ["Register and apply on NSP.", "Institute verifies enrollment and fee details.", "District/State node verifies caste and income.", "Ministry sanctions and PFMS routes DBT."],
    fees: "Zero application fee.",
    processingTime: "Annual academic calendar, usually opens in August and disburses by March.",
    statusFlow: ["Application Submitted", "Institute Verification Pending", "Institute Approved", "State/District Nodal Officer Verified", "Sent to PFMS for Payment", "Payment Success"],
    rejectionReasons: ["Institute misses verification deadline.", "Aadhaar and bank name mismatch.", "Income exceeds limit."],
    grievance: "NSP portal status tracking and NSP Helpdesk tickets.",
    recommendations: [{ when: "Undergraduate and SC/ST", recommend: ["Free coaching / upskilling schemes"] }],
  },
  {
    id: "telangana-epass",
    kind: "scheme",
    name: "Telangana ePASS Post-Matric Scholarship / Fee Reimbursement",
    aliases: ["epass", "telangana epass", "fee reimbursement", "rtf", "mtf", "college fee reimbursement"],
    type: "State Government",
    department: "SC/ST/BC/Minority Welfare Departments, Telangana",
    objective: "Tuition fee reimbursement and maintenance support for economically weaker students from Class 11 to postgraduate education.",
    targetBeneficiaries: "Students from SC, ST, BC, EBC, Minority, and Physically Challenged categories in Telangana.",
    eligibility: ["Attendance must be at least 75% per quarter.", "SC/ST/Minority annual family income must be up to Rs. 2,00,000.", "BC/EBC income limit is up to Rs. 1,50,000 rural and Rs. 2,00,000 urban.", "Management quota and spot admission students are not eligible.", "Maximum age is 25 for OC and 29 for other categories as of July 1 of the academic year."],
    questions: [
      { key: "admission_type", question: "Was your admission through Convenor Quota or Management Quota?", type: "choice", choices: ["Convenor Quota", "Management Quota"] },
      { key: "family_income", question: "What is your total annual family income?", type: "number" },
      { key: "social_category", question: "What is your caste category?", type: "choice", choices: ["SC", "ST", "BC", "EBC", "Minority", "Physically Challenged", "OC"] },
      { key: "attendance_above_75", question: "Is your current attendance above 75%?", type: "boolean" },
    ],
    applicationQuestions: [],
    benefits: ["Full or partial tuition fee reimbursement depending on rank and category.", "Maintenance charges credited through DBT in four annual phases."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "eKYC / UIDAI", manualUpload: "No" },
      { name: "Income Certificate", requirement: "Mandatory", source: "MeeSeva / e-District", manualUpload: "No" },
      { name: "Caste Certificate", requirement: "Mandatory", source: "MeeSeva / e-District", manualUpload: "No" },
      { name: "CET Allotment Order", requirement: "Mandatory", source: "Higher Education API", manualUpload: "Yes, if API fails" },
      { name: "Previous Marksheets", requirement: "Mandatory", source: "Board APIs / DigiLocker", manualUpload: "Yes" },
      { name: "Bank Passbook", requirement: "Mandatory", source: "NPCI", manualUpload: "No" },
    ],
    workflow: ["Student applies online via ePASS portal.", "College principal verifies enrollment, biometric attendance, and documents.", "District Welfare Officer validates caste, income, and academics.", "Funds are sanctioned and pushed to the student's bank account via DBT."],
    fees: "Free online application.",
    processingTime: "Funds are released quarterly in four phases through the academic year.",
    statusFlow: ["Application Submitted", "Pending at College", "College Verified", "Pending at District Officer", "Approved / Sanctioned", "Released to Bank"],
    rejectionReasons: ["Attendance below 75%.", "Admission under Management Quota.", "Income exceeds the category-specific threshold."],
    grievance: "Dedicated grievance module and helpdesk on the ePASS portal.",
    recommendations: [{ when: "SC/ST student in graduation", recommend: ["Skill development / upskilling schemes"] }],
  },
  {
    id: "kalyana-lakshmi",
    kind: "scheme",
    name: "Kalyana Lakshmi / Shaadi Mubarak",
    aliases: ["kalyana lakshmi", "shaadi mubarak", "marriage scheme", "marriage assistance"],
    type: "State Government",
    department: "BC/SC/ST/Minority Welfare Departments",
    objective: "Financial assistance for poor families at the time of an unmarried girl's marriage.",
    targetBeneficiaries: "BPL families of SC, ST, BC, EBC, and Minority communities.",
    eligibility: ["Bride must be at least 18 and groom at least 21.", "Application within 6 months of marriage.", "Income limits apply by category and rural/urban status.", "No government employee or income tax payer in the family."],
    questions: [
      { key: "bride_age", question: "What is the bride's exact age on the date of marriage?", type: "number" },
      { key: "parents_income", question: "What is the total annual income of the bride's parents?", type: "number" },
      { key: "has_govt_employee", question: "Is anyone in your immediate family a government employee?", type: "boolean" },
      { key: "marriage_date", question: "If the marriage already happened, what was the date?", type: "date" },
    ],
    applicationQuestions: [],
    benefits: ["One-time grant of Rs. 1,00,116 to the bride's bank account.", "Disabled brides are eligible for Rs. 1,25,145."],
    documents: [
      { name: "Bride Aadhaar and age proof", requirement: "Mandatory", source: "UIDAI / SSC Board", manualUpload: "No if API available" },
      { name: "Caste and Income Certificates", requirement: "Mandatory", source: "MeeSeva", manualUpload: "No if API available" },
      { name: "Marriage Certificate / Card", requirement: "Mandatory", source: "Gram Panchayat / Registration", manualUpload: "Yes" },
      { name: "Groom Aadhaar", requirement: "Mandatory", source: "UIDAI", manualUpload: "Yes for age verification" },
      { name: "Bride and Mother Bank Accounts", requirement: "Mandatory", source: "NPCI", manualUpload: "No" },
    ],
    workflow: ["Apply online through ePASS before or within 6 months of marriage.", "VRO/MRO field verification.", "District Welfare Officer/RDO approval.", "Cheque printed or DBT credited."],
    fees: "Free application.",
    processingTime: "Usually 1 to 3 months depending on budget and field verification.",
    statusFlow: ["Submitted", "Pending at VRO/MRO", "Revenue Verification Complete", "Pending at RDO/Welfare Officer", "Approved", "Cheque Printed/Amount Credited"],
    rejectionReasons: ["Bride under 18 or groom under 21.", "Income limits exceeded or fake income certificate.", "Application after 6 months from marriage."],
    grievance: "Local RDO or ePASS grievance mechanism.",
    recommendations: [{ when: "Kalyana Lakshmi approved", recommend: ["KCR Kit / maternity scheme awareness after 9 months"] }],
  },
  {
    id: "pmegp",
    kind: "scheme",
    name: "PM Mudra Yojana",
    aliases: ["pmegp", "employment", "business loan", "start business", "self employment"],
    type: "Central Government",
    department: "Khadi and Village Industries Commission (KVIC), MSME",
    objective: "Employment generation through new self-employment ventures and micro-enterprises.",
    targetBeneficiaries: "Unemployed youth and traditional artisans.",
    eligibility: ["Minimum age 18.", "Class VIII required for manufacturing units above Rs. 10 lakh or service units above Rs. 5 lakh.", "No prior margin money subsidy from other schemes."],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana", "Karnataka"] },
      { key: "owns_or_starts_business", question: "Do you own or plan to start a small business?", type: "boolean" },
      { key: "mudra_category", question: "Which loan category do you need?", type: "choice", choices: ["Shishu", "Kishore", "Tarun"] },
      { key: "has_credit_default", question: "Do you have any past bank loan defaults?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "business_name", question: "Please enter your Business Name.", type: "text" },
      { key: "business_type", question: "Please enter your Business Type.", type: "text" },
      { key: "mudra_category", question: "Which loan category do you need?", type: "choice", choices: ["Shishu", "Kishore", "Tarun"] },
      { key: "loan_amount_required", question: "Please enter the Loan Amount Required.", type: "text" },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "ifsc_code", question: "Please enter your IFSC Code.", type: "text" },
      { key: "business_address", question: "Please enter your Business Address.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Margin money subsidy from 15% to 35% depending on location and social category.", "Bank term loan for the remaining amount."],
    documents: [
      { name: "Aadhaar", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Project Report (DPR)", requirement: "Mandatory", source: "Applicant", manualUpload: "Yes" },
      { name: "Education/Skill Certificates", requirement: "Mandatory", source: "Applicant", manualUpload: "Yes" },
      { name: "Caste Certificate", requirement: "Conditional", source: "e-District", manualUpload: "Yes if claiming special category" },
    ],
    workflow: ["Apply on PMEGP portal.", "District Task Force Committee screening.", "Forwarded to bank.", "Bank appraisal and credit sanction.", "EDP training completed.", "Subsidy claimed and locked in bank for 3 years."],
    fees: "No application fee is specified in the verified PMEGP workflow; bank charges may apply during appraisal as per banking rules.",
    processingTime: "Depends on District Task Force screening, bank appraisal, credit sanction, and EDP training completion.",
    statusFlow: ["Applied Online", "DTFC Screening", "Forwarded to Bank", "Bank Appraisal", "Credit Sanction", "EDP Training", "Subsidy Locked"],
    rejectionReasons: ["Project commercially unviable.", "Poor credit history or CIBIL default."],
    grievance: "Use PMEGP portal/bank escalation channels.",
    recommendations: [{ when: "PMEGP loan active and business expanding", recommend: ["Mudra Loan", "PM Vishwakarma"] }],
  },
  {
    id: "caste-certificate",
    kind: "service",
    name: "Caste / Community Certificate",
    aliases: ["caste certificate", "community certificate", "sc certificate", "st certificate", "bc certificate"],
    type: "Government Service",
    department: "Revenue Department, Telangana",
    objective: "Certifies social category for reservations and government benefits.",
    targetBeneficiaries: "Citizens belonging to an official State gazette caste/community.",
    eligibility: ["Applicant must belong to a caste listed in the official State gazette."],
    questions: [{ key: "has_family_caste_cert", question: "Do any immediate family members already hold a digital caste certificate?", type: "boolean" }],
    benefits: ["Used for reservations and as an automatic API-fetch document for schemes like ePASS and Kalyana Lakshmi."],
    documents: [{ name: "Family caste certificate if available", requirement: "Conditional", source: "MeeSeva / e-District", manualUpload: "Yes if API unavailable" }],
    workflow: ["MeeSeva application.", "VRO field enquiry.", "Revenue Inspector verification.", "Tahsildar digital signature and issue."],
    fees: "MeeSeva service charges apply as per the Revenue Department service counter.",
    processingTime: "Issued after MeeSeva submission, VRO field enquiry, Revenue Inspector verification, and Tahsildar digital signature.",
    statusFlow: ["Application Submitted", "VRO Field Enquiry", "Revenue Inspector Verification", "Tahsildar Digital Signature", "Certificate Issued"],
    rejectionReasons: ["Caste is not listed in the official State gazette.", "Field enquiry does not verify the claimed community.", "Required family or residence proof is insufficient."],
    grievance: "Escalate through MeeSeva / e-District or the local Revenue office.",
    recommendations: [{ when: "Certificate issued", recommend: ["ePASS", "Kalyana Lakshmi"] }],
  },
  {
    id: "pmfby",
    kind: "scheme",
    name: "PM Fasal Bima Yojana",
    aliases: ["fasal bima", "crop insurance", "pmfby", "crop loss", "farmer insurance"],
    type: "Central Government",
    department: "Ministry of Agriculture & Farmers Welfare",
    objective: "Insurance coverage and financial support to farmers for notified crop losses due to calamities, pests, or diseases.",
    targetBeneficiaries: "Farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.",
    eligibility: ["Must cultivate a notified crop in a notified area.", "Voluntary for loanee and non-loanee farmers.", "Preventable risks like theft or animal grazing are excluded."],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana", "Karnataka"] },
      { key: "is_farmer", question: "Are you a farmer?", type: "boolean" },
      { key: "cultivated_crops", question: "Have you cultivated crops this season?", type: "boolean" },
      { key: "is_notified_crop", question: "Is your crop a notified crop in your area?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "farmer_id", question: "Please enter your Farmer ID.", type: "text" },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "crop_details", question: "Please enter your Crop Details.", type: "text" },
      { key: "crop_season", question: "Please enter your Crop Season.", type: "text" },
      { key: "land_records", question: "Please enter your Land Records details.", type: "text" },
      { key: "insurance_details", question: "Please enter your Insurance Details.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Compensation for yield losses, prevented sowing, and post-harvest losses due to localized calamities."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "eKYC / UIDAI", manualUpload: "No" },
      { name: "Land Records (Pahani/Adangal)", requirement: "Mandatory", source: "State Land Records", manualUpload: "Yes, if API fails" },
      { name: "Sowing Certificate / Self-Declaration", requirement: "Mandatory", source: "VRO/Panchayat", manualUpload: "Yes" },
      { name: "Bank Account Details", requirement: "Mandatory", source: "NPCI", manualUpload: "No" },
    ],
    workflow: ["Non-loanee farmers apply via CSC or PMFBY portal; loanee farmers may be processed by bank.", "CSC/Bank verifies land and sowing details.", "Farmer pays premium.", "Insurance company issues policy."],
    fees: "Premium share: 2% for Kharif, 1.5% for Rabi, 5% for annual commercial/horticultural crops.",
    processingTime: "Coverage begins after premium payment; claim settlement depends on crop cutting experiments.",
    statusFlow: ["Application Submitted", "Premium Paid", "Bank/CSC Verified", "Policy Generated", "Claim Raised", "Survey Completed", "Claim Settled"],
    rejectionReasons: ["Crop sown and crop insured mismatch.", "Application submitted after seasonal cut-off date."],
    grievance: "National Crop Insurance Portal or PMFBY app.",
    recommendations: [{ when: "PMFBY claim settled", recommend: ["PM-KISAN DBT linkage checks"] }],
  },
  {
    id: "sukanya",
    kind: "scheme",
    name: "Sukanya Samriddhi Yojana (SSY)",
    aliases: ["sukanya", "girl child", "ssy", "daughter saving"],
    type: "Central Government",
    department: "Ministry of Finance / Ministry of Women & Child Development",
    objective: "Encourage parents to build a fund for a female child's future education and marriage expenses.",
    targetBeneficiaries: "Resident Indian girl children.",
    eligibility: ["Girl child must be under 10 at account opening.", "Maximum two SSY accounts per family, with exceptions for twins/triplets on second birth.", "Girl child must be resident Indian."],
    questions: [
      { key: "girl_child_age", question: "What is the age of the girl child?", type: "number" },
      { key: "existing_ssy_accounts", question: "How many SSY accounts already exist in your family?", type: "number" },
    ],
    applicationQuestions: [],
    benefits: ["8.2% annual interest compounded annually for Q2 FY 2026-27.", "EEE tax benefits on deposits up to Rs. 1.5 lakh under 80C, interest, and maturity.", "Matures 21 years after opening; deposits required for first 15 years."],
    documents: [
      { name: "Girl Child Birth Certificate", requirement: "Mandatory", source: "Civil Registration System", manualUpload: "Yes, if no API" },
      { name: "Parent/Guardian Aadhaar", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Parent/Guardian PAN", requirement: "Mandatory", source: "NSDL / Income Tax", manualUpload: "No" },
      { name: "Medical Certificate for twins", requirement: "Conditional", source: "Hospital", manualUpload: "Yes" },
    ],
    workflow: ["Submit Form SSA-1 at authorized bank or post office.", "KYC verification.", "Account opens after initial minimum Rs. 250 deposit."],
    fees: "Minimum Rs. 250 to open; Rs. 50 penalty if minimum annual deposit is missed.",
    processingTime: "Account opens instantly over the counter.",
    statusFlow: ["Application Submitted at Bank/PO", "KYC Verified", "Initial Deposit Made", "SSY Passbook Issued"],
    rejectionReasons: ["Girl child over 10 years old.", "Family already has two active SSY accounts."],
    grievance: "Banking Ombudsman or bank/post office grievance portal.",
    recommendations: [{ when: "Girl child turns 18 and SSY is active", recommend: ["Pre/Post-Matric Scholarships", "Kalyana Lakshmi if state matches"] }],
  },
  {
    id: "aasara-disability",
    kind: "scheme",
    name: "Aasara Disability Pension / SADAREM",
    aliases: ["disability pension", "sadarem", "aasara", "disabled pension"],
    type: "State Government",
    department: "Society for Elimination of Rural Poverty (SERP), Telangana",
    objective: "Financial security for persons with disabilities from BPL families.",
    targetBeneficiaries: "Disabled citizens from BPL households.",
    eligibility: ["No age limit.", "Minimum 40% disability, or 51% for hearing impaired, certified by SADAREM.", "Must be BPL."],
    questions: [
      { key: "has_sadarem_cert", question: "Do you have a valid SADAREM Certificate?", type: "boolean" },
      { key: "disability_percentage", question: "What is the disability percentage on your certificate?", type: "number" },
      { key: "has_white_card", question: "Do you have a White Ration Card?", type: "boolean" },
    ],
    applicationQuestions: [],
    benefits: ["Enhanced monthly pension around Rs. 3,016 or as updated by latest GOs, credited through DBT."],
    documents: [
      { name: "SADAREM Certificate", requirement: "Mandatory", source: "SADAREM DB API", manualUpload: "No" },
      { name: "Aadhaar Card", requirement: "Mandatory", source: "eKYC", manualUpload: "No" },
      { name: "BPL/White Ration Card", requirement: "Mandatory", source: "Civil Supplies API", manualUpload: "No" },
      { name: "Bank Account", requirement: "Mandatory", source: "NPCI", manualUpload: "No" },
    ],
    workflow: ["Attend medical board assessment for SADAREM certificate.", "Submit pension application at MeeSeva or Gram Panchayat.", "Panchayat Secretary validates BPL status.", "MPDO sanctions pension based on SADAREM ID."],
    fees: "Free application, nominal MeeSeva charges.",
    processingTime: "30-45 days after SADAREM certification.",
    statusFlow: ["SADAREM Certified", "Applied for Pension", "Field Enquiry Completed", "MPDO Approved", "Monthly DBT Active"],
    rejectionReasons: ["Disability percentage below threshold.", "Stable income/assets exceeding BPL norms."],
    grievance: "District Medical Board appeal for reassessment; MPDO for payment issues.",
    recommendations: [{ when: "SADAREM certificate is valid", recommend: ["TSRTC Free Bus Pass", "NHFDC loan"] }],
  },
  {
    id: "ration-card",
    kind: "service",
    name: "Food Security Card / Ration Card",
    aliases: ["ration card", "food security card", "fsc", "lost ration card", "white ration card"],
    type: "State Government",
    department: "Consumer Affairs, Food & Civil Supplies Department, Telangana",
    objective: "Subsidized food grains under PDS and core BPL identification.",
    targetBeneficiaries: "Eligible low-income Telangana households.",
    eligibility: ["Income below Rs. 1.5 lakh rural or Rs. 2 lakh urban.", "Land below 3.50 wet acres or 7.50 dry acres.", "No active duplicate card.", "Government employees, income taxpayers, and most four-wheeler owners are ineligible."],
    questions: [
      { key: "family_annual_income", question: "What is your total annual family income?", type: "number" },
      { key: "wet_land_acres", question: "How many acres of wet land do you own?", type: "number" },
      { key: "dry_land_acres", question: "How many acres of dry land do you own?", type: "number" },
      { key: "owns_car_or_taxpayer", question: "Does anyone in your family pay income tax or own a car?", type: "boolean" },
    ],
    applicationQuestions: [],
    benefits: ["Subsidized rice, sugar, wheat, and other commodities.", "Gateway proof for Aarogyasri, Housing, and Fee Reimbursement."],
    documents: [
      { name: "Aadhaar for all members", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Income Certificate", requirement: "Mandatory", source: "Revenue Dept / e-District", manualUpload: "No if API fetch" },
      { name: "Address Proof / Domicile", requirement: "Mandatory", source: "Revenue Dept", manualUpload: "Yes" },
      { name: "Passport Photo of Head", requirement: "Mandatory", source: "Applicant", manualUpload: "Yes" },
    ],
    workflow: ["Apply via MeeSeva or state drives like Praja Palana.", "MeeSeva scrutiny.", "VRO/Revenue Inspector field verification.", "Approval and biometric e-KYC at ration shop."],
    fees: "Rs. 35 to Rs. 50 MeeSeva service charge.",
    processingTime: "Backlog dependent; often several months, expedited during drives.",
    statusFlow: ["Application Registered", "Sent to Tahsildar", "Assigned to VRO/RI", "Field Verification Report Submitted", "Approved/Rejected", "FSC Number Generated", "e-KYC Completed", "Card Active"],
    rejectionReasons: ["Income or land limits exceeded.", "Duplicate members in another FSC.", "Failed field verification."],
    grievance: "Helpline 1967 or 1800-425-0033 and ePDS Grievance Redressal System.",
    recommendations: [{ when: "FSC status is active", recommend: ["Aarogyasri", "Aasara", "Housing schemes"] }],
  },
  {
    id: "ayushman-bharat",
    kind: "scheme",
    name: "Ayushman Bharat",
    aliases: ["ayushman bharat", "ayushman card", "pmjay", "national health insurance"],
    type: "Central Government",
    department: "National Health Authority",
    objective: "Cashless secondary and tertiary healthcare coverage of Rs. 5 Lakhs per family per year.",
    targetBeneficiaries: "Low-income families identified in the SECC 2011 database.",
    eligibility: [
      "Must be listed in SECC 2011 or hold an active PM-JAY letter.",
      "Must not own premium assets or be a government employee.",
      "Must have a valid BPL card or PM-JAY registration."
    ],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana", "Karnataka"] },
      { key: "has_bpl_card", question: "Do you possess an active BPL or Ration Card?", type: "boolean" },
      { key: "has_required_id", question: "Do you possess the required identification?", type: "boolean" },
      { key: "covered_other_applicable", question: "Are you covered under another applicable scheme?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "family_id", question: "Please enter your Family ID.", type: "text" },
      { key: "address", question: "Please enter your Address.", type: "text" },
      { key: "district", question: "Please enter your District.", type: "text" },
      { key: "ration_card", question: "Please enter your Ration Card details.", type: "text" },
      { key: "family_income", question: "What is your annual family income?", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Cashless treatment up to Rs. 5 Lakhs per family per year.", "Covers pre and post-hospitalization expenses up to 15 days."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Ration Card", requirement: "Mandatory", source: "State Civil Supplies", manualUpload: "No" }
    ],
    workflow: ["Verify name at empanelled hospital or PM-JAY kiosk.", "Empanelled doctor requests pre-authorization.", "Cashless treatment provided."],
    fees: "Application and Ayushman card issuance are free.",
    processingTime: "Instant verification at empanelled hospital kiosk.",
    statusFlow: ["Applied", "SECC Match Found", "Aadhaar Verified", "Ayushman Card Active"],
    rejectionReasons: ["Name not in SECC list.", "Duplicate card holder."],
    grievance: "PM-JAY Toll-free helpline 14555.",
    recommendations: []
  },
  {
    id: "rythu-bharosa",
    kind: "scheme",
    name: "Rythu Bharosa",
    aliases: ["rythu bharosa", "ysr rythu", "ap farmer support", "rythu bharosa scheme"],
    type: "State Government",
    department: "Andhra Pradesh Agriculture Department",
    objective: "Financial assistance to landholding and tenant farmers in Andhra Pradesh.",
    targetBeneficiaries: "All cultivable landholding farmer families and tenant farmers in AP.",
    eligibility: [
      "Must be a permanent resident of Andhra Pradesh.",
      "Must own agricultural cultivable land.",
      "Tenant farmers from SC/ST/BC/Minority groups are eligible."
    ],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh", "Telangana", "Karnataka"] },
      { key: "is_farmer", question: "Are you a farmer?", type: "boolean" },
      { key: "owns_or_cultivates_land", question: "Do you own or cultivate agricultural land?", type: "boolean" },
      { key: "has_pattadar_passbook", question: "Do you possess a Pattadar Passbook?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "farmer_id", question: "Please enter your Farmer ID (if applicable).", type: "text" },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "ifsc_code", question: "Please enter your IFSC Code.", type: "text" },
      { key: "land_ownership_details", question: "Please enter your Land Ownership Details.", type: "text" },
      { key: "crop_details", question: "Please enter your Crop Details.", type: "text" },
      { key: "village", question: "Please enter your Village.", type: "text" },
      { key: "mandal", question: "Please enter your Mandal.", type: "text" },
      { key: "district", question: "Please enter your District.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Rs. 13,500 per year per farmer family.", "Includes Rs. 6,000 from Central PM-KISAN."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Pattadar Passbook / Land Proof", requirement: "Mandatory", source: "Meebhoomi", manualUpload: "Yes" }
    ],
    workflow: ["Register via Ward/Gram Sachivalayam.", "Revenue department field verification.", "Beneficiary list displayed at Panchayat.", "DBT credit."],
    fees: "Free registration.",
    processingTime: "30-45 working days.",
    statusFlow: ["Applied", "Land Records Verified", "Sachivalayam Approved", "Payment Released"],
    rejectionReasons: ["Ineligible land category.", "Non-resident of Andhra Pradesh."],
    grievance: "AP Spandana portal or toll-free number 1902.",
    recommendations: []
  },
  {
    id: "amma-vodi",
    kind: "scheme",
    name: "Jagananna Amma Vodi",
    aliases: ["amma vodi", "ammavodi", "school mother assistance", "mother support"],
    type: "State Government",
    department: "Andhra Pradesh School Education Department",
    objective: "Financial assistance to mothers from low-income families to support children's education.",
    targetBeneficiaries: "Poor mothers sending their children to recognized schools (Class 1 to 12).",
    eligibility: [
      "Must be a permanent resident of Andhra Pradesh.",
      "Must have a White Ration Card.",
      "Child must have at least 75% school attendance.",
      "Must own less than 3.5 wet acres or 10 dry acres of land."
    ],
    questions: [
      { key: "is_ap_resident", question: "Are you a permanent resident of Andhra Pradesh?", type: "boolean" },
      { key: "has_white_ration_card", question: "Do you have a White Ration Card?", type: "boolean" },
      { key: "child_attendance_above_75", question: "Does your school-going child have at least 75% attendance?", type: "boolean" }
    ],
    applicationQuestions: [],
    benefits: ["Rs. 15,000 annual financial assistance deposited to the mother's bank account.", "Includes deduction of Rs. 1,000 for school sanitation fund."],
    documents: [
      { name: "Aadhaar of Mother and Child", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "White Ration Card", requirement: "Mandatory", source: "Civil Supplies", manualUpload: "No" },
      { name: "Study/School Attendance Certificate", requirement: "Mandatory", source: "School Portal", manualUpload: "Yes" }
    ],
    workflow: ["Data collected from Unified School Info System.", "Sachivalayam verifies BPL and attendance.", "Social audit publication.", "DBT credit in June."],
    fees: "Free eligibility enrollment.",
    processingTime: "Processed automatically at the start of the academic year.",
    statusFlow: ["School Enrolled", "Attendance Verified", "Social Audit Approved", "Fund Disbursed"],
    rejectionReasons: ["Attendance below 75%.", "Income or landholdings exceed BPL threshold."],
    grievance: "AP Education Helpdesk or Sachivalayam representative.",
    recommendations: []
  },
  {
    id: "vidya-deevena",
    kind: "scheme",
    name: "Jagananna Vidya Deevena",
    aliases: ["vidya deevena", "vidyadeevena", "jvd", "ap fee reimbursement"],
    type: "State Government",
    department: "Andhra Pradesh Higher Education Department",
    objective: "Full fee reimbursement to students from SC/ST/BC/Minority/EBC categories.",
    targetBeneficiaries: "Students pursuing ITI, Polytechnic, Degree, Engineering, or Medicine in AP.",
    eligibility: [
      "Must be a resident of Andhra Pradesh.",
      "Total family annual income must be below Rs. 2.5 Lakhs.",
      "Must not own four-wheelers (excluding taxis/tractors).",
      "Must own less than 10 wet acres or 25 dry acres of land."
    ],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh"] },
      { key: "is_student", question: "Are you currently a student?", type: "boolean" },
      { key: "course_studying", question: "Which course are you studying?", type: "choice", choices: ["Intermediate", "Diploma", "Degree", "Engineering", "Medicine", "Post Graduation", "Other"] },
      { key: "family_income", question: "What is your annual family income?", type: "choice", choices: ["Below ₹2.5 Lakhs", "Above ₹2.5 Lakhs"] },
      { key: "enrolled_eligible_inst", question: "Are you studying in an eligible institution?", type: "boolean" }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "student_name", question: "Please enter your Student Name.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "college_name", question: "Please enter your College Name.", type: "text" },
      { key: "course", question: "Please enter your Course.", type: "text" },
      { key: "year_of_study", question: "Please enter your Year of Study.", type: "text" },
      { key: "hall_ticket_number", question: "Please enter your Hall Ticket Number.", type: "text" },
      { key: "family_income", question: "What is your annual family income?", type: "choice", choices: ["Below ₹2.5 Lakhs", "Above ₹2.5 Lakhs"] },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "ifsc_code", question: "Please enter your IFSC Code.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Full fee reimbursement of tuition and special fees paid directly to the mother's bank account in quarterly installments."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Income Certificate", requirement: "Mandatory", source: "Sachivalayam", manualUpload: "No" },
      { name: "Caste Certificate", requirement: "Mandatory", source: "Sachivalayam", manualUpload: "No" },
      { name: "College Fee Details & Admission Copy", requirement: "Mandatory", source: "College", manualUpload: "Yes" }
    ],
    workflow: ["Admission verification via CET portal.", "Sachivalayam field enquiry for income/assets.", "Sanction release to mothers' accounts quarterly."],
    fees: "Free application.",
    processingTime: "Pushed quarterly based on academic schedule.",
    statusFlow: ["CET Admitted", "College Verified", "Field Verification Approved", "Installment Sanctioned", "Paid to Mother"],
    rejectionReasons: ["Admission in management quota.", "Family income exceeds Rs. 2.5 Lakhs."],
    grievance: "AP JVD Portal grievance cell.",
    recommendations: []
  },
  {
    id: "ysr-cheyutha",
    kind: "scheme",
    name: "YSR Cheyutha",
    aliases: ["ysr cheyutha", "cheyutha scheme", "ap women financial help"],
    type: "State Government",
    department: "Andhra Pradesh Society for Elimination of Rural Poverty",
    objective: "Financial assistance to women from minority and backward categories to encourage entrepreneurship.",
    targetBeneficiaries: "Women of SC/ST/BC/Minority categories aged 45-60 in AP.",
    eligibility: [
      "Must be a female resident of Andhra Pradesh.",
      "Age must be between 45 and 60 years.",
      "Must belong to SC, ST, BC, or Minority community.",
      "Must satisfy BPL criteria."
    ],
    questions: [
      { key: "state", question: "Which state do you belong to?", type: "choice", choices: ["Andhra Pradesh"] },
      { key: "is_female", question: "Are you a woman?", type: "boolean" },
      { key: "age_group", question: "Age group?", type: "choice", choices: ["45–60 Years", "Below 45", "Above 60"] },
      { key: "family_income", question: "Annual family income?", type: "choice", choices: ["Below ₹2.5 Lakhs", "Above ₹2.5 Lakhs"] },
      { key: "social_category", question: "Do you belong to SC, ST, BC, or Minority category?", type: "choice", choices: ["SC", "ST", "BC", "Minority", "Other"] }
    ],
    applicationQuestions: [
      { key: "aadhaar_number", question: "Please enter your Aadhaar Number.", type: "text" },
      { key: "mobile_number", question: "Please enter your Mobile Number.", type: "text" },
      { key: "age", question: "Please enter your Age.", type: "text" },
      { key: "category", question: "Please enter your Category.", type: "text" },
      { key: "family_income", question: "Annual family income?", type: "choice", choices: ["Below ₹2.5 Lakhs", "Above ₹2.5 Lakhs"] },
      { key: "bank_account_number", question: "Please enter your Bank Account Number.", type: "text" },
      { key: "ifsc_code", question: "Please enter your IFSC Code.", type: "text" },
      { key: "address", question: "Please enter your Address.", type: "text" },
      { key: "ekyc", question: "Would you like to complete e-KYC?", type: "boolean" }
    ],
    benefits: ["Total financial assistance of Rs. 75,000 over 4 years (Rs. 18,750 per year)."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Caste Certificate", requirement: "Mandatory", source: "Sachivalayam", manualUpload: "No" },
      { name: "White Ration Card", requirement: "Mandatory", source: "Civil Supplies", manualUpload: "No" }
    ],
    workflow: ["Apply via Gram/Ward Sachivalayam.", "Verification of age, caste, and BPL status.", "Social audit.", "DBT disbursement."],
    fees: "Free application.",
    processingTime: "30-60 working days.",
    statusFlow: ["Applied", "Age Verified", "Caste Approved", "Disbursed"],
    rejectionReasons: ["Age is not between 45 and 60.", "Belongs to general category without minority status."],
    grievance: "AP SERP helpline or Sachivalayam.",
    recommendations: []
  },
  {
    id: "ebc-nestham",
    kind: "scheme",
    name: "YSR EBC Nestham",
    aliases: ["ebc nestham", "ebcnestham", "ap upper caste women help"],
    type: "State Government",
    department: "Andhra Pradesh BC Welfare Department",
    objective: "Financial assistance to economically backward class upper-caste women.",
    targetBeneficiaries: "EBC women aged 45-60 belonging to castes like Reddy, Kamma, Arya Vysya, Brahmin, etc.",
    eligibility: [
      "Must be a female resident of Andhra Pradesh.",
      "Age must be between 45 and 60 years.",
      "Must belong to an eligible EBC caste (Reddy, Kamma, Arya Vysya, Brahmin, etc.).",
      "Family income must be below BPL limits."
    ],
    questions: [
      { key: "is_ap_resident", question: "Are you a permanent resident of Andhra Pradesh?", type: "boolean" },
      { key: "is_female", question: "Are you female?", type: "boolean" },
      { key: "age", question: "What is your exact age?", type: "number" },
      { key: "social_category", question: "What is your caste category?", type: "choice", choices: ["Reddy", "Kamma", "Arya Vysya", "Brahmin", "Other EBC"] }
    ],
    applicationQuestions: [],
    benefits: ["Rs. 15,000 per year financial assistance for EBC women."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "EBC Caste Certificate", requirement: "Mandatory", source: "Sachivalayam", manualUpload: "No" },
      { name: "Income Certificate", requirement: "Mandatory", source: "Sachivalayam", manualUpload: "No" }
    ],
    workflow: ["Registration via Ward/Gram Sachivalayam.", "Caste and income verified by revenue officials.", "Social audit.", "Fund credit."],
    fees: "Free application.",
    processingTime: "45-60 working days.",
    statusFlow: ["Applied", "Caste Verified", "Income Approved", "Sanctioned", "Paid"],
    rejectionReasons: ["Age is not between 45 and 60.", "Income exceeds BPL limit."],
    grievance: "AP BC Welfare department.",
    recommendations: []
  },
  {
    id: "ujjwala",
    kind: "scheme",
    name: "Pradhan Mantri Ujjwala Yojana (PMUY)",
    aliases: ["ujjwala", "ujjwala yojana", "free gas", "lpg connection", "gas scheme"],
    type: "Central Government",
    department: "Ministry of Petroleum and Natural Gas",
    objective: "Provide deposit-free LPG connections to women from BPL families.",
    targetBeneficiaries: "Adult women from BPL/low-income families without active gas connections.",
    eligibility: [
      "Must be an adult female resident of India.",
      "Must belong to a BPL household.",
      "No active LPG connection in the household."
    ],
    questions: [
      { key: "is_female", question: "Are you female?", type: "boolean" },
      { key: "has_lpg_connection", question: "Do you or anyone in your household have an active LPG connection?", type: "boolean" },
      { key: "has_bpl_card", question: "Do you have a valid BPL card or ration card?", type: "boolean" }
    ],
    applicationQuestions: [],
    benefits: ["One deposit-free LPG connection per household.", "Financial support of Rs. 1,600 for cylinder regulator and pipe.", "Subsidy on refills."],
    documents: [
      { name: "Aadhaar Card", requirement: "Mandatory", source: "UIDAI", manualUpload: "No" },
      { name: "Ration Card (BPL)", requirement: "Mandatory", source: "Civil Supplies", manualUpload: "No" },
      { name: "Bank Passbook", requirement: "Mandatory", source: "Bank", manualUpload: "Yes" }
    ],
    workflow: ["Submit application at nearby LPG distributor.", "De-duplication checks via LPG portal.", "KYC validation.", "LPG connection issued."],
    fees: "Deposit and connection are free.",
    processingTime: "7-14 working days.",
    statusFlow: ["Applied at Distributor", "KYC Approved", "De-duplication Cleared", "Connection Released"],
    rejectionReasons: ["Household already has an LPG connection.", "Aadhaar duplicate found in connection database."],
    grievance: "PMUY Helpdesk 1800-266-6696.",
    recommendations: []
  }
];

export function getKnowledgeItem(id: string) {
  return knowledgeBase.find((item) => item.id === id);
}
