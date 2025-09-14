import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"

export default function SupportPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Support</h1>
      <Card title="Nouveau ticket">
        <form className="space-y-3 max-w-lg">
          <Input placeholder="Sujet" />
          <Textarea placeholder="Décrivez votre demande…" rows={5} />
          <Button>Envoyer</Button>
        </form>
      </Card>
    </section>
  )
}
