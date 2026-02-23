import { NextRequest, NextResponse } from "next/server";
import type { TranscribeResponse } from "@civicguard/shared";
import { randomUUID } from "crypto";

/**
 * POST /api/transcribe
 *
 * MVP: Returns a mock transcript. The audio blob is accepted to demonstrate
 * the real upload flow, but transcription is simulated.
 *
 * Production swap-in: replace the DEMO_TRANSCRIPT constant with a call to
 * OpenAI Whisper or Amazon Transcribe Medical using the uploaded audio blob.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio") as File | null;
  const visitId =
    (formData.get("visitId") as string | null) ?? `visit_${randomUUID()}`;

  // Rough duration estimate from file size (audio/webm ~16KB/s at low bitrate)
  const durationSeconds = audioFile
    ? Math.max(1, Math.round(audioFile.size / 16000))
    : 0;

  // Demo transcript — replace with real STT in production
  const DEMO_TRANSCRIPT =
    "I just finished meeting with the family. The caregiver was feeling overwhelmed and " +
    "stressed about the bills piling up and mentioned the kids have been missing school. " +
    "There's no immediate safety concern but she said she panicked last week when the " +
    "utilities were shut off. She has some support from her sister but feels isolated " +
    "from other services. No history of substance use disclosed. Issues have been ongoing " +
    "for about six months since the job loss. I provided her with the emergency rental " +
    "assistance hotline and we are going to check in again within 72 hours.";

  const body: TranscribeResponse = {
    visitId,
    transcript: DEMO_TRANSCRIPT,
    durationSeconds,
    isMock: true,
  };

  return NextResponse.json(body);
}
