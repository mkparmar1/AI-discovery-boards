'use client'

import React, { useState } from 'react'
import { Search, Filter, Clock, Users, Star, Play, BookOpen, Video, Award, MapPin, Brain } from 'lucide-react'

interface Course {
  id: string
  title: string
  instructor: string
  description: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  students: number
  rating: number
  reviews: number
  price: number
  isFree: boolean
  thumbnail: string
  tags: string[]
  type: 'course' | 'tutorial' | 'certification' | 'path'
  featured?: boolean
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Machine Learning Fundamentals',
    instructor: 'Dr. Sarah Chen',
    description: 'Learn the core concepts of machine learning including supervised and unsupervised learning, neural networks, and practical applications.',
    category: 'Machine Learning',
    level: 'Beginner',
    duration: '8 weeks',
    students: 15420,
    rating: 4.8,
    reviews: 2340,
    price: 99,
    isFree: false,
    thumbnail: '/api/placeholder/300/200',
    tags: ['Python', 'Scikit-learn', 'Neural Networks'],
    type: 'course',
    featured: true
  },
  {
    id: '2',
    title: 'Deep Learning with PyTorch',
    instructor: 'Prof. Michael Rodriguez',
    description: 'Master deep learning concepts and build neural networks using PyTorch framework.',
    category: 'Deep Learning',
    level: 'Intermediate',
    duration: '12 weeks',
    students: 8930,
    rating: 4.9,
    reviews: 1560,
    price: 149,
    isFree: false,
    thumbnail: '/api/placeholder/300/200',
    tags: ['PyTorch', 'CNN', 'RNN', 'Transformers'],
    type: 'course',
    featured: true
  },
  {
    id: '3',
    title: 'Natural Language Processing Bootcamp',
    instructor: 'Dr. Emily Watson',
    description: 'Comprehensive guide to NLP techniques, from basic text processing to advanced language models.',
    category: 'NLP',
    level: 'Intermediate',
    duration: '10 weeks',
    students: 6780,
    rating: 4.7,
    reviews: 890,
    price: 129,
    isFree: false,
    thumbnail: '/api/placeholder/300/200',
    tags: ['NLTK', 'spaCy', 'Transformers', 'BERT'],
    type: 'course'
  },
  {
    id: '4',
    title: 'Computer Vision Essentials',
    instructor: 'Dr. James Liu',
    description: 'Learn image processing, object detection, and computer vision applications using OpenCV and deep learning.',
    category: 'Computer Vision',
    level: 'Intermediate',
    duration: '6 weeks',
    students: 4560,
    rating: 4.6,
    reviews: 670,
    price: 0,
    isFree: true,
    thumbnail: '/api/placeholder/300/200',
    tags: ['OpenCV', 'CNN', 'Object Detection'],
    type: 'course',
    featured: true
  },
  {
    id: '5',
    title: 'AI Ethics and Responsible AI',
    instructor: 'Prof. Anna Thompson',
    description: 'Understanding the ethical implications of AI and how to build responsible AI systems.',
    category: 'AI Ethics',
    level: 'Beginner',
    duration: '4 weeks',
    students: 3240,
    rating: 4.5,
    reviews: 450,
    price: 0,
    isFree: true,
    thumbnail: '/api/placeholder/300/200',
    tags: ['Ethics', 'Bias', 'Fairness', 'Governance'],
    type: 'course'
  },
  {
    id: '6',
    title: 'Building Chatbots with Transformers',
    instructor: 'Alex Johnson',
    description: 'Step-by-step tutorial on creating intelligent chatbots using modern transformer models.',
    category: 'NLP',
    level: 'Advanced',
    duration: '2 hours',
    students: 2180,
    rating: 4.4,
    reviews: 320,
    price: 0,
    isFree: true,
    thumbnail: '/api/placeholder/300/200',
    tags: ['Chatbots', 'GPT', 'Transformers'],
    type: 'tutorial'
  }
]

const categories = [
  'All Categories',
  'Machine Learning',
  'Deep Learning',
  'NLP',
  'Computer Vision',
  'Data Science',
  'AI Ethics',
  'Robotics'
]

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const types = ['All Types', 'course', 'tutorial', 'certification', 'path']

export default function LearnPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [selectedType, setSelectedType] = useState('All Types')
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel
    const matchesType = selectedType === 'All Types' || course.type === selectedType
    const matchesFree = !showFreeOnly || course.isFree
    
    return matchesSearch && matchesCategory && matchesLevel && matchesType && matchesFree
  })

  const featuredCourses = courses.filter(course => course.featured)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return BookOpen
      case 'tutorial': return Video
      case 'certification': return Award
      case 'path': return MapPin
      default: return BookOpen
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Learning Center
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Master AI and machine learning with expert-led courses
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">200+</div>
                <div className="text-sm text-muted-foreground">Tutorials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">25+</div>
                <div className="text-sm text-muted-foreground">Certifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search courses, tutorials, certifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>{type === 'All Types' ? type : type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={showFreeOnly}
                      onChange={(e) => setShowFreeOnly(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    Free Only
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map(course => {
                const TypeIcon = getTypeIcon(course.type)
                return (
                  <div key={course.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TypeIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium capitalize">{course.type}</span>
                        <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                          course.level === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {course.level}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">by {course.instructor}</p>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.students.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{course.rating}</span>
                          <span className="text-sm text-muted-foreground">({course.reviews})</span>
                        </div>
                        <div className="text-right">
                          {course.isFree ? (
                            <span className="text-lg font-bold text-green-600">Free</span>
                          ) : (
                            <span className="text-lg font-bold text-foreground">${course.price}</span>
                          )}
                        </div>
                      </div>
                      
                      <button className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        {course.type === 'course' ? 'Enroll Now' : course.type === 'tutorial' ? 'Watch Now' : 'Learn More'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              All Learning Materials ({filteredCourses.length})
            </h2>
            <button className="text-primary hover:text-primary/80 font-medium">
              View All →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const TypeIcon = getTypeIcon(course.type)
              return (
                <div key={course.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TypeIcon className="h-4 w-4 text-primary" />
                      <span className="text-xs text-primary font-medium capitalize">{course.type}</span>
                      <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {course.level}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">by {course.instructor}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.students > 1000 ? `${Math.floor(course.students/1000)}k` : course.students}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        {course.rating}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {course.isFree ? (
                        <span className="text-sm font-bold text-green-600">Free</span>
                      ) : (
                        <span className="text-sm font-bold text-foreground">${course.price}</span>
                      )}
                      <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                        {course.type === 'course' ? 'Enroll' : course.type === 'tutorial' ? 'Watch' : 'Start'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}