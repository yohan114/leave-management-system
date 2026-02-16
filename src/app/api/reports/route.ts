import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LeaveStatus } from "@prisma/client"

// GET /api/reports - Get various reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "summary"
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const departmentId = searchParams.get("departmentId")

    if (type === "summary") {
      // Get overall statistics
      const [
        totalUsers,
        totalDepartments,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        leaveTypeStats
      ] = await Promise.all([
        db.user.count({ where: { isActive: true } }),
        db.department.count(),
        db.leaveRequest.count({ where: { status: LeaveStatus.PENDING } }),
        db.leaveRequest.count({ 
          where: { 
            status: LeaveStatus.APPROVED,
            startDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }
          } 
        }),
        db.leaveRequest.count({ 
          where: { 
            status: LeaveStatus.REJECTED,
            startDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }
          } 
        }),
        db.leaveRequest.groupBy({
          by: ['leaveTypeId'],
          where: {
            status: LeaveStatus.APPROVED,
            startDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
            ...(departmentId && { departmentId })
          },
          _sum: { totalDays: true },
          _count: true
        })
      ])

      // Get leave type names
      const leaveTypes = await db.leaveType.findMany()
      const leaveTypeStatsWithNames = leaveTypeStats.map(stat => ({
        ...stat,
        leaveType: leaveTypes.find(lt => lt.id === stat.leaveTypeId)
      }))

      return NextResponse.json({
        totalUsers,
        totalDepartments,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        leaveTypeStats: leaveTypeStatsWithNames
      })
    }

    if (type === "department") {
      // Get department-wise statistics
      const departments = await db.department.findMany({
        include: {
          users: {
            include: {
              leaveRequests: {
                where: {
                  status: LeaveStatus.APPROVED,
                  startDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }
                }
              }
            }
          }
        }
      })

      const departmentStats = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        employeeCount: dept.users.length,
        totalLeaveDays: dept.users.reduce((acc, user) => 
          acc + user.leaveRequests.reduce((sum, req) => sum + req.totalDays, 0), 0
        )
      }))

      return NextResponse.json(departmentStats)
    }

    if (type === "user") {
      // Get individual user statistics
      const whereClause: Record<string, unknown> = { isActive: true }
      if (departmentId) whereClause.departmentId = departmentId

      const users = await db.user.findMany({
        where: whereClause,
        include: {
          department: true,
          leaveBalances: {
            where: { year },
            include: { leaveType: true }
          },
          leaveRequests: {
            where: {
              startDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }
            },
            include: { leaveType: true }
          }
        }
      })

      return NextResponse.json(users)
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
