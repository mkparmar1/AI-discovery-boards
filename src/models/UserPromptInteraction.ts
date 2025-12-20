import mongoose, { Schema, Document } from 'mongoose'

export interface IUserPromptInteraction extends Document {
  userId: string
  promptId: string
  isLiked: boolean
  isBookmarked: boolean
  createdAt: Date
  updatedAt: Date
}

const UserPromptInteractionSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  promptId: {
    type: String,
    required: true,
    index: true
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  isBookmarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Compound index for efficient queries
UserPromptInteractionSchema.index({ userId: 1, promptId: 1 }, { unique: true })

export default mongoose.models.UserPromptInteraction || mongoose.model<IUserPromptInteraction>('UserPromptInteraction', UserPromptInteractionSchema)