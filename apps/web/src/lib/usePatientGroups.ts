import { useSyncExternalStore } from "react";
import type { PatientGroup, SessionSummary } from "./mockNotes";
import { getAllNotes, type StoredNote } from "./noteStorage";
import {
  getInitials,
  pickAvatarColor,
  noteDate,
  formatTime,
  groupLabel,
  subscribe,
  registerInvalidator,
} from "./noteUtils";

// ── Helpers ──

function toSession(n: StoredNote): SessionSummary {
  const d = noteDate(n);
  const highCount = n.stressFlags.filter((f) => f.severity === "high").length;
  const mediumCount = n.stressFlags.filter((f) => f.severity === "medium").length;
  const lowCount = n.stressFlags.filter((f) => f.severity === "low").length;
  return {
    visitId: n.visitId,
    date: d,
    dateLabel: groupLabel(d),
    time: formatTime(d),
    status: n.isDraft ? "draft" : "approved",
    tags: n.stressFlags.slice(0, 3).map((f) => f.keyword),
    highCount,
    mediumCount,
    lowCount,
  };
}

function peakSeverity(sessions: SessionSummary[]): PatientGroup["peakSeverity"] {
  const hasHigh = sessions.some((s) => s.highCount > 0);
  if (hasHigh) return "high";
  const hasMedium = sessions.some((s) => s.mediumCount > 0);
  if (hasMedium) return "medium";
  const hasLow = sessions.some((s) => s.lowCount > 0);
  if (hasLow) return "low";
  return "none";
}

function buildPatientGroups(notes: StoredNote[]): PatientGroup[] {
  const map = new Map<string, StoredNote[]>();
  for (const n of notes) {
    const name = n.patientName || "Unknown Client";
    const list = map.get(name) ?? [];
    list.push(n);
    map.set(name, list);
  }

  const groups: PatientGroup[] = [];
  for (const [name, patientNotes] of map.entries()) {
    // Sort oldest → newest for chart, newest first for lastSession
    const sorted = [...patientNotes].sort(
      (a, b) => noteDate(a).getTime() - noteDate(b).getTime()
    );
    const sessions = sorted.map(toSession);
    const lastSession = sessions[sessions.length - 1];

    groups.push({
      patientName: name,
      initials: getInitials(name),
      avatarColor: pickAvatarColor(name),
      lastSessionDate: lastSession.date,
      lastSessionLabel: `${lastSession.dateLabel} at ${lastSession.time}`,
      totalSessions: sessions.length,
      peakSeverity: peakSeverity(sessions),
      sessions,
    });
  }

  // Sort by most recently seen first
  groups.sort((a, b) => b.lastSessionDate.getTime() - a.lastSessionDate.getTime());
  return groups;
}

// ── External store ──

let cachedPatientSnapshot: PatientGroup[] | null = null;

registerInvalidator(() => { cachedPatientSnapshot = null; });

function getPatientSnapshot(): PatientGroup[] {
  if (!cachedPatientSnapshot) {
    cachedPatientSnapshot = buildPatientGroups(getAllNotes());
  }
  return cachedPatientSnapshot;
}

function getServerSnapshot(): PatientGroup[] {
  return [];
}

/** React hook — returns live patient groups from localStorage. */
export function usePatientGroups(): PatientGroup[] {
  return useSyncExternalStore(subscribe, getPatientSnapshot, getServerSnapshot);
}
