"use client";

import { createSupabaseBrowserClient } from "./supabaseClient";
import { saveNotesBatch } from "./noteStorage";
import type { StoredNote } from "./noteStorage";

/**
 * Pulls all notes for the logged-in user from Supabase and hydrates localStorage.
 * Returns the count of notes synced, or null if not authenticated.
 */
export async function pullNotesFromSupabase(): Promise<number | null> {
  const supabase = createSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("case_notes")
    .select("data")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[noteSync] pullNotesFromSupabase error:", error.message);
    return null;
  }

  const notes: StoredNote[] = (data ?? []).map((row) => row.data as StoredNote);
  saveNotesBatch(notes);
  return notes.length;
}
