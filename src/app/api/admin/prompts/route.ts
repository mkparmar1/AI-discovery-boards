import { NextRequest, NextResponse } from 'next/server'
import { AdminPromptService } from '@/services/AdminPromptService'
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
    const prompt_type = searchParams.get('prompt_type') || undefined
    const search = searchParams.get('search') || undefined

    const result = await AdminPromptService.getAll({
      status,
      prompt_type,
      search,
      page,
      limit
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('❌ Error fetching admin prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompts' },
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
    const { title, prompt_text, prompt_type, tags, status } = body

    if (!title || !prompt_text || !prompt_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const prompt = await AdminPromptService.create({
      title,
      prompt_text,
      prompt_type,
      tags: Array.isArray(tags) ? tags : [],
      status: status || 'draft',
      created_by: adminUser.id
    })

    return NextResponse.json({
      success: true,
      data: prompt,
      message: 'Prompt created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}
