import { NextRequest, NextResponse } from 'next/server'
import { AdminToolService } from '@/services/AdminToolService'

/**
 * Public API endpoint for tools
 * Only returns published tools from admin tables
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    // Only fetch published tools
    const result = await AdminToolService.getAll({
      status: 'published',
      category,
      search,
      page,
      limit
    })

    // Transform to match public API format
    const transformedData = result.data.map((tool: any) => ({
      id: tool._id,
      title: tool.title,
      description: tool.description,
      category: tool.category,
      website: tool.website_url,
      pricing: tool.pricing_type,
      createdAt: tool.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('❌ Error fetching public tools:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}
