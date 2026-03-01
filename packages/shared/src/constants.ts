/**
 * Additional sensitive phrases that must be masked in raw transcripts
 * before any storage or AI processing. Complements LEGAL_STATUS_SIGNALS.
 * These expand coverage to phrases a client might say verbally.
 */
export const SENSITIVE_TRANSCRIPT_PHRASES: string[] = [
  // Immigration status (verbal phrasings)
  "illegal alien",
  "illegal immigrant",
  "without papers",
  "without documentation",
  "sin papeles",
  "no papers",
  "asylum seeker",
  "seeking asylum",
  "DACA",
  "refugee status",
  // Criminal history (must not appear in clinical records)
  "criminal record",
  "arrest record",
  "registered sex offender",
  "sex offender",
  "prior conviction",
  "prior convictions",
];

export const HIGH_STRESS_KEYWORDS = [
  "stressful", "worried", "overwhelmed", "panic", "unsafe",
  // Extended for psychiatric / inpatient context
  "crisis", "suicidal", "homicidal", "harm", "danger",
  "abuse", "threatening", "hopeless", "helpless", "escalating",
];

/**
 * Keywords that signal a documentation boundary violation if they appear
 * in AI output. Legal status must never be documented.
 */
export const LEGAL_STATUS_SIGNALS = [
  "undocumented", "immigration status", "legal status",
  "arrested", "incarcerated", "charges", "warrant", "felony", "misdemeanor",
  "probation", "parole", "detained", "deportation",
];
