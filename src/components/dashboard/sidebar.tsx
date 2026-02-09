'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Building2,
  LayoutDashboard,
  Users,
  UserCircle,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
  FileText,
  Wallet,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Contacts', href: '/dashboard/contacts', icon: UserCircle },
  { name: 'Loans', href: '/dashboard/loans', icon: FileText },
  { name: 'Communications', href: '/dashboard/communications', icon: MessageSquare },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Finance', href: '/dashboard/finance', icon: Wallet },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <Building2 className="h-8 w-8 text-blue-500" />
        <span className="text-xl font-bold text-white">Mortgage CRM</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
