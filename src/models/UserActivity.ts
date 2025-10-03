import mongoose from 'mongoose';

export interface IUserActivity {
  userId: string;
  activityType: 'tool_click' | 'prompt_view' | 'blog_view' | 'research_paper_view' | 'tool_use';
  resourceType: 'tool' | 'prompt' | 'blog' | 'research_paper';
  resourceId: string;
  resourceTitle?: string;
  metadata?: {
    toolName?: string;
    category?: string;
    tags?: string[];
    duration?: number; // in seconds
    referrer?: string;
    userAgent?: string;
  };
  timestamp: Date;
  sessionId?: string;
  ipAddress?: string;
}

const UserActivitySchema = new mongoose.Schema<IUserActivity>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ['tool_click', 'prompt_view', 'blog_view', 'research_paper_view', 'tool_use'],
    index: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['tool', 'prompt', 'blog', 'research_paper'],
    index: true
  },
  resourceId: {
    type: String,
    required: true,
    index: true
  },
  resourceTitle: {
    type: String,
    required: false
  },
  metadata: {
    toolName: String,
    category: String,
    tags: [String],
    duration: Number,
    referrer: String,
    userAgent: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    required: false,
    index: true
  },
  ipAddress: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
UserActivitySchema.index({ activityType: 1, timestamp: -1 });
UserActivitySchema.index({ timestamp: -1 });

// TTL index to automatically delete old activities after 1 year (optional)
UserActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.models.UserActivity || mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);