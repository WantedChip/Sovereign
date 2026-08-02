import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Compass,
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
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-brass/30 selection:text-brass font-sans">
      {/* Top Application Header */}
      <header className="h-12 bg-ink flex items-center justify-between px-4 z-20 border-b border-slate-line shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-brass font-mono"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </Button>

          <Separator orientation="vertical" className="h-4 bg-slate-line" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-brass" />
            </div>
            <span className="font-serif font-bold text-sm tracking-tight text-parchment">
              Sovereign Workspace
            </span>
            <Badge variant="default" className="text-[10px] px-2 py-0.5 border-brass/40 font-mono">
              Field Shell
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="moss" className="hidden sm:inline-flex gap-1.5 text-[10px] font-mono">
            <HardDrive className="w-3 h-3" />
            <span>OPFS Active</span>
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-parchment"
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
        <aside className="w-64 bg-ink border-r border-slate-line flex flex-col shrink-0">
          {/* Sidebar Header & New Note CTA */}
          <div className="p-3 border-b border-slate-line space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-brass">
                Field Documents
              </span>
              <Button size="sm" variant="stamp" className="h-7 px-2 text-[10px] gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>New Note</span>
              </Button>
            </div>
          </div>

          {/* Document Navigation List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-sans">
            <div className="survey-card p-2.5 rounded-sm border-brass bg-secondary/60 flex items-center gap-2 text-xs font-medium text-parchment cursor-pointer">
              <FileText className="w-4 h-4 text-brass shrink-0" />
              <span className="truncate">Welcome to Sovereign</span>
            </div>

            <div className="p-2.5 rounded-sm hover:bg-secondary/40 flex items-center gap-2 text-xs text-muted-foreground hover:text-parchment cursor-pointer transition-colors">
              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="truncate">Field Survey Specification</span>
            </div>

            <div className="p-2.5 rounded-sm hover:bg-secondary/40 flex items-center gap-2 text-xs text-muted-foreground hover:text-parchment cursor-pointer transition-colors">
              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="truncate">Local AI & WebGPU Roadmap</span>
            </div>
          </div>

          {/* Sidebar Bottom Footer */}
          <div className="p-3 border-t border-slate-line space-y-2 bg-secondary/30">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-moss animate-pulse" />
                Device Storage
              </span>
              <span className="text-moss">100% Offline</span>
            </div>
          </div>
        </aside>

        {/* Column 2: Center Editor Canvas */}
        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
          {/* Document Top Toolbar Header */}
          <div className="h-10 border-b border-slate-line flex items-center justify-between px-6 bg-secondary/20 text-xs shrink-0 font-mono">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-brass" />
              <span className="font-semibold text-parchment font-sans">Welcome to Sovereign</span>
              <Badge variant="outline" className="text-[9px] py-0 border-slate-line text-muted-foreground">
                Saved Locally
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-brass" />
                P2P Ready
              </span>
            </div>
          </div>

          {/* Main Editor Canvas Container */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col items-center justify-center">
            <Card coord="N·00" className="max-w-2xl w-full text-center p-8 space-y-6 border-brass/60">
              <CardHeader className="p-0 space-y-2">
                <div className="w-12 h-12 rounded-sm bg-brass/10 border border-brass flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-brass" />
                </div>
                <CardTitle className="text-2xl font-serif font-bold text-parchment">
                  Core Document Editor
                </CardTitle>
                <CardDescription className="text-sm max-w-md mx-auto font-sans">
                  The Tiptap v3 rich-text editor with markdown serialization, slash commands, and [[wikilinks]] is scheduled for sub-phase <span className="text-brass font-semibold">v0.2</span>.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="survey-card p-3 rounded-sm border-slate-line space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-parchment font-mono">
                      <Command className="w-3.5 h-3.5 text-brass" />
                      <span>Slash Commands</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-sans">Type / to insert code blocks, callouts, or tables.</p>
                  </div>

                  <div className="survey-card p-3 rounded-sm border-slate-line space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-parchment font-mono">
                      <Search className="w-3.5 h-3.5 text-brass" />
                      <span>[[Wiki Links]]</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-sans">Type [[ to connect entries into the knowledge graph.</p>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono text-muted-foreground bg-ink border border-slate-line p-3 rounded-sm flex items-center justify-between">
                  <span>Field Survey Shell (v0.1.5)</span>
                  <Badge variant="moss" className="text-[10px]">
                    Ready for v0.2
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Column 3: Right Panel (Graph & AI Co-Pilot) */}
        {rightPanelOpen && (
          <aside className="w-72 bg-ink border-l border-slate-line flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-300">
            {/* Panel Tabs Header */}
            <div className="p-2 border-b border-slate-line flex items-center gap-1 bg-secondary/30 font-mono">
              <Button
                variant={activeRightTab === "graph" ? "default" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[11px] gap-1.5"
                onClick={() => setActiveRightTab("graph")}
              >
                <Network className="w-3.5 h-3.5 text-brass" />
                <span>Topology</span>
              </Button>

              <Button
                variant={activeRightTab === "ai" ? "default" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[11px] gap-1.5"
                onClick={() => setActiveRightTab("ai")}
              >
                <Cpu className="w-3.5 h-3.5 text-brass" />
                <span>AI Agent</span>
              </Button>
            </div>

            {/* Panel Content Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
              {activeRightTab === "graph" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-brass uppercase">Knowledge Graph</span>
                    <Badge variant="outline" className="text-[9px]">v0.5</Badge>
                  </div>

                  <div className="survey-card p-6 rounded-sm border-slate-line text-center space-y-3">
                    <div className="w-10 h-10 rounded-sm bg-brass/10 border border-brass flex items-center justify-center mx-auto">
                      <Network className="w-5 h-5 text-brass" />
                    </div>
                    <div className="text-xs font-mono font-semibold text-parchment">Cytoscape.js Chart</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Interactive bidirectional graph visualization connecting notes via [[wikilinks]] arrives in sub-phase v0.5.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-brass uppercase">WebGPU AI Co-Pilot</span>
                    <Badge variant="outline" className="text-[9px]">v0.7</Badge>
                  </div>

                  <div className="survey-card p-6 rounded-sm border-slate-line text-center space-y-3">
                    <div className="w-10 h-10 rounded-sm bg-brass/10 border border-brass flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5 text-brass" />
                    </div>
                    <div className="text-xs font-mono font-semibold text-parchment">On-Device LLM & RAG</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Local GPU inference powered by WebLLM for private RAG query synthesis arrives in sub-phase v0.7.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Bottom Privacy Note */}
            <div className="p-3 border-t border-slate-line text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-brass" />
              <span>Zero External Telemetry</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
