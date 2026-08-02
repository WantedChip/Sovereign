import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Plus,
  FileText,
  Sparkles,
  Network,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  HardDrive,
  Cpu,
  Share2,
  Lock,
  Search,
  Command
} from "lucide-react"

export function WorkspaceLayout() {
  const navigate = useNavigate()
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [activeRightTab, setActiveRightTab] = useState<"graph" | "ai">("graph")

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary/30 selection:text-primary">
      {/* Top Application Header */}
      <header className="h-12 glass-panel flex items-center justify-between px-4 z-20 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </Button>

          <Separator orientation="vertical" className="h-4 bg-border/60" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight gradient-text-silver">
              Sovereign Workspace
            </span>
            <Badge variant="glass" className="text-[10px] px-2 py-0.5 border-primary/30">
              v0.1.5 Shell
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 text-[11px] font-mono border-emerald-500/30 text-emerald-400">
            <HardDrive className="w-3 h-3" />
            <span>OPFS Local Storage</span>
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            title={rightPanelOpen ? "Collapse Right Panel" : "Expand Right Panel"}
          >
            {rightPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main 3-Column Grid Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Left Sidebar */}
        <aside className="w-64 glass-panel border-r border-border/50 flex flex-col shrink-0">
          {/* Sidebar Header & New Note CTA */}
          <div className="p-3 border-b border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Documents
              </span>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10">
                <Plus className="w-3.5 h-3.5" />
                <span>New Note</span>
              </Button>
            </div>
          </div>

          {/* Document Navigation List Placeholder */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="glass-card p-2.5 rounded-lg border-primary/40 bg-primary/10 flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">Welcome to Sovereign</span>
            </div>

            <div className="p-2.5 rounded-lg hover:bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">Architecture Specification</span>
            </div>

            <div className="p-2.5 rounded-lg hover:bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">Local AI & WebGPU Roadmap</span>
            </div>
          </div>

          {/* Sidebar Bottom Footer */}
          <div className="p-3 border-t border-border/40 space-y-2 bg-muted/10">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Device Storage
              </span>
              <span>100% Offline</span>
            </div>
          </div>
        </aside>

        {/* Column 2: Center Editor Canvas */}
        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
          {/* Document Top Toolbar Header */}
          <div className="h-10 border-b border-border/40 flex items-center justify-between px-6 bg-muted/10 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">Welcome to Sovereign</span>
              <Badge variant="outline" className="text-[10px] py-0 border-border/50 text-muted-foreground">
                Saved Locally
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                P2P Ready
              </span>
            </div>
          </div>

          {/* Main Editor Canvas Container */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col items-center justify-center">
            <Card glass className="glass-card max-w-2xl w-full text-center p-8 space-y-6 border-primary/30 glow-purple">
              <CardHeader className="p-0 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Core Document Editor
                </CardTitle>
                <CardDescription className="text-sm max-w-md mx-auto">
                  The Tiptap v3 rich-text editor with markdown serialization, slash commands, and [[wikilinks]] is scheduled for sub-phase <span className="text-primary font-semibold">v0.2</span>.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="glass p-3 rounded-lg border border-border/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Command className="w-3.5 h-3.5 text-accent" />
                      <span>Slash Commands</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Type / to insert code blocks, callouts, or tables.</p>
                  </div>

                  <div className="glass p-3 rounded-lg border border-border/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Search className="w-3.5 h-3.5 text-primary" />
                      <span>[[Wiki Links]]</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Type [[ to connect documents into the knowledge graph.</p>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono text-muted-foreground/80 bg-muted/20 border border-border/30 p-3 rounded-lg flex items-center justify-between">
                  <span>Workspace Layout Active (v0.1.5)</span>
                  <Badge variant="glass" className="text-[10px] text-emerald-400 border-emerald-500/30">
                    Ready for v0.2
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Column 3: Right Panel (Graph & AI Co-Pilot) */}
        {rightPanelOpen && (
          <aside className="w-72 glass-panel border-l border-border/50 flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-300">
            {/* Panel Tabs Header */}
            <div className="p-2 border-b border-border/40 flex items-center gap-1 bg-muted/10">
              <Button
                variant={activeRightTab === "graph" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-xs gap-1.5"
                onClick={() => setActiveRightTab("graph")}
              >
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                <span>Graph</span>
              </Button>

              <Button
                variant={activeRightTab === "ai" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-xs gap-1.5"
                onClick={() => setActiveRightTab("ai")}
              >
                <Cpu className="w-3.5 h-3.5 text-accent" />
                <span>AI Chat</span>
              </Button>
            </div>

            {/* Panel Content Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {activeRightTab === "graph" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Knowledge Graph</span>
                    <Badge variant="outline" className="text-[10px] font-mono">v0.5</Badge>
                  </div>

                  <div className="glass p-6 rounded-xl border border-indigo-500/20 text-center space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto">
                      <Network className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-xs font-semibold text-foreground">Cytoscape.js 2D Graph</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Interactive bidirectional graph visualization connecting notes via [[wikilinks]] arrives in sub-phase v0.5.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">WebGPU AI Co-Pilot</span>
                    <Badge variant="outline" className="text-[10px] font-mono">v0.7</Badge>
                  </div>

                  <div className="glass p-6 rounded-xl border border-accent/20 text-center space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-xs font-semibold text-foreground">On-Device LLM & RAG</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Local GPU inference powered by WebLLM for private RAG query synthesis arrives in sub-phase v0.7.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Bottom Privacy Note */}
            <div className="p-3 border-t border-border/40 text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-primary" />
              <span>Zero External API Calls</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
