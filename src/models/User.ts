import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'user' | 'moderator' | 'admin'
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  knownIps?: string[]
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  knownIps: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    console.log('🔐 Hashing password for user:', this.email)
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password as string, salt)
    console.log('✅ Password hashed successfully')
    next()
  } catch (error) {
    console.error('❌ Error hashing password:', error)
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    console.log('🔍 Comparing password for user:', this.email)
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    console.log('🔐 Password comparison result:', isMatch ? 'Match' : 'No match')
    return isMatch
  } catch (error) {
    console.error('❌ Error comparing password:', error)
    return false
  }
}

// Prevent password from being returned in JSON
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
