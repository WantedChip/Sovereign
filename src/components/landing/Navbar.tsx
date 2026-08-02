import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Compass, Menu, X, ArrowUpRight } from "lucide-react"

export function Navbar() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-ink/95 border-b border-slate-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Surveyor Seal */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-sm bg-brass/10 border border-brass/40 flex items-center justify-center transition-colors group-hover:border-brass group-hover:bg-brass/20">
            <Compass className="w-4 h-4 text-brass transition-transform duration-500 group-hover:rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-bold tracking-tight text-parchment leading-none">
              SOVEREIGN
            </span>
            <span className="text-[9px] font-mono text-brass tracking-widest uppercase">
              Field Survey System
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-muted-foreground">
          <a
            href="#features"
            className="hover:text-brass transition-colors duration-150"
          >
            Capabilities
          </a>
          <a
            href="#architecture"
            className="hover:text-brass transition-colors duration-150"
          >
            Transect Map
          </a>
          <a
            href="#privacy"
            className="hover:text-brass transition-colors duration-150"
          >
            Governance
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="default"
            size="sm"
            className="gap-2 font-mono text-xs tracking-wider"
            onClick={() => navigate("/app")}
          >
            Launch Workspace
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-parchment focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ink border-t border-slate-line px-4 pt-4 pb-6 space-y-3 font-mono text-xs uppercase tracking-wider">
          <a
            href="#features"
            className="block py-2 text-muted-foreground hover:text-brass"
            onClick={() => setMobileMenuOpen(false)}
          >
            Capabilities
          </a>
          <a
            href="#architecture"
            className="block py-2 text-muted-foreground hover:text-brass"
            onClick={() => setMobileMenuOpen(false)}
          >
            Transect Map
          </a>
          <a
            href="#privacy"
            className="block py-2 text-muted-foreground hover:text-brass"
            onClick={() => setMobileMenuOpen(false)}
          >
            Governance
          </a>
          <div className="pt-2">
            <Button
              variant="default"
              className="w-full gap-2 text-xs"
              onClick={() => {
                setMobileMenuOpen(false)
                navigate("/app")
              }}
            >
              Launch Workspace
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
