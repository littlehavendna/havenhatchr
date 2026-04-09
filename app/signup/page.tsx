"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to create your account.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[34px] border border-[color:var(--line)] bg-[#2f2558] p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
              Private breeder workspace
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Create your HavenHatchr account
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/72">
              Start with a private breeder workspace where your flock records, customers, and
              orders stay isolated to your account.
            </p>
          </section>

          <section className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/88 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              New account
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName()}
                  placeholder="Little Haven Farm"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName()}
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClassName()}
                  placeholder="Use at least 8 characters"
                />
              </label>
              {error ? <p className="text-sm text-[#b34b75]">{error}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Sign Up"}
              </button>
            </form>
            <p className="mt-5 text-sm text-[color:var(--muted)]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-foreground">
                Log in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}
