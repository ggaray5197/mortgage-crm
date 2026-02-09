import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  isWithinInterval,
  getDay,
  getDate,
  differenceInWeeks,
  differenceInDays,
  addMonths,
  addYears,
  isSameDay,
} from 'date-fns'

// ==================== CONSTANTS ====================

export const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Checking' },
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'CASH', label: 'Cash' },
] as const

export const CATEGORY_TYPES = [
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expense' },
] as const

export const BILL_FREQUENCIES = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BI_WEEKLY', label: 'Bi-Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'ONE_TIME', label: 'One Time' },
] as const

export const INCOME_SOURCES = [
  { value: 'COMMISSION', label: 'Commission' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'SALARY', label: 'Salary' },
  { value: 'OTHER', label: 'Other' },
] as const

export const INCOME_TYPES = [
  { value: 'MORTGAGE', label: 'Mortgage' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'OTHER', label: 'Other' },
] as const

export const EXPECTED_INCOME_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'RECEIVED', label: 'Received', color: 'bg-green-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
] as const

export const CATEGORY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
] as const

// ==================== TYPES ====================

export interface Bill {
  id: string
  name: string
  amount: number
  frequency: string
  billingDay: number
  startDate: Date | string
  endDate?: Date | string | null
  isActive: boolean
}

export interface ExpectedIncomeItem {
  id: string
  description: string
  amount: number
  expectedDate: Date | string
  probability: number
  status: string
}

export interface BillOccurrence {
  billId: string
  billName: string
  amount: number
  date: Date
}

export interface IncomeOccurrence {
  incomeId: string
  description: string
  amount: number
  weightedAmount: number
  date: Date
  probability: number
}

export interface WeekProjection {
  weekNumber: number
  weekStart: Date
  weekEnd: Date
  startingBalance: number
  bills: BillOccurrence[]
  expectedIncomes: IncomeOccurrence[]
  totalExpenses: number
  totalIncome: number
  totalWeightedIncome: number
  netChange: number
  endingBalance: number
  isNegative: boolean
}

// ==================== BILL CALCULATION FUNCTIONS ====================

/**
 * Check if a bill occurs on a specific date based on its frequency
 */
export function billOccursOnDate(bill: Bill, date: Date): boolean {
  const startDate = new Date(bill.startDate)
  const endDate = bill.endDate ? new Date(bill.endDate) : null

  // Check if date is within bill's active period
  if (date < startDate) return false
  if (endDate && date > endDate) return false
  if (!bill.isActive) return false

  const dayOfWeek = getDay(date) // 0-6 (Sunday-Saturday)
  const dayOfMonth = getDate(date) // 1-31

  switch (bill.frequency) {
    case 'WEEKLY':
      // billingDay is 0-6 for day of week
      return dayOfWeek === bill.billingDay

    case 'BI_WEEKLY':
      // Check if it's the correct day of week and correct week
      if (dayOfWeek !== getDay(startDate)) return false
      const weeksDiff = differenceInWeeks(date, startDate)
      return weeksDiff >= 0 && weeksDiff % 2 === 0

    case 'MONTHLY':
      // billingDay is 1-31 for day of month
      // Handle months with fewer days (e.g., billing day 31 in February)
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      const effectiveBillingDay = Math.min(bill.billingDay, lastDayOfMonth)
      return dayOfMonth === effectiveBillingDay

    case 'QUARTERLY':
      // Every 3 months from start date
      if (dayOfMonth !== getDate(startDate)) return false
      const monthsDiffQ = (date.getFullYear() - startDate.getFullYear()) * 12 + (date.getMonth() - startDate.getMonth())
      return monthsDiffQ >= 0 && monthsDiffQ % 3 === 0

    case 'ANNUAL':
      // Same month and day as start date
      return date.getMonth() === startDate.getMonth() && dayOfMonth === getDate(startDate)

    case 'ONE_TIME':
      // Only on the exact start date
      return isSameDay(date, startDate)

    default:
      return false
  }
}

/**
 * Get all bill occurrences within a date range
 */
