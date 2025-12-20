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
        <div className="py-12">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Error Loading Tools</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Failed to load tools. Please try again.'}
            </p>
            <Button onClick={() => window.location.reload()}>
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
                AI Tools
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Find the AI tools that fit your stack.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
                Filter by category, tags, and community favorites to uncover the tools worth trying this week.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    type="text"
                    placeholder="Search AI tools..."
                    value={rawSearchTerm}
                    onChange={(e) => setRawSearchTerm(e.target.value)}
                    className="h-11 border-white/10 bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-white/40"
                  />
                </div>
                <Button asChild className="h-11 bg-white text-slate-900 hover:bg-white/90">
                  <Link href="/tools">
                    Explore tools
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Tools tracked</p>
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
                <span className="text-xs text-white/60">Refine results</span>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Trending tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allTags.slice(0, 6).map(tag => (
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
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-white/60">Filters applied</p>
                  <p className="mt-1 text-sm font-medium">{resultsLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filter tools</h2>
              <p className="text-sm text-muted-foreground">
                {resultsLabel}
                {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || showLikedOnly || showSavedOnly) && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={resetFilters}
                    className="ml-2 h-auto p-0 text-primary"
                  >
                    Clear filters
                  </Button>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search AI tools..."
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
                className="pl-10"
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
                  className="flex items-center gap-2 whitespace-nowrap"
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
                  className="flex items-center gap-2 whitespace-nowrap"
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
                className="whitespace-nowrap"
              >
                Clear all
              </Button>
            )}
          </div>
          {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || showLikedOnly || showSavedOnly) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {debouncedSearchTerm && (
                <Badge variant="secondary">Search: {debouncedSearchTerm}</Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary">Category: {selectedCategory}</Badge>
              )}
              {selectedTag !== 'all' && (
                <Badge variant="secondary">Tag: {selectedTag}</Badge>
              )}
              {showLikedOnly && (
                <Badge variant="secondary">Liked tools</Badge>
              )}
              {showSavedOnly && (
                <Badge variant="secondary">Saved tools</Badge>
              )}
            </div>
          )}
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading tools...</span>
          </div>
        )}

        {/* Tools Grid/List */}
        {!isLoading && (
          <>
            {displayedTools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No tools found matching your criteria.
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
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {displayedTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    viewMode={viewMode}
                    isLiked={userInteractions[tool.id]?.isLiked || false}
                    isBookmarked={userInteractions[tool.id]?.isBookmarked || false}
                    onLikeToggle={handleLikeToggle}
                    onBookmarkToggle={handleBookmarkToggle}
                    showInteractionButtons={isAuthenticated}
                  />
                ))}
              </div>
            )}

            {/* Load More Trigger */}
            {hasNextPage && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-muted-foreground">Loading more tools...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of results */}
            {!hasNextPage && displayedTools.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  You have reached the end of the results.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
