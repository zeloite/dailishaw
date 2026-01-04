"use client";

import { useEffect } from "react";

export default function PWAInitializer() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check for updates periodically (every hour)
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Check for updates on page load
          registration.update();
        })
        .catch(() => {
          // Silent fail
        });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }, []);

  return null;
}
