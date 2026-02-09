import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateProjection, Bill, ExpectedIncomeItem } from '@/lib/finance-utils'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const weeks = searchParams.get('weeks')
    const weeksToProject = weeks ? parseInt(weeks) : 4

    // Get all accounts and sum their balances
    const accounts = await prisma.financeAccount.findMany({
      where: { userId: session.user.id },
    })
    const currentBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

    // Get active bills
    const dbBills = await prisma.bill.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })

    // Convert to projection format
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

    // Convert to projection format
    const expectedIncomes: ExpectedIncomeItem[] = dbExpectedIncomes.map((e) => ({
      id: e.id,
      description: e.description,
      amount: e.amount,
      expectedDate: e.expectedDate,
      probability: e.probability,
      status: e.status,
    }))

    // Generate projection
    const projection = generateProjection(currentBalance, bills, expectedIncomes, weeksToProject)

    // Convert dates to strings for JSON serialization
    const projectionData = projection.map((week) => ({
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
    }))

    return NextResponse.json({
      currentBalance,
      projection: projectionData,
    })
  } catch (error) {
    console.error('Error generating projection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
