'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList } from '@/components/tasks/task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { PRIORITIES } from '@/lib/utils'
import { Plus, CheckSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { TaskWithRelations } from '@/types'

const TASK_STATUSES = [
  { value: 'ALL', label: 'All Tasks' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [activeTab, setActiveTab] = useState('all')

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      if (activeTab === 'pending') {
        params.set('status', 'PENDING')
      } else if (activeTab === 'overdue') {
        params.set('status', 'PENDING')
      } else if (activeTab === 'completed') {
        params.set('status', 'COMPLETED')
      } else if (status && status !== 'ALL') {
        params.set('status', status)
      }

      if (priority && priority !== 'ALL') {
        params.set('priority', priority)
      }

      const response = await fetch(`/api/tasks?${params}`)
      const data = await response.json()

      let filteredTasks = data.tasks

      if (activeTab === 'overdue') {
        filteredTasks = filteredTasks.filter(
          (task: TaskWithRelations) =>
            task.dueDate &&
            new Date(task.dueDate) < new Date() &&
            task.status !== 'COMPLETED'
        )
      }

      setTasks(filteredTasks)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [status, priority, activeTab])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleFormClose = () => {
    setShowForm(false)
    fetchTasks()
  }

  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length
  const overdueCount = tasks.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Manage your follow-ups and to-do items
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter((t) => t.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Task List
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">
                Pending {pendingCount > 0 && `(${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger value="overdue" className="text-red-600">
                Overdue {overdueCount > 0 && `(${overdueCount})`}
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading tasks...</p>
                </div>
              ) : (
                <TaskList tasks={tasks} onRefresh={fetchTasks} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TaskForm open={showForm} onClose={handleFormClose} />
    </div>
  )
}
