import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Laptop,
  FileText,
  Share2,
  HardDrive,
  Cpu,
  Search,
  GitFork,
  Zap,
  ShieldCheck,
  DollarSign
} from "lucide-react"

interface Subsystem {
  id: string
  name: string
  tech: string
  description: string
  icon: typeof FileText
  color: string
}

const subsystems: Subsystem[] = [
  {
    id: "editor",
    name: "Rich-Text Editor",
    tech: "Tiptap v3 Engine",
    description: "Zero-latency WYSIWYG editor with live markdown serialization.",
    icon: FileText,
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10"
  },
  {
    id: "sync",
    name: "P2P Sync Engine",
    tech: "Yjs + y-webrtc",
    description: "Peer-to-peer WebRTC data channels for multi-user CRDT sync.",
    icon: Share2,
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10"
  },
  {
    id: "storage",
    name: "Local Storage Worker",
    tech: "OPFS + Dexie.js",
    description: "Origin Private File System worker for fast local file persistence.",
    icon: HardDrive,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
  },
  {
    id: "ai",
    name: "On-Device AI Worker",
    tech: "WebLLM + Transformers",
    description: "WebGPU accelerated local LLM inference and vector embedding.",
    icon: Cpu,
    color: "text-accent border-accent/30 bg-accent/10"
  },
  {
    id: "search",
    name: "Hybrid Search Index",
    tech: "Orama Vector Index",
    description: "In-browser BM25 keyword matching + cosine vector similarity.",
    icon: Search,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10"
  },
  {
    id: "graph",
    name: "Knowledge Graph",
    tech: "Cytoscape.js v3",
    description: "Bidirectional wikilink extraction & interactive 2D graph renderer.",
    icon: GitFork,
    color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
  }
]

export function Architecture() {
  const [activeSubsystem, setActiveSubsystem] = useState<string | null>(null)

  return (
    <section id="architecture" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 text-center space-y-4 max-w-3xl mx-auto mb-16">
        <Badge variant="glass" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
          System Architecture
        </Badge>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="gradient-text">Zero-Server</span> Architecture
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Sovereign runs completely inside your browser sandbox. Heavy compute tasks execute in background
          Web Workers using WebGPU acceleration — zero tracking servers or cloud databases required.
        </p>
      </div>

      {/* Architecture Visual Grid Diagram */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        {/* Central Client Node Showcase */}
        <div className="relative flex justify-center">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/40 shadow-2xl shadow-primary/20 max-w-xl w-full text-center relative overflow-hidden group glow-purple">
            {/* Animated Inner Border Highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-30 group-hover:opacity-60 transition-opacity" />

            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto glow-purple">
                <Laptop className="w-8 h-8 text-primary animate-pulse" />
              </div>

              <div>
                <Badge variant="glass" className="mb-2 text-xs font-mono">
                  CLIENT-SIDE RUNTIME
                </Badge>
                <h3 className="text-2xl font-bold gradient-text-silver">
                  Browser / PWA Application Client
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Orchestrates UI components, Web Workers, CRDT synchronization, and local storage directly inside the browser DOM.
              </p>
            </div>
          </div>
        </div>

        {/* Subsystems Surrounding Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subsystems.map((subsystem) => {
            const IconComp = subsystem.icon
            const isActive = activeSubsystem === subsystem.id

            return (
              <Card
                key={subsystem.id}
                glass
                className={`glass-card cursor-pointer border-border/50 transition-all duration-300 ${
                  isActive ? "border-primary shadow-lg shadow-primary/20 -translate-y-1" : "hover:border-primary/40"
                }`}
                onMouseEnter={() => setActiveSubsystem(subsystem.id)}
                onMouseLeave={() => setActiveSubsystem(null)}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${subsystem.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-border/40">
                      {subsystem.tech}
                    </Badge>
                  </div>

                  <div>
                    <CardTitle className="text-lg font-semibold">{subsystem.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      {subsystem.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* 3-Column Architecture Metrics Stats Bar */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-xl border border-border/50 text-center space-y-2 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-foreground font-mono">0</div>
            <div className="text-sm font-semibold text-foreground">Central Cloud Servers</div>
            <p className="text-xs text-muted-foreground">
              Zero backend infrastructure or tracking servers receiving your notes.
            </p>
          </div>

          <div className="glass p-6 rounded-xl border border-border/50 text-center space-y-2 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-foreground font-mono">100%</div>
            <div className="text-sm font-semibold text-foreground">Offline Functional</div>
            <p className="text-xs text-muted-foreground">
              Instant loading and full editor/AI feature access without internet.
            </p>
          </div>

          <div className="glass p-6 rounded-xl border border-border/50 text-center space-y-2 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-foreground font-mono">$0</div>
            <div className="text-sm font-semibold text-foreground">Hosting Infrastructure Cost</div>
            <p className="text-xs text-muted-foreground">
              Deployed cleanly as static web app assets on Cloudflare Pages.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
