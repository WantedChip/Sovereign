import { Skeleton } from "@/components/ui/skeleton"

export function WorkspaceSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden p-4 space-y-4 font-mono">
      <div className="h-12 bg-ink border border-slate-line flex items-center justify-between px-4">
        <Skeleton className="h-6 w-48 bg-slate-line/50" />
        <Skeleton className="h-6 w-32 bg-slate-line/50" />
      </div>
      <div className="flex-1 flex gap-4">
        <Skeleton className="w-64 bg-ink border border-slate-line" />
        <Skeleton className="flex-1 bg-ink border border-slate-line" />
        <Skeleton className="w-72 bg-ink border border-slate-line" />
      </div>
    </div>
  )
}
