"use client"

import * as React from "react"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Label ARIA pour accessibilité. Si non fourni, le rôle n'est pas forcé.
   */
  ariaLabel?: string
}

export function ScrollArea({ className, ariaLabel, children, ...rest }: Props) {
  return (
    <div
      className={["overflow-auto [scrollbar-width:thin]", className ?? ""].join(" ")}
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      tabIndex={ariaLabel ? 0 : -1}
      {...rest}
    >
      {children}
    </div>
  )
}
export default ScrollArea
