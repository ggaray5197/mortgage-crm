'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { formatFrequency, getNextBillDate, calculateMonthlyAmount } from '@/lib/finance-utils'
import { Edit, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { BillWithRelations } from '@/types'

interface BillTableProps {
  bills: BillWithRelations[]
  onEdit?: (bill: BillWithRelations) => void
  onDelete?: (bill: BillWithRelations) => void
}

export function BillTable({ bills, onEdit, onDelete }: BillTableProps) {
  if (bills.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bills found. Add your first bill to start tracking.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Next Due</TableHead>
          <TableHead>Monthly Est.</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          {(onEdit || onDelete) && <TableHead className="w-[100px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((bill) => {
          const nextDate = getNextBillDate(bill)
          const monthlyAmount = calculateMonthlyAmount(bill)

          return (
            <TableRow key={bill.id}>
              <TableCell className="font-medium">{bill.name}</TableCell>
              <TableCell>{formatCurrency(bill.amount)}</TableCell>
              <TableCell>{formatFrequency(bill.frequency)}</TableCell>
              <TableCell>
                {nextDate ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {format(nextDate, 'MMM d, yyyy')}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {monthlyAmount > 0 ? formatCurrency(monthlyAmount) : '-'}
              </TableCell>
              <TableCell>
                {bill.category ? (
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: bill.category.color + '20', color: bill.category.color }}
                  >
                    {bill.category.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={bill.isActive ? 'default' : 'secondary'}>
                  {bill.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              {(onEdit || onDelete) && (
                <TableCell>
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(bill)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(bill)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
