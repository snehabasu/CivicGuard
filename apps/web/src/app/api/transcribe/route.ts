import { NextRequest, NextResponse } from "next/server";
import type { TranscribeResponse } from "@civicguard/shared";
import { randomUUID } from "crypto";
import Groq from "groq-sdk";
import { maskSensitiveContent } from "@/lib/maskTranscript";

/** Maps MIME type to a file extension Groq's Whisper API recognises. */
function getExtension(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mp3") || mimeType.includes("mpeg")) return "mp3";
  return "webm"; // covers audio/webm and audio/webm;codecs=opus
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const groq = new Groq(); // reads GROQ_API_KEY from process.env at request time

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

  // Rename to a proper extension so Groq can detect the audio format
  const ext = getExtension(audioFile.type);
  const renamedFile = new File([audioFile], `recording.${ext}`, { type: audioFile.type });

  let transcript: string;
  try {
    const result = await groq.audio.transcriptions.create({
      file: renamedFile,
      model: "whisper-large-v3-turbo",
      language: "en",
    });
    transcript = result.text.trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error("[/api/transcribe] Groq Whisper error:", message);
    return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
  }

  if (!transcript) {
    return NextResponse.json(
      { error: "No speech detected in the recording. Please try again." },
      { status: 422 }
    );
  }

  // Mask PII and legal-status terms before the transcript is stored or sent to Claude
  const { masked, redactionCount } = maskSensitiveContent(transcript);
  if (redactionCount > 0) {
    console.log(`[/api/transcribe] Masked ${redactionCount} sensitive term(s) in visitId=${visitId}`);
  }

  const body: TranscribeResponse = { visitId, transcript: masked, durationSeconds };
  return NextResponse.json(body);
}
