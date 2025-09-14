import { cookies } from "next/headers"

export default function DebugPage() {
  const token = cookies().get("token")?.value
  return (
    <div className="container-app py-6 space-y-3">
      <h1 className="text-xl font-semibold">Debug auth</h1>
      <div>token cookie: <b>{token ?? "(none)"}</b></div>
      <div className="space-x-3">
        <a className="link" href="/login">/login</a>
        <a className="link" href="/logout">/logout</a>
        <a className="link" href="/dashboard">/dashboard</a>
      </div>
    </div>
  )
}
