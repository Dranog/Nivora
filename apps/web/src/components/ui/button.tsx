"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-2xl text-sm font-medium transition-all select-none",
    "outline-none ring-offset-background",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "data-[state=loading]:cursor-progress",
  ].join(" "),
  {
    variants: {
      variant: {
        brand:
          "bg-gradient-to-r from-brand-start to-brand-end text-white shadow-sm hover:opacity-95",
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-5",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "default",
    },
  }
)

type NativeButton = React.ComponentProps<"button">
type ButtonProps = NativeButton &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
  }

function Spinner() {
  return (
    <svg
      aria-hidden={true}
      viewBox="0 0 24 24"
      className="size-4 animate-spin"
      role="img"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" fill="none" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const ariaBusy = isLoading ? true : undefined

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-state={isLoading ? "loading" : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      aria-busy={ariaBusy}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span className="sr-only">Chargement…</span>
          <span aria-hidden={true}>{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
