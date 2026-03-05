import type { StoredNote } from "./noteStorage";
import { _setInvalidate } from "./noteStorage";

// ── Avatar helpers ──

export const AVATAR_COLORS = [
  "bg-teal-light",
  "bg-amber",
  "bg-teal",
  "bg-surface-hover",
  "bg-teal-lighter",
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function pickAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Date helpers ──

export function noteDate(n: StoredNote): Date {
  if (n.isDraft) return new Date(n.generatedAtIso);
  return new Date(n.approvedAtIso);
}

export function formatTime(d: Date): string {
  return d
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
}

export function groupLabel(d: Date): string {
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

// ── Shared store bus ──
// Both useNoteGroups and usePatientGroups subscribe to this so both invalidate
// together whenever noteStorage.saveNote / deleteNote fires.

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Hooks register cache-clearers here so stale snapshots are wiped before
// React re-renders (getSnapshot must return fresh data after a notification).
const invalidators = new Set<() => void>();
export function registerInvalidator(fn: () => void): void {
  invalidators.add(fn);
}

export function invalidateAll(): void {
  invalidators.forEach((fn) => fn()); // clear cached snapshots first
  listeners.forEach((l) => l());      // then notify React
}

// Wire up so noteStorage.saveNote/deleteNote auto-invalidate all subscribers.
_setInvalidate(invalidateAll);
