'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { formatAccountType } from '@/lib/finance-utils'
import { CreditCard, Wallet, PiggyBank, Banknote, Edit, Trash2, Star } from 'lucide-react'
import type { FinanceAccount } from '@/types'

interface AccountCardProps {
  account: FinanceAccount
  onEdit?: (account: FinanceAccount) => void
  onDelete?: (account: FinanceAccount) => void
}

const accountIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CHECKING: Wallet,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  CASH: Banknote,
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const Icon = accountIcons[account.type] || Wallet
  const isNegative = account.balance < 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
          {account.isDefault && (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        <Badge variant="secondary">{formatAccountType(account.type)}</Badge>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isNegative ? 'text-red-500' : ''}`}>
          {formatCurrency(account.balance)}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(account)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(account)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
