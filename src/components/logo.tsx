// Brand mark. Full mark >= 32px, small mark <= 24px (see brand/preview.html). Colours follow the theme tokens.
export function Logo({ size = 24 }: { size?: number }) {
  if (size <= 24) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <path d="M5 2h10l6 6v12a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 20V4.5A2.5 2.5 0 0 1 5 2Z" fill="var(--mark-1)" />
        <path d="M15 2v6h6Z" fill="var(--mark-2)" />
        <path d="M7 17.5 11 11.5l5.5 3.5" stroke="var(--mark-3)" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="17.5" r="1.75" fill="var(--mark-3)" />
        <circle cx="16.5" cy="15" r="1.75" fill="var(--mark-3)" />
        <circle cx="11" cy="11.5" r="3" fill="var(--mark-4)" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect x="10" y="4" width="30" height="36" rx="4" fill="var(--mark-2)" transform="rotate(8 25 22)" />
      <path d="M10 8h20l8 8v24a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" fill="var(--mark-1)" />
      <path d="M30 8v8h8Z" fill="var(--mark-2)" />
      <path d="M14 34 22 22l9 7" stroke="var(--mark-3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="34" r="3" fill="var(--mark-3)" />
      <circle cx="31" cy="29" r="3" fill="var(--mark-3)" />
      <circle cx="22" cy="22" r="5" fill="var(--mark-4)" />
    </svg>
  );
}
