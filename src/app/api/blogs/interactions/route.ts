import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserBlogInteraction from '@/models/UserBlogInteraction'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const blogIds = searchParams.get('blogIds')?.split(',') || []

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (blogIds.length === 0) {
      return NextResponse.json({ interactions: {} })
    }

    await connectDB()

    const interactions = await UserBlogInteraction.find({
      userId,
      blogId: { $in: blogIds }
    })

    const interactionMap = interactions.reduce((acc, interaction) => {
      acc[interaction.blogId] = {
        isLiked: interaction.isLiked,
        isBookmarked: interaction.isBookmarked
      }
      return acc
    }, {} as Record<string, { isLiked: boolean; isBookmarked: boolean }>)

    return NextResponse.json({ interactions: interactionMap })
  } catch (error) {
    console.error('Error fetching blog interactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, blogId, action } = await request.json()

    if (!userId || !blogId || !action || !['like', 'bookmark'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    await connectDB()

    const updateField = action === 'like' ? 'isLiked' : 'isBookmarked'

    // Find existing interaction or create new one
    let interaction = await UserBlogInteraction.findOne({ userId, blogId })

    if (!interaction) {
      interaction = new UserBlogInteraction({
        userId,
        blogId,
        isLiked: false,
        isBookmarked: false
      })
    }

    // Toggle the action
    interaction[updateField] = !interaction[updateField]

    // If both isLiked and isBookmarked are false, delete the document
    if (!interaction.isLiked && !interaction.isBookmarked) {
      await UserBlogInteraction.deleteOne({ userId, blogId })
      return NextResponse.json({ 
        success: true, 
        isLiked: false, 
        isBookmarked: false 
      })
    } else {
      await interaction.save()
      return NextResponse.json({ 
        success: true, 
        isLiked: interaction.isLiked, 
        isBookmarked: interaction.isBookmarked 
      })
    }
  } catch (error) {
    console.error('Error updating blog interaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
