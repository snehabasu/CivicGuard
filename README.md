# CivicGuard

CivicGuard is an AI-assisted scribe concept for social workers.

## Goal
Reduce documentation burden by turning visit conversations into structured, compliance-aware case notes while surfacing high-risk signals for follow-up.

## What this repo includes now
This is a **pre-build skeleton** with architecture, compliance boundaries, and demo flow placeholders.

- `docs/PRODUCT_BRIEF.md`: Product framing and scope
- `docs/ARCHITECTURE.md`: System design and service boundaries
- `docs/COMPLIANCE.md`: HIPAA-first constraints and guardrails
- `docs/DEMO_SCRIPT.md`: 15-second demo flow and expected output
- `apps/api`: Backend skeleton for ingest/transcribe/summarize/flag APIs
- `apps/web`: Frontend skeleton for demo UI
- `packages/shared`: Shared data contracts and constants

## Next implementation milestones
1. Implement transcription provider adapter (streaming + batch fallback).
2. Add note-generation prompt pipeline with schema validation.
3. Add keyword/risk rules engine and confidence scoring.
4. Implement secure storage and audit trail.
5. Build polished demo UI with real-time transcript + summary cards.

## Notes
Current code intentionally uses stubs and mock responses only.
