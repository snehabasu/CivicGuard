"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FullCaseNote, ApprovedCaseNote } from "@civicguard/shared";
import { ReviewSidebar } from "@/components/ReviewSidebar";
import { ContextTab } from "@/components/review/ContextTab";
import { NoteView } from "@/components/review/NoteView";
import { ChevronLeftIcon, MenuIcon } from "@/components/icons";

type Tab = "transcript" | "note";

export default function ReviewPage() {
  const [note, setNote] = useState<FullCaseNote | null>(null);
  const [approverName, setApproverName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("note");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
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
    };

    sessionStorage.removeItem("pendingCaseNote");
    sessionStorage.setItem("approvedCaseNote", JSON.stringify(approved));
    router.push("/export");
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-teal-dark/40">Loading...</p>
      </div>
    );
  }

  const generatedDate = note.generatedAtIso
    ? new Date(note.generatedAtIso)
    : null;

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <ReviewSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface border-b border-surface-hover">
          <div className="flex items-center gap-3 px-4 h-16">
            {/* Mobile: hamburger for sidebar */}
            {/* <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-hover text-teal-dark/60"
            >
              <MenuIcon size={20} />
            </button> */}

            {/* Desktop: back button */}
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
            {generatedDate && (
              <span className="text-xs text-teal-dark/40 hidden sm:block">
                {generatedDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                {generatedDate.toLocaleTimeString(undefined, {
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
            {generatedDate && (
              <p className="text-xs text-teal-dark/50 mt-1">
                {generatedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at{" "}
                {generatedDate.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Draft banner — thin strip */}
        <div className="px-4 pt-3">
          <div className="max-w-3xl mx-auto bg-amber-50/60 rounded-lg px-4 py-2">
            <p className="text-xs font-semibold text-amber-700">
              {note.draftLabel} — Review and edit before approving.
            </p>
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
            ) : (
              <NoteView
                note={note}
                approverName={approverName}
                onApproverNameChange={setApproverName}
                onApprove={handleApprove}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
