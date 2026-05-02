"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __havenHatchrOfflineListenersAdded?: boolean;
  }
}

export function OfflineProvider() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    const syncOnlineStatus = () => setIsOnline(isLocalhost ? true : navigator.onLine);
    window.setTimeout(syncOnlineStatus, 0);

    if ("serviceWorker" in navigator && (process.env.NODE_ENV !== "production" || isLocalhost)) {
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      );
      if ("caches" in window) {
        void caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
      }
    } else if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    window.addEventListener("online", syncOnlineStatus);
    window.addEventListener("offline", syncOnlineStatus);

    return () => {
      window.removeEventListener("online", syncOnlineStatus);
      window.removeEventListener("offline", syncOnlineStatus);
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
