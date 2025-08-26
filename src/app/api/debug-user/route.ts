import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Get user details
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        email 
      }, { status: 404 })
    }

    // Return user status (without sensitive data)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isApproved: user.isApproved,
      isEmailVerified: user.isEmailVerified,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })

  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json()

    if (!email || !action) {
      return NextResponse.json({ error: 'Email and action are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case 'approve':
        updateData = { isApproved: true }
        break
      case 'verify':
        updateData = { isEmailVerified: true }
        break
      case 'activate':
        updateData = { isActive: true }
        break
      case 'approve_and_verify':
        updateData = { isApproved: true, isEmailVerified: true }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { email },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isApproved: true,
        isEmailVerified: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: `User ${action}d successfully`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}