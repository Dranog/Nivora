import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url))
  res.cookies.set("session", "", { path: "/", maxAge: 0 })
  return res
}
