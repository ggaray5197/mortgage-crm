'use client'

import { formatDateTime, formatPhone } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, MessageSquare, Calendar, FileText } from 'lucide-react'
import type { CommunicationWithRelations } from '@/types'

interface CommunicationLogProps {
  communications: CommunicationWithRelations[]
}

const TYPE_ICONS = {
  CALL: Phone,
  EMAIL: Mail,
  SMS: MessageSquare,
  NOTE: FileText,
  MEETING: Calendar,
}

const TYPE_COLORS = {
  CALL: 'bg-green-100 text-green-600',
  EMAIL: 'bg-blue-100 text-blue-600',
  SMS: 'bg-purple-100 text-purple-600',
  NOTE: 'bg-gray-100 text-gray-600',
  MEETING: 'bg-orange-100 text-orange-600',
}

export function CommunicationLog({ communications }: CommunicationLogProps) {
  if (communications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No communications logged yet. Start by logging a call or email.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => {
        const Icon = TYPE_ICONS[comm.type as keyof typeof TYPE_ICONS] || MessageSquare
        const colorClass = TYPE_COLORS[comm.type as keyof typeof TYPE_COLORS] || TYPE_COLORS.NOTE

        return (
          <div key={comm.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      {comm.subject || comm.type.charAt(0) + comm.type.slice(1).toLowerCase()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {comm.direction || 'OUTBOUND'}
                    </Badge>
                    {comm.outcome && (
                      <Badge variant="secondary" className="text-xs">
                        {comm.outcome}
                      </Badge>
                    )}
                  </div>
                  {(comm.lead || comm.contact) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {comm.lead
                        ? `Lead: ${comm.lead.firstName} ${comm.lead.lastName}`
                        : `Contact: ${comm.contact?.firstName} ${comm.contact?.lastName}`}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(comm.createdAt)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                {comm.content}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>by {comm.createdBy.name}</span>
                {comm.duration && (
                  <span>Duration: {Math.floor(comm.duration / 60)}m {comm.duration % 60}s</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
