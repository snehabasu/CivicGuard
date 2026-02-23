"use client";

import { useState, useRef, useCallback } from "react";

type RecorderState =
  | "idle"
  | "recording"
  | "stopped"
  | "uploading"
  | "done"
  | "error";

type Props = {
  visitId: string;
  onTranscriptReady: (visitId: string, transcript: string) => void;
};

/**
 * Detect best supported audio MIME type in priority order.
 * iOS Safari (14.3+) only supports audio/mp4.
 * Android Chrome supports audio/webm;codecs=opus.
 */
function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus", // Android Chrome — best quality/size
    "audio/webm", // Chrome fallback
    "audio/mp4", // iOS Safari 14.3+
    "audio/ogg;codecs=opus", // Firefox desktop
    "audio/ogg", // Firefox fallback
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return ""; // Let the browser choose
}

const btn: React.CSSProperties = {
  padding: "0.6rem 1.2rem",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "1rem",
};

export function VoiceRecorder({ visitId, onTranscriptReady }: Props) {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    setDurationSec(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(
        "Microphone access denied. Please allow microphone permission and try again."
      );
      setState("error");
      return;
    }

    streamRef.current = stream;
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined
    );

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);

      const blob = new Blob(chunksRef.current, {
        type: mimeType || recorder.mimeType || "audio/webm",
      });

      setState("uploading");
      await uploadAudio(blob);
    };

    mediaRecorderRef.current = recorder;
    recorder.start(250); // collect chunks every 250ms
    setState("recording");

    timerRef.current = setInterval(
      () => setDurationSec((s) => s + 1),
      1000
    );
  }, [visitId]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setState("stopped");
  }, []);

  const uploadAudio = async (blob: Blob) => {
    const form = new FormData();
    form.append("audio", blob, "recording.audio");
    form.append("visitId", visitId);

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Transcription failed: HTTP ${res.status}`);
      const data = await res.json();
      setState("done");
      onTranscriptReady(data.visitId, data.transcript);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setState("error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {state === "idle" && (
        <button
          style={{ ...btn, background: "#2563eb", color: "#fff" }}
          onClick={startRecording}
        >
          Start Recording
        </button>
      )}

      {state === "recording" && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ef4444",
              animation: "pulse 1s infinite",
            }}
          />
          <span>Recording... {durationSec}s</span>
          <button
            style={{ ...btn, background: "#dc2626", color: "#fff" }}
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        </div>
      )}

      {state === "uploading" && (
        <p style={{ color: "#6b7280" }}>Processing audio...</p>
      )}

      {state === "done" && (
        <p style={{ color: "#16a34a" }}>Transcription complete. Generating documentation...</p>
      )}

      {state === "error" && (
        <div>
          <p style={{ color: "#dc2626" }}>{error}</p>
          <button
            style={{ ...btn, background: "#f3f4f6", color: "#374151" }}
            onClick={() => { setState("idle"); setError(null); }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
