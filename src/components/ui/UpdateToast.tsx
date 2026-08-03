import { RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UpdateToastProps {
  onReload: () => void
  onDismiss: () => void
}

export function UpdateToast({ onReload, onDismiss }: UpdateToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-ink border border-brass/40 shadow-lg px-4 py-3 rounded-md text-xs font-mono text-parchment animate-in slide-in-from-bottom-4">
      <div className="w-2 h-2 rounded-full bg-brass animate-pulse" />
      <span>New version available! Reload to update.</span>
      <div className="flex items-center gap-1.5 ml-2">
        <Button
          size="sm"
          variant="stamp"
          onClick={onReload}
          className="h-7 px-2.5 text-[11px] font-mono gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reload</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          className="h-7 w-7 text-muted-foreground hover:text-parchment"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
