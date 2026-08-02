import { useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Share2,
  Cpu,
  GitFork,
  Search,
  WifiOff,
  ArrowUpRight
} from "lucide-react"

interface FeatureItem {
  id: string
  gridRef: string
  title: string
  category: string
  description: string
  tech: string
  icon: typeof FileText
  accentColor: string
}

const features: FeatureItem[] = [
  {
    id: "editor",
    gridRef: "N·01",
    title: "Local-First Editor",
    category: "SURVEY INSTRUMENT",
    description:
      "Zero-latency rich text editing powered by Tiptap v3. All notes, documents, and media are charted and persisted locally via OPFS and IndexedDB.",
    tech: "Tiptap v3 • OPFS Engine",
    icon: FileText,
    accentColor: "text-brass border-brass/30 bg-brass/10"
  },
  {
    id: "collaboration",
    gridRef: "N·02",
    title: "P2P Real-Time Sync",
    category: "TRANSECT CHANNEL",
    description:
      "Collaborate directly with peers over WebRTC data channels. Conflict-free CRDT synchronization operates without central server relays.",
    tech: "Yjs CRDTs • y-webrtc",
    icon: Share2,
    accentColor: "text-parchment border-slate-line bg-secondary"
  },
  {
    id: "ai",
    gridRef: "N·03",
    title: "On-Device WebGPU AI",
    category: "LOCAL COMPUTE",
    description:
      "Execute embedding models and Large Language Models directly on your local GPU. Private RAG synthesis and writing co-pilot with zero telemetry.",
    tech: "WebLLM • Transformers.js",
    icon: Cpu,
    accentColor: "text-brass border-brass/30 bg-brass/10"
  },
  {
    id: "graph",
    gridRef: "N·04",
    title: "Knowledge Graph Chart",
    category: "TOPOLOGY VISUALIZER",
    description:
      "Plot connections across your workspace as an interactive 2D graph. Automatic link extraction and Cytoscape.js rendering driven by [[wikilinks]].",
    tech: "Cytoscape.js • Backlink Registry",
    icon: GitFork,
    accentColor: "text-parchment border-slate-line bg-secondary"
  },
  {
    id: "search",
    gridRef: "N·05",
    title: "Hybrid Vector Search",
    category: "INDEXING ENGINE",
    description:
      "Locate entries by conceptual meaning or exact keyword matching. In-browser Orama index combines BM25 full-text with cosine embedding similarity.",
    tech: "Orama Hybrid Search",
    icon: Search,
    accentColor: "text-moss border-moss/30 bg-moss/10"
  },
  {
    id: "offline",
    gridRef: "N·06",
    title: "100% Offline PWA",
    category: "STANDALONE OPERATION",
    description:
      "Install Sovereign as an independent desktop or mobile PWA. Full functionality without network connection — persistent cache and instant boot times.",
    tech: "PWA • Service Worker Cache",
    icon: WifiOff,
    accentColor: "text-oxblood border-oxblood/30 bg-oxblood/10"
  }
]

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0")
            entry.target.classList.remove("opacity-0", "translate-y-6")
          }
        })
      },
      { threshold: 0.1 }
    )

    const cards = sectionRef.current?.querySelectorAll(".feature-card-item")
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-line">
      {/* Section Header */}
      <div className="relative z-10 text-center space-y-4 max-w-3xl mx-auto mb-16">
        <Badge variant="default" className="px-3 py-0.5 text-[10px] font-mono tracking-widest uppercase">
          SYSTEM CAPABILITIES
        </Badge>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-parchment">
          Charted for <span className="text-brass italic font-normal">Privacy</span>, Speed, and Autonomy
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
          Sovereign replaces central cloud infrastructure with client-side Web APIs.
          Every tool operates as a local instrument inside your device's sandbox.
        </p>
      </div>

      {/* Feature Cards 6-Grid with Monospace Coordinates */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const IconComp = feature.icon
          return (
            <Card
              key={feature.id}
              coord={feature.gridRef}
              className="feature-card-item opacity-0 translate-y-6 transition-all duration-500 ease-out hover:border-brass"
              style={{ transitionDelay: `${idx * 70}ms` }}
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-sm border flex items-center justify-center ${feature.accentColor}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono border-slate-line text-muted-foreground">
                    {feature.category}
                  </Badge>
                </div>

                <CardTitle className="text-lg font-serif font-bold pt-1 flex items-center justify-between group">
                  <span className="text-parchment group-hover:text-brass transition-colors">{feature.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-brass opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>

                <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                  {feature.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="text-[11px] font-mono text-muted-foreground bg-ink/80 border border-slate-line/60 px-3 py-1.5 rounded-sm flex items-center justify-between">
                  <span>{feature.tech}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brass" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
