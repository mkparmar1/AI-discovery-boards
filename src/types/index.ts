export interface AITool {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  pricing: 'free' | 'freemium' | 'paid'
  priceRange?: string
  rating: number
  reviewCount: number
  features: string[]
  website: string
  logo?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ResearchPaper {
  id: string
  title: string
  authors: string[]
  abstract: string
  category: string
  publishedDate: Date
  citationCount: number
  arxivId?: string
  doi?: string
  pdfUrl?: string
  tags: string[]
  venue?: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  rating: number
  enrollmentCount: number
  price: number
  isFree: boolean
  thumbnail: string
  category: string
  skills: string[]
  modules: CourseModule[]
}

export interface CourseModule {
  id: string
  title: string
  description: string
  duration: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz' | 'exercise'
  duration?: string
  completed?: boolean
}



export interface CareerPath {
  id: string
  title: string
  description: string
  level: 'entry' | 'mid' | 'senior' | 'executive'
  averageSalary: string
  skills: Skill[]
  roadmap: RoadmapStep[]
  jobTitles: string[]
  companies: string[]
}

export interface Skill {
  id: string
  name: string
  category: 'technical' | 'soft' | 'domain'
  importance: 'essential' | 'recommended' | 'nice-to-have'
  resources: string[]
}

export interface RoadmapStep {
  id: string
  title: string
  description: string
  duration: string
  prerequisites: string[]
  resources: string[]
  skills: string[]
}

export interface ForumPost {
  id: string
  title: string
  content: string
  author: User
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  replies: Reply[]
  upvotes: number
  views: number
}

export interface Reply {
  id: string
  content: string
  author: User
  createdAt: Date
  upvotes: number
  parentId?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'moderator' | 'admin'
  joinedAt: Date
  reputation: number
}

export interface SearchFilters {
  category?: string
  pricing?: string
  rating?: number
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setLightTheme: () => void
  setDarkTheme: () => void
}