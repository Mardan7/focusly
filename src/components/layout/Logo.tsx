export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" className="text-white/10" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="8" stroke="currentColor" className="text-accent" strokeWidth="2" />
        <circle cx="16" cy="16" r="2.5" fill="currentColor" className="text-accent" />
      </svg>
      {compact ? null : (
        <span className="text-[15px] font-semibold tracking-[0.22em] text-text">FOCUSLY</span>
      )}
    </div>
  )
}
