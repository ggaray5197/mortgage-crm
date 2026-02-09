'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KPICard } from '@/components/dashboard/kpi-card'
import {
  LeadsByStatusChart,
  LeadsBySourceChart,
  MonthlyTrendsChart,
  LoansByStatusChart,
  CommunicationsByTypeChart,
} from '@/components/reports/charts'
import { formatCurrency } from '@/lib/utils'
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  BarChart3,
} from 'lucide-react'

interface ReportData {
  overview: {
    totalLeads: number
    newLeadsInPeriod: number
    wonLeadsInPeriod: number
    conversionRate: number
    totalLoans: number
    pipelineValue: number
    closedLoansInPeriod: number
    closedLoanValue: number
    totalCommunications: number
    totalTasks: number
    completedTasks: number
    overdueTasks: number
  }
  leadsByStatus: { status: string; count: number }[]
  leadsBySource: { source: string; count: number }[]
  loansByStatus: { status: string; count: number; amount: number }[]
  communicationsByType: { type: string; count: number }[]
  monthlyTrends: { month: string; leads: number; conversions: number; loanVolume: number }[]
}

const PERIODS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: '365', label: 'Last Year' },
]

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reports?period=${period}`)
      const reportData = await response.json()
      setData(reportData)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [period])

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Loading your performance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Track your performance and pipeline metrics
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Leads"
          value={data.overview.totalLeads}
          description={`${data.overview.newLeadsInPeriod} new in period`}
          icon={Users}
        />
        <KPICard
          title="Conversion Rate"
          value={`${data.overview.conversionRate}%`}
          description={`${data.overview.wonLeadsInPeriod} converted`}
          icon={Target}
        />
        <KPICard
          title="Pipeline Value"
          value={formatCurrency(data.overview.pipelineValue)}
          description={`${data.overview.totalLoans} active loans`}
          icon={DollarSign}
        />
        <KPICard
          title="Closed Loans"
          value={formatCurrency(data.overview.closedLoanValue)}
          description={`${data.overview.closedLoansInPeriod} loans closed`}
          icon={TrendingUp}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Communications"
          value={data.overview.totalCommunications}
          description="in selected period"
          icon={MessageSquare}
        />
        <KPICard
          title="Tasks Completed"
          value={data.overview.completedTasks}
          description={`of ${data.overview.totalTasks} total`}
          icon={CheckCircle2}
        />
        <KPICard
          title="Overdue Tasks"
          value={data.overview.overdueTasks}
          description="need attention"
          icon={AlertCircle}
        />
        <KPICard
          title="Avg Conversion"
          value={data.overview.conversionRate > 0 ? `${data.overview.conversionRate}%` : 'N/A'}
          description="lead to client"
          icon={BarChart3}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <MonthlyTrendsChart data={data.monthlyTrends} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LeadsByStatusChart data={data.leadsByStatus} />
        <LeadsBySourceChart data={data.leadsBySource} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LoansByStatusChart data={data.loansByStatus} />
        <CommunicationsByTypeChart data={data.communicationsByType} />
      </div>
    </div>
  )
}
