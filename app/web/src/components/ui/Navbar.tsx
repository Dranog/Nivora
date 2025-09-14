"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/ui"
const links = [
  { href: "/", label: "Accueil" },
  { href: "/explore", label: "Découvrir" },
  { href: "/dashboard", label: "Dashboard" },
]
export function Navbar() {
  const pathname = usePathname()
  return (
    <header className="bg-white/80 backdrop-blur border-b border-border">
      <div className="container-app flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">Creator</Link>
        <nav className="flex items-center gap-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={cn("px-2 py-1 rounded-md hover:bg-foreground/5", pathname === l.href && "bg-foreground/5")}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
