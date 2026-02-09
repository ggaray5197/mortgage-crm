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
    const type = searchParams.get('type')
    const leadId = searchParams.get('leadId')
    const contactId = searchParams.get('contactId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {
      createdById: session.user.id,
    }

    if (type && type !== 'ALL') {
      where.type = type
    }
    if (leadId) {
      where.leadId = leadId
    }
    if (contactId) {
      where.contactId = contactId
    }

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        include: {
          lead: true,
          contact: true,
          loan: true,
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.communication.count({ where }),
    ])

    return NextResponse.json({
      communications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching communications:', error)
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
      type,
      direction,
      subject,
      content,
      outcome,
      duration,
      scheduledAt,
      completedAt,
      leadId,
      contactId,
      loanId,
    } = body

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const communication = await prisma.communication.create({
      data: {
        type,
        direction,
        subject,
        content,
        outcome,
        duration: duration ? parseInt(duration) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        leadId,
        contactId,
        loanId,
        createdById: session.user.id,
      },
      include: {
        lead: true,
        contact: true,
        createdBy: true,
      },
    })

    return NextResponse.json({ communication }, { status: 201 })
  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
