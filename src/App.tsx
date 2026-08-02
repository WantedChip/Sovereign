import { Button } from "@/components/ui/button"

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          Sovereign
        </h1>
        <p className="text-muted-foreground text-sm">
          Local-first collaborative knowledge workspace with on-device AI.
        </p>
        <div className="rounded-lg border border-border bg-card p-4 text-xs font-mono text-card-foreground">
          Project Initialized (v0.1.0)
        </div>
        <div>
          <Button variant="default">Get Started</Button>
        </div>
      </div>
    </div>
  )
}
