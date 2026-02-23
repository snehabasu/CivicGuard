"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FullCaseNote, ApprovedCaseNote } from "@civicguard/shared";
import { CaseNoteReview } from "@/components/CaseNoteReview";

export default function ReviewPage() {
  const [note, setNote] = useState<FullCaseNote | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingCaseNote");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setNote(JSON.parse(raw) as FullCaseNote);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleApprove = (editedNote: FullCaseNote, approverName: string) => {
    const approved: ApprovedCaseNote = {
      visitId: editedNote.visitId,
      isDraft: false,
      approvedAtIso: new Date().toISOString(),
      approvedBy: approverName,
      narrativeSummary: editedNote.narrativeSummary,
      soap: editedNote.soap,
      psychosocial: editedNote.psychosocial,
      stressFlags: editedNote.stressFlags,
      boundaries: editedNote.boundaries,
    };

    sessionStorage.removeItem("pendingCaseNote");
    sessionStorage.setItem("approvedCaseNote", JSON.stringify(approved));
    router.push("/export");
  };

  if (!note) {
    return <p style={{ color: "#6b7280" }}>Loading...</p>;
  }

  return (
    <main>
      <h1 style={{ marginTop: 0 }}>Review Draft Documentation</h1>
      <CaseNoteReview initialNote={note} onApprove={handleApprove} />
    </main>
  );
}
