import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Play, ChevronDown, Lock, Cpu, HardDrive } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between items-center bg-grid-pattern px-4 sm:px-6 lg:px-8 py-16 md:py-24 overflow-hidden">
      {/* Animated Gradient Mesh Blobs Background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] pointer-events-none animate-float-reverse" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none animate-float-slow" />

      {/* Top Spacer for Centering */}
      <div />

      {/* Main Content Box */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 my-auto">
        {/* Top Badge */}
        <div className="inline-flex justify-center">
          <Badge
            variant="glass"
            className="gap-2 px-4 py-1.5 text-xs sm:text-sm font-medium border-primary/30 shadow-lg shadow-primary/10 hover:border-primary/50 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span>Local-First & On-Device AI Architecture</span>
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
          <span className="block text-foreground">Your Knowledge.</span>
          <span className="block gradient-text mt-1">Your Device. Your Rules.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
          Sovereign is the privacy-first collaborative knowledge workspace that operates entirely in your browser.
          Data stays on your device using OPFS, syncs peer-to-peer via WebRTC, and runs local AI models with WebGPU acceleration.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base font-semibold gap-2.5 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
            onClick={() => {
              window.location.href = "#app"
            }}
          >
            Launch Workspace
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-12 px-8 text-base font-semibold gap-2.5 glass-card hover:bg-secondary/80 border-border/60 hover:scale-[1.02] transition-all duration-300"
            onClick={() => {
              window.location.href = "#features"
            }}
          >
            <Play className="w-4 h-4 text-accent fill-accent" />
            Try Interactive Demo
          </Button>
        </div>

        {/* Trust & Architecture Micro-Badges */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs text-muted-foreground font-mono">
          <div className="glass p-3 rounded-lg flex items-center justify-center gap-2 border border-border/40">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <span>Zero Server Dependencies</span>
          </div>
          <div className="glass p-3 rounded-lg flex items-center justify-center gap-2 border border-border/40">
            <HardDrive className="w-4 h-4 text-accent shrink-0" />
            <span>OPFS Local Persistence</span>
          </div>
          <div className="glass p-3 rounded-lg flex items-center justify-center gap-2 border border-border/40">
            <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>WebGPU AI Inference</span>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="relative z-10 pt-12">
        <a
          href="#features"
          className="flex flex-col items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span>Explore Features</span>
          <div className="w-8 h-8 rounded-full glass flex items-center justify-center border border-border/40 group-hover:border-primary/40 transition-colors animate-bounce">
            <ChevronDown className="w-4 h-4 text-primary" />
          </div>
        </a>
      </div>
    </section>
  )
}
