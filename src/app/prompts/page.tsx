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
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl">
          {/* Animated background gradients */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-96 w-96 animate-soft-pulse rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 animate-soft-pulse rounded-full bg-purple-500/20 blur-3xl" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(120,119,198,0.15),_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(168,85,247,0.15),_transparent_50%)]" />
          </div>
          
          <div className="relative grid gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 shadow-lg">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                AI Prompts
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Copy-ready{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  prompts
                </span>
                {' '}for faster AI workflows.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
                Save time with curated prompts for writing, strategy, coding, and research. Filter by category, tag, and difficulty.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1 group">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60 transition-colors group-focus-within:text-white/90" />
                  <Input
                    type="text"
                    placeholder="Search prompts..."
                    value={rawSearchTerm}
                    onChange={(e) => setRawSearchTerm(e.target.value)}
                    className="h-12 border-white/20 bg-white/10 pl-12 pr-4 text-white placeholder:text-white/60 backdrop-blur-sm transition-all duration-300 focus-visible:border-white/40 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                  />
                </div>
                <Button asChild className="h-12 px-8 btn-gradient shadow-lg hover:shadow-xl">
                  <Link href="/prompts" className="flex items-center">
                    Browse prompt packs
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Prompts</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{totalCountLabel}</p>
                </div>
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Categories</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{categoryCountLabel}</p>
                </div>
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Tags</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{tagCountLabel}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-xl lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-white">Quick filters</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Pick a focus</span>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70 mb-3">Trending tags</p>
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
                  <p className="text-xs font-medium text-white/70">Active results</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {isLoading && displayedPrompts.length === 0
                      ? 'Loading prompts...'
                      : `Showing ${displayedPrompts.length} of ${totalCountLabel}`}
                  </p>
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
                  <h2 className="text-xl font-bold text-foreground">Filter prompts</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-1">
                    {isLoading && displayedPrompts.length === 0
                      ? 'Loading prompts...'
                      : `Showing ${displayedPrompts.length} of ${totalCountLabel} AI prompts`}
                    {hasActiveFilters && (
                      <Button variant="link" size="sm" onClick={clearFilters} className="ml-2 h-auto p-0 text-primary font-medium hover:underline">
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
                type="text"
                placeholder="Search prompts..."
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
                className="pl-10 h-11 border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-[180px]">
                <SearchableSelect
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="All Categories"
                  className="w-full"
                />
              </div>
            </div>
            <div className="min-w-[160px]">
              <SearchableSelect
                options={tagOptions}
                value={selectedTag}
                onChange={setSelectedTag}
                placeholder="All Tags"
                className="w-full"
              />
            </div>
            <div className="min-w-[160px]">
              <SearchableSelect
                options={difficultyOptions}
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                placeholder="All Difficulties"
                className="w-full"
              />
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
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="whitespace-nowrap h-11 font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                Clear all
              </Button>
            )}
          </div>
          {hasActiveFilters && (
            <div className="mt-5 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1">
                  <span>Search: {searchTerm}</span>
                  <button
                    onClick={() => setRawSearchTerm('')}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1">
                  <span>Category: {selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label="Remove category filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedTag !== 'all' && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1">
                  <span>Tag: {selectedTag}</span>
                  <button
                    onClick={() => setSelectedTag('all')}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label="Remove tag filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedDifficulty !== 'all' && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1">
                  <span>Difficulty: {selectedDifficulty}</span>
                  <button
                    onClick={() => setSelectedDifficulty('all')}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label="Remove difficulty filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {showLikedOnly && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800">
                  <span>Liked prompts</span>
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
                  <span>Saved prompts</span>
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

        {/* No Results Message */}
        {!isLoading && displayedPrompts.length === 0 && hasActiveFilters && (
          <section className="text-center py-16 rounded-2xl border border-border bg-card shadow-sm">
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">No prompts found</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                No prompts match your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </section>
        )}

        {/* Prompts Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedPrompts.map((prompt, index) => (
            <div
              key={prompt.id}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <Card className="group relative overflow-hidden bg-card border border-border rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl h-full flex flex-col">
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge 
                    variant="outline" 
                    className="text-xs font-semibold bg-primary/10 text-primary border-primary/30 px-2.5 py-0.5"
                  >
                    {prompt.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`text-xs font-semibold px-2.5 py-0.5 ${
                        prompt.difficulty === 'Beginner'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
                          : prompt.difficulty === 'Intermediate'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                            : 'bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700'
                      }`}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {prompt.difficulty}
                    </Badge>
                    
                    {/* Like and Save buttons */}
                    {isAuthenticated && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-gray-200/50 hover:border-red-200 hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            const newLikedState = !userInteractions[prompt.id]?.isLiked
                            handleLikeToggle(prompt.id, newLikedState)
                          }}
                        >
                          <Heart className={`h-4 w-4 transition-colors ${userInteractions[prompt.id]?.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-gray-200/50 hover:border-blue-200 hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            const newBookmarkedState = !userInteractions[prompt.id]?.isBookmarked
                            handleBookmarkToggle(prompt.id, newBookmarkedState)
                          }}
                        >
                          <Bookmark className={`h-4 w-4 transition-colors ${userInteractions[prompt.id]?.isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-gray-400 hover:text-blue-500'}`} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <span className="text-white font-bold text-base">
                      {prompt.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 flex-1">
                    {prompt.title}
                  </CardTitle>
                </div>
                
                <CardDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {prompt.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-6 pt-0 gap-4">
                {/* Prompt Content Preview */}
                <div className="rounded-lg border border-border/50 p-4 bg-muted/30 backdrop-blur-sm">
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3">
                    {prompt.prompt}
                  </p>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-muted/60 text-muted-foreground hover:bg-muted transition-colors font-medium px-2 py-0.5">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Use Case */}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-start gap-2">
                    <Star className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-yellow-500" />
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {prompt.useCase}
                    </p>
                  </div>
                </div>

                {/* Copy Button */}
                <Button
                  onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                  className="w-full mt-auto border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 font-semibold text-primary transition-all duration-300 hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/10 hover:shadow-lg h-10"
                  variant="outline"
                >
                  {copiedStates[prompt.id] ? (
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Prompt
                    </span>
                  )}
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
              <span className="text-base font-medium text-muted-foreground">Loading prompts...</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Please wait while we fetch the latest AI prompts</p>
          </div>
        )}

          {/* Sentinel for infinite scroll */}
        {hasMore && !isLoading && (
          <div ref={sentinelRef} className="flex justify-center py-12">
            {isLoadingMore && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Loading more prompts...</span>
              </div>
            )}
          </div>
        )}

          {/* End of Results */}
        {!hasMore && !isLoading && displayedPrompts.length > 0 && (
          <div className="text-center py-12 rounded-2xl border border-border bg-muted/30">
            <p className="text-base font-medium text-muted-foreground">
              You have reached the end of the results.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Found {displayedPrompts.length} {displayedPrompts.length === 1 ? 'prompt' : 'prompts'} matching your criteria.
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
