"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to log in.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setLoginError(submitError instanceof Error ? submitError.message : "Unable to log in.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSigningUp(true);
    setSignupError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to create your account.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setSignupError(
        submitError instanceof Error ? submitError.message : "Unable to create your account.",
      );
    } finally {
      setIsSigningUp(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[34px] border border-[color:var(--line)] bg-[#2f2558] p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
              New account
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Start your private breeder workspace
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/72">
              Create an account to keep your birds, pairings, hatch groups, customers, and orders
              isolated to your breeder operation.
            </p>
            <form onSubmit={handleSignupSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  Name
                </span>
                <input
                  type="text"
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                  className={inputClassName("dark")}
                  placeholder="Little Haven Farm"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  Email
                </span>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  className={inputClassName("dark")}
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  Password
                </span>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  className={inputClassName("dark")}
                  placeholder="Use at least 8 characters"
                />
              </label>
              {signupError ? <p className="text-sm text-[#ffb2cb]">{signupError}</p> : null}
              <button
                type="submit"
                disabled={isSigningUp}
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#2f2558] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSigningUp ? "Creating account..." : "Sign Up"}
              </button>
            </form>
            <p className="mt-5 text-sm text-white/72">
              Prefer a dedicated signup page?{" "}
              <Link href="/signup" className="font-semibold text-white">
                Open signup
              </Link>
            </p>
          </section>

          <section className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/88 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Welcome back
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Log in to HavenHatchr</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[color:var(--muted)]">
              Use your account credentials to access your private breeder workspace and internal
              tools.
            </p>
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Email
                </span>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  className={inputClassName("light")}
                  placeholder="owner@havenhatchr.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Password
                </span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  className={inputClassName("light")}
                  placeholder="Enter your password"
                />
              </label>
              {loginError ? <p className="text-sm text-[#b34b75]">{loginError}</p> : null}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoggingIn ? "Signing in..." : "Log In"}
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

function inputClassName(tone: "dark" | "light") {
  if (tone === "dark") {
    return "w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/35 focus:ring-2 focus:ring-white/15";
  }

  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}
