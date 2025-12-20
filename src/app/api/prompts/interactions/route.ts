import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
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

    await connectDB()

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
  // Ensure variables are accessible in the catch block for retry logic
  let userId: string | undefined
  let promptId: string | undefined
  let action: 'like' | 'bookmark' | undefined
  let value: boolean | undefined

  try {
    const body = await request.json()
    userId = body?.userId
    promptId = body?.promptId
    action = body?.action
    value = body?.value

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

    await connectDB()

    const updateField = action === 'like' ? 'isLiked' : 'isBookmarked'
    const setOnInsert = action === 'like'
      ? { userId, promptId, isBookmarked: false }
      : { userId, promptId, isLiked: false }
    
    let interaction = await UserPromptInteraction.findOneAndUpdate(
      { userId, promptId },
      { 
        $set: { [updateField]: value },
        $setOnInsert: setOnInsert
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    )

    if (!interaction) {
      interaction = await UserPromptInteraction.findOne({ userId, promptId })
    }

    return NextResponse.json({
      success: true,
      data: {
        promptId: interaction.promptId,
        isLiked: interaction.isLiked,
        isBookmarked: interaction.isBookmarked
      }
    })
  } catch (error: any) {
    if (error?.code === 11000 && action && userId && promptId !== undefined && typeof value === 'boolean') {
      try {
        const updateField = action === 'like' ? 'isLiked' : 'isBookmarked'
        const interaction = await UserPromptInteraction.findOneAndUpdate(
          { userId, promptId },
          { $set: { [updateField]: value } },
          { new: true, runValidators: true }
        )
        if (interaction) {
          return NextResponse.json({
            success: true,
            data: {
              promptId: interaction.promptId,
              isLiked: interaction.isLiked,
              isBookmarked: interaction.isBookmarked
            }
          })
        }
      } catch (retryError) {
        console.error('Error updating prompt interaction after duplicate:', retryError)
      }
    }

    console.error('Error updating prompt interaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update interaction', details: error?.message },
      { status: 500 }
    )
  }
}
