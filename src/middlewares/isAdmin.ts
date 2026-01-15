import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: 'user' | 'admin'
  }
}

/**
 * Middleware to check if user is authenticated and is an admin
 * Returns 401 if not authenticated, 403 if not admin
 */
export async function isAdmin(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get user from request headers (set by auth middleware or session)
    const userId = request.headers.get('x-user-id')
    const userEmail = request.headers.get('x-user-email')
    const userRole = request.headers.get('x-user-role')

    // If headers are not set, try to get from Authorization header or session
    if (!userId || !userEmail) {
      // Try to get from localStorage on client side - this won't work in middleware
      // So we'll handle auth in the API routes instead
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Quick check if role is admin
    if (userRole === 'admin') {
      return null // Allow request to proceed
    }

    // If role header not set, verify in database
    await connectDB()
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    return null // Allow request to proceed
  } catch (error) {
    console.error('❌ Error in isAdmin middleware:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get user from request (for use in API routes)
 * This extracts user info from request body or headers
 */
export async function getAdminUser(request: NextRequest): Promise<{ id: string; email: string; role: string } | null> {
  try {
    // Try to get from request body first (for POST/PUT requests)
    try {
      const body = await request.clone().json().catch(() => null)
      if (body?.userId) {
        await connectDB()
        const user = await User.findById(body.userId)
        if (user && user.role === 'admin') {
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role
          }
        }
      }
    } catch {
      // Body parsing failed, continue to other methods
    }

    // Try to get from headers
    const userId = request.headers.get('x-user-id')
    if (userId) {
      await connectDB()
      const user = await User.findById(userId)
      if (user && user.role === 'admin') {
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role
        }
      }
    }

    // Try to get from Authorization header (if using JWT)
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      // TODO: Implement JWT verification if needed
    }

    return null
  } catch (error) {
    console.error('❌ Error getting admin user:', error)
    return null
  }
}
