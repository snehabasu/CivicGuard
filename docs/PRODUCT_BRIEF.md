# Product Brief: CivicGuard

## Problem
Social workers spend **3–4 hours of every 8-hour workday** on documentation, reducing face-to-face support time, increasing burnout risk, and sometimes delaying care. Key pain points surfaced in user research include:

- **Volume & recall burden** — remembering detailed conversations and accurately describing therapeutic interventions after the fact.
- **Insurance-driven constraints** — notes must be strategically written to satisfy insurance requirements without overdocumentation, which can create legal risk.
- **Compliance complexity** — licensure level determines whether a cosigner is needed; legal status must never appear in notes; narrative format is required.
- **Incomplete capture** — body language and tone are clinically significant but not captured by audio alone.

## Product Thesis
CivicGuard acts as an **assistive memory and drafting tool** — not a replacement for clinical judgment. It captures post-visit voice reflections, extracts clinically relevant details, and drafts compliance-aware narrative outputs that the clinician reviews and approves before submission.

## User Research Summary

### Interview: Inpatient Psychiatry Social Worker (KAT)

**Setting & Caseload**
Inpatient psychiatry unit serving children up to age 17. Handles psychosocial assessments, therapy sessions, and crisis intervention across ADHD, DMDD, GAD, psychosis, and schizophrenia. Coordinates referrals to outpatient care, foster homes, and group homes.

**Documentation Workflow**
- Spends **3–4 hours per 8-hour shift** on documentation.
- Uses **Epic** with narrative format; occasional SmartText for discharge notes.
- Prefers to document **immediately after** the visit — wants to be fully present during sessions rather than typing.
- Licensure determines review requirements: 4-letter licensure needs no cosigner; otherwise supervisor review is required.

**Recording & Privacy**
- Full session recording is **too sensitive** for the hospital setting, given strong mental health privacy protections.
- **Post-visit voice reflection** is a more acceptable alternative.
- Only **50–70%** of a typical conversation is clinically relevant; in severe psychiatric cases, even less may be usable.
- Body language and tone are clinically important but cannot be captured by audio alone.

**Customer's needs**
- A **high-accuracy memory aid** that helps with recall after visits.
- Must be **HIPAA-compliant** and always **human-reviewed** before submission.
- Must function as an assistive tool — **cannot replace clinical judgment**.
- Incorrect information is **unacceptable**; accuracy is the top priority.

**Adoption Path**
Approval required from Director of Behavioral Health → hospital leadership → medical records department. Willing to pilot under appropriate compliance conditions. Notes that AI use in mental health is currently controversial.

## Primary Users
- **Inpatient & outpatient social workers** (including psychiatric settings)
- County/state social workers & case managers
- Case supervisors (review & cosign workflow)
- Agency compliance reviewers

## Core Jobs-To-Be-Done
1. **Capture post-visit voice reflection** (preferred over full-session recording for sensitive settings)
2. **Generate concise narrative case visit summary** (matching Epic narrative format)
3. **Draft psychosocial assessment sections** — crisis reason, substance use, longevity of issues, aggression history, support systems, past interventions
4. **Draft SOAP note sections** with accurate descriptions of therapeutic interventions
5. **Flag high-stress / high-risk indicators** for follow-up
6. **Respect documentation boundaries** — omit legal status, avoid overdocumentation, surface insurance-relevant phrasing guidance
7. **Produce filing-ready structured output** ready for Epic entry

## Input Modes

### Post-visit voice memo — *Primary (MVP)*
The clinician records a brief spoken reflection immediately after the visit, capturing key observations while they are still fresh. This is the preferred input mode for sensitive settings like mental health, where full session recording is not appropriate.

### Simulated audio clip — *MVP demo only*
A pre-recorded demo clip used for showcase and testing purposes during the MVP phase.

### Live session recording — *Out of scope*
Full conversation capture with patient consent. User research indicates this is too sensitive for mental health settings due to strong privacy protections and the controversial nature of AI in clinical encounters. May be revisited for other care contexts in the future.

## MVP Demo Scope
- Input: one simulated audio clip **+ one post-visit voice reflection sample**
- Processing: mock transcription → relevance filtering → narrative note generation
- Output:
  - Narrative Case Visit Summary (Epic-compatible format)
  - SOAP note draft
  - Psychosocial assessment section draft
  - High-stress keyword flags
  - **Human review / edit / approve step before finalization**

## Trust & Accuracy Requirements
- **High accuracy is the top priority** — incorrect clinical information is unacceptable
- Confidence markers on uncertain fields; hallucination reduction via source-grounded prompts
- Explicit "draft" labeling — output is never treated as final until clinician approves
- Must be fully **HIPAA-compliant**; PHI encryption, minimum-necessary processing, audit logging
- Must **never document legal status** of patients
- Insurance-aware phrasing guidance without overdocumentation

## Adoption & Rollout Considerations
- Hospital / agency approval chain: Director of Behavioral Health → leadership → medical records
- AI use in mental health is **currently controversial** — messaging must emphasize assistive role, human oversight, and compliance
- Pilot with willing clinicians under strict compliance conditions before broader rollout
- Licensure-aware workflows: 4-letter licensure → no cosigner; otherwise supervisor review required

## Potential Improvements to build in 
- Production-grade EHR integrations (Epic API)
- Multi-tenant billing logic
- Full policy engine by jurisdiction
- Live session recording in mental health settings
- Body language / tone inference from text
