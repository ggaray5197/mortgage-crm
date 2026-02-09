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

    const expectedIncome = await prisma.expectedIncome.findFirst({
      where: { id, userId: session.user.id },
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

    if (!expectedIncome) {
      return NextResponse.json({ error: 'Expected income not found' }, { status: 404 })
    }

    return NextResponse.json({ expectedIncome })
  } catch (error) {
    console.error('Error fetching expected income:', error)
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
    const existing = await prisma.expectedIncome.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Expected income not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (body.description !== undefined) updateData.description = body.description
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount)
    if (body.expectedDate !== undefined) updateData.expectedDate = new Date(body.expectedDate)
    if (body.probability !== undefined) updateData.probability = parseInt(body.probability)
    if (body.status !== undefined) updateData.status = body.status
    if (body.source !== undefined) updateData.source = body.source
    if (body.incomeType !== undefined) updateData.incomeType = body.incomeType
    if (body.notes !== undefined) updateData.notes = body.notes || null
    if (body.loanId !== undefined) updateData.loanId = body.loanId || null
    if (body.accountId !== undefined) updateData.accountId = body.accountId || null
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null

    const expectedIncome = await prisma.expectedIncome.update({
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
        realizedIncome: true,
      },
    })

    return NextResponse.json({ expectedIncome })
  } catch (error) {
    console.error('Error updating expected income:', error)
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
    const existing = await prisma.expectedIncome.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Expected income not found' }, { status: 404 })
    }

    await prisma.expectedIncome.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expected income:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
