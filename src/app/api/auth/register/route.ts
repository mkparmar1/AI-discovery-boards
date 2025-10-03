import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Registration request received')
    
    // Connect to database
    await connectDB()
    
    // Parse request body
    const { name, email, password, confirmPassword } = await request.json()
    
    console.log('📋 Registration data:', { name, email, passwordLength: password?.length })
    
    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match')
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }
    
    // Validate password length
    if (password.length < 6) {
      console.log('❌ Password too short')
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    console.log('🔍 Checking if user exists:', email)
    const existingUser = await User.findOne({ email })
    
    if (existingUser) {
      console.log('❌ User already exists:', email)
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Create new user
    console.log('👤 Creating new user:', email)
    const user = new User({
      name,
      email,
      password
    })
    
    await user.save()
    console.log('✅ User created successfully:', email)
    
    // Return success response (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
    
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userResponse
      },
      { status: 201 }
    )
    
  } catch (error: any) {
    console.error('❌ Registration error:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}