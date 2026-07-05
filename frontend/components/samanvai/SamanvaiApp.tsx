"use client";

import {
  Accessibility,
  Bell,
  CalendarCheck,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileText,
  Globe2,
  History,
  Home,
  Keyboard,
  Languages,
  LockKeyhole,
  Menu,
  Mic,
  Search,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type LanguageCode = "en" | "te" | "hi" | "ta" | "kn" | "ml";
type FlowStep = "pin" | "language" | "dashboard";

const accessPin = "2026";

const languages: Array<{ code: LanguageCode; label: string; nativeName: string }> = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "te", label: "Telugu", nativeName: "తెలుగు" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", label: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", label: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", nativeName: "മലയാളം" },
];

const copy = {
  en: {
    secureAccess: "Secure Government Access",
    pinTitle: "Enter Citizen PIN",
    pinSubtitle: "Verify your session to open your SAMANVAI workspace.",
    pinPlaceholder: "4-digit PIN",
    verify: "Verify PIN",
    pinHint: "Prototype PIN: 2026",
    invalidPin: "Enter the valid 4-digit prototype PIN.",
    languageTitle: "Choose Your Language",
    languageSubtitle: "SAMANVAI will continue in the selected language.",
    chooseLanguage: "Continue",
    tagline: "From Need to Service",
    verifiedCitizen: "Verified Citizen",
    workspace: "Your Digital Government Workspace",
    startPlaceholder: "Start",
    or: "OR",
    searchServices: "Search Government Services",
    quickAccess: "Quick Access",
    checkStatus: "Check Status",
    checkEligibility: "Check Eligibility",
    bookAppointment: "Book Appointment",
    latestUpdates: "Latest Updates",
    home: "Home",
    history: "History",
    applications: "My Applications",
    documents: "My Documents",
    notifications: "Notifications",
    support: "Help & Support",
    settings: "Settings",
    profile: "User Profile",
    language: "Language",
    accessibility: "Accessibility",
    menu: "Menu",
  },
  te: {
    secureAccess: "సురక్షిత ప్రభుత్వ ప్రవేశం",
    pinTitle: "పౌర PIN నమోదు చేయండి",
    pinSubtitle: "మీ SAMANVAI కార్యస్థలాన్ని తెరవడానికి సెషన్‌ను ధృవీకరించండి.",
    pinPlaceholder: "4 అంకెల PIN",
    verify: "PIN ధృవీకరించండి",
    pinHint: "ప్రోటోటైప్ PIN: 2026",
    invalidPin: "సరైన 4 అంకెల ప్రోటోటైప్ PIN నమోదు చేయండి.",
    languageTitle: "మీ భాషను ఎంచుకోండి",
    languageSubtitle: "ఎంచుకున్న భాషలో SAMANVAI కొనసాగుతుంది.",
    chooseLanguage: "కొనసాగించండి",
    tagline: "అవసరం నుండి సేవ వరకు",
    verifiedCitizen: "ధృవీకరించబడిన పౌరుడు",
    workspace: "మీ డిజిటల్ ప్రభుత్వ కార్యస్థలం",
    startPlaceholder: "ప్రారంభించండి",
    or: "లేదా",
    searchServices: "ప్రభుత్వ సేవలను వెతకండి",
    quickAccess: "త్వరిత ప్రవేశం",
    checkStatus: "స్థితి తనిఖీ",
    checkEligibility: "అర్హత తనిఖీ",
    bookAppointment: "అపాయింట్మెంట్ బుక్ చేయండి",
    latestUpdates: "తాజా సమాచారం",
    home: "హోమ్",
    history: "చరిత్ర",
    applications: "నా దరఖాస్తులు",
    documents: "నా పత్రాలు",
    notifications: "నోటిఫికేషన్లు",
    support: "సహాయం & మద్దతు",
    settings: "సెట్టింగులు",
    profile: "వినియోగదారు ప్రొఫైల్",
    language: "భాష",
    accessibility: "ప్రాప్యత",
    menu: "మెను",
  },
  hi: {
    secureAccess: "सुरक्षित सरकारी प्रवेश",
    pinTitle: "नागरिक PIN दर्ज करें",
    pinSubtitle: "अपना SAMANVAI कार्यक्षेत्र खोलने के लिए सत्र सत्यापित करें.",
    pinPlaceholder: "4 अंकों का PIN",
    verify: "PIN सत्यापित करें",
    pinHint: "प्रोटोटाइप PIN: 2026",
    invalidPin: "मान्य 4 अंकों का प्रोटोटाइप PIN दर्ज करें.",
    languageTitle: "अपनी भाषा चुनें",
    languageSubtitle: "SAMANVAI चुनी हुई भाषा में जारी रहेगा.",
    chooseLanguage: "जारी रखें",
    tagline: "ज़रूरत से सेवा तक",
    verifiedCitizen: "सत्यापित नागरिक",
    workspace: "आपका डिजिटल सरकारी कार्यक्षेत्र",
    startPlaceholder: "शुरू करें",
    or: "या",
    searchServices: "सरकारी सेवाएं खोजें",
    quickAccess: "त्वरित पहुंच",
    checkStatus: "स्थिति जांचें",
    checkEligibility: "पात्रता जांचें",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    latestUpdates: "ताज़ा अपडेट",
    home: "होम",
    history: "इतिहास",
    applications: "मेरे आवेदन",
    documents: "मेरे दस्तावेज़",
    notifications: "सूचनाएं",
    support: "सहायता और समर्थन",
    settings: "सेटिंग्स",
    profile: "उपयोगकर्ता प्रोफ़ाइल",
    language: "भाषा",
    accessibility: "सुगम्यता",
    menu: "मेनू",
  },
  ta: {
    secureAccess: "பாதுகாப்பான அரசு அணுகல்",
    pinTitle: "குடிமகன் PIN ஐ உள்ளிடவும்",
    pinSubtitle: "உங்கள் SAMANVAI பணியிடத்தைத் திறக்க அமர்வை சரிபார்க்கவும்.",
    pinPlaceholder: "4 இலக்க PIN",
    verify: "PIN சரிபார்க்கவும்",
    pinHint: "மாதிரி PIN: 2026",
    invalidPin: "சரியான 4 இலக்க மாதிரி PIN ஐ உள்ளிடவும்.",
    languageTitle: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    languageSubtitle: "தேர்ந்தெடுத்த மொழியில் SAMANVAI தொடரும்.",
    chooseLanguage: "தொடரவும்",
    tagline: "தேவையிலிருந்து சேவைக்கு",
    verifiedCitizen: "சரிபார்க்கப்பட்ட குடிமகன்",
    workspace: "உங்கள் டிஜிட்டல் அரசு பணியிடம்",
    startPlaceholder: "தொடங்குங்கள்",
    or: "அல்லது",
    searchServices: "அரசு சேவைகளைத் தேடுங்கள்",
    quickAccess: "விரைவு அணுகல்",
    checkStatus: "நிலையைச் சரிபார்க்கவும்",
    checkEligibility: "தகுதியைச் சரிபார்க்கவும்",
    bookAppointment: "சந்திப்பை பதிவு செய்யவும்",
    latestUpdates: "சமீபத்திய புதுப்பிப்புகள்",
    home: "முகப்பு",
    history: "வரலாறு",
    applications: "என் விண்ணப்பங்கள்",
    documents: "என் ஆவணங்கள்",
    notifications: "அறிவிப்புகள்",
    support: "உதவி & ஆதரவு",
    settings: "அமைப்புகள்",
    profile: "பயனர் சுயவிவரம்",
    language: "மொழி",
    accessibility: "அணுகல்தன்மை",
    menu: "மெனு",
  },
  kn: {
    secureAccess: "ಸುರಕ್ಷಿತ ಸರ್ಕಾರಿ ಪ್ರವೇಶ",
    pinTitle: "ನಾಗರಿಕ PIN ನಮೂದಿಸಿ",
    pinSubtitle: "ನಿಮ್ಮ SAMANVAI ಕಾರ್ಯಕ್ಷೇತ್ರವನ್ನು ತೆರೆಯಲು ಸೆಷನ್ ಪರಿಶೀಲಿಸಿ.",
    pinPlaceholder: "4 ಅಂಕಿಯ PIN",
    verify: "PIN ಪರಿಶೀಲಿಸಿ",
    pinHint: "ಪ್ರೋಟೋಟೈಪ್ PIN: 2026",
    invalidPin: "ಸರಿಯಾದ 4 ಅಂಕಿಯ ಪ್ರೋಟೋಟೈಪ್ PIN ನಮೂದಿಸಿ.",
    languageTitle: "ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    languageSubtitle: "ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ SAMANVAI ಮುಂದುವರಿಯುತ್ತದೆ.",
    chooseLanguage: "ಮುಂದುವರಿಸಿ",
    tagline: "ಅಗತ್ಯದಿಂದ ಸೇವೆಗೆ",
    verifiedCitizen: "ಪರಿಶೀಲಿತ ನಾಗರಿಕ",
    workspace: "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಸರ್ಕಾರಿ ಕಾರ್ಯಕ್ಷೇತ್ರ",
    startPlaceholder: "ಪ್ರಾರಂಭಿಸಿ",
    or: "ಅಥವಾ",
    searchServices: "ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ",
    quickAccess: "ತ್ವರಿತ ಪ್ರವೇಶ",
    checkStatus: "ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
    checkEligibility: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
    bookAppointment: "ನೇಮಕಾತಿ ಬುಕ್ ಮಾಡಿ",
    latestUpdates: "ಇತ್ತೀಚಿನ ನವೀಕರಣಗಳು",
    home: "ಮುಖಪುಟ",
    history: "ಇತಿಹಾಸ",
    applications: "ನನ್ನ ಅರ್ಜಿಗಳು",
    documents: "ನನ್ನ ದಾಖಲೆಗಳು",
    notifications: "ಅಧಿಸೂಚನೆಗಳು",
    support: "ಸಹಾಯ & ಬೆಂಬಲ",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    profile: "ಬಳಕೆದಾರ ಪ್ರೊಫೈಲ್",
    language: "ಭಾಷೆ",
    accessibility: "ಪ್ರವೇಶಸೌಲಭ್ಯ",
    menu: "ಮೆನು",
  },
  ml: {
    secureAccess: "സുരക്ഷിത സർക്കാർ പ്രവേശനം",
    pinTitle: "പൗര PIN നൽകുക",
    pinSubtitle: "നിങ്ങളുടെ SAMANVAI പ്രവർത്തനസ്ഥലം തുറക്കാൻ സെഷൻ സ്ഥിരീകരിക്കുക.",
    pinPlaceholder: "4 അക്ക PIN",
    verify: "PIN സ്ഥിരീകരിക്കുക",
    pinHint: "പ്രോട്ടോടൈപ്പ് PIN: 2026",
    invalidPin: "ശരിയായ 4 അക്ക പ്രോട്ടോടൈപ്പ് PIN നൽകുക.",
    languageTitle: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    languageSubtitle: "തിരഞ്ഞെടുത്ത ഭാഷയിൽ SAMANVAI തുടരുന്നു.",
    chooseLanguage: "തുടരുക",
    tagline: "ആവശ്യത്തിൽ നിന്ന് സേവനത്തിലേക്ക്",
    verifiedCitizen: "സ്ഥിരീകരിച്ച പൗരൻ",
    workspace: "നിങ്ങളുടെ ഡിജിറ്റൽ സർക്കാർ പ്രവർത്തനസ്ഥലം",
    startPlaceholder: "ആരംഭിക്കുക",
    or: "അല്ലെങ്കിൽ",
    searchServices: "സർക്കാർ സേവനങ്ങൾ തിരയുക",
    quickAccess: "വേഗത്തിലുള്ള പ്രവേശനം",
    checkStatus: "സ്ഥിതി പരിശോധിക്കുക",
    checkEligibility: "യോഗ്യത പരിശോധിക്കുക",
    bookAppointment: "അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക",
    latestUpdates: "പുതിയ അപ്ഡേറ്റുകൾ",
    home: "ഹോം",
    history: "ചരിത്രം",
    applications: "എന്റെ അപേക്ഷകൾ",
    documents: "എന്റെ രേഖകൾ",
    notifications: "അറിയിപ്പുകൾ",
    support: "സഹായം & പിന്തുണ",
    settings: "ക്രമീകരണങ്ങൾ",
    profile: "ഉപയോക്തൃ പ്രൊഫൈൽ",
    language: "ഭാഷ",
    accessibility: "ആക്സസിബിലിറ്റി",
    menu: "മെനു",
  },
} satisfies Record<LanguageCode, Record<string, string>>;

