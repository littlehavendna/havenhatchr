"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OnboardingWalkthroughProps = {
  pathname: string;
  isEnabled: boolean;
};

type WalkthroughStep = {
  title: string;
  href: string;
  summary: string;
  benefit: string;
};

const walkthroughSteps: WalkthroughStep[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    summary: "This is your command center for day-to-day breeder activity.",
    benefit: "Use it to spot what needs attention and see how your operation is moving.",
  },
  {
    title: "Flocks",
    href: "/flocks",
    summary: "Flocks group your breeders and chicks into practical working units.",
    benefit: "They anchor inventory, planning, and breeder organization from the start.",
  },
  {
    title: "Birds",
    href: "/birds",
    summary: "Bird profiles hold the breeder records that power the rest of the app.",
    benefit: "Once birds are in place, pairings, genetics, and performance tracking become much more useful.",
  },
  {
    title: "Chicks",
    href: "/chicks",
    summary: "Log new chicks, their status, sex, color, and observed traits.",
    benefit: "Clear chick records make inventory, sales, and performance review much easier.",
  },
  {
    title: "Hatch Groups",
    href: "/hatch-groups",
    summary: "Track incubator batches, eggs set, hatch results, and produced traits.",
    benefit: "This turns breeder plans into measurable hatch performance.",
  },
  {
    title: "Customers",
    href: "/customers",
    summary: "Store buyer details, notes, and relationship history in one place.",
    benefit: "Keeping customers organized makes reservations, orders, and follow-up much easier.",
  },
  {
    title: "Pairings",
    href: "/pairings",
    summary: "Pairings connect sire and dam records with goals and genetics planning.",
    benefit: "This is where you define breeding direction before eggs and chicks arrive.",
  },
  {
    title: "Reservations",
    href: "/reservations",
    summary: "Reservations capture demand before chicks are fully assigned.",
    benefit: "They help you match real customer demand against what your hatches can produce.",
  },
  {
    title: "Orders",
    href: "/orders",
    summary: "Orders connect customers, assigned chicks, pickup timing, and notes.",
    benefit: "They close the loop from reservation to fulfillment.",
  },
  {
    title: "Genetics",
    href: "/genetics",
    summary: "Review visual traits, carried traits, project tags, and breeder notes.",
    benefit: "This gives you a clearer picture of long-term breeding direction.",
  },
  {
    title: "AI Tools",
    href: "/ai",
    summary: "Use the AI workspace for listing drafts, note summaries, replies, and pairing ideas.",
    benefit: "These tools save time once your breeder data is in place.",
  },
  {
    title: "Settings",
    href: "/settings",
    summary: "Manage billing, access, and account-level actions here.",
    benefit: "You can also restart this tutorial whenever you want a fresh walkthrough.",
  },
];

export function OnboardingWalkthrough({
  pathname,
  isEnabled,
}: OnboardingWalkthroughProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEnabled) {
      setIsVisible(true);
      setStepIndex(0);
    } else {
      setIsVisible(false);
    }
  }, [isEnabled]);

  const step = walkthroughSteps[stepIndex];
  const isLastStep = stepIndex === walkthroughSteps.length - 1;
  const activeSection = useMemo(
    () => walkthroughSteps.find((entry) => pathname === entry.href)?.title ?? null,
    [pathname],
  );

  useEffect(() => {
    if (!isVisible || !step) {
      return;
    }

    if (pathname !== step.href) {
      router.push(step.href);
    }
  }, [isVisible, pathname, router, step]);

  async function updateTutorial(action: "complete" | "skip") {
    setIsSubmitting(true);

    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setIsVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isVisible || !step) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex w-full items-end justify-center px-3 pb-3 sm:inset-y-0 sm:right-0 sm:justify-end sm:px-6 sm:py-24 lg:px-8">
      <div className="pointer-events-auto soft-shadow mobile-safe-pb w-full max-w-sm rounded-[28px] border-2 border-[color:var(--teal)] bg-white/96 p-4 shadow-[0_24px_60px_rgba(18,102,97,0.18)] backdrop-blur-sm sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--teal)]">
              Guided Walkthrough
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Learn the workflow as you click through
            </h2>
          </div>
          <span className="rounded-full border border-[color:var(--teal)] bg-[color:var(--teal-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">
            {stepIndex + 1} of {walkthroughSteps.length}
          </span>
        </div>

        <div className="mt-5 rounded-[24px] border-2 border-[color:var(--teal)] bg-[linear-gradient(180deg,rgba(215,241,239,0.72),rgba(255,255,255,0.98))] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--teal)]">
                {step.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{step.summary}</p>
              <p className="mt-3 text-sm font-medium leading-7 text-foreground">{step.benefit}</p>
            </div>
            <Link
              href={step.href}
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-[color:var(--teal)] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)] transition hover:bg-[color:var(--teal-soft)]"
            >
              Open
            </Link>
          </div>
          {activeSection === step.title ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--teal)]">
              Auto-opened on this section
            </p>
          ) : null}
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[color:var(--teal-soft)]">
          <div
            className="h-full rounded-full bg-[color:var(--teal)] transition-all"
            style={{ width: `${((stepIndex + 1) / walkthroughSteps.length) * 100}%` }}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => updateTutorial("skip")}
            disabled={isSubmitting}
            className="text-left text-sm font-semibold text-[color:var(--muted)] transition hover:text-foreground disabled:opacity-70"
          >
            Skip Tutorial
          </button>
          <div className="flex gap-3">
            <button
              type="button"
            onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
            disabled={stepIndex === 0 || isSubmitting}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[color:var(--teal)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--teal)] transition hover:bg-[color:var(--teal-soft)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Back
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={() => updateTutorial("complete")}
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--teal)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f8c87] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Finishing..." : "Finish"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.min(current + 1, walkthroughSteps.length - 1))}
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--teal)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f8c87] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Next
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
