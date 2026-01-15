import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tool from '@/models/Tool'

/**
 * DELETE endpoint for legacy tools
 * Used by admin panel to delete tools from old Tool collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    // Delete by _id (MongoDB ObjectId)
    const result = await Tool.findByIdAndDelete(id)

    if (!result) {
      // Try deleting by the 'id' field if _id doesn't work
      const resultById = await Tool.findOneAndDelete({ id: id })
      if (!resultById) {
        return NextResponse.json(
          { success: false, error: 'Tool not found' },
          { status: 404 }
        )
      }
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
