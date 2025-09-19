'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { allResearchPapers } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2, Calendar, Users, FileText } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'


const ITEMS_PER_PAGE = 12

const ResearchPage = () => {
  const [displayedPapers, setDisplayedPapers] = useState(allResearchPapers.slice(0, ITEMS_PER_PAGE))
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(allResearchPapers.length > ITEMS_PER_PAGE)

  const loadMorePapers = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      const currentLength = displayedPapers.length
      const nextPapers = allResearchPapers.slice(currentLength, currentLength + ITEMS_PER_PAGE)
      
      if (nextPapers.length > 0) {
        setDisplayedPapers(prev => [...prev, ...nextPapers])
        setHasMore(currentLength + nextPapers.length < allResearchPapers.length)
      } else {
        setHasMore(false)
      }
      
      setIsLoading(false)
    }, 800)
  }, [displayedPapers.length, isLoading, hasMore])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading) {
        return
      }
      loadMorePapers()
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMorePapers, isLoading])

  const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'short',
       day: 'numeric'
     })
   }

  const formatAuthors = (authors: string[]) => {
    if (authors.length <= 2) {
      return authors.join(', ')
    }
    return `${authors[0]} et al.`
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Posts Count */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            Showing {displayedPapers.length} of {allResearchPapers.length} research papers
          </p>
        </div>

        {/* Research Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedPapers.map((paper) => (
            <Card key={paper.id} className="group hover:shadow-lg transition-all duration-300 border border-border bg-card flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                   <Badge variant="secondary" className="text-xs">
                     {paper.tags[0] || 'Research'}
                   </Badge>
                   <div className="flex items-center gap-1 text-xs text-muted-foreground">
                     <Calendar className="h-3 w-3" />
                     <span>{formatDate(paper.publicationDate)}</span>
                   </div>
                 </div>
                
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {paper.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground line-clamp-1">
                  {formatAuthors(paper.authors)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Excerpt */}
                 <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                   {paper.excerpt}
                 </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {paper.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {paper.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{paper.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                {/* Metadata */}
                 <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                   <div className="flex items-center gap-1">
                     <FileText className="h-3 w-3" />
                     <span>Research Paper</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <Users className="h-3 w-3" />
                     <span>{paper.authors.length} author{paper.authors.length > 1 ? 's' : ''}</span>
                   </div>
                 </div>
                
                {/* Read More Button */}
                <Button 
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                  variant="outline"
                  asChild
                >
                  <a href={paper.url} target="_blank" rel="noopener noreferrer">
                    Read Paper
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading more papers...</span>
          </div>
        )}

        {/* End Message */}
        {!hasMore && !isLoading && displayedPapers.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You&apos;ve reached the end of our research papers collection.</p>
          </div>
        )}

        {/* Load More Button (fallback for users who prefer clicking) */}
        {hasMore && !isLoading && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={loadMorePapers}
              variant="outline"
              className="px-8 py-2"
            >
              Load More Papers
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ResearchPage