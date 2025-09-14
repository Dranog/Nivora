import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { API_URL } from "@/lib/api"

async function login(formData: FormData) {
  "use server"
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")
  const next = String(formData.get("next") || "/dashboard")
  if (!email || !password) return

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) return
  const { token } = await res.json()
  const cookieStore = cookies() as any
  cookieStore.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  })
  redirect(next)
}

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <Card>
          <form action={login} className="space-y-3">
            <input type="hidden" name="next" value={searchParams?.next || "/dashboard"} />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Mot de passe" required />
            <Button className="w-full">Se connecter</Button>
          </form>
        </Card>
        <p className="text-sm text-slate-600">
          Pas de compte ? <a className="link" href="/register">Créer un compte</a>
        </p>
      </div>
    </section>
  )
}
