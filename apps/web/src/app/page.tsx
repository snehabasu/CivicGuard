"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import type { FullCaseNote } from "@civicguard/shared";

function newVisitId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `visit_${crypto.randomUUID()}`;
  }
  return `visit_${Date.now()}`;
}

export default function HomePage() {
  const [visitId] = useState(newVisitId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const router = useRouter();

  const handleTranscriptReady = async (vId: string, transcript: string) => {
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: vId, transcript }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ??
            `Request failed: HTTP ${res.status}`
        );
      }
      const note = (await res.json()) as FullCaseNote;

      // Store in sessionStorage — tab-scoped, clears on close, keeps PHI off URLs
      sessionStorage.setItem("pendingCaseNote", JSON.stringify(note));
      router.push("/review");
    } catch (err) {
      setProcessingError(
        err instanceof Error ? err.message : "Failed to process transcript."
      );
      setIsProcessing(false);
    }
  };

  return (
    <main>
      <h1 style={{ marginTop: 0 }}>Post-Visit Documentation</h1>

      <section
        style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: 8,
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <p style={{ margin: 0, color: "#0369a1" }}>
          <strong>How it works:</strong> Record a brief voice reflection
          immediately after your visit. CivicGuard will draft documentation for
          your review. You must review and approve all content before it is
          submitted to Epic.
        </p>
      </section>

      <section
        style={{
          background: "#fef9c3",
          border: "1px solid #fde047",
          borderRadius: 8,
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#713f12" }}>
          <strong>Do not include</strong> in your recording: client name, date
          of birth, legal or immigration status, or any information that does
          not serve a clinical purpose.
        </p>
      </section>

      <section>
        <h2 style={{ marginTop: 0 }}>Record Reflection</h2>
        <VoiceRecorder
          visitId={visitId}
          onTranscriptReady={handleTranscriptReady}
        />
      </section>

      {isProcessing && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#f9fafb",
            borderRadius: 8,
            color: "#374151",
          }}
        >
          <p style={{ margin: 0 }}>
            Generating draft documentation... this takes 5–10 seconds.
          </p>
        </div>
      )}

      {processingError && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
          }}
        >
          <p style={{ margin: 0, color: "#dc2626" }}>
            <strong>Error:</strong> {processingError}
          </p>
          <button
            style={{
              marginTop: "0.5rem",
              padding: "0.4rem 0.8rem",
              border: "none",
              borderRadius: 4,
              background: "#fee2e2",
              cursor: "pointer",
            }}
            onClick={() => setProcessingError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
    </main>
  );
}
