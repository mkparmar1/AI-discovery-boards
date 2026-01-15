import mongoose, { Document, Schema } from 'mongoose'

export interface IAdminPrompt extends Document {
  title: string
  prompt_text: string
  prompt_type: string
  tags: string[]
  status: 'draft' | 'published'
  created_by: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const AdminPromptSchema: Schema = new Schema<IAdminPrompt>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  prompt_text: {
    type: String,
    required: [true, 'Prompt text is required'],
    trim: true
  },
  prompt_type: {
    type: String,
    required: [true, 'Prompt type is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
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
AdminPromptSchema.index({ status: 1 })
AdminPromptSchema.index({ prompt_type: 1 })
AdminPromptSchema.index({ tags: 1 })
AdminPromptSchema.index({ created_by: 1 })
AdminPromptSchema.index({ title: 'text', prompt_text: 'text' })
AdminPromptSchema.index({ deletedAt: 1 })

export default mongoose.models.AdminPrompt || mongoose.model<IAdminPrompt>('AdminPrompt', AdminPromptSchema)
