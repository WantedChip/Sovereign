import { useUIStore } from "@/stores/ui-store"
import { Button } from "@/components/ui/button"
import { DocumentList } from "./DocumentList"
import { Plus, Search, PanelLeftClose, PanelLeftOpen, Compass, HardDrive } from "lucide-react"

interface SidebarProps {
  activeDocumentId: string | null
  onSelectDocument: (id: string) => void
  onCreateDocument: () => void
  isOpen?: boolean
  onToggleOpen?: () => void
}

export function Sidebar({
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  isOpen = true,
  onToggleOpen,
}: SidebarProps) {
  const { searchQuery, setSearchQuery, setCommandPaletteOpen } = useUIStore()

  if (!isOpen) {
    return (
      <div className="bg-ink border-r border-slate-line flex flex-col items-center py-3 px-1.5 shrink-0 z-10">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-brass"
          onClick={onToggleOpen}
          title="Expand Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="stamp"
          className="h-8 w-8 mt-3 text-brass"
          onClick={onCreateDocument}
          title="New Note"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <aside className="w-64 md:w-72 bg-ink border-r border-slate-line flex flex-col shrink-0 overflow-hidden font-sans">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-line space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center">
              <Compass className="w-3 h-3 text-brass" />
            </div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brass">
              Field Documents
            </span>
          </div>

          {onToggleOpen && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-parchment"
              onClick={onToggleOpen}
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* New Document Button */}
        <Button
          size="sm"
          variant="stamp"
          className="w-full h-8 text-xs gap-1.5 font-mono shadow-sm"
          onClick={onCreateDocument}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Document</span>
        </Button>

        {/* Search Input with Command Palette Trigger */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/30 border border-slate-line text-parchment placeholder:text-muted-foreground text-xs pl-8 pr-12 py-1.5 rounded-sm focus:outline-none focus:border-brass/60 font-mono transition-colors"
          />
          <button
            onClick={() => setCommandPaletteOpen(true)}
            title="Open Command Palette (Cmd+K)"
            className="absolute right-1.5 px-1 py-0.5 text-[9px] font-mono bg-slate-line/40 hover:bg-brass/20 text-muted-foreground hover:text-brass border border-slate-line rounded transition-colors"
          >
            ⌘K
          </button>
        </div>
      </div>

      {/* Document List Container */}
      <DocumentList
        activeDocumentId={activeDocumentId}
        onSelectDocument={onSelectDocument}
        searchQuery={searchQuery}
      />

      {/* Storage Footer */}
      <div className="p-3 border-t border-slate-line space-y-1.5 bg-secondary/30 font-mono text-[10px]">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-brass" />
            Storage Engine
          </span>
          <span className="text-moss font-semibold">IndexedDB + OPFS</span>
        </div>
      </div>
    </aside>
  )
}
