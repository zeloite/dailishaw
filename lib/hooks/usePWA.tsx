"use client";

import { useEffect, useState } from "react";

export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial status
    setIsOnline(navigator.onLine);

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return {
    isOnline,
    isInstallable,
    installPWA,
  };
}

// Hook to preload and cache images
export function useImagePreloader(imageUrls: string[]) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  useEffect(() => {
    if (imageUrls.length === 0) return;

    preloadImages(imageUrls);
  }, [imageUrls]);

  const preloadImages = async (urls: string[]) => {
    setIsPreloading(true);
    setPreloadProgress(0);

    try {
      // Send message to service worker to cache images
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CACHE_IMAGES",
          urls: urls,
        });
      }

      // Also preload in browser
      let loaded = 0;
      await Promise.all(
        urls.map((url) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              loaded++;
              setPreloadProgress(Math.round((loaded / urls.length) * 100));
              resolve(true);
            };
            img.onerror = () => {
              loaded++;
              setPreloadProgress(Math.round((loaded / urls.length) * 100));
              resolve(false);
            };
            img.src = url;
          });
        })
      );
    } catch (error) {
      console.error("Error preloading images:", error);
    } finally {
      setIsPreloading(false);
    }
  };

  const clearOldCache = () => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CLEAR_OLD_CACHE",
      });
    }
  };

  return {
    isPreloading,
    preloadProgress,
    preloadImages,
    clearOldCache,
  };
}
