'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import type { WeekProjectionData } from '@/types'

interface ProjectionChartProps {
  projection: WeekProjectionData[]
  currentBalance: number
}

export function ProjectionChart({ projection, currentBalance }: ProjectionChartProps) {
  const chartData = projection.map((week) => ({
    name: `Week ${week.weekNumber}`,
    weekLabel: format(new Date(week.weekStart), 'MMM d'),
    income: week.totalWeightedIncome,
    expenses: -week.totalExpenses, // Negative for visual
    endingBalance: week.endingBalance,
    isNegative: week.isNegative,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>4-Week Cash Flow Projection</span>
          <span className="text-sm font-normal text-muted-foreground">
            Starting Balance: {formatCurrency(currentBalance)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const absValue = Math.abs(value)
                  const label = name === 'expenses' ? 'Expenses' : name === 'income' ? 'Income (Weighted)' : 'Ending Balance'
                  return [formatCurrency(absValue), label]
                }}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" />
              <Bar
                dataKey="income"
                name="Income (Weighted)"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Balance Line Chart Below */}
        <div className="mt-6 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Projected Balance']}
              />
              <ReferenceLine y={0} stroke="#dc2626" strokeWidth={2} />
              <Bar dataKey="endingBalance" name="Projected Balance" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isNegative ? '#dc2626' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
