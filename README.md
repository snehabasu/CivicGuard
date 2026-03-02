# CivicGuard

CivicGuard is an AI-assisted scribe tool for social workers. It turns post-visit voice reflections into structured, compliance-aware case notes — covering narrative summaries, SOAP notes, and psychosocial assessments — while flagging high-risk indicators and enforcing documentation boundaries.

All AI output is a draft. The clinician reviews, edits, and approves before anything is submitted to Epic.

## Docs

- `docs/PRODUCT_BRIEF.md` — product framing, user research, and scope
- `docs/ARCHITECTURE.md` — system design and data flow
- `docs/COMPLIANCE.md` — HIPAA-first constraints and guardrails

## Setup

**Prerequisites:** Node.js 18+, an Anthropic API key, an OpenAI API key.

```
npm install
cp apps/web/.env.local.example apps/web/.env.local
```

Open `apps/web/.env.local` and fill in both keys:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

## Running locally

```
npm run dev
```

Opens at `http://localhost:3000`.

## How to test it

The app runs as a three-page flow: record → review → export.

**Step 1 — Record**

Open `http://localhost:3000`. Click **Start Recording** and allow microphone access when prompted. Speak a brief post-visit reflection as if you just finished a visit — describe the presenting concerns, any safety observations, what interventions you provided, and your follow-up plan. Then click **Stop Recording**.

The audio is transcribed by OpenAI Whisper before being sent to Claude, so the documentation will reflect what you actually said.

**Step 2 — Review**

After a few seconds, you are routed to `/review`. Check that:

- The **DRAFT** banner is visible at the top
- The narrative summary, SOAP note, and all six psychosocial assessment fields are populated based on your recording
- Fields with low transcript coverage show `confidence: insufficient_data`
- Any stress or risk keywords appear in the risk flags section
- The documentation boundaries section notes whether legal status was omitted

Edit any field directly in the textarea. When you are satisfied, enter your name in the approval field — this enables the **Approve** button.

**Step 3 — Export**

After approving, you are routed to `/export`. Each section (Narrative Summary, SOAP Note, Psychosocial Assessment) has a **Copy** button. Click it and paste into Epic or a text editor to verify the output.

Risk flags are shown separately with a note not to paste them directly into Epic.

## Testing specific behaviors

**Legal status leak detection** — Include a word like "probation" or "warrant" in your spoken reflection. The `/api/process` route will detect the leak server-side and return an error — the documentation will not be generated.

**Insufficient data handling** — Record something sparse like "Client seemed okay, nothing specific to report." The psychosocial fields should come back as `confidence: insufficient_data` with a placeholder value rather than hallucinated content.

**Mobile recording** — Open `http://localhost:3000` on an iOS or Android device (same local network, or use a tunnel like ngrok). Recording should work using the device microphone. iOS Safari uses `audio/mp4`; Android Chrome uses `audio/webm`.

## Repo structure

```
apps/web/        Next.js 14 app — UI and API routes
packages/shared/ Shared TypeScript types and constants
apps/api/        Legacy stub — not used
docs/            Product and technical documentation
```
