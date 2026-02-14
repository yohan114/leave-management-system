import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/session - Get current session info
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user
    })
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
