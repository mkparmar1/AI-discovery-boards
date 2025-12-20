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
                AI Blogs
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Ideas, playbooks, and AI field notes.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
                Browse expert breakdowns, workflow guides, and product perspectives from across the AI ecosystem.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    placeholder="Search blogs by title, content, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-11 border-white/10 bg-white/10 pl-10 pr-10 text-white placeholder:text-white/60 focus-visible:ring-white/40"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button asChild className="h-11 bg-white text-slate-900 hover:bg-white/90">
                  <Link href="/learn-ai">
                    Explore learning paths
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Posts</p>
                  <p className="mt-1 text-2xl font-semibold">{totalPostsLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Topics</p>
                  <p className="mt-1 text-2xl font-semibold">{tagCountLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Results</p>
                  <p className="mt-1 text-2xl font-semibold">{resultsLabel}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Trending topics</p>
                <span className="text-xs text-white/60">Pick a focus</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {allTags.slice(0, 8).map(tag => (
                  <Button
                    key={tag}
                    variant="ghost"
                    className="h-8 rounded-full border border-white/10 bg-white/5 px-4 text-xs text-white hover:bg-white/10"
                    onClick={() => setSelectedTag(tag)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-white/60">Filters applied</p>
                <p className="mt-1 text-sm font-medium">{resultsLabel}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filter posts</h2>
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(displayedPosts.length, allFilteredPosts.length)} of {allFilteredPosts.length} posts
                {(searchTerm || selectedTag || showLikedOnly || showSavedOnly) && (
                  <span className="ml-1">(filtered from {totalPostsLabel} total)</span>
                )}
              </p>
            </div>
            {(searchTerm || selectedTag || showLikedOnly || showSavedOnly) && (
              <Button variant="link" size="sm" onClick={resetFilters} className="h-auto p-0 text-primary">
                Clear filters
              </Button>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 min-w-[220px]">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SearchableSelect
                options={[{ value: '', label: 'All tags' }, ...allTags.map(tag => ({ value: tag, label: tag }))]}
                value={selectedTag}
                onChange={setSelectedTag}
                placeholder="Select a tag..."
              />
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <Button
                  variant={showLikedOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLikedOnly(!showLikedOnly)}
                  className="flex items-center gap-1"
                >
                  <Heart className={`h-4 w-4 ${showLikedOnly ? 'fill-current' : ''}`} />
                  Liked
                </Button>
                <Button
                  variant={showSavedOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowSavedOnly(!showSavedOnly)}
                  className="flex items-center gap-1"
                >
                  <Bookmark className={`h-4 w-4 ${showSavedOnly ? 'fill-current' : ''}`} />
                  Saved
                </Button>
              </div>
            )}
            {(selectedTag || showLikedOnly || showSavedOnly || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs whitespace-nowrap"
              >
                Clear all filters
              </Button>
            )}
          </div>
          {(searchTerm || selectedTag || showLikedOnly || showSavedOnly) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">Search: {searchTerm}</Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary">Tag: {selectedTag}</Badge>
              )}
              {showLikedOnly && (
                <Badge variant="secondary">Liked posts</Badge>
              )}
              {showSavedOnly && (
                <Badge variant="secondary">Saved posts</Badge>
              )}
            </div>
          )}
        </section>

        {/* Posts Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedPosts.map((post, index) => (
            <Card key={`${post.id}-${index}`} className="group relative overflow-hidden bg-card border border-border/50 hover:border-primary/30 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              {/* Post Header with Abstract Pattern */}
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-all duration-300">
                {/* Abstract geometric pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-16 h-16 bg-blue-500 rounded-full"></div>
                  <div className="absolute top-8 right-8 w-12 h-12 bg-purple-500 rounded-lg rotate-45"></div>
                  <div className="absolute bottom-6 left-8 w-20 h-8 bg-pink-500 rounded-full"></div>
                  <div className="absolute bottom-12 right-12 w-8 h-20 bg-green-500 rounded-lg"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-orange-500 rounded-full"></div>
                </div>
                
                {/* Content overlay */}
                 <div className="absolute inset-0 flex flex-col justify-between p-6">
                   <div className="flex justify-between items-start">
                     <div className="bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full">
                       <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                         {post.tags[0] || 'Blog'}
                       </span>
                     </div>
                   </div>
                   
                   <div>
                     <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xl line-clamp-2 mb-1 drop-shadow-sm">
                       {post.title}
                     </h3>
                   </div>
                 </div>
              </div>

              <CardHeader className="pb-3">
                <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  {post.excerpt}
                </CardDescription>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(1, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs font-medium bg-primary/5 text-primary border-primary/20">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 pt-0">
                {/* Meta Information */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{calculateReadTime(post.content)} min read</span>
                    </div>
                  </div>
                  
                  {/* Like and Bookmark buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleLikeToggle(post.id)
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        userInteractions[post.id]?.isLiked
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-muted-foreground hover:text-red-500'
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
                      className={`p-1 rounded-full transition-colors ${
                        userInteractions[post.id]?.isBookmarked
                          ? 'text-blue-500 hover:text-blue-600'
                          : 'text-muted-foreground hover:text-blue-500'
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
                </div>

                {/* Read More Button */}
                <Button 
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                  variant="outline"
                  asChild
                >
                  <Link href={`/blogs/${createSlug(post.title)}`}>
                    Read More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading more posts...</span>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && displayedPosts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You have reached the end. {totalPostsLabel} posts loaded.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default BlogsPage
