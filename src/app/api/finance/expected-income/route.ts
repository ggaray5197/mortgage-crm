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
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const incomeType = searchParams.get('incomeType')
    const loanId = searchParams.get('loanId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')

    const where: Record<string, unknown> = { userId: session.user.id }
    if (status) where.status = status
    if (source) where.source = source
    if (incomeType) where.incomeType = incomeType
    if (loanId) where.loanId = loanId
    if (startDate || endDate) {
      where.expectedDate = {}
      if (startDate) (where.expectedDate as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.expectedDate as Record<string, unknown>).lte = new Date(endDate)
    }

    const expectedIncomes = await prisma.expectedIncome.findMany({
      where,
      include: {
        loan: {
          include: {
            contact: true,
          },
        },
        account: true,
        category: true,
        realizedIncome: true,
      },
      orderBy: { expectedDate: 'asc' },
      take: limit ? parseInt(limit) : 100,
    })

    return NextResponse.json({ expectedIncomes })
  } catch (error) {
    console.error('Error fetching expected incomes:', error)
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
      expectedDate,
      probability,
      source,
      incomeType,
      notes,
      loanId,
      accountId,
      categoryId,
    } = body

    if (!description || !amount || !expectedDate) {
      return NextResponse.json(
        { error: 'Description, amount, and expected date are required' },
        { status: 400 }
      )
    }

    const expectedIncome = await prisma.expectedIncome.create({
      data: {
        description,
        amount: parseFloat(amount),
        expectedDate: new Date(expectedDate),
        probability: probability !== undefined ? parseInt(probability) : 50,
        status: 'PENDING',
        source: source || 'COMMISSION',
        incomeType: incomeType || 'MORTGAGE',
        notes: notes || null,
        loanId: loanId || null,
        accountId: accountId || null,
        categoryId: categoryId || null,
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
      },
    })

    return NextResponse.json({ expectedIncome }, { status: 201 })
  } catch (error) {
    console.error('Error creating expected income:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
