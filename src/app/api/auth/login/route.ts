import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login request received')
    
    // Connect to database
    await connectDB()
    
    // Parse request body
    const { email, password } = await request.json()
    
    console.log('📋 Login attempt for email:', email)
    
    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Find user by email
    console.log('🔍 Looking for user:', email)
    const user = await User.findOne({ email })
    
    if (!user) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    console.log('✅ User found:', email)
    
    // Check password
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    console.log('✅ Login successful for user:', email)
    
    // Return success response (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
    
    return NextResponse.json(
      { 
        message: 'Login successful',
        user: userResponse
      },
      { status: 200 }
    )
    
  } catch (error: any) {
    console.error('❌ Login error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}