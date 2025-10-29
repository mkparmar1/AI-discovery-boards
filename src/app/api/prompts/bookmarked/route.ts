import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserPromptInteraction from '@/models/UserPromptInteraction'
import Prompt from '@/models/Prompt'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get bookmarked prompt IDs for the user
    const bookmarkedInteractions = await UserPromptInteraction.find({
      userId,
      isBookmarked: true
    }).select('promptId')

    const bookmarkedPromptIds = bookmarkedInteractions.map(interaction => interaction.promptId)

    if (bookmarkedPromptIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
          hasMore: false
        }
      })
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const totalCount = bookmarkedPromptIds.length

    // Get the actual prompts
    const prompts = await Prompt.find({
      id: { $in: bookmarkedPromptIds }
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      success: true,
      data: prompts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore
      }
    })
  } catch (error) {
    console.error('Error fetching bookmarked prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookmarked prompts' },
      { status: 500 }
    )
  }
}