import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import UserToolInteraction from '@/models/UserToolInteraction'
import Tool from '@/models/Tool'

// GET - Get user's bookmarked tools
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    const bookmarkedInteractions = await UserToolInteraction.find({
      userId,
      isBookmarked: true
    })
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 })

    const toolIds = bookmarkedInteractions.map(interaction => interaction.toolId)
    const tools = await Tool.find({ id: { $in: toolIds } })

    const totalCount = await UserToolInteraction.countDocuments({
      userId,
      isBookmarked: true
    })

    return NextResponse.json({
      success: true,
      data: tools,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      }
    })
  } catch (error) {
    console.error('Error fetching bookmarked tools:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookmarked tools' },
      { status: 500 }
    )
  }
}