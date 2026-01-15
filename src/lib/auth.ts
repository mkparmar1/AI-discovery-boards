import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

/**
 * Get user from request (for API routes)
 * Tries multiple methods: body, headers, cookies
 */
export async function getUserFromRequest(request: NextRequest): Promise<{
  id: string
  email: string
  role: string
} | null> {
  try {
    // Try to get from request body first (for POST/PUT requests)
    try {
      const body = await request.clone().json().catch(() => null)
      if (body?.userId) {
        await connectDB()
        const user = await User.findById(body.userId)
        if (user) {
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
      if (user) {
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role
        }
      }
    }

    // Try to get from query params (for GET requests)
    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get('userId')
    if (queryUserId) {
      await connectDB()
      const user = await User.findById(queryUserId)
      if (user) {
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

/**
 * Get admin user from request (for admin API routes)
 */
export async function getAdminUserFromRequest(request: NextRequest): Promise<{
  id: string
  email: string
  role: string
} | null> {
  const user = await getUserFromRequest(request)
  if (user && user.role === 'admin') {
    return user
  }
  return null
}
