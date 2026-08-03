import { errorHandler } from "@/lib/error-handler"

export interface StorageQuotaInfo {
  usageBytes: number
  quotaBytes: number
  usagePercentage: number
}

export async function checkStorageQuota(): Promise<StorageQuotaInfo | null> {
  if (typeof navigator === "undefined" || !navigator.storage || !navigator.storage.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    const usage = estimate.usage || 0
    const quota = estimate.quota || 1

    const percentage = Math.round((usage / quota) * 100)

    if (percentage >= 80) {
      errorHandler.notify(
        "Storage Capacity Warning",
        `Local storage is at ${percentage}% capacity (${Math.round(usage / (1024 * 1024))}MB used of ${Math.round(quota / (1024 * 1024))}MB). Consider exporting and clearing space.`,
        "warning"
      )
    }

    return {
      usageBytes: usage,
      quotaBytes: quota,
      usagePercentage: percentage,
    }
  } catch (err) {
    console.warn("[QuotaMonitor] Storage estimate failed:", err)
    return null
  }
}
