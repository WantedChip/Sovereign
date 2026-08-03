import type { SearchResult } from "@/types"
import { FileText, ChevronRight, Hash } from "lucide-react"

export interface SearchResultsProps {
  results: SearchResult[]
  selectedIndex: number
  onSelectResult: (result: SearchResult) => void
  isSearching: boolean
  query: string
}

function highlightQueryText(text: string, query: string) {
  if (!query.trim()) return text

  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))

  if (terms.length === 0) return text

  const regex = new RegExp(`(${terms.join("|")})`, "gi")
  const parts = text.split(regex)

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-brass/25 text-brass font-medium rounded px-0.5 decoration-none"
      >
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export function SearchResults({
  results,
  selectedIndex,
  onSelectResult,
  isSearching,
  query,
}: SearchResultsProps) {
  if (isSearching) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse flex flex-col items-center gap-2">
        <div className="w-5 h-5 border-2 border-brass border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Running hybrid vector search...</span>
      </div>
    )
  }

  if (query.trim() && results.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
        <FileText className="w-8 h-8 opacity-40 text-brass" />
        <p className="text-sm font-medium text-parchment">No search results found</p>
        <p className="text-xs text-muted-foreground">
          Try refining your query or searching for broader keywords.
        </p>
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className="p-8 text-center text-muted-foreground text-xs font-mono flex flex-col items-center gap-2">
        <span>Type to search across documents, headings, and semantic embeddings...</span>
      </div>
    )
  }

  return (
    <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1 custom-scrollbar">
      {results.map((result, index) => {
        const isSelected = index === selectedIndex
        const scorePercent = Math.min(100, Math.max(1, Math.round(result.score * 100)))

        return (
          <div
            key={`${result.id}-${index}`}
            onClick={() => onSelectResult(result)}
            className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
              isSelected
                ? "bg-card/90 border-brass/60 shadow-md shadow-brass/5"
                : "bg-card/40 border-slate-line/40 hover:bg-card/70 hover:border-slate-line"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-brass shrink-0" />
                <span className="font-semibold text-sm text-parchment truncate">
                  {result.title}
                </span>
                {result.heading && (
                  <span className="text-[11px] font-mono text-muted-foreground bg-slate-line/30 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                    <Hash className="w-3 h-3 text-brass/70" />
                    {result.heading}
                  </span>
                )}
              </div>

              {result.score > 0 && (
                <span className="text-[10px] font-mono bg-brass/10 text-brass px-1.5 py-0.5 rounded border border-brass/20 shrink-0">
                  {scorePercent}% match
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {highlightQueryText(result.chunkText, query)}
            </p>

            <div className="flex items-center justify-end text-[10px] font-mono text-muted-foreground/60">
              <span className="flex items-center gap-0.5">
                Press Enter <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
