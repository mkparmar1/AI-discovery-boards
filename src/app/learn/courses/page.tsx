'use client'

import React, { useState } from 'react'
import { courses } from '@/data/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Star, Clock, Users, BookOpen } from 'lucide-react'

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'enrollment'>('rating')

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = !selectedLevel || course.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'price':
        return a.price - b.price
      case 'enrollment':
        return b.enrollmentCount - a.enrollmentCount
      default:
        return 0
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">AI Courses</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">
          Learn AI and machine learning with expert-led courses and hands-on projects
        </p>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'enrollment')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="rating">Sort by Rating</option>
              <option value="price">Sort by Price</option>
              <option value="enrollment">Sort by Popularity</option>
            </select>
          </div>
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedLevel === null ? "default" : "outline"}
            onClick={() => setSelectedLevel(null)}
            size="sm"
          >
            All Levels
          </Button>
          {['beginner', 'intermediate', 'advanced'].map(level => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              onClick={() => setSelectedLevel(level)}
              size="sm"
              className="capitalize"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCourses.map(course => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="mt-1">
                    by {course.instructor}
                  </CardDescription>
                </div>
                <Badge variant={course.isFree ? 'secondary' : 'default'}>
                  {course.isFree ? 'Free' : `$${course.price}`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {course.description}
              </p>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <Badge variant="outline" className="text-xs capitalize">
                  {course.level}
                </Badge>
                <Badge variant="secondary" className="text-xs ml-2">
                  {course.category}
                </Badge>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Skills you&apos;ll learn:</h4>
                <div className="flex flex-wrap gap-1">
                  {course.skills.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button className="w-full">
                {course.isFree ? 'Start Learning' : 'Enroll Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No courses found matching your criteria.
          </p>
        </div>
      )}
    </div>
  )
}

export default CoursesPage