import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/leave-balances - Get leave balances
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    // Determine which user's balances to fetch
    let targetUserId = session.user.id
    
    if (userId && session.user.role !== "EMPLOYEE") {
      targetUserId = userId
    }

    const balances = await db.leaveBalance.findMany({
      where: {
        userId: targetUserId,
        year
      },
      include: {
        leaveType: true
      }
    })

    return NextResponse.json(balances)
  } catch (error) {
    console.error("Error fetching leave balances:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
