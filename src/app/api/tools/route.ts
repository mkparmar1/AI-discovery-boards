import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tool from '@/models/Tool'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)

    // Meta-only endpoint to avoid heavy fetches for categories and tags
    const metaOnly = searchParams.get('metaOnly') === 'true'
    if (metaOnly) {
      const categories = await Tool.distinct('category')
      const tags = await Tool.distinct('tags')
      const totalCount = await Tool.countDocuments({})
      return NextResponse.json({
        success: true,
        data: [],
        meta: { categories, tags, totalCount },
        pagination: { page: 1, limit: 0, totalCount, totalPages: 1, hasMore: false }
      })
    }

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Filter parameters
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    // Build query
    const query: Record<string, unknown> = {}

    if (category) {
      query.category = { $regex: category, $options: 'i' }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags }
    }

    // Get total count for pagination
    const totalCount = await Tool.countDocuments(query)

    // Fetch tools with pagination and sorting
    const tools = await Tool.find(query)
      .sort({ clickCount: -1, createdAt: -1 }) // Sort by popularity then by newest
      .skip(skip)
      .limit(limit)

    // Transform data for frontend
    const transformedTools = tools.map(tool => ({
      id: tool.id,
      title: tool.title,
      description: tool.description,
      tags: tool.tags,
      image: tool.image,
      clickCount: tool.clickCount,
      category: tool.category,
      website: tool.website,
      createdAt: tool.createdAt.toISOString().split('T')[0] // Format as YYYY-MM-DD
    }))

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      success: true,
      data: transformedTools,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore
      }
    })

  } catch (error) {
    console.error('❌ Error fetching tools:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tools',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    
    // Validate required fields
    const { id, title, description, tags, image, clickCount, category, website } = body

    if (!id || !title || !description || !tags || !image || !category || !website) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new tool
    const newTool = new Tool({
      id,
      title,
      description,
      tags,
      image,
      clickCount: clickCount || 0,
      category,
      website
    })

    const savedTool = await newTool.save()

    return NextResponse.json({
      success: true,
      data: savedTool,
      message: 'Tool created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating tool:', error)
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, error: 'Tool with this ID already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create tool',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}