'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Copy, Check, Star, Zap, Loader2, Search, Filter, Heart, Bookmark, X } from 'lucide-react'
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
    if (!isAuthenticated || !user || promptIds.length === 0) return

    setIsLoadingInteractions(true)
    try {
      const response = await fetch(`/api/prompts/interactions?userId=${user.id}&promptIds=${promptIds.join(',')}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserInteractions(prev => ({ ...prev, ...data.data }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch user interactions:', error)
    } finally {
      setIsLoadingInteractions(false)
    }
  }, [isAuthenticated, user])

  // Handle like toggle
  const handleLikeToggle = useCallback(async (promptId: string, isLiked: boolean) => {
    if (!isAuthenticated || !user) return

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
          userId: user.id,
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
  }, [isAuthenticated, user])

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(async (promptId: string, isBookmarked: boolean) => {
    if (!isAuthenticated || !user) return

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
          userId: user.id,
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
  }, [isAuthenticated, user])

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

  // Fetch user interactions when prompts change or user logs in
  useEffect(() => {
    if (displayedPrompts.length > 0) {
      const promptIds = displayedPrompts.map(prompt => prompt.id)
      fetchUserInteractions(promptIds)
    }
  }, [displayedPrompts, fetchUserInteractions])

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

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Prompts</h1>
          <p className="text-muted-foreground">Discover and use powerful AI prompts for various tasks</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          {/* Search and Filter Controls in Same Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search prompts..."
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>

            {/* Filter Label */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filters:</span>
            </div>

            {/* Category Filter */}
            <SearchableSelect
              options={categoryOptions}
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder="Category"
              className="w-40"
            />

            {/* Tag Filter */}
            <SearchableSelect
              options={tagOptions}
              value={selectedTag}
              onValueChange={setSelectedTag}
              placeholder="Tag"
              className="w-40"
            />

            {/* Difficulty Filter */}
            <SearchableSelect
              options={difficultyOptions}
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
              placeholder="Difficulty"
              className="w-40"
            />

            {/* Like Filter */}
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

            {/* Save Filter */}
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

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Prompts Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading && displayedPrompts.length === 0 ? (
              'Loading prompts...'
            ) : (
              `Showing ${displayedPrompts.length} of ${totalCount} AI prompts`
            )}
          </p>
        </div>

        {/* No Results Message */}
        {!isLoading && displayedPrompts.length === 0 && hasActiveFilters && (
          <div className="text-center py-12">
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
          </div>
        )}

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {isAuthenticated && (
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
                    )}
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
          </div>

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
              <p className="text-muted-foreground">You&apos;ve reached the end! All {totalCount} prompts loaded.</p>
            </div>
          )}
        </div>
      </MainLayout>
    )
  }