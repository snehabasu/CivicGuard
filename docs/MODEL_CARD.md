# CivicGuard — Model Card

## Model Overview

CivicGuard uses two AI models in sequence to convert post-visit voice reflections into structured clinical case notes for social workers.

| Component | Model | Type | Provider |
|-----------|-------|------|----------|
| Speech-to-Text | Deepgram Nova-2-Medical | Automatic speech recognition (ASR) | Deepgram |
| Documentation Generation | Claude Sonnet 4.6 | Large language model (LLM) | Anthropic |

**Deepgram Nova-2-Medical** is a medical-domain ASR model that transcribes clinician audio into text. It is optimized for clinical speech, handling medical abbreviations and terminology.

**Claude Sonnet 4.6** is a general-purpose LLM used via prompt engineering (no fine-tuning) to transform masked transcripts into structured JSON containing seven documentation sections: narrative summary, SOAP note, psychosocial assessment, stress flags, documentation boundaries, ICD-10 codes, and next-session follow-up questions.

## Intended Use

CivicGuard is designed for **licensed social workers** performing post-visit documentation. The system's role is assistive — it drafts clinical notes from spoken reflections so clinicians spend less time on paperwork.

- **Deepgram** transcribes the clinician's spoken reflection into text after a client visit.
- **Claude** takes the masked transcript and generates a structured draft case note covering seven clinical sections.

All AI output is labeled as a **DRAFT** and requires clinician review, editing, and explicit approval before use. The system is not intended to replace clinical judgment or produce final documentation autonomously.

## Data

### Input Data (at inference)

- **Audio input**: Browser-captured audio recordings of post-visit clinician reflections (MP4, WebM, WAV, MP3). These are **not** recordings of client sessions — they are the clinician's own spoken notes after the visit.
- **Text input to Claude**: The transcript produced by Deepgram, after server-side PII masking. Masked categories include SSNs, phone numbers, email addresses, dates, street addresses, and legal-status terms (immigration status, criminal history references).

### Training Data

Neither model was fine-tuned for this application. Deepgram Nova-2-Medical was pre-trained by Deepgram on medical speech corpora. Claude Sonnet 4.6 was pre-trained by Anthropic on a broad text corpus. CivicGuard relies on prompt engineering (an 83-line system prompt) to shape Claude's output into the required clinical format and enforce documentation rules.

### Data Limitations

- Audio quality varies by device and environment (background noise, microphone quality).
- The system has only been tested with English-language input.
- PII masking uses regex patterns, which may miss non-standard formats or novel sensitive terms.

## Evaluation

### Metrics Considered

Given that CivicGuard produces clinical documentation drafts, we focus on the following evaluation dimensions:

| Metric | Why It Matters |
|--------|----------------|
| **Transcript accuracy** (Word Error Rate) | Transcription errors propagate to every downstream section. Medical terminology accuracy is critical. |
| **Structured output validity** | Claude must return valid JSON matching the required schema every time. Parse failures block the entire workflow. |
| **Clinical fidelity** | Generated notes must reflect only what was said in the transcript — no hallucinated details. Fields with insufficient evidence must report `insufficient_data`. |
| **PII / legal-status leak rate** | Sensitive content must never reach the client. The system uses both pre-processing masking and post-processing leak detection. |
| **Clinician edit distance** | How much a clinician changes the draft before approval — lower edits indicate higher draft quality. |

### Current State

We have not yet conducted a formal quantitative evaluation with a labeled dataset. In qualitative testing across multiple recording scenarios, we observed that:

- Claude consistently returns valid JSON matching the schema (validated server-side before delivery).
- The `insufficient_data` confidence marker fires correctly on sparse transcripts.
- Legal-status leak detection catches terms in Claude's output and blocks delivery.
- Narrative summaries and SOAP notes are coherent and clinically structured.

A rigorous evaluation would involve partnering with practicing social workers to score draft notes on fidelity, completeness, and clinical appropriateness using a rubric, then measuring inter-rater agreement.

## Performance & Limitations

### Where it performs well

- **Structured output reliability**: Claude reliably produces valid JSON conforming to the schema, enabling a predictable downstream workflow.
- **Clinical speech transcription**: Deepgram Nova-2-Medical handles medical terminology and abbreviations better than general-purpose ASR models.
- **Confidence calibration**: Fields with weak transcript evidence are appropriately flagged as `insufficient_data` rather than hallucinated.
- **Safety controls**: Multi-layer PII masking and legal-status leak detection work as designed in testing.

### Known limitations and failure modes

- **Hallucination risk**: Despite prompt instructions, Claude may occasionally infer clinical details not explicitly stated in the transcript, especially for the psychosocial assessment fields. The confidence markers mitigate but do not eliminate this.
- **Transcript errors compound**: If Deepgram misrecognizes a medical term, the error propagates into all seven documentation sections with no self-correction mechanism.
- **Regex-based PII masking**: Non-standard phone formats, international addresses, or novel sensitive terms may evade pattern-based redaction.
- **English only**: The system has not been tested with non-English speakers or heavy accents.
- **Audio quality sensitivity**: Background noise, low-quality microphones, or very short recordings degrade transcription accuracy.
- **Single-turn generation**: Claude generates all seven sections in one API call. A failure or timeout requires re-processing the entire transcript.

## Improvement Path

### Implemented improvement

We added **server-side legal-status leak detection** as a post-processing validation layer. After Claude generates the draft, the system scans all text output against a list of 14 legal-status signal terms and 25+ sensitive transcript phrases. If any term is detected in the output, the API returns a 500 error and the draft never reaches the client. This defense-in-depth approach ensures that even if prompt instructions fail to prevent legal-status content, the output is blocked before delivery.

### Next priorities

1. **Clinician feedback loop**: Collect edit-distance data from clinician reviews to identify which sections need the most correction, then refine the system prompt for those sections.
2. **Retrieval-augmented prompting**: Provide Claude with anonymized examples of approved case notes as few-shot references to improve output quality and consistency.
3. **Streaming generation**: Switch from single-call to streaming output so clinicians see sections populate in real time, reducing perceived latency.
4. **Multilingual support**: Extend transcription and documentation to Spanish, given the demographics served by many social work agencies.
