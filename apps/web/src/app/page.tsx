"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Sidebar } from "@/components/Sidebar";
import { PatientCard } from "@/components/PatientCard";
import { seedDummyNotes } from "@/lib/mockNotes";
import { usePatientGroups } from "@/lib/usePatientGroups";
import { saveNote } from "@/lib/noteStorage";
import { SearchIcon, MenuIcon, XIcon } from "@/components/icons";
import type { FullCaseNote } from "@carenotes/shared";

function newVisitId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `visit_${crypto.randomUUID()}`;
  }
  return `visit_${Date.now()}`;
}

export default function HomePage() {
  const [visitId] = useState(newVisitId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const router = useRouter();
  const patientGroups = usePatientGroups();

  useEffect(() => {
    seedDummyNotes();
  }, []);

  const handleTranscriptReady = async (vId: string, transcript: string, patientName: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: vId, transcript, patientName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Processing failed" }));
        throw new Error(err.error ?? "Processing failed");
      }
      const note: FullCaseNote = await res.json();
      // Save to localStorage for persistence
      saveNote(note);
      // Also keep sessionStorage for backward compat
      sessionStorage.setItem("pendingCaseNote", JSON.stringify(note));
      router.push(`/review?visitId=${note.visitId}`);
    } catch (err) {
      console.error("[HomePage] process error:", err);
      alert(err instanceof Error ? err.message : "Failed to generate case note. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="min-w-0 flex flex-col min-h-screen lg:ml-[260px]">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-surface border-b border-surface-hover">
          <div className="flex items-center gap-3 px-4 h-16">
            {searchOpen ? (
              /* Search expanded — takes over entire header */
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <SearchIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-dark/30"
                  />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search notes..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-card text-sm text-teal-dark placeholder:text-teal-dark/30 outline-none focus:ring-2 focus:ring-teal/30 transition-shadow"
                    readOnly
                  />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-surface-hover text-teal-dark/60"
                >
                  <XIcon size={18} />
                </button>
              </div>
            ) : (
              /* Normal header — hamburger, brand, search icon */
              <>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-surface-hover text-teal-dark/60"
                >
                  <MenuIcon size={20} />
                </button>

                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold text-teal">Care</span>
                  <span className="text-lg font-bold text-amber">Notes</span>
                </div>

                <div className="flex-1" />

                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-teal-dark/60"
                >
                  <SearchIcon size={20} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Patient list — scrollable area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-28 scrollbar-hide">
          <div className="max-w-2xl mx-auto space-y-2">
            {patientGroups.map((group, index) => {
              const patientKey = `${group.patientName}__${index}`;
              return (
                <PatientCard
                  key={patientKey}
                  group={group}
                  isExpanded={expandedPatient === patientKey}
                  onToggle={() =>
                    setExpandedPatient((prev) =>
                      prev === patientKey ? null : patientKey
                    )
                  }
                />
              );
            })}
          </div>
        </main>

        {/* Floating pill — fixed to bottom center */}
        <div className="fixed bottom-5 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <VoiceRecorder
              visitId={visitId}
              onTranscriptReady={handleTranscriptReady}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
