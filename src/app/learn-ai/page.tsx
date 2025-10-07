'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink } from 'lucide-react'

interface LearnAIVideo {
  _id: string
  title: string
  topic: string
  youtubeUrl: string
  thumbnail: string
  description: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

interface ApiResponse {
  success: boolean
  data: LearnAIVideo[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

const ITEMS_PER_PAGE = 12

export default function LearnAIPage() {
  const [videos, setVideos] = useState<LearnAIVideo[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [isSentinelVisible, setIsSentinelVisible] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intersectingRef = useRef(false)
  const loadingRef = useRef(false)

  const fetchInitial = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/learn-ai-videos?limit=${ITEMS_PER_PAGE}&page=1`)
      const data: ApiResponse = await res.json()
      setVideos(data.data || [])
      setHasMore(data.pagination?.hasMore ?? false)
      setTotalCount(data.pagination?.totalCount ?? (data.data?.length || 0))
      setPage(1)
    } catch (e) {
      console.error('Failed to fetch Learn AI videos:', e)
      setVideos([])
      setHasMore(false)
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || isLoadingMore || isLoading || !hasMore) return
    setIsLoadingMore(true)
    loadingRef.current = true
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/learn-ai-videos?limit=${ITEMS_PER_PAGE}&page=${nextPage}`)
      const data: ApiResponse = await res.json()
      const newItems = data.data || []
      if (newItems.length > 0) {
        setVideos(prev => [...prev, ...newItems])
        setPage(nextPage)
        setHasMore(data.pagination?.hasMore ?? false)
        setTotalCount(data.pagination?.totalCount ?? totalCount)
      } else {
        setHasMore(false)
      }
    } catch (e) {
      console.error('Failed to load more videos:', e)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
      loadingRef.current = false
    }
  }, [page, isLoading, isLoadingMore, hasMore, totalCount])

  useEffect(() => {
    fetchInitial()
  }, [fetchInitial])

  useEffect(() => {
    if (!sentinelRef.current || isLoading) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      setIsSentinelVisible(entry.isIntersecting)
      intersectingRef.current = entry.isIntersecting
    }, { root: null, rootMargin: '800px', threshold: 0 })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [videos.length, hasMore, isLoading])

  useEffect(() => {
    if (!isSentinelVisible || isLoadingMore || !hasMore) return
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      if (intersectingRef.current && !isLoadingMore && hasMore) {
        void loadMore()
      }
    }, 1200)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [isSentinelVisible, isLoadingMore, hasMore, loadMore])

  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Learn AI – Explore the Best Free AI Learning Videos</h1>
          <p className="text-sm text-muted-foreground">Handpicked YouTube resources to master AI, Python, and automation tools.</p>
          <p className="text-xs text-muted-foreground mt-1">Showing {videos.length} of {totalCount} videos</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((v) => (
            <Card key={v._id || v.youtubeUrl} className="group overflow-hidden bg-card border border-border/50 hover:border-primary/30 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader className="p-0">
                <div className="relative w-full h-40 bg-muted">
                  {v.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No thumbnail</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs font-medium bg-primary/5 text-primary border-primary/20">
                    {v.topic}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold line-clamp-2">{v.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">{v.description}</CardDescription>
                <Button asChild className="mt-4" variant="outline">
                  <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Watch Now
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading videos...</span>
          </div>
        )}

        {hasMore && !isLoading && (
          <div ref={sentinelRef} className="h-10 w-full" aria-hidden="true" />
        )}

        {!hasMore && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You&apos;ve reached the end! All {totalCount} videos loaded.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}