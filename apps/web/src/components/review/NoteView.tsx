"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type {
  FullCaseNote,
  ApprovedCaseNote,
  SoapNote,
  PsychosocialAssessment,
  StressFlag,
  DocumentationBoundary,
  IcdCode,
  FollowUpQuestion,
} from "@carenotes/shared";
import { NoteTypePills, type NoteType } from "./NoteTypePills";
import { CopyIcon, CheckIcon } from "../icons";

/* ── Serializers ── */

function serializeSoap(soap: SoapNote): string {
  return [
    `Subjective:\n${soap.subjective}`,
    `Objective:\n${soap.objective}`,
    `Assessment:\n${soap.assessment}`,
    `Plan:\n${soap.plan}`,
  ].join("\n\n");
}

function serializeNarrative(text: string): string {
  return text;
}

function serializePsychosocial(psych: PsychosocialAssessment): string {
  const sections: { label: string; key: keyof PsychosocialAssessment }[] = [
    { label: "Crisis / Presenting Reason", key: "crisisReason" },
    { label: "Substance Use", key: "substanceUse" },
    { label: "Longevity of Issues", key: "longevityOfIssues" },
    { label: "Aggression History", key: "aggressionHistory" },
    { label: "Support Systems", key: "supportSystems" },
    { label: "Past Interventions", key: "pastInterventions" },
  ];

  return sections
    .map((s) => {
      const field = psych[s.key];
      const conf = `[${field.confidence.replace("_", " ")}]`;
      let line = `${s.label} ${conf}:\n${field.value}`;
      if (field.omitted) line += `\n(Omitted: ${field.omitReason})`;
      return line;
    })
    .join("\n\n");
}

function serializeFlags(flags: StressFlag[]): string {
  if (flags.length === 0) return "No stress or risk indicators detected.";
  return flags
    .map((f) => `[${f.severity.toUpperCase()}] ${f.keyword} — ${f.context}`)
    .join("\n");
}

function serializeIcdCodes(codes: IcdCode[]): string {
  if (codes.length === 0) return "No ICD-10-CM codes are supportable from the current transcript.";
  return codes
    .map((c) => `${c.code} — ${c.description} [${c.confidence.replace("_", " ")}]`)
    .join("\n");
}

function serializeFollowUpQuestions(questions: FollowUpQuestion[]): string {
  if (questions.length === 0) return "No follow-up questions generated.";
  return questions
    .map((q, i) => `${i + 1}. ${q.question}\n   Rationale: ${q.rationale}`)
    .join("\n\n");
}

function serializeBoundaries(b: DocumentationBoundary): string {
  const parts: string[] = [];

  parts.push(
    `Legal Status: ${
      b.legalStatusOmitted
        ? "Legal/immigration status was present in the source and has been omitted from this documentation."
        : "No legal or immigration status references detected."
    }`,
  );

  if (b.overdocumentationWarnings.length > 0) {
    parts.push(
      `Overdocumentation Warnings:\n${b.overdocumentationWarnings.map((w) => `- ${w}`).join("\n")}`,
    );
  }

  if (b.insurancePhrasing.length > 0) {
    parts.push(
      `Insurance Phrasing Suggestions:\n${b.insurancePhrasing.map((p) => `- ${p}`).join("\n")}`,
    );
  }

  return parts.join("\n\n");
}

type NoteData = Pick<FullCaseNote | ApprovedCaseNote, "soap" | "narrativeSummary" | "psychosocial" | "stressFlags" | "boundaries" | "icdCodes" | "followUpQuestions">;

function initTexts(note: NoteData): Record<NoteType, string> {
  return {
    soap: serializeSoap(note.soap),
    narrative: serializeNarrative(note.narrativeSummary),
    psychosocial: serializePsychosocial(note.psychosocial),
    flags: serializeFlags(note.stressFlags),
    boundaries: serializeBoundaries(note.boundaries),
    icd: serializeIcdCodes(note.icdCodes ?? []),
    followup: serializeFollowUpQuestions(note.followUpQuestions ?? []),
  };
}

/* ── Auto-resize hook ── */

function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return ref;
}

/* ── Component ── */

type Props = {
  note: NoteData & { psychosocial: PsychosocialAssessment; icdCodes: IcdCode[]; followUpQuestions: FollowUpQuestion[] };
  readOnly?: boolean;
  approverName?: string;
  onApproverNameChange?: (name: string) => void;
  onApprove?: () => void;
};

export function NoteView({
  note,
  readOnly = false,
  approverName = "",
  onApproverNameChange,
  onApprove,
}: Props) {
  const [activeType, setActiveType] = useState<NoteType>("soap");
  const [editedTexts, setEditedTexts] = useState<Record<NoteType, string>>(
    () => initTexts(note),
  );
  const [copied, setCopied] = useState(false);

  const hasInsufficientData = useMemo(() => {
    const psych = note.psychosocial;
    return (Object.keys(psych) as (keyof PsychosocialAssessment)[]).some(
      (key) => psych[key].confidence === "insufficient_data",
    );
  }, [note.psychosocial]);

  const textareaRef = useAutoResize(editedTexts[activeType]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditedTexts((prev) => ({ ...prev, [activeType]: e.target.value }));
    },
    [activeType],
  );

  const handleCopy = useCallback(async () => {
    const text = editedTexts[activeType];
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeType, editedTexts]);

  const canApprove = approverName.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Pill bar */}
      <NoteTypePills active={activeType} onChange={setActiveType} />

      {/* Insufficient data banner — only on psychosocial tab */}
      {activeType === "psychosocial" && hasInsufficientData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          <p className="text-xs font-medium text-amber-700 m-0">
            Some fields have insufficient data — review and supplement from your clinical knowledge.
          </p>
        </div>
      )}

      {/* Textarea card with copy button */}
      <div className="bg-white rounded-xl px-6 py-5">
        <div className="flex justify-end mb-2">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              copied
                ? "bg-green-50 text-green-600"
                : "bg-surface-card text-teal-dark/60 hover:text-teal-dark/80"
            }`}
          >
            {copied ? (
              <>
                <CheckIcon size={14} /> Copied
              </>
            ) : (
              <>
                <CopyIcon size={14} /> Copy
              </>
            )}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={editedTexts[activeType]}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="No content was generated for this section. Add your notes here."
          className={`w-full text-sm text-teal-dark leading-relaxed outline-none resize-none min-h-[300px] placeholder:text-teal-dark/30 placeholder:italic ${
            readOnly ? "cursor-default bg-surface/50" : "bg-transparent"
          }`}
          spellCheck={false}
        />
      </div>

      {/* Approval footer — hidden in read-only mode */}
      {!readOnly && (
        <div className="bg-white rounded-xl px-6 py-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-teal-dark/60 mb-1">
                Clinician name
              </label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => onApproverNameChange?.(e.target.value)}
                placeholder="e.g. Jane Smith, LCSW"
                className="w-full px-3 py-2 rounded-lg border border-surface-hover bg-white text-sm text-teal-dark outline-none focus:ring-2 focus:ring-teal/30"
              />
            </div>
            <button
              disabled={!canApprove}
              onClick={onApprove}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                canApprove
                  ? "bg-teal text-white hover:bg-teal-dark cursor-pointer"
                  : "bg-teal-lighter text-teal-dark/40 cursor-not-allowed"
              }`}
            >
              Approve &amp; Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
