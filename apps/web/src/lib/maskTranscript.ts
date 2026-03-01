import { LEGAL_STATUS_SIGNALS, SENSITIVE_TRANSCRIPT_PHRASES } from "@civicguard/shared";

/**
 * PII/PHI regex patterns applied to raw transcripts before any storage
 * or AI processing. Each match is replaced with a bracketed label so the
 * clinician can see that a redaction occurred.
 *
 * Order matters: more specific patterns (SSN) run before broader ones (DATE).
 */
const PII_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Social Security Numbers: 123-45-6789 or 123 45 6789
  {
    pattern: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g,
    label: "[SSN REDACTED]",
  },
  // US phone numbers — handles (555) 867-5309, 555.867.5309, +1 555 867 5309, etc.
  {
    pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g,
    label: "[PHONE REDACTED]",
  },
  // Email addresses
  {
    pattern: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g,
    label: "[EMAIL REDACTED]",
  },
  // Dates in MM/DD/YYYY or MM-DD-YYYY (likely DOB or identifying dates)
  {
    pattern: /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g,
    label: "[DATE REDACTED]",
  },
  // Street addresses: house number + 1-4 word name + street type
  {
    pattern:
      /\b\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+){0,3}\s+(?:Street|Avenue|Boulevard|Drive|Road|Lane|Court|Way|Place|Circle|St|Ave|Blvd|Dr|Rd|Ln|Ct|Pl|Cir)\.?\b/gi,
    label: "[ADDRESS REDACTED]",
  },
];

/**
 * All word/phrase-level terms that must be masked in transcripts.
 * Combines the existing LEGAL_STATUS_SIGNALS with additional verbal phrases
 * a client might use that imply immigration or criminal history.
 */
const SENSITIVE_TERMS: string[] = [
  ...LEGAL_STATUS_SIGNALS,
  ...SENSITIVE_TRANSCRIPT_PHRASES,
];

/**
 * Masks PII patterns and sensitive phrases in a raw transcript.
 *
 * @param text - The raw transcript from Whisper
 * @returns masked text and the number of redactions made
 */
export function maskSensitiveContent(text: string): {
  masked: string;
  redactionCount: number;
} {
  let masked = text;
  let redactionCount = 0;

  // 1. Pattern-based PII redactions
  for (const { pattern, label } of PII_PATTERNS) {
    masked = masked.replace(pattern, () => {
      redactionCount++;
      return label;
    });
  }

  // 2. Phrase/word-based legal and status term redactions (case-insensitive)
  for (const term of SENSITIVE_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "gi");
    masked = masked.replace(re, () => {
      redactionCount++;
      return "[LEGAL STATUS OMITTED]";
    });
  }

  return { masked, redactionCount };
}
