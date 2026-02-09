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
  LEAD_STATUSES,
  LEAD_SOURCES,
  PROPERTY_TYPES,
  PRIORITIES,
} from '@/lib/utils'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  DollarSign,
  CreditCard,
  Calendar,
  MessageSquare,
  CheckSquare,
  User,
} from 'lucide-react'

async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      communications: {
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      tasks: {
        include: { assignedTo: true },
        orderBy: { dueDate: 'asc' },
      },
      contact: true,
    },
  })
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params
  const lead = await getLead(id)

  if (!lead) {
    notFound()
  }

  const status = LEAD_STATUSES.find((s) => s.value === lead.status)
  const priority = PRIORITIES.find((p) => p.value === lead.priority)
  const source = LEAD_SOURCES.find((s) => s.value === lead.source)
  const propertyType = PROPERTY_TYPES.find((t) => t.value === lead.propertyType)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {lead.firstName} {lead.lastName}
          </h2>
          <p className="text-muted-foreground">Lead Details</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${status?.color} text-white`}>
            {status?.label}
          </Badge>
          <Badge variant="outline">{priority?.label} Priority</Badge>
        </div>
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
                <a href={`mailto:${lead.email}`} className="hover:text-primary">
                  {lead.email}
                </a>
              </div>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${lead.phone}`} className="hover:text-primary">
                    {formatPhone(lead.phone)}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Lead Source</p>
                <p>{source?.label || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{formatDate(lead.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="font-semibold">
                  {lead.loanAmount ? formatCurrency(lead.loanAmount) : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Credit Score</p>
                <p className="font-semibold">{lead.creditScore || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="font-semibold">{propertyType?.label || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lead.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{lead.notes}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="communications">
        <TabsList>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications ({lead.communications.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks ({lead.tasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communications" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {lead.communications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No communications yet. Log a call or send an email to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {lead.communications.map((comm) => (
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
              {lead.tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks yet. Create a task to track follow-ups.
                </p>
              ) : (
                <div className="space-y-4">
                  {lead.tasks.map((task) => (
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
