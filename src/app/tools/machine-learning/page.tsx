'use client'

import React, { useState } from 'react'
import { aiTools } from '@/data/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Star, ExternalLink, Bot } from 'lucide-react'

const MachineLearningToolsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'reviews'>('rating')

  const mlTools = aiTools.filter(tool => 
    tool.category === 'Machine Learning' || 
    tool.tags.some(tag => tag.toLowerCase().includes('machine learning')) ||
    tool.tags.some(tag => tag.toLowerCase().includes('ml'))
  )

  const filteredTools = mlTools.filter(tool => {
    return tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tool.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Machine Learning Tools</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">
          Discover powerful machine learning tools and frameworks to build, train, and deploy ML models
        </p>

        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search machine learning tools..."
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

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Found {sortedTools.length} machine learning tools
          </p>
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

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {tool.features.slice(0, 3).map(feature => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {tool.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tool.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {tool.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
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
            No machine learning tools found matching your search.
          </p>
        </div>
      )}
    </div>
  )
}

export default MachineLearningToolsPage