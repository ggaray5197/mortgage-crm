'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { formatIncomeSource, formatIncomeType } from '@/lib/finance-utils'
import { TrendingUp, DollarSign, Link2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import type { IncomeWithRelations } from '@/types'

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const response = await fetch('/api/finance/income')
        const data = await response.json()
        setIncomes(data.incomes || [])
      } catch (error) {
        console.error('Failed to fetch incomes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIncomes()
  }, [])

  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const thisMonthIncome = incomes
    .filter((i) => {
      const date = new Date(i.date)
      return date >= thisMonthStart && date <= thisMonthEnd
    })
    .reduce((sum, i) => sum + i.amount, 0)

  const lastMonthIncome = incomes
    .filter((i) => {
      const date = new Date(i.date)
      return date >= lastMonthStart && date <= lastMonthEnd
    })
    .reduce((sum, i) => sum + i.amount, 0)

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Income History</h2>
        <p className="text-muted-foreground">
          View your realized income and commissions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(thisMonthIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(thisMonthStart, 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(lastMonthIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(lastMonthStart, 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Time</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {incomes.length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Income</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading income...</p>
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No income recorded yet. Income is automatically added when you mark expected income as received.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Linked Loan</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      {format(new Date(income.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {income.description}
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      +{formatCurrency(income.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatIncomeSource(income.source)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatIncomeType(income.incomeType)}
                    </TableCell>
                    <TableCell>
                      {income.loan ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Link2 className="h-3 w-3" />
                          {income.loan.loanNumber}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {income.category ? (
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: income.category.color + '20',
                            color: income.category.color,
                          }}
                        >
                          {income.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
