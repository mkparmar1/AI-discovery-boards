import connectDB from '@/lib/mongodb'
import AdminAITool from '@/models/AdminAITool'
import Tool from '@/models/Tool'
import mongoose from 'mongoose'

export interface CreateToolDTO {
  title: string
  description: string
  category: string
  website_url: string
  pricing_type: 'free' | 'paid' | 'freemium'
  status?: 'draft' | 'published'
  created_by: string
}

export interface UpdateToolDTO {
  title?: string
  description?: string
  category?: string
  website_url?: string
  pricing_type?: 'free' | 'paid' | 'freemium'
  status?: 'draft' | 'published'
}

export class AdminToolService {
  static async create(data: CreateToolDTO) {
    await connectDB()
    const tool = new AdminAITool({
      ...data,
      created_by: new mongoose.Types.ObjectId(data.created_by),
      status: data.status || 'draft'
    })
    return await tool.save()
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

    // Query AdminAITool collection
    const adminQuery: any = { deletedAt: null }
    if (status) adminQuery.status = status
    if (category) adminQuery.category = { $regex: category, $options: 'i' }
    if (search) {
      adminQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const [adminTools, adminCount] = await Promise.all([
      AdminAITool.find(adminQuery)
        .populate('created_by', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      AdminAITool.countDocuments(adminQuery)
    ])

    // Also query old Tool collection and convert to AdminAITool format
    const oldToolQuery: any = {}
    if (category) oldToolQuery.category = { $regex: category, $options: 'i' }
    if (search) {
      oldToolQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const [oldTools, oldCount] = await Promise.all([
      Tool.find(oldToolQuery)
        .sort({ createdAt: -1 })
        .lean(),
      Tool.countDocuments(oldToolQuery)
    ])

    // Convert old tools to admin format
    const convertedTools = oldTools.map((tool: any) => ({
      _id: tool._id,
      title: tool.title,
      description: tool.description,
      category: tool.category,
      website_url: tool.website,
      website: tool.website, // Keep original for compatibility
      image: tool.image, // Include image from old tools
      pricing_type: this.inferPricingType(tool.tags || []),
      status: 'published' as const, // Old tools are considered published
      created_by: null,
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt,
      isLegacy: true // Flag to identify legacy tools
    }))

    // Combine both collections
    const allTools = [...adminTools, ...convertedTools]
    const totalCount = adminCount + oldCount

    // Apply status filter to combined results (if specified)
    let filteredTools = allTools
    if (status) {
      filteredTools = allTools.filter(tool => tool.status === status)
    }

    // Sort combined results
    filteredTools.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // Apply pagination
    const paginatedTools = filteredTools.slice(skip, skip + limit)
    const filteredCount = filteredTools.length

    return {
      data: paginatedTools,
      pagination: {
        page,
        limit,
        totalCount: status ? filteredCount : totalCount,
        totalPages: Math.ceil((status ? filteredCount : totalCount) / limit),
        hasMore: (skip + limit) < (status ? filteredCount : totalCount)
      }
    }
  }

  // Helper to infer pricing type from tags
  static inferPricingType(tags: string[]): 'free' | 'paid' | 'freemium' {
    const tagStr = tags.join(' ').toLowerCase()
    if (tagStr.includes('free')) return 'free'
    if (tagStr.includes('paid') || tagStr.includes('premium')) return 'paid'
    if (tagStr.includes('freemium')) return 'freemium'
    return 'free' // Default to free
  }

  static async getById(id: string) {
    await connectDB()
    return await AdminAITool.findOne({ _id: id, deletedAt: null })
      .populate('created_by', 'name email')
      .lean()
  }

  static async update(id: string, data: UpdateToolDTO) {
    await connectDB()
    return await AdminAITool.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('created_by', 'name email')
  }

  static async delete(id: string) {
    await connectDB()
    // Soft delete
    return await AdminAITool.findOneAndUpdate(
      { _id: id },
      { $set: { deletedAt: new Date() } },
      { new: true }
    )
  }

  static async getPublished() {
    await connectDB()
    return await AdminAITool.find({ status: 'published', deletedAt: null })
      .sort({ createdAt: -1 })
      .lean()
  }
}
