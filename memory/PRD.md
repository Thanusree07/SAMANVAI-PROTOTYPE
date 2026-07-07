# SAMANVAI — Product Requirements (living doc)

## Original problem statement (summary)
SAMANVAI is an AI Integration Layer on top of an EXISTING Next.js Government Portal.
Vision: "From Need to Service". Citizens describe their situation; SAMANVAI recommends
the right scheme, checks eligibility, guides through application. UI, routing, layout,
colours, typography, spacing must be PRESERVED. Only ONE new screen allowed:
Profile Selection.

## Architecture
- Next.js 16 App Router at `/app/frontend`.
- Portal home: `/app/frontend/app/page.tsx`
- SAMANVAI dashboard: `/app/frontend/app/dashboard/page.tsx` → `components/samanvai/SamanvaiApp.tsx`
- Engine: `lib/samanvai/{engine,knowledge,llm,store}.ts`
- Backend: Next route `app/api/samanvai/route.ts` (Gemini optional via GEMINI_API_KEY)
- Store: JSON DB at `frontend/data/samanvai-db.json`

## Flow (updated)
Portal → Start SAMANVAI → Login → PIN (2026) → **Profile Selection (NEW)** →
Language → Existing Dashboard/Assistant.

## Profiles (implemented)
- Lakshmi — Homemaker (Widow), scripted seed (welfare/pension context)
- Suresh — Farmer, scripted seed (PM-KISAN context, land, crops)
- Ramana — CSC Operator, scripted seed
- Live Citizen — natural conversation, no pre-seed (limited to 20 schemes)

All four profiles use the SAME engine — only starting `profileFacts` differ.
Persona seeds are preserved across assistant `reset` so scripted context isn't wiped.

## What was implemented this session
- Added `FlowStep = "profile"` between PIN and Language in `SamanvaiApp.tsx`.
- New Profile Selection screen (only new screen), matching existing design language:
  same card style, colours, shadows, chevron, "Secure Government Access" header.
- Backend: `POST /api/samanvai` with `type:"profile"` seeds `profileFacts` per persona.
- `type:"reset"` now preserves persona seed keys (`__persona*`, identity, key eligibility facts).
- data-testids: `profile-lakshmi-btn`, `profile-suresh-btn`, `profile-ramana-btn`, `profile-live-btn`.

## Backlog / Next
- P1: Deterministic scripted conversation transcripts for Lakshmi/Suresh/Ramana.
- P1: CSC Operator-mode UI hint for Ramana (still uses same engine).
- P2: Persist selected persona label in dashboard header.
- P2: Language-localise the Profile Selection copy.
