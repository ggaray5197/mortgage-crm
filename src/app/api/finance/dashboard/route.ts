import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generateProjection,
  calculateMonthlyAmount,
  Bill,
  ExpectedIncomeItem,
} from '@/lib/finance-utils'
import { startOfMonth, endOfMonth, addDays } from 'date-fns'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const next7Days = addDays(today, 7)

    // Get all accounts and calculate total balance
    const accounts = await prisma.financeAccount.findMany({
      where: { userId: session.user.id },
    })
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

    // Get active bills and calculate monthly total
    const dbBills = await prisma.bill.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })
    const totalMonthlyExpenses = dbBills.reduce(
      (sum, bill) => sum + calculateMonthlyAmount(bill as Bill),
      0
    )

    // Count upcoming bills (next 7 days)
    const bills: Bill[] = dbBills.map((b) => ({
      id: b.id,
      name: b.name,
      amount: b.amount,
      frequency: b.frequency,
      billingDay: b.billingDay,
      startDate: b.startDate,
      endDate: b.endDate,
      isActive: b.isActive,
    }))

    // Get pending expected incomes
    const dbExpectedIncomes = await prisma.expectedIncome.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
      },
    })
    const pendingDealsCount = dbExpectedIncomes.length
    const totalExpectedIncome = dbExpectedIncomes.reduce((sum, e) => sum + e.amount, 0)

    // Count bills due in next 7 days using projection
    const expectedIncomes: ExpectedIncomeItem[] = dbExpectedIncomes.map((e) => ({
      id: e.id,
      description: e.description,
      amount: e.amount,
      expectedDate: e.expectedDate,
      probability: e.probability,
      status: e.status,
    }))

    // Get 4-week projection
    const projection = generateProjection(totalBalance, bills, expectedIncomes, 4)
    const projectedBalance4Weeks = projection.length > 0 ? projection[projection.length - 1].endingBalance : totalBalance

    // Count upcoming bills from first week
    const upcomingBillsCount = projection[0]?.bills.length || 0

    // Get this month's income and expenses
    const thisMonthIncome = await prisma.income.aggregate({
      where: {
        userId: session.user.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    })

    const thisMonthExpenses = await prisma.expense.aggregate({
      where: {
        userId: session.user.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    })

    // Get recent transactions
    const recentIncomes = await prisma.income.findMany({
      where: { userId: session.user.id },
      include: { loan: { include: { contact: true } }, category: true },
      orderBy: { date: 'desc' },
      take: 5,
    })

    const recentExpenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5,
    })

    // Get upcoming expected incomes
    const upcomingExpectedIncomes = await prisma.expectedIncome.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
        expectedDate: { gte: today },
      },
      include: { loan: { include: { contact: true } } },
      orderBy: { expectedDate: 'asc' },
      take: 5,
    })

    return NextResponse.json({
      stats: {
        totalBalance,
        totalMonthlyExpenses,
        totalExpectedIncome,
        upcomingBillsCount,
        pendingDealsCount,
        projectedBalance4Weeks,
        thisMonthIncome: thisMonthIncome._sum.amount || 0,
        thisMonthExpenses: thisMonthExpenses._sum.amount || 0,
      },
      accounts,
      recentIncomes,
      recentExpenses,
      upcomingExpectedIncomes,
      projection: projection.map((week) => ({
        ...week,
        weekStart: week.weekStart.toISOString(),
        weekEnd: week.weekEnd.toISOString(),
        bills: week.bills.map((b) => ({
          ...b,
          date: b.date.toISOString(),
        })),
        expectedIncomes: week.expectedIncomes.map((i) => ({
          ...i,
          date: i.date.toISOString(),
        })),
      })),
    })
  } catch (error) {
    console.error('Error fetching finance dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
