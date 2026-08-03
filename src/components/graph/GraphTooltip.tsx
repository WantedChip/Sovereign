import { FileText, Link, Compass, Clock, AlignLeft } from "lucide-react"

export interface TooltipData {
  title: string
  wordCount?: number
  updatedAt?: Date
  degree: number
  isUnresolved: boolean
  x: number
  y: number
}

export interface GraphTooltipProps {
  data: TooltipData | null
}

export function GraphTooltip({ data }: GraphTooltipProps) {
  if (!data) return null

  const formattedDate = data.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <div
      className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 w-52 p-2.5 rounded-sm border border-slate-line bg-ink/95 backdrop-blur-md shadow-2xl space-y-1.5 animate-in fade-in-50 zoom-in-95 duration-100 font-sans select-none"
      style={{ left: `${data.x}px`, top: `${data.y}px` }}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-parchment truncate">
        {data.isUnresolved ? (
          <Compass className="w-3.5 h-3.5 text-brass shrink-0" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-brass shrink-0" />
        )}
        <span className="truncate">{data.title}</span>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-muted-foreground pt-1 border-t border-slate-line/50">
        <div className="flex items-center gap-1">
          <Link className="w-3 h-3 text-brass" />
          <span>
            {data.degree} {data.degree === 1 ? "link" : "links"}
          </span>
        </div>

        {data.wordCount !== undefined && (
          <div className="flex items-center gap-1">
            <AlignLeft className="w-3 h-3 text-brass" />
            <span>{data.wordCount} words</span>
          </div>
        )}

        {formattedDate && (
          <div className="flex items-center gap-1 col-span-2">
            <Clock className="w-3 h-3 text-brass" />
            <span>Updated {formattedDate}</span>
          </div>
        )}

        {data.isUnresolved && (
          <div className="text-[9px] text-brass font-mono italic col-span-2">
            Click to create document
          </div>
        )}
      </div>
    </div>
  )
}
