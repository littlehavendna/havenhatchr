"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __havenHatchrOfflineListenersAdded?: boolean;
  }
}

export function OfflineProvider() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="px-3 pt-3 sm:px-5 sm:pt-4 lg:px-8">
      <div className="soft-shadow rounded-[24px] border border-[color:var(--line)] bg-[#fff4dc] px-4 py-3 text-sm text-[#7b5b14]">
        You&apos;re offline. HavenHatchr is showing cached pages where available, and new changes will
        need a connection.
      </div>
    </div>
  );
}
