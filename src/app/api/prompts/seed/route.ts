import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Prompt from '@/models/Prompt'
import { aiPrompts } from '@/lib/data'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting prompt seeding process...')
    
    // Connect to database
    await connectDB()
    console.log('✅ Connected to MongoDB')

    // Check if prompts already exist
    const existingCount = await Prompt.countDocuments()
    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing prompts. Clearing them first...`)
      await Prompt.deleteMany({})
      console.log('🗑️ Cleared existing prompts')
    }

    // Transform and insert prompts with unique IDs
    const promptsToInsert = aiPrompts.map((prompt, index) => ({
      id: randomUUID(), // Generate unique UUID-based IDs
      title: prompt.title,
      prompt: prompt.prompt,
      category: prompt.category,
      tags: prompt.tags,
      description: prompt.description,
      useCase: prompt.useCase,
      difficulty: prompt.difficulty,
      createdAt: new Date(prompt.createdAt)
    }))

    // Insert all prompts with error handling for duplicates
    const insertedPrompts = await Prompt.insertMany(promptsToInsert, { ordered: false })
    console.log(`✅ Successfully inserted ${insertedPrompts.length} prompts`)

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedPrompts.length} prompts to database`,
      count: insertedPrompts.length
    })

  } catch (error) {
    console.error('❌ Error seeding prompts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed prompts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectDB()
    const count = await Prompt.countDocuments()
    return NextResponse.json({ 
      message: `Database currently has ${count} prompts`,
      count 
    })
  } catch (error) {
    console.error('❌ Error checking prompts:', error)
    return NextResponse.json(
      { error: 'Failed to check prompts' },
      { status: 500 }
    )
  }
}