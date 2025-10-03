'use client'

import React, { useState, useEffect, useCallback } from 'react'
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

export default function PromptsPage() {
  const [allPrompts, setAllPrompts] = useState<AIPrompt[]>([])
  const [displayedPrompts, setDisplayedPrompts] = useState<AIPrompt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  // Fetch prompts from API
  const fetchPrompts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/prompts')
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }
      const data = await response.json()
       setAllPrompts(data.data || [])
       setDisplayedPrompts(data.data?.slice(0, ITEMS_PER_PAGE) || [])
       setHasMore((data.data?.length || 0) > ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching prompts:', error)
      // Fallback to empty array if API fails
      setAllPrompts([])
      setDisplayedPrompts([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMorePrompts = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const newPrompts = allPrompts.slice(startIndex, endIndex)
      
      if (newPrompts.length > 0) {
        setDisplayedPrompts(prev => [...prev, ...newPrompts])
        setCurrentPage(nextPage)
        setHasMore(endIndex < allPrompts.length)
      } else {
        setHasMore(false)
      }
      
      setIsLoading(false)
    }, 500)
  }, [currentPage, isLoading, hasMore, allPrompts])

  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return
    
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
      loadMorePrompts()
    }
  }, [loadMorePrompts, isLoading, hasMore])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const copyToClipboard = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [promptId]: true }))
      
      // Track prompt view/usage
      const prompt = allPrompts.find(p => p.id === promptId)
      if (prompt) {
        await trackPromptView(prompt.id, prompt.title, prompt.category, prompt.tags)
      }
      
      // Reset copied state after 2 seconds
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
              `Showing ${Math.min(displayedPrompts.length, allPrompts.length)} of ${allPrompts.length} AI prompts`
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

          {/* End of Results */}
          {!hasMore && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You&apos;ve reached the end! All {allPrompts.length} prompts loaded.</p>
            </div>
          )}
        </div>
      </MainLayout>
    )
  }