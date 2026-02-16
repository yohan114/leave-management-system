import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/leave-types - Get all leave types
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const leaveTypes = await db.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    })

    return NextResponse.json(leaveTypes)
  } catch (error) {
    console.error("Error fetching leave types:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/leave-types - Create new leave type (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, defaultDays, color, carryForward, maxCarryDays } = body

    if (!name || defaultDays === undefined) {
      return NextResponse.json({ error: "Name and default days are required" }, { status: 400 })
    }

    const leaveType = await db.leaveType.create({
      data: {
        name,
        description,
        defaultDays: parseFloat(defaultDays),
        color: color || "#6B7280",
        carryForward: carryForward || false,
        maxCarryDays: parseFloat(maxCarryDays) || 0
      }
    })

    return NextResponse.json(leaveType)
  } catch (error) {
    console.error("Error creating leave type:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
