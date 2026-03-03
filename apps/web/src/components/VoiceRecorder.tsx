"use client";

import { useState } from "react";
import { MicIcon } from "./icons";
import { RecordingSheet } from "./RecordingSheet";

type Props = {
  visitId: string;
  onTranscriptReady: (visitId: string, transcript: string, patientName: string) => void;
  isProcessing?: boolean;
  processingError?: string | null;
  onDismissError?: () => void;
};

export function VoiceRecorder({
  visitId,
  onTranscriptReady,
  isProcessing,
  processingError,
  onDismissError,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  // Processing / error states still display inline on the pill
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center gap-4 rounded-full px-5 py-3 shadow-lg border border-black/5 bg-surface-card">
        <div className="flex items-center gap-3 px-2">
          <div className="w-5 h-5 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-teal-dark/60">
            Generating documentation...
          </span>
        </div>
      </div>
    );
  }

  if (processingError) {
    return (
      <div className="flex items-center justify-center gap-4 rounded-full px-5 py-3 shadow-lg border border-black/5 bg-red-50">
        <div className="flex items-center gap-3 px-2">
          <p className="text-sm text-red-600 max-w-xs text-center">
            {processingError}
          </p>
          <button
            className="text-sm font-medium text-teal underline flex-shrink-0"
            onClick={onDismissError}
          >
            Record again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Idle pill */}
      <button
        onClick={() => setSheetOpen(true)}
        className="flex items-center justify-center gap-4 rounded-full px-5 py-3 shadow-lg border border-black/5 cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 bg-surface-card"
      >
        <div className="w-12 h-12 bg-teal text-white rounded-full flex items-center justify-center shadow-md">
          <MicIcon size={24} />
        </div>
        <span className="text-sm text-teal-dark/50">Record a visit note</span>
      </button>

      {/* Recording bottom sheet */}
      <RecordingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        visitId={visitId}
        onTranscriptReady={onTranscriptReady}
      />
    </>
  );
}
