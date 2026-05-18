import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_16px_30px_-20px_rgba(18,110,130,0.9)] hover:bg-primary-dark hover:shadow-[0_18px_36px_-18px_rgba(11,77,91,0.9)]",
        outline:
          "border-border bg-card text-primary hover:border-primary/35 hover:bg-muted hover:text-primary-dark aria-expanded:bg-muted aria-expanded:text-primary-dark",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_16px_28px_-20px_rgba(53,182,180,0.75)] hover:bg-secondary-strong aria-expanded:bg-secondary-strong aria-expanded:text-secondary-foreground",
        accent:
          "bg-accent text-accent-foreground shadow-[0_16px_30px_-20px_rgba(244,124,92,0.8)] hover:bg-accent-strong",
        ghost:
          "text-primary hover:bg-primary/8 hover:text-primary-dark aria-expanded:bg-primary/8 aria-expanded:text-primary-dark",
        destructive:
          "bg-destructive text-white shadow-[0_16px_30px_-20px_rgba(217,74,74,0.8)] hover:brightness-95 focus-visible:border-destructive focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-8 gap-1.5 rounded-xl px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-xl px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11",
        "icon-xs":
          "size-8 rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-xl",
        "icon-lg": "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
