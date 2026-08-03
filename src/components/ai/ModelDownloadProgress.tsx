import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  llmClient,
  AVAILABLE_LLM_MODELS,
  type LLMStatus,
  type LLMProgress,
} from "@/lib/ai/llm-client"
import { Cpu, Loader2, CheckCircle2, AlertTriangle, X, Download } from "lucide-react"

interface ModelDownloadProgressProps {
  modelId: string
  onClose?: () => void
}

export function ModelDownloadProgress({ modelId, onClose }: ModelDownloadProgressProps) {
  const [status, setStatus] = useState<LLMStatus>(llmClient.getStatus())
  const [progress, setProgress] = useState<LLMProgress>(llmClient.getProgress())
  const [errorMessage, setErrorMessage] = useState<string | null>(llmClient.getErrorMessage())

  const modelInfo = AVAILABLE_LLM_MODELS.find((m) => m.id === modelId) || {
    id: modelId,
    name: modelId,
    size: "Unknown size",
    description: "WebLLM Quantized Model",
  }

  useEffect(() => {
    const unsubStatus = llmClient.subscribeStatus((newStatus) => {
      setStatus(newStatus)
      setErrorMessage(llmClient.getErrorMessage())
    })

    const unsubProgress = llmClient.subscribeProgress((newProgress) => {
      setProgress(newProgress)
    })

    return () => {
      unsubStatus()
      unsubProgress()
    }
  }, [])

  const handleStartDownload = async () => {
    try {
      await llmClient.initLLM(modelId)
    } catch (err) {
      console.error("Failed to load model:", err)
    }
  }

  const handleCancel = async () => {
    await llmClient.unloadModel()
    if (onClose) onClose()
  }

  if (status === "idle") {
    return (
      <div className="survey-card p-4 rounded-sm border border-slate-line bg-ink/90 space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-brass" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-parchment">{modelInfo.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{modelInfo.size}</div>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono border-slate-line">
            Not Downloaded
          </Badge>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {modelInfo.description} Weights will be cached in browser storage for offline local
          inference.
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs font-mono text-muted-foreground hover:text-parchment"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs font-mono gap-1.5 bg-brass text-ink hover:bg-brass/90"
            onClick={handleStartDownload}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download & Load Model</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="survey-card p-4 rounded-sm border border-slate-line bg-ink space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center">
            {status === "ready" ? (
              <CheckCircle2 className="w-4 h-4 text-moss" />
            ) : status === "error" ? (
              <AlertTriangle className="w-4 h-4 text-oxblood" />
            ) : (
              <Loader2 className="w-4 h-4 text-brass animate-spin" />
            )}
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-parchment">{modelInfo.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{progress.stage}</div>
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-parchment"
            onClick={handleCancel}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Multi-Stage Progress Bar */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground truncate max-w-[200px]">
            {progress.text || "Preparing WebGPU pipeline..."}
          </span>
          <span className="text-brass font-bold">{progress.progress}%</span>
        </div>

        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden border border-slate-line/50">
          <div
            className="h-full bg-brass transition-all duration-300 ease-out"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {status === "error" && errorMessage && (
        <div className="p-2 rounded-sm bg-oxblood/10 border border-oxblood/30 text-[11px] text-oxblood font-mono leading-tight">
          Failed to load model: {errorMessage}
        </div>
      )}

      {status === "ready" && (
        <div className="flex items-center justify-between text-[10px] font-mono text-moss pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-moss" />
            Model ready & cached in IndexedDB
          </span>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] font-mono text-muted-foreground hover:text-parchment"
              onClick={onClose}
            >
              Dismiss
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
