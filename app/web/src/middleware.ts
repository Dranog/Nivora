import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// TEST: redirige TOUT ce qui passe par le matcher (même si cookie présent)
// pour vérifier que le middleware s'exécute bien.
export function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL("/login", req.url))
}

// Limite le middleware aux routes dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
}
