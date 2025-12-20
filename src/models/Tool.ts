import mongoose, { Document, Schema } from 'mongoose'

export interface ITool extends Document {
  id: string
  title: string
  description: string
  tags: string[]
  image: string
  clickCount: number
  category: 'Chat' | 'Image' | 'Devtools' | 'Other'
  website: string
  isTrending: boolean
  createdAt: Date
  updatedAt: Date
}

const ToolSchema = new Schema<ITool>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    required: true
  }],
  image: {
    type: String,
    required: true
  },
  clickCount: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Chat', 'Image', 'Devtools', 'Other']
  },
  website: {
    type: String,
    required: true
  },
  isTrending: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Create indexes for better query performance
ToolSchema.index({ category: 1 })
ToolSchema.index({ tags: 1 })
ToolSchema.index({ title: 'text', description: 'text' })

export default mongoose.models.Tool || mongoose.model<ITool>('Tool', ToolSchema)
