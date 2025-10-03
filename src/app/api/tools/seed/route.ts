import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tool from '@/models/Tool'
import { allTools } from '@/lib/data'

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting tools seeding process...')
    
    // Connect to database
    await connectDB()
    console.log('✅ Connected to MongoDB')

    // Clear existing tools (optional - remove this if you want to keep existing data)
    await Tool.deleteMany({})
    console.log('🗑️ Cleared existing tools')

    // Transform and insert tools with unique IDs
    const toolsToInsert = allTools.map((tool, index) => ({
      id: (index + 1).toString(), // Generate unique sequential IDs
      title: tool.title,
      description: tool.description,
      tags: tool.tags,
      image: tool.image,
      clickCount: tool.clickCount,
      category: tool.category,
      website: tool.website
    }))

    // Insert all tools
    const insertedTools = await Tool.insertMany(toolsToInsert)
    console.log(`✅ Successfully inserted ${insertedTools.length} tools`)

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedTools.length} tools to database`,
      count: insertedTools.length
    })

  } catch (error) {
    console.error('❌ Error seeding tools:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed tools',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const toolCount = await Tool.countDocuments()
    
    return NextResponse.json({
      success: true,
      message: `Database currently contains ${toolCount} tools`,
      count: toolCount
    })

  } catch (error) {
    console.error('❌ Error checking tools count:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check tools count',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}