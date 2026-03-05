import type { FullCaseNote, ApprovedCaseNote } from "@carenotes/shared";

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

export function saveNotesBatch(incoming: StoredNote[]): void {
  const notes = getAllNotes();

  // Build an index of existing notes by visitId to avoid repeated linear scans.
  const indexByVisitId = new Map<string, number>();
  for (let i = 0; i < notes.length; i++) {
    indexByVisitId.set(notes[i].visitId, i);
  }

  for (const note of incoming) {
    const existingIndex = indexByVisitId.get(note.visitId);
    if (existingIndex !== undefined) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
      indexByVisitId.set(note.visitId, notes.length - 1);
    }
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
