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
