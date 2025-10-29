'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Tool } from '@/lib/data'
import ToolCard from '@/components/ToolCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Grid, List, Loader2, Heart, Bookmark } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import SearchableSelect from '@/components/ui/searchable-select'
import { useAuth } from '@/contexts/AuthContext'
import { useInfiniteTools, useToolsMetadata, useAllToolsFromInfinite, useUserInteractions } from '@/hooks/useTools'
import { useDebounce } from '@/hooks/useDebounce'

const ITEMS_PER_PAGE = 20

export default function ToolsPage() {
  const { user, isAuthenticated } = useAuth()
  
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
  const userInteractionsQuery = useUserInteractions(user?.id, toolIds)
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
    // This would typically trigger a mutation to update the server
    // For now, we'll just update the local state
    console.log('Like toggled:', toolId, isLiked)
  }, [])

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((toolId: string, isBookmarked: boolean) => {
    // This would typically trigger a mutation to update the server
    // For now, we'll just update the local state
    console.log('Bookmark toggled:', toolId, isBookmarked)
  }, [])

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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Tools</h2>
            <p className="text-gray-600 mb-4">
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Tools Discovery
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover and explore the latest AI tools and technologies
          </p>
        </div>

        {/* Tools Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading ? (
                'Loading tools...'
              ) : (
                <>
                  Showing {displayedTools.length} of {totalCount} tools
                  {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all') && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={resetFilters}
                      className="ml-2 p-0 h-auto text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </Button>
                  )}
                </>
              )}
            </p>
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
        </div>

        {/* Search and Filters - Single Row Layout */}
        <div className="mb-8">
          <div className="flex items-center gap-3 min-w-0 overflow-x-auto pb-2">
            {/* Search Bar */}
            <div className="relative flex-shrink-0" style={{ width: '280px' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search AI tools..."
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="h-4 w-4 text-gray-500" />
              <div style={{ width: '140px' }}>
                <SearchableSelect
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="All Categories"
                  className="w-full"
                />
              </div>
            </div>

            {/* Tag Filter */}
            <div className="flex-shrink-0" style={{ width: '120px' }}>
              <SearchableSelect
                options={tagOptions}
                value={selectedTag}
                onChange={setSelectedTag}
                placeholder="All Tags"
                className="w-full"
              />
            </div>

            {/* User-specific filters */}
            {isAuthenticated && (
              <>
                <Button
                  variant={showLikedOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setShowLikedOnly(!showLikedOnly)
                    setShowSavedOnly(false)
                  }}
                  className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
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
                  className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
                >
                  <Bookmark className={`h-4 w-4 ${showSavedOnly ? 'fill-current' : ''}`} />
                  Saved
                </Button>
              </>
            )}

            {/* Clear Filters */}
            {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || showLikedOnly || showSavedOnly) && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-800 flex-shrink-0 whitespace-nowrap"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading tools...</span>
          </div>
        )}

        {/* Tools Grid/List */}
        {!isLoading && (
          <>
            {displayedTools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
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
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading more tools...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of results */}
            {!hasNextPage && displayedTools.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  You've reached the end of the results.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}