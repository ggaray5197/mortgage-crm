'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { LeadForm } from './lead-form'
import {
  formatCurrency,
  formatDate,
  formatPhone,
  LEAD_STATUSES,
  PRIORITIES,
} from '@/lib/utils'
import { MoreHorizontal, Pencil, Trash2, Eye, Phone, Mail } from 'lucide-react'
import type { LeadWithRelations } from '@/types'

interface LeadTableProps {
  leads: LeadWithRelations[]
}

export function LeadTable({ leads }: LeadTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editingLead, setEditingLead] = useState<LeadWithRelations | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    try {
      const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')

      toast({ title: 'Lead deleted successfully' })
      router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update')

      toast({ title: 'Status updated successfully' })
      router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })
    }
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No leads found. Create your first lead to get started.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Loan Amount</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const status = LEAD_STATUSES.find((s) => s.value === lead.status)
            const priority = PRIORITIES.find((p) => p.value === lead.priority)

            return (
              <TableRow key={lead.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {lead.firstName} {lead.lastName}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        {formatPhone(lead.phone)}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto">
                        <Badge
                          className={`${status?.color} text-white cursor-pointer`}
                        >
                          {status?.label}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {LEAD_STATUSES.map((s) => (
                        <DropdownMenuItem
                          key={s.value}
                          onClick={() => handleStatusChange(lead.id, s.value)}
                        >
                          <Badge className={`${s.color} text-white mr-2`}>
                            {s.label}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={priority?.color}>
                    {priority?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.loanAmount ? formatCurrency(lead.loanAmount) : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.source?.replace('_', ' ') || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(lead.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingLead(lead)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {editingLead && (
        <LeadForm
          lead={editingLead}
          open={!!editingLead}
          onClose={() => setEditingLead(null)}
        />
      )}
    </>
  )
}
