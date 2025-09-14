import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (token) return NextResponse.next()

  const url = new URL("/login", req.url)
  url.searchParams.set("next", new URL(req.url).pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
