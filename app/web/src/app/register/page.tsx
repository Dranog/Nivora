import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { API_URL } from "@/lib/api"

async function register(formData: FormData) {
  "use server"
  const email = String(formData.get("email") || "")
  const username = String(formData.get("username") || "")
  const password = String(formData.get("password") || "")
  const name = String(formData.get("name") || "") || undefined
  if (!email || !username || !password) return

  await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password, name }),
  })
  redirect("/login")
}

export default function RegisterPage() {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Créer un compte</h1>
        <Card>
          <form action={register} className="space-y-3">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="username" type="text" placeholder="Nom d'utilisateur" required />
            <Input name="name" type="text" placeholder="Nom" />
            <Input name="password" type="password" placeholder="Mot de passe" required />
            <Button className="w-full">Créer mon compte</Button>
          </form>
        </Card>
        <p className="text-sm text-slate-600">
          Déjà inscrit ? <a className="link" href="/login">Se connecter</a>
        </p>
      </div>
    </section>
  )
}
