"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { PatientGroup } from "@/lib/mockNotes";

const RiskTrendChart = dynamic(
  () => import("./RiskTrendChart").then((m) => m.RiskTrendChart),
  { ssr: false }
);

type Props = {
  group: PatientGroup;
  isExpanded: boolean;
  onToggle: () => void;
};

const SEVERITY_DOT: Record<PatientGroup["peakSeverity"], string> = {
  high: "bg-red-500",
  medium: "bg-amber",
  low: "bg-teal-light",
  none: "bg-surface-hover",
};

const SEVERITY_LABEL: Record<PatientGroup["peakSeverity"], string> = {
  high: "High risk",
  medium: "Moderate risk",
  low: "Low risk",
  none: "No flags",
};

export function PatientCard({ group, isExpanded, onToggle }: Props) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-surface-hover bg-white overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover/50 transition-colors text-left"
      >
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-full ${group.avatarColor} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-xs font-semibold text-teal-dark/70">
            {group.initials}
          </span>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-teal-dark truncate">
              {group.patientName}
            </span>
            {/* Peak severity dot */}
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[group.peakSeverity]}`}
              title={SEVERITY_LABEL[group.peakSeverity]}
            />
          </div>
          <p className="text-[11px] text-teal-dark/40 truncate">
            {group.totalSessions} session{group.totalSessions !== 1 ? "s" : ""} · Last:{" "}
            {group.lastSessionLabel}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-teal-dark/30 flex-shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-surface-hover">
              {/* Chart section */}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-dark/40 mt-3 mb-1">
                Stress Flags by Session
              </p>
              <RiskTrendChart sessions={group.sessions} />

              {/* Legend */}
              <div className="flex gap-4 mt-1 mb-3">
                {[
                  { color: "bg-red-500", label: "High" },
                  { color: "bg-amber", label: "Medium" },
                  { color: "bg-teal-light", label: "Low" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-sm ${color}`} />
                    <span className="text-[10px] text-teal-dark/50">{label}</span>
                  </div>
                ))}
              </div>

              {/* Session list — newest first */}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-dark/40 mb-1">
                Sessions
              </p>
              <div className="space-y-0.5">
                {[...group.sessions].reverse().map((s) => (
                  <button
                    key={s.visitId}
                    onClick={() => router.push(`/review?visitId=${s.visitId}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
                  >
                    {/* Date/time */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-teal-dark/70">
                          {s.dateLabel}
                        </span>
                        <span className="text-[10px] text-teal-dark/30">{s.time}</span>
                      </div>
                      {s.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {s.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-surface-hover text-teal-dark/60 px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Status badge */}
                    <span
                      className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        s.status === "draft"
                          ? "bg-amber/20 text-amber-700"
                          : "bg-teal-lighter text-teal-dark/70"
                      }`}
                    >
                      {s.status === "draft" ? "Draft" : "Approved"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
