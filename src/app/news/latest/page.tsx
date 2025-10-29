'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, ExternalLink, Filter, Search } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Extended news data
const allNewsArticles = [
  {
    id: 1,
    title: "OpenAI Releases GPT-5: Revolutionary Breakthrough in AI Reasoning",
    description: "The latest model shows unprecedented capabilities in complex reasoning and multimodal understanding, setting new benchmarks across multiple domains.",
    category: "AI Models",
    publishedDate: "2025-01-15",
    readTime: "5 min read",
    source: "OpenAI Blog",
    url: "#"
  },
  {
    id: 2,
    title: "Google's Gemini Ultra 2.0 Achieves Human-Level Performance",
    description: "New benchmarks show Gemini Ultra 2.0 matching human experts across multiple domains including mathematics, coding, and scientific reasoning.",
    category: "Research",
    publishedDate: "2025-01-14",
    readTime: "7 min read",
    source: "Google AI",
    url: "#"
  },
  {
    id: 3,
    title: "Meta Announces Open Source LLaMA 3 with 405B Parameters",
    description: "The largest open-source language model to date, democratizing access to advanced AI capabilities for researchers and developers worldwide.",
    category: "Open Source",
    publishedDate: "2025-01-13",
    readTime: "6 min read",
    source: "Meta AI",
    url: "#"
  },
  {
    id: 4,
    title: "AI Safety Breakthrough: New Alignment Techniques Show Promise",
    description: "Researchers develop novel methods for ensuring AI systems remain aligned with human values and intentions at scale.",
    category: "AI Safety",
    publishedDate: "2025-01-12",
    readTime: "8 min read",
    source: "AI Safety Institute",
    url: "#"
  },
  {
    id: 5,
    title: "Autonomous AI Agents Transform Software Development",
    description: "New AI coding assistants can now handle complex software projects end-to-end, from planning to deployment.",
    category: "Development",
    publishedDate: "2025-01-11",
    readTime: "4 min read",
    source: "TechCrunch",
    url: "#"
  },
  {
    id: 6,
    title: "Quantum-AI Hybrid Systems Achieve Computational Supremacy",
    description: "Combining quantum computing with AI leads to exponential performance gains in optimization and machine learning tasks.",
    category: "Quantum AI",
    publishedDate: "2025-01-10",
    readTime: "9 min read",
    source: "Nature",
    url: "#"
  },
  {
    id: 7,
    title: "Microsoft Copilot Studio Revolutionizes Enterprise AI",
    description: "New low-code platform enables businesses to create custom AI assistants without extensive technical expertise.",
    category: "Enterprise",
    publishedDate: "2025-01-09",
    readTime: "6 min read",
    source: "Microsoft",
    url: "#"
  },
  {
    id: 8,
    title: "Anthropic's Claude 4 Sets New Standards for AI Ethics",
    description: "Latest model demonstrates unprecedented commitment to safety and ethical AI practices while maintaining high performance.",
    category: "AI Ethics",
    publishedDate: "2025-01-08",
    readTime: "7 min read",
    source: "Anthropic",
    url: "#"
  },
  {
    id: 9,
    title: "AI-Powered Drug Discovery Accelerates Medical Breakthroughs",
    description: "Machine learning algorithms identify potential treatments for rare diseases in record time, revolutionizing pharmaceutical research.",
    category: "Healthcare",
    publishedDate: "2025-01-07",
    readTime: "5 min read",
    source: "Nature Medicine",
    url: "#"
  },
  {
    id: 10,
    title: "Robotics and AI Convergence Creates Intelligent Automation",
    description: "Advanced robots powered by large language models demonstrate human-like reasoning and adaptability in real-world scenarios.",
    category: "Robotics",
    publishedDate: "2025-01-06",
    readTime: "8 min read",
    source: "IEEE Robotics",
    url: "#"
  }
]

const categories = ["All", "AI Models", "Research", "Open Source", "AI Safety", "Development", "Quantum AI", "Enterprise", "AI Ethics", "Healthcare", "Robotics"]

export default function LatestNewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredArticles = allNewsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <MainLayout>
      {/* Header */}
      <section className="py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Link>
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            📰 Latest AI News
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive coverage of the latest developments in artificial intelligence
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search news articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredArticles.length} of {allNewsArticles.length} articles
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      </section>

      {/* News Articles */}
      <section className="py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 border border-border bg-card flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground line-clamp-3 flex-1">
                  {article.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="mt-auto">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{article.readTime}</span>
                  <span>{article.source}</span>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                  asChild
                >
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read Article
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No articles found matching your criteria.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("All")
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Load More */}
      {filteredArticles.length > 0 && (
        <section className="py-8 text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </section>
      )}
    </MainLayout>
  )
}