export function getBillOccurrencesInRange(
  bills: Bill[],
  rangeStart: Date,
  rangeEnd: Date
): BillOccurrence[] {
  const occurrences: BillOccurrence[] = []

  for (const bill of bills) {
    // Iterate through each day in the range
    let currentDate = new Date(rangeStart)
    while (currentDate <= rangeEnd) {
      if (billOccursOnDate(bill, currentDate)) {
        occurrences.push({
          billId: bill.id,
          billName: bill.name,
          amount: bill.amount,
          date: new Date(currentDate),
        })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Get expected income items within a date range
 */
export function getExpectedIncomeInRange(
  expectedIncomes: ExpectedIncomeItem[],
  rangeStart: Date,
  rangeEnd: Date
): IncomeOccurrence[] {
  return expectedIncomes
    .filter((income) => {
      if (income.status !== 'PENDING') return false
      const incomeDate = new Date(income.expectedDate)
      return isWithinInterval(incomeDate, { start: rangeStart, end: rangeEnd })
    })
    .map((income) => ({
      incomeId: income.id,
      description: income.description,
      amount: income.amount,
      weightedAmount: (income.amount * income.probability) / 100,
      date: new Date(income.expectedDate),
      probability: income.probability,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

// ==================== PROJECTION FUNCTIONS ====================

/**
 * Generate 4-week cash flow projection
 */
export function generateProjection(
  currentBalance: number,
  bills: Bill[],
  expectedIncomes: ExpectedIncomeItem[],
  weeksToProject: number = 4
): WeekProjection[] {
  const projections: WeekProjection[] = []
  let runningBalance = currentBalance

  for (let week = 0; week < weeksToProject; week++) {
    const weekStart = startOfWeek(addWeeks(new Date(), week), { weekStartsOn: 0 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })

    const weekBills = getBillOccurrencesInRange(bills, weekStart, weekEnd)
    const weekIncomes = getExpectedIncomeInRange(expectedIncomes, weekStart, weekEnd)

    const totalExpenses = weekBills.reduce((sum, b) => sum + b.amount, 0)
    const totalIncome = weekIncomes.reduce((sum, i) => sum + i.amount, 0)
    const totalWeightedIncome = weekIncomes.reduce((sum, i) => sum + i.weightedAmount, 0)

    // Use weighted income for projection (probability-adjusted)
    const netChange = totalWeightedIncome - totalExpenses
    const endingBalance = runningBalance + netChange

    projections.push({
      weekNumber: week + 1,
      weekStart,
      weekEnd,
      startingBalance: runningBalance,
      bills: weekBills,
      expectedIncomes: weekIncomes,
      totalExpenses,
      totalIncome,
      totalWeightedIncome,
      netChange,
      endingBalance,
      isNegative: endingBalance < 0,
    })

    runningBalance = endingBalance
  }

  return projections
}

// ==================== FORMATTING HELPERS ====================

export function formatFrequency(frequency: string): string {
  const freq = BILL_FREQUENCIES.find((f) => f.value === frequency)
  return freq?.label || frequency
}

export function formatAccountType(type: string): string {
  const accountType = ACCOUNT_TYPES.find((t) => t.value === type)
  return accountType?.label || type
}

export function formatIncomeSource(source: string): string {
  const incomeSource = INCOME_SOURCES.find((s) => s.value === source)
  return incomeSource?.label || source
}

export function formatIncomeType(type: string): string {
  const incomeType = INCOME_TYPES.find((t) => t.value === type)
  return incomeType?.label || type
}

/**
 * Get next occurrence date for a bill
 */
export function getNextBillDate(bill: Bill): Date | null {
  if (!bill.isActive) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check the next 365 days for the next occurrence
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() + i)
    if (billOccursOnDate(bill, checkDate)) {
      return checkDate
    }
  }

  return null
}

/**
 * Calculate monthly total for a bill based on frequency
 */
export function calculateMonthlyAmount(bill: Bill): number {
  switch (bill.frequency) {
    case 'WEEKLY':
      return bill.amount * 4.33 // Average weeks per month
    case 'BI_WEEKLY':
      return bill.amount * 2.17
    case 'MONTHLY':
      return bill.amount
    case 'QUARTERLY':
      return bill.amount / 3
    case 'ANNUAL':
      return bill.amount / 12
    case 'ONE_TIME':
      return 0 // Don't include in monthly calculations
    default:
      return bill.amount
  }
}
