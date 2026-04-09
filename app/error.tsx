"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ErrorFallback } from "@/components/error-fallback";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.error(error);

    void fetch("/api/monitoring/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        pathname,
        component: "app/error",
      }),
    }).catch(() => undefined);
  }, [error, pathname]);

  return (
    <ErrorFallback
      title="This page hit an unexpected issue"
      description="The issue has been captured for review. You can try the page again without losing access to the rest of your workspace."
      onAction={reset}
    />
  );
}

