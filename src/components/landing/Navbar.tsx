import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X, ArrowRight } from "lucide-react"

export function Navbar() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center transition-all duration-300 group-hover:border-primary/60 group-hover:bg-primary/25 glow-purple">
            <Shield className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-xl font-bold tracking-tight gradient-text-silver font-sans">
            Sovereign
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a
            href="#features"
            className="hover:text-foreground transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#architecture"
            className="hover:text-foreground transition-colors duration-200"
          >
            Architecture
          </a>
          <a
            href="#privacy"
            className="hover:text-foreground transition-colors duration-200"
          >
            Privacy
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="default"
            className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 font-medium"
            onClick={() => navigate("/app")}
          >
            Launch Workspace
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border/40 px-4 pt-4 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <a
            href="#features"
            className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#architecture"
            className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Architecture
          </a>
          <a
            href="#privacy"
            className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Privacy
          </a>
          <div className="pt-2">
            <Button
              variant="default"
              className="w-full gap-2 shadow-lg shadow-primary/25"
              onClick={() => {
                setMobileMenuOpen(false)
                navigate("/app")
              }}
            >
              Launch Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
