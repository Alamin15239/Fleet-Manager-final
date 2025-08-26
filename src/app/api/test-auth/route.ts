import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/test-auth - Starting request')
    
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader ? 'Present' : 'Missing')
    
    const user = await requireAuth(request)
    console.log('User authenticated:', user.id, user.email)

    return NextResponse.json({
      success: true,
      message: 'Authentication is working!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Test auth error:', error)
    
    if (error instanceof Error) {
      if (error.message === 'No token provided' || error.message === 'Invalid token' || error.message === 'User not found or inactive') {
        return NextResponse.json(
          { error: 'Authentication required', details: error.message },
          { status: 401 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}