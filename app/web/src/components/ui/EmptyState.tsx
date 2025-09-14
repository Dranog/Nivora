import { Button } from "./Button"
export function EmptyState({ title, description, actionText, onAction }: { title: string; description?: string; actionText?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <h3 className="text-sm font-medium">{title}</h3>
      {description && <p className="max-w-md text-sm text-slate-600">{description}</p>}
      {actionText && onAction && <Button onClick={onAction}>{actionText}</Button>}
    </div>
  )
}
