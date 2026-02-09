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
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { formatIncomeSource, formatIncomeType, EXPECTED_INCOME_STATUSES } from '@/lib/finance-utils'
import { Edit, Trash2, Check, Calendar, Link2 } from 'lucide-react'
import { format } from 'date-fns'
import type { ExpectedIncomeWithRelations } from '@/types'

interface ExpectedIncomeTableProps {
  expectedIncomes: ExpectedIncomeWithRelations[]
  onEdit?: (item: ExpectedIncomeWithRelations) => void
  onDelete?: (item: ExpectedIncomeWithRelations) => void
  onConvert?: (item: ExpectedIncomeWithRelations) => void
}

export function ExpectedIncomeTable({
  expectedIncomes,
  onEdit,
  onDelete,
  onConvert,
}: ExpectedIncomeTableProps) {
  if (expectedIncomes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expected income found. Add deals from your pipeline to start tracking.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Expected Date</TableHead>
          <TableHead>Probability</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Linked Loan</TableHead>
          <TableHead>Status</TableHead>
          {(onEdit || onDelete || onConvert) && (
            <TableHead className="w-[140px]">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {expectedIncomes.map((item) => {
          const statusConfig = EXPECTED_INCOME_STATUSES.find((s) => s.value === item.status)
          const isPending = item.status === 'PENDING'

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.description}</TableCell>
              <TableCell>
                <div>
                  {formatCurrency(item.amount)}
                  <div className="text-xs text-muted-foreground">
                    Weighted: {formatCurrency((item.amount * item.probability) / 100)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(item.expectedDate), 'MMM d, yyyy')}
                </div>
              </TableCell>
              <TableCell>
                <div className="w-24">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{item.probability}%</span>
                  </div>
                  <Progress value={item.probability} className="h-2" />
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{formatIncomeSource(item.source)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatIncomeType(item.incomeType)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {item.loan ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Link2 className="h-3 w-3" />
                    {item.loan.loanNumber}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={`${statusConfig?.color} text-white`}>
                  {statusConfig?.label}
                </Badge>
              </TableCell>
              {(onEdit || onDelete || onConvert) && (
                <TableCell>
                  <div className="flex gap-1">
                    {isPending && onConvert && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onConvert(item)}
                        title="Mark as Received"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {isPending && onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
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
