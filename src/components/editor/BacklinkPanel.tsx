import { useLiveQuery } from "dexie-react-hooks"
import { getBacklinksWithContext, getForwardLinks } from "@/lib/graph/link-index"
import { createFromLink } from "@/lib/db/operations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Link, Plus, ArrowUpRight, Compass } from "lucide-react"

export interface BacklinkPanelProps {
  documentId: string | null
  documentTitle?: string
  onNavigate: (documentId: string) => void
  onCreateDocument?: (title: string) => void
}

export function BacklinkPanel({
  documentId,
  documentTitle,
  onNavigate,
  onCreateDocument,
}: BacklinkPanelProps) {
  // Reactive query for incoming backlinks with context snippets
  const backlinks = useLiveQuery(
    async () => {
      if (!documentId) return []
      return await getBacklinksWithContext(documentId, documentTitle)
    },
    [documentId, documentTitle],
    []
  )

  // Reactive query for outgoing unresolved wiki-links from current document
  const unresolvedLinks = useLiveQuery(
    async () => {
      if (!documentId) return []
      const forwardLinks = await getForwardLinks(documentId)
      return forwardLinks.filter((link) => link.targetId === null)
    },
    [documentId],
    []
  )

  if (!documentId) return null

  const handleCreateUnresolved = async (targetTitle: string) => {
    const newDoc = await createFromLink(targetTitle)
    if (onCreateDocument) {
      onCreateDocument(newDoc.title)
    }
    onNavigate(newDoc.id)
  }

  return (
    <div className="w-full space-y-4 pt-4 border-t border-slate-line/60 font-sans select-none">
      {/* Backlinks Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 font-semibold text-brass uppercase tracking-wider">
            <Link className="w-3.5 h-3.5 text-brass" />
            <span>Backlinks</span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-slate-line text-parchment"
          >
            {backlinks.length} {backlinks.length === 1 ? "link" : "links"}
          </Badge>
        </div>

        {backlinks.length === 0 ? (
          <div className="p-4 rounded-sm border border-dashed border-slate-line/70 bg-ink/40 text-center space-y-1">
            <p className="text-xs text-muted-foreground font-sans">
              No other documents link to this one yet.
            </p>
            <p className="text-[11px] text-muted-foreground/70 font-mono">
              Type <span className="text-brass">[[{documentTitle || "Title"}]]</span> in another
              note to connect them.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {backlinks.map((link) => (
              <button
                key={link.id ?? `${link.sourceId}-${link.targetTitle}`}
                type="button"
                onClick={() => onNavigate(link.sourceId)}
                className="w-full group text-left p-3 rounded-sm border border-slate-line bg-secondary/20 hover:bg-secondary/50 hover:border-brass/50 transition-colors space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-parchment group-hover:text-brass transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-brass shrink-0" />
                    <span className="truncate">{link.sourceTitle}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brass shrink-0 transition-colors" />
                </div>

                <p className="text-xs text-muted-foreground font-mono bg-ink/60 p-2 rounded-sm border border-slate-line/50 line-clamp-2 leading-relaxed italic">
                  &ldquo;{link.snippet}&rdquo;
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Unresolved Outgoing Links Section */}
      {unresolvedLinks && unresolvedLinks.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-line/40">
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2 font-semibold text-brass/90 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-brass" />
              <span>Unresolved References</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-brass/40 text-brass">
              {unresolvedLinks.length} pending
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unresolvedLinks.map((link) => (
              <div
                key={link.targetTitle}
                className="p-2 rounded-sm border border-dashed border-brass/40 bg-brass/5 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5 truncate font-mono text-xs text-brass font-medium">
                  <span className="truncate">[[{link.targetTitle}]]</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCreateUnresolved(link.targetTitle)}
                  className="h-6 px-2 text-[10px] font-mono gap-1 border-brass/40 text-brass hover:bg-brass/20 shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Note</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
