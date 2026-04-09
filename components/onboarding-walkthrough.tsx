"use client";

import Link from "next/link";
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
    title: "Customers",
    href: "/customers",
    summary: "Store buyer details, notes, and relationship history in one place.",
    benefit: "Keeping customers organized makes reservations, orders, and follow-up much easier.",
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
    title: "Pairings",
    href: "/pairings",
    summary: "Pairings connect sire and dam records with goals and genetics planning.",
    benefit: "This is where you define breeding direction before eggs and chicks arrive.",
  },
  {
    title: "Hatch Groups",
    href: "/hatch-groups",
    summary: "Track incubator batches, eggs set, hatch results, and produced traits.",
    benefit: "This turns breeder plans into measurable hatch performance.",
  },
  {
    title: "Chicks",
    href: "/chicks",
    summary: "Log new chicks, their status, sex, color, and observed traits.",
    benefit: "Clear chick records make inventory, sales, and performance review much easier.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20193a]/45 px-4 backdrop-blur-sm">
      <div className="soft-shadow w-full max-w-3xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Guided Walkthrough
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Learn the breeder workflow in a few quick steps
            </h2>
          </div>
          <span className="rounded-full border border-[color:var(--line)] bg-[#fcfbff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {stepIndex + 1} of {walkthroughSteps.length}
          </span>
        </div>

        <div className="mt-6 rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {step.title}
              </p>
              <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">{step.summary}</p>
              <p className="mt-3 text-sm font-medium leading-7 text-foreground">{step.benefit}</p>
            </div>
            <Link
              href={step.href}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition hover:bg-[#f8f7fe]"
            >
              Open Section
            </Link>
          </div>
          {activeSection === step.title ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--teal)]">
              You are currently viewing this section
            </p>
          ) : null}
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#efeaf8]">
          <div
            className="h-full rounded-full bg-[color:var(--accent)] transition-all"
            style={{ width: `${((stepIndex + 1) / walkthroughSteps.length) * 100}%` }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => updateTutorial("skip")}
            disabled={isSubmitting}
            className="text-sm font-semibold text-[color:var(--muted)] transition hover:text-foreground disabled:opacity-70"
          >
            Skip Tutorial
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
              disabled={stepIndex === 0 || isSubmitting}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Back
            </button>
            {isLastStep ? (
              <button
                type="button"
                onClick={() => updateTutorial("complete")}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Finishing..." : "Finish"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.min(current + 1, walkthroughSteps.length - 1))}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
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
