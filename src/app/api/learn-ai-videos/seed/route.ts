import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LearnAIVideo from '@/models/LearnAIVideo'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    // Body can be a single video object or an array of videos
    const videos = Array.isArray(body) ? body : [body]

    // Basic validation
    const sanitized = videos.map(v => ({
      title: v.title,
      topic: v.topic,
      youtubeUrl: v.youtubeUrl,
      thumbnail: v.thumbnail,
      description: v.description,
      status: v.status ?? 'Active',
    }))

    const result = await LearnAIVideo.insertMany(sanitized, { ordered: false })

    return NextResponse.json({ success: true, inserted: result.length })
  } catch (error) {
    console.error('❌ Error seeding Learn AI videos:', error)
    return NextResponse.json({ success: false, error: 'Failed to seed videos' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const count = await LearnAIVideo.countDocuments()
    return NextResponse.json({ success: true, count })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to check videos' }, { status: 500 })
  }
}