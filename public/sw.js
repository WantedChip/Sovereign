// Sovereign Service Worker for offline-first PWA caching
const CACHE_NAMES = {
  appShell: "sovereign-app-shell-v1",
  modelWeights: "sovereign-model-weights-v1",
  staticAssets: "sovereign-static-assets-v1",
}

const PRECACHE_ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.svg"]

// Install event: Precache core app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.appShell)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event: Clean up old caches & claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Message listener for skipWaiting or manual cache updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests or browser extension requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return
  }

  // 1. Model Weights Cache-First strategy (HuggingFace CDN, MLC WebLLM weights, .bin, .onnx, .safetensors, .json tensor params)
  if (
    url.hostname.includes("huggingface.co") ||
    url.hostname.includes("cdn-lfs") ||
    url.pathname.includes("/wasm/") ||
    url.pathname.endsWith(".onnx") ||
    url.pathname.endsWith(".bin") ||
    url.pathname.endsWith(".safetensors")
  ) {
    event.respondWith(
      caches.open(CACHE_NAMES.modelWeights).then(async (cache) => {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
          return cachedResponse
        }
        try {
          const networkResponse = await fetch(request)
          if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        } catch (error) {
          console.error("[SW] Model fetch failed offline:", error)
          throw error
        }
      })
    )
    return
  }

  // 2. Static Assets Cache-First (fonts, icons, images, CSS/JS with hashes)
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.open(CACHE_NAMES.staticAssets).then(async (cache) => {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
          return cachedResponse
        }
        const networkResponse = await fetch(request)
        if (networkResponse.status === 200) {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      })
    )
    return
  }

  // 3. App Shell Stale-While-Revalidate (HTML & JS Bundle Navigation)
  event.respondWith(
    caches.open(CACHE_NAMES.appShell).then(async (cache) => {
      const cachedResponse = await cache.match(request)

      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        })
        .catch(() => {
          // If offline and no cache match for HTML navigation, return cached /index.html
          if (request.mode === "navigate") {
            return cache.match("/index.html")
          }
          return null
        })

      return cachedResponse || fetchPromise
    })
  )
})
