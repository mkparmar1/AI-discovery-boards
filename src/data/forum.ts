import { ForumPost, User } from '@/types'

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