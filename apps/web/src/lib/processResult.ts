import type {
  FullCaseNote,
  PsychosocialAssessment,
  SoapNote,
  StressFlag,
  ConfidenceLevel,
} from "@civicguard/shared";
import { LEGAL_STATUS_SIGNALS } from "@civicguard/shared";

const VALID_CONFIDENCE: ConfidenceLevel[] = [
  "high",
  "medium",
  "low",
  "insufficient_data",
];
const VALID_SEVERITY = ["low", "medium", "high"] as const;
const PSYCH_FIELDS: Array<keyof PsychosocialAssessment> = [
  "crisisReason",
  "substanceUse",
  "longevityOfIssues",
  "aggressionHistory",
  "supportSystems",
  "pastInterventions",
];
const SOAP_FIELDS: Array<keyof SoapNote> = [
  "subjective",
  "objective",
  "assessment",
  "plan",
];

/**
 * Validates the FullCaseNote returned by Claude.
 * Returns an array of error strings. Empty array = valid.
 * Also scans for legal status leaks across all text fields.
 */
export function validateFullCaseNote(note: FullCaseNote): string[] {
  const errors: string[] = [];

  if (!note.narrativeSummary?.trim()) {
    errors.push("narrativeSummary is empty");
  }

  // SOAP validation
  for (const f of SOAP_FIELDS) {
    if (!note.soap?.[f]?.trim()) {
      errors.push(`soap.${f} is empty`);
    }
  }

  // Psychosocial validation
  for (const f of PSYCH_FIELDS) {
    const field = note.psychosocial?.[f];
    if (!field) {
      errors.push(`psychosocial.${f} is missing`);
      continue;
    }
    if (!field.value?.trim()) {
      errors.push(`psychosocial.${f}.value is empty`);
    }
    if (!VALID_CONFIDENCE.includes(field.confidence)) {
      errors.push(
        `psychosocial.${f}.confidence is invalid: "${field.confidence}"`
      );
    }
  }

  // Stress flags validation
  if (!Array.isArray(note.stressFlags)) {
    errors.push("stressFlags must be an array");
  } else {
    (note.stressFlags as StressFlag[]).forEach((flag, i) => {
      if (!VALID_SEVERITY.includes(flag.severity)) {
        errors.push(
          `stressFlags[${i}].severity is invalid: "${flag.severity}"`
        );
      }
    });
  }

  // Boundaries validation
  if (typeof note.boundaries?.legalStatusOmitted !== "boolean") {
    errors.push("boundaries.legalStatusOmitted must be boolean");
  }
  if (!Array.isArray(note.boundaries?.overdocumentationWarnings)) {
    errors.push("boundaries.overdocumentationWarnings must be an array");
  }
  if (!Array.isArray(note.boundaries?.insurancePhrasing)) {
    errors.push("boundaries.insurancePhrasing must be an array");
  }

  // Legal status leak detection — scan all text output for forbidden terms
  const allText = [
    note.narrativeSummary ?? "",
    note.soap?.subjective ?? "",
    note.soap?.objective ?? "",
    note.soap?.assessment ?? "",
    note.soap?.plan ?? "",
    ...PSYCH_FIELDS.map((f) => note.psychosocial?.[f]?.value ?? ""),
  ]
    .join(" ")
    .toLowerCase();

  for (const signal of LEGAL_STATUS_SIGNALS) {
    if (allText.includes(signal)) {
      errors.push(
        `LEGAL_STATUS_LEAK: output contains "${signal}" — must be removed`
      );
    }
  }

  return errors;
}
