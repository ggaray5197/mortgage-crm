import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const income = await prisma.income.findFirst({
      where: { id, userId: session.user.id },
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

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }

    return NextResponse.json({ income })
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Verify ownership
    const existing = await prisma.income.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (body.description !== undefined) updateData.description = body.description
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount)
    if (body.date !== undefined) updateData.date = new Date(body.date)
    if (body.source !== undefined) updateData.source = body.source
    if (body.incomeType !== undefined) updateData.incomeType = body.incomeType
    if (body.notes !== undefined) updateData.notes = body.notes || null
    if (body.loanId !== undefined) updateData.loanId = body.loanId || null
    if (body.accountId !== undefined) updateData.accountId = body.accountId || null
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null

    const income = await prisma.income.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ income })
  } catch (error) {
    console.error('Error updating income:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await prisma.income.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }

    // Restore balance from account if it was added
    if (existing.accountId) {
      await prisma.financeAccount.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: existing.amount } },
      })
    }

    await prisma.income.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
