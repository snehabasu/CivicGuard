"use client";

import { FileTextIcon, FolderIcon, ShareIcon, HomeIcon, XIcon } from "./icons";

type Props = {
  open: boolean;
  onClose: () => void;
};

const navItems = [
  { label: "Home", icon: HomeIcon, active: true },
  { label: "My Notes", icon: FileTextIcon, active: false },
  { label: "Shared", icon: ShareIcon, active: false },
  { label: "Folders", icon: FolderIcon, active: false },
];

export function Sidebar({ open, onClose }: Props) {
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  item.active
                    ? "bg-teal-lighter text-teal"
                    : "text-teal-dark/60 hover:bg-surface-hover hover:text-teal-dark"
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

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
