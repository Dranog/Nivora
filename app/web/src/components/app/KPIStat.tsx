export function KPIStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
