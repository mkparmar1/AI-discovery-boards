'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { Copy, Check, Star, Zap, Loader2, Search, Filter, Heart, Bookmark, X, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MainLayout from '@/components/layout/MainLayout'
import SearchableSelect from '@/components/ui/searchable-select'
import { trackPromptView } from '@/utils/activityTracker'
import { useAuth } from '@/contexts/AuthContext'

interface AIPrompt {
  id: string
  title: string
  prompt: string
  category: string
  tags: string[]
  description: string
  useCase: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  createdAt: string
}

const ITEMS_PER_PAGE = 12

interface ApiResponse {
  success: boolean
  data: AIPrompt[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

interface UserInteractions {
  [promptId: string]: {
    isLiked: boolean
    isBookmarked: boolean
  }
}

export default function PromptsPage() {
  // Authentication
  const { user, isAuthenticated } = useAuth()
  const redirectToLogin = useCallback(() => {
    window.location.href = '/login'
  }, [])
  const getUserId = useCallback(() => {
    if (user?.id) return user.id
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) return null
      const parsedUser = JSON.parse(storedUser)
      return parsedUser?.id || parsedUser?._id || null
    } catch {
      return null
    }
  }, [user])

  // Data states
  const [rawPrompts, setRawPrompts] = useState<AIPrompt[]>([])
  const [displayedPrompts, setDisplayedPrompts] = useState<AIPrompt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  // Filter states
  const [rawSearchTerm, setRawSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [showLikedOnly, setShowLikedOnly] = useState(false)
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  // User interaction states
  const [userInteractions, setUserInteractions] = useState<UserInteractions>({})

  // Meta data states
  const [categories, setCategories] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  // IntersectionObserver-based infinite scroll refs/state
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [isSentinelVisible, setIsSentinelVisible] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intersectingRef = useRef(false)
  const loadingRef = useRef(false)

  // Memoized options for selects
  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    ...categories.map(c => ({ value: c, label: c }))
  ], [categories])

  const tagOptions = useMemo(() => [
    { value: 'all', label: 'All Tags' },
    ...allTags.map(t => ({ value: t, label: `#${t}` }))
  ], [allTags])

  const difficultyOptions = useMemo(() => [
    { value: 'all', label: 'All Difficulties' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ], [])

  // Fetch user interactions for displayed prompts
  const fetchUserInteractions = useCallback(async (promptIds: string[]) => {
    const userId = getUserId()
    if (!userId || promptIds.length === 0) return

    setIsLoadingInteractions(true)
    try {
      const response = await fetch(`/api/prompts/interactions?userId=${userId}&promptIds=${promptIds.join(',')}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserInteractions(prev => ({ ...prev, ...data.data }))
        }
      } else {
        console.error('Failed to fetch user interactions: HTTP', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch user interactions:', error)
    } finally {
      setIsLoadingInteractions(false)
    }
  }, [getUserId])

  // Handle like toggle
  const handleLikeToggle = useCallback(async (promptId: string, isLiked: boolean) => {
    const userId = getUserId()
    if (!userId) {
      redirectToLogin()
      return
    }

    // Optimistically update UI
    setUserInteractions(prev => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        isLiked
      }
    }))

    try {
      const response = await fetch('/api/prompts/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          promptId,
          action: 'like',
          value: isLiked
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update like status')
      }

      const data = await response.json()
      if (data.success) {
        // Update with server response
        setUserInteractions(prev => ({
          ...prev,
          [promptId]: {
            ...prev[promptId],
            isLiked: data.data.isLiked
          }
        }))
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      // Revert optimistic update on error
      setUserInteractions(prev => ({
        ...prev,
        [promptId]: {
          ...prev[promptId],
          isLiked: !isLiked
        }
      }))
    }
  }, [getUserId, redirectToLogin])

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(async (promptId: string, isBookmarked: boolean) => {
    const userId = getUserId()
    if (!userId) {
      redirectToLogin()
      return
    }

    // Optimistically update UI
    setUserInteractions(prev => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        isBookmarked
      }
    }))

    try {
      const response = await fetch('/api/prompts/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          promptId,
          action: 'bookmark',
          value: isBookmarked
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update bookmark status')
      }

      const data = await response.json()
      if (data.success) {
        // Update with server response
        setUserInteractions(prev => ({
          ...prev,
          [promptId]: {
            ...prev[promptId],
            isBookmarked: data.data.isBookmarked
          }
        }))
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      // Revert optimistic update on error
      setUserInteractions(prev => ({
        ...prev,
        [promptId]: {
          ...prev[promptId],
          isBookmarked: !isBookmarked
        }
      }))
    }
  }, [getUserId, redirectToLogin])

  // Debounce the search input to improve responsiveness
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(rawSearchTerm), 300)
    return () => clearTimeout(t)
  }, [rawSearchTerm])

  // Fetch prompts from API (server-side pagination)
  const fetchPrompts = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        page: '1'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedTag !== 'all') params.append('tags', selectedTag)
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty)

      const response = await fetch(`/api/prompts?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }
      const data: ApiResponse = await response.json()
      setRawPrompts(data.data || [])
      setHasMore(data.pagination?.hasMore ?? false)
      setTotalCount(data.pagination?.totalCount ?? (data.data?.length || 0))
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching prompts:', error)
      // Fallback to empty array if API fails
      setRawPrompts([])
      setHasMore(false)
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedTag, selectedDifficulty])

  const loadMorePrompts = useCallback(async () => {
    if (loadingRef.current || isLoadingMore || isLoading || !hasMore) return

    setIsLoadingMore(true)
    loadingRef.current = true
    try {
      const nextPage = currentPage + 1
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        page: nextPage.toString()
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedTag !== 'all') params.append('tags', selectedTag)
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty)

      const response = await fetch(`/api/prompts?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch more prompts')
      }
      const data: ApiResponse = await response.json()
      const newPrompts = data.data || []

      if (newPrompts.length > 0) {
        setRawPrompts(prev => [...prev, ...newPrompts])
        setCurrentPage(nextPage)
        setHasMore(data.pagination?.hasMore ?? false)
        setTotalCount(data.pagination?.totalCount ?? totalCount)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more prompts:', error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
      loadingRef.current = false
    }
  }, [currentPage, isLoading, isLoadingMore, hasMore, totalCount, searchTerm, selectedCategory, selectedTag, selectedDifficulty])

  // Client-side filtering for liked and saved prompts
  useEffect(() => {
    let filtered = [...rawPrompts]

    if (showLikedOnly) {
      filtered = filtered.filter(prompt => userInteractions[prompt.id]?.isLiked)
    }

    if (showSavedOnly) {
      filtered = filtered.filter(prompt => userInteractions[prompt.id]?.isBookmarked)
    }

    setDisplayedPrompts(filtered)
  }, [rawPrompts, showLikedOnly, showSavedOnly, userInteractions])

  // Fetch user interactions when prompt data changes or user logs in
  useEffect(() => {
    if (rawPrompts.length > 0) {
      const promptIds = rawPrompts.map(prompt => prompt.id)
      fetchUserInteractions(promptIds)
    }
  }, [rawPrompts, fetchUserInteractions])

  // Fetch metadata for filters
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/prompts?metaOnly=true')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCategories(data.categories || [])
            setAllTags(data.tags || [])
          }
        }
      } catch (error) {
        console.error('Error fetching metadata:', error)
      }
    }
    fetchMetadata()
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
  }, [searchTerm, selectedCategory, selectedTag, selectedDifficulty, showLikedOnly, showSavedOnly])

  // Initialize observer after initial data is rendered
  useEffect(() => {
    if (!sentinelRef.current || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsSentinelVisible(entry.isIntersecting)
        intersectingRef.current = entry.isIntersecting
      },
      { root: null, rootMargin: '800px', threshold: 0 }
    )

    observer.observe(sentinelRef.current)

    return () => {
      observer.disconnect()
    }
  }, [displayedPrompts.length, hasMore, isLoading])

  // Debounced trigger when sentinel becomes visible
  useEffect(() => {
    if (!isSentinelVisible || isLoadingMore || !hasMore) return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (intersectingRef.current && !isLoadingMore && hasMore) {
        void loadMorePrompts()
      }
    }, 1200)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isSentinelVisible, isLoadingMore, hasMore, loadMorePrompts])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  const copyToClipboard = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [promptId]: true }))
      // Track prompt view/usage using displayed list
      const prompt = displayedPrompts.find(p => p.id === promptId)
      if (prompt) {
        await trackPromptView(prompt.id, prompt.title, prompt.category, prompt.tags)
      }
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [promptId]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setRawSearchTerm('')
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedTag('all')
    setSelectedDifficulty('all')
    setShowLikedOnly(false)
    setShowSavedOnly(false)
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || selectedDifficulty !== 'all' || showLikedOnly || showSavedOnly
  const totalCountLabel = totalCount.toLocaleString()
  const categoryCountLabel = categories.length.toLocaleString()
  const tagCountLabel = allTags.length.toLocaleString()

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
                AI Prompts
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Copy-ready prompts for faster AI workflows.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
                Save time with curated prompts for writing, strategy, coding, and research. Filter by category, tag, and difficulty.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    type="text"
                    placeholder="Search prompts..."
                    value={rawSearchTerm}
                    onChange={(e) => setRawSearchTerm(e.target.value)}
                    className="h-11 border-white/10 bg-white/10 pl-10 pr-4 text-white placeholder:text-white/60 focus-visible:ring-white/40"
                  />
                </div>
                <Button asChild className="h-11 bg-white text-slate-900 hover:bg-white/90">
                  <Link href="/prompts">
                    Browse prompt packs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Prompts</p>
                  <p className="mt-1 text-2xl font-semibold">{totalCountLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Categories</p>
                  <p className="mt-1 text-2xl font-semibold">{categoryCountLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Tags</p>
                  <p className="mt-1 text-2xl font-semibold">{tagCountLabel}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Quick filters</p>
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
                <p className="text-xs text-white/60">Active results</p>
                <p className="mt-1 text-sm font-medium">
                  {isLoading && displayedPrompts.length === 0
                    ? 'Loading prompts...'
                    : `Showing ${displayedPrompts.length} of ${totalCountLabel}`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filter prompts</h2>
              <p className="text-sm text-muted-foreground">
                {isLoading && displayedPrompts.length === 0
                  ? 'Loading prompts...'
                  : `Showing ${displayedPrompts.length} of ${totalCountLabel} AI prompts`}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="link" size="sm" onClick={clearFilters} className="h-auto p-0 text-primary">
                Clear filters
              </Button>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search prompts..."
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filters</span>
            </div>
            <SearchableSelect
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Category"
              className="w-44"
            />
            <SearchableSelect
              options={tagOptions}
              value={selectedTag}
              onChange={setSelectedTag}
              placeholder="Tag"
              className="w-40"
            />
            <SearchableSelect
              options={difficultyOptions}
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
              placeholder="Difficulty"
              className="w-44"
            />
            {isAuthenticated && (
              <Button
                variant={showLikedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowLikedOnly(!showLikedOnly)
                  if (!showLikedOnly) setShowSavedOnly(false)
                }}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${showLikedOnly ? 'fill-current' : ''}`} />
                Liked
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant={showSavedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowSavedOnly(!showSavedOnly)
                  if (!showSavedOnly) setShowLikedOnly(false)
                }}
                className="flex items-center gap-2"
              >
                <Bookmark className={`h-4 w-4 ${showSavedOnly ? 'fill-current' : ''}`} />
                Saved
              </Button>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">Search: {searchTerm}</Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary">Category: {selectedCategory}</Badge>
              )}
              {selectedTag !== 'all' && (
                <Badge variant="secondary">Tag: {selectedTag}</Badge>
              )}
              {selectedDifficulty !== 'all' && (
                <Badge variant="secondary">Difficulty: {selectedDifficulty}</Badge>
              )}
              {showLikedOnly && (
                <Badge variant="secondary">Liked prompts</Badge>
              )}
              {showSavedOnly && (
                <Badge variant="secondary">Saved prompts</Badge>
              )}
            </div>
          )}
        </section>

        {/* No Results Message */}
        {!isLoading && displayedPrompts.length === 0 && hasActiveFilters && (
          <section className="text-center py-12">
            <div className="mb-4">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-4">
                No prompts match your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={clearFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </section>
        )}

        {/* Prompts Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedPrompts.map((prompt) => (
            <Card key={prompt.id} className="group relative overflow-hidden bg-card border border-border/50 hover:border-primary/30 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <Badge 
                    variant="outline" 
                    className="text-xs font-medium bg-primary/5 text-primary border-primary/20"
                  >
                    {prompt.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={prompt.difficulty === 'Beginner' ? 'default' : prompt.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {prompt.difficulty}
                    </Badge>
                    
                    {/* Like and Save buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                         variant="ghost"
                         size="sm"
                         className="h-8 w-8 p-0"
                         onClick={() => {
                           const newLikedState = !userInteractions[prompt.id]?.isLiked
                           handleLikeToggle(prompt.id, newLikedState)
                         }}
                       >
                         <Heart className={`h-4 w-4 ${userInteractions[prompt.id]?.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-8 w-8 p-0"
                         onClick={() => {
                           const newBookmarkedState = !userInteractions[prompt.id]?.isBookmarked
                           handleBookmarkToggle(prompt.id, newBookmarkedState)
                         }}
                       >
                         <Bookmark className={`h-4 w-4 ${userInteractions[prompt.id]?.isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-muted-foreground'}`} />
                       </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {prompt.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {prompt.title}
                  </CardTitle>
                </div>
                
                <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {prompt.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 pt-0">
                {/* Prompt Content Preview */}
                <div className="rounded-lg border border-border/50 p-3 mb-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3">
                    {prompt.prompt}
                  </p>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {prompt.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Use Case */}
                <div className="mb-4">
                  <div className="flex items-start gap-2">
                    <Star className="h-3 w-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {prompt.useCase}
                    </p>
                  </div>
                </div>

                {/* Copy Button */}
                <Button
                  onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg"
                  variant="outline"
                >
                  {copiedStates[prompt.id] ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

          {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading more prompts...</span>
          </div>
        )}

          {/* Sentinel for infinite scroll */}
        {hasMore && !isLoading && (
          <div ref={sentinelRef} className="h-10 w-full" aria-hidden="true" />
        )}

          {/* End of Results */}
        {!hasMore && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You have reached the end. All {totalCountLabel} prompts loaded.</p>
          </div>
        )}
      </div>
      </MainLayout>
    )
  }
