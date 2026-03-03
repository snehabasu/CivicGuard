import { useSyncExternalStore } from "react";
import type { MockNote, NoteGroup } from "./mockNotes";
import { getAllNotes, _setInvalidate, type StoredNote } from "./noteStorage";

// ── Helpers ──

const AVATAR_COLORS = [
  "bg-teal-light",
  "bg-amber",
  "bg-teal",
  "bg-surface-hover",
  "bg-teal-lighter",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pickAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function noteDate(n: StoredNote): Date {
  if (n.isDraft) return new Date(n.generatedAtIso);
  return new Date(n.approvedAtIso);
}

function formatTime(d: Date): string {
  return d
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
}

function deriveTags(n: StoredNote): string[] {
  // Use the first 2-3 stress flag keywords as tags
  if (n.stressFlags.length > 0) {
    return n.stressFlags.slice(0, 3).map((f) => f.keyword);
  }
  return [];
}

function toMockNote(n: StoredNote): MockNote {
  const name = n.patientName || "Unknown Client";
  return {
    id: n.visitId,
    visitId: n.visitId,
    patientName: name,
    initials: getInitials(name),
    avatarColor: pickAvatarColor(name),
    time: formatTime(noteDate(n)),
    tags: deriveTags(n),
    status: n.isDraft ? "draft" : "approved",
  };
}

function groupLabel(d: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const noteDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (noteDay.getTime() === today.getTime()) return "Today";
  if (noteDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function buildGroups(notes: StoredNote[]): NoteGroup[] {
  // Sort newest first
  const sorted = [...notes].sort(
    (a, b) => noteDate(b).getTime() - noteDate(a).getTime()
  );

  const map = new Map<string, MockNote[]>();
  for (const n of sorted) {
    const label = groupLabel(noteDate(n));
    const list = map.get(label) ?? [];
    list.push(toMockNote(n));
    map.set(label, list);
  }

  return Array.from(map.entries()).map(([label, notes]) => ({ label, notes }));
}

// ── External store for reactivity across components ──

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedSnapshot: NoteGroup[] | null = null;

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): NoteGroup[] {
  if (!cachedSnapshot) {
    cachedSnapshot = buildGroups(getAllNotes());
  }
  return cachedSnapshot;
}

function getServerSnapshot(): NoteGroup[] {
  return [];
}

/** Call after saving / deleting a note to refresh all subscribers. */
export function invalidateNoteGroups(): void {
  cachedSnapshot = null;
  listeners.forEach((l) => l());
}

// Wire up so noteStorage.saveNote/deleteNote auto-invalidate
_setInvalidate(invalidateNoteGroups);

/** React hook — returns live, grouped note list from localStorage. */
export function useNoteGroups(): NoteGroup[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
