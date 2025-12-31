'use client'

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink, ArrowRight, Sparkles } from 'lucide-react'

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
  const topics = useMemo(() => {
    return Array.from(new Set(videos.map(video => video.topic).filter(Boolean)))
  }, [videos])

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
      <div className="space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl">
          {/* Animated background gradients */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-96 w-96 animate-soft-pulse rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 animate-soft-pulse rounded-full bg-violet-500/20 blur-3xl" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(120,119,198,0.15),_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(139,92,246,0.15),_transparent_50%)]" />
          </div>
          
          <div className="relative grid gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 shadow-lg">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Learn AI
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Learn AI faster with{' '}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                  curated video lessons
                </span>
                .
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
                Handpicked YouTube content covering AI fundamentals, Python, automation, and real-world projects.
              </p>
              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Videos</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{totalCount.toLocaleString()}</p>
                </div>
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Topics</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{topics.length.toLocaleString()}</p>
                </div>
                <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Showing</p>
                  <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{videos.length.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-xl lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-white">Popular topics</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Pick a track</span>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70 mb-3">Learning paths</p>
                  <div className="flex flex-wrap gap-2">
                    {topics.slice(0, 8).map(topic => (
                      <Badge key={topic} variant="secondary" className="bg-white/10 text-white/80 border-white/20 backdrop-blur-sm font-medium">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-medium text-white/70">Now streaming</p>
                  <p className="mt-2 text-sm font-semibold text-white">{videos.length.toLocaleString()} videos ready</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v, index) => (
            <div
              key={v._id || v.youtubeUrl}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <Card className="group overflow-hidden bg-card border border-border rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl h-full flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative w-full h-48 bg-muted overflow-hidden">
                    {v.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={v.thumbnail} 
                        alt={v.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                        No thumbnail
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/30 px-2.5 py-0.5">
                      {v.topic}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{v.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{v.description}</CardDescription>
                  <Button 
                    asChild 
                    className="mt-auto border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 font-semibold text-primary transition-all duration-300 hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/10 hover:shadow-lg h-10" 
                    variant="outline"
                  >
                    <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      Watch Now
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </section>

        {isLoading && (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-base font-medium text-muted-foreground">Loading videos...</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Please wait while we fetch the latest AI learning videos</p>
          </div>
        )}

        {hasMore && !isLoading && (
          <div ref={sentinelRef} className="flex justify-center py-12">
            {isLoadingMore && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Loading more videos...</span>
              </div>
            )}
          </div>
        )}

        {!hasMore && !isLoading && videos.length > 0 && (
          <div className="text-center py-12 rounded-2xl border border-border bg-muted/30">
            <p className="text-base font-medium text-muted-foreground">
              You have reached the end of the results.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Found {videos.length} {videos.length === 1 ? 'video' : 'videos'} matching your criteria.
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
