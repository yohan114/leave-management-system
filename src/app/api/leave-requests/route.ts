import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LeaveStatus } from "@prisma/client"
import { differenceInBusinessDays } from "date-fns"

// GET /api/leave-requests - Get leave requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")
    const departmentId = searchParams.get("departmentId")

    let whereClause: Record<string, unknown> = {}

    // Role-based filtering
    if (session.user.role === "EMPLOYEE") {
      whereClause.userId = session.user.id
    } else if (session.user.role === "MANAGER") {
      // Managers see their team's requests + their own
      if (userId) {
        whereClause.userId = userId
      } else {
        whereClause.OR = [
          { userId: session.user.id },
          { user: { managerId: session.user.id } }
        ]
      }
    } else {
      // Admin sees all
      if (userId) whereClause.userId = userId
      if (departmentId) whereClause.departmentId = departmentId
    }

    if (status) {
      whereClause.status = status as LeaveStatus
    }

    const leaveRequests = await db.leaveRequest.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        leaveType: true,
        approver: { select: { id: true, name: true } }
      },
      orderBy: { appliedAt: "desc" }
    })

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/leave-requests - Create new leave request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { leaveTypeId, startDate, endDate, halfDay, reason } = body

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 })
    }

    // Calculate business days
    const totalDays = halfDay ? 0.5 : differenceInBusinessDays(end, start) + 1

    // Check leave balance
    const currentYear = new Date().getFullYear()
    const leaveBalance = await db.leaveBalance.findUnique({
      where: {
        userId_leaveTypeId_year: {
          userId: session.user.id,
          leaveTypeId,
          year: currentYear
        }
      }
    })

    if (!leaveBalance) {
      return NextResponse.json({ error: "Leave balance not found" }, { status: 400 })
    }

    const availableDays = leaveBalance.totalDays - leaveBalance.usedDays - leaveBalance.pendingDays
    if (totalDays > availableDays) {
      return NextResponse.json({ error: "Insufficient leave balance" }, { status: 400 })
    }

    // Check for overlapping requests
    const overlapping = await db.leaveRequest.findFirst({
      where: {
        userId: session.user.id,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json({ error: "Overlapping leave request exists" }, { status: 400 })
    }

    // Get user's department
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { departmentId: true }
    })

    // Create leave request
    const leaveRequest = await db.leaveRequest.create({
      data: {
        userId: session.user.id,
        leaveTypeId,
        departmentId: user?.departmentId,
        startDate: start,
        endDate: end,
        totalDays,
        halfDay: halfDay || false,
        reason,
        status: LeaveStatus.PENDING
      },
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        leaveType: true
      }
    })

    // Update pending days in leave balance
    await db.leaveBalance.update({
      where: { id: leaveBalance.id },
      data: { pendingDays: { increment: totalDays } }
    })

    // Create notification for manager
    const userWithManager = await db.user.findUnique({
      where: { id: session.user.id },
      include: { manager: true }
    })

    if (userWithManager?.manager) {
      await db.notification.create({
        data: {
          userId: userWithManager.manager.id,
          title: "New Leave Request",
          message: `${session.user.name} has requested ${totalDays} day(s) of ${leaveRequest.leaveType.name}`,
          type: "leave_request",
          link: "/approvals"
        }
      })
    }

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Error creating leave request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
