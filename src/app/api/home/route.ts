import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tool from '@/models/Tool'
import LearnAIVideo from '@/models/LearnAIVideo'

type VideoDoc = {
  _id: string
  title: string
  topic: string
  youtubeUrl: string
  thumbnail: string
  description: string
  status: 'Active' | 'Inactive'
  isTrending?: boolean
  createdAt?: Date
}

const shuffle = <T,>(items: T[]) => {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export async function GET() {
  try {
    await connectDB()

    const [tools, toolsCount] = await Promise.all([
      Tool.find({})
        .sort({ isTrending: -1, createdAt: -1 })
        .limit(3)
        .lean(),
      Tool.countDocuments({})
    ])

    const trendingVideos = await LearnAIVideo.find({ status: 'Active', isTrending: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()

    let videos: VideoDoc[] = trendingVideos as VideoDoc[]

    if (videos.length < 3) {
      const latestVideos = await LearnAIVideo.find({ status: 'Active' })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean()

      const existingIds = new Set(videos.map(video => String(video._id)))
      const available = latestVideos.filter(video => !existingIds.has(String(video._id)))
      const fill = shuffle(available).slice(0, 3 - videos.length)
      videos = videos.concat(fill as VideoDoc[])
    }

    return NextResponse.json({
      success: true,
      data: {
        tools,
        toolsCount,
        videos
      }
    })
  } catch (error) {
    console.error('❌ Error fetching home data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch home data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
