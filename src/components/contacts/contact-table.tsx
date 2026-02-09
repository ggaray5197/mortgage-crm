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
import { ContactForm } from './contact-form'
import { formatCurrency, formatPhone } from '@/lib/utils'
import { MoreHorizontal, Pencil, Trash2, Eye, Phone, Mail, FileText } from 'lucide-react'
import type { ContactWithRelations } from '@/types'

interface ContactTableProps {
  contacts: (ContactWithRelations & { _count: { communications: number; tasks: number } })[]
}

export function ContactTable({ contacts }: ContactTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editingContact, setEditingContact] = useState<ContactWithRelations | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')

      toast({ title: 'Contact deleted successfully' })
      router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      })
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No contacts found. Create your first contact to get started.</p>
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
            <TableHead>Location</TableHead>
            <TableHead>Employment</TableHead>
            <TableHead>Income</TableHead>
            <TableHead>Loans</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Link
                  href={`/dashboard/contacts/${contact.id}`}
                  className="font-medium hover:text-primary"
                >
                  {contact.firstName} {contact.lastName}
                </Link>
                {contact.lead && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    From Lead
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {formatPhone(contact.phone)}
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {contact.city && contact.state
                  ? `${contact.city}, ${contact.state}`
                  : '-'}
              </TableCell>
              <TableCell>
                {contact.employer ? (
                  <div>
                    <p className="font-medium">{contact.employer}</p>
                    {contact.jobTitle && (
                      <p className="text-sm text-muted-foreground">
                        {contact.jobTitle}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {contact.annualIncome
                  ? formatCurrency(contact.annualIncome)
                  : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.loans?.length || 0}</span>
                </div>
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
                      <Link href={`/dashboard/contacts/${contact.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingContact(contact)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingContact && (
        <ContactForm
          contact={editingContact}
          open={!!editingContact}
          onClose={() => setEditingContact(null)}
        />
      )}
    </>
  )
}
