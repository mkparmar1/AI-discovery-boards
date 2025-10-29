import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import UserPromptInteraction from '@/models/UserPromptInteraction'

// GET - Fetch user interactions for specific prompts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const promptIds = searchParams.get('promptIds')

    if (!userId || !promptIds) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or promptIds' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const promptIdArray = promptIds.split(',')
    const interactions = await UserPromptInteraction.find({
      userId,
      promptId: { $in: promptIdArray }
    })

    // Create a map of promptId -> interaction data
    const interactionMap: { [key: string]: { isLiked: boolean; isBookmarked: boolean } } = {}
    
    interactions.forEach(interaction => {
      interactionMap[interaction.promptId] = {
        isLiked: interaction.isLiked,
        isBookmarked: interaction.isBookmarked
      }
    })

    // Fill in missing interactions with default values
    promptIdArray.forEach(promptId => {
      if (!interactionMap[promptId]) {
        interactionMap[promptId] = {
          isLiked: false,
          isBookmarked: false
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: interactionMap
    })
  } catch (error) {
    console.error('Error fetching user prompt interactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interactions' },
      { status: 500 }
    )
  }
}

// POST - Toggle like or bookmark for a prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, promptId, action, value } = body

    if (!userId || !promptId || !action || typeof value !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (action !== 'like' && action !== 'bookmark') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "like" or "bookmark"' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const updateField = action === 'like' ? 'isLiked' : 'isBookmarked'
    
    const interaction = await UserPromptInteraction.findOneAndUpdate(
      { userId, promptId },
      { 
        $set: { [updateField]: value },
        $setOnInsert: { 
          userId, 
          promptId,
          isLiked: action === 'like' ? value : false,
          isBookmarked: action === 'bookmark' ? value : false
        }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        promptId: interaction.promptId,
        isLiked: interaction.isLiked,
        isBookmarked: interaction.isBookmarked
      }
    })
  } catch (error) {
    console.error('Error updating prompt interaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update interaction' },
      { status: 500 }
    )
  }
}

// GET_LIKED - Get all liked prompts for a user
export async function GET_LIKED(userId: string) {
  try {
    await connectToDatabase()
    
    const likedInteractions = await UserPromptInteraction.find({
      userId,
      isLiked: true
    }).select('promptId')

    return likedInteractions.map(interaction => interaction.promptId)
  } catch (error) {
    console.error('Error fetching liked prompts:', error)
    return []
  }
}

// GET_BOOKMARKED - Get all bookmarked prompts for a user
export async function GET_BOOKMARKED(userId: string) {
  try {
    await connectToDatabase()
    
    const bookmarkedInteractions = await UserPromptInteraction.find({
      userId,
      isBookmarked: true
    }).select('promptId')

    return bookmarkedInteractions.map(interaction => interaction.promptId)
  } catch (error) {
    console.error('Error fetching bookmarked prompts:', error)
    return []
  }
}