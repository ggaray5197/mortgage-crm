import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function generateLoanNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `LN-${year}-${random}`
}

export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New', color: 'bg-blue-500' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-500' },
  { value: 'PROPOSAL', label: 'Proposal', color: 'bg-indigo-500' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-500' },
  { value: 'WON', label: 'Won', color: 'bg-green-500' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-500' },
] as const

export const LOAN_STATUSES = [
  { value: 'APPLICATION', label: 'Application', color: 'bg-blue-500' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-yellow-500' },
  { value: 'UNDERWRITING', label: 'Underwriting', color: 'bg-purple-500' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-500' },
  { value: 'CLOSING', label: 'Closing', color: 'bg-indigo-500' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-emerald-500' },
  { value: 'DENIED', label: 'Denied', color: 'bg-red-500' },
  { value: 'WITHDRAWN', label: 'Withdrawn', color: 'bg-gray-500' },
] as const

export const PROPERTY_TYPES = [
  { value: 'SINGLE_FAMILY', label: 'Single Family' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'MULTI_FAMILY', label: 'Multi-Family' },
  { value: 'COMMERCIAL', label: 'Commercial' },
] as const

export const LOAN_TYPES = [
  { value: 'CONVENTIONAL', label: 'Conventional' },
  { value: 'FHA', label: 'FHA' },
  { value: 'VA', label: 'VA' },
  { value: 'JUMBO', label: 'Jumbo' },
  { value: 'USDA', label: 'USDA' },
] as const

export const LEAD_SOURCES = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'ZILLOW', label: 'Zillow' },
  { value: 'REALTOR', label: 'Realtor' },
  { value: 'COLD_CALL', label: 'Cold Call' },
  { value: 'OTHER', label: 'Other' },
] as const

export const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-500' },
] as const
