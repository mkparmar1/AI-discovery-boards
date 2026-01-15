import { NextRequest, NextResponse } from 'next/server'
import { AdminPromptService } from '@/services/AdminPromptService'

/**
 * Public API endpoint for prompts
 * Only returns published prompts from admin tables
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const prompt_type = searchParams.get('prompt_type') || undefined
    const search = searchParams.get('search') || undefined

    // Only fetch published prompts
    const result = await AdminPromptService.getAll({
      status: 'published',
      prompt_type,
      search,
      page,
      limit
    })

    // Transform to match public API format
    const transformedData = result.data.map((prompt: any) => ({
      id: prompt._id,
      title: prompt.title,
      prompt: prompt.prompt_text,
      category: prompt.prompt_type,
      tags: prompt.tags,
      createdAt: prompt.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('❌ Error fetching public prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}
