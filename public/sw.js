// Service Worker for Dailishaw PWA
const CACHE_NAME = "dailishaw-v1";
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/user-dashboard",
  "/dashboard-logo.gif",
  "/manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silent fail - will cache on demand
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome extensions and external requests (except Supabase images)
  if (
    url.protocol === "chrome-extension:" ||
    (!url.origin.includes(self.location.origin) &&
      !url.hostname.includes("supabase.co"))
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      // Check if cached response exists
      if (cachedResponse) {
        // Get cache timestamp
        const cacheTime = await getCacheTimestamp(request.url);
        const now = Date.now();

        // If cache is still valid (less than 24 hours old), use it
        if (cacheTime && now - cacheTime < CACHE_EXPIRY_TIME) {
          // Fetch in background to update cache
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response.clone());
                  setCacheTimestamp(request.url, Date.now());
                });
              }
            })
            .catch(() => {
              // Network error, but we have cache
            });

          return cachedResponse;
        } else {
          // Cache expired, delete it
          await deleteFromCache(request.url);
        }
      }

      // No valid cache, fetch from network
      return fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          // Check if it's an image or important resource to cache
          const shouldCache =
            url.pathname.endsWith(".gif") ||
            url.pathname.endsWith(".png") ||
            url.pathname.endsWith(".jpg") ||
            url.pathname.endsWith(".jpeg") ||
            url.pathname.endsWith(".webp") ||
            url.pathname.endsWith(".svg") ||
            url.pathname.endsWith(".css") ||
            url.pathname.endsWith(".js") ||
            url.hostname.includes("supabase.co"); // Cache Supabase images

          if (shouldCache) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
              setCacheTimestamp(request.url, Date.now());
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached response if available (even if expired)
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page or error
          return new Response("Offline - Resource not available", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
    })
  );
});

// Helper functions for cache timestamp management
async function getCacheTimestamp(url) {
  try {
    const cache = await caches.open(`${CACHE_NAME}-timestamps`);
    const response = await cache.match(url);
    if (response) {
      const timestamp = await response.text();
      return parseInt(timestamp, 10);
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

async function setCacheTimestamp(url, timestamp) {
  try {
    const cache = await caches.open(`${CACHE_NAME}-timestamps`);
    await cache.put(
      url,
      new Response(timestamp.toString(), {
        headers: { "Content-Type": "text/plain" },
      })
    );
  } catch (error) {
    // Silent fail
  }
}

async function deleteFromCache(url) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(url);
    const timestampCache = await caches.open(`${CACHE_NAME}-timestamps`);
    await timestampCache.delete(url);
  } catch (error) {
    // Silent fail
  }
}

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_IMAGES") {
    const imageUrls = event.data.urls;
    cacheImages(imageUrls);
  }

  if (event.data && event.data.type === "CLEAR_OLD_CACHE") {
    clearExpiredCache();
  }
});

// Cache multiple images
async function cacheImages(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const timestamp = Date.now();

    await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response && response.status === 200) {
            await cache.put(url, response);
            await setCacheTimestamp(url, timestamp);
          }
        } catch (error) {
          // Silent fail for individual images
        }
      })
    );
  } catch (error) {
    // Silent fail
  }
}

// Clear expired cache entries
async function clearExpiredCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const timestampCache = await caches.open(`${CACHE_NAME}-timestamps`);
    const requests = await cache.keys();
    const now = Date.now();

    for (const request of requests) {
      const timestamp = await getCacheTimestamp(request.url);
      if (timestamp && now - timestamp >= CACHE_EXPIRY_TIME) {
        await cache.delete(request);
        await timestampCache.delete(request.url);
      }
    }
  } catch (error) {
    // Silent fail
  }
}
