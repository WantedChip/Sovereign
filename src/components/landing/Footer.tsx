import { Shield, FileText, Lock, Code2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Footer() {
  return (
    <footer id="privacy" className="relative glass-panel border-t border-border/40 bg-background/90 text-foreground pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info & Tagline (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center glow-purple">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight gradient-text-silver font-sans">
                Sovereign
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The local-first collaborative knowledge workspace. Operates entirely inside your web browser with zero server dependencies and complete data privacy.
            </p>

            <div className="pt-2">
              <Badge variant="glass" className="gap-1.5 px-3 py-1 text-xs border-emerald-500/30 text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                <span>100% Client-Side • Zero Telemetry</span>
              </Badge>
            </div>
          </div>

          {/* Navigation Links Columns (7 Cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            {/* Navigation Column 1 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground tracking-wider uppercase text-xs">
                Navigation
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-foreground transition-colors">
                    Architecture
                  </a>
                </li>
                <li>
                  <a href="#app" className="hover:text-foreground transition-colors">
                    Workspace App
                  </a>
                </li>
              </ul>
            </div>

            {/* Product Column 2 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground tracking-wider uppercase text-xs">
                Tech Stack
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Tiptap v3 & Yjs</li>
                <li>WebGPU & WebLLM</li>
                <li>OPFS & IndexedDB</li>
                <li>Orama Vector Index</li>
              </ul>
            </div>

            {/* Open Source Column 3 */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-semibold text-foreground tracking-wider uppercase text-xs">
                Open Source
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="LICENSE"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    AGPL-3.0 License
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5 text-accent" />
                    GitHub Source
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Divider & Line */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © 2026 Sovereign. Released under GNU Affero General Public License v3.0 (AGPL-3.0).
          </p>
          <div className="flex items-center gap-1">
            <span>Crafted for true digital sovereignty</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
