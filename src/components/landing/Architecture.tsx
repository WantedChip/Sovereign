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
  ShieldCheck,
  Zap,
  DollarSign,
} from "lucide-react"

interface SurveyStation {
  pointId: string
  coordRef: string
  name: string
  tech: string
  description: string
  icon: typeof FileText
}

const stations: SurveyStation[] = [
  {
    pointId: "PT.01",
    coordRef: "N·45°12′ • E·12°04′",
    name: "Rich-Text Editor",
    tech: "Tiptap v3 Engine",
    description: "Zero-latency WYSIWYG editor with live markdown serialization.",
    icon: FileText,
  },
  {
    pointId: "PT.02",
    coordRef: "N·45°12′ • E·34°01′",
    name: "CRDT Sync Transect",
    tech: "Yjs + y-webrtc",
    description: "Peer-to-peer WebRTC data channels for multi-user CRDT sync.",
    icon: Share2,
  },
  {
    pointId: "PT.03",
    coordRef: "N·21°08′ • E·12°04′",
    name: "Local Storage Worker",
    tech: "OPFS + Dexie.js",
    description: "Origin Private File System worker for fast local persistence.",
    icon: HardDrive,
  },
  {
    pointId: "PT.04",
    coordRef: "N·21°08′ • E·34°01′",
    name: "On-Device AI Station",
    tech: "WebLLM + Transformers",
    description: "WebGPU accelerated local LLM inference and vector embedding.",
    icon: Cpu,
  },
  {
    pointId: "PT.05",
    coordRef: "N·37°54′ • E·12°04′",
    name: "Hybrid Search Index",
    tech: "Orama Vector Engine",
    description: "In-browser BM25 keyword matching + cosine vector similarity.",
    icon: Search,
  },
  {
    pointId: "PT.06",
    coordRef: "N·37°54′ • E·34°01′",
    name: "Knowledge Topology",
    tech: "Cytoscape.js v3",
    description: "Bidirectional wikilink extraction & interactive 2D graph renderer.",
    icon: GitFork,
  },
]

export function Architecture() {
  const [activePoint, setActivePoint] = useState<string | null>(null)

  return (
    <section
      id="architecture"
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-line"
    >
      {/* Section Header */}
      <div className="relative z-10 text-center space-y-4 max-w-3xl mx-auto mb-16">
        <Badge
          variant="default"
          className="px-3 py-0.5 text-[10px] font-mono tracking-widest uppercase"
        >
          TRANSECT MAP & TOPOLOGY
        </Badge>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-parchment">
          <span className="text-brass italic font-normal">Zero-Server</span> Survey Architecture
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
          Sovereign charts all data flow inside your device's browser sandbox. Plotted below as
          fixed survey markers, every subsystem functions as an independent local module.
        </p>
      </div>

      {/* Rebuilt Literal Survey Chart */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        {/* Central Benchmark Hub Node */}
        <div className="relative flex justify-center">
          <div className="survey-card p-6 sm:p-8 rounded-sm border-brass shadow-lg max-w-xl w-full text-center relative overflow-hidden bg-ink">
            <div className="flex justify-between items-center text-[10px] font-mono text-brass mb-3">
              <span>[PT.00 BENCHMARK STATION]</span>
              <span>N·00°00′ • E·00°00′</span>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-sm bg-brass/10 border border-brass flex items-center justify-center mx-auto glow-brass">
                <Laptop className="w-7 h-7 text-brass" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-parchment">
                  BROWSER / PWA CLIENT HUB
                </h3>
                <p className="text-xs text-muted-foreground font-sans mt-1">
                  Primary client runtime orchestrating local storage, Web Workers, CRDT sync, and
                  WebGPU compute.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transect Survey Grid with Dashed SVG Lines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => {
            const IconComp = station.icon
            const isActive = activePoint === station.pointId

            return (
              <Card
                key={station.pointId}
                coord={station.pointId}
                className={`survey-card cursor-pointer transition-all duration-200 ${
                  isActive ? "border-brass bg-secondary/80 shadow-md" : "hover:border-brass/70"
                }`}
                onMouseEnter={() => setActivePoint(station.pointId)}
                onMouseLeave={() => setActivePoint(null)}
              >
                <CardHeader className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-sm border border-slate-line bg-ink flex items-center justify-center text-brass">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono border-slate-line text-muted-foreground"
                    >
                      {station.coordRef}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-brass font-semibold tracking-wider">
                      {station.pointId} — {station.tech}
                    </div>
                    <CardTitle className="text-base font-serif font-bold text-parchment mt-0.5">
                      {station.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1 font-sans">
                      {station.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* 3-Column Metrics Stats Bar */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="survey-card p-5 rounded-sm text-center space-y-2 border border-slate-line">
            <div className="w-8 h-8 rounded-sm bg-moss/10 border border-moss/40 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-4 h-4 text-moss" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-parchment font-mono">0</div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-brass">
              Cloud Servers
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Zero central servers or telemetry endpoints receiving your documents.
            </p>
          </div>

          <div className="survey-card p-5 rounded-sm text-center space-y-2 border border-slate-line">
            <div className="w-8 h-8 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4 text-brass" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-parchment font-mono">100%</div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-brass">
              Offline Capable
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Complete editor, search, and AI functionality preserved without network.
            </p>
          </div>

          <div className="survey-card p-5 rounded-sm text-center space-y-2 border border-slate-line">
            <div className="w-8 h-8 rounded-sm bg-oxblood/10 border border-oxblood/40 flex items-center justify-center mx-auto">
              <DollarSign className="w-4 h-4 text-oxblood" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-parchment font-mono">$0</div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-brass">
              Hosting Infrastructure
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Deployed cleanly as a static web application on Cloudflare Workers.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
