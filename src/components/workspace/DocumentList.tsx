import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/schema"
import { deleteDocument, updateDocument } from "@/lib/db/operations"
import { FileText, MoreVertical, Trash2, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentListProps {
  activeDocumentId: string | null
  onSelectDocument: (id: string) => void
  searchQuery: string
}

function formatRelativeTime(dateInput: Date | string): string {
  const date = new Date(dateInput)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function DocumentList({
  activeDocumentId,
  onSelectDocument,
  searchQuery,
}: DocumentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const documents = useLiveQuery(async () => {
    const all = await db.documents.orderBy("updatedAt").reverse().toArray()
    const query = searchQuery.trim().toLowerCase()
    if (!query) return all
    return all.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [searchQuery])

  const handleStartRename = (id: string, currentTitle: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingId(id)
    setEditTitle(currentTitle)
    setMenuOpenId(null)
  }

  const handleSaveRename = async (id: string, e?: React.FormEvent) => {
    e?.preventDefault()
    if (editTitle.trim()) {
      await updateDocument(id, { title: editTitle.trim() })
    }
    setEditingId(null)
  }

  const handleDeleteConfirm = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    await deleteDocument(id)
    setDeletingId(null)
    setMenuOpenId(null)
  }

  if (documents === undefined) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground font-mono">
        Loading field logs...
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="p-4 text-center space-y-2 font-mono">
        <p className="text-xs text-muted-foreground">
          {searchQuery
            ? "No matching documents found."
            : "No documents yet. Create your first note!"}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1 font-sans">
      {documents.map((doc) => {
        const isActive = doc.id === activeDocumentId
        const isEditing = doc.id === editingId
        const isDeleting = doc.id === deletingId
        const isMenuOpen = doc.id === menuOpenId

        if (isDeleting) {
          return (
            <div
              key={doc.id}
              className="p-2 rounded-sm bg-destructive/20 border border-destructive text-xs space-y-2 font-mono"
            >
              <p className="text-[11px] text-destructive-foreground">Delete "{doc.title}"?</p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="oxblood"
                  className="h-6 text-[10px] px-2 flex-1"
                  onClick={(e) => handleDeleteConfirm(doc.id, e)}
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] px-2 flex-1 text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeletingId(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )
        }

        return (
          <div
            key={doc.id}
            onClick={() => !isEditing && onSelectDocument(doc.id)}
            className={`group relative p-2.5 rounded-sm flex items-center justify-between text-xs cursor-pointer transition-all ${
              isActive
                ? "survey-card border-brass bg-secondary/80 text-parchment font-medium shadow-sm"
                : "border border-transparent hover:bg-secondary/40 text-muted-foreground hover:text-parchment"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText
                className={`w-4 h-4 shrink-0 ${isActive ? "text-brass" : "text-muted-foreground"}`}
              />

              {isEditing ? (
                <form
                  onSubmit={(e) => handleSaveRename(doc.id, e)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 flex-1"
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    className="w-full bg-ink border border-brass text-parchment px-1.5 py-0.5 text-xs rounded-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="text-brass hover:text-parchment p-0.5"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-muted-foreground hover:text-parchment p-0.5"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{doc.title}</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                    <span>{formatRelativeTime(doc.updatedAt)}</span>
                    <span>•</span>
                    <span>{doc.wordCount} words</span>
                  </div>
                </div>
              )}
            </div>

            {/* Context Actions */}
            {!isEditing && (
              <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-parchment"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpenId(isMenuOpen ? null : doc.id)
                  }}
                  title="Document Actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>

                {isMenuOpen && (
                  <div
                    className="absolute right-0 top-7 w-32 bg-ink border border-slate-line rounded-sm shadow-xl z-30 p-1 space-y-1 font-mono"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleStartRename(doc.id, doc.title, e)}
                      className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] text-muted-foreground hover:text-parchment hover:bg-secondary/50 rounded-sm"
                    >
                      <Edit2 className="w-3 h-3 text-brass" />
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingId(doc.id)
                        setMenuOpenId(null)
                      }}
                      className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] text-destructive hover:bg-destructive/20 rounded-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
