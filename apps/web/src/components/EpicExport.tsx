"use client";

import { useState } from "react";
import type { ApprovedCaseNote, PsychosocialAssessment } from "@civicguard/shared";

type Props = { note: ApprovedCaseNote };

const PSYCH_LABELS: Record<keyof PsychosocialAssessment, string> = {
  crisisReason: "Crisis / Presenting Reason",
  substanceUse: "Substance Use",
  longevityOfIssues: "Longevity of Issues",
  aggressionHistory: "Aggression History",
  supportSystems: "Support Systems",
  pastInterventions: "Past Interventions",
};

function CopySection({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older mobile browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        marginBottom: "1.25rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          padding: "0.6rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong style={{ fontSize: "0.9rem" }}>{label}</strong>
        <button
          onClick={handleCopy}
          style={{
            padding: "0.3rem 0.8rem",
            borderRadius: 4,
            border: "1px solid #d1d5db",
            background: copied ? "#dcfce7" : "#fff",
            color: copied ? "#16a34a" : "#374151",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 600,
            transition: "all 0.15s",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "0.75rem 1rem",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: 1.6,
          background: "#fff",
          color: "#111827",
        }}
      >
        {text}
      </pre>
    </div>
  );
}

export function EpicExport({ note }: Props) {
  const soapText = [
    `S: ${note.soap.subjective}`,
    `O: ${note.soap.objective}`,
    `A: ${note.soap.assessment}`,
    `P: ${note.soap.plan}`,
  ].join("\n\n");

  const psychText = (
    Object.keys(PSYCH_LABELS) as Array<keyof PsychosocialAssessment>
  )
    .map((field) => `${PSYCH_LABELS[field]}: ${note.psychosocial[field].value}`)
    .join("\n");

  return (
    <div>
      <CopySection label="Narrative Summary" text={note.narrativeSummary} />
      <CopySection label="SOAP Note" text={soapText} />
      <CopySection label="Psychosocial Assessment" text={psychText} />

      {note.stressFlags.length > 0 && (
        <section
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: 8,
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: "0.9rem", color: "#92400e" }}>
            Risk Flags — for clinician reference only
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#78350f", margin: "0 0 0.75rem" }}>
            These flags are for your situational awareness. Do not paste them
            directly into Epic — doing so may constitute overdocumentation.
          </p>
          <ul style={{ margin: 0, padding: "0 0 0 1.25rem" }}>
            {note.stressFlags.map((f, i) => (
              <li key={i} style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      f.severity === "high"
                        ? "#dc2626"
                        : f.severity === "medium"
                        ? "#d97706"
                        : "#374151",
                  }}
                >
                  [{f.severity.toUpperCase()}]
                </span>{" "}
                <strong>{f.keyword}</strong>: {f.context}
              </li>
            ))}
          </ul>
        </section>
      )}

      {note.boundaries.insurancePhrasing.length > 0 && (
        <section
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: "0.9rem", color: "#1e40af" }}>
            Insurance Phrasing Suggestions
          </h3>
          <ul style={{ margin: 0, padding: "0 0 0 1.25rem" }}>
            {note.boundaries.insurancePhrasing.map((p, i) => (
              <li key={i} style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
