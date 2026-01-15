import { NextRequest, NextResponse } from 'next/server'
import { AdminToolService } from '@/services/AdminToolService'
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

    const result = await AdminToolService.getAll({
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
    console.error('❌ Error fetching admin tools:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tools' },
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
    const { title, description, category, website_url, pricing_type, status } = body

    if (!title || !description || !category || !website_url || !pricing_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const tool = await AdminToolService.create({
      title,
      description,
      category,
      website_url,
      pricing_type,
      status: status || 'draft',
      created_by: adminUser.id
    })

    return NextResponse.json({
      success: true,
      data: tool,
      message: 'Tool created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating tool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tool' },
      { status: 500 }
    )
  }
}
