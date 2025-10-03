import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// MONGODB_URI will be validated during connectDB()

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log('🔄 Using existing MongoDB connection')
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    }

    // Ensure URI is present only when attempting to connect
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set. Set it in your environment to enable database features.')
      throw new Error('MONGODB_URI environment variable is not set')
    }

    console.log('🔌 Connecting to MongoDB...')
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error?.message || error)
      console.error('ℹ️ Verify MONGODB_URI is set and your IP is whitelisted in Atlas Network Access.')
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('❌ Failed to connect to MongoDB:', e)
    throw e
  }

  return cached.conn
}

export default connectDB