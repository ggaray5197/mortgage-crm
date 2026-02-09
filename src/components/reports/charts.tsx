'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

interface LeadsByStatusChartProps {
  data: { status: string; count: number }[]
}

export function LeadsByStatusChart({ data }: LeadsByStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="status" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface LeadsBySourceChartProps {
  data: { source: string; count: number }[]
}

export function LeadsBySourceChart({ data }: LeadsBySourceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="source"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface MonthlyTrendsChartProps {
  data: { month: string; leads: number; conversions: number; loanVolume: number }[]
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Monthly Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'loanVolume') return formatCurrency(value)
                  return value
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="leads"
                stroke="#3b82f6"
                strokeWidth={2}
                name="New Leads"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="conversions"
                stroke="#22c55e"
                strokeWidth={2}
                name="Conversions"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="loanVolume"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Loan Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface LoansByStatusChartProps {
  data: { status: string; count: number; amount: number }[]
}

export function LoansByStatusChart({ data }: LoansByStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Pipeline by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'amount') return formatCurrency(value)
                  return value
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Count" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="amount" fill="#22c55e" name="Amount" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface CommunicationsByTypeChartProps {
  data: { type: string; count: number }[]
}

export function CommunicationsByTypeChart({ data }: CommunicationsByTypeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communications by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="count"
                nameKey="type"
                label={({ type, count }) => `${type}: ${count}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
