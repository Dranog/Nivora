import { Button } from "@/components/ui/Button"
export function CheckoutBar({ amount = "€9.99" }: { amount?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-white p-3">
      <div className="text-sm">Total <span className="font-medium">{amount}</span></div>
      <Button>Procéder au paiement</Button>
    </div>
  )
}
