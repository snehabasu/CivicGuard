export type DemoViewModel = {
  transcript: string;
  summary: string;
  flags: Array<{ keyword: string; severity: "low" | "medium" | "high" }>;
};
