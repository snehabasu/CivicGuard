"use client";

import { useRouter } from "next/navigation";
import type { MockNote } from "@/lib/mockNotes";

type Props = {
  note: MockNote;
};

export function NoteCard({ note }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/review?visitId=${note.visitId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-teal-dark/70 ${note.avatarColor}`}
      >
        {note.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-teal-dark truncate">
            {note.patientName}
          </p>
          {note.status === "draft" ? (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-700">
              Draft
            </span>
          ) : (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-green-100 text-green-700">
              Approved
            </span>
          )}
        </div>
        <p className="text-xs text-teal-dark/50 truncate mt-0.5">
          {note.time} &middot; {note.tags.join(", ")}
        </p>
      </div>
    </div>
  );
}
