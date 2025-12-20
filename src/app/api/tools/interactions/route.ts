import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserToolInteraction from '@/models/UserToolInteraction'
import Tool from '@/models/Tool'

// GET - Get user's interactions for tools
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const toolIds = searchParams.get('toolIds')?.split(',')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query: any = { userId }
    if (toolIds && toolIds.length > 0) {
      query.toolId = { $in: toolIds }
    }

    const interactions = await UserToolInteraction.find(query)
    
    // Create a map for easy lookup
    const interactionMap: Record<string, { isLiked: boolean; isBookmarked: boolean }> = {}
    interactions.forEach(interaction => {
      interactionMap[interaction.toolId] = {
        isLiked: interaction.isLiked,
        isBookmarked: interaction.isBookmarked
      }
    })

    return NextResponse.json({
      success: true,
      data: interactionMap
    })
  } catch (error) {
    console.error('Error fetching user tool interactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interactions' },
      { status: 500 }
    )
  }
}

// POST - Toggle like or bookmark for a tool
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { userId, toolId, action } = body
    
    if (!userId || !toolId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID, Tool ID, and action are required' },
        { status: 400 }
      )
    }

    if (!['like', 'unlike', 'bookmark', 'unbookmark'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be like, unlike, bookmark, or unbookmark' },
        { status: 400 }
      )
    }

    // Check if tool exists
    const tool = await Tool.findOne({ id: toolId })
    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }

    // Find or create interaction
    let interaction = await UserToolInteraction.findOne({ userId, toolId })
    
    if (!interaction) {
      interaction = new UserToolInteraction({
        userId,
        toolId,
        isLiked: false,
        isBookmarked: false
      })
    }

    // Update based on action
    switch (action) {
      case 'like':
        interaction.isLiked = true
        break
      case 'unlike':
        interaction.isLiked = false
        break
      case 'bookmark':
        interaction.isBookmarked = true
        break
      case 'unbookmark':
        interaction.isBookmarked = false
        break
    }

    await interaction.save()

    return NextResponse.json({
      success: true,
      data: {
        toolId: interaction.toolId,
        isLiked: interaction.isLiked,
        isBookmarked: interaction.isBookmarked
      }
    })
  } catch (error) {
    console.error('Error updating tool interaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update interaction' },
      { status: 500 }
    )
  }
}