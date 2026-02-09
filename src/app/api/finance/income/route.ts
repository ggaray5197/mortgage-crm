import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')
    const categoryId = searchParams.get('categoryId')
    const source = searchParams.get('source')
    const incomeType = searchParams.get('incomeType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')

    const where: Record<string, unknown> = { userId: session.user.id }
    if (accountId) where.accountId = accountId
    if (categoryId) where.categoryId = categoryId
    if (source) where.source = source
    if (incomeType) where.incomeType = incomeType
    if (startDate || endDate) {
      where.date = {}
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate)
    }

    const incomes = await prisma.income.findMany({
      where,
      include: {
        loan: {
          include: {
            contact: true,
          },
        },
        account: true,
        category: true,
        expectedIncome: true,
      },
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : 100,
    })

    return NextResponse.json({ incomes })
  } catch (error) {
    console.error('Error fetching incomes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      description,
      amount,
      date,
      source,
      incomeType,
      notes,
      loanId,
      accountId,
      categoryId,
      expectedIncomeId,
    } = body

    if (!description || !amount) {
      return NextResponse.json(
        { error: 'Description and amount are required' },
        { status: 400 }
      )
    }

    // Update account balance if specified
    if (accountId) {
      await prisma.financeAccount.update({
        where: { id: accountId },
        data: { balance: { increment: parseFloat(amount) } },
      })
    }

    const income = await prisma.income.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        source: source || 'COMMISSION',
        incomeType: incomeType || 'MORTGAGE',
        notes: notes || null,
        loanId: loanId || null,
        accountId: accountId || null,
        categoryId: categoryId || null,
        expectedIncomeId: expectedIncomeId || null,
        userId: session.user.id,
      },
      include: {
        loan: {
          include: {
            contact: true,
          },
        },
        account: true,
        category: true,
        expectedIncome: true,
      },
    })

    return NextResponse.json({ income }, { status: 201 })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
