import { useSyncExternalStore } from "react";
import type { MockNote, NoteGroup } from "./mockNotes";
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

function deriveTags(n: StoredNote): string[] {
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

function buildGroups(notes: StoredNote[]): NoteGroup[] {
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

// ── External store ──

let cachedSnapshot: NoteGroup[] | null = null;

// Register cache-clearer with the shared bus
registerInvalidator(() => { cachedSnapshot = null; });

function getSnapshot(): NoteGroup[] {
  if (!cachedSnapshot) {
    cachedSnapshot = buildGroups(getAllNotes());
  }
  return cachedSnapshot;
}

function getServerSnapshot(): NoteGroup[] {
  return [];
}

/** React hook — returns live, grouped note list from localStorage. */
export function useNoteGroups(): NoteGroup[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
