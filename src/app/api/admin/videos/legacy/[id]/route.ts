import { NextRequest, NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import LearnAIVideo from '@/models/LearnAIVideo'

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

    await connectDB()
    
    const video = await LearnAIVideo.findByIdAndDelete(params.id)
    
    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Legacy video deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting legacy video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete legacy video' },
      { status: 500 }
    )
  }
}
