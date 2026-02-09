'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectionChart } from '@/components/finance/projection-chart'
import { ProjectionWeekCard } from '@/components/finance/projection-week-card'
import { AccountCard } from '@/components/finance/account-card'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Receipt,
  ArrowRight,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import type { FinanceAccount, WeekProjectionData } from '@/types'

interface DashboardData {
  stats: {
    totalBalance: number
    totalMonthlyExpenses: number
    totalExpectedIncome: number
    upcomingBillsCount: number
    pendingDealsCount: number
    projectedBalance4Weeks: number
    thisMonthIncome: number
    thisMonthExpenses: number
  }
  accounts: FinanceAccount[]
  recentIncomes: Array<{
    id: string
    description: string
    amount: number
    date: string
    source: string
  }>
  recentExpenses: Array<{
    id: string
    description: string
    amount: number
    date: string
  }>
  upcomingExpectedIncomes: Array<{
    id: string
    description: string
    amount: number
    expectedDate: string
    probability: number
    loan?: { loanNumber: string; contact: { firstName: string; lastName: string } }
  }>
  projection: WeekProjectionData[]
}

export default function FinancePage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/finance/dashboard')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch finance dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading finance dashboard...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load finance data</p>
      </div>
    )
  }

  const { stats, accounts, projection, recentIncomes, recentExpenses, upcomingExpectedIncomes } = data
  const hasNegativeProjection = projection.some((w) => w.isNegative)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
          <p className="text-muted-foreground">
            Track your cash flow and projected income
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/finance/pipeline">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expected Income
            </Button>
          </Link>
        </div>
      </div>

      {/* Warning Banner */}
      {hasNegativeProjection && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">
                Projected Negative Balance
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                Your 4-week projection shows a potential negative balance. Review your upcoming bills and expected income.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalBalance < 0 ? 'text-red-500' : ''}`}>
              {formatCurrency(stats.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(stats.totalMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingBillsCount} bills due this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(stats.totalExpectedIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingDealsCount} pending deal{stats.pendingDealsCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">4-Week Projection</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.projectedBalance4Weeks < 0 ? 'text-red-500' : ''}`}>
              {formatCurrency(stats.projectedBalance4Weeks)}
            </div>
            <p className="text-xs text-muted-foreground">
              Projected ending balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Accounts</h3>
          <Link href="/dashboard/finance/accounts">
            <Button variant="outline" size="sm">
              Manage Accounts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No accounts set up yet</p>
              <Link href="/dashboard/finance/accounts">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>

      {/* Projection Chart */}
      {projection.length > 0 && (
        <ProjectionChart
          projection={projection}
          currentBalance={stats.totalBalance}
        />
      )}

      {/* Week-by-Week Projection */}
      {projection.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Week-by-Week Breakdown</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {projection.map((week) => (
              <ProjectionWeekCard key={week.weekNumber} week={week} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Upcoming Expected Income */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Upcoming Income
              </span>
              <Link href="/dashboard/finance/pipeline">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingExpectedIncomes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expected income scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingExpectedIncomes.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.expectedDate), 'MMM d')} • {item.probability}% probability
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Income */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Recent Income
              </span>
              <Link href="/dashboard/finance/income">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentIncomes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No income recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentIncomes.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-red-500" />
                Recent Expenses
              </span>
              <Link href="/dashboard/finance/expenses">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expenses recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      -{formatCurrency(item.amount)}
                    </span>
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
