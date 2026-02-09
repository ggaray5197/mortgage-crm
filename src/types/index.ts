import {
  User,
  Lead,
  Contact,
  Loan,
  Communication,
  Task,
  EmailTemplate,
  FinanceAccount,
  FinanceCategory,
  Bill,
  Expense,
  Income,
  ExpectedIncome,
} from '@prisma/client'

export type {
  User,
  Lead,
  Contact,
  Loan,
  Communication,
  Task,
  EmailTemplate,
  FinanceAccount,
  FinanceCategory,
  Bill,
  Expense,
  Income,
  ExpectedIncome,
}

export type LeadWithRelations = Lead & {
  assignedTo?: User | null
  communications?: Communication[]
  tasks?: Task[]
}

export type ContactWithRelations = Contact & {
  lead?: Lead | null
  loans?: Loan[]
  communications?: Communication[]
  tasks?: Task[]
}

export type LoanWithRelations = Loan & {
  contact: Contact
  assignedTo?: User | null
  tasks?: Task[]
  communications?: Communication[]
}

export type CommunicationWithRelations = Communication & {
  lead?: Lead | null
  contact?: Contact | null
  loan?: Loan | null
  createdBy: User
}

export type TaskWithRelations = Task & {
  lead?: Lead | null
  contact?: Contact | null
  loan?: Loan | null
  assignedTo: User
}

export interface DashboardStats {
  totalLeads: number
  newLeadsThisMonth: number
  activeLoans: number
  totalPipelineValue: number
  conversionRate: number
  tasksOverdue: number
}

export interface LeadsByStatus {
  status: string
  count: number
}

export interface LeadsBySource {
  source: string
  count: number
}

export interface MonthlyStats {
  month: string
  leads: number
  conversions: number
  loanVolume: number
}

declare module 'next-auth' {
  interface User {
    id: string
    role: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

// ==================== FINANCE TYPES ====================

export type FinanceAccountWithRelations = FinanceAccount & {
  bills?: Bill[]
  expenses?: Expense[]
  incomes?: Income[]
  expectedIncomes?: ExpectedIncome[]
}

export type BillWithRelations = Bill & {
  account?: FinanceAccount | null
  category?: FinanceCategory | null
}

export type ExpenseWithRelations = Expense & {
  account?: FinanceAccount | null
  category?: FinanceCategory | null
}

export type IncomeWithRelations = Income & {
  loan?: Loan | null
  account?: FinanceAccount | null
  category?: FinanceCategory | null
  expectedIncome?: ExpectedIncome | null
}

export type ExpectedIncomeWithRelations = ExpectedIncome & {
  loan?: Loan | null
  account?: FinanceAccount | null
  category?: FinanceCategory | null
  realizedIncome?: Income | null
}

export interface FinanceDashboardStats {
  totalBalance: number
  totalMonthlyExpenses: number
  totalExpectedIncome: number
  upcomingBillsCount: number
  pendingDealsCount: number
  projectedBalance4Weeks: number
}

export interface WeekProjectionData {
  weekNumber: number
  weekStart: string
  weekEnd: string
  startingBalance: number
  totalExpenses: number
  totalIncome: number
  totalWeightedIncome: number
  netChange: number
  endingBalance: number
  isNegative: boolean
  bills: {
    billId: string
    billName: string
    amount: number
    date: string
  }[]
  expectedIncomes: {
    incomeId: string
    description: string
    amount: number
    weightedAmount: number
    date: string
    probability: number
  }[]
}
