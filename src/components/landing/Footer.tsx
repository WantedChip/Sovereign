import { Compass, FileText, Lock, Code2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Footer() {
  return (
    <footer
      id="privacy"
      className="relative bg-ink border-t border-slate-line text-parchment pt-16 pb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-brass/10 border border-brass flex items-center justify-center">
                <Compass className="w-4 h-4 text-brass" />
              </div>
              <span className="text-xl font-serif font-bold tracking-tight text-parchment">
                SOVEREIGN
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm font-sans">
              The self-governed, offline-first knowledge workspace. Operates entirely inside your
              web browser sandbox with zero cloud dependencies.
            </p>

            <div className="pt-2">
              <Badge
                variant="default"
                className="gap-1.5 px-3 py-1 text-[10px] font-mono border-moss/50 text-moss bg-moss/10"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>100% CLIENT-SIDE • ZERO TELEMETRY</span>
              </Badge>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-mono">
            {/* Column 1 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-brass tracking-wider uppercase">Navigation</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-parchment transition-colors">
                    Capabilities
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-parchment transition-colors">
                    Transect Map
                  </a>
                </li>
                <li>
                  <a href="#app" className="hover:text-parchment transition-colors">
                    Workspace App
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-brass tracking-wider uppercase">Tech Stack</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Tiptap v3 & Yjs</li>
                <li>WebGPU & WebLLM</li>
                <li>OPFS & Dexie.js</li>
                <li>Orama Vector Index</li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-semibold text-brass tracking-wider uppercase">Governance</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="LICENSE"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-parchment transition-colors inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-brass" />
                    AGPL-3.0 License
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-parchment transition-colors inline-flex items-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5 text-brass" />
                    GitHub Source
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-slate-line/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-muted-foreground">
          <p>© 2026 Sovereign. Released under GNU Affero General Public License v3.0 (AGPL-3.0).</p>
          <div className="flex items-center gap-1 text-brass">
            <span>SURVEY INSTRUMENT SYSTEM</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
