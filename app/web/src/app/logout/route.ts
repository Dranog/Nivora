import { NextResponse } from "next/server"
import { API_URL } from "@/lib/api"

export async function GET(req: Request) {
  await fetch(`${API_URL}/auth/logout`, { method: "POST" })
  const res = NextResponse.redirect(new URL("/", req.url))
  res.cookies.set("token", "", { path: "/", maxAge: 0 })
  return res
}
