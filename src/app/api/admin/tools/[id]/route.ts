import { NextRequest, NextResponse } from 'next/server'
import { AdminToolService } from '@/services/AdminToolService'
import { getAdminUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const tool = await AdminToolService.getById(params.id)
    
    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tool
    })
  } catch (error) {
    console.error('❌ Error fetching tool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tool' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const tool = await AdminToolService.update(params.id, body)

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tool,
      message: 'Tool updated successfully'
    })
  } catch (error) {
    console.error('❌ Error updating tool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tool' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const tool = await AdminToolService.delete(params.id)

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting tool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete tool' },
      { status: 500 }
    )
  }
}
