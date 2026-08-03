import { type FC } from "react"

export interface SuggestionDiffProps {
  type: "continue" | "rephrase"
  originalText?: string
  suggestedText: string
  status: "idle" | "loading" | "streaming" | "ready" | "error"
  error?: string
}

export const SuggestionDiff: FC<SuggestionDiffProps> = ({
  type,
  originalText,
  suggestedText,
  status,
  error,
}) => {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-ink/90 border border-slate-line text-brass/80 text-xs font-mono animate-pulse">
        <span className="w-2 h-2 rounded-full bg-brass animate-ping" />✦ Generating AI suggestion...
      </span>
    )
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-oxblood/20 border border-oxblood/50 text-oxblood text-xs font-mono">
        ⚠ {error || "Failed to generate suggestion"}
      </span>
    )
  }

  if (type === "continue") {
    return (
      <span className="suggestion-diff-container inline-flex items-center gap-2 pl-2 border-l-2 border-brass">
        <span className="suggestion-diff-add text-moss font-serif italic bg-moss/15 border-b border-dashed border-moss/50 px-1.5 py-0.5 rounded-xs text-sm">
          {suggestedText}
        </span>
      </span>
    )
  }

  return (
    <span className="suggestion-diff-container inline-flex items-center gap-2 pl-2 border-l-2 border-brass">
      {originalText && (
        <span className="suggestion-diff-remove bg-oxblood/30 text-parchment/70 line-through px-1.5 py-0.5 rounded-xs text-xs font-mono">
          {originalText}
        </span>
      )}
      <span className="suggestion-diff-add text-moss font-medium bg-moss/20 border border-moss/40 px-1.5 py-0.5 rounded-xs text-sm font-serif shadow-xs">
        ➜ {suggestedText}
      </span>
    </span>
  )
}
