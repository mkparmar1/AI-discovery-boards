'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { aiTools, toolCategories } from '@/data/data'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Star, ExternalLink, Sparkles, ArrowRight } from 'lucide-react'

const ToolCategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'reviews'>('rating')
  const categoryCount = toolCategories.length
  const tagCount = new Set(aiTools.flatMap(tool => tool.tags)).size

  const filteredTools = aiTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return b.rating - a.rating
      case 'reviews':
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
                AI Tools
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Browse AI tools by category.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
                Filter the full catalog by category, sort by rating, and jump straight to the tools that match your workflow.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-11 border-white/10 bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-white/40"
                  />
                </div>
                <Button asChild className="h-11 bg-white text-slate-900 hover:bg-white/90">
                  <Link href="/tools">
                    View all tools
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Tools</p>
                  <p className="mt-1 text-2xl font-semibold">{aiTools.length.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Categories</p>
                  <p className="mt-1 text-2xl font-semibold">{categoryCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">Tags</p>
                  <p className="mt-1 text-2xl font-semibold">{tagCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Popular categories</p>
                <span className="text-xs text-white/60">Pick a focus</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {toolCategories.slice(0, 8).map(category => (
                  <Button
                    key={category}
                    variant="ghost"
                    className="h-8 rounded-full border border-white/10 bg-white/5 px-4 text-xs text-white hover:bg-white/10"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-white/60">Filtered results</p>
                <p className="mt-1 text-sm font-medium">{sortedTools.length.toLocaleString()} tools shown</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filter tools</h2>
              <p className="text-sm text-muted-foreground">
                Showing {sortedTools.length.toLocaleString()} of {aiTools.length.toLocaleString()} tools
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'reviews')}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="reviews">Sort by Reviews</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                All Categories ({aiTools.length})
              </Button>
              {toolCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category} ({getCategoryCount(category)})
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedTools.map(tool => (
            <Card key={tool.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {tool.category} ? {tool.subcategory}
                    </CardDescription>
                  </div>
                  <Badge variant={tool.pricing === 'free' ? 'secondary' : 'default'}>
                    {tool.pricing === 'free' ? 'Free' : tool.priceRange || 'Paid'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {tool.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{tool.rating}</span>
                  </div>
                  {tool.reviewCount && (
                    <span className="text-sm text-muted-foreground">
                      ({tool.reviewCount.toLocaleString()} reviews)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {tool.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tool.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tool.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <Button
                  className="w-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
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
        </section>

        {sortedTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No tools found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ToolCategoriesPage
