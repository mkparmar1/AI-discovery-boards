import mongoose, { Document, Schema } from 'mongoose'

export interface IAdminBlog extends Document {
  title: string
  slug: string
  content: string
  seo_title?: string
  seo_description?: string
  status: 'draft' | 'published'
  created_by: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const AdminBlogSchema: Schema = new Schema<IAdminBlog>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  seo_title: {
    type: String,
    trim: true
  },
  seo_description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    required: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Auto-generate slug from title if not provided
AdminBlogSchema.pre('save', function (next) {
  if (!this.slug && this.title && typeof this.title === 'string') {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  next()
})

// Indexes for better query performance
AdminBlogSchema.index({ status: 1 })
AdminBlogSchema.index({ slug: 1 })
AdminBlogSchema.index({ created_by: 1 })
AdminBlogSchema.index({ title: 'text', content: 'text' })
AdminBlogSchema.index({ deletedAt: 1 })

export default mongoose.models.AdminBlog || mongoose.model<IAdminBlog>('AdminBlog', AdminBlogSchema)
