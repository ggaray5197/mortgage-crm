import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, LEAD_STATUSES } from '@/lib/utils'
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'

async function getDashboardData(userId: string) {
  const [
    totalLeads,
    newLeadsThisMonth,
    activeLoans,
    totalPipelineValue,
    wonLeads,
    recentLeads,
    upcomingTasks,
  ] = await Promise.all([
    prisma.lead.count({ where: { assignedToId: userId } }),
    prisma.lead.count({
      where: {
        assignedToId: userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.loan.count({
      where: {
        assignedToId: userId,
        status: { in: ['APPLICATION', 'PROCESSING', 'UNDERWRITING', 'APPROVED', 'CLOSING'] },
      },
    }),
    prisma.loan.aggregate({
      where: {
        assignedToId: userId,
        status: { in: ['APPLICATION', 'PROCESSING', 'UNDERWRITING', 'APPROVED', 'CLOSING'] },
      },
      _sum: { amount: true },
    }),
    prisma.lead.count({
      where: { assignedToId: userId, status: 'WON' },
    }),
    prisma.lead.findMany({
      where: { assignedToId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        assignedToId: userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
  ])

  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

  return {
    totalLeads,
    newLeadsThisMonth,
    activeLoans,
    totalPipelineValue: totalPipelineValue._sum.amount || 0,
    conversionRate,
    recentLeads,
    upcomingTasks,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const data = await getDashboardData(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Your mortgage pipeline at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Leads"
          value={data.totalLeads}
          description="from last month"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="New Leads"
          value={data.newLeadsThisMonth}
          description="this month"
          icon={TrendingUp}
        />
        <KPICard
          title="Active Loans"
          value={data.activeLoans}
          description="in pipeline"
          icon={CheckCircle2}
        />
        <KPICard
          title="Pipeline Value"
          value={formatCurrency(data.totalPipelineValue)}
          description="total loan amount"
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-sm">No leads yet. Start adding leads to see them here.</p>
            ) : (
              <div className="space-y-4">
                {data.recentLeads.map((lead) => {
                  const status = LEAD_STATUSES.find((s) => s.value === lead.status)
                  return (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={`${status?.color} text-white`}
                        >
                          {status?.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(lead.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming tasks. Create tasks to stay organized.</p>
            ) : (
              <div className="space-y-4">
                {data.upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle
                        className={`h-4 w-4 ${
                          task.priority === 'URGENT'
                            ? 'text-red-500'
                            : task.priority === 'HIGH'
                            ? 'text-orange-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {task.dueDate && formatDate(task.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
