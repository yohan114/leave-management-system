import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LeaveStatus } from "@prisma/client"

// GET /api/leave-requests/[id] - Get single leave request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const leaveRequest = await db.leaveRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        leaveType: true,
        approver: { select: { id: true, name: true } }
      }
    })

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    // Check access
    if (session.user.role === "EMPLOYEE" && leaveRequest.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Error fetching leave request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/leave-requests/[id] - Update leave request (approve/reject/cancel)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, rejectionReason } = body

    const leaveRequest = await db.leaveRequest.findUnique({
      where: { id },
      include: { user: true, leaveType: true }
    })

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    // Handle different actions
    if (action === "cancel") {
      // Only the requester can cancel
      if (leaveRequest.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (leaveRequest.status !== LeaveStatus.PENDING) {
        return NextResponse.json({ error: "Can only cancel pending requests" }, { status: 400 })
      }

      // Update status and restore pending days
      await db.$transaction([
        db.leaveRequest.update({
          where: { id },
          data: {
            status: LeaveStatus.CANCELLED,
            cancelledAt: new Date()
          }
        }),
        db.leaveBalance.update({
          where: {
            userId_leaveTypeId_year: {
              userId: leaveRequest.userId,
              leaveTypeId: leaveRequest.leaveTypeId,
              year: new Date(leaveRequest.startDate).getFullYear()
            }
          },
          data: { pendingDays: { decrement: leaveRequest.totalDays } }
        })
      ])

      return NextResponse.json({ message: "Leave request cancelled" })
    }

    if (action === "approve" || action === "reject") {
      // Only managers and admins can approve/reject
      if (session.user.role === "EMPLOYEE") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Managers can only approve their team members' requests
      if (session.user.role === "MANAGER") {
        const requestUser = await db.user.findUnique({
          where: { id: leaveRequest.userId }
        })
        if (requestUser?.managerId !== session.user.id && leaveRequest.userId !== session.user.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
      }

      if (leaveRequest.status !== LeaveStatus.PENDING) {
        return NextResponse.json({ error: "Request already processed" }, { status: 400 })
      }

      if (action === "approve") {
        await db.$transaction([
          db.leaveRequest.update({
            where: { id },
            data: {
              status: LeaveStatus.APPROVED,
              approvedAt: new Date(),
              approvedBy: session.user.id
            }
          }),
          db.leaveBalance.update({
            where: {
              userId_leaveTypeId_year: {
                userId: leaveRequest.userId,
                leaveTypeId: leaveRequest.leaveTypeId,
                year: new Date(leaveRequest.startDate).getFullYear()
              }
            },
            data: {
              pendingDays: { decrement: leaveRequest.totalDays },
              usedDays: { increment: leaveRequest.totalDays }
            }
          })
        ])

        // Notify user
        await db.notification.create({
          data: {
            userId: leaveRequest.userId,
            title: "Leave Approved",
            message: `Your ${leaveRequest.totalDays} day(s) ${leaveRequest.leaveType.name} request has been approved`,
            type: "approval",
            link: "/my-requests"
          }
        })

        return NextResponse.json({ message: "Leave request approved" })
      } else {
        // Reject
        if (!rejectionReason) {
          return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
        }

        await db.$transaction([
          db.leaveRequest.update({
            where: { id },
            data: {
              status: LeaveStatus.REJECTED,
              rejectionReason,
              approvedAt: new Date(),
              approvedBy: session.user.id
            }
          }),
          db.leaveBalance.update({
            where: {
              userId_leaveTypeId_year: {
                userId: leaveRequest.userId,
                leaveTypeId: leaveRequest.leaveTypeId,
                year: new Date(leaveRequest.startDate).getFullYear()
              }
            },
            data: { pendingDays: { decrement: leaveRequest.totalDays } }
          })
        ])

        // Notify user
        await db.notification.create({
          data: {
            userId: leaveRequest.userId,
            title: "Leave Rejected",
            message: `Your ${leaveRequest.totalDays} day(s) ${leaveRequest.leaveType.name} request has been rejected: ${rejectionReason}`,
            type: "rejection",
            link: "/my-requests"
          }
        })

        return NextResponse.json({ message: "Leave request rejected" })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating leave request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
