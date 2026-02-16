import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/holidays - Get holidays
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    const holidays = await db.holiday.findMany({
      where: {
        date: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      },
      orderBy: { date: "asc" }
    })

    return NextResponse.json(holidays)
  } catch (error) {
    console.error("Error fetching holidays:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/holidays - Create holiday (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, date, isRecurring } = body

    if (!name || !date) {
      return NextResponse.json({ error: "Name and date are required" }, { status: 400 })
    }

    const holiday = await db.holiday.create({
      data: {
        name,
        date: new Date(date),
        isRecurring: isRecurring || false
      }
    })

    return NextResponse.json(holiday)
  } catch (error) {
    console.error("Error creating holiday:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
