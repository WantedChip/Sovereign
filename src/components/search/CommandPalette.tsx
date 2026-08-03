import { useEffect, useRef, useState } from "react"
import { useUIStore } from "@/stores/ui-store"
import { useDocumentStore } from "@/stores/document-store"
import { useSearch } from "@/hooks/useSearch"
import { SearchResults } from "./SearchResults"
import { Search, Sparkles, FileText, X, Command } from "lucide-react"

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const { setActiveDocumentId } = useDocumentStore()

  const [mode, setMode] = useState<"hybrid" | "title">("hybrid")
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { query, setQuery, results, isSearching, clearSearch } = useSearch(200, 20)

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      queueMicrotask(() => {
        setSelectedIndex(0)
      })
    } else {
      clearSearch()
    }
  }, [commandPaletteOpen, clearSearch])

  // Reset selected index when results change
  useEffect(() => {
    queueMicrotask(() => {
      setSelectedIndex(0)
    })
  }, [results])

  // Keyboard shortcut listener for Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      } else if (e.key === "Escape" && commandPaletteOpen) {
        e.preventDefault()
        setCommandPaletteOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  // Handle arrow key navigation and Enter selection
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selected = results[selectedIndex]
      if (selected) {
        handleSelectResult(selected.documentId)
      }
    }
  }

  const handleSelectResult = (documentId: string) => {
    setActiveDocumentId(documentId)
    setCommandPaletteOpen(false)
  }

  if (!commandPaletteOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search and Command Palette"
      className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-md flex items-start justify-center pt-[12vh] p-4 animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-card border border-slate-line rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-slate-line flex items-center gap-2.5 bg-background/50">
          <Search className="w-5 h-5 text-brass shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search documents, section headings, or semantic concepts..."
            className="w-full bg-transparent text-parchment placeholder:text-muted-foreground/60 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-slate-line/40 rounded text-muted-foreground hover:text-parchment transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono bg-slate-line/30 border border-slate-line/50 px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
            <Command className="w-3 h-3" /> K
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-3 py-2 border-b border-slate-line/40 bg-card/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMode("hybrid")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                mode === "hybrid"
                  ? "bg-brass/20 text-brass border border-brass/30"
                  : "text-muted-foreground hover:text-parchment"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Hybrid Vector Search
            </button>
            <button
              onClick={() => setMode("title")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                mode === "title"
                  ? "bg-brass/20 text-brass border border-brass/30"
                  : "text-muted-foreground hover:text-parchment"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Document Filter
            </button>
          </div>

          <span className="text-[10px] font-mono text-muted-foreground/60 hidden sm:inline">
            ↑↓ Navigate • ↵ Open • Esc Close
          </span>
        </div>

        {/* Search Results */}
        <SearchResults
          results={results}
          selectedIndex={selectedIndex}
          onSelectResult={(res) => handleSelectResult(res.documentId)}
          isSearching={isSearching}
          query={query}
        />

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-background/80 border-t border-slate-line/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brass" />
            Orama Vector Engine • Xenova/all-MiniLM-L6-v2 (384-d)
          </span>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  )
}
