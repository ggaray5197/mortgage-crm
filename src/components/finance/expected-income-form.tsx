'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INCOME_SOURCES, INCOME_TYPES } from '@/lib/finance-utils'
import type { ExpectedIncome, FinanceAccount, FinanceCategory, Loan } from '@/types'

interface ExpectedIncomeFormProps {
  expectedIncome?: ExpectedIncome | null
  accounts: FinanceAccount[]
  categories: FinanceCategory[]
  loans: Loan[]
  onSubmit: (data: Partial<ExpectedIncome>) => Promise<void>
  onCancel: () => void
}

export function ExpectedIncomeForm({
  expectedIncome,
  accounts,
  categories,
  loans,
  onSubmit,
  onCancel,
}: ExpectedIncomeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: expectedIncome?.description || '',
    amount: expectedIncome?.amount?.toString() || '',
    expectedDate: expectedIncome?.expectedDate
      ? new Date(expectedIncome.expectedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    probability: expectedIncome?.probability ?? 50,
    source: expectedIncome?.source || 'COMMISSION',
    incomeType: expectedIncome?.incomeType || 'MORTGAGE',
    notes: expectedIncome?.notes || '',
    loanId: expectedIncome?.loanId || '',
    accountId: expectedIncome?.accountId || '',
    categoryId: expectedIncome?.categoryId || '',
  })

  const incomeCategories = categories.filter((c) => c.type === 'INCOME')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit({
        ...formData,
        loanId: formData.loanId || null,
        accountId: formData.accountId || null,
        categoryId: formData.categoryId || null,
      } as unknown as Partial<ExpectedIncome>)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Smith Purchase Commission"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Expected Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedDate">Expected Date</Label>
          <Input
            id="expectedDate"
            type="date"
            value={formData.expectedDate}
            onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Probability: {formData.probability}%</Label>
        <Slider
          value={[formData.probability]}
          onValueChange={([value]) => setFormData({ ...formData, probability: value })}
          min={0}
          max={100}
          step={5}
        />
        <p className="text-xs text-muted-foreground">
          Higher probability means more weight in projections
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Income Source</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => setFormData({ ...formData, source: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_SOURCES.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incomeType">Income Type</Label>
          <Select
            value={formData.incomeType}
            onValueChange={(value) => setFormData({ ...formData, incomeType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="loanId">Link to Loan (optional)</Label>
        <Select
          value={formData.loanId}
          onValueChange={(value) => setFormData({ ...formData, loanId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select loan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No loan linked</SelectItem>
            {loans.map((loan) => (
              <SelectItem key={loan.id} value={loan.id}>
                {loan.loanNumber} - {loan.propertyCity || 'No address'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Deposit Account (optional)</Label>
          <Select
            value={formData.accountId}
            onValueChange={(value) => setFormData({ ...formData, accountId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No account</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category (optional)</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No category</SelectItem>
              {incomeCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional notes..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : expectedIncome ? 'Update' : 'Add Expected Income'}
        </Button>
      </div>
    </form>
  )
}
