import { useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Edit3,
  Users,
  Cpu,
  Network,
  Sparkles,
  WifiOff,
  ArrowUpRight
} from "lucide-react"

interface FeatureItem {
  id: string
  title: string
  category: string
  description: string
  tech: string
  icon: typeof Edit3
  color: string
  borderColor: string
}

const features: FeatureItem[] = [
  {
    id: "editor",
    title: "Local-First Editor",
    category: "Storage & Speed",
    description:
      "Zero-latency rich text editing powered by Tiptap v3. All notes and media are persisted locally on your device using OPFS and IndexedDB.",
    tech: "Tiptap v3 • OPFS • IndexedDB",
    icon: Edit3,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    borderColor: "hover:border-purple-500/40 hover:shadow-purple-500/10"
  },
  {
    id: "collaboration",
    title: "P2P Real-Time Sync",
    category: "Peer-to-Peer",
    description:
      "Collaborate seamlessly with teammates via WebRTC peer data channels. Real-time conflict-free CRDT synchronization without central servers.",
    tech: "Yjs CRDTs • y-webrtc",
    icon: Users,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    borderColor: "hover:border-blue-500/40 hover:shadow-blue-500/10"
  },
  {
    id: "ai",
    title: "On-Device WebGPU AI",
    category: "Privacy AI",
    description:
      "Run local embedding models and LLMs directly on your GPU. Private RAG query synthesis and writing assistance with zero external API calls.",
    tech: "WebLLM • HuggingFace Transformers",
    icon: Cpu,
    color: "text-accent bg-accent/10 border-accent/20",
    borderColor: "hover:border-accent/40 hover:shadow-accent/10"
  },
  {
    id: "graph",
    title: "Interactive Knowledge Graph",
    category: "Visualization",
    description:
      "Visualize your thoughts interconnecting in real-time. Automatic link extraction and 2D Cytoscape.js graph navigation powered by [[wikilinks]].",
    tech: "Cytoscape.js • Link Index",
    icon: Network,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    borderColor: "hover:border-indigo-500/40 hover:shadow-indigo-500/10"
  },
  {
    id: "search",
    title: "Hybrid Vector Search",
    category: "Discovery",
    description:
      "Find information by conceptual meaning or exact keyword matching. In-browser Orama index combines BM25 full-text with cosine similarity.",
    tech: "Orama Hybrid Engine",
    icon: Sparkles,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    borderColor: "hover:border-amber-500/40 hover:shadow-amber-500/10"
  },
  {
    id: "offline",
    title: "100% Offline PWA",
    category: "Resilience",
    description:
      "Install Sovereign as a desktop or mobile PWA. Enjoy full editing, searching, and AI capabilities even without an active internet connection.",
    tech: "Progressive Web App • SW Cache",
    icon: WifiOff,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    borderColor: "hover:border-emerald-500/40 hover:shadow-emerald-500/10"
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
            entry.target.classList.remove("opacity-0", "translate-y-8")
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
    <section id="features" ref={sectionRef} className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 text-center space-y-4 max-w-3xl mx-auto mb-16">
        <Badge variant="glass" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
          Architecture Capabilities
        </Badge>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          Built for <span className="gradient-text">Privacy</span>, Speed, and Collaboration
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Sovereign combines local-first data ownership with cutting-edge web platform capabilities.
          Every feature runs client-side inside your web browser.
        </p>
      </div>

      {/* Feature Cards 6-Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const IconComp = feature.icon
          return (
            <Card
              key={feature.id}
              glass
              className={`feature-card-item glass-card opacity-0 translate-y-8 transition-all duration-700 ease-out border-border/50 ${feature.borderColor}`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${feature.color}`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-border/60">
                    {feature.category}
                  </Badge>
                </div>

                <CardTitle className="text-xl font-bold pt-1 flex items-center justify-between group">
                  <span>{feature.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>

                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="text-xs font-mono text-muted-foreground/80 bg-muted/20 border border-border/30 px-3 py-2 rounded-lg flex items-center justify-between">
                  <span>{feature.tech}</span>
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
