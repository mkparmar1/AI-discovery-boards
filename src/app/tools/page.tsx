'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { allTools } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2 } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

const ITEMS_PER_PAGE = 20

const ToolsPage = () => {
  const [displayedTools, setDisplayedTools] = useState(allTools.slice(0, ITEMS_PER_PAGE))
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(allTools.length > ITEMS_PER_PAGE)

  const loadMoreTools = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const newTools = allTools.slice(startIndex, endIndex)
      
      if (newTools.length > 0) {
        setDisplayedTools(prev => [...prev, ...newTools])
        setCurrentPage(nextPage)
        setHasMore(endIndex < allTools.length)
      } else {
        setHasMore(false)
      }
      
      setIsLoading(false)
    }, 500)
  }, [currentPage, isLoading, hasMore])

  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return
    
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
      loadMoreTools()
    }
  }, [loadMoreTools, isLoading, hasMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <MainLayout>
      <div>
        {/* Tools Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(displayedTools.length, allTools.length)} of {allTools.length} tools
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedTools.map((tool, index) => (
          <Card key={`${tool.id}-${index}`} className="group relative overflow-hidden bg-card border border-border/50 hover:border-primary/30 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-start mb-3">
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium bg-primary/5 text-primary border-primary/20"
                >
                  {tool.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {tool.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                  {tool.title}
                </CardTitle>
              </div>
              
              <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {tool.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-4 pt-0">
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {tool.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Click Count */}
              <div className="mb-4">
                <Badge 
                  variant="secondary"
                  className="text-xs font-medium bg-blue-500/90 text-white border-0"
                >
                  {tool.clickCount.toLocaleString()} clicks
                </Badge>
              </div>

              {/* CTA Button */}
              <Button 
                className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                variant="outline"
                asChild
              >
                <a href={tool.website} target="_blank" rel="noopener noreferrer">
                  Visit Tool
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading more tools...</span>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You&apos;ve reached the end! All {allTools.length} tools loaded.</p>
        </div>
      )}

      </div>
    </MainLayout>
  )
}

export default ToolsPage