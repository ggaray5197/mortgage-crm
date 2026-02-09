'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { TaskForm } from './task-form'
import { formatDate, formatDateTime, PRIORITIES } from '@/lib/utils'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
} from 'lucide-react'
import type { TaskWithRelations } from '@/types'

interface TaskListProps {
  tasks: TaskWithRelations[]
  onRefresh: () => void
}

const TYPE_ICONS = {
  FOLLOW_UP: CheckSquare,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  DOCUMENT: FileText,
  OTHER: Clock,
}

export function TaskList({ tasks, onRefresh }: TaskListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)

  const handleStatusToggle = async (task: TaskWithRelations) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast({
        title: newStatus === 'COMPLETED' ? 'Task completed' : 'Task reopened',
      })
      onRefresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')

      toast({ title: 'Task deleted successfully' })
      onRefresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      })
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No tasks found. Create a task to get started.
        </p>
      </div>
    )
  }

  const isOverdue = (task: TaskWithRelations) =>
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'COMPLETED'

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => {
          const Icon = TYPE_ICONS[task.type as keyof typeof TYPE_ICONS] || Clock
          const priority = PRIORITIES.find((p) => p.value === task.priority)
          const overdue = isOverdue(task)

          return (
            <div
              key={task.id}
              className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                task.status === 'COMPLETED'
                  ? 'bg-muted/50 opacity-75'
                  : overdue
                  ? 'border-red-200 bg-red-50'
                  : 'hover:bg-muted/50'
              }`}
            >
              <Checkbox
                checked={task.status === 'COMPLETED'}
                onCheckedChange={() => handleStatusToggle(task)}
                className="mt-1"
              />

              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  task.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`font-medium ${
                        task.status === 'COMPLETED' ? 'line-through' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    {(task.lead || task.contact) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.lead
                          ? `Lead: ${task.lead.firstName} ${task.lead.lastName}`
                          : `Contact: ${task.contact?.firstName} ${task.contact?.lastName}`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        task.status === 'COMPLETED'
                          ? ''
                          : priority?.color.replace('bg-', 'border-')
                      }
                    >
                      {priority?.label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTask(task)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 mt-2 text-sm ${
                      overdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {overdue ? 'Overdue: ' : 'Due: '}
                    {formatDateTime(task.dueDate)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {editingTask && (
        <TaskForm
          task={editingTask}
          open={!!editingTask}
          onClose={() => {
            setEditingTask(null)
            onRefresh()
          }}
        />
      )}
    </>
  )
}
