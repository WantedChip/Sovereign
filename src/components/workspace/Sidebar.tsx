import { useState } from "react"
import { useUIStore } from "@/stores/ui-store"
import { Button } from "@/components/ui/button"
import { DocumentList } from "./DocumentList"
import { ImportDialog } from "./ImportDialog"
import {
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  HardDrive,
  Download,
  Upload,
  Loader2,
} from "lucide-react"
import { exportKnowledgeBase, downloadExport } from "@/lib/export/zip-export"

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
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgressText, setExportProgressText] = useState("")
  const [isImportOpen, setIsImportOpen] = useState(false)

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)
    setExportProgressText("Preparing...")

    try {
      const blob = await exportKnowledgeBase((progress) => {
        setExportProgressText(`${progress.current}/${progress.total}`)
      })
      downloadExport(blob)
      setExportProgressText("Export Complete!")
      setTimeout(() => setExportProgressText(""), 2500)
    } catch (err) {
      console.error("Export failed:", err)
      setExportProgressText("Export Failed")
      setTimeout(() => setExportProgressText(""), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) {
    return (
      <aside
        role="navigation"
        aria-label="Collapsed Sidebar Navigation"
        className="bg-ink border-r border-slate-line flex flex-col items-center py-3 px-1.5 shrink-0 z-10 h-full"
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 text-muted-foreground hover:text-brass min-h-[44px] min-w-[44px]"
          onClick={onToggleOpen}
          aria-label="Expand Sidebar Navigation"
          title="Expand Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="stamp"
          className="h-9 w-9 mt-3 text-brass min-h-[44px] min-w-[44px]"
          onClick={onCreateDocument}
          aria-label="Create New Document"
          title="New Note"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 mt-2 text-muted-foreground hover:text-brass min-h-[44px] min-w-[44px]"
          onClick={handleExport}
          aria-label="Export Knowledge Base as Markdown ZIP Archive"
          title="Export Knowledge Base as Markdown ZIP"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-brass" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 mt-2 text-muted-foreground hover:text-brass min-h-[44px] min-w-[44px]"
          onClick={() => setIsImportOpen(true)}
          aria-label="Import Markdown ZIP Archive into Knowledge Base"
          title="Import Knowledge Base ZIP"
        >
          <Upload className="w-4 h-4" />
        </Button>

        <ImportDialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      </aside>
    )
  }

  return (
    <aside
      role="navigation"
      aria-label="Document Sidebar Navigation"
      className="w-64 md:w-72 bg-ink border-r border-slate-line flex flex-col shrink-0 overflow-hidden font-sans h-full"
    >
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
              className="h-8 w-8 text-muted-foreground hover:text-parchment min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              onClick={onToggleOpen}
              aria-label="Collapse Sidebar Navigation"
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
          className="w-full h-8 text-xs gap-1.5 font-mono shadow-sm min-h-[44px] sm:min-h-0"
          onClick={onCreateDocument}
          aria-label="Create New Document"
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
            aria-label="Filter documents by title"
            className="w-full bg-secondary/30 border border-slate-line text-parchment placeholder:text-muted-foreground text-xs pl-8 pr-12 py-1.5 rounded-sm focus:outline-none focus:border-brass/60 font-mono transition-colors min-h-[44px] sm:min-h-0"
          />
          <button
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Open Command Palette Search Modal (Command K)"
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

      {/* Storage & Backup Footer */}
      <div className="p-3 border-t border-slate-line space-y-2 bg-secondary/30 font-mono text-[10px]">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-brass" />
            Storage Engine
          </span>
          <span className="text-moss font-semibold">IndexedDB + OPFS</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            aria-label="Export Knowledge Base as ZIP"
            className="h-8 text-[10px] font-mono gap-1 border-slate-line hover:border-brass/50 bg-ink/60 hover:bg-brass/10 text-parchment transition-colors px-2 min-h-[44px] sm:min-h-0"
            title="Export Knowledge Base as structured Markdown ZIP archive"
          >
            {isExporting ? (
              <Loader2 className="w-3 h-3 animate-spin text-brass" />
            ) : (
              <Download className="w-3 h-3 text-brass shrink-0" />
            )}
            <span className="truncate">{exportProgressText || "Export ZIP"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            aria-label="Import Knowledge Base ZIP"
            className="h-8 text-[10px] font-mono gap-1 border-slate-line hover:border-brass/50 bg-ink/60 hover:bg-brass/10 text-parchment transition-colors px-2 min-h-[44px] sm:min-h-0"
            title="Import Markdown ZIP archive into Knowledge Base"
          >
            <Upload className="w-3 h-3 text-brass shrink-0" />
            <span>Import ZIP</span>
          </Button>
        </div>
      </div>

      <ImportDialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </aside>
  )
}
