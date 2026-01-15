import { NextRequest, NextResponse } from 'next/server'
import { AdminVideoService } from '@/services/AdminVideoService'

/**
 * Public API endpoint for learning videos
 * Only returns published videos from admin tables
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    // Only fetch published videos
    const result = await AdminVideoService.getAll({
      status: 'published',
      category,
      search,
      page,
      limit
    })

    // Transform to match public API format
    const transformedData = result.data.map((video: any) => ({
      _id: video._id,
      title: video.title,
      topic: video.category,
      youtubeUrl: video.video_url,
      description: video.description,
      duration: video.duration,
      status: 'Active',
      createdAt: video.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('❌ Error fetching public videos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
