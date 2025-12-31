'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Tool } from '@/lib/data'
import ToolCard from '@/components/ToolCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Grid, List, Loader2, Heart, Bookmark, ArrowRight, Sparkles } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import SearchableSelect from '@/components/ui/searchable-select'
import { useAuth } from '@/contexts/AuthContext'
import { useInfiniteTools, useToolsMetadata, useAllToolsFromInfinite, useUserInteractions } from '@/hooks/useTools'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryClient } from '@tanstack/react-query'

const ITEMS_PER_PAGE = 20

export default function ToolsPage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  // Filter states
  const [rawSearchTerm, setRawSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [showLikedOnly, setShowLikedOnly] = useState(false)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(rawSearchTerm, 300)
  
  // React Query hooks
  const metadataQuery = useToolsMetadata()
  const toolsQuery = useInfiniteTools({
    search: debouncedSearchTerm || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    tags: selectedTag !== 'all' ? selectedTag : undefined,
    limit: ITEMS_PER_PAGE,
  })
  
  const {
    tools: rawTools,
    totalCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
    error,
  } = useAllToolsFromInfinite(toolsQuery)
  
  // Get user interactions for displayed tools
  const toolIds = rawTools.map(tool => tool.id)
  const sortedToolIds = useMemo(() => [...toolIds].sort(), [toolIds])
  const userInteractionsQuery = useUserInteractions(user?.id, sortedToolIds)
  const userInteractions = userInteractionsQuery.data || {}
  
  // Client-side filtering for liked/saved tools
  const displayedTools = useMemo(() => {
    let filtered = [...rawTools]
    
    if (showLikedOnly) {
      filtered = filtered.filter(tool => {
        const interaction = userInteractions[tool.id]
        return interaction?.isLiked === true
      })
    } else if (showSavedOnly) {
      filtered = filtered.filter(tool => {
        const interaction = userInteractions[tool.id]
        return interaction?.isBookmarked === true
      })
    }
    
    return filtered
  }, [rawTools, showLikedOnly, showSavedOnly, userInteractions])

  // Get metadata
  const categories = metadataQuery.data?.categories || []
  const allTags = metadataQuery.data?.tags || []
  const totalCountLabel = isLoading || typeof totalCount !== 'number' ? '...' : totalCount.toLocaleString()
  const categoryCountLabel = metadataQuery.isLoading ? '...' : categories.length.toLocaleString()
  const tagCountLabel = metadataQuery.isLoading ? '...' : allTags.length.toLocaleString()
  const resultsLabel = isLoading ? 'Loading tools...' : `Showing ${displayedTools.length} of ${totalCountLabel} tools`

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    ...categories.map(c => ({ value: c, label: c }))
  ], [categories])

  const tagOptions = useMemo(() => [
    { value: 'all', label: 'All Tags' },
    ...allTags.map(t => ({ value: t, label: `#${t}` }))
  ], [allTags])

  // Handle like toggle
  const handleLikeToggle = useCallback((toolId: string, isLiked: boolean) => {
    if (!user?.id) {
      window.location.href = '/login'
      return
    }

    const cacheKey = ['userInteractions', user.id, sortedToolIds]
    queryClient.setQueryData(cacheKey, (prev: Record<string, { isLiked: boolean; isBookmarked: boolean }> = {}) => ({
      ...prev,
      [toolId]: {
        isLiked,
        isBookmarked: prev[toolId]?.isBookmarked ?? false
      }
    }))
  }, [queryClient, sortedToolIds, user?.id])

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((toolId: string, isBookmarked: boolean) => {
    if (!user?.id) {
      window.location.href = '/login'
      return
    }

    const cacheKey = ['userInteractions', user.id, sortedToolIds]
    queryClient.setQueryData(cacheKey, (prev: Record<string, { isLiked: boolean; isBookmarked: boolean }> = {}) => ({
      ...prev,
      [toolId]: {
        isLiked: prev[toolId]?.isLiked ?? false,
        isBookmarked
      }
    }))
  }, [queryClient, sortedToolIds, user?.id])

  // Infinite scroll setup
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [isSentinelVisible, setIsSentinelVisible] = useState(false)
  const debounceTimerRef = useRef<number | null>(null)
  const intersectingRef = useRef<boolean>(false)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        setIsSentinelVisible(entry.isIntersecting)
        intersectingRef.current = entry.isIntersecting
      },
      { root: null, rootMargin: '800px', threshold: 0 }
    )
    
    observer.observe(node)
    return () => {
      observer.disconnect()
      intersectingRef.current = false
    }
  }, [displayedTools.length, hasNextPage, isLoading])
  
  // Debounced trigger when sentinel becomes visible
  useEffect(() => {
    if (!isSentinelVisible || isFetchingNextPage || !hasNextPage) return
  
    // Debounce 1.2s to prevent rapid multiple requests
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      if (intersectingRef.current && !isFetchingNextPage && hasNextPage) {
        fetchNextPage()
      }
    }, 1200)
  
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isSentinelVisible, isFetchingNextPage, hasNextPage, fetchNextPage])

  // Reset filters
  const resetFilters = () => {
    setRawSearchTerm('')
    setSelectedCategory('all')
    setSelectedTag('all')
    setShowLikedOnly(false)
    setShowSavedOnly(false)
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="py-16">
          <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-10 text-center shadow-lg max-w-2xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Error Loading Tools</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-6">
              {error?.message || 'Failed to load tools. Please try again.'}
            </p>
            <Button onClick={() => window.location.reload()} className="btn-gradient">
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl">
          {/* Animated background gradients */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-96 w-96 animate-soft-pulse rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 animate-soft-pulse rounded-full bg-sky-500/20 blur-3xl" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(120,119,198,0.15),_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15),_transparent_50%)]" />
          </div>
          
          <div className="relative grid gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 shadow-lg">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                AI Tools
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Find the{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI tools
                </span>
                {' '}that fit your stack.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
                Filter by category, tags, and community favorites to uncover the tools worth trying this week.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1 group">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60 transition-colors group-focus-within:text-white/90" />
                  <Input
                    type="text"
                    placeholder="Search AI tools..."
                    value={rawSearchTerm}
                    onChange={(e) => setRawSearchTerm(e.target.value)}
                    className="h-12 border-white/20 bg-white/10 pl-12 pr-4 text-white placeholder:text-white/60 backdrop-blur-sm transition-all duration-300 focus-visible:border-white/40 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                  />
                </div>
                <Button asChild className="h-12 px-8 btn-gradient shadow-lg hover:shadow-xl">
                  <Link href="/tools" className="flex items-center">
                    Explore tools
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Tools tracked</p>
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
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Refine results</span>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70 mb-3">Trending tags</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 6).map(tag => (
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
                  <h2 className="text-xl font-bold text-foreground">Filter tools</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-1">
                    {resultsLabel}
                    {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || showLikedOnly || showSavedOnly) && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={resetFilters}
                        className="ml-2 h-auto p-0 text-primary font-medium hover:underline"
                      >
                        Clear filters
                      </Button>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-1 shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2 font-medium"
              >
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 font-medium"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search AI tools..."
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
            {isAuthenticated && (
              <>
                <Button
                  variant={showLikedOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setShowLikedOnly(!showLikedOnly)
                    setShowSavedOnly(false)
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
                    setShowLikedOnly(false)
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
            {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || showLikedOnly || showSavedOnly) && (
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
          {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || showLikedOnly || showSavedOnly) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {debouncedSearchTerm && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1">
                  <span>Search: {debouncedSearchTerm}</span>
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
              {showLikedOnly && (
                <Badge variant="secondary" className="font-medium flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800">
                  <span>Liked tools</span>
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
                  <span>Saved tools</span>
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-base font-medium text-muted-foreground">Loading tools...</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Please wait while we fetch the latest AI tools</p>
          </div>
        )}

        {/* Tools Grid/List */}
        {!isLoading && (
          <>
            {displayedTools.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-border bg-card shadow-sm">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">No tools found</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    No tools found matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="mt-4"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {displayedTools.map((tool, index) => (
                  <div
                    key={tool.id}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <ToolCard
                      tool={tool}
                      viewMode={viewMode}
                      isLiked={userInteractions[tool.id]?.isLiked || false}
                      isBookmarked={userInteractions[tool.id]?.isBookmarked || false}
                      onLikeToggle={handleLikeToggle}
                      onBookmarkToggle={handleBookmarkToggle}
                      showInteractionButtons
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Load More Trigger */}
            {hasNextPage && (
              <div ref={sentinelRef} className="flex justify-center py-12">
                {isFetchingNextPage && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Loading more tools...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of results */}
            {!hasNextPage && displayedTools.length > 0 && (
              <div className="text-center py-12 rounded-2xl border border-border bg-muted/30">
                <p className="text-base font-medium text-muted-foreground">
                  You have reached the end of the results.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Found {displayedTools.length} {displayedTools.length === 1 ? 'tool' : 'tools'} matching your criteria.
                </p>
              </div>
            )}
          </>
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
