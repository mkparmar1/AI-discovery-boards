'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { allPosts } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SearchableSelect from '@/components/ui/searchable-select'
import { ExternalLink, Loader2, Calendar, Clock, Search, Filter, X, Heart, Bookmark, ArrowRight, Sparkles } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
// Removed Image import as we're using gradient backgrounds instead
import Link from 'next/link'

// Helper function to create URL-friendly slugs from titles
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

const ITEMS_PER_PAGE = 12

const BlogsPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const redirectToLogin = useCallback(() => {
    window.location.href = '/login'
  }, [])
  
  const [allFilteredPosts, setAllFilteredPosts] = useState(allPosts)
  const [displayedPosts, setDisplayedPosts] = useState(allPosts.slice(0, ITEMS_PER_PAGE))
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(allPosts.length > ITEMS_PER_PAGE)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [showLikedOnly, setShowLikedOnly] = useState(false)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  
  // User interaction states
  const [userInteractions, setUserInteractions] = useState<Record<string, { isLiked: boolean; isBookmarked: boolean }>>({})
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false)
  
  // Get all unique tags from posts
  const allTags = Array.from(new Set(allPosts.flatMap(post => post.tags)))
  const totalPostsLabel = allPosts.length.toLocaleString()
  const tagCountLabel = allTags.length.toLocaleString()
  const resultsLabel = `${allFilteredPosts.length.toLocaleString()} results`
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedTag('')
    setShowLikedOnly(false)
    setShowSavedOnly(false)
  }

  // Fetch user interactions for displayed posts
  const fetchUserInteractions = useCallback(async (blogIds: string[]) => {
    if (!isAuthenticated || !user || blogIds.length === 0) return

    setIsLoadingInteractions(true)
    try {
      const response = await fetch(`/api/blogs/interactions?userId=${user.id}&blogIds=${blogIds.join(',')}`)
      if (response.ok) {
        const data = await response.json()
        setUserInteractions(prev => ({ ...prev, ...data.interactions }))
      }
    } catch (error) {
      console.error('Failed to fetch user interactions:', error)
    } finally {
      setIsLoadingInteractions(false)
    }
  }, [isAuthenticated, user])

  // Handle like toggle
  const handleLikeToggle = useCallback(async (blogId: string) => {
    if (!isAuthenticated || !user) {
      redirectToLogin()
      return
    }

    const currentState = userInteractions[blogId]?.isLiked || false
    const newState = !currentState

    // Optimistically update UI
    setUserInteractions(prev => ({
      ...prev,
      [blogId]: {
        ...prev[blogId],
        isLiked: newState,
        isBookmarked: prev[blogId]?.isBookmarked || false
      }
    }))

    try {
      const response = await fetch('/api/blogs/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          blogId,
          action: 'like'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserInteractions(prev => ({
          ...prev,
          [blogId]: {
            ...prev[blogId],
            isLiked: data.isLiked,
            isBookmarked: data.isBookmarked
          }
        }))
      } else {
        // Revert on error
        setUserInteractions(prev => ({
          ...prev,
          [blogId]: {
            ...prev[blogId],
            isLiked: currentState
          }
        }))
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      // Revert on error
      setUserInteractions(prev => ({
        ...prev,
        [blogId]: {
          ...prev[blogId],
          isLiked: currentState
        }
      }))
    }
  }, [isAuthenticated, redirectToLogin, user, userInteractions])

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(async (blogId: string) => {
    if (!isAuthenticated || !user) {
      redirectToLogin()
      return
    }

    const currentState = userInteractions[blogId]?.isBookmarked || false
    const newState = !currentState

    // Optimistically update UI
    setUserInteractions(prev => ({
      ...prev,
      [blogId]: {
        ...prev[blogId],
        isLiked: prev[blogId]?.isLiked || false,
        isBookmarked: newState
      }
    }))

    try {
      const response = await fetch('/api/blogs/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          blogId,
          action: 'bookmark'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserInteractions(prev => ({
          ...prev,
          [blogId]: {
            ...prev[blogId],
            isLiked: data.isLiked,
            isBookmarked: data.isBookmarked
          }
        }))
      } else {
        // Revert on error
        setUserInteractions(prev => ({
          ...prev,
          [blogId]: {
            ...prev[blogId],
            isBookmarked: currentState
          }
        }))
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      // Revert on error
      setUserInteractions(prev => ({
        ...prev,
        [blogId]: {
          ...prev[blogId],
          isBookmarked: currentState
        }
      }))
    }
  }, [isAuthenticated, redirectToLogin, user, userInteractions])

  // Filter posts based on search term, selected tags, and user interactions
  const filterPosts = useCallback(() => {
    let filtered = allPosts

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(post =>
        post.tags.includes(selectedTag)
      )
    }

    // Filter by liked posts only
    if (showLikedOnly && isAuthenticated) {
      filtered = filtered.filter(post =>
        userInteractions[post.id]?.isLiked === true
      )
    }

    // Filter by saved posts only
    if (showSavedOnly && isAuthenticated) {
      filtered = filtered.filter(post =>
        userInteractions[post.id]?.isBookmarked === true
      )
    }

    setAllFilteredPosts(filtered)
    setDisplayedPosts(filtered.slice(0, ITEMS_PER_PAGE))
    setCurrentPage(1)
    setHasMore(filtered.length > ITEMS_PER_PAGE)
  }, [searchTerm, selectedTag, showLikedOnly, showSavedOnly, userInteractions, isAuthenticated])

  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const newPosts = allFilteredPosts.slice(startIndex, endIndex)
      
      if (newPosts.length > 0) {
        setDisplayedPosts(prev => [...prev, ...newPosts])
        setCurrentPage(nextPage)
        setHasMore(endIndex < allFilteredPosts.length)
      } else {
        setHasMore(false)
      }
      
      setIsLoading(false)
    }, 800)
  }, [currentPage, isLoading, hasMore, allFilteredPosts])

  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return
    
    const scrollTop = document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    
    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      loadMorePosts()
    }
  }, [loadMorePosts, isLoading, hasMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Filter posts when search term or tags change
  useEffect(() => {
    filterPosts()
  }, [filterPosts])

  // Fetch user interactions when displayed posts change
  useEffect(() => {
    if (displayedPosts.length > 0 && !authLoading) {
      const blogIds = displayedPosts.map(post => post.id)
      fetchUserInteractions(blogIds)
    }
  }, [displayedPosts, fetchUserInteractions, authLoading])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl">
          {/* Animated background gradients */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-96 w-96 animate-soft-pulse rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 animate-soft-pulse rounded-full bg-emerald-500/20 blur-3xl" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(120,119,198,0.15),_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(16,185,129,0.15),_transparent_50%)]" />
          </div>
          
          <div className="relative grid gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 shadow-lg">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                AI Blogs
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Ideas, playbooks, and{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  AI field notes
                </span>
                .
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
                Browse expert breakdowns, workflow guides, and product perspectives from across the AI ecosystem.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1 group">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60 transition-colors group-focus-within:text-white/90" />
                  <Input
                    placeholder="Search blogs by title, content, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 border-white/20 bg-white/10 pl-12 pr-12 text-white placeholder:text-white/60 backdrop-blur-sm transition-all duration-300 focus-visible:border-white/40 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button asChild className="h-12 px-8 btn-gradient shadow-lg hover:shadow-xl">
                  <Link href="/learn-ai" className="flex items-center">
                    Explore learning paths
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Posts</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{totalPostsLabel}</p>
                </div>
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Topics</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{tagCountLabel}</p>
                </div>
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Results</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{allFilteredPosts.length.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-xl lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-white">Trending topics</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Pick a focus</span>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70 mb-3">Popular tags</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 8).map(tag => (
                      <Button
                        key={tag}
                        variant="ghost"
                        className="h-8 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/15 hover:shadow-md"
                        onClick={() => setSelectedTag(tag)}
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-medium text-white/70">Filters applied</p>
                  <p className="mt-2 text-sm font-semibold text-white">{resultsLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-md lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                  <Filter className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Filter posts</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-1">
                    Showing {Math.min(displayedPosts.length, allFilteredPosts.length)} of {allFilteredPosts.length} posts
                    {(searchTerm || selectedTag || showLikedOnly || showSavedOnly) && (
                      <span className="ml-1">(filtered from {totalPostsLabel} total)</span>
                    )}
                    {(searchTerm || selectedTag || showLikedOnly || showSavedOnly) && (
                      <Button variant="link" size="sm" onClick={resetFilters} className="ml-2 h-auto p-0 text-primary font-medium hover:underline">
                        Clear filters
                      </Button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-[180px]">
                <SearchableSelect
                  options={[{ value: '', label: 'All tags' }, ...allTags.map(tag => ({ value: tag, label: tag }))]}
                  value={selectedTag}
                  onChange={setSelectedTag}
                  placeholder="All Tags"
                  className="w-full"
                />
              </div>
            </div>
            {isAuthenticated && (
              <>
                <Button
                  variant={showLikedOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setShowLikedOnly(!showLikedOnly)
                    if (!showLikedOnly) setShowSavedOnly(false)
                  }}
                  className={`flex items-center gap-2 whitespace-nowrap h-11 font-medium transition-all ${
                    showLikedOnly ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 ${showLikedOnly ? 'fill-current' : ''}`} />
                  Liked
                </Button>
                <Button
                  variant={showSavedOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setShowSavedOnly(!showSavedOnly)
                    if (!showSavedOnly) setShowLikedOnly(false)
                  }}
                  className={`flex items-center gap-2 whitespace-nowrap h-11 font-medium transition-all ${
                    showSavedOnly ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' : ''
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${showSavedOnly ? 'fill-current' : ''}`} />
                  Saved
                </Button>
              </>
            )}
            {(selectedTag || showLikedOnly || showSavedOnly || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="whitespace-nowrap h-11 font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                Clear all
              </Button>
            )}
          </div>
          {(searchTerm || selectedTag || showLikedOnly || showSavedOnly) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1">
                  <span>Search: {searchTerm}</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1">
                  <span>Tag: {selectedTag}</span>
                  <button
                    onClick={() => setSelectedTag('')}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label="Remove tag filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {showLikedOnly && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800">
                  <span>Liked posts</span>
                  <button
                    onClick={() => setShowLikedOnly(false)}
                    className="ml-1 hover:text-red-900 dark:hover:text-red-200 transition-colors"
                    aria-label="Remove liked filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {showSavedOnly && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
                  <span>Saved posts</span>
                  <button
                    onClick={() => setShowSavedOnly(false)}
                    className="ml-1 hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                    aria-label="Remove saved filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </section>

        {/* Posts Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedPosts.map((post, index) => (
            <div
              key={`${post.id}-${index}`}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <Card className="group relative overflow-hidden bg-card border border-border rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl h-full flex flex-col">
              {/* Post Header with Abstract Pattern */}
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 group-hover:from-slate-200 group-hover:via-slate-100 group-hover:to-slate-200 dark:group-hover:from-slate-700 dark:group-hover:via-slate-800 dark:group-hover:to-slate-700 transition-all duration-300">
                {/* Abstract geometric pattern */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                  <div className="absolute top-4 left-4 w-16 h-16 bg-blue-500 rounded-full animate-soft-pulse"></div>
                  <div className="absolute top-8 right-8 w-12 h-12 bg-purple-500 rounded-lg rotate-45"></div>
                  <div className="absolute bottom-6 left-8 w-20 h-8 bg-pink-500 rounded-full"></div>
                  <div className="absolute bottom-12 right-12 w-8 h-20 bg-green-500 rounded-lg"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-orange-500 rounded-full"></div>
                </div>
                
                {/* Content overlay */}
                 <div className="absolute inset-0 flex flex-col justify-between p-6">
                   <div className="flex justify-between items-start">
                     <Badge className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-sm">
                       <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                         {post.tags[0] || 'Blog'}
                       </span>
                     </Badge>
                   </div>
                   
                   <div>
                     <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xl line-clamp-2 mb-1 drop-shadow-md">
                       {post.title}
                     </h3>
                   </div>
                 </div>
              </div>

              <CardHeader className="pb-4 pt-6">
                <CardDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-4 min-h-[3.75rem]">
                  {post.excerpt}
                </CardDescription>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(1, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/30 px-2 py-0.5">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-6 pt-0 gap-4">
                {/* Meta Information */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{calculateReadTime(post.content)} min read</span>
                    </div>
                  </div>
                  
                  {/* Like and Bookmark buttons */}
                  {isAuthenticated && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleLikeToggle(post.id)
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          userInteractions[post.id]?.isLiked
                            ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30'
                            : 'text-muted-foreground hover:text-red-500 hover:bg-muted'
                        }`}
                        title={userInteractions[post.id]?.isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            userInteractions[post.id]?.isLiked ? 'fill-current' : ''
                          }`} 
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleBookmarkToggle(post.id)
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          userInteractions[post.id]?.isBookmarked
                            ? 'text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                            : 'text-muted-foreground hover:text-blue-500 hover:bg-muted'
                        }`}
                        title={userInteractions[post.id]?.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                      >
                        <Bookmark 
                          className={`h-4 w-4 ${
                            userInteractions[post.id]?.isBookmarked ? 'fill-current' : ''
                          }`} 
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Read More Button */}
                <Button 
                  className="w-full mt-auto border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 font-semibold text-primary transition-all duration-300 hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/10 hover:shadow-lg h-10" 
                  variant="outline"
                  asChild
                >
                  <Link href={`/blogs/${createSlug(post.title)}`} className="flex items-center justify-center">
                    Read More
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            </div>
          ))}
        </section>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-base font-medium text-muted-foreground">Loading more posts...</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Please wait while we fetch the latest blog posts</p>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && displayedPosts.length > 0 && (
          <div className="text-center py-12 rounded-2xl border border-border bg-muted/30">
            <p className="text-base font-medium text-muted-foreground">
              You have reached the end of the results.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Found {displayedPosts.length} {displayedPosts.length === 1 ? 'post' : 'posts'} matching your criteria.
            </p>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </MainLayout>
  )
}

export default BlogsPage
