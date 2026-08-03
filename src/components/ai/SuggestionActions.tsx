import { type FC } from "react"

export interface SuggestionActionsProps {
  onAccept: () => void
  onReject: () => void
  onRegenerate: () => void
  isStreaming?: boolean
}

export const SuggestionActions: FC<SuggestionActionsProps> = ({
  onAccept,
  onReject,
  onRegenerate,
  isStreaming = false,
}) => {
  return (
    <span className="suggestion-actions-toolbar inline-flex items-center gap-1.5 p-1 bg-ink/95 border border-slate-line rounded-xs shadow-md select-none text-xs font-mono">
      <button
        type="button"
        onClick={onAccept}
        disabled={isStreaming}
        title="Accept Suggestion (Tab or Ctrl+Shift+Enter)"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-moss/20 hover:bg-moss/30 border border-moss/40 text-moss text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
      >
        <span>✓</span>
        <span>Accept</span>
        <span className="text-[9px] opacity-70 bg-ink px-1 rounded border border-moss/30">Tab</span>
      </button>

      <button
        type="button"
        onClick={onReject}
        title="Reject Suggestion (Esc or Ctrl+Shift+Backspace)"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-oxblood/20 hover:bg-oxblood/30 border border-oxblood/40 text-parchment text-[11px] font-medium transition-colors cursor-pointer"
      >
        <span>✗</span>
        <span>Reject</span>
        <span className="text-[9px] opacity-70 bg-ink px-1 rounded border border-oxblood/30">
          Esc
        </span>
      </button>

      <button
        type="button"
        onClick={onRegenerate}
        disabled={isStreaming}
        title="Regenerate Suggestion (Ctrl+Shift+G)"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-brass/10 hover:bg-brass/20 border border-brass/30 text-brass text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
      >
        <span>↻</span>
        <span className="sr-only md:not-sr-only">Retry</span>
      </button>
    </span>
  )
}
