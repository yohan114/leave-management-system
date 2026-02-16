import { PrismaClient, Role } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create Departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: "Engineering" },
      update: {},
      create: { name: "Engineering", description: "Software Development Team" }
    }),
    prisma.department.upsert({
      where: { name: "Human Resources" },
      update: {},
      create: { name: "Human Resources", description: "HR and Recruitment Team" }
    }),
    prisma.department.upsert({
      where: { name: "Sales" },
      update: {},
      create: { name: "Sales", description: "Sales and Business Development" }
    }),
    prisma.department.upsert({
      where: { name: "Marketing" },
      update: {},
      create: { name: "Marketing", description: "Marketing and Communications" }
    }),
    prisma.department.upsert({
      where: { name: "Finance" },
      update: {},
      create: { name: "Finance", description: "Finance and Accounting" }
    }),
  ])

  console.log("Created departments:", departments.length)

  // Create Leave Types
  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({
      where: { name: "Annual Leave" },
      update: {},
      create: {
        name: "Annual Leave",
        description: "Regular annual vacation leave",
        defaultDays: 20,
        color: "#3B82F6",
        carryForward: true,
        maxCarryDays: 5
      }
    }),
    prisma.leaveType.upsert({
      where: { name: "Sick Leave" },
      update: {},
      create: {
        name: "Sick Leave",
        description: "Leave for illness or medical appointments",
        defaultDays: 10,
        color: "#EF4444",
        carryForward: false,
        maxCarryDays: 0
      }
    }),
    prisma.leaveType.upsert({
      where: { name: "Casual Leave" },
      update: {},
      create: {
        name: "Casual Leave",
        description: "Short-term personal leave",
        defaultDays: 5,
        color: "#F59E0B",
        carryForward: false,
        maxCarryDays: 0
      }
    }),
    prisma.leaveType.upsert({
      where: { name: "Maternity Leave" },
      update: {},
      create: {
        name: "Maternity Leave",
        description: "Leave for new mothers",
        defaultDays: 90,
        color: "#EC4899",
        carryForward: false,
        maxCarryDays: 0
      }
    }),
    prisma.leaveType.upsert({
      where: { name: "Paternity Leave" },
      update: {},
      create: {
        name: "Paternity Leave",
        description: "Leave for new fathers",
        defaultDays: 14,
        color: "#8B5CF6",
        carryForward: false,
        maxCarryDays: 0
      }
    }),
    prisma.leaveType.upsert({
      where: { name: "Unpaid Leave" },
      update: {},
      create: {
        name: "Unpaid Leave",
        description: "Leave without pay",
        defaultDays: 0,
        color: "#6B7280",
        carryForward: false,
        maxCarryDays: 0
      }
    }),
  ])

  console.log("Created leave types:", leaveTypes.length)

  // Hash passwords
  const hashedPassword = await hash("password123", 10)

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      password: hashedPassword,
      name: "Admin User",
      role: Role.ADMIN,
      departmentId: departments[1].id, // HR
    }
  })

  // Create Manager Users
  const engineeringManager = await prisma.user.upsert({
    where: { email: "manager.eng@company.com" },
    update: {},
    create: {
      email: "manager.eng@company.com",
      password: hashedPassword,
      name: "John Smith",
      role: Role.MANAGER,
      departmentId: departments[0].id, // Engineering
    }
  })

  const salesManager = await prisma.user.upsert({
    where: { email: "manager.sales@company.com" },
    update: {},
    create: {
      email: "manager.sales@company.com",
      password: hashedPassword,
      name: "Sarah Johnson",
      role: Role.MANAGER,
      departmentId: departments[2].id, // Sales
    }
  })

  // Create Employee Users
  const employees = await Promise.all([
    prisma.user.upsert({
      where: { email: "employee1@company.com" },
      update: {},
      create: {
        email: "employee1@company.com",
        password: hashedPassword,
        name: "Alice Brown",
        role: Role.EMPLOYEE,
        departmentId: departments[0].id,
        managerId: engineeringManager.id,
      }
    }),
    prisma.user.upsert({
      where: { email: "employee2@company.com" },
      update: {},
      create: {
        email: "employee2@company.com",
        password: hashedPassword,
        name: "Bob Wilson",
        role: Role.EMPLOYEE,
        departmentId: departments[0].id,
        managerId: engineeringManager.id,
      }
    }),
    prisma.user.upsert({
      where: { email: "employee3@company.com" },
      update: {},
      create: {
        email: "employee3@company.com",
        password: hashedPassword,
        name: "Charlie Davis",
        role: Role.EMPLOYEE,
        departmentId: departments[2].id,
        managerId: salesManager.id,
      }
    }),
    prisma.user.upsert({
      where: { email: "employee4@company.com" },
      update: {},
      create: {
        email: "employee4@company.com",
        password: hashedPassword,
        name: "Diana Miller",
        role: Role.EMPLOYEE,
        departmentId: departments[3].id,
      }
    }),
  ])

  console.log("Created users:", 1 + 2 + employees.length)

  // Create Leave Balances for all users
  const currentYear = new Date().getFullYear()
  const allUsers = [admin, engineeringManager, salesManager, ...employees]

  for (const user of allUsers) {
    for (const leaveType of leaveTypes) {
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveTypeId_year: {
            userId: user.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
          }
        },
        update: {},
        create: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
          totalDays: leaveType.defaultDays,
          usedDays: 0,
          pendingDays: 0,
          carriedDays: 0,
        }
      })
    }
  }

  console.log("Created leave balances for all users")

  // Create sample holidays
  const holidays = [
    { name: "New Year's Day", date: new Date(currentYear, 0, 1) },
    { name: "Independence Day", date: new Date(currentYear, 6, 4) },
    { name: "Thanksgiving", date: new Date(currentYear, 10, 28) },
    { name: "Christmas Day", date: new Date(currentYear, 11, 25) },
  ]

  for (const holiday of holidays) {
    try {
      await prisma.holiday.create({ data: holiday })
    } catch {
      // Holiday already exists
    }
  }

  console.log("Created holidays")

  // Create settings
  await prisma.setting.upsert({
    where: { key: "company_name" },
    update: {},
    create: { key: "company_name", value: "TechCorp Inc.", description: "Company name" }
  })

  await prisma.setting.upsert({
    where: { key: "leave_requires_approval" },
    update: {},
    create: { key: "leave_requires_approval", value: "true", description: "Whether leave requests require approval" }
  })

  console.log("Created settings")
  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
