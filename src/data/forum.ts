import { ForumPost, Reply, User } from '@/types'

// Sample users for forum posts
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    joinedAt: '2023-01-15',
    preferences: {
      theme: 'light',
      notifications: true,
      newsletter: true
    }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'moderator',
    joinedAt: '2022-08-20',
    preferences: {
      theme: 'dark',
      notifications: true,
      newsletter: true
    }
  },
  {
    id: '3',
    name: 'Dr. Michael Rodriguez',
    email: 'm.rodriguez@university.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'expert',
    joinedAt: '2022-03-10',
    preferences: {
      theme: 'light',
      notifications: false,
      newsletter: true
    }
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.wilson@tech.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    joinedAt: '2023-06-05',
    preferences: {
      theme: 'dark',
      notifications: true,
      newsletter: false
    }
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@startup.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    joinedAt: '2023-09-12',
    preferences: {
      theme: 'light',
      notifications: true,
      newsletter: true
    }
  }
]

const createReplies = (postId: string, count: number): Reply[] => {
  const replies: Reply[] = []
  const users = sampleUsers.slice(1) // Exclude the first user for variety
  
  for (let i = 0; i < count; i++) {
    const user = users[i % users.length]
    const baseDate = new Date('2024-01-01')
    const replyDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000))
    
    replies.push({
      id: `${postId}-reply-${i + 1}`,
      content: getReplyContent(i),
      author: user,
      createdAt: replyDate.toISOString(),
      updatedAt: replyDate.toISOString(),
      likes: Math.floor(Math.random() * 20),
      parentId: i > 0 && Math.random() > 0.7 ? `${postId}-reply-${i}` : undefined
    })
  }
  
  return replies
}

const getReplyContent = (index: number): string => {
  const contents = [
    "Great question! I\'ve been working with similar models and found that fine-tuning on domain-specific data really helps. Have you tried adjusting the learning rate?",
    "I had the same issue last month. The solution was to increase the batch size and use gradient accumulation. Here\'s a code snippet that worked for me: ```python\noptimizer = torch.optim.Adam(model.parameters(), lr=0.001)\n```",
    "This is a common problem in NLP. You might want to look into using pre-trained embeddings like Word2Vec or GloVe as a starting point.",
    "Thanks for sharing this! I\'ve bookmarked it for later. The approach you described is similar to what we use at my company.",
    "Have you considered using transfer learning? It can significantly reduce training time and improve performance on smaller datasets.",
    "Interesting perspective! I disagree with point 3 though. In my experience, regularization techniques like dropout are still very effective.",
    "Could you share more details about your dataset? The preprocessing steps might be crucial for getting better results.",
    "This reminds me of a paper I read recently: \'Attention Is All You Need\'. The transformer architecture might be worth exploring for your use case.",
    "I\'m a beginner in this area, but this discussion is really helpful. Are there any good resources you\'d recommend for learning more?",
    "Update: I tried the suggested approach and it worked! My model accuracy improved from 78% to 85%. Thanks everyone!"
  ]
  
  return contents[index % contents.length]
}

export const forumPosts: ForumPost[] = [
  // ... your forum posts as before
]

export const forumCategories = [
  'General Discussion',
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'MLOps',
  'Career',
  'Research',
  'Tools & Frameworks',
  'Project Showcase',
  'Help & Support'
] as const

export const popularTags = [
  'Python',
  'PyTorch',
  'TensorFlow',
  'NLP',
  'Computer Vision',
  'Deep Learning',
  'Machine Learning',
  'Data Science',
  'MLOps',
  'Career Advice',
  'Beginner Friendly',
  'Advanced',
  'Tutorial',
  'Project Showcase',
  'Help Needed',
  'Research Paper',
  'Industry News',
  'Open Source',
  'AWS',
  'Google Cloud',
  'Azure'
] as const

// ✅ Export everything in one place
export { sampleUsers }
