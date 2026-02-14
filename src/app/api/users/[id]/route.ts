import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hash } from "bcrypt"
import { Role } from "@prisma/client"

// GET /api/users/[id] - Get user by ID
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

    // Users can only view their own profile unless they're admin/manager
    if (session.user.role === "EMPLOYEE" && session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id },
      include: {
        department: true,
        manager: { select: { id: true, name: true, email: true } },
        teamMembers: { select: { id: true, name: true, email: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user
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

    // Admin can update all fields, users can only update their own name/password
    if (session.user.role === "ADMIN") {
      const { name, email, role, departmentId, managerId, isActive, password } = body
      
      const updateData: Record<string, unknown> = { name, email, role: role as Role, departmentId, managerId, isActive }
      
      if (password) {
        updateData.password = await hash(password, 10)
      }

      const user = await db.user.update({
        where: { id },
        data: updateData,
        include: { department: true }
      })

      return NextResponse.json(user)
    } else if (session.user.id === id) {
      // Users can update their own profile
      const { name, password } = body
      
      const updateData: Record<string, unknown> = {}
      if (name) updateData.name = name
      if (password) updateData.password = await hash(password, 10)

      const user = await db.user.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json(user)
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db.user.delete({ where: { id } })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
