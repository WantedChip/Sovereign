import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
    </div>
  )
}
