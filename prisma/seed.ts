import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo user
  const hashedPassword = await hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@mortgagecrm.com' },
    update: {},
    create: {
      email: 'demo@mortgagecrm.com',
      password: hashedPassword,
      name: 'John Smith',
      role: 'LOAN_OFFICER',
      phone: '555-123-4567',
    },
  })

  console.log('Created user:', user.email)

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.j@email.com',
        phone: '555-234-5678',
        status: 'NEW',
        source: 'WEBSITE',
        loanAmount: 450000,
        propertyType: 'SINGLE_FAMILY',
        creditScore: 720,
        priority: 'HIGH',
        notes: 'Interested in purchasing first home. Pre-approval needed.',
        assignedToId: user.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.w@email.com',
        phone: '555-345-6789',
        status: 'CONTACTED',
        source: 'REFERRAL',
        loanAmount: 650000,
        propertyType: 'CONDO',
        creditScore: 780,
        priority: 'MEDIUM',
        notes: 'Referred by existing client. Looking for investment property.',
        assignedToId: user.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.b@email.com',
        phone: '555-456-7890',
        status: 'QUALIFIED',
        source: 'ZILLOW',
        loanAmount: 325000,
        propertyType: 'TOWNHOUSE',
        creditScore: 695,
        priority: 'HIGH',
        notes: 'Ready to move forward. Documents submitted.',
        assignedToId: user.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.d@email.com',
        phone: '555-567-8901',
        status: 'PROPOSAL',
        source: 'REALTOR',
        loanAmount: 520000,
        propertyType: 'SINGLE_FAMILY',
        creditScore: 750,
        priority: 'URGENT',
        notes: 'Competing offer deadline in 5 days.',
        assignedToId: user.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.w@email.com',
        phone: '555-678-9012',
        status: 'WON',
        source: 'WEBSITE',
        loanAmount: 380000,
        propertyType: 'SINGLE_FAMILY',
        creditScore: 730,
        priority: 'MEDIUM',
        notes: 'Converted to contact. Loan in progress.',
        assignedToId: user.id,
      },
    }),
  ])

  console.log(`Created ${leads.length} leads`)

  // Create sample contact from won lead
  const contact = await prisma.contact.create({
    data: {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.w@email.com',
      phone: '555-678-9012',
      address: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      employer: 'Tech Corp Inc',
      jobTitle: 'Software Engineer',
      annualIncome: 145000,
      leadId: leads[4].id,
    },
  })

  console.log('Created contact:', contact.email)

  // Create sample loan
  const loan = await prisma.loan.create({
    data: {
      loanNumber: 'LN-2024-00001',
      loanType: 'CONVENTIONAL',
      loanPurpose: 'PURCHASE',
      amount: 380000,
      interestRate: 6.875,
      term: 360,
      status: 'PROCESSING',
      propertyAddress: '456 Oak Avenue',
      propertyCity: 'Austin',
      propertyState: 'TX',
      propertyZip: '78702',
      propertyType: 'SINGLE_FAMILY',
      propertyValue: 475000,
      ltv: 80,
      estimatedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      contactId: contact.id,
      assignedToId: user.id,
    },
  })

  console.log('Created loan:', loan.loanNumber)

  // Create sample communications
  await Promise.all([
    prisma.communication.create({
      data: {
        type: 'CALL',
        direction: 'OUTBOUND',
        subject: 'Initial Follow-up',
        content: 'Discussed loan options and pre-approval process. Client interested in 30-year fixed rate.',
        outcome: 'ANSWERED',
        duration: 420,
        leadId: leads[0].id,
        createdById: user.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: 'EMAIL',
        direction: 'OUTBOUND',
        subject: 'Loan Options Summary',
        content: 'Sent detailed breakdown of loan programs available based on credit profile.',
        leadId: leads[1].id,
        createdById: user.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: 'CALL',
        direction: 'INBOUND',
        subject: 'Document Questions',
        content: 'Client called with questions about required documentation. Explained paystubs and tax returns needed.',
        outcome: 'ANSWERED',
        duration: 180,
        leadId: leads[2].id,
        createdById: user.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: 'NOTE',
        subject: 'Rate Lock Discussion',
        content: 'Discussed rate lock options. Client wants to proceed with 45-day lock at current rates.',
        contactId: contact.id,
        loanId: loan.id,
        createdById: user.id,
      },
    }),
  ])

  console.log('Created sample communications')

  // Create sample tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Follow up with Michael Johnson',
        description: 'Call to discuss pre-approval status and next steps',
        type: 'CALL',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        leadId: leads[0].id,
        assignedToId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Send rate comparison to Sarah',
        description: 'Prepare and send comparison of conventional vs jumbo options',
        type: 'EMAIL',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        leadId: leads[1].id,
        assignedToId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Collect remaining documents',
        description: 'Need W-2s and bank statements from client',
        type: 'DOCUMENT',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        leadId: leads[2].id,
        assignedToId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Submit loan file to underwriting',
        description: 'All documents collected, ready for submission',
        type: 'DOCUMENT',
        priority: 'URGENT',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        contactId: contact.id,
        loanId: loan.id,
        assignedToId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Overdue: Call Emily about offer',
        description: 'Urgent - need to finalize terms before competing offer deadline',
        type: 'CALL',
        priority: 'URGENT',
        status: 'PENDING',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
        leadId: leads[3].id,
        assignedToId: user.id,
      },
    }),
  ])

  console.log('Created sample tasks')

  // Create email templates
  await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'New Lead Welcome',
        subject: 'Thank you for your interest - {{firstName}}',
        body: `Dear {{firstName}},

Thank you for reaching out about your mortgage needs. I'm excited to help you achieve your home financing goals.

I've received your inquiry and would love to schedule a quick call to discuss your options. Please let me know what time works best for you.

Best regards,
{{loanOfficerName}}`,
        category: 'WELCOME',
        variables: JSON.stringify(['firstName', 'loanOfficerName']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Pre-Approval Checklist',
        subject: 'Documents Needed for Pre-Approval',
        body: `Hi {{firstName}},

To proceed with your pre-approval, please provide the following documents:

1. Last 2 years of W-2s
2. Last 30 days of pay stubs
3. Last 2 months of bank statements
4. Government-issued ID

You can securely upload these documents through our portal or reply to this email.

Let me know if you have any questions!

Best,
{{loanOfficerName}}`,
        category: 'FOLLOW_UP',
        variables: JSON.stringify(['firstName', 'loanOfficerName']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Loan Status Update',
        subject: 'Update on Your Loan Application - {{loanNumber}}',
        body: `Hi {{firstName}},

I wanted to provide you with an update on your loan application ({{loanNumber}}).

Current Status: {{loanStatus}}

{{statusDetails}}

If you have any questions, please don't hesitate to reach out.

Best regards,
{{loanOfficerName}}`,
        category: 'STATUS_UPDATE',
        variables: JSON.stringify(['firstName', 'loanNumber', 'loanStatus', 'statusDetails', 'loanOfficerName']),
      },
    }),
  ])

  console.log('Created email templates')
  console.log('Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
