import { NextRequest, NextResponse } from "next/server";
import type { TranscribeResponse } from "@carenotes/shared";
import { randomUUID } from "crypto";
import { DeepgramClient } from "@deepgram/sdk";
import type { ListenV1Response, ListenV1AcceptedResponse } from "@deepgram/sdk";
import { maskSensitiveContent } from "@/lib/maskTranscript";

function isSyncResponse(
  response: ListenV1Response | ListenV1AcceptedResponse
): response is ListenV1Response {
  return "results" in response;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    console.error("[/api/transcribe] Missing DEEPGRAM_API_KEY environment variable");
    return NextResponse.json(
      { error: "Transcription service is not configured. Please contact support." },
      { status: 503 }
    );
  }

  const deepgram = new DeepgramClient({ apiKey });
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
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    const response = await deepgram.listen.v1.media.transcribeFile(
      audioBuffer,
      {
        model: "nova-2-medical",
        language: "en",
        smart_format: true,
      }
    );

    if (!isSyncResponse(response)) {
      // Deepgram returned an async (202 Accepted) response — only synchronous transcription is supported
      console.error("[/api/transcribe] Deepgram returned an async accepted response; async callbacks are not supported");
      return NextResponse.json(
        { error: "Transcription service returned an unexpected response. Please try again." },
        { status: 502 }
      );
    }

    const firstChannel = response.results.channels[0];
    const rawTranscript = firstChannel?.alternatives?.[0]?.transcript;
    if (rawTranscript === undefined) {
      console.error("[/api/transcribe] Deepgram sync response is missing expected transcript structure");
      return NextResponse.json(
        { error: "Transcription service returned an unexpected response. Please try again." },
        { status: 502 }
      );
    }
    transcript = rawTranscript.trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error("[/api/transcribe] Deepgram error:", message);
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
