import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Convert expected income to realized income
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { actualAmount, actualDate, accountId } = body

    // Verify ownership and get expected income
    const expectedIncome = await prisma.expectedIncome.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!expectedIncome) {
      return NextResponse.json({ error: 'Expected income not found' }, { status: 404 })
    }

    if (expectedIncome.status === 'RECEIVED') {
      return NextResponse.json(
        { error: 'This income has already been received' },
        { status: 400 }
      )
    }

    const finalAmount = actualAmount ? parseFloat(actualAmount) : expectedIncome.amount
    const finalDate = actualDate ? new Date(actualDate) : new Date()
    const finalAccountId = accountId || expectedIncome.accountId

    // Create realized income and update expected income status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update account balance if specified
      if (finalAccountId) {
        await tx.financeAccount.update({
          where: { id: finalAccountId },
          data: { balance: { increment: finalAmount } },
        })
      }

      // Create the realized income
      const income = await tx.income.create({
        data: {
          description: expectedIncome.description,
          amount: finalAmount,
          date: finalDate,
          source: expectedIncome.source,
          incomeType: expectedIncome.incomeType,
          notes: expectedIncome.notes,
          loanId: expectedIncome.loanId,
          accountId: finalAccountId,
          categoryId: expectedIncome.categoryId,
          expectedIncomeId: expectedIncome.id,
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

      // Update expected income status
      const updatedExpectedIncome = await tx.expectedIncome.update({
        where: { id },
        data: { status: 'RECEIVED' },
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
      })

      return { income, expectedIncome: updatedExpectedIncome }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error converting expected income:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
