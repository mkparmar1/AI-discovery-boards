'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Copy, Check, Star, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MainLayout from '@/components/layout/MainLayout'
import { trackPromptView } from '@/utils/activityTracker'

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

export default function PromptsPage() {
  // Remove allPrompts; rely on server pagination
  // const [allPrompts, setAllPrompts] = useState<AIPrompt[]>([])
  const [displayedPrompts, setDisplayedPrompts] = useState<AIPrompt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  // IntersectionObserver-based infinite scroll refs/state
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [isSentinelVisible, setIsSentinelVisible] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intersectingRef = useRef(false)
  const loadingRef = useRef(false)

  // Fetch prompts from API (server-side pagination)
  const fetchPrompts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/prompts?limit=${ITEMS_PER_PAGE}&page=1`)
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }
      const data: ApiResponse = await response.json()
      setDisplayedPrompts(data.data || [])
      setHasMore(data.pagination?.hasMore ?? false)
      setTotalCount(data.pagination?.totalCount ?? (data.data?.length || 0))
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching prompts:', error)
      // Fallback to empty array if API fails
      setDisplayedPrompts([])
      setHasMore(false)
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMorePrompts = useCallback(async () => {
    if (loadingRef.current || isLoadingMore || isLoading || !hasMore) return

    setIsLoadingMore(true)
    loadingRef.current = true
    try {
      const nextPage = currentPage + 1
      const response = await fetch(`/api/prompts?limit=${ITEMS_PER_PAGE}&page=${nextPage}`)
      if (!response.ok) {
        throw new Error('Failed to fetch more prompts')
      }
      const data: ApiResponse = await response.json()
      const newPrompts = data.data || []

      if (newPrompts.length > 0) {
        setDisplayedPrompts(prev => [...prev, ...newPrompts])
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
  }, [currentPage, isLoading, isLoadingMore, hasMore, totalCount])

  // Remove window scroll listener; use IntersectionObserver instead
  // useEffect(() => {
  //   window.addEventListener('scroll', handleScroll)
  //   return () => window.removeEventListener('scroll', handleScroll)
  // }, [handleScroll])

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

  return (
    <MainLayout>
      <div>
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
                  <Badge 
                    variant={prompt.difficulty === 'Beginner' ? 'default' : prompt.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {prompt.difficulty}
                  </Badge>
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