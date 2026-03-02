"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Sidebar } from "@/components/Sidebar";
import { NoteCard } from "@/components/NoteCard";
import { mockNoteGroups, mockFullCaseNote } from "@/lib/mockNotes";
import { SearchIcon, MenuIcon, XIcon } from "@/components/icons";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const handleTranscriptReady = async (vId: string, transcript: string) => {
    setIsProcessing(true);

    const note: FullCaseNote = {
      ...mockFullCaseNote,
      visitId: vId,
      patientName: "Lisa Smith",
      transcript,
      generatedAtIso: new Date().toISOString(),
    };

    sessionStorage.setItem("pendingCaseNote", JSON.stringify(note));
    router.push("/review");
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
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

        {/* Notes history — scrollable area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-28 scrollbar-hide">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Note groups */}
            {mockNoteGroups.map((group) => (
              <section key={group.label}>
                <h2 className="text-xs font-semibold text-teal-dark/40 uppercase tracking-wider px-4 mb-2">
                  {group.label}
                </h2>
                <div className="space-y-0.5">
                  {group.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </section>
            ))}
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
