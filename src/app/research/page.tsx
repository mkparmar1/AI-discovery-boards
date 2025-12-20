'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { allResearchPapers } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ExternalLink, Loader2, Calendar, Users, FileText, ArrowRight, Sparkles } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'


const ITEMS_PER_PAGE = 12

const ResearchPage = () => {
  const [displayedPapers, setDisplayedPapers] = useState(allResearchPapers.slice(0, ITEMS_PER_PAGE))
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(allResearchPapers.length > ITEMS_PER_PAGE)
  const featuredPapers = allResearchPapers.slice(0, 3)
  const allTags = Array.from(new Set(allResearchPapers.flatMap(paper => paper.tags)))
  const totalPapersLabel = allResearchPapers.length.toLocaleString()
  const tagCountLabel = allTags.length.toLocaleString()

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
                Research
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Track the papers shaping the AI frontier.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
                Scan the latest breakthroughs, bookmark essential readings, and keep your research feed current.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 bg-white text-slate-900 hover:bg-white/90">
                  <Link href="/research">
                    Explore research
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Papers</p>
                  <p className="mt-1 text-2xl font-semibold">{totalPapersLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Topics</p>
                  <p className="mt-1 text-2xl font-semibold">{tagCountLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Showing</p>
                  <p className="mt-1 text-2xl font-semibold">{displayedPapers.length.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Spotlight</p>
                <span className="text-xs text-white/60">Top reads</span>
              </div>
              <div className="mt-5 space-y-4">
                {featuredPapers.map((paper, index) => (
                  <div key={paper.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
                      0{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{paper.title}</p>
                      <p className="text-xs text-white/60">{formatDate(paper.publicationDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {allTags.slice(0, 6).map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-white/10 text-white/80">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Research papers</h2>
              <p className="text-sm text-muted-foreground">
                Showing {displayedPapers.length} of {totalPapersLabel} research papers
              </p>
            </div>
          </div>
        </section>

        {/* Research Papers Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedPapers.map((paper) => (
            <Card key={paper.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full">
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
                  className="w-full mt-auto border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 font-medium transition-all duration-300 group-hover:shadow-lg" 
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
        </section>

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
            <p className="text-muted-foreground">You have reached the end of our research papers collection.</p>
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
