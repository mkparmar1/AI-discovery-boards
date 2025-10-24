import mongoose, { Schema, Document } from 'mongoose'

export interface IFeedback extends Document {
  name?: string
  email?: string
  type: 'bug' | 'idea' | 'other'
  message: string
  pageUrl?: string
  ipAddress?: string
  userAgent?: string
  status: 'new' | 'read' | 'archived'
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema: Schema = new Schema<IFeedback>({
  name: {
    type: String,
    trim: true,
    maxlength: [80, 'Name cannot exceed 80 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
      'Please enter a valid email address'
    ]
  },
  type: {
    type: String,
    enum: ['bug', 'idea', 'other'],
    required: [true, 'Feedback type is required'],
    index: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [4000, 'Message cannot exceed 4000 characters']
  },
  pageUrl: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'archived'],
    default: 'new',
    index: true
  }
}, {
  timestamps: true
})

FeedbackSchema.index({ type: 1, createdAt: -1 })
FeedbackSchema.index({ status: 1, createdAt: -1 })

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)