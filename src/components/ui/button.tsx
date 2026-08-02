import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-brass text-ink border border-brass hover:bg-brass/90 shadow-sm active:translate-y-px",
        outline:
          "border border-slate-line bg-transparent text-parchment hover:border-brass hover:text-brass transition-colors",
        secondary:
          "border border-slate-line bg-secondary text-secondary-foreground hover:border-brass/60 hover:text-parchment",
        oxblood:
          "border border-oxblood bg-oxblood/20 text-parchment hover:bg-oxblood/40 hover:border-oxblood",
        ghost:
          "text-muted-foreground hover:bg-secondary hover:text-parchment border border-transparent",
        stamp:
          "border border-brass/80 bg-ink text-brass hover:bg-brass hover:text-ink shadow-sm transition-colors",
        link: "text-brass underline-offset-4 hover:underline lowercase font-sans font-normal",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-[11px]",
        lg: "h-11 rounded-sm px-6 text-xs",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
