import mongoose, { Schema, Document } from 'mongoose'

export interface IContact extends Document {
  name: string
  email: string
  subject?: string
  message: string
  ipAddress?: string
  userAgent?: string
  status: 'new' | 'read' | 'archived'
  createdAt: Date
  updatedAt: Date
}

const ContactSchema: Schema = new Schema<IContact>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [80, 'Name cannot exceed 80 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
      'Please enter a valid email address'
    ]
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [120, 'Subject cannot exceed 120 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [4000, 'Message cannot exceed 4000 characters']
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

// Helpful indexes
ContactSchema.index({ email: 1, createdAt: -1 })
ContactSchema.index({ status: 1, createdAt: -1 })

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)