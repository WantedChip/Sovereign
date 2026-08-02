import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Compass, ChevronDown, Lock, Cpu, HardDrive } from "lucide-react"

export function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between items-center bg-topo-pattern animate-topo-drift px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-b border-slate-line">
      {/* Top Spacer */}
      <div />

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 my-auto">
        {/* Instrument Category Badge */}
        <div className="inline-flex justify-center">
          <Badge
            variant="default"
            className="gap-2 px-3.5 py-1 text-xs font-mono tracking-widest border-brass/50 bg-brass/10 text-brass"
          >
            <Compass className="w-3.5 h-3.5 text-brass" />
            <span>SELF-GOVERNED TERRITORY • SURVEY INSTRUMENT</span>
          </Badge>
        </div>

        {/* Headline — Fraunces Serif */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight leading-[1.1] text-parchment">
          <span className="block">Your Knowledge.</span>
          <span className="block text-brass mt-1 italic font-normal">Your Device. Your Rules.</span>
        </h1>

        {/* Subtitle — Inter Neutral Body */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
          Sovereign is a self-contained knowledge workspace that operates entirely inside your
          browser. Data is charted locally via OPFS, synchronized peer-to-peer over WebRTC, and
          analyzed with on-device WebGPU AI inference.
        </p>

        {/* CTA Buttons — Stamp/Seal Style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-mono">
          <Button
            size="lg"
            variant="default"
            className="w-full sm:w-auto h-12 px-8 text-xs font-semibold gap-2.5 shadow-md active:translate-y-px"
            onClick={() => navigate("/app")}
          >
            Launch Workspace
            <ArrowUpRight className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-12 px-8 text-xs font-semibold gap-2.5 border-slate-line hover:border-brass text-parchment"
            onClick={() => {
              window.location.href = "#features"
            }}
          >
            <Compass className="w-4 h-4 text-brass" />
            Survey Features
          </Button>
        </div>

        {/* Surveyor Instrument Coordinates & Badges */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-[11px] font-mono text-muted-foreground">
          <div className="survey-card p-3 rounded-sm flex items-center justify-center gap-2 border border-slate-line">
            <Lock className="w-3.5 h-3.5 text-brass shrink-0" />
            <span>[SYS.01] ZERO CLOUD SERVERS</span>
          </div>
          <div className="survey-card p-3 rounded-sm flex items-center justify-center gap-2 border border-slate-line">
            <HardDrive className="w-3.5 h-3.5 text-moss shrink-0" />
            <span>[SYS.02] OPFS LOCAL STORAGE</span>
          </div>
          <div className="survey-card p-3 rounded-sm flex items-center justify-center gap-2 border border-slate-line">
            <Cpu className="w-3.5 h-3.5 text-oxblood shrink-0" />
            <span>[SYS.03] WEBGPU AI INFERENCE</span>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="relative z-10 pt-10">
        <a
          href="#features"
          className="flex flex-col items-center gap-2 text-[10px] font-mono tracking-widest text-muted-foreground hover:text-brass transition-colors group uppercase"
        >
          <span>Survey Transect Map</span>
          <div className="w-7 h-7 rounded-sm border border-slate-line flex items-center justify-center group-hover:border-brass transition-colors">
            <ChevronDown className="w-3.5 h-3.5 text-brass" />
          </div>
        </a>
      </div>
    </section>
  )
}
