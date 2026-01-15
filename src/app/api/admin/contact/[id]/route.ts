import { NextRequest, NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    await connectDB()

    if (status && !['new', 'read', 'archived'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { $set: { status: status || 'read' } },
      { new: true }
    )

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contact,
      message: 'Contact message updated successfully'
    })
  } catch (error) {
    console.error('❌ Error updating contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update contact message' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUserFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    await connectDB()

    const contact = await Contact.findByIdAndDelete(id)

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact message' },
      { status: 500 }
    )
  }
}
