"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FullCaseNote, ApprovedCaseNote } from "@carenotes/shared";
import { getNoteById, saveNote } from "@/lib/noteStorage";
import { ReviewSidebar } from "@/components/ReviewSidebar";
import { ContextTab } from "@/components/review/ContextTab";
import { NoteView } from "@/components/review/NoteView";
import { ChevronLeftIcon } from "@/components/icons";

type Tab = "transcript" | "note";

function ReviewContent() {
  const [note, setNote] = useState<FullCaseNote | ApprovedCaseNote | null>(null);
  const [approverName, setApproverName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("note");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const visitId = searchParams.get("visitId");

    // Try localStorage first (by visitId)
    if (visitId) {
      const stored = getNoteById(visitId);
      if (stored) {
        setNote(stored as FullCaseNote | ApprovedCaseNote);
        return;
      }
    }

    // Fall back to sessionStorage (backward compat for new recordings)
    const rawDraft = sessionStorage.getItem("pendingCaseNote");
    if (rawDraft) {
      try {
        setNote(JSON.parse(rawDraft) as FullCaseNote);
        return;
      } catch {
        // fall through
      }
    }

    const rawApproved = sessionStorage.getItem("approvedCaseNote");
    if (rawApproved) {
      try {
        setNote(JSON.parse(rawApproved) as ApprovedCaseNote);
        return;
      } catch {
        // fall through
      }
    }

    router.replace("/");
  }, [router, searchParams]);

  const handleApprove = () => {
    if (!note || !approverName.trim()) return;
    const approved: ApprovedCaseNote = {
      visitId: note.visitId,
      patientName: note.patientName,
      isDraft: false,
      approvedAtIso: new Date().toISOString(),
      approvedBy: approverName.trim(),
      transcript: note.transcript,
      narrativeSummary: note.narrativeSummary,
      soap: note.soap,
      psychosocial: note.psychosocial,
      stressFlags: note.stressFlags,
      boundaries: note.boundaries,
      icdCodes: note.icdCodes ?? [],
      followUpQuestions: note.followUpQuestions ?? [],
    };

    // Save approved note to localStorage (overwrites the draft)
    saveNote(approved);
    // Clean up sessionStorage
    sessionStorage.removeItem("pendingCaseNote");
    sessionStorage.setItem("approvedCaseNote", JSON.stringify(approved));
    // Stay on the same page — switch to approved state
    setNote(approved);
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-teal-dark/40">Loading...</p>
      </div>
    );
  }

  const isDraft = note.isDraft;
  const displayDate = isDraft
    ? (note as FullCaseNote).generatedAtIso
      ? new Date((note as FullCaseNote).generatedAtIso)
      : null
    : new Date((note as ApprovedCaseNote).approvedAtIso);

  return (
    <div className="min-h-screen w-full">
      {/* Sidebar */}
      <ReviewSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
      />

      {/* Main content */}
      <div className="min-w-0 flex flex-col min-h-screen lg:ml-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface border-b border-surface-hover">
          <div className="flex items-center gap-3 px-4 h-16">
            <button
              onClick={() => router.push("/")}
              className="lg:flex p-2 rounded-lg hover:bg-surface-hover text-teal-dark/60"
            >
              <ChevronLeftIcon size={20} />
            </button>

            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-teal">Care</span>
              <span className="text-lg font-bold text-amber">Notes</span>
            </div>

            <div className="flex-1" />

            {/* Date/time metadata */}
            {displayDate && (
              <span className="text-xs text-teal-dark/40 hidden sm:block">
                {!isDraft && "Approved "}
                {displayDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                {displayDate.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </header>

        {/* Patient name + time */}
        <div className="px-4 pt-5">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-teal-dark">
              {note.patientName || "Unknown Client"}
            </h1>
            {displayDate && (
              <p className="text-xs text-teal-dark/50 mt-1">
                {displayDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at{" "}
                {displayDate.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Status banner */}
        <div className="px-4 pt-3">
          <div className="max-w-3xl mx-auto">
            {isDraft ? (
              <div className="bg-amber-50/60 rounded-lg px-4 py-2">
                <p className="text-xs font-semibold text-amber-700">
                  {(note as FullCaseNote).draftLabel} — Review and edit before approving.
                </p>
              </div>
            ) : (
              <div className="bg-green-50/60 rounded-lg px-4 py-2">
                <p className="text-xs font-semibold text-green-700">
                  Approved by {(note as ApprovedCaseNote).approvedBy}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-4 pt-3">
          <div className="max-w-3xl mx-auto">
            <div className="bg-surface-card rounded-lg p-1 inline-flex">
              {(["transcript", "note"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-white text-teal shadow-sm"
                      : "text-teal-dark/50 hover:text-teal-dark/70"
                  }`}
                >
                  {tab === "transcript" ? "Transcript" : "Note"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-12">
          <div className="max-w-3xl mx-auto">
            {activeTab === "transcript" ? (
              <ContextTab transcript={note.transcript} />
            ) : isDraft ? (
              <NoteView
                note={note}
                approverName={approverName}
                onApproverNameChange={setApproverName}
                onApprove={handleApprove}
              />
            ) : (
              <NoteView note={note} readOnly />
            )}
          </div>
        </main>

        {/* Start New Visit — only shown after approval */}
        {!isDraft && (
          <div className="px-4 pb-8">
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => {
                  sessionStorage.removeItem("approvedCaseNote");
                  router.push("/");
                }}
                className="w-full py-3 rounded-xl text-sm font-bold text-teal-dark/60 bg-surface-card hover:bg-surface-hover transition-colors"
              >
                Start New Visit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-sm text-teal-dark/40">Loading...</p>
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
