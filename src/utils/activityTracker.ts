// Utility functions for tracking user activities

export interface ActivityData {
  userId: string;
  activityType: 'tool_click' | 'prompt_view' | 'blog_view' | 'research_paper_view' | 'tool_use';
  resourceType: 'tool' | 'prompt' | 'blog' | 'research_paper';
  resourceId: string;
  resourceTitle?: string;
  metadata?: {
    toolName?: string;
    category?: string;
    tags?: string[];
    duration?: number;
    referrer?: string;
  };
  sessionId?: string;
}

// Generate a session ID if not provided
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session ID from localStorage
export function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = localStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
}

// Get user ID (you might want to integrate this with your auth system)
export function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous';
  
  // Try to get from localStorage or your auth system
  const userId = localStorage.getItem('user_id') || 'anonymous';
  return userId;
}

// Track user activity
export async function trackActivity(data: Omit<ActivityData, 'userId' | 'sessionId'>): Promise<boolean> {
  try {
    const activityData: ActivityData = {
      ...data,
      userId: getUserId(),
      sessionId: getSessionId(),
      metadata: {
        ...data.metadata,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined
      }
    };

    const response = await fetch('/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      console.error('Failed to track activity:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking activity:', error);
    return false;
  }
}

// Specific tracking functions for different resource types

export async function trackToolClick(toolId: string, toolName: string, category?: string, tags?: string[]) {
  return trackActivity({
    activityType: 'tool_click',
    resourceType: 'tool',
    resourceId: toolId,
    resourceTitle: toolName,
    metadata: {
      toolName,
      category,
      tags
    }
  });
}

export async function trackToolUse(toolId: string, toolName: string, duration?: number, category?: string) {
  return trackActivity({
    activityType: 'tool_use',
    resourceType: 'tool',
    resourceId: toolId,
    resourceTitle: toolName,
    metadata: {
      toolName,
      category,
      duration
    }
  });
}

export async function trackPromptView(promptId: string, promptTitle: string, category?: string, tags?: string[]) {
  return trackActivity({
    activityType: 'prompt_view',
    resourceType: 'prompt',
    resourceId: promptId,
    resourceTitle: promptTitle,
    metadata: {
      category,
      tags
    }
  });
}

export async function trackBlogView(blogId: string, blogTitle: string, category?: string, tags?: string[]) {
  return trackActivity({
    activityType: 'blog_view',
    resourceType: 'blog',
    resourceId: blogId,
    resourceTitle: blogTitle,
    metadata: {
      category,
      tags
    }
  });
}

export async function trackResearchPaperView(paperId: string, paperTitle: string, category?: string, tags?: string[]) {
  return trackActivity({
    activityType: 'research_paper_view',
    resourceType: 'research_paper',
    resourceId: paperId,
    resourceTitle: paperTitle,
    metadata: {
      category,
      tags
    }
  });
}

// Batch tracking for multiple activities (useful for analytics)
export async function trackBatchActivities(activities: Omit<ActivityData, 'userId' | 'sessionId'>[]): Promise<boolean> {
  try {
    const userId = getUserId();
    const sessionId = getSessionId();
    
    const batchData = activities.map(activity => ({
      ...activity,
      userId,
      sessionId,
      metadata: {
        ...activity.metadata,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined
      }
    }));

    // For now, we'll send them individually. You could create a batch endpoint later
    const results = await Promise.allSettled(
      batchData.map(data => 
        fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      )
    );

    const successCount = results.filter(result => result.status === 'fulfilled').length;
    return successCount === results.length;
  } catch (error) {
    console.error('Error tracking batch activities:', error);
    return false;
  }
}