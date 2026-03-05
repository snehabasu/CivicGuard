"use client";

import { XIcon } from "./icons";
import { NoteCard } from "./NoteCard";
import { useNoteGroups } from "@/lib/useNoteGroups";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
};

export function ReviewSidebar({
  open,
  onClose,
  selectedNoteId,
  onSelectNote,
}: Props) {
  const noteGroups = useNoteGroups();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-dvh w-sidebar bg-white border-r border-surface-hover z-50
          flex flex-col flex-shrink-0
          transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-hover flex-shrink-0">
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-bold text-teal">Care</span>
            <span className="text-lg font-bold text-amber">Notes</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-surface-hover text-teal-dark/60"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Note history */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 min-h-0">
          {noteGroups.map((group) => (
            <section key={group.label}>
              <h3 className="text-xs font-semibold text-teal-dark/40 uppercase tracking-wider px-3 mb-1">
                {group.label}
              </h3>
              <div className="space-y-0.5">
                {group.notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onSelectNote(note.id);
                      // On mobile, also close sidebar
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full text-left rounded-lg transition-colors ${
                      selectedNoteId === note.id
                        ? "bg-teal-lighter"
                        : "hover:bg-surface-hover"
                    }`}
                  >
                    <NoteCard note={note} />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface-hover flex-shrink-0">
          <p className="text-[10px] text-teal-dark/40 leading-tight">
            AI output is always DRAFT — clinician review required before Epic
            entry.
          </p>
        </div>
      </aside>
    </>
  );
}
