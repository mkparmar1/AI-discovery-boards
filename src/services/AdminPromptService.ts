import connectDB from '@/lib/mongodb'
import AdminPrompt from '@/models/AdminPrompt'
import Prompt from '@/models/Prompt'
import mongoose from 'mongoose'

export interface CreatePromptDTO {
  title: string
  prompt_text: string
  prompt_type: string
  tags: string[]
  status?: 'draft' | 'published'
  created_by: string
}

export interface UpdatePromptDTO {
  title?: string
  prompt_text?: string
  prompt_type?: string
  tags?: string[]
  status?: 'draft' | 'published'
}

export class AdminPromptService {
  static async create(data: CreatePromptDTO) {
    await connectDB()
    const prompt = new AdminPrompt({
      ...data,
      created_by: new mongoose.Types.ObjectId(data.created_by),
      status: data.status || 'draft'
    })
    return await prompt.save()
  }

  static async getAll(filters: {
    status?: 'draft' | 'published'
    prompt_type?: string
    search?: string
    page?: number
    limit?: number
  } = {}) {
    await connectDB()
    const { status, prompt_type, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    // Query AdminPrompt collection
    const adminQuery: any = { deletedAt: null }
    if (status) adminQuery.status = status
    if (prompt_type) adminQuery.prompt_type = { $regex: prompt_type, $options: 'i' }
    if (search) {
      adminQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { prompt_text: { $regex: search, $options: 'i' } }
      ]
    }

    const [adminPrompts, adminCount] = await Promise.all([
      AdminPrompt.find(adminQuery)
        .populate('created_by', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      AdminPrompt.countDocuments(adminQuery)
    ])

    // Also query old Prompt collection and convert to AdminPrompt format
    const oldPromptQuery: any = {}
    if (prompt_type) oldPromptQuery.category = { $regex: prompt_type, $options: 'i' }
    if (search) {
      oldPromptQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { prompt: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const [oldPrompts, oldCount] = await Promise.all([
      Prompt.find(oldPromptQuery)
        .sort({ createdAt: -1 })
        .lean(),
      Prompt.countDocuments(oldPromptQuery)
    ])

    // Convert old prompts to admin format
    const convertedPrompts = oldPrompts.map((prompt: any) => ({
      _id: prompt._id,
      id: prompt.id, // Preserve the custom 'id' field for deletion
      title: prompt.title,
      prompt_text: prompt.prompt, // Map 'prompt' to 'prompt_text'
      prompt_type: prompt.category, // Map 'category' to 'prompt_type'
      tags: Array.isArray(prompt.tags) ? prompt.tags : [],
      status: 'published' as const, // Old prompts are considered published
      created_by: null,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
      isLegacy: true // Flag to identify legacy prompts
    }))

    // Combine both collections
    const allPrompts = [...adminPrompts, ...convertedPrompts]
    const totalCount = adminCount + oldCount

    // Apply status filter to combined results (if specified)
    let filteredPrompts = allPrompts
    if (status) {
      filteredPrompts = allPrompts.filter(prompt => prompt.status === status)
    }

    // Sort combined results
    filteredPrompts.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // Apply pagination
    const paginatedPrompts = filteredPrompts.slice(skip, skip + limit)
    const filteredCount = filteredPrompts.length

    return {
      data: paginatedPrompts,
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
    return await AdminPrompt.findOne({ _id: id, deletedAt: null })
      .populate('created_by', 'name email')
      .lean()
  }

  static async update(id: string, data: UpdatePromptDTO) {
    await connectDB()
    return await AdminPrompt.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('created_by', 'name email')
  }

  static async delete(id: string) {
    await connectDB()
    // Soft delete
    return await AdminPrompt.findOneAndUpdate(
      { _id: id },
      { $set: { deletedAt: new Date() } },
      { new: true }
    )
  }

  static async getPublished() {
    await connectDB()
    return await AdminPrompt.find({ status: 'published', deletedAt: null })
      .sort({ createdAt: -1 })
      .lean()
  }
}
