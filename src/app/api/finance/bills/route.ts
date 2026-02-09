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
    const isActive = searchParams.get('isActive')
    const accountId = searchParams.get('accountId')

    const where: Record<string, unknown> = { userId: session.user.id }
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    if (accountId) {
      where.accountId = accountId
    }

    const bills = await prisma.bill.findMany({
      where,
      include: {
        account: true,
        category: true,
      },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json({ bills })
  } catch (error) {
    console.error('Error fetching bills:', error)
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
      name,
      amount,
      frequency,
      billingDay,
      startDate,
      endDate,
      isActive,
      notes,
      accountId,
      categoryId,
    } = body

    if (!name || !amount) {
      return NextResponse.json(
        { error: 'Name and amount are required' },
        { status: 400 }
      )
    }

    const bill = await prisma.bill.create({
      data: {
        name,
        amount: parseFloat(amount),
        frequency: frequency || 'MONTHLY',
        billingDay: billingDay ? parseInt(billingDay) : 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || null,
        accountId: accountId || null,
        categoryId: categoryId || null,
        userId: session.user.id,
      },
      include: {
        account: true,
        category: true,
      },
    })

    return NextResponse.json({ bill }, { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
