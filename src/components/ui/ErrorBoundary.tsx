import { Component, type ReactNode, type ErrorInfo } from "react"
import { AlertCircle, RefreshCw, Download, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportKnowledgeBase, downloadExport } from "@/lib/export/zip-export"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  isExporting: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isExporting: false,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isExporting: false,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] React Render Crash Caught:", error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleEmergencyExport = async () => {
    this.setState({ isExporting: true })
    try {
      const blob = await exportKnowledgeBase()
      downloadExport(blob)
    } catch (err) {
      console.error("[ErrorBoundary] Emergency export failed:", err)
    } finally {
      this.setState({ isExporting: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-ink flex items-center justify-center p-6 text-foreground font-sans">
          <div className="max-w-md w-full bg-secondary/20 border border-oxblood/60 p-6 rounded-md space-y-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-oxblood/10 border border-oxblood/50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-oxblood" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-base text-parchment">
                  Workspace Render Exception
                </h1>
                <p className="text-muted-foreground text-[11px]">
                  An unexpected UI error interrupted rendering.
                </p>
              </div>
            </div>

            <div className="p-3 bg-ink border border-slate-line rounded text-[11px] font-mono text-oxblood overflow-x-auto max-h-32">
              {this.state.error?.message || "Unknown Application Crash"}
            </div>

            <div className="space-y-2">
              <Button
                variant="stamp"
                onClick={this.handleReload}
                className="w-full h-9 text-xs gap-2 font-mono"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application Workspace</span>
              </Button>

              <Button
                variant="outline"
                onClick={this.handleEmergencyExport}
                disabled={this.state.isExporting}
                className="w-full h-9 text-xs gap-2 font-mono border-slate-line hover:border-brass"
              >
                <Download className="w-4 h-4 text-brass" />
                <span>
                  {this.state.isExporting ? "Exporting Backup..." : "Export Emergency ZIP Backup"}
                </span>
              </Button>
            </div>

            <div className="pt-2 border-t border-slate-line text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
              <Compass className="w-3 h-3 text-brass" />
              <span>Sovereign Local Recovery System</span>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
