import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function defaults(size = 20): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function MicIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

export function StopIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FileTextIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

export function FolderIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

export function SearchIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function ShareIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export function ChevronRightIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function MenuIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export function XIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function HomeIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function ChevronDownIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ClockIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function WandIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="m15 4-1.17 2.83L11 8l2.83 1.17L15 12l1.17-2.83L19 8l-2.83-1.17Z" />
      <path d="m2 22 10-10" />
      <path d="m8 8 2-2" />
      <path d="m17 17 2-2" />
    </svg>
  );
}

export function PaperclipIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57a4 4 0 1 1 5.66 5.66l-8.58 8.58a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function ChevronLeftIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function CopyIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function CheckIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
