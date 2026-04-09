"use client";

import { type FormEvent, useEffect, useState } from "react";

type FeedbackModalProps = {
  isOpen: boolean;
  pathname: string;
  onClose: () => void;
};

const feedbackTypes = [
  { value: "Bug", label: "Bug" },
  { value: "FeatureRequest", label: "Feature Request" },
  { value: "GeneralFeedback", label: "General Feedback" },
] as const;

export function FeedbackModal({ isOpen, pathname, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<(typeof feedbackTypes)[number]["value"]>("Bug");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setType("Bug");
      setMessage("");
      setError("");
      setSuccess("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      setError("Message is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          page: pathname,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit feedback.");
      }

      setSuccess("Feedback submitted.");
      setMessage("");
      setType("Bug");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to submit feedback.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
      <div className="soft-shadow w-full max-w-xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Feedback</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Send a bug report, feature request, or general feedback from inside the app.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Type
            </span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as (typeof feedbackTypes)[number]["value"])}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            >
              {feedbackTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Message
            </span>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setError("");
                setSuccess("");
              }}
              rows={6}
              placeholder="What happened, what you expected, or what you'd like added."
              className="w-full resize-none rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            />
          </label>

          <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-3 text-sm text-[color:var(--muted)]">
            Captured page: <span className="font-semibold text-foreground">{pathname}</span>
          </div>

          {error ? <p className="text-sm text-[#b34b75]">{error}</p> : null}
          {success ? <p className="text-sm text-[color:var(--teal)]">{success}</p> : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
