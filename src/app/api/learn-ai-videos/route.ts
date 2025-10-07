import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LearnAIVideo from '@/models/LearnAIVideo'

// Optional: static fallback dataset for local dev without DB
const fallbackVideos = [
  {
    title: 'Python for AI Crash Course',
    topic: 'Python for AI',
    youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    thumbnail: 'https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg',
    description: 'Get started with Python for AI with this comprehensive crash course',
    status: 'Active'
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const skip = (page - 1) * limit
  const topic = searchParams.get('topic') || undefined
  const status = searchParams.get('status') || 'Active'

  try {
    await connectDB()

    const query: any = { status }
    if (topic) {
      query.topic = { $regex: topic, $options: 'i' }
    }

    const [videos, totalCount] = await Promise.all([
      LearnAIVideo.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LearnAIVideo.countDocuments(query)
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      success: true,
      data: videos,
      pagination: { page, limit, totalCount, totalPages, hasMore }
    })
  } catch (error) {
    console.error('❌ Error fetching Learn AI videos, using fallback:', error)
    const filtered = fallbackVideos.filter(v => v.status === 'Active' && (!topic || new RegExp(topic, 'i').test(v.topic)))
    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / limit)
    const sliced = filtered.slice(skip, skip + limit)
    return NextResponse.json({
      success: true,
      data: sliced,
      pagination: { page, limit, totalCount, totalPages, hasMore: page < totalPages },
      source: 'static'
    })
  }
}