'use client'

import React, { useState } from 'react'
import { aiTools, toolCategories } from '@/data/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Star, ExternalLink } from 'lucide-react'

const ToolCategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'reviews'>('rating')

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
        return (b.reviewCount || 0) - (a.reviewCount || 0)
      default:
        return 0
    }
  })

  const getCategoryCount = (category: string) => {
    return aiTools.filter(tool => tool.category === category).length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Tools Categories</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Explore our comprehensive collection of AI tools organized by category
        </p>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'reviews')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="reviews">Sort by Reviews</option>
            </select>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
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

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTools.map(tool => (
          <Card key={tool.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {tool.category} • {tool.subcategory}
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

              <Button className="w-full bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground" variant="outline" asChild>
                <a href={tool.website} target="_blank" rel="noopener noreferrer">
                  Visit Tool
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No tools found matching your criteria.
          </p>
        </div>
      )}
    </div>
  )
}

export default ToolCategoriesPage