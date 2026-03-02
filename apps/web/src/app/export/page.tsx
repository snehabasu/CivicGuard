"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApprovedCaseNote } from "@civicguard/shared";
import { ContextTab } from "@/components/review/ContextTab";
import { NoteView } from "@/components/review/NoteView";
import { ChevronLeftIcon } from "@/components/icons";

type Tab = "transcript" | "note";

export default function ExportPage() {
  const [note, setNote] = useState<ApprovedCaseNote | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("note");
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-teal-dark/40">Loading...</p>
      </div>
    );
  }

  const approvedDate = new Date(note.approvedAtIso);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
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

            <span className="text-xs text-teal-dark/40 hidden sm:block">
              Approved{" "}
              {approvedDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              {approvedDate.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </header>

        {/* Patient name */}
        <div className="px-4 pt-5">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-teal-dark">
              {note.patientName || "Unknown Client"}
            </h1>
            <p className="text-xs text-teal-dark/50 mt-1">
              {approvedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at{" "}
              {approvedDate.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Approved banner */}
        <div className="px-4 pt-3">
          <div className="max-w-3xl mx-auto bg-green-50/60 rounded-lg px-4 py-2">
            <p className="text-xs font-semibold text-green-700">
              Approved by {note.approvedBy}
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
              <NoteView note={note} readOnly />
            )}
          </div>
        </main>

        {/* Start New Visit */}
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
      </div>
    </div>
  );
}
