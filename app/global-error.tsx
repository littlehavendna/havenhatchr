"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/error-fallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);

    void fetch("/api/monitoring/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        pathname: "global",
        component: "app/global-error",
      }),
    }).catch(() => undefined);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[color:var(--bg)] px-4 py-12 sm:px-6 lg:px-8">
        <ErrorFallback
          title="HavenHatchr hit a critical error"
          description="The issue has been recorded. Try again, and if the problem persists, check the health route and recent operational events from the admin console."
          onAction={reset}
        />
      </body>
    </html>
  );
}
