import "./globals.css"
import { Navbar } from "@/components/ui/Navbar"

export const metadata = { title: "Creator", description: "MVP" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main className="container-app py-6">{children}</main>
      </body>
    </html>
  )
}
