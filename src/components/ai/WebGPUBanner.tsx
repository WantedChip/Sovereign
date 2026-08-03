import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { detectWebGPU, getRecommendedModel, type WebGPUCapabilities } from "@/lib/ai/webgpu-detect"
import { CheckCircle2, AlertTriangle, X, HelpCircle } from "lucide-react"

interface WebGPUBannerProps {
  onDismiss?: () => void
  showDetailsAlways?: boolean
}

export function WebGPUBanner({ onDismiss, showDetailsAlways = false }: WebGPUBannerProps) {
  const [caps, setCaps] = useState<WebGPUCapabilities | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [showInfo, setShowInfo] = useState(showDetailsAlways)

  useEffect(() => {
    let isMounted = true
    async function runDetect() {
      const res = await detectWebGPU()
      if (isMounted) {
        setCaps(res)
        setLoading(false)
      }
    }
    runDetect()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading || dismissed) return null

  const isSupported = caps?.supported ?? false
  const recommendation = caps ? getRecommendedModel(caps) : null

  const handleDismiss = () => {
    setDismissed(true)
    if (onDismiss) onDismiss()
  }

  return (
    <div
      className={`p-3 rounded-sm border text-xs font-sans space-y-2 transition-all ${
        isSupported
          ? "bg-moss/10 border-moss/40 text-parchment"
          : "bg-amber-950/20 border-amber-600/40 text-parchment"
      }`}
    >
      <div className="flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          {isSupported ? (
            <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          )}

          <span className="font-bold text-xs">
            {isSupported ? "WebGPU Hardware Acceleration Active" : "WebGPU Not Supported"}
          </span>

          <Badge variant={isSupported ? "moss" : "outline"} className="text-[9px] px-1.5 py-0">
            {isSupported ? "WebGPU" : "WASM Fallback"}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-parchment"
            onClick={() => setShowInfo(!showInfo)}
            title="Toggle WebGPU Details"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </Button>

          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-parchment"
              onClick={handleDismiss}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {isSupported
          ? recommendation?.reason
          : "Local LLM inference requires browser WebGPU support. Hybrid vector search and embeddings will run seamlessly using WASM fallback."}
      </p>

      {showInfo && caps && (
        <div className="pt-2 border-t border-slate-line/40 font-mono text-[10px] space-y-1 text-muted-foreground">
          {isSupported ? (
            <>
              <div className="flex justify-between">
                <span>GPU Device:</span>
                <span className="text-parchment font-semibold">{caps.adapterName}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated VRAM Tier:</span>
                <span className="text-brass font-semibold">~{caps.estimatedVRAMMB} MB</span>
              </div>
              <div className="flex justify-between">
                <span>LLM Status:</span>
                <span className="text-moss font-semibold">Ready for local WebLLM inference</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span>Error:</span>
                <span className="text-oxblood font-semibold">{caps.error}</span>
              </div>
              <div className="flex justify-between">
                <span>Vector Indexing:</span>
                <span className="text-moss font-semibold">Active via WASM Web Worker</span>
              </div>
              <div className="pt-1 text-[9px] italic">
                Tip: Enable WebGPU in chrome://flags or update display graphics drivers for local
                LLM acceleration.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
