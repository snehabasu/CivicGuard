import { HIGH_STRESS_KEYWORDS, type CaseVisitSummary, type DemoTranscriptResponse } from "../../../../packages/shared/src/index";

export function getMockTranscript(): DemoTranscriptResponse {
  return {
    visitId: "visit_demo_001",
    transcript:
      "Caregiver reports feeling stressful and overwhelmed about bills and school attendance. No immediate safety danger reported.",
  };
}

export function generateMockSummary(transcriptPayload: DemoTranscriptResponse): CaseVisitSummary {
  const found = HIGH_STRESS_KEYWORDS.filter((k) => transcriptPayload.transcript.toLowerCase().includes(k));

  return {
    visitId: transcriptPayload.visitId,
    summary:
      "Family reports elevated stress tied to finances and school attendance issues. No immediate safety concerns identified during visit.",
    soap: {
      subjective: "Caregiver reports feeling overwhelmed, stressed, and worried about household stability.",
      objective: "No acute safety threat disclosed. Stressors include bills and school attendance.",
      assessment: "High psychosocial stress with moderate risk of escalation without support.",
      plan: "Provide resource referrals, schedule check-in within 72 hours, monitor school attendance barriers.",
    },
    stressFlags: found.map((keyword) => ({
      keyword,
      severity: keyword === "unsafe" ? "high" : "medium",
      context: `Detected in transcript for ${transcriptPayload.visitId}`,
    })),
    generatedAtIso: new Date().toISOString(),
  };
}
