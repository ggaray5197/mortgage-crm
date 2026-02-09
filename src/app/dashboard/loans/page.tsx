'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate, LOAN_STATUSES, LOAN_TYPES } from '@/lib/utils'
import { Plus, FileText, DollarSign, Building } from 'lucide-react'
import type { LoanWithRelations } from '@/types'

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('ALL')

  const fetchLoans = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (status && status !== 'ALL') params.set('status', status)

      const response = await fetch(`/api/loans?${params}`)
      const data = await response.json()
      setLoans(data.loans || [])
    } catch (error) {
      console.error('Failed to fetch loans:', error)
      setLoans([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [status])

  const totalPipelineValue = loans
    .filter((l) => !['CLOSED', 'DENIED', 'WITHDRAWN'].includes(l.status))
    .reduce((sum, loan) => sum + loan.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Loans</h2>
          <p className="text-muted-foreground">
            Track loan applications through the pipeline
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          New Loan Application
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loans.filter((l) => !['CLOSED', 'DENIED', 'WITHDRAWN'].includes(l.status)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Loan Pipeline
            </CardTitle>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {LOAN_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading loans...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No loans found. Convert a lead to a contact and create a loan application to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan #</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const loanStatus = LOAN_STATUSES.find((s) => s.value === loan.status)
                  const loanType = LOAN_TYPES.find((t) => t.value === loan.loanType)

                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">
                        {loan.loanNumber}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/contacts/${loan.contactId}`}
                          className="hover:text-primary"
                        >
                          {loan.contact.firstName} {loan.contact.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{loanType?.label || loan.loanType}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${loanStatus?.color} text-white`}>
                          {loanStatus?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {loan.propertyCity && loan.propertyState
                          ? `${loan.propertyCity}, ${loan.propertyState}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(loan.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
