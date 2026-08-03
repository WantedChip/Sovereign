import { useState, useEffect } from "react"
import { errorHandler, type AppError } from "@/lib/error-handler"
import { AlertTriangle, Info, AlertCircle, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ErrorToastContainer() {
  const [toasts, setToasts] = useState<AppError[]>([])

  useEffect(() => {
    const unsubscribe = errorHandler.subscribe((error) => {
      setToasts((prev) => [...prev, error])

      // Auto dismiss after 6 seconds if not critical
      if (error.severity !== "critical") {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== error.id))
        }, 6000)
      }
    })

    return unsubscribe
  }, [])

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isCritical = toast.severity === "critical"
        const isWarning = toast.severity === "warning"

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-md border shadow-xl font-mono text-xs flex items-start gap-3 animate-in slide-in-from-top-4 ${
              isCritical
                ? "bg-ink border-oxblood/80 text-oxblood shadow-oxblood/10"
                : isWarning
                  ? "bg-ink border-brass/60 text-brass shadow-brass/10"
                  : "bg-ink border-slate-line text-parchment"
            }`}
          >
            {isCritical ? (
              <AlertCircle className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4 text-brass shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-moss shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-1 min-w-0">
              <div className="font-bold text-[11px] uppercase tracking-wider">{toast.title}</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                {toast.message}
              </div>
              {toast.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.action?.onClick()
                    handleDismiss(toast.id)
                  }}
                  className="h-6 px-2 text-[10px] gap-1 mt-1 border-slate-line hover:border-brass"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{toast.action.label}</span>
                </Button>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDismiss(toast.id)}
              className="h-6 w-6 text-muted-foreground hover:text-parchment shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
