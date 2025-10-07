import mongoose from 'mongoose'

export interface ILearnAIVideo extends mongoose.Document {
  title: string
  topic: string
  youtubeUrl: string
  thumbnail: string
  description: string
  status: 'Active' | 'Inactive'
  createdAt: Date
  updatedAt: Date
}

const LearnAIVideoSchema = new mongoose.Schema<ILearnAIVideo>({
  title: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  youtubeUrl: { type: String, required: true, trim: true },
  thumbnail: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', required: true },
}, { timestamps: true })

// Indexes for efficient querying
LearnAIVideoSchema.index({ topic: 1 })
LearnAIVideoSchema.index({ status: 1 })
LearnAIVideoSchema.index({ createdAt: -1 })

export default mongoose.models.LearnAIVideo || mongoose.model<ILearnAIVideo>('LearnAIVideo', LearnAIVideoSchema)