export default function SettingsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-3 text-base text-[color:var(--muted)]">
          Settings coming soon.
        </p>
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Future Configuration Areas
        </p>
        <div className="mt-5 grid gap-4">
          {[
            "Genetics and trait models",
            "AI assistant behavior and guardrails",
            "Customer messaging templates",
            "Analytics dashboards and retention windows",
            "Waitlist automation rules",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfaff] p-4 text-sm text-[color:var(--muted)]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
