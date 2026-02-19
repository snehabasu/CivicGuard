import { generateMockSummary, getMockTranscript } from "./routes/demo";

export function runDemoPipeline() {
  const transcript = getMockTranscript();
  const summary = generateMockSummary(transcript);

  return { transcript, summary };
}
