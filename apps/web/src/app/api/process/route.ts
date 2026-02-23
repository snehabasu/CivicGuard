import { NextRequest, NextResponse } from "next/server";
import type { ProcessRequest } from "@civicguard/shared";
import { generateCaseNote } from "@/lib/claude";

/**
 * POST /api/process
 *
 * Accepts { visitId, transcript } and returns a FullCaseNote covering all 7 JTBDs:
 * 1. Narrative summary (Epic format)
 * 2. SOAP note with therapeutic intervention descriptions
 * 3. Psychosocial assessment (6 sections with confidence markers)
 * 4. High-stress / high-risk flags
 * 5. Documentation boundary enforcement (legal status omission, insurance phrasing)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: ProcessRequest;
  try {
    body = (await req.json()) as ProcessRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.visitId?.trim()) {
    return NextResponse.json({ error: "visitId is required" }, { status: 400 });
  }
  if (!body.transcript?.trim()) {
    return NextResponse.json(
      { error: "transcript is required" },
      { status: 400 }
    );
  }

  try {
    const note = await generateCaseNote(body);
    return NextResponse.json(note);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/process] error:", message);
    // Do not expose internal error details to the client in production
    return NextResponse.json(
      { error: "Failed to generate case note. Please try again." },
      { status: 500 }
    );
  }
}
