"use client";

type Props = {
  transcript: string;
};

export function ContextTab({ transcript }: Props) {
  return (
    <div className="bg-white rounded-xl px-6 py-5">
      <h3 className="text-sm font-semibold text-teal-dark mb-3">Transcript</h3>
      {transcript.trim() ? (
        <p className="text-sm text-teal-dark leading-relaxed whitespace-pre-wrap m-0">
          {transcript}
        </p>
      ) : (
        <p className="text-sm text-teal-dark/40 italic m-0">
          No transcript available for this visit.
        </p>
      )}
    </div>
  );
}
