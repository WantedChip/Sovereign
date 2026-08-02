import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Sparkles, Cpu, Layers } from "lucide-react"

export default function App() {
  return (
    <div className="relative min-h-screen bg-background text-foreground bg-grid-pattern overflow-hidden flex flex-col items-center justify-center p-6 space-y-8">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none glow-purple" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none glow-blue" />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl w-full space-y-8 text-center">
        {/* Header Badge & Title */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Badge variant="glass" className="gap-1.5 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              Design System & Theme (v0.1.1)
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="gradient-text-silver">Sovereign</span>{" "}
            <span className="gradient-text">Workspace</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
            Local-first collaborative knowledge workspace powered by on-device AI and WebGPU.
          </p>
        </div>

        <Separator className="my-6 bg-border/60 max-w-md mx-auto" />

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Card glass className="glass-card">
            <CardHeader className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Zero Server</CardTitle>
              <CardDescription className="text-xs">
                OPFS & IndexedDB storage ensures your data never leaves your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground font-mono bg-muted/30 p-3 rounded-md border border-border/40">
              $ sovereign storage --opfs
            </CardContent>
          </Card>

          <Card glass className="glass-card">
            <CardHeader className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-2">
                <Cpu className="w-5 h-5 text-accent" />
              </div>
              <CardTitle className="text-lg">On-Device AI</CardTitle>
              <CardDescription className="text-xs">
                Local WebLLM & Transformers inference for privacy-first RAG.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground font-mono bg-muted/30 p-3 rounded-md border border-border/40">
              $ sovereign ai --webgpu
            </CardContent>
          </Card>

          <Card glass className="glass-card">
            <CardHeader className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2">
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
              <CardTitle className="text-lg">P2P Sync</CardTitle>
              <CardDescription className="text-xs">
                Real-time Yjs CRDT document sync via WebRTC peer connections.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground font-mono bg-muted/30 p-3 rounded-md border border-border/40">
              $ sovereign sync --webrtc
            </CardContent>
          </Card>
        </div>

        {/* Component Action Showcase */}
        <div className="glass p-6 rounded-2xl flex flex-wrap items-center justify-center gap-4 border border-border/50">
          <Button variant="default" className="shadow-lg shadow-primary/25">
            Launch Workspace
          </Button>
          <Button variant="outline">
            Documentation
          </Button>
          <Badge variant="secondary">Inter & JetBrains Mono</Badge>
          <Badge variant="outline">Tailwind v4 Theme</Badge>
        </div>
      </div>
    </div>
  )
}
