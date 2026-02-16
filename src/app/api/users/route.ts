import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hash } from "bcrypt"
import { Role } from "@prisma/client"

// GET /api/users - Get all users (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await db.user.findMany({
      include: {
        department: true,
        manager: { select: { id: true, name: true } },
        _count: { select: { teamMembers: true, leaveRequests: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, role, departmentId, managerId } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as Role || Role.EMPLOYEE,
        departmentId,
        managerId,
      },
      include: { department: true }
    })

    // Create leave balances for the new user
    const leaveTypes = await db.leaveType.findMany({ where: { isActive: true } })
    const currentYear = new Date().getFullYear()
    
    for (const leaveType of leaveTypes) {
      await db.leaveBalance.create({
        data: {
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

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
