'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { courses } from '@/data/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Star, Clock, Users, Sparkles, ArrowRight } from 'lucide-react'

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'enrollment'>('rating')
  const categoryNames = new Set(courses.map(course => course.category))
  const categoryCount = categoryNames.size
  const skillCount = new Set(courses.flatMap(course => course.skills)).size

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
    <MainLayout>
      <div className="space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border bg-slate-950 text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
          </div>
          <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                <Sparkles className="h-3.5 w-3.5" />
                Learn AI
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                AI courses built for real-world practice.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
                Learn AI and machine learning with expert-led courses and hands-on projects tailored to your goals.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 bg-white text-slate-900 hover:bg-white/90">
                  <Link href="/learn/tutorials">
                    Explore tutorials
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Courses</p>
                  <p className="mt-1 text-2xl font-semibold">{courses.length.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Categories</p>
                  <p className="mt-1 text-2xl font-semibold">{categoryCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Skills</p>
                  <p className="mt-1 text-2xl font-semibold">{skillCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Popular categories</p>
                <span className="text-xs text-white/60">Start here</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {Array.from(categoryNames).slice(0, 8).map(category => (
                  <Badge key={category} variant="secondary" className="bg-white/10 text-white/80">
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-white/60">Available now</p>
                <p className="mt-1 text-sm font-medium">{sortedCourses.length.toLocaleString()} courses ready</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filter courses</h2>
              <p className="text-sm text-muted-foreground">
                Showing {sortedCourses.length.toLocaleString()} of {courses.length.toLocaleString()} courses
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'enrollment')}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="rating">Sort by Rating</option>
                <option value="price">Sort by Price</option>
                <option value="enrollment">Sort by Popularity</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
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
        </section>

        {/* Courses Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCourses.map(course => (
            <Card key={course.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
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
                  <h4 className="text-sm font-medium mb-2">Skills you will learn:</h4>
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
        </section>

        {sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No courses found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default CoursesPage
