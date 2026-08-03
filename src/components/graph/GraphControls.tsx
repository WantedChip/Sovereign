import { Button } from "@/components/ui/button"
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, Network } from "lucide-react"

export interface GraphControlsProps {
  nodeCount: number
  edgeCount: number
  onFit: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetLayout: () => void
}

export function GraphControls({
  nodeCount,
  edgeCount,
  onFit,
  onZoomIn,
  onZoomOut,
  onResetLayout,
}: GraphControlsProps) {
  return (
    <>
      {/* Graph Stats Badge Overlay */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-ink/90 border border-slate-line/80 px-2 py-0.5 rounded-sm text-[10px] font-mono text-muted-foreground select-none">
        <Network className="w-3 h-3 text-brass" />
        <span>
          {nodeCount} {nodeCount === 1 ? "node" : "nodes"} • {edgeCount}{" "}
          {edgeCount === 1 ? "edge" : "edges"}
        </span>
      </div>

      {/* Graph Action Buttons Overlay */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-ink/90 border border-slate-line/80 p-1 rounded-sm shadow-md font-mono select-none">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-muted-foreground hover:text-brass"
          onClick={onFit}
          title="Fit to View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-muted-foreground hover:text-brass"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-muted-foreground hover:text-brass"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-muted-foreground hover:text-brass"
          onClick={onResetLayout}
          title="Reset Layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </>
  )
}
