import connectDB from '@/lib/mongodb'
import AdminBlog from '@/models/AdminBlog'
import { allPosts } from '@/lib/data'
import mongoose from 'mongoose'

export interface CreateBlogDTO {
  title: string
  slug?: string
  content: string
  seo_title?: string
  seo_description?: string
  status?: 'draft' | 'published'
  created_by: string
}

export interface UpdateBlogDTO {
  title?: string
  slug?: string
  content?: string
  seo_title?: string
  seo_description?: string
  status?: 'draft' | 'published'
}

export class AdminBlogService {
  static async create(data: CreateBlogDTO) {
    await connectDB()
    
    // Auto-generate slug if not provided
    let slug = data.slug
    if (!slug && data.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    // Ensure slug is unique
    const existingBlog = await AdminBlog.findOne({ slug })
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`
    }

    const blog = new AdminBlog({
      ...data,
      slug,
      created_by: new mongoose.Types.ObjectId(data.created_by),
      status: data.status || 'draft'
    })
    return await blog.save()
  }

  static async getAll(filters: {
    status?: 'draft' | 'published'
    search?: string
    page?: number
    limit?: number
  } = {}) {
    await connectDB()
    const { status, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    // Query AdminBlog collection
    const adminQuery: any = { deletedAt: null }
    if (status) adminQuery.status = status
    if (search) {
      adminQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ]
    }

    const [adminBlogs, adminCount] = await Promise.all([
      AdminBlog.find(adminQuery)
        .populate('created_by', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      AdminBlog.countDocuments(adminQuery)
    ])

    // Convert static posts to admin format
    let staticBlogs = allPosts.map((post) => {
      // Generate slug from title
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      return {
        _id: `static-${post.id}`, // Use a prefixed ID for static posts
        id: post.id, // Preserve original ID
        title: post.title,
        slug: slug,
        content: post.content,
        seo_title: post.title, // Use title as SEO title
        seo_description: post.excerpt, // Use excerpt as SEO description
        status: 'published' as const, // Static posts are considered published
        created_by: null,
        createdAt: new Date(post.date), // Use date from static post
        updatedAt: new Date(post.date),
        isLegacy: true // Flag to identify static blogs
      }
    })

    // Apply search filter to static blogs
    if (search) {
      const searchLower = search.toLowerCase()
      staticBlogs = staticBlogs.filter(blog =>
        blog.title.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower) ||
        blog.slug.toLowerCase().includes(searchLower)
      )
    }

    // Static blogs are always published, so if status filter is 'draft', exclude them
    // If status is 'published' or undefined, include them
    if (status === 'draft') {
      staticBlogs = []
    }

    // Combine both collections
    const allBlogs = [...adminBlogs, ...staticBlogs]
    const totalCount = adminCount + staticBlogs.length

    // Sort combined results
    allBlogs.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // Apply pagination
    const paginatedBlogs = allBlogs.slice(skip, skip + limit)
    const filteredCount = allBlogs.length

    return {
      data: paginatedBlogs,
      pagination: {
        page,
        limit,
        totalCount: filteredCount,
        totalPages: Math.ceil(filteredCount / limit),
        hasMore: (skip + limit) < filteredCount
      }
    }
  }

  static async getById(id: string) {
    await connectDB()
    return await AdminBlog.findOne({ _id: id, deletedAt: null })
      .populate('created_by', 'name email')
      .lean()
  }

  static async getBySlug(slug: string) {
    await connectDB()
    return await AdminBlog.findOne({ slug, deletedAt: null })
      .populate('created_by', 'name email')
      .lean()
  }

  static async update(id: string, data: UpdateBlogDTO) {
    await connectDB()
    
    // Auto-generate slug if title changed and slug not provided
    if (data.title && !data.slug) {
      const existingBlog = await AdminBlog.findById(id)
      if (existingBlog && existingBlog.title !== data.title) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        
        // Ensure slug is unique (excluding current blog)
        const slugExists = await AdminBlog.findOne({ 
          slug: data.slug, 
          _id: { $ne: id } 
        })
        if (slugExists) {
          data.slug = `${data.slug}-${Date.now()}`
        }
      }
    }

    return await AdminBlog.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('created_by', 'name email')
  }

  static async delete(id: string) {
    await connectDB()
    // Soft delete
    return await AdminBlog.findOneAndUpdate(
      { _id: id },
      { $set: { deletedAt: new Date() } },
      { new: true }
    )
  }

  static async getPublished() {
    await connectDB()
    return await AdminBlog.find({ status: 'published', deletedAt: null })
      .sort({ createdAt: -1 })
      .lean()
  }
}
