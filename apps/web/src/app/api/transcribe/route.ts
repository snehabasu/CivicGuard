import { NextRequest, NextResponse } from "next/server";
import type { TranscribeResponse } from "@civicguard/shared";
import { randomUUID } from "crypto";
import OpenAI from "openai";

const openai = new OpenAI(); // reads OPENAI_API_KEY from process.env

export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio") as File | null;
  if (!audioFile || audioFile.size === 0) {
    return NextResponse.json({ error: "No audio file received" }, { status: 400 });
  }

  const visitId =
    (formData.get("visitId") as string | null) ?? `visit_${randomUUID()}`;

  const durationSeconds = Math.max(1, Math.round(audioFile.size / 16000));

  let transcript: string;
  try {
    const result = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });
    transcript = result.text.trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error("[/api/transcribe] Whisper error:", message);
    return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
  }

  if (!transcript) {
    return NextResponse.json(
      { error: "No speech detected in the recording. Please try again." },
      { status: 422 }
    );
  }

  const body: TranscribeResponse = { visitId, transcript, durationSeconds };
  return NextResponse.json(body);
}
