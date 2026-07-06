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
  History,
  Home,
  Keyboard,
  Languages,
  LockKeyhole,
  Menu,
  Mic,
  Send,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type LanguageCode = "en" | "te" | "hi";
type FlowStep = "login" | "pin" | "language" | "dashboard";
type ViewKey = "home" | "history" | "applications" | "documents" | "notifications" | "support" | "settings" | "profile";
type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  start: () => void;
};

type ApplicationRecord = {
  referenceId: string;
  itemId: string;
  itemName: string;
  status: string;
  internalStatus: string;
  governmentSyncedStatus: string;
  createdAt: string;
  facts: Record<string, string | number | boolean>;
  documents: Array<{ name: string; status: string; source: string; manualUpload: string }>;
  statusHistory: Array<{ status: string; at: string; note: string }>;
};

type FormQuestion = { key: string; question: string; type: "boolean" | "number" | "text" | "choice" | "date"; choices?: string[] };
type KnowledgeSummary = {
  id: string;
  name: string;
  department: string;
  questions: FormQuestion[];
  documents: Array<{ name: string; requirement: string; source: string; manualUpload: string }>;
  workflow: string[];
  fees: string;
  processingTime: string;
};

type AssistantResult = {
  item?: KnowledgeSummary;
  facts: Record<string, string | number | boolean>;
  response: string;
  nextQuestion?: { key: string; question: string };
  canApply: boolean;
};

const accessPin = "2026";
const portalLanguages: Array<{ code: LanguageCode; label: string; nativeName: string }> = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "te", label: "Telugu", nativeName: "తెలుగు" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
];
const samanvaiLanguages = portalLanguages;

const copy = {
  en: {
    secureAccess: "Secure Government Access",
    loginTitle: "Government Portal Login",
    loginSubtitle: "Authenticate with the Government Portal before launching SAMANVAI.",
    citizenId: "Citizen ID",
    password: "Password",
    login: "Login",
    pinTitle: "Enter Citizen PIN",
    pinSubtitle: "Verify your portal session to open your SAMANVAI workspace.",
    pinPlaceholder: "4-digit PIN",
    verify: "Verify PIN",
    pinHint: "Citizen PIN: 2026",
    invalidPin: "Enter the valid 4-digit citizen PIN.",
    languageTitle: "Choose Your Preferred Language",
    languageSubtitle: "Government Portal language remains separate. SAMANVAI will continue in the selected language.",
    chooseLanguage: "Continue",
    tagline: "From Need to Service",
    verifiedCitizen: "Verified Citizen",
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
    accessibility: "Accessibility",
    menu: "Menu",
    typePrompt: "Type your request...",
    voicePrompt: "Speak your request",
    send: "Send",
    apply: "Apply",
    statusInput: "Enter SAMANVAI Reference ID",
    noApplications: "No applications yet. Ask SAMANVAI for a verified service and submit when eligible.",
    consent: "Consent is active for minimum data collection, audit logging, and secure government API checks.",
  },
  te: {
    secureAccess: "సురక్షిత ప్రభుత్వ ప్రవేశం",
    loginTitle: "ప్రభుత్వ పోర్టల్ లాగిన్",
    loginSubtitle: "SAMANVAI ప్రారంభించే ముందు Government Portal లో ధృవీకరించండి.",
    citizenId: "పౌర ID",
    password: "పాస్‌వర్డ్",
    login: "లాగిన్",
    pinTitle: "పౌర PIN నమోదు చేయండి",
    pinSubtitle: "మీ SAMANVAI కార్యస్థలాన్ని తెరవడానికి పోర్టల్ సెషన్‌ను ధృవీకరించండి.",
    pinPlaceholder: "4 అంకెల PIN",
    verify: "PIN ధృవీకరించండి",
    pinHint: "Citizen PIN: 2026",
    invalidPin: "సరైన 4 అంకెల citizen PIN నమోదు చేయండి.",
    languageTitle: "మీకు ఇష్టమైన భాషను ఎంచుకోండి",
    languageSubtitle: "Government Portal భాష వేరు. SAMANVAI ఎంచుకున్న భాషలో కొనసాగుతుంది.",
    chooseLanguage: "కొనసాగించండి",
    tagline: "అవసరం నుండి సేవ వరకు",
    verifiedCitizen: "ధృవీకరించిన పౌరుడు",
    quickAccess: "త్వరిత ప్రవేశం",
    checkStatus: "స్థితి తనిఖీ",
    checkEligibility: "అర్హత తనిఖీ",
    bookAppointment: "అపాయింట్‌మెంట్ బుక్ చేయండి",
    latestUpdates: "తాజా సమాచారం",
    home: "హోమ్",
    history: "చరిత్ర",
    applications: "నా దరఖాస్తులు",
    documents: "నా పత్రాలు",
    notifications: "నోటిఫికేషన్లు",
    support: "సహాయం & మద్దతు",
    settings: "సెట్టింగులు",
    profile: "వినియోగదారు ప్రొఫైల్",
    accessibility: "ప్రాప్యత",
    menu: "మెను",
    typePrompt: "మీ అభ్యర్థన టైప్ చేయండి",
    voicePrompt: "మీ అభ్యర్థన చెప్పండి",
    send: "పంపండి",
    apply: "దరఖాస్తు",
    statusInput: "SAMANVAI Reference ID నమోదు చేయండి",
    noApplications: "ఇంకా దరఖాస్తులు లేవు. ధృవీకరించిన సేవ కోసం SAMANVAIని అడిగి, అర్హత వచ్చిన తర్వాత సమర్పించండి.",
    consent: "కనిష్ట డేటా సేకరణ, audit logging, మరియు secure government API checks కోసం consent active గా ఉంది.",
  },
  hi: {
    secureAccess: "सुरक्षित सरकारी प्रवेश",
    loginTitle: "Government Portal Login",
    loginSubtitle: "SAMANVAI शुरू करने से पहले Government Portal में authentication पूरा करें.",
    citizenId: "Citizen ID",
    password: "Password",
    login: "Login",
    pinTitle: "Citizen PIN दर्ज करें",
    pinSubtitle: "SAMANVAI workspace खोलने के लिए portal session verify करें.",
    pinPlaceholder: "4-digit PIN",
    verify: "PIN Verify करें",
    pinHint: "Citizen PIN: 2026",
    invalidPin: "सही 4-digit citizen PIN दर्ज करें.",
    languageTitle: "अपनी पसंदीदा भाषा चुनें",
    languageSubtitle: "Government Portal भाषा अलग रहती है. SAMANVAI चुनी हुई भाषा में चलेगा.",
    chooseLanguage: "जारी रखें",
    tagline: "जरूरत से सेवा तक",
    verifiedCitizen: "Verified Citizen",
    quickAccess: "Quick Access",
    checkStatus: "Status Check",
    checkEligibility: "Eligibility Check",
    bookAppointment: "Appointment Book करें",
    latestUpdates: "Latest Updates",
    home: "Home",
    history: "History",
    applications: "My Applications",
    documents: "My Documents",
    notifications: "Notifications",
    support: "Help & Support",
    settings: "Settings",
    profile: "User Profile",
    accessibility: "Accessibility",
    menu: "Menu",
    typePrompt: "अपना अनुरोध लिखें",
    voicePrompt: "अपना अनुरोध बोलें",
    send: "Send",
    apply: "Apply",
    statusInput: "SAMANVAI Reference ID दर्ज करें",
    noApplications: "अभी कोई application नहीं है. Verified service के लिए SAMANVAI से पूछें और eligible होने पर submit करें.",
    consent: "Minimum data collection, audit logging, और secure government API checks के लिए consent active है.",
  },
} satisfies Record<LanguageCode, Record<string, string>>;

