import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhone,
  LOAN_STATUSES,
} from '@/lib/utils'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  MessageSquare,
  CheckSquare,
  FileText,
  User,
} from 'lucide-react'

async function getContact(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: {
      lead: true,
      loans: {
        include: { assignedTo: true },
        orderBy: { createdAt: 'desc' },
      },
      communications: {
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      tasks: {
        include: { assignedTo: true },
        orderBy: { dueDate: 'asc' },
      },
    },
  })
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params
  const contact = await getContact(id)

  if (!contact) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/contacts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {contact.firstName} {contact.lastName}
          </h2>
          <p className="text-muted-foreground">Contact Details</p>
        </div>
        {contact.lead && (
          <Badge variant="outline">Converted from Lead</Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${contact.email}`} className="hover:text-primary">
                  {contact.email}
                </a>
              </div>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${contact.phone}`} className="hover:text-primary">
                    {formatPhone(contact.phone)}
                  </a>
                </div>
              </div>
            )}
            {(contact.address || contact.city) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>
                    {contact.address && <span>{contact.address}<br /></span>}
                    {contact.city}, {contact.state} {contact.zipCode}
                  </p>
                </div>
              </div>
            )}
            {contact.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p>{formatDate(contact.dateOfBirth)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment & Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.employer && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Employer</p>
                  <p className="font-semibold">{contact.employer}</p>
                  {contact.jobTitle && (
                    <p className="text-sm text-muted-foreground">{contact.jobTitle}</p>
                  )}
                </div>
              </div>
            )}
            {contact.annualIncome && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Annual Income</p>
                  <p className="font-semibold">
                    {formatCurrency(contact.annualIncome)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Client Since</p>
                <p className="font-semibold">{formatDate(contact.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {contact.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{contact.notes}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="loans">
        <TabsList>
          <TabsTrigger value="loans" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Loans ({contact.loans.length})
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications ({contact.communications.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks ({contact.tasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {contact.loans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No loans yet. Create a loan application to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {contact.loans.map((loan) => {
                    const status = LOAN_STATUSES.find((s) => s.value === loan.status)
                    return (
                      <div
                        key={loan.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{loan.loanNumber}</p>
                            <Badge className={`${status?.color} text-white`}>
                              {status?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {loan.loanType} - {loan.loanPurpose}
                          </p>
                          {loan.propertyAddress && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {loan.propertyAddress}, {loan.propertyCity}, {loan.propertyState}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(loan.amount)}
                          </p>
                          {loan.interestRate && (
                            <p className="text-sm text-muted-foreground">
                              {loan.interestRate}% APR
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {contact.communications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No communications yet. Log a call or send an email to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {contact.communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          comm.type === 'CALL'
                            ? 'bg-green-100 text-green-600'
                            : comm.type === 'EMAIL'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {comm.type === 'CALL' ? (
                          <Phone className="h-5 w-5" />
                        ) : comm.type === 'EMAIL' ? (
                          <Mail className="h-5 w-5" />
                        ) : (
                          <MessageSquare className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {comm.subject || comm.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(comm.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {comm.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          by {comm.createdBy.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {contact.tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks yet. Create a task to track follow-ups.
                </p>
              ) : (
                <div className="space-y-4">
                  {contact.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div
                        className={`h-4 w-4 rounded-full ${
                          task.status === 'COMPLETED'
                            ? 'bg-green-500'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-yellow-500'
                            : 'bg-gray-300'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{task.priority}</Badge>
                        {task.dueDate && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
