"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

async function readJsonSafely<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");
    setResetUrl("");

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await readJsonSafely<{
        error?: string;
        message?: string;
        resetUrl?: string;
      }>(response);

      if (!response.ok) {
        throw new Error(payload.error || "Unable to request password reset.");
      }

      setMessage(payload.message || "If that email has an account, a reset link will be sent.");
      setResetUrl(payload.resetUrl || "");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to request password reset.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <section className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/88 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Password reset
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Reset your HavenHatchr password
          </h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            Enter the email on your account and we will send a secure reset link if the account
            exists.
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
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                placeholder="you@example.com"
              />
            </label>

            {message ? <p className="text-sm leading-7 text-[color:var(--muted)]">{message}</p> : null}
            {resetUrl ? (
              <Link href={resetUrl} className="block text-sm font-semibold text-foreground">
                Open reset link
              </Link>
            ) : null}
            {error ? <p className="text-sm text-[#b34b75]">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-5 inline-flex text-sm font-semibold text-foreground"
          >
            Back to login
          </Link>
        </section>
      </div>
    </div>
  );
}
