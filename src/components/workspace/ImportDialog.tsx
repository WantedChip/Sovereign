import { useState, useRef, type ChangeEvent, type FC } from "react"
import { Button } from "@/components/ui/button"
import {
  importKnowledgeBase,
  undoImport,
  type ConflictMode,
  type ImportResult,
} from "@/lib/export/zip-import"
import {
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  FileArchive,
} from "lucide-react"

export interface ImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const ImportDialog: FC<ImportDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [conflictMode, setConflictMode] = useState<ConflictMode>("rename")
  const [isImporting, setIsImporting] = useState(false)
  const [progressStatus, setProgressStatus] = useState("")
  const [progressCount, setProgressCount] = useState({ current: 0, total: 0 })
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isUndoing, setIsUndoing] = useState(false)
  const [undoSuccess, setUndoSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".zip")) {
      setSelectedFile(file)
      setImportResult(null)
      setUndoSuccess(false)
    }
  }

  const handleStartImport = async () => {
    if (!selectedFile || isImporting) return

    setIsImporting(true)
    setProgressStatus("Extracting ZIP archive...")
    setImportResult(null)
    setUndoSuccess(false)

    try {
      const res = await importKnowledgeBase(
        selectedFile,
        { conflictMode },
        (current, total, status) => {
          setProgressCount({ current, total })
          setProgressStatus(status)
        }
      )
      setImportResult(res)
      onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setImportResult({
        imported: 0,
        skipped: 0,
        overwritten: 0,
        errors: [msg],
        importedDocIds: [],
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleUndo = async () => {
    if (!importResult || isUndoing || importResult.importedDocIds.length === 0) return

    setIsUndoing(true)
    try {
      await undoImport(importResult.importedDocIds)
      setUndoSuccess(true)
      onSuccess?.()
    } catch (err) {
      console.error("Failed to undo import:", err)
    } finally {
      setIsUndoing(false)
    }
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setImportResult(null)
    setUndoSuccess(false)
    setIsImporting(false)
    setProgressStatus("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-xs font-sans animate-fade-in">
      <div className="w-full max-w-lg bg-card border border-slate-line rounded-sm shadow-xl p-6 relative text-parchment space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-line pb-3">
          <div className="flex items-center gap-2">
            <FileArchive className="w-5 h-5 text-brass" />
            <h2 className="text-base font-serif font-semibold tracking-wide text-parchment">
              Import Knowledge Base ZIP
            </h2>
          </div>
          <button
            onClick={resetDialog}
            disabled={isImporting}
            className="text-muted-foreground hover:text-parchment transition-colors p-1 rounded-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {!importResult ? (
          <div className="space-y-4">
            {/* File Picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-line hover:border-brass/60 bg-secondary/20 hover:bg-brass/5 p-6 rounded-xs flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-brass mb-2" />
              {selectedFile ? (
                <div className="font-mono text-xs text-brass font-medium">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <>
                  <div className="text-xs font-mono font-medium text-parchment">
                    Click to select a Markdown ZIP archive
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Supports `.zip` archives containing Markdown documents
                  </div>
                </>
              )}
            </div>

            {/* Conflict Handling Settings */}
            <div className="space-y-2 font-mono text-xs">
              <label className="text-muted-foreground font-semibold">
                Duplicate Title Conflict Strategy:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "rename", label: "Rename (1)" },
                  { id: "overwrite", label: "Overwrite" },
                  { id: "skip", label: "Skip" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setConflictMode(mode.id as ConflictMode)}
                    className={`px-2 py-1.5 rounded-xs border text-[11px] text-center transition-colors cursor-pointer ${
                      conflictMode === mode.id
                        ? "bg-brass/20 border-brass text-brass font-semibold"
                        : "bg-secondary/30 border-slate-line text-muted-foreground hover:text-parchment"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Status */}
            {isImporting && (
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>{progressStatus}</span>
                  {progressCount.total > 0 && (
                    <span>
                      {progressCount.current} / {progressCount.total}
                    </span>
                  )}
                </div>
                <div className="w-full bg-slate-line/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brass h-full transition-all duration-200"
                    style={{
                      width: `${
                        progressCount.total > 0
                          ? Math.round((progressCount.current / progressCount.total) * 100)
                          : 50
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-line font-mono text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDialog}
                disabled={isImporting}
                className="h-8 border border-slate-line"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="stamp"
                onClick={handleStartImport}
                disabled={!selectedFile || isImporting}
                className="h-8 gap-1.5"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Start Import</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Results Summary View */
          <div className="space-y-4 font-mono text-xs">
            {undoSuccess ? (
              <div className="p-4 bg-oxblood/15 border border-oxblood/40 rounded-xs space-y-2 text-center">
                <RotateCcw className="w-6 h-6 text-oxblood mx-auto" />
                <div className="font-semibold text-parchment">Import Successfully Reverted</div>
                <div className="text-[11px] text-muted-foreground">
                  All imported document records have been deleted from local storage.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-moss font-semibold text-sm">
                  <CheckCircle className="w-5 h-5 text-moss shrink-0" />
                  <span>Knowledge Base Import Complete</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-secondary/40 border border-slate-line p-2 rounded-xs">
                    <div className="text-brass font-bold text-base">{importResult.imported}</div>
                    <div className="text-[10px] text-muted-foreground">Imported</div>
                  </div>
                  <div className="bg-secondary/40 border border-slate-line p-2 rounded-xs">
                    <div className="text-parchment font-bold text-base">
                      {importResult.overwritten}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Overwritten</div>
                  </div>
                  <div className="bg-secondary/40 border border-slate-line p-2 rounded-xs">
                    <div className="text-muted-foreground font-bold text-base">
                      {importResult.skipped}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Skipped</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="p-3 bg-oxblood/20 border border-oxblood/40 rounded-xs space-y-1 max-h-28 overflow-y-auto">
                    <div className="flex items-center gap-1.5 text-oxblood font-semibold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{importResult.errors.length} Warning(s) / Error(s)</span>
                    </div>
                    {importResult.errors.map((err, idx) => (
                      <div key={idx} className="text-[10px] text-parchment/80">
                        • {err}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-line">
              {!undoSuccess && importResult.importedDocIds.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={isUndoing}
                  className="h-8 text-xs border-oxblood/40 text-oxblood hover:bg-oxblood/20 gap-1.5"
                >
                  {isUndoing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>Undo Import ({importResult.importedDocIds.length})</span>
                </Button>
              ) : (
                <div />
              )}

              <Button size="sm" variant="stamp" onClick={resetDialog} className="h-8">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
