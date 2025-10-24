'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Tool } from '@/lib/data'
import ToolCard from '@/components/ToolCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Grid, List, Loader2 } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import SearchableSelect from '@/components/ui/searchable-select'

const ITEMS_PER_PAGE = 20

interface ApiResponse {
  success: boolean
  data: Tool[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
  meta?: {
    categories: string[]
    tags: string[]
    totalCount: number
  }
}

export default function ToolsPage() {
  // Remove client-side full dataset; rely on server-side pagination and filtering
  const [displayedTools, setDisplayedTools] = useState<Tool[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [rawSearchTerm, setRawSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    ...categories.map(c => ({ value: c, label: c }))
  ], [categories])

  const tagOptions = useMemo(() => [
    { value: 'all', label: 'All Tags' },
    ...allTags.map(t => ({ value: t, label: `#${t}` }))
  ], [allTags])

  // Debounce the search input to improve responsiveness
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(rawSearchTerm), 300)
    return () => clearTimeout(t)
  }, [rawSearchTerm])

  // Use a module-level flag to avoid duplicate calls under React Strict Mode in dev
  const initRef = useRef(false)
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        // Fetch meta (categories, tags, total count) without loading all tools
        const metaResponse = await fetch('/api/tools?metaOnly=true')
        const metaData: ApiResponse = await metaResponse.json()

        // Fetch first page of tools (unfiltered)
        const toolsResponse = await fetch(`/api/tools?limit=${ITEMS_PER_PAGE}&page=1`)
        const toolsData: ApiResponse = await toolsResponse.json()
        
        if (toolsData.success) {
          setDisplayedTools(toolsData.data)
          setHasMore(toolsData.pagination.hasMore)
          setTotalCount(toolsData.pagination.totalCount)
        }
        if (metaData.success && metaData.meta) {
          setCategories(metaData.meta.categories)
          setAllTags(metaData.meta.tags)
        }
      } catch (error) {
        console.error('Error fetching tools:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Filter tools based on search term, category, and tag (server-side)
  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        setIsLoading(true)
        setCurrentPage(1)
        const params = new URLSearchParams()
        params.set('limit', String(ITEMS_PER_PAGE))
        params.set('page', '1')
        if (searchTerm) params.set('search', searchTerm)
        if (selectedCategory !== 'all') params.set('category', selectedCategory)
        if (selectedTag !== 'all') params.set('tags', selectedTag)

        const response = await fetch(`/api/tools?${params.toString()}`)
        const data: ApiResponse = await response.json()
        if (data.success) {
          setDisplayedTools(data.data)
          setHasMore(data.pagination.hasMore)
          setTotalCount(data.pagination.totalCount)
        }
      } catch (error) {
        console.error('Error fetching filtered tools:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch when filters change
    fetchFiltered()
  }, [searchTerm, selectedCategory, selectedTag])

  // Removed legacy scroll-based pagination and cooldown; using IntersectionObserver with page guard below

  // Replace cooldown and scroll-based loading with page guard + IntersectionObserver
  const lastRequestedPageRef = useRef<number>(1)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  // Add visibility state and debounce/throttle refs for reliable infinite scroll
  const [isSentinelVisible, setIsSentinelVisible] = useState(false)
  const debounceTimerRef = useRef<number | null>(null)
  const intersectingRef = useRef<boolean>(false)

  useEffect(() => {
    lastRequestedPageRef.current = 1
  }, [searchTerm, selectedCategory, selectedTag])

  const loadMoreTools = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    const nextPage = currentPage + 1
    if (lastRequestedPageRef.current === nextPage) return
    lastRequestedPageRef.current = nextPage

    setIsLoadingMore(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', String(ITEMS_PER_PAGE))
      params.set('page', String(nextPage))
      if (searchTerm) params.set('search', searchTerm)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedTag !== 'all') params.set('tags', selectedTag)

      const response = await fetch(`/api/tools?${params.toString()}`)
      const data: ApiResponse = await response.json()
      if (data.success && data.data.length > 0) {
        setDisplayedTools(prev => [...prev, ...data.data])
        setCurrentPage(nextPage)
        setHasMore(data.pagination.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more tools:', error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentPage, isLoadingMore, hasMore, searchTerm, selectedCategory, selectedTag])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        setIsSentinelVisible(entry.isIntersecting)
        intersectingRef.current = entry.isIntersecting
        // Do not call loadMoreTools here directly; rely on debounced effect below
      },
      { root: null, rootMargin: '800px', threshold: 0 }
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      intersectingRef.current = false
    }
  }, [displayedTools.length, hasMore, isLoading])
  
  // Debounced trigger when sentinel becomes visible
  useEffect(() => {
    if (!isSentinelVisible || isLoadingMore || !hasMore) return
  
    // Debounce 1.2s to prevent rapid multiple requests
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = window.setTimeout(() => {
      // Safety re-check to avoid duplicate or skipped pages
      if (intersectingRef.current && !isLoadingMore && hasMore) {
        loadMoreTools()
      }
    }, 1200)
  
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isSentinelVisible, isLoadingMore, hasMore, loadMoreTools])
  return (
    <MainLayout>
      <div>
        {/* Tools Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {displayedTools.length} of {totalCount} tools
          </p>
        </div>

        {/* Search and Filters in One Row */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tools by name, description, or tags..."
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SearchableSelect
                  value={selectedCategory}
                  onChange={(v) => setSelectedCategory(v)}
                  options={categoryOptions}
                  placeholder="All Categories"
                  className="min-w-[140px]"
                />
              </div>

              {/* Tag Filter */}
              <div className="flex items-center gap-2">
                <SearchableSelect
                  value={selectedTag}
                  onChange={(v) => setSelectedTag(v)}
                  options={tagOptions}
                  placeholder="All Tags"
                  className="min-w-[120px]"
                />
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedCategory !== 'all' || selectedTag !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedTag('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading tools...</p>
            </div>
          </div>
        ) : displayedTools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tools found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedTag('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedTools.map((tool, index) => (
                <ToolCard key={`${tool.id}-${index}`} tool={tool} viewMode="grid" />
              ))}
            </div>

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading more tools...</span>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && !isLoadingMore && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You&apos;ve reached the end! All {displayedTools.length} tools loaded.</p>
              </div>
            )}

            {/* Sentinel for IntersectionObserver */}
            <div ref={sentinelRef} className="h-1" />
          </>
        )}
      </div>
    </MainLayout>
  )
}