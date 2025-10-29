import mongoose, { Document, Schema } from 'mongoose'

export interface IUserToolInteraction extends Document {
  userId: string
  toolId: string
  isLiked: boolean
  isBookmarked: boolean
  createdAt: Date
  updatedAt: Date
}

const UserToolInteractionSchema = new Schema<IUserToolInteraction>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  toolId: {
    type: String,
    required: true,
    ref: 'Tool'
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

// Create compound index to ensure one interaction per user-tool pair
UserToolInteractionSchema.index({ userId: 1, toolId: 1 }, { unique: true })

// Index for efficient queries
UserToolInteractionSchema.index({ userId: 1, isLiked: 1 })
UserToolInteractionSchema.index({ userId: 1, isBookmarked: 1 })
UserToolInteractionSchema.index({ toolId: 1, isLiked: 1 })

export default mongoose.models.UserToolInteraction || mongoose.model<IUserToolInteraction>('UserToolInteraction', UserToolInteractionSchema)