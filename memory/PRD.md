# SAMANVAI — Product Requirements (living doc)

## Original problem statement (condensed)
SAMANVAI is an AI Integration Layer inside an EXISTING Next.js Government Portal.
Vision "From Need to Service". Preserve UI, routing, layout, colours, typography.
Only ONE new screen allowed: Profile Selection. Support ONLY 20 pre-defined schemes.
Four profiles (Lakshmi/Suresh/Ramana/Live Citizen) use ONE common engine —
only starting persona seed differs.

## Architecture
- Next.js 16 App Router at `/app/frontend`.
- Portal home: `app/page.tsx`.
- SAMANVAI: `app/dashboard/page.tsx` → `components/samanvai/SamanvaiApp.tsx`.
- Engine: `lib/samanvai/{engine,knowledge,llm,store}.ts`.
- Backend: `app/api/samanvai/route.ts`.
- Store: JSON DB `frontend/data/samanvai-db.json` — per-profile buckets in `profilesData`.

## Flow
Portal → SAMANVAI → Login → PIN (2026) → **Profile Selection** → Language → Dashboard.

## Seven-phase workflow (all implemented & verified)
1. Situation Detection / Direct Search — natural language → up to 3 supported schemes.
2. Scheme Brief + FAQ — overview, benefits, eligibility, docs, last date, apply, status.
3. Eligibility — one question at a time, remembers previous answers, voice+text share state.
4. Prerequisites Checklist + `Apply Now` / `Cancel`.
5. Fetch Automatically vs Manual Entry (auto-fills from persona seeds + demo defaults).
6. Review + `Confirm & Submit` → generates `SMV-{SCHEME}-YYYYMMDD-XXXXXX` reference ID.
7. Tracking — `Track Application` returns latest status + full status history.

## Navigation, per-profile data, and continuity
- **Per-profile data isolation** via `db.profilesData[profileId] = {facts, applications, history}`.
- **Back to Government Portal** button (`data-testid=back-to-portal-btn`) with in-progress confirmation.
- **Switch Profile** button (`data-testid=switch-profile-btn`) shows active persona badge; returns to Profile Selection.
- **Application continuity**: server-side facts persist across sessions.
- **Voice/text state parity**: both share `assistant.facts` via API. Client intercepts spoken
  "switch to X" / "back to portal" commands.
- **Out-of-scope**: unsupported requests reply "This demo currently supports only the
  selected government schemes." with category chips — no hallucination.

## Bug fixes this session
- **CRITICAL FIX** — `type:"reset"` handler was using a whitelist of preserved keys
  that missed critical persona seeds (`paid_income_tax`, `is_govt_employee`,
  `aadhaar_number`, `mobile_number`, etc.). Since `openAssistant()` calls `reset` every
  time a citizen opens Text/Voice Assistant, persona seed data was being wiped, forcing
  the engine to re-ask Y/N eligibility questions that should have been pre-answered.
  Changed to a blacklist of exactly 11 transient workflow-state keys
  (`checking_eligibility`, `agreed_to_apply`, `eligibility_confirmed`,
  `application_mode`, `application_mode_prompted`, `application_ready`,
  `active_scheme_id`, `selectedScheme`, `selectedSituation`, `phase1_completed`,
  `attempted_eligibility`). Everything else preserved.
- Profile-switch handler now re-applies persona seeds when re-entering a profile
  whose bucket exists but has no real data (only metadata) — fixes Live-persona
  metadata gap.

## Verified E2E this session
- Suresh full journey: Portal → PIN → Profile Suresh → English → Text Assistant →
  "I am a farmer" → 3 scheme chips → PM-KISAN → 7 FAQ chips → Check Eligibility →
  Andhra Pradesh → ✅ Eligible + 3-doc checklist → Apply Now → Fetch Automatically →
  10 auto-filled fields → Confirm & Submit → `SMV-PMKISAN-YYYYMMDD-XXXXXX` →
  Track Application → status history. All in the existing UI, no re-asked questions.
- Lakshmi: "my husband passed away" → YSR Cheyutha + PM Mudra Yojana chips.
- Live Citizen: "I need passport help" → polite out-of-scope; "I need a house" →
  Indiramma Illu + PMAY chips.
- Profile switching: Suresh submit → Switch to Lakshmi (0 apps) → back to Suresh
  (PM-KISAN app still there).
- Back to Portal button navigates to `/` with in-progress confirmation.
- Testing subagent iteration 2: **17/17 backend pytest passing**, 100% frontend
  core-flow success, 0 console errors, `retest_needed: false`.

## Backlog / Next
- P2: Deterministic scripted transcripts (word-for-word) per persona for demo playback.
- P2: True OCR endpoint (`type:"ocr"`) — upload already works via `type:"upload"`.
- P2: Localise Profile Selection copy into te/hi/kn.
- P2: Auto-progress application status (Submitted → Under Verification → Approved).
- P3: Refactor SamanvaiApp.tsx (1246 lines) into per-view modules.
- P3: Add data-testid attributes to chat input, chips, and sidebar items.