const sidebarIconMap = [Home, History, FileCheck2, FileText, Bell, CircleHelp, Settings, User];
const viewKeys: ViewKey[] = ["home", "history", "applications", "documents", "notifications", "support", "settings", "profile"];

const greetingLine: Record<LanguageCode, string> = {
  en: "Namaste, Verified Citizen! Which government service can I help you complete today?",
  te: "నమస్కారం, ధృవీకరించిన పౌరుడా! ఈరోజు ఏ ప్రభుత్వ సేవను పూర్తి చేయడంలో సహాయం చేయాలి?",
  hi: "नमस्ते, Verified Citizen! आज किस सरकारी सेवा को पूरा करने में सहायता चाहिए?",
};

export default function SamanvaiApp() {
  const [step, setStep] = useState<FlowStep>(() => {
    if (typeof window === "undefined") return "login";
    const loggedIn = window.sessionStorage.getItem("gov-portal-authenticated") === "true";
    const verified = window.sessionStorage.getItem("samanvai-pin-verified") === "true";
    const savedLanguage = window.localStorage.getItem("samanvai-language") as LanguageCode | null;
    if (!loggedIn) return "login";
    if (!verified) return "pin";
    return savedLanguage && copy[savedLanguage] ? "dashboard" : "language";
  });
  const [portalLanguage, setPortalLanguage] = useState<LanguageCode>("en");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("samanvai-language") as LanguageCode | null;
    return saved && copy[saved] ? saved : "en";
  });
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewKey>("home");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<"text" | "voice">("text");
  const [message, setMessage] = useState("");
  const [assistant, setAssistant] = useState<AssistantResult | null>(null);
  const [draftFacts, setDraftFacts] = useState<Record<string, string | number | boolean>>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: "citizen" | "assistant"; text: string }>>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string; at: string }>>([]);
  const [history, setHistory] = useState<Array<{ id: string; input: string; response: string; at: string }>>([]);
  const [statusReference, setStatusReference] = useState("");
  const [statusText, setStatusText] = useState("");
  const recognitionRef = useRef<unknown>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const t = copy[selectedLanguage];
  const portalCopy = copy[portalLanguage];

  const sidebarItems = useMemo(
    () => [t.home, t.history, t.applications, t.documents, t.notifications, t.support, t.settings, t.profile],
    [t],
  );

  const quickActions = [
    { label: t.checkStatus, icon: Clock3, action: () => setActiveView("applications") },
    { label: t.checkEligibility, icon: ShieldCheck, action: () => openAssistant("text", "I want to check eligibility for Income Certificate") },
    { label: t.bookAppointment, icon: CalendarCheck, action: () => openAssistant("text", "I need help with Income Certificate appointment and application steps") },
    { label: t.latestUpdates, icon: Bell, action: () => setActiveView("notifications") },
  ];

  useEffect(() => {
    if (step === "dashboard") void refreshData();
  }, [step]);

  async function refreshData() {
    const response = await fetch("/api/samanvai", { cache: "no-store" });
    const data = await response.json();
    setApplications(data.applications || []);
    setNotifications(data.notifications || []);
    setHistory(data.history || []);
  }

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.sessionStorage.setItem("gov-portal-authenticated", "true");
    window.localStorage.setItem("government-portal-language", portalLanguage);
    setError("");
    setStep("pin");
  }

  function submitPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pin === accessPin) {
      window.sessionStorage.setItem("samanvai-pin-verified", "true");
      setError("");
      setStep("language");
      return;
    }
    setError(portalCopy.invalidPin);
  }

  async function chooseLanguage(language: LanguageCode) {
    window.localStorage.setItem("samanvai-language", language);
    setSelectedLanguage(language);
    await fetch("/api/samanvai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "preference", language }),
    });
    setStep("dashboard");
  }

  function openAssistant(mode: "text" | "voice", seed = "") {
    setAssistantMode(mode);
    setAssistantOpen(true);
    setActiveView("home");
    if (seed) setMessage(seed);
    if (mode === "voice") {
      startVoice();
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }

  async function sendAssistantMessage(seed?: string) {
    const text = (seed || message).trim();
    if (!text) return;
    setMessage("");
    setConversation((items) => [...items, { role: "citizen", text }]);
    const response = await fetch("/api/samanvai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "message",
        language: selectedLanguage,
        message: text,
        itemId: assistant?.item?.id,
        facts: assistant?.facts || {},
        lastQuestionKey: assistant?.nextQuestion?.key,
      }),
    });
    const result = (await response.json()) as AssistantResult;
    setAssistant(result);
    setDraftFacts(result.facts || {});
    setReviewOpen(Boolean(result.canApply));
    setConversation((items) => [...items, { role: "assistant", text: result.response }]);
    speak(result.response);
    await refreshData();
  }

  async function applyForService() {
    if (!assistant?.item?.id) return;
    const response = await fetch("/api/samanvai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "apply", language: selectedLanguage, itemId: assistant.item.id, facts: draftFacts }),
    });
    const data = await response.json();
    setConversation((items) => [...items, { role: "assistant", text: data.response }]);
    speak(data.response);
    await refreshData();
    setReviewOpen(false);
    setActiveView("applications");
  }

  async function checkStatus(reference = statusReference) {
    const response = await fetch("/api/samanvai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "status", language: selectedLanguage, referenceId: reference }),
    });
    const data = await response.json();
    setStatusText(data.response);
  }

  function updateDraftFact(key: string, value: string) {
    setDraftFacts((current) => ({ ...current, [key]: value }));
  }

  function startVoice() {
    const SpeechRecognitionCtor =
      typeof window !== "undefined" &&
      ((window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition; webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).webkitSpeechRecognition);
    if (!SpeechRecognitionCtor) {
      setConversation((items) => [...items, { role: "assistant", text: "Speech recognition is not available in this browser. Please use text input." }]);
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = selectedLanguage === "te" ? "te-IN" : selectedLanguage === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      void sendAssistantMessage(transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  }

  function speak(text: string) {
    if (assistantMode !== "voice" || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\n+/g, ". "));
    utterance.lang = selectedLanguage === "te" ? "te-IN" : selectedLanguage === "hi" ? "hi-IN" : "en-IN";
    window.speechSynthesis.speak(utterance);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fbff_0%,#eef7ff_38%,#d9ecff_100%)] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.82),rgba(224,240,255,.56)_44%,rgba(247,252,255,.72)),repeating-linear-gradient(0deg,rgba(6,31,85,.018)_0,rgba(6,31,85,.018)_1px,transparent_1px,transparent_24px)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-8%] h-[54rem] w-[88rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,.98)_0%,rgba(255,255,255,.78)_34%,rgba(210,232,255,.3)_58%,transparent_76%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,153,51,.52),rgba(255,255,255,.8),rgba(19,136,8,.48))]" />

      {step === "login" && (
        <section className="relative flex min-h-screen items-center justify-center px-4 py-10">
          <form onSubmit={submitLogin} className="w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white/62 p-6 shadow-[0_30px_90px_rgba(15,76,129,.18)] backdrop-blur-2xl sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a2a6e] text-white shadow-[0_18px_40px_rgba(10,42,110,.28)]">
              <User size={30} />
            </div>
            <div className="mt-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[.28em] text-sky-700">{portalCopy.secureAccess}</p>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-950">{portalCopy.loginTitle}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{portalCopy.loginSubtitle}</p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {portalLanguages.map((language) => (
                <button key={language.code} type="button" onClick={() => setPortalLanguage(language.code)} className={`rounded-xl border px-3 py-2 text-sm font-bold ${portalLanguage === language.code ? "border-sky-300 bg-white text-[#08245d]" : "border-white/70 bg-white/50 text-slate-600"}`}>
                  {language.nativeName}
                </button>
              ))}
            </div>
            <input aria-label={portalCopy.citizenId} placeholder={portalCopy.citizenId} className="mt-6 h-13 w-full rounded-2xl border border-white/80 bg-white/76 px-5 text-sm font-semibold outline-none focus:border-sky-300" />
            <input aria-label={portalCopy.password} placeholder={portalCopy.password} type="password" className="mt-3 h-13 w-full rounded-2xl border border-white/80 bg-white/76 px-5 text-sm font-semibold outline-none focus:border-sky-300" />
            <button type="submit" className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0a2a6e] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_18px_42px_rgba(10,42,110,.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#083987]">
              {portalCopy.login}
              <ChevronRight size={18} />
            </button>
          </form>
        </section>
      )}

      {step === "pin" && (
        <section className="relative flex min-h-screen items-center justify-center px-4 py-10">
          <form onSubmit={submitPin} className="w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white/62 p-6 shadow-[0_30px_90px_rgba(15,76,129,.18)] backdrop-blur-2xl sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a2a6e] text-white shadow-[0_18px_40px_rgba(10,42,110,.28)]">
              <LockKeyhole size={30} />
            </div>
            <div className="mt-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[.28em] text-sky-700">{portalCopy.secureAccess}</p>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-950">{portalCopy.pinTitle}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{portalCopy.pinSubtitle}</p>
            </div>
            <label className="mt-8 block text-sm font-bold text-slate-700" htmlFor="citizen-pin">
              {portalCopy.pinPlaceholder}
            </label>
            <input id="citizen-pin" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="one-time-code" placeholder="2026" className="mt-3 h-14 w-full rounded-2xl border border-white/80 bg-white/76 px-5 text-center text-2xl font-black tracking-[.35em] text-slate-950 shadow-inner outline-none transition focus:border-sky-300 focus:bg-white focus:shadow-[0_0_0_5px_rgba(14,165,233,.14)]" />
            {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
            <button type="submit" className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0a2a6e] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_18px_42px_rgba(10,42,110,.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#083987]">
              {portalCopy.verify}
              <ChevronRight size={18} />
            </button>
            <p className="mt-5 text-center text-xs font-semibold text-slate-500">{portalCopy.pinHint}</p>
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
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {samanvaiLanguages.map((language) => (
                <button key={language.code} type="button" onClick={() => chooseLanguage(language.code)} className="group rounded-2xl border border-white/80 bg-white/70 p-5 text-left shadow-[0_14px_38px_rgba(15,76,129,.08)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_22px_54px_rgba(15,76,129,.14)]">
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
          <aside className={`fixed inset-y-0 left-0 z-30 m-2 w-72 rounded-[2rem] border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,.54),rgba(224,240,255,.34))] p-6 shadow-[0_34px_110px_rgba(36,86,142,.18),inset_0_1px_0_rgba(255,255,255,.98),inset_0_0_34px_rgba(255,255,255,.38),inset_0_-1px_0_rgba(173,211,250,.28)] backdrop-blur-[34px] transition duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black tracking-[.08em] text-[#08245d]">SAMANVAI</p>
                <p className="mt-1 text-[0.78rem] font-bold tracking-normal text-slate-500">Digital India</p>
              </div>
              <button type="button" aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white lg:hidden">
                <X size={18} />
              </button>
            </div>
            <nav className="mt-10 space-y-3">
              {sidebarItems.map((item, index) => {
                const Icon = sidebarIconMap[index];
                const selected = activeView === viewKeys[index];
                return (
                  <button key={item} type="button" onClick={() => setActiveView(viewKeys[index])} className={`flex w-full items-center gap-3 rounded-[1.15rem] px-4 py-3.5 text-left text-sm font-semibold transition duration-300 ${selected ? "border border-white/95 bg-[linear-gradient(145deg,rgba(255,255,255,.72),rgba(199,224,255,.56))] text-[#08245d] shadow-[0_18px_46px_rgba(54,116,194,.22),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(143,190,242,.3)]" : "text-slate-700 hover:-translate-y-0.5 hover:bg-white/52 hover:text-[#08245d] hover:shadow-[0_12px_30px_rgba(36,86,142,.1),inset_0_1px_0_rgba(255,255,255,.86)]"}`}>
                    <Icon size={19} className={selected ? "text-blue-700" : "text-slate-600"} />
                    {item}
                  </button>
                );
              })}
            </nav>
          </aside>

          {sidebarOpen ? <button type="button" aria-label="Close sidebar overlay" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-slate-950/24 backdrop-blur-sm lg:hidden" /> : null}

          <div className="lg:pl-[19rem]">
            <div className="fixed inset-x-4 top-4 z-20 flex items-center justify-between lg:left-[20rem]">
              <button type="button" aria-label={t.menu} onClick={() => setSidebarOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-800 shadow-sm backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#08245d] lg:invisible">
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <TopIconButton label={t.accessibility} icon={Accessibility} onClick={() => setActiveView("support")} />
                <TopIconButton label={t.profile} icon={User} onClick={() => setActiveView("profile")} />
              </div>
            </div>

            <div className={`relative mx-auto flex min-h-screen max-w-6xl flex-col items-center pb-5 text-center transition-all duration-300 ${assistantOpen ? "justify-start pt-6" : "justify-center pt-16"}`}>
              <div className="pointer-events-none absolute left-1/2 top-[1%] h-[34rem] w-[min(68rem,94vw)] -translate-x-1/2 rounded-full bg-white/95 blur-3xl" />
              <h1 className={`relative font-black leading-none tracking-[.14em] text-[#061f55] drop-shadow-[0_14px_24px_rgba(10,42,110,.18)] transition-all duration-300 ${assistantOpen ? "text-3xl sm:text-4xl lg:text-4xl mt-1 mb-2" : "text-5xl sm:text-6xl lg:text-[4.8rem] mt-1"}`}>SAMANVAI</h1>
              
              {!assistantOpen && (
                <>
                  <div className="relative mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/70 shadow-inner">
                    <div className="h-full w-full bg-[linear-gradient(90deg,#ff9933_0%,#ff9933_34%,#ffffff_34%,#ffffff_66%,#138808_66%,#138808_100%)]" />
                  </div>
                  <p className="relative mt-4 text-lg font-medium tracking-wide text-slate-800 sm:text-xl">{t.tagline}</p>
                  <p className="relative mt-6 max-w-3xl text-base font-semibold leading-7 text-slate-700 sm:text-lg">{greetingLine[selectedLanguage]}</p>
                </>
              )}

              {activeView === "home" ? (
                <>
                  <div className="relative mt-7 grid w-full max-w-[34rem] grid-cols-1 gap-6 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => openAssistant("text")}
                      className={`group relative flex aspect-square min-h-44 flex-col items-center justify-center overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 hover:bg-white/75 cursor-pointer ${
                        assistantOpen && assistantMode === "text"
                          ? "border-[#061f55]/60 bg-white shadow-[0_0_40px_rgba(6,31,85,0.25),inset_0_1px_0_rgba(255,255,255,1)] text-[#061f55]"
                          : "border-white/95 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,1)_0%,rgba(255,255,255,.96)_22%,rgba(230,244,255,.62)_50%,rgba(255,255,255,.5)_100%)] text-[#061f55] shadow-[0_0_0_1px_rgba(255,255,255,.9),0_34px_84px_rgba(14,96,185,.2),0_0_130px_rgba(255,255,255,1),0_0_70px_rgba(66,153,225,.18)] backdrop-blur-[34px]"
                      }`}
                    >
                      <Keyboard className="relative drop-shadow-[0_0_32px_rgba(9,83,190,.34)] transition duration-300 group-hover:scale-105" size={72} strokeWidth={2.4} />
                      <span className="mt-4 text-base font-black tracking-wide text-slate-800 group-hover:text-[#061f55] transition duration-300">Text Assistant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openAssistant("voice")}
                      className={`group relative flex aspect-square min-h-44 flex-col items-center justify-center overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 hover:bg-white/75 cursor-pointer ${
                        assistantOpen && assistantMode === "voice"
                          ? "border-[#075dd6]/60 bg-white shadow-[0_0_40px_rgba(7,93,214,0.25),inset_0_1px_0_rgba(255,255,255,1)] text-[#075dd6]"
                          : "border-white/95 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,1)_0%,rgba(255,255,255,.96)_22%,rgba(230,244,255,.62)_50%,rgba(255,255,255,.5)_100%)] text-[#075dd6] shadow-[0_0_0_1px_rgba(255,255,255,.9),0_34px_84px_rgba(14,96,185,.2),0_0_130px_rgba(255,255,255,1),0_0_70px_rgba(66,153,225,.18)] backdrop-blur-[34px]"
                      }`}
                    >
                      <Mic className="relative drop-shadow-[0_0_36px_rgba(9,83,190,.38)] transition duration-300 group-hover:scale-105" size={82} strokeWidth={2.5} />
                      <span className="mt-4 text-base font-black tracking-wide text-slate-800 group-hover:text-[#075dd6] transition duration-300">Voice Assistant</span>
                    </button>
                  </div>

                  {assistantOpen ? (
                    <div className="relative mt-4 grid w-full max-w-6xl gap-4 text-left lg:grid-cols-[1fr_24rem] items-start w-full">
                      <div className="rounded-[2rem] border border-white/95 bg-white/70 p-6 pb-6 shadow-[0_22px_62px_rgba(36,86,142,.12)] backdrop-blur-[32px] flex flex-col h-auto w-full">
                        {conversation.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-6 text-center mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#0a2a6e] text-white shadow-[0_18px_40px_rgba(10,42,110,.2)] mb-5">
                              <FileCheck2 size={28} />
                            </div>
                            <h2 className="text-2.5xl font-black tracking-wide text-[#061f55]">Welcome to SAMANVAI</h2>
                            <p className="mt-1 text-sm font-semibold tracking-wider text-slate-500 uppercase">From Need to Service</p>

                            <div className="mt-8 w-full max-w-md">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Popular Suggestions</p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {["PM-KISAN", "Aarogyasri", "Indiramma Illu", "Telangana ePASS"].map((suggestion) => (
                                  <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => {
                                      void sendAssistantMessage(suggestion);
                                    }}
                                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-3 mb-4">
                            {conversation.map((entry, index) => (
                              <div key={`${entry.role}-${index}`} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${entry.role === "citizen" ? "ml-auto max-w-[84%] bg-[#0a2a6e] text-white" : "mr-auto max-w-[92%] bg-white text-slate-800 shadow-sm"}`}>
                                {entry.text}
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </div>
                        )}
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            void sendAssistantMessage();
                          }}
                          className="mt-4 flex gap-3"
                        >
                          <input
                            ref={inputRef}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder={assistantMode === "voice" ? t.voicePrompt : t.typePrompt}
                            className="h-13 min-w-0 flex-1 rounded-2xl border border-white/90 bg-white/90 px-5 text-sm font-semibold outline-none focus:border-sky-300 focus:bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
                          />
                          <button
                            type="submit"
                            aria-label={t.send}
                            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#0a2a6e] text-white shadow-md hover:bg-sky-950 transition duration-200 cursor-pointer"
                          >
                            <Send size={19} />
                          </button>
                          <button
                            type="button"
                            aria-label={t.voicePrompt}
                            onClick={startVoice}
                            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#075dd6] hover:bg-white hover:text-blue-700 transition duration-300 shadow-sm cursor-pointer"
                          >
                            <Mic size={19} />
                          </button>
                        </form>
                      </div>
                      <LiveApplicationForm assistant={assistant} facts={draftFacts} reviewOpen={reviewOpen} updateFact={updateDraftFact} openReview={() => setReviewOpen(true)} submitApplication={applyForService} applyLabel={t.apply} />
                    </div>
                  ) : null}

                  <div className="relative mt-10 w-full">
                    <h2 className="text-left text-lg font-semibold tracking-tight text-slate-900">{t.quickAccess}</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {quickActions.map((action) => (
                        <button key={action.label} type="button" onClick={action.action} className="group flex min-h-28 items-center gap-4 rounded-[1.35rem] border border-white/95 bg-[linear-gradient(145deg,rgba(255,255,255,.56),rgba(225,241,255,.34))] p-4 text-left shadow-[0_22px_62px_rgba(36,86,142,.12),inset_0_1px_0_rgba(255,255,255,.96),inset_0_0_26px_rgba(255,255,255,.34),inset_0_-1px_0_rgba(150,198,247,.24)] backdrop-blur-[32px] transition duration-300 hover:-translate-y-1 hover:bg-white/64">
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,.78),rgba(213,234,255,.48))] text-[#075dd6] shadow-[0_14px_30px_rgba(36,86,142,.14)]">
                            <action.icon size={21} />
                          </span>
                          <span className="min-w-0 flex-1 text-base font-semibold leading-6 text-slate-900">{action.label}</span>
                          <ChevronRight className="shrink-0 text-slate-800 transition duration-300 group-hover:translate-x-1" size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <DashboardPanel
                  view={activeView}
                  labels={t}
                  applications={applications}
                  notifications={notifications}
                  history={history}
                  statusReference={statusReference}
                  setStatusReference={setStatusReference}
                  statusText={statusText}
                  checkStatus={checkStatus}
                  setLanguage={chooseLanguage}
                  selectedLanguage={selectedLanguage}
                />
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function LiveApplicationForm({
  assistant,
  facts,
  reviewOpen,
  updateFact,
  openReview,
  submitApplication,
  applyLabel,
}: {
  assistant: AssistantResult | null;
  facts: Record<string, string | number | boolean>;
  reviewOpen: boolean;
  updateFact: (key: string, value: string) => void;
  openReview: () => void;
  submitApplication: () => void;
  applyLabel: string;
}) {
  const isApplying = facts.agreed_to_apply === true || String(facts.agreed_to_apply) === "true";

  if (!isApplying) {
    return (
      <aside className="rounded-[1.35rem] border border-white/95 bg-white/78 p-6 shadow-[0_22px_62px_rgba(36,86,142,.12)] backdrop-blur-[32px] flex flex-col items-center justify-center text-center min-h-[18rem] lg:sticky lg:top-6 lg:w-[24rem]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a2a6e]/5 text-[#0a2a6e] mb-4 shadow-inner">
          <FileCheck2 size={24} />
        </div>
        <h2 className="text-lg font-black text-slate-900">No Active Application</h2>
        <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 max-w-xs">
          Your application will appear here after you choose a scheme and start applying.
        </p>
      </aside>
    );
  }

  const item = assistant?.item;
  const baseFields: FormQuestion[] = [
    { key: "state", question: "State", type: "text" },
    { key: "district", question: "District", type: "text" },
    { key: "name", question: "Name", type: "text" },
    { key: "date_of_birth", question: "Date of Birth", type: "date" },
    { key: "gender", question: "Gender", type: "text" },
    { key: "address", question: "Address", type: "text" },
  ];
  const dynamicFields = item?.questions || [];
  const fields = [...baseFields, ...dynamicFields].filter((field, index, all) => all.findIndex((candidate) => candidate.key === field.key) === index);
  const hasWorkflow = Boolean(item);

  const allFieldsCompleted = fields.every((field) => {
    const value = facts[field.key];
    return value !== undefined && value !== "";
  });

  return (
    <aside className="rounded-[1.35rem] border border-white/95 bg-white/78 p-4 shadow-[0_22px_62px_rgba(36,86,142,.12)] backdrop-blur-[32px] lg:sticky lg:top-6 lg:w-[24rem]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0a2a6e] text-white">
          <FileCheck2 size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-sky-700">Live Application Form</p>
          <h2 className="mt-1 text-lg font-black leading-6 text-slate-950">{item?.name || "Waiting for service"}</h2>
          {item ? <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{item.department}</p> : null}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {fields.map((field) => {
          const value = facts[field.key];
          const filled = value !== undefined && value !== "";
          return (
            <label key={field.key} className="block rounded-2xl border border-white/90 bg-white/72 p-3">
              <span className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                {field.question}
                <span className={filled ? "text-[#138808]" : "text-slate-400"}>{filled ? "Verified" : "Pending"}</span>
              </span>
              {reviewOpen ? (
                <input value={String(value ?? "")} onChange={(event) => updateFact(field.key, event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-sky-300" />
              ) : (
                <p className="mt-2 min-h-6 text-sm font-semibold text-slate-800">{filled ? String(value) : "SAMANVAI will fill this during the conversation"}</p>
              )}
            </label>
          );
        })}
      </div>

      {item ? (
        <div className="mt-4 rounded-2xl bg-white/72 p-3 text-xs font-semibold leading-5 text-slate-600">
          <p><strong>Fees:</strong> {item.fees}</p>
          <p className="mt-1"><strong>Processing:</strong> {item.processingTime}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" disabled={!assistant?.canApply || !allFieldsCompleted} onClick={openReview} className="rounded-2xl border border-white/90 bg-white px-4 py-3 text-sm font-black text-[#08245d] disabled:cursor-not-allowed disabled:opacity-50">
          Review Application
        </button>
        <button type="button" disabled={!hasWorkflow || !assistant?.canApply || !reviewOpen || !allFieldsCompleted} onClick={submitApplication} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#138808] px-4 py-3 text-sm font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50">
          {applyLabel}
          <ChevronRight size={18} />
        </button>
      </div>
    </aside>
  );
}

function DashboardPanel({
  view,
  labels,
  applications,
  notifications,
  history,
  statusReference,
  setStatusReference,
  statusText,
  checkStatus,
  setLanguage,
  selectedLanguage,
}: {
  view: ViewKey;
  labels: Record<string, string>;
  applications: ApplicationRecord[];
  notifications: Array<{ id: string; title: string; body: string; at: string }>;
  history: Array<{ id: string; input: string; response: string; at: string }>;
  statusReference: string;
  setStatusReference: (value: string) => void;
  statusText: string;
  checkStatus: () => void;
  setLanguage: (language: LanguageCode) => void;
  selectedLanguage: LanguageCode;
}) {
  const titleMap: Record<ViewKey, string> = {
    home: labels.home,
    history: labels.history,
    applications: labels.applications,
    documents: labels.documents,
    notifications: labels.notifications,
    support: labels.support,
    settings: labels.settings,
    profile: labels.profile,
  };

  const documents = applications.flatMap((app) => app.documents.map((doc) => ({ ...doc, referenceId: app.referenceId, itemName: app.itemName })));

  return (
    <div className="relative mt-8 w-full max-w-5xl rounded-[1.35rem] border border-white/95 bg-white/70 p-5 text-left shadow-[0_22px_62px_rgba(36,86,142,.12)] backdrop-blur-[32px]">
      <h2 className="text-xl font-black text-[#061f55]">{titleMap[view]}</h2>
      {view === "applications" ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={statusReference} onChange={(event) => setStatusReference(event.target.value)} placeholder={labels.statusInput} className="h-12 flex-1 rounded-2xl border border-white/80 bg-white/80 px-4 text-sm font-semibold outline-none" />
            <button type="button" onClick={checkStatus} className="rounded-2xl bg-[#0a2a6e] px-5 py-3 text-sm font-black uppercase text-white">{labels.checkStatus}</button>
          </div>
          {statusText ? <pre className="whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700">{statusText}</pre> : null}
          {applications.length ? applications.map((app) => <RecordCard key={app.referenceId} title={app.itemName} lines={[app.referenceId, `SAMANVAI: ${app.internalStatus}`, `Government: ${app.governmentSyncedStatus}`, ...Object.entries(app.facts || {}).slice(0, 8).map(([key, value]) => `${formatFactLabel(key)}: ${String(value)}`)]} />) : <p className="text-sm font-semibold text-slate-600">{labels.noApplications}</p>}
        </div>
      ) : null}
      {view === "documents" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {documents.map((doc) => <RecordCard key={`${doc.referenceId}-${doc.name}`} title={doc.name} lines={[doc.itemName, doc.referenceId, doc.status, `Source: ${doc.source}`, `Manual Upload: ${doc.manualUpload}`]} />)}
          {!documents.length ? <p className="text-sm font-semibold text-slate-600">{labels.noApplications}</p> : null}
        </div>
      ) : null}
      {view === "notifications" ? <div className="mt-4 space-y-3">{notifications.map((item) => <RecordCard key={item.id} title={item.title} lines={[item.body, new Date(item.at).toLocaleString()]} />)}</div> : null}
      {view === "history" ? <div className="mt-4 space-y-3">{history.map((item) => <RecordCard key={item.id} title={item.input} lines={[item.response, new Date(item.at).toLocaleString()]} />)}</div> : null}
      {view === "support" ? <RecordCard title={labels.support} lines={["SAMANVAI uses the verified research-backed government knowledge base.", "Every application is reviewed before submission and tracked with a SAMANVAI reference ID.", labels.consent]} /> : null}
      {view === "settings" ? (
        <div className="mt-4 space-y-4">
          <RecordCard title={labels.settings} lines={["Government Portal language and SAMANVAI language are independent.", labels.consent]} />
          <div className="flex flex-wrap gap-2">
            {samanvaiLanguages.map((language) => (
              <button key={language.code} type="button" onClick={() => setLanguage(language.code)} className={`rounded-2xl border px-4 py-2 text-sm font-black ${selectedLanguage === language.code ? "border-sky-300 bg-white text-[#08245d]" : "border-white/80 bg-white/60 text-slate-600"}`}>
                {language.nativeName}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {view === "profile" ? <RecordCard title={labels.verifiedCitizen} lines={["User ID: citizen-001", "Aadhaar/PAN/Bank values are masked before storage.", labels.consent]} /> : null}
    </div>
  );
}

function RecordCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <article className="rounded-2xl border border-white/90 bg-white/72 p-4 shadow-[0_12px_30px_rgba(36,86,142,.08)]">
      <h3 className="font-black text-slate-900">{title}</h3>
      <div className="mt-2 space-y-1">
        {lines.map((line) => (
          <p key={line} className="whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-600">{line}</p>
        ))}
      </div>
    </article>
  );
}

function formatFactLabel(key: string) {
  return key.replace(/^__/, "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function TopIconButton({ label, icon: Icon, onClick }: { label: string; icon: typeof User; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/72 text-slate-700 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#08245d] hover:shadow-[0_12px_28px_rgba(18,65,110,.1)]">
      <Icon size={19} />
    </button>
  );
}