const sidebarIconMap = [Home, History, FileCheck2, FileText, Bell, CircleHelp, Settings, User];

const greetingLine: Record<LanguageCode, string> = {
  en: "Namaste, [User Name]! Which government service can I help you with today?",
  te: "నమస్కారం, [User Name]! ఈరోజు మీకు ఏ ప్రభుత్వ సేవలో సహాయం చేయగలను?",
  hi: "नमस्ते, [User Name]! आज मैं किस सरकारी सेवा में आपकी सहायता कर सकता हूं?",
  ta: "வணக்கம், [User Name]! இன்று எந்த அரசு சேவையில் உதவலாம்?",
  kn: "ನಮಸ್ಕಾರ, [User Name]! ಇಂದು ಯಾವ ಸರ್ಕಾರಿ ಸೇವೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಲಿ?",
  ml: "നമസ്കാരം, [User Name]! ഇന്ന് ഏത് സർക്കാർ സേവനത്തിൽ സഹായിക്കാം?",
};

export default function SamanvaiApp() {
  const [step, setStep] = useState<FlowStep>(() => {
    if (typeof window === "undefined") {
      return "pin";
    }

    const savedLanguage = window.localStorage.getItem("samanvai-language") as LanguageCode | null;
    const verified = window.sessionStorage.getItem("samanvai-pin-verified") === "true";

    if (verified && savedLanguage && copy[savedLanguage]) {
      return "dashboard";
    }

    return verified ? "language" : "pin";
  });
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const savedLanguage = window.localStorage.getItem("samanvai-language") as LanguageCode | null;
    return savedLanguage && copy[savedLanguage] ? savedLanguage : "en";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const t = copy[selectedLanguage];

  const sidebarItems = useMemo(
    () => [t.home, t.history, t.applications, t.documents, t.notifications, t.support, t.settings, t.profile],
    [t],
  );

  const quickActions = [
    { label: t.checkStatus, icon: Clock3, accent: "from-sky-500 to-cyan-400" },
    { label: t.checkEligibility, icon: ShieldCheck, accent: "from-emerald-500 to-lime-400" },
    { label: t.bookAppointment, icon: CalendarCheck, accent: "from-orange-400 to-amber-300" },
    { label: t.latestUpdates, icon: Bell, accent: "from-indigo-500 to-blue-400" },
  ];

  function submitPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pin === accessPin) {
      window.sessionStorage.setItem("samanvai-pin-verified", "true");
      setError("");
      setStep("language");
      return;
    }

    setError(t.invalidPin);
  }

  function chooseLanguage(code: LanguageCode) {
    window.localStorage.setItem("samanvai-language", code);
    setSelectedLanguage(code);
    setStep("dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fafdff_0%,#edf7ff_42%,#dceeff_100%)] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.82),rgba(224,240,255,.56)_44%,rgba(247,252,255,.72)),repeating-linear-gradient(0deg,rgba(6,31,85,.018)_0,rgba(6,31,85,.018)_1px,transparent_1px,transparent_24px)]" />
      <div className="pointer-events-none absolute left-[16%] top-[-6%] h-[48rem] w-[82rem] -rotate-6 rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,.98)_0%,rgba(255,255,255,.78)_34%,rgba(210,232,255,.3)_58%,transparent_76%)] blur-2xl" />
      <div className="pointer-events-none absolute left-[20%] top-[42%] h-32 w-[68rem] -rotate-6 rounded-full border-t border-white/80 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.6),rgba(199,225,255,.34),transparent)] blur-md" />
      <div className="pointer-events-none absolute left-[17%] top-[53%] h-20 w-[60rem] -rotate-6 rounded-full border-t border-white/55 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.32),transparent)] blur-lg" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,153,51,.52),rgba(255,255,255,.8),rgba(19,136,8,.48))]" />

      {step === "pin" && (
        <section className="relative flex min-h-screen items-center justify-center px-4 py-10">
          <form
            onSubmit={submitPin}
            className="w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white/62 p-6 shadow-[0_30px_90px_rgba(15,76,129,.18)] backdrop-blur-2xl sm:p-8"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a2a6e] text-white shadow-[0_18px_40px_rgba(10,42,110,.28)]">
              <LockKeyhole size={30} />
            </div>
            <div className="mt-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[.28em] text-sky-700">{t.secureAccess}</p>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-950">{t.pinTitle}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t.pinSubtitle}</p>
            </div>

            <label className="mt-8 block text-sm font-bold text-slate-700" htmlFor="citizen-pin">
              {t.pinPlaceholder}
            </label>
            <input
              id="citizen-pin"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="2026"
              className="mt-3 h-14 w-full rounded-2xl border border-white/80 bg-white/76 px-5 text-center text-2xl font-black tracking-[.35em] text-slate-950 shadow-inner outline-none transition focus:border-sky-300 focus:bg-white focus:shadow-[0_0_0_5px_rgba(14,165,233,.14)]"
            />
            {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

            <button
              type="submit"
              className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0a2a6e] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_18px_42px_rgba(10,42,110,.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#083987]"
            >
              {t.verify}
              <ChevronRight size={18} />
            </button>
            <p className="mt-5 text-center text-xs font-semibold text-slate-500">{t.pinHint}</p>
          </form>
        </section>
      )}

      {step === "language" && (
        <section className="relative flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-3xl rounded-[1.75rem] border border-white/70 bg-white/64 p-6 shadow-[0_30px_90px_rgba(15,76,129,.18)] backdrop-blur-2xl sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0a2a6e] shadow-[0_18px_40px_rgba(10,42,110,.16)]">
                <Languages size={30} />
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-normal text-slate-950">{t.languageTitle}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t.languageSubtitle}</p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => chooseLanguage(language.code)}
                  className="group rounded-2xl border border-white/80 bg-white/70 p-5 text-left shadow-[0_14px_38px_rgba(15,76,129,.08)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_22px_54px_rgba(15,76,129,.14)]"
                >
                  <span className="block text-xl font-black text-slate-950">{language.nativeName}</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-500">{language.label}</span>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-sky-700">
                    {copy[language.code].chooseLanguage}
                    <ChevronRight size={16} className="transition group-hover:translate-x-1" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === "dashboard" && (
        <section className="relative min-h-screen px-4 py-3 sm:px-5 lg:px-6">
          <aside
            className={`fixed inset-y-0 left-0 z-30 m-2 w-72 rounded-[2rem] border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,.54),rgba(224,240,255,.34))] p-6 shadow-[0_34px_110px_rgba(36,86,142,.18),inset_0_1px_0_rgba(255,255,255,.98),inset_0_0_34px_rgba(255,255,255,.38),inset_0_-1px_0_rgba(173,211,250,.28)] backdrop-blur-[34px] transition duration-300 lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black tracking-[.08em] text-[#08245d]">SAMANVAI</p>
                <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[.34em] text-slate-500">Digital India</p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white lg:hidden"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="mt-10 space-y-3">
              {sidebarItems.map((item, index) => {
                const Icon = sidebarIconMap[index];

                return (
                  <button
                    key={item}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-[1.15rem] px-4 py-3.5 text-left text-sm font-semibold transition duration-300 ${
                      index === 0
                        ? "border border-white/95 bg-[linear-gradient(145deg,rgba(255,255,255,.72),rgba(199,224,255,.56))] text-[#08245d] shadow-[0_18px_46px_rgba(54,116,194,.22),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(143,190,242,.3)]"
                        : "text-slate-700 hover:-translate-y-0.5 hover:bg-white/52 hover:text-[#08245d] hover:shadow-[0_12px_30px_rgba(36,86,142,.1),inset_0_1px_0_rgba(255,255,255,.86)]"
                    }`}
                  >
                    <Icon size={19} className={index === 0 ? "text-blue-700" : "text-slate-600"} />
                    {item}
                  </button>
                );
              })}
            </nav>
          </aside>

          {sidebarOpen ? (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-slate-950/24 backdrop-blur-sm lg:hidden"
            />
          ) : null}

          <div className="lg:pl-[19rem]">
            <header className="mx-auto flex max-w-6xl items-center justify-between px-1 py-1 sm:px-2">
              <button
                type="button"
                aria-label={t.menu}
                onClick={() => setSidebarOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-800 shadow-sm backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#08245d] lg:invisible"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={selectedLanguage}
                  aria-label={t.language}
                  onChange={(event) => chooseLanguage(event.target.value as LanguageCode)}
                  className="h-11 rounded-2xl border border-white/80 bg-white/72 px-3 text-sm font-bold text-slate-700 shadow-sm outline-none backdrop-blur-xl transition duration-300 hover:bg-white focus:shadow-[0_0_0_5px_rgba(37,99,235,.1)]"
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.nativeName}
                    </option>
                  ))}
                </select>
                <IconButton label={t.language} icon={Globe2} />
                <IconButton label={t.accessibility} icon={Accessibility} />
                <IconButton label={t.profile} icon={User} />
              </div>
            </header>

            <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col items-center justify-center pb-5 pt-2 text-center">
              <div className="pointer-events-none absolute left-1/2 top-[2%] h-[30rem] w-[min(62rem,92vw)] -translate-x-1/2 rounded-full bg-white/90 blur-3xl" />

              <h1 className="relative mt-1 text-5xl font-black leading-none tracking-[.14em] text-[#061f55] drop-shadow-[0_14px_24px_rgba(10,42,110,.18)] sm:text-6xl lg:text-[4.8rem]">
                SAMANVAI
              </h1>
              <div className="relative mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/70 shadow-inner">
                <div className="h-full w-full bg-[linear-gradient(90deg,#ff9933_0%,#ff9933_34%,#ffffff_34%,#ffffff_66%,#138808_66%,#138808_100%)]" />
              </div>
              <p className="relative mt-4 text-lg font-medium tracking-wide text-slate-800 sm:text-xl">{t.tagline}</p>
              <p className="relative mt-6 max-w-3xl text-base font-semibold leading-7 text-slate-700 sm:text-lg">
                {greetingLine[selectedLanguage]}
              </p>

              <div className="relative mt-7 grid w-full max-w-[34rem] grid-cols-1 gap-6 sm:grid-cols-2">
                <button
                  type="button"
                  className="group flex aspect-square min-h-44 flex-col items-center justify-center rounded-[2rem] border border-white/95 bg-[linear-gradient(145deg,rgba(255,255,255,.58),rgba(225,241,255,.36))] p-7 text-[#061f55] shadow-[0_34px_86px_rgba(36,86,142,.18),inset_0_1px_0_rgba(255,255,255,1),inset_0_0_34px_rgba(255,255,255,.46),inset_0_-1px_0_rgba(150,198,247,.3)] backdrop-blur-[34px] transition duration-300 hover:-translate-y-1 hover:bg-white/62 hover:shadow-[0_42px_105px_rgba(36,86,142,.23),inset_0_1px_0_rgba(255,255,255,1)]"
                >
                  <Keyboard className="drop-shadow-[0_10px_18px_rgba(12,91,216,.22)] transition duration-300 group-hover:scale-105" size={72} strokeWidth={2.4} />
                  <span className="mt-5 text-3xl font-medium tracking-tight">Type</span>
                </button>
                <button
                  type="button"
                  className="group flex aspect-square min-h-44 flex-col items-center justify-center rounded-[2rem] border border-white/95 bg-[linear-gradient(145deg,rgba(255,255,255,.58),rgba(225,241,255,.36))] p-7 text-[#075dd6] shadow-[0_34px_86px_rgba(36,86,142,.18),inset_0_1px_0_rgba(255,255,255,1),inset_0_0_34px_rgba(255,255,255,.46),inset_0_-1px_0_rgba(150,198,247,.3)] backdrop-blur-[34px] transition duration-300 hover:-translate-y-1 hover:bg-white/62 hover:shadow-[0_42px_105px_rgba(36,86,142,.23),inset_0_1px_0_rgba(255,255,255,1)]"
                >
                  <Mic className="drop-shadow-[0_10px_18px_rgba(12,91,216,.24)] transition duration-300 group-hover:scale-105" size={82} strokeWidth={2.5} />
                  <span className="mt-4 text-3xl font-medium tracking-tight text-[#061f55]">Speak</span>
                </button>
              </div>

              <div className="sr-only">
                <input aria-label={t.startPlaceholder} />
                <button type="button" aria-label="Microphone">
                  <Mic size={22} />
                </button>
                <button type="button">
                  <Search size={19} />
                  {t.searchServices}
                </button>
              </div>

              <div className="relative mt-10 w-full">
                <h2 className="text-left text-lg font-semibold tracking-tight text-slate-900">{t.quickAccess}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className="group flex min-h-28 items-center gap-4 rounded-[1.35rem] border border-white/95 bg-[linear-gradient(145deg,rgba(255,255,255,.56),rgba(225,241,255,.34))] p-4 text-left shadow-[0_22px_62px_rgba(36,86,142,.12),inset_0_1px_0_rgba(255,255,255,.96),inset_0_0_26px_rgba(255,255,255,.34),inset_0_-1px_0_rgba(150,198,247,.24)] backdrop-blur-[32px] transition duration-300 hover:-translate-y-1 hover:bg-white/64 hover:shadow-[0_32px_82px_rgba(36,86,142,.18),inset_0_1px_0_rgba(255,255,255,1)]"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,.78),rgba(213,234,255,.48))] text-[#075dd6] shadow-[0_14px_30px_rgba(36,86,142,.14),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(150,198,247,.22)] transition duration-300 group-hover:scale-105">
                        <action.icon size={21} />
                      </span>
                      <span className="min-w-0 flex-1 text-base font-semibold leading-6 text-slate-900">{action.label}</span>
                      <ChevronRight className="shrink-0 text-slate-800 transition duration-300 group-hover:translate-x-1" size={20} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function IconButton({ label, icon: Icon }: { label: string; icon: typeof Globe2 }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/68 text-slate-700 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#08245d] hover:shadow-[0_12px_28px_rgba(18,65,110,.1)] sm:flex"
    >
      <Icon size={19} />
    </button>
  );
}
