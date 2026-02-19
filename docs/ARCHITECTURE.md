# Architecture (Skeleton)

## High-Level Components
1. Capture Layer
- Upload/stream visit audio
- Consent metadata capture

2. AI Processing Layer
- Speech-to-text adapter
- Clinical relevance filter
- SOAP note generator
- Filing field extractor
- Stress signal detector

3. Trust & Compliance Layer
- PHI redaction controls
- Audit events and immutable logs
- Access controls and role boundaries

4. Experience Layer
- Demo UI showing transcript, summary, and flags
- Reviewer edit/approve workflow (future)

## Suggested Service Boundaries
- `ingest-service`: audio intake, metadata validation
- `transcription-service`: provider abstraction
- `scribe-service`: summary/SOAP generation
- `risk-service`: keyword + model-assisted signal scoring
- `export-service`: filing shape transformation

## Data Flow (Demo)
1. Upload simulated clip
2. Return transcript (mock)
3. Generate structured summary payload
4. Render summary + flags instantly

## NFR Targets (future)
- Low-latency draft generation (< 10s for short clips)
- Full auditability of generated artifacts
- Configurable retention and encryption controls
