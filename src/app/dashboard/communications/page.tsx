'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CommunicationLog } from '@/components/communications/communication-log'
import { CommunicationForm } from '@/components/communications/communication-form'
import { Plus, MessageSquare } from 'lucide-react'
import type { CommunicationWithRelations } from '@/types'

const COMMUNICATION_TYPES = [
  { value: 'ALL', label: 'All Types' },
  { value: 'CALL', label: 'Phone Calls' },
  { value: 'EMAIL', label: 'Emails' },
  { value: 'SMS', label: 'SMS/Text' },
  { value: 'NOTE', label: 'Notes' },
  { value: 'MEETING', label: 'Meetings' },
]

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<CommunicationWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('ALL')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  const fetchCommunications = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (type && type !== 'ALL') params.set('type', type)
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      const response = await fetch(`/api/communications?${params}`)
      const data = await response.json()
      setCommunications(data.communications)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch communications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunications()
  }, [type, pagination.page])

  const handleFormClose = () => {
    setShowForm(false)
    fetchCommunications()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
          <p className="text-muted-foreground">
            Track all client interactions and follow-ups
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Communication
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication History
            </CardTitle>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading communications...</p>
            </div>
          ) : (
            <>
              <CommunicationLog communications={communications} />

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} communications
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CommunicationForm open={showForm} onClose={handleFormClose} />
    </div>
  )
}
