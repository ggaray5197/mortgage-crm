'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowDown, ArrowUp, AlertTriangle, Calendar } from 'lucide-react'
import type { WeekProjectionData } from '@/types'

interface ProjectionWeekCardProps {
  week: WeekProjectionData
}

export function ProjectionWeekCard({ week }: ProjectionWeekCardProps) {
  return (
    <Card className={week.isNegative ? 'border-red-500 border-2' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Week {week.weekNumber}
          </div>
          {week.isNegative && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Negative Balance
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(new Date(week.weekStart), 'MMM d')} - {format(new Date(week.weekEnd), 'MMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Starting</p>
            <p className="font-semibold">{formatCurrency(week.startingBalance)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ending</p>
            <p className={`font-semibold ${week.isNegative ? 'text-red-500' : ''}`}>
              {formatCurrency(week.endingBalance)}
            </p>
          </div>
        </div>

        {/* Income */}
        {week.expectedIncomes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 mb-2">
              <ArrowUp className="h-4 w-4" />
              Expected Income ({formatCurrency(week.totalWeightedIncome)} weighted)
            </div>
            <div className="space-y-1 pl-6">
              {week.expectedIncomes.map((income) => (
                <div key={income.incomeId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {income.description}
                    <span className="text-xs ml-1">({income.probability}%)</span>
                  </span>
                  <span>{formatCurrency(income.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses */}
        {week.bills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 mb-2">
              <ArrowDown className="h-4 w-4" />
              Bills Due ({formatCurrency(week.totalExpenses)})
            </div>
            <div className="space-y-1 pl-6">
              {week.bills.map((bill, idx) => (
                <div key={`${bill.billId}-${idx}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {bill.billName}
                    <span className="text-xs ml-1">
                      ({format(new Date(bill.date), 'MMM d')})
                    </span>
                  </span>
                  <span>{formatCurrency(bill.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No activity */}
        {week.bills.length === 0 && week.expectedIncomes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No scheduled bills or expected income this week
          </p>
        )}

        {/* Net Change */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Net Change</span>
            <span className={`font-semibold ${week.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {week.netChange >= 0 ? '+' : ''}{formatCurrency(week.netChange)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
