"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MicIcon, StopIcon, ChevronDownIcon, ClockIcon, XIcon } from "./icons";
import { AudioWaveform } from "./AudioWaveform";
import { mockPatients } from "@/lib/mockNotes";

type RecorderState =
  | "idle"
  | "recording"
  | "stopped"
  | "uploading"
  | "done"
  | "error";

type RecordingSheetProps = {
  open: boolean;
  onClose: () => void;
  visitId: string;
  onTranscriptReady: (visitId: string, transcript: string, patientName: string) => void;
};

const NOTE_TYPES = [
  "SOAP Note",
  "Psychological Assessment",
  "High-Stress / High-Risk Flags",
  "Legal Boundaries",
];

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function RecordingSheet({
  open,
  onClose,
  visitId,
  onTranscriptReady,
}: RecordingSheetProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Audio devices
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  // Patient search
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  // Note types
  const [selectedNoteTypes, setSelectedNoteTypes] = useState<string[]>([
    "SOAP Note",
  ]);

  // Context notes
  const [contextNotes, setContextNotes] = useState("");

  // Closing animation
  const [closing, setClosing] = useState(false);

  // Collected blobs across recording segments (supports resume)
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const patientInputRef = useRef<HTMLInputElement>(null);

  // Enumerate audio devices on mount
  useEffect(() => {
    if (!open) return;
    async function loadDevices() {
      try {
        // Need a brief getUserMedia call to get labeled devices
        const tempStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        tempStream.getTracks().forEach((t) => t.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setAvailableDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch {
        // Permission denied — we'll still show the sheet
      }
    }
    loadDevices();
  }, [open, selectedDeviceId]);

  // Close with animation
  const handleClose = useCallback(() => {
    if (state === "recording") return; // Don't close while recording
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  }, [state, onClose]);

  const startRecording = useCallback(
    async (resume = false) => {
      setError(null);
      chunksRef.current = [];
      if (!resume) {
        setDurationSec(0);
        setRecordedBlobs([]);
      }

      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
      };
      if (selectedDeviceId) {
        audioConstraints.deviceId = { exact: selectedDeviceId };
      }

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });
      } catch {
        setError(
          "Microphone access denied. Please allow microphone permission.",
        );
        setState("error");
        return;
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(
        mediaStream,
        mimeType ? { mimeType } : undefined,
      );

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setStream(null);
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, {
          type: mimeType || recorder.mimeType || "audio/webm",
        });

        setRecordedBlobs((prev) => [...prev, blob]);
        setState("stopped");
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setState("recording");

      timerRef.current = setInterval(() => setDurationSec((s) => s + 1), 1000);
    },
    [selectedDeviceId, visitId],
  );

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const confirmAndUpload = useCallback(async () => {
    if (recordedBlobs.length === 0) return;

    const patientName = selectedPatient || patientQuery.trim();
    if (!patientName) {
      setError("Please enter a patient name.");
      return;
    }
    if (selectedNoteTypes.length === 0) {
      setError("Please select at least one note type.");
      return;
    }

    const merged = new Blob(recordedBlobs, { type: recordedBlobs[0].type });
    setState("uploading");
    await uploadAudio(merged);
  }, [recordedBlobs, visitId, selectedPatient, patientQuery, selectedNoteTypes]);

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
      const patientName = selectedPatient || patientQuery.trim();
      onTranscriptReady(data.visitId, data.transcript, patientName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
      setState("error");
    }
  };

  const toggleNoteType = (type: string) => {
    setSelectedNoteTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const filteredPatients = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(patientQuery.toLowerCase()),
  );

  const isRecording = state === "recording";
  const isStopped = state === "stopped";
  const isUploading = state === "uploading";

  if (!open) return null;

  return (
    <div className="fixed inset-0 lg:left-[260px] z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 ${closing ? "animate-fade-out" : "animate-fade-in"}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`relative z-10 bg-white rounded-t-2xl max-h-[95vh] overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}
      >
        {/* Handle bar + close */}
        <div className="sticky top-0 bg-white rounded-t-2xl z-10 px-5 pt-3 pb-2 flex items-center justify-between">
          <div className="w-10 h-1 rounded-full bg-surface-hover mx-auto" />
          <button
            onClick={handleClose}
            className="absolute right-4 top-3 p-1.5 rounded-full hover:bg-surface-hover text-teal-dark/50"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Audio source picker */}
          <div>
            <label className="text-xs font-medium text-teal-dark/50 uppercase tracking-wider mb-1.5 block">
              Audio Source
            </label>
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                disabled={isRecording}
                className="w-full appearance-none bg-surface-card rounded-lg px-4 py-2.5 pr-10 text-sm text-teal-dark outline-none focus:ring-2 focus:ring-teal/30 disabled:opacity-50"
              >
                {availableDevices.length === 0 && (
                  <option value="">No microphones found</option>
                )}
                {availableDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-dark/40 pointer-events-none"
              />
            </div>
          </div>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={
                isRecording
                  ? stopRecording
                  : isStopped
                    ? () => startRecording(true)
                    : () => startRecording(false)
              }
              disabled={isUploading}
              className="relative flex items-center justify-center"
            >
              {isRecording && (
                <div
                  className="absolute rounded-full bg-red-400 animate-pulse-ring"
                  style={{ width: 96, height: 96 }}
                />
              )}
              <div
                className={`
                  relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg
                  transition-all duration-200
                  ${isRecording ? "bg-red-500 text-white" : "bg-teal-dark text-white"}
                  ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
                `}
              >
                {isRecording ? (
                  <StopIcon size={28} />
                ) : isUploading ? (
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MicIcon size={32} />
                )}
              </div>
            </button>

            {/* Waveform when recording */}
            {isRecording && stream && (
              <div className="h-8">
                <AudioWaveform stream={stream} />
              </div>
            )}

            {/* Timer row */}
            <div className="flex items-center gap-2">
              <ClockIcon size={14} className="text-teal-dark/40" />
              <span className="text-sm font-mono text-teal-dark/60 tabular-nums">
                {formatDuration(durationSec)}
              </span>
              {isRecording && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>

            {/* Paused hint */}
            {isStopped && (
              <p className="text-xs text-teal-dark/40">
                Tap mic to resume recording
              </p>
            )}
          </div>

          {/* Error display */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Patient name searchable dropdown */}
          <div>
            <label className="text-xs font-medium text-teal-dark/50 uppercase tracking-wider mb-1.5 block">
              Patient Name
            </label>
            <div className="relative">
              <input
                ref={patientInputRef}
                type="text"
                value={selectedPatient || patientQuery}
                onChange={(e) => {
                  setPatientQuery(e.target.value);
                  setSelectedPatient("");
                  setPatientDropdownOpen(true);
                }}
                onFocus={() => setPatientDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(() => setPatientDropdownOpen(false), 150)
                }
                placeholder="Search patient..."
                className="w-full bg-surface-card rounded-lg px-4 py-2.5 text-sm text-teal-dark placeholder:text-teal-dark/30 outline-none focus:ring-2 focus:ring-teal/30"
              />
              {patientDropdownOpen && filteredPatients.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-surface-hover z-20 max-h-40 overflow-y-auto">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-teal-dark hover:bg-surface-hover flex items-center gap-2"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedPatient(p.name);
                        setPatientQuery("");
                        setPatientDropdownOpen(false);
                      }}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-teal-dark/70 ${p.avatarColor}`}
                      >
                        {p.initials}
                      </span>
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note type chips */}
          <div>
            <label className="text-xs font-medium text-teal-dark/50 uppercase tracking-wider mb-2 block">
              Note Type
            </label>
            <div className="flex flex-wrap gap-2">
              {NOTE_TYPES.map((type) => {
                const selected = selectedNoteTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleNoteType(type)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                      ${
                        selected
                          ? "bg-teal text-white"
                          : "bg-surface-card text-teal-dark/60 border border-surface-hover"
                      }
                    `}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context textarea */}
          <div>
            <label className="text-xs font-medium text-teal-dark/50 uppercase tracking-wider mb-1.5 block">
              Add Context
            </label>
            <textarea
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Add notes you'd like the transcription to..."
              rows={3}
              className="w-full bg-surface-card rounded-lg px-4 py-2.5 text-sm text-teal-dark placeholder:text-teal-dark/30 outline-none focus:ring-2 focus:ring-teal/30 resize-none"
            />
          </div>

          {/* Confirm button — visible once at least one segment has been recorded */}
          {(isStopped || isUploading) && (
            <button
              onClick={confirmAndUpload}
              disabled={isUploading}
              className={`
                w-full py-3 rounded-full text-sm font-medium shadow-md transition-all
                ${isUploading ? "bg-teal/60 text-white/80 cursor-not-allowed" : "bg-teal text-white active:scale-[0.98]"}
              `}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Confirm & Generate Note"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
