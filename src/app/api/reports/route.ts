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
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    const userId = session.user.id

    // Get lead statistics
    const [
      totalLeads,
      leadsByStatus,
      leadsBySource,
      newLeadsInPeriod,
      wonLeadsInPeriod,
    ] = await Promise.all([
      prisma.lead.count({ where: { assignedToId: userId } }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { assignedToId: userId },
        _count: { status: true },
      }),
      prisma.lead.groupBy({
        by: ['source'],
        where: { assignedToId: userId, source: { not: null } },
        _count: { source: true },
      }),
      prisma.lead.count({
        where: {
          assignedToId: userId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.lead.count({
        where: {
          assignedToId: userId,
          status: 'WON',
          updatedAt: { gte: startDate },
        },
      }),
    ])

    // Get loan statistics
    const [
      totalLoans,
      loansByStatus,
      pipelineValue,
      closedLoansInPeriod,
      closedLoanValue,
    ] = await Promise.all([
      prisma.loan.count({ where: { assignedToId: userId } }),
      prisma.loan.groupBy({
        by: ['status'],
        where: { assignedToId: userId },
        _count: { status: true },
        _sum: { amount: true },
      }),
      prisma.loan.aggregate({
        where: {
          assignedToId: userId,
          status: { in: ['APPLICATION', 'PROCESSING', 'UNDERWRITING', 'APPROVED', 'CLOSING'] },
        },
        _sum: { amount: true },
      }),
      prisma.loan.count({
        where: {
          assignedToId: userId,
          status: 'CLOSED',
          actualClosingDate: { gte: startDate },
        },
      }),
      prisma.loan.aggregate({
        where: {
          assignedToId: userId,
          status: 'CLOSED',
          actualClosingDate: { gte: startDate },
        },
        _sum: { amount: true },
      }),
    ])

    // Get communication statistics
    const [
      totalCommunications,
      communicationsByType,
    ] = await Promise.all([
      prisma.communication.count({
        where: {
          createdById: userId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.communication.groupBy({
        by: ['type'],
        where: {
          createdById: userId,
          createdAt: { gte: startDate },
        },
        _count: { type: true },
      }),
    ])

    // Get task statistics
    const [
      totalTasks,
      completedTasks,
      overdueTasks,
    ] = await Promise.all([
      prisma.task.count({ where: { assignedToId: userId } }),
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: 'COMPLETED',
          updatedAt: { gte: startDate },
        },
      }),
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() },
        },
      }),
    ])

    // Calculate conversion rate
    const conversionRate = totalLeads > 0
      ? Math.round((leadsByStatus.find(s => s.status === 'WON')?._count.status || 0) / totalLeads * 100)
      : 0

    // Monthly trends (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const [monthLeads, monthConversions, monthLoanVolume] = await Promise.all([
        prisma.lead.count({
          where: {
            assignedToId: userId,
            createdAt: { gte: monthStart, lt: monthEnd },
          },
        }),
        prisma.lead.count({
          where: {
            assignedToId: userId,
            status: 'WON',
            updatedAt: { gte: monthStart, lt: monthEnd },
          },
        }),
        prisma.loan.aggregate({
          where: {
            assignedToId: userId,
            status: 'CLOSED',
            actualClosingDate: { gte: monthStart, lt: monthEnd },
          },
          _sum: { amount: true },
        }),
      ])

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        leads: monthLeads,
        conversions: monthConversions,
        loanVolume: monthLoanVolume._sum.amount || 0,
      })
    }

    return NextResponse.json({
      overview: {
        totalLeads,
        newLeadsInPeriod,
        wonLeadsInPeriod,
        conversionRate,
        totalLoans,
        pipelineValue: pipelineValue._sum.amount || 0,
        closedLoansInPeriod,
        closedLoanValue: closedLoanValue._sum.amount || 0,
        totalCommunications,
        totalTasks,
        completedTasks,
        overdueTasks,
      },
      leadsByStatus: leadsByStatus.map(s => ({
        status: s.status,
        count: s._count.status,
      })),
      leadsBySource: leadsBySource.map(s => ({
        source: s.source || 'Unknown',
        count: s._count.source,
      })),
      loansByStatus: loansByStatus.map(s => ({
        status: s.status,
        count: s._count.status,
        amount: s._sum.amount || 0,
      })),
      communicationsByType: communicationsByType.map(c => ({
        type: c.type,
        count: c._count.type,
      })),
      monthlyTrends: monthlyData,
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
