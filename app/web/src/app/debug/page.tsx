import { cookies } from "next/headers"

export default function DebugPage() {
  const session = cookies().get("session")?.value
  return (
    <div className="container-app py-6 space-y-3">
      <h1 className="text-xl font-semibold">Debug session</h1>
      <div>session cookie: <b>{session ?? "(none)"}</b></div>
      <div className="space-x-3">
        <a className="link" href="/login">/login</a>
        <a className="link" href="/logout">/logout</a>
        <a className="link" href="/dashboard">/dashboard</a>
      </div>
    </div>
  )
}
