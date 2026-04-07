"use client";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel soft-shadow flex items-center justify-between rounded-[28px] border border-[color:var(--line)] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/80 text-[color:var(--muted)] md:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Poultry Breeder Management
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              HavenHatchr
            </h1>
          </div>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/80 text-sm font-semibold text-[color:var(--accent)]">
          HH
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  );
}
