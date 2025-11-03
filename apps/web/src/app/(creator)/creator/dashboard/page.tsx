// path: apps/web/src/app/dashboard/page.tsx
import { PageContainer } from '@/components/layout/page-container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Users, Eye, Heart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Trend = 'up' | 'down' | 'flat'

type Kpi = {
  label: string
  value: string
  change: string
  trend: Trend
  icon: LucideIcon
}

export default function DashboardPage() {
  const kpis: Kpi[] = [
    { label: 'Monthly Revenue',  value: '$12,450', change: '+12.5%', trend: 'up',  icon: TrendingUp },
    { label: 'Total Subscribers', value: '1,234',  change: '+8.2%',  trend: 'up',  icon: Users },
    { label: 'Content Views',     value: '45.2K',  change: '+15.3%', trend: 'up',  icon: Eye },
    { label: 'Engagement Rate',   value: '24.8%',  change: '+3.1%',  trend: 'up',  icon: Heart },
  ]

  return (
    <PageContainer
      title="Dashboard"
      description="Welcome back! Here's an overview of your creator performance."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard' },
      ]}
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" aria-hidden={true} />
          New Content
        </Button>
      }
    >
      {/* KPI Cards */}
      <section aria-label="Key performance indicators" className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, change, icon: Icon }, i) => (
          <Card key={label + i} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden={true} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm font-medium text-primary">{change} from last month</p>
            </div>
          </Card>
        ))}
      </section>

      {/* Success Message */}
      <section aria-label="App shell status">
        <Card className="border-primary/20 bg-primary/5 p-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-2 text-2xl font-bold text-primary">App Shell (F1) is ready!</h2>
            <p className="mb-6 text-muted-foreground">
              Your foundation is complete with a responsive layout, navigation system, and theme support.
              Try toggling dark mode, collapsing the sidebar, or resizing your browser to test responsiveness.
            </p>
            <ul className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                'Navbar with search & notifications',
                'Role-based sidebar navigation',
                'Responsive mobile layout',
                'Dark mode support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden={true} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>
    </PageContainer>
  )
}
