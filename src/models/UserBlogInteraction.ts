import mongoose, { Schema, Document } from 'mongoose'

export interface IUserBlogInteraction extends Document {
  userId: string
  blogId: string
  isLiked: boolean
  isBookmarked: boolean
  createdAt: Date
  updatedAt: Date
}

const UserBlogInteractionSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  blogId: {
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
UserBlogInteractionSchema.index({ userId: 1, blogId: 1 }, { unique: true })

export default mongoose.models.UserBlogInteraction || mongoose.model<IUserBlogInteraction>('UserBlogInteraction', UserBlogInteractionSchema)