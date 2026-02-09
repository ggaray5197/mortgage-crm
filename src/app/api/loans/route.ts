import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateLoanNumber } from '@/lib/utils'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const contactId = searchParams.get('contactId')

    const where: Record<string, unknown> = {
      assignedToId: session.user.id,
    }

    if (status && status !== 'ALL') {
      where.status = status
    }
    if (contactId) {
      where.contactId = contactId
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        contact: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ loans })
  } catch (error) {
    console.error('Error fetching loans:', error)
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
      contactId,
      loanType,
      loanPurpose,
      amount,
      interestRate,
      term,
      propertyAddress,
      propertyCity,
      propertyState,
      propertyZip,
      propertyType,
      propertyValue,
      estimatedClosingDate,
    } = body

    if (!contactId || !loanType || !loanPurpose || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const ltv = propertyValue ? (parseFloat(amount) / parseFloat(propertyValue)) * 100 : null

    const loan = await prisma.loan.create({
      data: {
        loanNumber: generateLoanNumber(),
        loanType,
        loanPurpose,
        amount: parseFloat(amount),
        interestRate: interestRate ? parseFloat(interestRate) : null,
        term: term ? parseInt(term) : null,
        propertyAddress,
        propertyCity,
        propertyState,
        propertyZip,
        propertyType,
        propertyValue: propertyValue ? parseFloat(propertyValue) : null,
        ltv,
        estimatedClosingDate: estimatedClosingDate ? new Date(estimatedClosingDate) : null,
        contactId,
        assignedToId: session.user.id,
      },
      include: {
        contact: true,
        assignedTo: true,
      },
    })

    return NextResponse.json({ loan }, { status: 201 })
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
