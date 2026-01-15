import connectDB from '@/lib/mongodb'
import AdminLearningVideo from '@/models/AdminLearningVideo'
import LearnAIVideo from '@/models/LearnAIVideo'
import mongoose from 'mongoose'

export interface CreateVideoDTO {
  title: string
  description: string
  video_url: string
  duration?: number
  category: string
  status?: 'draft' | 'published'
  created_by: string
}

export interface UpdateVideoDTO {
  title?: string
  description?: string
  video_url?: string
  duration?: number
  category?: string
  status?: 'draft' | 'published'
}

export class AdminVideoService {
  static async create(data: CreateVideoDTO) {
    await connectDB()
    const video = new AdminLearningVideo({
      ...data,
      created_by: new mongoose.Types.ObjectId(data.created_by),
      status: data.status || 'draft'
    })
    return await video.save()
  }

  static async getAll(filters: {
    status?: 'draft' | 'published'
    category?: string
    search?: string
    page?: number
    limit?: number
  } = {}) {
    await connectDB()
    const { status, category, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    // Query AdminLearningVideo collection
    const adminQuery: any = { deletedAt: null }
    if (status) adminQuery.status = status
    if (category) adminQuery.category = { $regex: category, $options: 'i' }
    if (search) {
      adminQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const [adminVideos, adminCount] = await Promise.all([
      AdminLearningVideo.find(adminQuery)
        .populate('created_by', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      AdminLearningVideo.countDocuments(adminQuery)
    ])

    // Also query old LearnAIVideo collection and convert to AdminLearningVideo format
    const oldVideoQuery: any = {}
    // Old videos use 'topic' instead of 'category' and 'status' is 'Active' or 'Inactive'
    if (category) oldVideoQuery.topic = { $regex: category, $options: 'i' }
    // Old videos with status 'Active' are considered 'published'
    if (status === 'published') {
      oldVideoQuery.status = 'Active'
    } else if (status === 'draft') {
      oldVideoQuery.status = 'Inactive'
    }
    if (search) {
      oldVideoQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const [oldVideos, oldCount] = await Promise.all([
      LearnAIVideo.find(oldVideoQuery)
        .sort({ createdAt: -1 })
        .lean(),
      LearnAIVideo.countDocuments(oldVideoQuery)
    ])

    // Convert old videos to admin format
    const convertedVideos = oldVideos.map((video: any) => ({
      _id: video._id,
      title: video.title,
      description: video.description || '',
      video_url: video.youtubeUrl || video.video_url || '',
      duration: video.duration,
      category: video.topic || video.category || '', // Map 'topic' to 'category'
      status: video.status === 'Active' ? 'published' as const : 'draft' as const, // Map status
      created_by: null,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      isLegacy: true // Flag to identify legacy videos
    }))

    // Combine both collections
    const allVideos = [...adminVideos, ...convertedVideos]
    const totalCount = adminCount + oldCount

    // Apply status filter to combined results (if specified)
    let filteredVideos = allVideos
    if (status) {
      filteredVideos = allVideos.filter(video => video.status === status)
    }

    // Sort combined results
    filteredVideos.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // Apply pagination
    const paginatedVideos = filteredVideos.slice(skip, skip + limit)
    const filteredCount = filteredVideos.length

    return {
      data: paginatedVideos,
      pagination: {
        page,
        limit,
        totalCount: status ? filteredCount : totalCount,
        totalPages: Math.ceil((status ? filteredCount : totalCount) / limit),
        hasMore: (skip + limit) < (status ? filteredCount : totalCount)
      }
    }
  }

  static async getById(id: string) {
    await connectDB()
    return await AdminLearningVideo.findOne({ _id: id, deletedAt: null })
      .populate('created_by', 'name email')
      .lean()
  }

  static async update(id: string, data: UpdateVideoDTO) {
    await connectDB()
    return await AdminLearningVideo.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('created_by', 'name email')
  }

  static async delete(id: string) {
    await connectDB()
    // Soft delete
    return await AdminLearningVideo.findOneAndUpdate(
      { _id: id },
      { $set: { deletedAt: new Date() } },
      { new: true }
    )
  }

  static async getPublished() {
    await connectDB()
    return await AdminLearningVideo.find({ status: 'published', deletedAt: null })
      .sort({ createdAt: -1 })
      .lean()
  }
}
