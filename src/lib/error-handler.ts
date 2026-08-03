export type ErrorSeverity = "info" | "warning" | "error" | "critical"

export interface AppError {
  id: string
  title: string
  message: string
  severity: ErrorSeverity
  timestamp: number
  action?: {
    label: string
    onClick: () => void
  }
}

type ErrorListener = (error: AppError) => void

class ErrorHandler {
  private listeners: Set<ErrorListener> = new Set()

  subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  notify(
    title: string,
    message: string,
    severity: ErrorSeverity = "error",
    action?: { label: string; onClick: () => void }
  ) {
    const error: AppError = {
      id: crypto.randomUUID(),
      title,
      message,
      severity,
      timestamp: Date.now(),
      action,
    }

    console.error(`[ErrorHandler] [${severity.toUpperCase()}] ${title}: ${message}`)
    this.listeners.forEach((listener) => listener(error))
  }

  handleStorageError(err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes("QuotaExceededError") || message.includes("quota")) {
      this.notify(
        "Storage Quota Exceeded",
        "Local IndexedDB storage is full. Please delete or export older notes.",
        "critical"
      )
    } else {
      this.notify("Storage Error", "Failed to access local database or OPFS storage.", "error")
    }
  }

  handleAIError(err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes("WebGPU") || message.includes("GPU")) {
      this.notify(
        "WebGPU Acceleration Unavailable",
        "Falling back to CPU WASM mode for semantic vector search.",
        "warning"
      )
    } else {
      this.notify(
        "AI Engine Error",
        message || "An unexpected error occurred in the AI pipeline.",
        "error"
      )
    }
  }

  handleNetworkError(err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    this.notify(
      "Network / Peer Disconnection",
      message || "Lost WebRTC peer connection. Auto-reconnecting...",
      "warning"
    )
  }
}

export const errorHandler = new ErrorHandler()
