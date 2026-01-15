import mongoose, { Document, Schema } from 'mongoose'

export interface IAdminLearningVideo extends Document {
  title: string
  description: string
  video_url: string
  duration?: number
  category: string
  status: 'draft' | 'published'
  created_by: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const AdminLearningVideoSchema: Schema = new Schema<IAdminLearningVideo>({
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
  video_url: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true
  },
  duration: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
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

// Indexes for better query performance
AdminLearningVideoSchema.index({ status: 1 })
AdminLearningVideoSchema.index({ category: 1 })
AdminLearningVideoSchema.index({ created_by: 1 })
AdminLearningVideoSchema.index({ title: 'text', description: 'text' })
AdminLearningVideoSchema.index({ deletedAt: 1 })

export default mongoose.models.AdminLearningVideo || mongoose.model<IAdminLearningVideo>('AdminLearningVideo', AdminLearningVideoSchema)
