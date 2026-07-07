# SAMANVAI — Product Requirements (living doc)

## Original problem statement (condensed)
SAMANVAI is an AI Integration Layer inside an EXISTING Next.js Government Portal.
Vision: "From Need to Service". Preserve UI, routing, layout, colours, typography,
spacing. Only ONE new screen allowed: Profile Selection. Support ONLY 20 pre-defined
schemes. Four profiles (Lakshmi/Suresh/Ramana/Live Citizen) use ONE common engine —
only starting persona seed differs.

## Architecture
- Next.js 16 App Router at `/app/frontend`.
- Portal home: `/app/frontend/app/page.tsx`
- SAMANVAI: `/app/frontend/app/dashboard/page.tsx` → `components/samanvai/SamanvaiApp.tsx`
- Engine: `lib/samanvai/{engine,knowledge,llm,store}.ts`
- Backend: `app/api/samanvai/route.ts`
- Store: JSON DB `frontend/data/samanvai-db.json` — per-profile buckets in `profilesData`.

## Flow
Portal → SAMANVAI → Login → PIN (2026) → **Profile Selection** → Language → Dashboard.

## Profiles (all same engine, only seed differs)
- **Lakshmi** — scripted homemaker/widow (welfare, pension, ration card, scholarships)
- **Suresh** — scripted farmer (PM-KISAN, crop insurance, agriculture)
- **Ramana** — scripted CSC operator (facilitator flow)
- **Live Citizen** — natural conversation, limited to 20 supported schemes.

## Seven-phase workflow (all implemented)
1. Situation Detection / Direct Search (natural language → up to 3 supported schemes)
2. Scheme Brief + FAQ (overview, benefits, eligibility, docs, last date, apply, status)
3. Eligibility — one question at a time, remembers previous answers, voice+text share state
4. Prerequisites Checklist + `Apply Now` / `Cancel`
5. Fetch Automatically vs Manual Entry
   - Fetch: auto-fills from persona seeds + demo integration defaults, ticks each item
   - Manual: collects fields one at a time (text/voice/upload/OCR-ready)
6. Review + `Confirm & Submit` → generates `SMV-{SCHEME}-YYYYMMDD-XXXXXX` reference ID
7. Tracking — `Track Application` returns latest status + full history

## Navigation, per-profile data, and continuity
- **Per-profile data isolation** via `db.profilesData[profileId] = {facts, applications, history}`.
  Swapping profiles saves the outgoing bucket, loads the incoming one. Verified end-to-end.
- **Back to Government Portal** button in sidebar (`data-testid=back-to-portal-btn`).
  Confirms if application in progress. Navigates to `/`.
- **Switch Profile** button in sidebar (`data-testid=switch-profile-btn`) shows active
  persona badge. Confirms if application in progress. Returns to Profile Selection screen.
- **Application continuity**: server-side facts and history persist across sessions
  (JSON DB); reopening SAMANVAI resumes prior state automatically.
- **Voice/text state parity**: both share `assistant.facts`. Voice input goes through the
  same `sendAssistantMessage` pipeline. Frontend also intercepts spoken navigation
  commands: "switch to lakshmi/suresh/ramana/live", "back to government portal".
- **Out-of-scope handling**: unsupported requests reply "This demo currently supports
  only the selected government schemes." with category chips — never hallucinates.

## Verified this session
- Full Suresh journey (situation → PM-KISAN → eligibility → checklist → Apply Now →
  Fetch Automatically → 10 auto-filled fields → Confirm & Submit → `SMV-PMKISAN-…`
  → Track Application) via curl + testing subagent.
- Per-profile isolation: Suresh submits app → switch to Lakshmi (0 apps) → switch
  back to Suresh (app still there).
- Live Citizen natural-language patterns: "my husband passed away", "my crops failed",
  "I need treatment", "I need a scholarship", "I need a house", "I need passport help"
  (out-of-scope) all handled correctly.
- Testing subagent iteration 1: 15/15 backend pytest passing, 100% core flow success.

## Backlog / Next
- P2: Deterministic scripted transcripts per persona for demo playback.
- P2: True OCR endpoint (`type:"ocr"`) — currently document upload works via `type:"upload"`.
- P2: Localise Profile Selection copy into te/hi/kn.
- P2: Auto-progress application status (Submitted → Under Verification → Approved) on
  each Track call for demo storytelling.
- P3: File-lock or in-memory queue for concurrent writes to `samanvai-db.json`.
