'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { allPosts } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2, Calendar, Clock } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
// Removed Image import as we're using gradient backgrounds instead
import Link from 'next/link'

// Helper function to create URL-friendly slugs from titles
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

const ITEMS_PER_PAGE = 12

const BlogsPage = () => {
  const [displayedPosts, setDisplayedPosts] = useState(allPosts.slice(0, ITEMS_PER_PAGE))
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(allPosts.length > ITEMS_PER_PAGE)

  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const newPosts = allPosts.slice(startIndex, endIndex)
      
      if (newPosts.length > 0) {
        setDisplayedPosts(prev => [...prev, ...newPosts])
        setCurrentPage(nextPage)
        setHasMore(endIndex < allPosts.length)
      } else {
        setHasMore(false)
      }
      
      setIsLoading(false)
    }, 800)
  }, [currentPage, isLoading, hasMore])

  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return
    
    const scrollTop = document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    
    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      loadMorePosts()
    }
  }, [loadMorePosts, isLoading, hasMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  return (
    <MainLayout>
      <div>


        {/* Posts Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(displayedPosts.length, allPosts.length)} of {allPosts.length} posts
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPosts.map((post, index) => (
            <Card key={`${post.id}-${index}`} className="group relative overflow-hidden bg-card border border-border/50 hover:border-primary/30 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              {/* Post Header with Abstract Pattern */}
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-all duration-300">
                {/* Abstract geometric pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-16 h-16 bg-blue-500 rounded-full"></div>
                  <div className="absolute top-8 right-8 w-12 h-12 bg-purple-500 rounded-lg rotate-45"></div>
                  <div className="absolute bottom-6 left-8 w-20 h-8 bg-pink-500 rounded-full"></div>
                  <div className="absolute bottom-12 right-12 w-8 h-20 bg-green-500 rounded-lg"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-orange-500 rounded-full"></div>
                </div>
                
                {/* Content overlay */}
                 <div className="absolute inset-0 flex flex-col justify-between p-6">
                   <div className="flex justify-between items-start">
                     <div className="bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full">
                       <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                         {post.tags[0] || 'Blog'}
                       </span>
                     </div>
                   </div>
                   
                   <div>
                     <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xl line-clamp-2 mb-1 drop-shadow-sm">
                       {post.title}
                     </h3>
                   </div>
                 </div>
              </div>

              <CardHeader className="pb-3">
                <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  {post.excerpt}
                </CardDescription>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(1, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs font-medium bg-primary/5 text-primary border-primary/20">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 pt-0">
                {/* Meta Information */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{calculateReadTime(post.content)} min read</span>
                  </div>
                </div>

                {/* Read More Button */}
                <Button 
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                  variant="outline"
                  asChild
                >
                  <Link href={`/blogs/${createSlug(post.title)}`}>
                    Read More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading more posts...</span>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && displayedPosts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You&apos;ve reached the end! {allPosts.length} posts loaded.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default BlogsPage