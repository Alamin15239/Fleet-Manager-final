import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { emailVerificationService } from '@/lib/email-verification'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // All new users are created as USER role and require admin approval
    const user = await createUser({
      email,
      password,
      name,
      role: 'USER',
      permissions: {}
    })

    // Generate email verification token and send verification email
    const verificationToken = emailVerificationService.generateEmailToken()
    await emailVerificationService.storeEmailToken(user.id, verificationToken)
    
    try {
      await emailVerificationService.sendVerificationEmail(email, verificationToken, name)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail the registration if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      message: 'Account created successfully. Please check your email to verify your account, then wait for admin approval before you can access the system.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    let errorMessage = 'Registration failed'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        errorMessage = 'User with this email already exists'
        statusCode = 409
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}