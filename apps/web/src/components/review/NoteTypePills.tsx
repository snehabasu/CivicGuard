"use client";

import { ChevronDownIcon } from "../icons";

export type NoteType =
  | "soap"
  | "narrative"
  | "psychosocial"
  | "flags"
  | "boundaries"
  | "icd"
  | "followup";

const PILLS: { type: NoteType; label: string }[] = [
  { type: "soap", label: "SOAP" },
  { type: "narrative", label: "Narrative" },
  { type: "psychosocial", label: "Psychosocial" },
  { type: "flags", label: "Flags" },
  { type: "boundaries", label: "Boundaries" },
  { type: "icd", label: "ICD Codes" },
  { type: "followup", label: "Next Session" },
];

type Props = {
  active: NoteType;
  onChange: (type: NoteType) => void;
};

export function NoteTypePills({ active, onChange }: Props) {
  const activeLabel = PILLS.find((p) => p.type === active)?.label ?? "SOAP";

  return (
    <>
      {/* Mobile / narrow: dropdown */}
      <div className="md:hidden relative">
        <select
          value={active}
          onChange={(e) => onChange(e.target.value as NoteType)}
          className="w-full appearance-none bg-surface-card text-teal-dark text-sm font-medium rounded-lg px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-teal/30"
        >
          {PILLS.map(({ type, label }) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-teal-dark/40"
        />
      </div>

      {/* Desktop: scrollable pill row */}
      <div className="hidden md:flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {PILLS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === type
                ? "bg-teal text-white"
                : "bg-surface-card text-teal-dark/60 hover:text-teal-dark/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
