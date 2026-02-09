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
import { BillForm } from '@/components/finance/bill-form'
import { BillTable } from '@/components/finance/bill-table'
import { formatCurrency } from '@/lib/utils'
import { calculateMonthlyAmount } from '@/lib/finance-utils'
import { Plus, Receipt, Calendar } from 'lucide-react'
import type { BillWithRelations, FinanceAccount, FinanceCategory } from '@/types'

export default function BillsPage() {
  const [bills, setBills] = useState<BillWithRelations[]>([])
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<BillWithRelations | null>(null)
  const [deletingBill, setDeletingBill] = useState<BillWithRelations | null>(null)

  const fetchData = async () => {
    try {
      const [billsRes, accountsRes, categoriesRes] = await Promise.all([
        fetch('/api/finance/bills'),
        fetch('/api/finance/accounts'),
        fetch('/api/finance/categories'),
      ])
      const [billsData, accountsData, categoriesData] = await Promise.all([
        billsRes.json(),
        accountsRes.json(),
        categoriesRes.json(),
      ])
      setBills(billsData.bills || [])
      setAccounts(accountsData.accounts || [])
      setCategories(categoriesData.categories || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (data: Partial<BillWithRelations>) => {
    const url = editingBill
      ? `/api/finance/bills/${editingBill.id}`
      : '/api/finance/bills'
    const method = editingBill ? 'PATCH' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      setIsDialogOpen(false)
      setEditingBill(null)
      fetchData()
    }
  }

  const handleDelete = async () => {
    if (!deletingBill) return

    const response = await fetch(`/api/finance/bills/${deletingBill.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setDeletingBill(null)
      fetchData()
    }
  }

  const activeBills = bills.filter((b) => b.isActive)
  const totalMonthly = activeBills.reduce((sum, bill) => sum + calculateMonthlyAmount(bill), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bills</h2>
          <p className="text-muted-foreground">
            Manage your recurring bills and expenses
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeBills.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalMonthly)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated monthly expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalMonthly * 12)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated annual expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading bills...</p>
            </div>
          ) : (
            <BillTable
              bills={bills}
              onEdit={(bill) => {
                setEditingBill(bill)
                setIsDialogOpen(true)
              }}
              onDelete={(bill) => setDeletingBill(bill)}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingBill(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBill ? 'Edit Bill' : 'Add New Bill'}
            </DialogTitle>
          </DialogHeader>
          <BillForm
            bill={editingBill}
            accounts={accounts}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingBill(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingBill}
        onOpenChange={(open) => !open && setDeletingBill(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBill?.name}"? This action cannot be undone.
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
    </div>
  )
}
