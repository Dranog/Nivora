import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
export function PostCard({ caption, isPaid = false }: { caption: string; isPaid?: boolean }) {
  return (
    <Card>
      <div className="aspect-video rounded-md bg-muted mb-3" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-medium">{caption}</div>
          <Badge variant={isPaid ? "danger" : "success"}>{isPaid ? "Payant" : "Gratuit"}</Badge>
        </div>
        <Button size="sm">{isPaid ? "Acheter" : "Voir"}</Button>
      </div>
    </Card>
  )
}
