import mongoose from 'mongoose'

export interface IPrompt extends mongoose.Document {
  id: string
  title: string
  prompt: string
  category: string
  tags: string[]
  description: string
  useCase: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  createdAt: Date
  updatedAt: Date
}

const PromptSchema = new mongoose.Schema<IPrompt>({
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
  prompt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true,
    trim: true
  },
  useCase: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  }
}, {
  timestamps: true
})

// Create indexes for better query performance
PromptSchema.index({ category: 1 })
PromptSchema.index({ difficulty: 1 })
PromptSchema.index({ tags: 1 })
PromptSchema.index({ title: 'text', description: 'text' })

export default mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema)