'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BILL_FREQUENCIES } from '@/lib/finance-utils'
import type { Bill, FinanceAccount, FinanceCategory } from '@/types'

interface BillFormProps {
  bill?: Bill | null
  accounts: FinanceAccount[]
  categories: FinanceCategory[]
  onSubmit: (data: Partial<Bill>) => Promise<void>
  onCancel: () => void
}

export function BillForm({ bill, accounts, categories, onSubmit, onCancel }: BillFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: bill?.name || '',
    amount: bill?.amount?.toString() || '',
    frequency: bill?.frequency || 'MONTHLY',
    billingDay: bill?.billingDay?.toString() || '1',
    startDate: bill?.startDate ? new Date(bill.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: bill?.endDate ? new Date(bill.endDate).toISOString().split('T')[0] : '',
    isActive: bill?.isActive ?? true,
    notes: bill?.notes || '',
    accountId: bill?.accountId || '',
    categoryId: bill?.categoryId || '',
  })

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit({
        ...formData,
        accountId: formData.accountId || null,
        categoryId: formData.categoryId || null,
        endDate: formData.endDate || null,
      } as unknown as Partial<Bill>)
    } finally {
      setIsLoading(false)
    }
  }

  const getBillingDayLabel = () => {
    if (formData.frequency === 'WEEKLY') {
      return 'Day of Week (0=Sun, 6=Sat)'
    }
    return 'Day of Month (1-31)'
  }

  const getBillingDayMax = () => {
    return formData.frequency === 'WEEKLY' ? 6 : 31
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Bill Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Rent, Phone, Internet"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {BILL_FREQUENCIES.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingDay">{getBillingDayLabel()}</Label>
          <Input
            id="billingDay"
            type="number"
            min={formData.frequency === 'WEEKLY' ? 0 : 1}
            max={getBillingDayMax()}
            value={formData.billingDay}
            onChange={(e) => setFormData({ ...formData, billingDay: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Account (optional)</Label>
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
              {expenseCategories.map((category) => (
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

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : bill ? 'Update Bill' : 'Create Bill'}
        </Button>
      </div>
    </form>
  )
}
