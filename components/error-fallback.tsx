"use client";

type ErrorFallbackProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorFallback({
  title,
  description,
  actionLabel = "Try again",
  onAction,
}: ErrorFallbackProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Something went wrong
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
          {description}
        </p>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
          >
            {actionLabel}
          </button>
        ) : null}
      </section>
    </div>
  );
}

