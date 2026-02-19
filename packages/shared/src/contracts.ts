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
