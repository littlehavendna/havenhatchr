"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to log in.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to log in.");
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
              Sign in to HavenHatchr
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/72">
              Keep your birds, pairings, hatch groups, reservations, and analytics private to your
              breeder account.
            </p>
            <div className="mt-8 rounded-[26px] border border-white/12 bg-white/6 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
                Demo account
              </p>
              <p className="mt-3 text-sm leading-7 text-white/78">
                Email: <span className="font-semibold text-white">owner@havenhatchr.com</span>
              </p>
              <p className="text-sm leading-7 text-white/78">
                Password: <span className="font-semibold text-white">demo12345</span>
              </p>
            </div>
          </section>

          <section className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/88 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Welcome back
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName()}
                  placeholder="owner@havenhatchr.com"
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
                  placeholder="Enter your password"
                />
              </label>
              {error ? <p className="text-sm text-[#b34b75]">{error}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Log In"}
              </button>
            </form>
            <p className="mt-5 text-sm text-[color:var(--muted)]">
              Need an account?{" "}
              <Link href="/signup" className="font-semibold text-foreground">
                Sign up
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
