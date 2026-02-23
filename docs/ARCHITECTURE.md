# Architecture

## High-Level Components

1. **Capture Layer**
   - Browser-based post-visit voice recording (`MediaRecorder` API)
   - Cross-platform MIME detection: `audio/webm;codecs=opus` (Android Chrome), `audio/mp4` (iOS Safari 14.3+)
   - Audio blob upload to `/api/transcribe`
   - _Out of scope for MVP: consent metadata, live session recording_

2. **AI Processing Layer**
   - Mock speech-to-text in `/api/transcribe` (production swap-in: Whisper / Amazon Transcribe Medical)
   - Single `claude-sonnet-4-6` call in `/api/process` that produces all output sections in one structured JSON response:
     - Narrative summary (Epic narrative format)
     - SOAP note (with therapeutic intervention descriptions)
     - Psychosocial assessment (6 sections with confidence markers)
     - High-stress / high-risk flags (keyword + severity + context)
     - Documentation boundary guidance (legal status omission, insurance phrasing)
   - Post-response validation in `src/lib/processResult.ts`: required field checks, confidence enum validation, legal status leak scan

3. **Trust & Compliance Layer**
   - All AI output is typed `isDraft: true` — structurally cannot be treated as final without explicit clinician conversion to `ApprovedCaseNote`
   - Legal status leak detection: output is scanned server-side against `LEGAL_STATUS_SIGNALS` before reaching the client; fails closed (500) if a leak is detected
   - Clinician approval gate: approve button is disabled until the clinician enters their name; `ApprovedCaseNote` records `approvedBy` and `approvedAtIso`
   - PHI kept off URLs: inter-page state flows through `sessionStorage` (tab-scoped, cleared on tab close)
   - `ANTHROPIC_API_KEY` is server-side only (no `NEXT_PUBLIC_` prefix; never reaches the browser bundle)
   - _Future: PHI encryption at rest, immutable audit logs, tenant isolation, role-based access control_

4. **Experience Layer**
   - Three-page clinician workflow:
     1. `/` — Record post-visit reflection, submit for processing
     2. `/review` — Review and edit all AI-drafted sections; confidence markers shown per psychosocial field; approve gated on clinician name entry
     3. `/export` — Copy-to-clipboard per section (Narrative, SOAP, Psychosocial Assessment); risk flags shown separately with guidance not to paste directly into Epic
   - Insurance phrasing suggestions and overdocumentation warnings surfaced at review and export

## Actual Service Structure (MVP)

The MVP is a single Next.js 14 (App Router) application — not separate microservices.

```
apps/web/
├── src/app/
│   ├── page.tsx                  # Record + submit
│   ├── review/page.tsx           # Edit + approve
│   ├── export/page.tsx           # Copy to Epic
│   └── api/
│       ├── transcribe/route.ts   # POST: audio → transcript (mock)
│       └── process/route.ts      # POST: transcript → FullCaseNote (Claude)
├── src/components/
│   ├── VoiceRecorder.tsx         # Cross-platform MediaRecorder
│   ├── CaseNoteReview.tsx        # Editable draft sections + approve
│   └── EpicExport.tsx            # Section-level copy-to-clipboard
└── src/lib/
    ├── claude.ts                 # Anthropic SDK wrapper + system prompt
    └── processResult.ts          # Output validation + legal status leak detection
```

Shared types live in `packages/shared/src/` and are consumed by the web app via a TypeScript path alias.

## Data Flow

1. Clinician speaks into the browser — `MediaRecorder` captures audio and uploads it to `POST /api/transcribe`
2. `/api/transcribe` returns a transcript (mocked in MVP; production swap-in is Whisper or Amazon Transcribe Medical)
3. The transcript is sent to `POST /api/process`, which makes a single `claude-sonnet-4-6` call and returns all output sections as structured JSON
4. `validateFullCaseNote()` runs server-side: checks required fields, validates confidence enums, and scans all text for legal status leaks — fails closed if any are found
5. The validated `FullCaseNote` (typed `isDraft: true`) is stored in `sessionStorage` and the clinician is routed to `/review`
6. The clinician reviews and edits each section, then enters their name to enable approval
7. On approval, an `ApprovedCaseNote` (typed `isDraft: false`) is written to `sessionStorage` and the clinician is routed to `/export`
8. The clinician copies each section individually into Epic

## Future Service Boundaries

When the product outgrows a single Next.js app, natural split points are:

- `ingest-service` — audio intake, format validation, consent metadata
- `transcription-service` — STT provider abstraction (Whisper, Transcribe Medical)
- `scribe-service` — Claude prompt pipeline, structured output, validation
- `risk-service` — keyword + model-assisted signal scoring, alerting
- `export-service` — Epic API integration, filing shape transformation

## NFR Targets

- Draft generation latency: < 10s for typical post-visit reflections (current: ~5–8s via claude-sonnet-4-6)
- Legal status leak prevention: enforced server-side before any output reaches the client
- Full auditability of generated and approved artifacts (future: immutable audit log)
- Configurable retention and encryption controls (future)
- Mobile-compatible voice capture: iOS Safari 14.3+ and Android Chrome supported
