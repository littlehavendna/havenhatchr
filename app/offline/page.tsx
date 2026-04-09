export default function OfflinePage() {
  return (
    <section className="soft-shadow rounded-[30px] border border-[color:var(--line)] bg-white/90 p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
        Offline Mode
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">You&apos;re offline right now</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
        HavenHatchr can show cached pages you&apos;ve already opened, but live breeder data updates,
        saves, and fresh API calls need an internet connection.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <article className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Cached Pages
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground">
            Previously visited screens can still open from local cache.
          </p>
        </article>
        <article className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            New Saves
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground">
            Form submissions and live changes will wait until you reconnect.
          </p>
        </article>
        <article className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Reconnect
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground">
            Refresh after reconnecting to pull current flock, hatch, and customer data.
          </p>
        </article>
      </div>
    </section>
  );
}
