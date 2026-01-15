import { NextRequest, NextResponse } from 'next/server'
import { AdminBlogService } from '@/services/AdminBlogService'

/**
 * Public API endpoint for blogs
 * Only returns published blogs from admin tables
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const slug = searchParams.get('slug')

    if (slug) {
      // Get single blog by slug
      const blog = await AdminBlogService.getBySlug(slug)
      if (!blog || blog.status !== 'published') {
        return NextResponse.json(
          { success: false, error: 'Blog not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          seo_title: blog.seo_title,
          seo_description: blog.seo_description,
          createdAt: blog.createdAt
        }
      })
    }

    // Only fetch published blogs
    const result = await AdminBlogService.getAll({
      status: 'published',
      search,
      page,
      limit
    })

    // Transform to match public API format
    const transformedData = result.data.map((blog: any) => ({
      id: blog._id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.content.substring(0, 200) + '...',
      content: blog.content,
      seo_title: blog.seo_title,
      seo_description: blog.seo_description,
      createdAt: blog.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('❌ Error fetching public blogs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}
