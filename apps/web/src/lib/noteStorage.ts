import type { FullCaseNote, ApprovedCaseNote } from "@civicguard/shared";

export type StoredNote = FullCaseNote | ApprovedCaseNote;

const STORAGE_KEY = "caseNotes";

// Lazy-loaded invalidation to avoid circular imports
let _invalidate: (() => void) | null = null;
export function _setInvalidate(fn: () => void): void {
  _invalidate = fn;
}
function notifyChange(): void {
  _invalidate?.();
}

export function getAllNotes(): StoredNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredNote[]) : [];
  } catch {
    return [];
  }
}

export function getNoteById(visitId: string): StoredNote | null {
  return getAllNotes().find((n) => n.visitId === visitId) ?? null;
}

export function saveNote(note: StoredNote): void {
  const notes = getAllNotes();
  const idx = notes.findIndex((n) => n.visitId === note.visitId);
  if (idx >= 0) {
    notes[idx] = note;
  } else {
    notes.push(note);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  notifyChange();
}

export function deleteNote(visitId: string): void {
  const notes = getAllNotes().filter((n) => n.visitId !== visitId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  notifyChange();
}

export function clearAllNotes(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifyChange();
}
