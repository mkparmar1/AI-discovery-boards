import { NextRequest, NextResponse } from 'next/server'
import { AdminBlogService } from '@/services/AdminBlogService'
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
    const search = searchParams.get('search') || undefined

    const result = await AdminBlogService.getAll({
      status,
      search,
      page,
      limit
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('❌ Error fetching admin blogs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
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
    const { title, slug, content, seo_title, seo_description, status } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const blog = await AdminBlogService.create({
      title,
      slug,
      content,
      seo_title,
      seo_description,
      status: status || 'draft',
      created_by: adminUser.id
    })

    return NextResponse.json({
      success: true,
      data: blog,
      message: 'Blog created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating blog:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}
