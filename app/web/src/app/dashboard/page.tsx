import { KPIStat } from "@/components/app/KPIStat"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <KPIStat label="Revenus 30j" value="€0" />
        <KPIStat label="Abonnés actifs" value="0" />
        <KPIStat label="PPV ce mois" value="0" />
      </div>
      <Card title="Derniers posts">
        <EmptyState title="Aucun post" description="Publiez votre premier contenu pour démarrer." />
      </Card>
    </section>
  )
}
