import mongoose, { Document, Schema } from 'mongoose'

export interface IAdminAITool extends Document {
  title: string
  description: string
  category: string
  website_url: string
  pricing_type: 'free' | 'paid' | 'freemium'
  status: 'draft' | 'published'
  created_by: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const AdminAIToolSchema: Schema = new Schema<IAdminAITool>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  website_url: {
    type: String,
    required: [true, 'Website URL is required'],
    trim: true
  },
  pricing_type: {
    type: String,
    enum: ['free', 'paid', 'freemium'],
    required: [true, 'Pricing type is required'],
    default: 'free'
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

// Indexes for better query performance
AdminAIToolSchema.index({ status: 1 })
AdminAIToolSchema.index({ category: 1 })
AdminAIToolSchema.index({ created_by: 1 })
AdminAIToolSchema.index({ title: 'text', description: 'text' })
AdminAIToolSchema.index({ deletedAt: 1 })

export default mongoose.models.AdminAITool || mongoose.model<IAdminAITool>('AdminAITool', AdminAIToolSchema)
