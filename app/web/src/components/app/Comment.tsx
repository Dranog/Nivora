export function Comment({ author = "Anonyme", text }: { author?: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-full bg-slate-300" />
      <div className="flex-1">
        <div className="text-sm font-medium">{author}</div>
        <div className="text-sm text-slate-700">{text}</div>
      </div>
    </div>
  )
}
