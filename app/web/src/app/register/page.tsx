import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"

async function register(formData: FormData) {
  "use server"
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
