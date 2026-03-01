export type StressFlag = {
  keyword: string;
  severity: "low" | "medium" | "high";
  context: string;
};

export type SoapNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export type CaseVisitSummary = {
  visitId: string;
  summary: string;
  soap: SoapNote;
  stressFlags: StressFlag[];
  generatedAtIso: string;
};

export type DemoTranscriptResponse = {
  visitId: string;
  transcript: string;
};

// --- New types for full JTBD implementation ---

export type ConfidenceLevel = "high" | "medium" | "low" | "insufficient_data";

export type PsychosocialField = {
  value: string;
  confidence: ConfidenceLevel;
  /** True if Claude omitted content due to documentation boundary rules */
  omitted?: boolean;
  omitReason?: string;
};

/**
 * The 6 required sections of a psychosocial assessment.
 * Each carries a confidence marker so the clinician knows how
 * grounded each field is in the transcript.
 */
export type PsychosocialAssessment = {
  crisisReason: PsychosocialField;
  substanceUse: PsychosocialField;
  longevityOfIssues: PsychosocialField;
  aggressionHistory: PsychosocialField;
  supportSystems: PsychosocialField;
  pastInterventions: PsychosocialField;
};

/**
 * Documentation boundary guidance — what was omitted and why,
 * plus insurance-relevant phrasing suggestions.
 */
export type DocumentationBoundary = {
  legalStatusOmitted: boolean;
  overdocumentationWarnings: string[];
  insurancePhrasing: string[];
};

/**
 * The full AI-generated draft for one visit.
 * `isDraft: true` is a literal type — this output can never be
 * treated as final without explicit conversion to ApprovedCaseNote.
 */
export type FullCaseNote = {
  visitId: string;
  isDraft: true;
  draftLabel: "DRAFT — pending clinician review";
  generatedAtIso: string;
  transcript: string;
  narrativeSummary: string;
  soap: SoapNote;
  psychosocial: PsychosocialAssessment;
  stressFlags: StressFlag[];
  boundaries: DocumentationBoundary;
};

/**
 * The clinician-approved final note.
 * Created only after human review and explicit approval.
 */
export type ApprovedCaseNote = {
  visitId: string;
  isDraft: false;
  approvedAtIso: string;
  approvedBy: string;
  narrativeSummary: string;
  soap: SoapNote;
  psychosocial: PsychosocialAssessment;
  stressFlags: StressFlag[];
  boundaries: DocumentationBoundary;
};

/** Shape returned by POST /api/transcribe */
export type TranscribeResponse = {
  visitId: string;
  transcript: string;
  durationSeconds: number;
};

/** Shape of POST /api/process request body */
export type ProcessRequest = {
  visitId: string;
  transcript: string;
};

/** Shape returned by POST /api/process */
export type ProcessResponse = FullCaseNote;
