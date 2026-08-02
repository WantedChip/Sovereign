import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-brass/40 bg-brass/10 text-brass",
        secondary:
          "border-slate-line bg-secondary text-secondary-foreground",
        oxblood:
          "border-oxblood/60 bg-oxblood/15 text-parchment",
        moss:
          "border-moss/60 bg-moss/15 text-moss",
        outline:
          "border-slate-line text-parchment bg-transparent",
        glass:
          "border-brass/40 bg-brass/10 text-brass",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
