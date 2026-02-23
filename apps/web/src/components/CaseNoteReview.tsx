"use client";

import { useState } from "react";
import type {
  FullCaseNote,
  SoapNote,
  PsychosocialAssessment,
  ConfidenceLevel,
} from "@civicguard/shared";

type Props = {
  initialNote: FullCaseNote;
  onApprove: (note: FullCaseNote, approverName: string) => void;
};

const SOAP_LABELS: Record<keyof SoapNote, string> = {
  subjective: "Subjective (client/caregiver reported)",
  objective: "Objective (clinician observations)",
  assessment: "Assessment (risk level & clinical impression)",
  plan: "Plan (interventions & follow-up)",
};

const PSYCH_LABELS: Record<keyof PsychosocialAssessment, string> = {
  crisisReason: "Crisis / Presenting Reason",
  substanceUse: "Substance Use",
  longevityOfIssues: "Longevity of Issues",
  aggressionHistory: "Aggression History",
  supportSystems: "Support Systems",
  pastInterventions: "Past Interventions",
};

const CONFIDENCE_COLOR: Record<ConfidenceLevel, string> = {
  high: "#16a34a",
  medium: "#d97706",
  low: "#dc2626",
  insufficient_data: "#6b7280",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.5rem",
  borderRadius: 4,
  border: "1px solid #d1d5db",
  fontFamily: "inherit",
  fontSize: "0.9rem",
  lineHeight: 1.5,
  resize: "vertical",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: "2rem",
  paddingBottom: "1.5rem",
  borderBottom: "1px solid #e5e7eb",
};

export function CaseNoteReview({ initialNote, onApprove }: Props) {
  const [note, setNote] = useState<FullCaseNote>(initialNote);
  const [approverName, setApproverName] = useState("");

  const setSoap = (field: keyof SoapNote, value: string) =>
    setNote((n) => ({ ...n, soap: { ...n.soap, [field]: value } }));

  const setPsych = (field: keyof PsychosocialAssessment, value: string) =>
    setNote((n) => ({
      ...n,
      psychosocial: {
        ...n.psychosocial,
        [field]: { ...n.psychosocial[field], value },
      },
    }));

  const canApprove = approverName.trim().length > 0;

  return (
    <div>
      {/* Draft banner */}
      <div
        style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: 8,
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
        }}
      >
        <strong style={{ color: "#92400e" }}>{note.draftLabel}</strong>
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#78350f" }}>
          Review each section carefully. Edit any inaccurate or missing
          information before approving. Do not submit to Epic until you have
          reviewed and approved this draft.
        </p>
      </div>

      {/* Source transcript */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Source Transcript (read-only)</h2>
        <blockquote
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "0.75rem 1rem",
            margin: 0,
            fontStyle: "italic",
            color: "#374151",
          }}
        >
          {note.transcript}
        </blockquote>
      </section>

      {/* Narrative Summary */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Narrative Summary (Epic Format)</h2>
        <textarea
          style={{ ...fieldStyle, minHeight: 100 }}
          value={note.narrativeSummary}
          onChange={(e) =>
            setNote((n) => ({ ...n, narrativeSummary: e.target.value }))
          }
        />
      </section>

      {/* SOAP Note */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>SOAP Note</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {(Object.keys(SOAP_LABELS) as Array<keyof SoapNote>).map((field) => (
            <div key={field}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                  fontSize: "0.875rem",
                }}
              >
                {SOAP_LABELS[field]}
              </label>
              <textarea
                style={{ ...fieldStyle, minHeight: 72 }}
                value={note.soap[field]}
                onChange={(e) => setSoap(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Psychosocial Assessment */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Psychosocial Assessment</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {(
            Object.keys(PSYCH_LABELS) as Array<keyof PsychosocialAssessment>
          ).map((field) => {
            const item = note.psychosocial[field];
            return (
              <div key={field}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                    alignItems: "baseline",
                  }}
                >
                  <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {PSYCH_LABELS[field]}
                  </label>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: CONFIDENCE_COLOR[item.confidence],
                      fontWeight: 500,
                    }}
                  >
                    Confidence: {item.confidence.replace("_", " ")}
                  </span>
                </div>
                <textarea
                  style={{ ...fieldStyle, minHeight: 60 }}
                  value={item.value}
                  onChange={(e) => setPsych(field, e.target.value)}
                />
                {item.omitted && (
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.25rem 0 0" }}>
                    Note: {item.omitReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Risk Flags */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>High-Stress / High-Risk Flags</h2>
        {note.stressFlags.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No stress or risk indicators detected.</p>
        ) : (
          <ul style={{ margin: 0, padding: "0 0 0 1.25rem" }}>
            {note.stressFlags.map((flag, i) => (
              <li key={i} style={{ marginBottom: "0.5rem" }}>
                <span
                  style={{
                    fontWeight: 600,
                    color:
                      flag.severity === "high"
                        ? "#dc2626"
                        : flag.severity === "medium"
                        ? "#d97706"
                        : "#374151",
                  }}
                >
                  [{flag.severity.toUpperCase()}]
                </span>{" "}
                <strong>{flag.keyword}</strong> — {flag.context}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Documentation Boundaries */}
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Documentation Boundaries</h2>
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 6,
            padding: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            <strong>Legal status:</strong>{" "}
            {note.boundaries.legalStatusOmitted
              ? "Legal/immigration status was present in the source and has been omitted from this documentation (as required)."
              : "No legal or immigration status references detected in source transcript."}
          </p>
        </div>

        {note.boundaries.overdocumentationWarnings.length > 0 && (
          <div style={{ marginBottom: "0.75rem" }}>
            <strong style={{ fontSize: "0.875rem" }}>
              Content removed to prevent overdocumentation:
            </strong>
            <ul style={{ margin: "0.25rem 0 0", padding: "0 0 0 1.25rem", fontSize: "0.875rem" }}>
              {note.boundaries.overdocumentationWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {note.boundaries.insurancePhrasing.length > 0 && (
          <div>
            <strong style={{ fontSize: "0.875rem" }}>
              Insurance-relevant phrasing suggestions:
            </strong>
            <ul style={{ margin: "0.25rem 0 0", padding: "0 0 0 1.25rem", fontSize: "0.875rem", color: "#374151" }}>
              {note.boundaries.insurancePhrasing.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Approve */}
      <section>
        <h2 style={{ marginTop: 0 }}>Clinician Approval</h2>
        <p style={{ fontSize: "0.875rem", color: "#374151" }}>
          By entering your name and clicking <strong>Approve</strong>, you
          confirm that you have reviewed this documentation, it accurately
          reflects the clinical encounter, and it is ready for Epic entry.
        </p>
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
          >
            Your name (required):
          </label>
          <input
            type="text"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            placeholder="Full name or credential (e.g. Jane Smith, LCSW)"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.5rem",
              borderRadius: 4,
              border: "1px solid #d1d5db",
              fontSize: "0.9rem",
            }}
          />
        </div>
        <button
          disabled={!canApprove}
          onClick={() => onApprove(note, approverName.trim())}
          style={{
            padding: "0.6rem 1.4rem",
            borderRadius: 6,
            border: "none",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: canApprove ? "pointer" : "not-allowed",
            background: canApprove ? "#16a34a" : "#d1fae5",
            color: canApprove ? "#fff" : "#6b7280",
          }}
        >
          Approve and Proceed to Export
        </button>
        {!canApprove && (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
            Enter your name above to enable approval.
          </p>
        )}
      </section>
    </div>
  );
}
