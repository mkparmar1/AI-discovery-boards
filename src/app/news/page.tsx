'use client'

import React, { useState } from 'react'
import { Search, Filter, Calendar, ExternalLink, TrendingUp, Briefcase, Microscope, Zap, Users, Clock } from 'lucide-react'
import { newsArticles, newsCategories } from '@/data/data'
import { formatDate } from '@/lib/utils'

const categories = ['All Categories', ...newsCategories]

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [showTrendingOnly, setShowTrendingOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filteredNews = newsArticles.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())

  const featuredNews = newsArticles.slice(0, 3)
  const trendingNews = newsArticles.slice(0, 4)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Latest News': return TrendingUp
      case 'Industry Updates': return Briefcase
      case 'Research Breakthroughs': return Microscope
      case 'Product Launches': return Zap
      case 'Events & Conferences': return Users
      default: return TrendingUp
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI News & Trends
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Stay updated with the latest developments in artificial intelligence
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">Daily</div>
                <div className="text-sm text-muted-foreground">Updates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Sources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Articles/Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">Real-time</div>
                <div className="text-sm text-muted-foreground">Trending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search AI news, trends, and updates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Source
                  </label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={showTrendingOnly}
                      onChange={(e) => setShowTrendingOnly(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    Trending Only
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Stories</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredNews.slice(0, 2).map(item => {
                const IconComponent = getCategoryIcon(item.category)
                return (
                  <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <IconComponent className="h-12 w-12 text-primary" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                          {item.category}
                        </span>
                        {item.trending && (
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                            🔥 Trending
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground text-xl mb-3 leading-tight">{item.title}</h3>
                      <p className="text-muted-foreground mb-4">{item.summary}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <span>By {item.author}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.publishedDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.readTime} min read
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium">
                          Read More
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Trending Section */}
        {trendingNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Trending Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingNews.slice(0, 3).map(item => {
                const IconComponent = getCategoryIcon(item.category)
                return (
                  <div key={item.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full mb-2">
                          🔥 Trending
                        </span>
                        <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">{item.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(item.publishedDate)}</span>
                          <span>•</span>
                          <span>{item.readTime} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All News */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Latest News ({filteredNews.length})
            </h2>
            <button className="text-primary hover:text-primary/80 font-medium">
              View All News →
            </button>
          </div>
          
          <div className="space-y-6">
            {filteredNews.map(item => {
              const IconComponent = getCategoryIcon(item.category)
              return (
                <div key={item.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block px-2 py-1 text-xs bg-accent text-accent-foreground rounded-full">
                              {item.category}
                            </span>
                            {item.trending && (
                              <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                                🔥 Trending
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{item.source}</span>
                          </div>
                          <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                          <p className="text-muted-foreground mb-3">{item.summary}</p>
                        </div>
                        <button className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium flex-shrink-0 ml-4">
                          Read More
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By {item.author}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.publishedDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.readTime} min read
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}