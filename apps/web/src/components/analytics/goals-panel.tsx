'use client'

export function GoalsPanel() {
  const goals = [
    {
      label: 'Monthly revenue goal',
      current: 12450,
      target: 15000,
      percentage: 83,
      color: 'bg-primary'
    }
  ]

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Goals</h3>
      <div className="space-y-5">
        {goals.map((goal, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{goal.label}</span>
              <span className="text-sm font-semibold text-primary">{goal.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className={`${goal.color} h-full rounded-full transition-all duration-500`}
                style={{ width: `${goal.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                €{goal.current.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                €{goal.target.toLocaleString()}
              </p>
            </div>
          </div>
        ))}

        {/* Device Types (visible dans l'image) */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm font-medium mb-3">Device Types</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Desktop</span>
              <span className="font-medium">70%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mobile</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tablet</span>
              <span className="font-medium">5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
