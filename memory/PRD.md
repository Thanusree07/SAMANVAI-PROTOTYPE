# SAMANVAI — Product Requirements (living doc)

## Original problem statement
SAMANVAI is an AI Integration Layer on top of an EXISTING Next.js Government Portal.
Vision: "From Need to Service". Citizens describe their situation; SAMANVAI recommends
the right scheme, checks eligibility, guides through application. UI, routing, layout,
colours, typography, spacing are PRESERVED. Only ONE new screen allowed: Profile
Selection.

## Architecture
- Next.js 16 App Router at `/app/frontend`.
- Portal home: `/app/frontend/app/page.tsx`
- SAMANVAI dashboard: `/app/frontend/app/dashboard/page.tsx` → `components/samanvai/SamanvaiApp.tsx`
- Engine: `lib/samanvai/{engine,knowledge,llm,store}.ts`
- Backend: `app/api/samanvai/route.ts`
- Store: JSON DB at `frontend/data/samanvai-db.json`

## Flow
Portal → SAMANVAI → Login → PIN (2026) → **Profile Selection** → Language → Dashboard.

## Profiles
- **Lakshmi** — Homemaker (Widow), scripted seed (welfare/pension)
- **Suresh** — Farmer, scripted seed (PM-KISAN / farm)
- **Ramana** — CSC Operator, scripted seed
- **Live Citizen** — natural conversation, no seed, limited to 20 supported schemes

All four profiles use the SAME engine — only `profileFacts` seed differs.
Persona seeds preserved across assistant `reset`.

## Phases (all implemented)
1. **Situation Detection / Direct Search** — natural language ("my husband passed away",
   "my crops failed", "I need treatment", "I need a scholarship", "I need a house", etc.)
   maps to supported schemes; max 3 recommendations; no forcing.
2. **Scheme Brief + FAQ** — overview, benefits, amount, eligibility, documents, last date,
   apply, status.
3. **Eligibility** — one question at a time, remembers previous answers, voice+text share
   the same state, final result Eligible/Not Eligible.
4. **Prerequisites Checklist** — after eligibility passes, shows document checklist and
   `Apply Now` / `Cancel` buttons.
5. **Application Preparation** — on `Apply Now` asks
   `Fetch Automatically` vs `Manual Entry`.
   - **Fetch Automatically**: auto-fills all application questions from persona seeds +
     demo integration defaults; ticks completed items; missing items marked pending;
     jumps directly to Review.
   - **Manual Entry**: collects fields one at a time via text/voice with validation.
6. **Review & Submission** — user clicks `Confirm & Submit` → generates
   `SMV-{SCHEME}-YYYYMMDD-XXXXXX` reference ID; status flow Submitted → Under
   Verification → Approved seeded.
7. **Tracking** — "Track my application" or "Check Status" returns latest status +
   full history.

## Out-of-scope handling
Unsupported requests return: "This demo currently supports only the selected
government schemes." plus supported category chips. Never invents schemes.

## What was implemented this session
- Profile Selection screen (matches existing design language exactly).
- Persona seed handler `type:"profile"` in `/api/samanvai` seeds full identity + eligibility
  + application-question fields for Lakshmi/Suresh/Ramana.
- `type:"reset"` preserves persona seed keys.
- Phase 4 checklist: engine's eligible-passed response overridden in route.ts to include
  Prerequisites Checklist with document names + `Apply Now`/`Cancel` chips.
- Phase 5 gates: `Apply Now` → asks Fetch/Manual; `Fetch Automatically` auto-fills all
  application questions; `Manual Entry` continues one-question flow.
- Phase 6: `Confirm & Submit` intercept → creates application record with reference ID,
  resets workflow flags so citizen can start a new application.
- Phase 7: `Track Application` intercept → returns latest status + history.
- Life-situation regex patterns expanded (widow, crop failure, treatment, scholarship,
  house, etc.).
- Live Citizen out-of-scope message refined per PRD.
- data-testids added on all 4 profile buttons.

## Verified end-to-end (Suresh)
`Farmer` → `PM-KISAN` → `Check Eligibility` → `Andhra Pradesh` →
`✅ Eligible` + Prerequisites Checklist → `Apply Now` → `Fetch Automatically` →
Review with 10 auto-filled fields → `Confirm & Submit` → Reference
`SMV-PMKISAN-YYYYMMDD-XXXXXX` → `Track Application` → status history.

## Backlog / Next
- P2: Deterministic scripted transcripts (exact dialog) per persona for demos.
- P2: OCR endpoint for uploaded documents (`type:"ocr"`) with field extraction.
- P2: Localise Profile Selection copy into te/hi/kn.
- P2: Small "Demo Mode" badge on assistant header when scripted persona active.
