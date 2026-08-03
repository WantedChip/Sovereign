import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { router } from "@/router"
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate"
import { UpdateToast } from "@/components/ui/UpdateToast"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { ErrorToastContainer } from "@/components/ui/ErrorToastContainer"
import { checkStorageQuota } from "@/lib/storage/quota-monitor"

export default function App() {
  const { showToast, handleReload, handleDismiss } = useServiceWorkerUpdate()

  useEffect(() => {
    checkStorageQuota()
  }, [])

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ErrorToastContainer />
      {showToast && <UpdateToast onReload={handleReload} onDismiss={handleDismiss} />}
    </ErrorBoundary>
  )
}
