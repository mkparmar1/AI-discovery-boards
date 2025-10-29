import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import UserPromptInteraction from '@/models/UserPromptInteraction'
import AIPrompt from '@/models/AIPrompt'

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

    await connectToDatabase()

    // Get liked prompt IDs for the user
    const likedInteractions = await UserPromptInteraction.find({
      userId,
      isLiked: true
    }).select('promptId')

    const likedPromptIds = likedInteractions.map(interaction => interaction.promptId)

    if (likedPromptIds.length === 0) {
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
    const totalCount = likedPromptIds.length

    // Get the actual prompts
    const prompts = await AIPrompt.find({
      id: { $in: likedPromptIds }
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
    console.error('Error fetching liked prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch liked prompts' },
      { status: 500 }
    )
  }
}