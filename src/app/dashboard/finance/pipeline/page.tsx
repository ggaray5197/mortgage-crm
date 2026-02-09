'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ExpectedIncomeForm } from '@/components/finance/expected-income-form'
import { ExpectedIncomeTable } from '@/components/finance/expected-income-table'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, DollarSign, Target } from 'lucide-react'
import type { ExpectedIncomeWithRelations, FinanceAccount, FinanceCategory, Loan } from '@/types'

export default function PipelinePage() {
  const [expectedIncomes, setExpectedIncomes] = useState<ExpectedIncomeWithRelations[]>([])
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExpectedIncomeWithRelations | null>(null)
  const [deletingItem, setDeletingItem] = useState<ExpectedIncomeWithRelations | null>(null)
  const [convertingItem, setConvertingItem] = useState<ExpectedIncomeWithRelations | null>(null)

  const fetchData = async () => {
    try {
      const [expectedRes, accountsRes, categoriesRes, loansRes] = await Promise.all([
        fetch('/api/finance/expected-income'),
        fetch('/api/finance/accounts'),
        fetch('/api/finance/categories'),
        fetch('/api/loans'),
      ])
      const [expectedData, accountsData, categoriesData, loansData] = await Promise.all([
        expectedRes.json(),
        accountsRes.json(),
        categoriesRes.json(),
        loansRes.json(),
      ])
      setExpectedIncomes(expectedData.expectedIncomes || [])
      setAccounts(accountsData.accounts || [])
      setCategories(categoriesData.categories || [])
      setLoans(loansData.loans || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (data: Partial<ExpectedIncomeWithRelations>) => {
    const url = editingItem
      ? `/api/finance/expected-income/${editingItem.id}`
      : '/api/finance/expected-income'
    const method = editingItem ? 'PATCH' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      setIsDialogOpen(false)
      setEditingItem(null)
      fetchData()
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    const response = await fetch(`/api/finance/expected-income/${deletingItem.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setDeletingItem(null)
      fetchData()
    }
  }

  const handleConvert = async () => {
    if (!convertingItem) return

    const response = await fetch(`/api/finance/expected-income/${convertingItem.id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    if (response.ok) {
      setConvertingItem(null)
      fetchData()
    }
  }

  const pendingItems = expectedIncomes.filter((i) => i.status === 'PENDING')
  const receivedItems = expectedIncomes.filter((i) => i.status === 'RECEIVED')
  const totalPending = pendingItems.reduce((sum, i) => sum + i.amount, 0)
  const totalWeighted = pendingItems.reduce((sum, i) => sum + (i.amount * i.probability) / 100, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Income Pipeline</h2>
          <p className="text-muted-foreground">
            Track expected income from deals and commissions
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expected Income
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingItems.length}</div>
            <p className="text-xs text-muted-foreground">
              In your pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              If all deals close
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(totalWeighted)}
            </div>
            <p className="text-xs text-muted-foreground">
              Probability-adjusted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivedItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Converted to income
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expected Income Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Expected Income</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading pipeline...</p>
            </div>
          ) : (
            <ExpectedIncomeTable
              expectedIncomes={expectedIncomes}
              onEdit={(item) => {
                setEditingItem(item)
                setIsDialogOpen(true)
              }}
              onDelete={(item) => setDeletingItem(item)}
              onConvert={(item) => setConvertingItem(item)}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Expected Income' : 'Add Expected Income'}
            </DialogTitle>
          </DialogHeader>
          <ExpectedIncomeForm
            expectedIncome={editingItem}
            accounts={accounts}
            categories={categories}
            loans={loans}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingItem(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expected Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert Confirmation */}
      <AlertDialog
        open={!!convertingItem}
        onOpenChange={(open) => !open && setConvertingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Received</AlertDialogTitle>
            <AlertDialogDescription>
              This will convert "{convertingItem?.description}" to realized income of {convertingItem && formatCurrency(convertingItem.amount)}.
              {convertingItem?.accountId && ' The amount will be added to your account balance.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvert} className="bg-green-500 hover:bg-green-600">
              Mark as Received
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
