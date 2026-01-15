import { NextRequest, NextResponse } from 'next/server'
import { AdminVideoService } from '@/services/AdminVideoService'
import { getAdminUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as 'draft' | 'published' | undefined
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    const result = await AdminVideoService.getAll({
      status,
      category,
      search,
      page,
      limit
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('❌ Error fetching admin videos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, video_url, duration, category, status } = body

    if (!title || !description || !video_url || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const video = await AdminVideoService.create({
      title,
      description,
      video_url,
      duration,
      category,
      status: status || 'draft',
      created_by: adminUser.id
    })

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
