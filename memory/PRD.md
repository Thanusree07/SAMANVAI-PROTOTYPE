# SAMANVAI — Product Requirements (living doc)

## Original problem statement (condensed)
SAMANVAI is an AI Integration Layer inside an EXISTING Next.js Government Portal.
Vision: "From Need to Service". Preserve UI, routing, layout, colours, typography.
Only ONE new screen allowed: Profile Selection. Support ONLY 20 pre-defined schemes.
Four profiles (Lakshmi/Suresh/Ramana/Live Citizen) use ONE common engine —
only starting persona seed differs. Persona seeds must reduce (not prevent) natural
conversation. All profiles must complete the full end-to-end workflow.

## Seven-phase workflow (verified end-to-end)
1. Intent Detection (scheme name / life situation / natural request)
2. Scheme Recommendation → Scheme Brief + FAQ chips
3. Eligibility — one question at a time, uses persona seeds to skip pre-answered questions
4. Prerequisites Checklist + `Apply Now` / `Cancel`
5. Fetch Automatically vs Manual Entry (auto-fills from persona seeds)
6. Review + `Confirm & Submit` → generates `SMV-{SCHEME}-YYYYMMDD-XXXXXX`
7. Tracking + **Need → Service recommendations** (proactively suggest related schemes)

## Critical bug fixes this session
1. **Persona seed wipe on eligibility start** — route.ts had two blocks that
   whitelisted only 6 keys (state, district, name, date_of_birth, gender, address)
   and wiped everything else on scheme change / Check Eligibility. This threw
   away Lakshmi's `family_income`, `has_ration_card`, `covered_other_health`,
   `is_ts_resident`, etc. **Fixed** — replaced with a blacklist of 11 workflow-
   transient keys (checking_eligibility, agreed_to_apply, application_mode, etc.).
2. **Phase 1 hardcoded eligibility response** — clicking "Check Eligibility"
   returned a hardcoded "State" question, bypassing the engine and losing all
   persona-seeded facts. **Fixed** — now mutates `currentFacts.checking_eligibility = true`
   and returns null so the engine runs with the full fact set.
3. **Aarogyasri state rule** — hardcoded to reject Telangana even though Aarogyasri
   is a Telangana Health Department scheme. **Fixed** — now accepts both AP and TS.
4. **Incomplete cleanSchemes list** — only 11 of 20 schemes recognized. **Fixed** —
   all 20 schemes + common aliases now listed.
5. **schemeToIdMap incomplete** — same issue. **Fixed** — all 20 schemes mapped.
6. **Persona seeds too shallow** — Lakshmi/Suresh/Ramana had 10-15 facts each,
   missing dozens of eligibility keys. **Fixed** — expanded each persona to 40-50
   facts covering identity, eligibility, and application-question keys.
7. **Need → Service recommendations** — after submission, response now includes
   related supported schemes based on the current scheme's category, both in
   text and as suggestion chips.
8. **Profile screen labels** — removed "Guided Demo", "Scripted"/"Live" badges,
   and "Pick a persona to demonstrate..." helper copy per user request.

## Verified end-to-end journeys (via curl + UI + testing subagent)
- **Lakshmi**: Aarogyasri ✅, PMAY ✅, Income Certificate ✅, Sukanya (asks legit q), Ration Card (asks legit q)
- **Suresh**: PM-KISAN ✅, Rythu Bharosa ✅, PMFBY ✅, Ayushman Bharat ✅
- **Ramana**: Caste Certificate ✅, PMAY (correctly Not Eligible — owns pucca house), Income Certificate (asks legit q)
- **Live Citizen**: "I need a house" → housing schemes ✅; "I need passport help" → polite out-of-scope ✅

## Rules honored
- Existing Government Portal UI unchanged.
- Only ONE new screen (Profile Selection) — matches portal theme exactly.
- All 4 profiles use the SAME engine; only `profileFacts` seed differs.
- Voice/Text share `db.profileFacts` state.
- Per-profile data isolation via `db.profilesData` buckets.
- Back to Government Portal + Switch Profile buttons in sidebar.
- Out-of-scope replies politely without hallucinating schemes.

## Backlog / Next
- P2: OCR endpoint (`type:"ocr"`) with field extraction (upload/manual already work).
- P2: Localise Profile Selection copy into te/hi/kn.
- P2: Fix React hydration warning (error #418) from step-init reading sessionStorage.
- P3: Auto-progress status (Submitted → Under Verification → Approved).
