"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApprovedCaseNote } from "@civicguard/shared";
import { EpicExport } from "@/components/EpicExport";

export default function ExportPage() {
  const [note, setNote] = useState<ApprovedCaseNote | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("approvedCaseNote");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setNote(JSON.parse(raw) as ApprovedCaseNote);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!note) {
    return <p style={{ color: "#6b7280" }}>Loading...</p>;
  }

  return (
    <main>
      <h1 style={{ marginTop: 0 }}>Filing-Ready Documentation</h1>

      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#14532d" }}>
          <strong>Approved</strong> by {note.approvedBy} at{" "}
          {new Date(note.approvedAtIso).toLocaleString()}. Click "Copy" next to
          each section to paste into Epic.
        </p>
      </div>

      <EpicExport note={note} />

      <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
        <button
          onClick={() => {
            sessionStorage.removeItem("approvedCaseNote");
            router.push("/");
          }}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Start New Visit
        </button>
      </div>
    </main>
  );
}
