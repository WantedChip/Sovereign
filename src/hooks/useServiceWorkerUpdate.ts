import { useState, useEffect } from "react"

export function useServiceWorkerUpdate() {
  const [swWaiting, setSwWaiting] = useState<ServiceWorker | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setSwWaiting(newWorker)
                  setShowToast(true)
                }
              })
            }
          })
        })
        .catch((err) => {
          console.error("[SW] Registration error:", err)
        })

      let refreshing = false
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }
  }, [])

  const handleReload = () => {
    if (swWaiting) {
      swWaiting.postMessage({ type: "SKIP_WAITING" })
    } else {
      window.location.reload()
    }
    setShowToast(false)
  }

  const handleDismiss = () => {
    setShowToast(false)
  }

  return { showToast, handleReload, handleDismiss }
}
